// Clé Maître Enseignant
const TEACHER_MASTER_PIN = "7788";

// Base de Données Locale (Persistance via LocalStorage)
let studentsDb = JSON.parse(localStorage.getItem('bacvault_students')) || [];
let customDocsDb = JSON.parse(localStorage.getItem('bacvault_custom_docs')) || [];
let solverQuestionsDb = JSON.parse(localStorage.getItem('bacvault_solver_questions')) || [
  { subject: 'Maths', query: "Comment montrer que la suite récurrente u(n+1)=f(u(n)) converge vers le point fixe ?" }
];

let pendingStudent = null;

// Éléments DOM Auth
const authModal = document.getElementById('auth-modal');
const appContainer = document.getElementById('app-container');
const btnRoleStudent = document.getElementById('btn-role-student');
const btnRoleTeacher = document.getElementById('btn-role-teacher');

const studentStep1Form = document.getElementById('student-step1-form');
const studentStep2Form = document.getElementById('student-step2-form');
const teacherForm = document.getElementById('teacher-form');

const authAlert = document.getElementById('auth-alert');
const displayTargetEmail = document.getElementById('display-target-email');
const simulatedPinVal = document.getElementById('simulated-pin-val');
const otpInput = document.getElementById('otp-input');
const btnBackStep1 = document.getElementById('btn-back-step1');

// Profil App
const appUserBadge = document.getElementById('app-user-badge');
const appUserAvatar = document.getElementById('app-user-avatar');
const appUserName = document.getElementById('app-user-name');
const appUserDetail = document.getElementById('app-user-detail');
const studentNav = document.getElementById('student-nav');
const teacherNav = document.getElementById('teacher-nav');
const btnLogout = document.getElementById('btn-logout');

// 1. Basculement Rôles Auth
btnRoleStudent.addEventListener('click', () => {
  btnRoleStudent.classList.add('active');
  btnRoleTeacher.classList.remove('active');
  studentStep1Form.classList.add('active');
  studentStep2Form.classList.remove('active');
  teacherForm.classList.remove('active');
  authAlert.textContent = '';
});

btnRoleTeacher.addEventListener('click', () => {
  btnRoleTeacher.classList.add('active');
  btnRoleStudent.classList.remove('active');
  teacherForm.classList.add('active');
  studentStep1Form.classList.remove('active');
  studentStep2Form.classList.remove('active');
  authAlert.textContent = '';
});

// 2. Étape 1 Élève : Génération du PIN OTP
studentStep1Form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('stu-name').value.trim();
  const school = document.getElementById('stu-school').value.trim();
  const email = document.getElementById('stu-email').value.trim().toLowerCase();

  // Génération de 4 chiffres aléatoires
  const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();

  pendingStudent = { name, school, email, pin: generatedPin };

  // Passage à l'étape 2 (Code PIN)
  displayTargetEmail.textContent = email;
  simulatedPinVal.textContent = generatedPin;

  studentStep1Form.classList.remove('active');
  studentStep2Form.classList.add('active');
  otpInput.value = '';
  otpInput.focus();
});

btnBackStep1.addEventListener('click', () => {
  studentStep2Form.classList.remove('active');
  studentStep1Form.classList.add('active');
});

// 3. Étape 2 Élève : Validation OTP
studentStep2Form.addEventListener('submit', (e) => {
  e.preventDefault();
  const enteredPin = otpInput.value.trim();

  if (enteredPin === pendingStudent.pin) {
    // Sauvegarder dans la DB locale
    const existingIndex = studentsDb.findIndex(s => s.email === pendingStudent.email);
    if (existingIndex >= 0) {
      studentsDb[existingIndex] = pendingStudent;
    } else {
      studentsDb.push(pendingStudent);
    }
    localStorage.setItem('bacvault_students', JSON.stringify(studentsDb));

    // Session Active Élève
    sessionStorage.setItem('current_user', JSON.stringify({
      role: 'STUDENT',
      name: pendingStudent.name,
      school: pendingStudent.school,
      email: pendingStudent.email
    }));

    launchApp();
  } else {
    authAlert.textContent = 'Code PIN incorrect. Veuillez réessayer.';
  }
});

