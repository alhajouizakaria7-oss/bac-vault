// Clé Enseignant
const TEACHER_MASTER_PIN = "7788";

// Base locale
let studentsDb = JSON.parse(localStorage.getItem('bacvault_students')) || [];
let pendingStudent = null;

// Contenu Riche des Fiches avec Notation LaTeX Réelle
const DOCS_CONTENT = {
  tvi: `
    <div class="step-item">
      <div class="step-title">1. Énoncé du Théorème des Valeurs Intermédiaires (TVI) :</div>
      <p>Soit $f$ une fonction continue et strictement monotone sur un intervalle $[a, b]$. Si la condition suivante est vérifiée :</p>
      <div class="math-formula-box">$$f(a) \\times f(b) < 0$$</div>
      <p>Alors l'équation $f(x) = 0$ admet une <strong>solution unique</strong> $\\alpha \\in ]a, b[$.</p>
    </div>
    
    <div class="step-item">
      <div class="step-title">2. Rédaction type exigée au barème du National :</div>
      <p>• La fonction $f$ est <em>continue</em> sur $[a, b]$ (comme somme/produit de fonctions usuelles).</p>
      <p>• La fonction $f$ est <em>strictement croissante (ou décroissante)</em> sur $[a, b]$.</p>
      <p>• On a $f(a) \\cdot f(b) < 0$ (soit $0 \\in f([a, b]) = [f(a), f(b)]$).</p>
      <p><strong>Conclusion :</strong> Il existe un unique réel $\\alpha \\in ]a, b[$ tel que $f(\\alpha) = 0$.</p>
    </div>
  `,
  ondes: `
    <div class="step-item">
      <div class="step-title">1. Phénomène de Diffraction :</div>
      <p>L'écart angulaire $\\theta$ lors du passage d'une onde lumineuse monochromatique à travers une fente de largeur $a$ est donné par :</p>
      <div class="math-formula-box">$$\\theta = \\frac{\\lambda}{a} = \\frac{L}{2D}$$</div>
      <p>Avec $\\theta$ en radians ($\\text{rad}$), la longueur d'onde $\\lambda$ et la largeur $a$ en mètres ($\\text{m}$), la largeur de la tache centrale $L$ et la distance écran $D$ en mètres.</p>
    </div>

    <div class="step-item">
      <div class="step-title">2. Décroissance Radioactive & Activité :</div>
      <p>La loi de décroissance du nombre de noyaux non désintégrés à l'instant $t$ :</p>
      <div class="math-formula-box">$$N(t) = N_0 \\cdot e^{-\\lambda t}$$</div>
      <p>Relation entre constante radioactive $\\lambda$ et demi-vie $t_{1/2}$ :</p>
      <div class="math-formula-box">$$\\lambda = \\frac{\\ln(2)}{t_{1/2}} \\quad \\text{et} \\quad a(t) = -\\frac{dN(t)}{dt} = \\lambda \\cdot N(t)$$</div>
    </div>
  `,
  cinetique: `
    <div class="step-item">
      <div class="step-title">1. Vitesse Volumique de Réaction :</div>
      <p>Pour un système réactionnel de volume total $V_S$, la vitesse volumique $v(t)$ à l'instant $t$ est définie par :</p>
      <div class="math-formula-box">$$v(t) = \\frac{1}{V_S} \\cdot \\frac{dx}{dt}$$</div>
      <p>• $\\frac{dx}{dt}$ représente le coefficient directeur de la tangente à la courbe de l'avancement $x(t)$ à l'instant $t$ :</p>
      <div class="math-formula-box">$$\\frac{dx}{dt} = \\frac{\\Delta x}{\\Delta t} = \\frac{x_B - x_A}{t_B - t_A}$$</div>
    </div>

    <div class="step-item">
      <div class="step-title">2. Temps de demi-réaction $t_{1/2}$ :</div>
      <p>C'est la durée au bout de laquelle l'avancement atteint la moitié de sa valeur finale :</p>
      <div class="math-formula-box">$$x(t_{1/2}) = \\frac{x_{\\text{max}}}{2}$$</div>
    </div>
  `
};

// DOM Auth
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

// Profil
const appUserBadge = document.getElementById('app-user-badge');
const appUserAvatar = document.getElementById('app-user-avatar');
const appUserName = document.getElementById('app-user-name');
const appUserDetail = document.getElementById('app-user-detail');
const studentNav = document.getElementById('student-nav');
const teacherNav = document.getElementById('teacher-nav');
const btnLogout = document.getElementById('btn-logout');

// Rôles
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

