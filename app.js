// Navigation par onglets
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

navButtons.forEach(button => {
  button.addEventListener('click', () => {
    navButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(tab => tab.classList.remove('active'));

    button.classList.add('active');
    const target = button.getAttribute('data-tab');
    document.getElementById(target).classList.add('active');
  });
});

// Chat & Assistant de Résolution
const solverForm = document.getElementById('solver-form');
const userQuestion = document.getElementById('user-question');
const subjectSelect = document.getElementById('subject-select');
const chatHistory = document.getElementById('chat-history');

solverForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = userQuestion.value.trim();
  const subject = subjectSelect.value;
  if (!query) return;

  // Afficher message utilisateur
  const userDiv = document.createElement('div');
  userDiv.className = 'chat-msg user-msg';
  userDiv.innerHTML = `<strong>Moi (${subject}) :</strong> ${query}`;
  chatHistory.appendChild(userDiv);

  userQuestion.value = '';
  chatHistory.scrollTop = chatHistory.scrollHeight;

  // Réponse simulée du guide
  setTimeout(() => {
    const aiDiv = document.createElement('div');
    aiDiv.className = 'chat-msg ai-msg';
    aiDiv.innerHTML = `
      <strong>Guide Vault (${subject}) :</strong><br>
      Bien reçu ! Pour aborder cette question :<br>
      1. Vérifie d'abord les hypothèses de départ (continuité, dérivation ou équation de réaction).<br>
      2. Applique le théorème ou la loi correspondante sans sauter d'étapes de justification.<br>
      3. Soigne la conclusion et les unités (évite les pièges classiques du barème national).
    `;
    chatHistory.appendChild(aiDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }, 600);
});