// 4. Authentification Enseignant
teacherForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('tea-name').value.trim();
  const email = document.getElementById('tea-email').value.trim();
  const passkey = document.getElementById('tea-passkey').value.trim();

  if (passkey === TEACHER_MASTER_PIN) {
    sessionStorage.setItem('current_user', JSON.stringify({
      role: 'TEACHER',
      name: name,
      school: 'Direction Pédagogique',
      email: email
    }));
    launchApp();
  } else {
    authAlert.textContent = 'Clé Maître Enseignant incorrecte.';
  }
});

// 5. Lancement de l'Application
function launchApp() {
  const sessionData = JSON.parse(sessionStorage.getItem('current_user'));
  if (!sessionData) return;

  authModal.classList.add('hidden');
  appContainer.classList.remove('hidden');

  appUserName.textContent = sessionData.name;
  appUserDetail.textContent = sessionData.school;
  appUserAvatar.textContent = sessionData.name.charAt(0).toUpperCase();

  if (sessionData.role === 'TEACHER') {
    appUserBadge.textContent = 'Professeur / Admin';
    appUserBadge.style.background = 'rgba(16, 185, 129, 0.15)';
    appUserBadge.style.color = '#10b981';
    appUserBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';

    studentNav.classList.add('hidden');
    teacherNav.classList.remove('hidden');

    // Activer l'onglet Enseignant
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.getElementById('tab-teacher-overview').classList.add('active');
    updateTeacherStats();
  } else {
    appUserBadge.textContent = 'Élève Certifié';
    studentNav.classList.remove('hidden');
    teacherNav.classList.add('hidden');

    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.getElementById('tab-vault').classList.add('active');
  }

  renderCustomDocs();
}

// 6. Déconnexion
btnLogout.addEventListener('click', () => {
  sessionStorage.removeItem('current_user');
  location.reload();
});

// 7. Navigation par Onglets
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    const targetId = btn.getAttribute('data-tab');
    document.getElementById(targetId).classList.add('active');
  });
});

// 8. Modal Lecteur de Fiche
const docModal = document.getElementById('doc-modal');
const docModalTitle = document.getElementById('doc-modal-title');
const docModalBody = document.getElementById('doc-modal-body');
const docModalClose = document.getElementById('doc-modal-close');

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-open-doc')) {
    const title = e.target.getAttribute('data-title');
    const content = e.target.getAttribute('data-content');

    docModalTitle.textContent = title;
    docModalBody.innerHTML = content;
    docModal.classList.remove('hidden');
  }
});

docModalClose.addEventListener('click', () => {
  docModal.classList.add('hidden');
});

// 9. Filtrage des fiches
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');
    document.querySelectorAll('#student-vault-grid .doc-card').forEach(card => {
      if (filter === 'all' || card.getAttribute('data-subject') === filter) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// 10. Publication Enseignant
const teacherPublishForm = document.getElementById('teacher-publish-form');
if (teacherPublishForm) {
  teacherPublishForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const subject = document.getElementById('pub-subject').value;
    const title = document.getElementById('pub-title').value.trim();
    const desc = document.getElementById('pub-desc').value.trim();
    const content = document.getElementById('pub-content').value.trim();
    const sessionData = JSON.parse(sessionStorage.getItem('current_user'));

    const newDoc = {
      subject,
      title,
      desc,
      content,
      author: sessionData ? sessionData.name : 'Pr. BacVault'
    };

    customDocsDb.unshift(newDoc);
    localStorage.setItem('bacvault_custom_docs', JSON.stringify(customDocsDb));

    teacherPublishForm.reset();
    alert('Fiche publiée avec succès pour tous les élèves !');
    updateTeacherStats();
    renderCustomDocs();
  });
}