// Étape 1 Élève
studentStep1Form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('stu-name').value.trim();
  const school = document.getElementById('stu-school').value.trim();
  const email = document.getElementById('stu-email').value.trim().toLowerCase();
  const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();

  pendingStudent = { name, school, email, pin: generatedPin };
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

// Étape 2 Élève
studentStep2Form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (otpInput.value.trim() === pendingStudent.pin) {
    const existingIndex = studentsDb.findIndex(s => s.email === pendingStudent.email);
    if (existingIndex >= 0) studentsDb[existingIndex] = pendingStudent;
    else studentsDb.push(pendingStudent);
    
    localStorage.setItem('bacvault_students', JSON.stringify(studentsDb));

    sessionStorage.setItem('current_user', JSON.stringify({
      role: 'STUDENT',
      name: pendingStudent.name,
      school: pendingStudent.school,
      email: pendingStudent.email
    }));
    launchApp();
  } else {
    authAlert.textContent = 'Code PIN incorrect.';
  }
});

// Prof
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

function launchApp() {
  const sessionData = JSON.parse(sessionStorage.getItem('current_user'));
  if (!sessionData) return;

  authModal.classList.add('hidden');
  appContainer.classList.remove('hidden');

  appUserName.textContent = sessionData.name;
  appUserDetail.textContent = sessionData.school;
  appUserAvatar.textContent = sessionData.name.charAt(0).toUpperCase();

  if (sessionData.role === 'TEACHER') {
    appUserBadge.textContent = 'Professeur';
    studentNav.classList.add('hidden');
    teacherNav.classList.remove('hidden');
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

  // Rendu des formules initiales
  renderMathInDoc();
}

btnLogout.addEventListener('click', () => {
  sessionStorage.removeItem('current_user');
  location.reload();
});

// Navigation
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
  });
});

// Modal de Fiche avec KaTeX
const docModal = document.getElementById('doc-modal');
const docModalTitle = document.getElementById('doc-modal-title');
const docModalBody = document.getElementById('doc-modal-body');
const docModalClose = document.getElementById('doc-modal-close');

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-open-doc')) {
    const title = e.target.getAttribute('data-title');
    const type = e.target.getAttribute('data-type');

    docModalTitle.textContent = title;
    docModalBody.innerHTML = DOCS_CONTENT[type] || '<p>Contenu en cours de rédaction.</p>';
    docModal.classList.remove('hidden');

    // Rendu automatique de toutes les équations KaTeX dans la modale
    if (window.renderMathInElement) {
      renderMathInElement(docModalBody, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false}
        ]
      });
    }
  }
});

docModalClose.addEventListener('click', () => docModal.classList.add('hidden'));

function renderMathInDoc() {
  if (window.renderMathInElement) {
    renderMathInElement(document.body, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false}
      ]
    });
  }
}

function updateTeacherStats() {
  document.getElementById('stat-students-count').textContent = studentsDb.length;
  const tbody = document.getElementById('teacher-students-tbody');
  tbody.innerHTML = '';
  studentsDb.forEach(stu => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="padding:14px;"><strong>${stu.name}</strong></td>
      <td style="padding:14px;">${stu.school}</td>
      <td style="padding:14px;">${stu.email}</td>
      <td style="padding:14px;"><code>${stu.pin}</code></td>
    `;
    tbody.appendChild(row);
  });
}

// Solver Chat
const studentSolverForm = document.getElementById('student-solver-form');
const chatInput = document.getElementById('chat-input');
const studentChatHistory = document.getElementById('student-chat-history');

if (studentSolverForm) {
  studentSolverForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = chatInput.value.trim();
    if (!q) return;

    const u = document.createElement('div');
    u.style.cssText = "background:linear-gradient(135deg, var(--accent-cyan), var(--accent-blue)); color:#06080e; font-weight:600; padding:10px 14px; border-radius:10px; align-self:flex-end;";
    u.textContent = q;
    studentChatHistory.appendChild(u);
    chatInput.value = '';

    setTimeout(() => {
      const a = document.createElement('div');
      a.style.cssText = "background:rgba(255,255,255,0.05); border-left:4px solid var(--accent-cyan); padding:12px 14px; border-radius:10px; font-size:0.9rem;";
      a.innerHTML = `<strong>Méthode Recommandée :</strong><br>1. Poser le domaine d'étude $D_f$.<br>2. Appliquer le théorème avec justification stricte.<br>3. Contrôler les bornes et unités.`;
      studentChatHistory.appendChild(a);
      studentChatHistory.scrollTop = studentChatHistory.scrollHeight;
      renderMathInDoc();
    }, 400);
  });
}

// Vérifier session active
if (sessionStorage.getItem('current_user')) {
  launchApp();
}