function renderCustomDocs() {
  const grid = document.getElementById('student-vault-grid');
  // Supprimer les anciens custom docs ajoutés dynamiquement
  document.querySelectorAll('.custom-doc-card').forEach(c => c.remove());

  customDocsDb.forEach(doc => {
    const badgeClass = doc.subject === 'Maths' ? 'badge-math' : doc.subject === 'Physique' ? 'badge-phys' : 'badge-chem';
    const card = document.createElement('div');
    card.className = 'doc-card custom-doc-card';
    card.setAttribute('data-subject', doc.subject);
    card.innerHTML = `
      <div class="doc-badge ${badgeClass}">${doc.subject}</div>
      <h3>${doc.title}</h3>
      <p>${doc.desc}</p>
      <div class="doc-footer">
        <span class="author">Par : ${doc.author}</span>
        <button class="btn-open-doc" data-title="${doc.title}" data-content="<p>${doc.content.replace(/\n/g, '<br>')}</p>">Lire la fiche</button>
      </div>
    `;
    grid.prepend(card);
  });
}

// 11. Mise à jour Stats & Tables Enseignant
function updateTeacherStats() {
  const statStudents = document.getElementById('stat-students-count');
  const statDocs = document.getElementById('stat-docs-count');
  const statQuestions = document.getElementById('stat-questions-count');
  const studentsTbody = document.getElementById('teacher-students-tbody');
  const modRecentList = document.getElementById('teacher-mod-list');

  statStudents.textContent = studentsDb.length;
  statDocs.textContent = 3 + customDocsDb.length;
  statQuestions.textContent = solverQuestionsDb.length;

  studentsTbody.innerHTML = '';
  if (studentsDb.length === 0) {
    studentsTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#64748b;">Aucun élève enregistré pour le moment.</td></tr>`;
  } else {
    studentsDb.forEach(stu => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${stu.name}</strong></td>
        <td>${stu.school}</td>
        <td>${stu.email}</td>
        <td><code>${stu.pin}</code></td>
        <td><span style="color:#10b981;">● Actif</span></td>
      `;
      studentsTbody.appendChild(row);
    });
  }
}

// 12. Chat Solver Élève
const studentSolverForm = document.getElementById('student-solver-form');
const chatInput = document.getElementById('chat-input');
const chatSubject = document.getElementById('chat-subject');
const studentChatHistory = document.getElementById('student-chat-history');

if (studentSolverForm) {
  studentSolverForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = chatInput.value.trim();
    const subj = chatSubject.value;
    if (!query) return;

    // Bulle Utilisateur
    const userBubble = document.createElement('div');
    userBubble.className = 'bubble bubble-user';
    userBubble.innerHTML = `<strong>Moi (${subj}) :</strong> ${query}`;
    studentChatHistory.appendChild(userBubble);

    // Enregistrer pour l'espace Prof
    solverQuestionsDb.push({ subject: subj, query: query });
    localStorage.setItem('bacvault_solver_questions', JSON.stringify(solverQuestionsDb));

    chatInput.value = '';
    studentChatHistory.scrollTop = studentChatHistory.scrollHeight;

    // Réponse Automatique Intelligente
    setTimeout(() => {
      const aiBubble = document.createElement('div');
      aiBubble.className = 'bubble bubble-ai';
      aiBubble.innerHTML = `
        <strong>Méthode Guidée (${subj}) :</strong><br>
        1. <em>Hypothèses :</em> Vérifie et pose explicitement les conditions du domaine d'étude.<br>
        2. <em>Théorème / Loi :</em> Cite précisément la formule ou le théorème sans omettre la rédaction type attendue au barème.<br>
        3. <em>Vérification :</em> Contrôle la cohérence des bornes et des unités de mesure.
      `;
      studentChatHistory.appendChild(aiBubble);
      studentChatHistory.scrollTop = studentChatHistory.scrollHeight;
    }, 450);
  });
}

// Vérifier si une session est déjà active
if (sessionStorage.getItem('current_user')) {
  launchApp();
}
