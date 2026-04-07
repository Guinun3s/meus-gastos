// ============================================================
// js/auth.js — autenticação com Firebase Auth
// ============================================================

// ── Modo do formulário (login / register) ────────────────────
function setAuthMode(mode) {
  _authMode = mode;
  document.getElementById('tabEntrar').classList.toggle('active', mode === 'login');
  document.getElementById('tabCriar').classList.toggle('active',  mode === 'register');
  document.getElementById('nameField').style.display    = mode === 'register' ? 'block' : 'none';
  document.getElementById('confirmField').style.display = mode === 'register' ? 'block' : 'none';
  document.getElementById('forgotBtn').style.display    = mode === 'login'    ? 'block' : 'none';
  document.getElementById('btnAuthEmail').textContent   = mode === 'login'    ? 'Entrar' : 'Criar conta';
  clearAuthErr();
}

function showAuthErr(msg) {
  const el = document.getElementById('authErr');
  el.textContent = msg;
  el.classList.add('show');
}
function clearAuthErr() {
  document.getElementById('authErr').classList.remove('show');
}

function setAuthLoading(loading) {
  const btn = document.getElementById('btnAuthEmail');
  btn.disabled  = loading;
  btn.innerHTML = loading
    ? '<div class="spinner"></div>Aguarde...'
    : (_authMode === 'login' ? 'Entrar' : 'Criar conta');
}

// ── Login / cadastro com e-mail e senha ──────────────────────
async function handleEmailAuth() {
  clearAuthErr();
  const email = document.getElementById('authEmail').value.trim();
  const pass  = document.getElementById('authPass').value;
  if (!email || !pass) { showAuthErr('Preencha e-mail e senha.'); return; }

  if (_authMode === 'register') {
    const name    = document.getElementById('authName').value.trim();
    const confirm = document.getElementById('authPassConfirm').value;
    if (!name)          { showAuthErr('Digite seu nome.'); return; }
    if (pass !== confirm){ showAuthErr('As senhas não coincidem.'); return; }
    if (pass.length < 6) { showAuthErr('A senha deve ter pelo menos 6 caracteres.'); return; }
    setAuthLoading(true);
    try {
      const cred = await _auth.createUserWithEmailAndPassword(email, pass);
      await cred.user.updateProfile({ displayName: name });
    } catch (e) { setAuthLoading(false); showAuthErr(translateAuthError(e.code)); }
  } else {
    setAuthLoading(true);
    try {
      await _auth.signInWithEmailAndPassword(email, pass);
    } catch (e) { setAuthLoading(false); showAuthErr(translateAuthError(e.code)); }
  }
}

// ── Login com Google ─────────────────────────────────────────
async function handleGoogle() {
  clearAuthErr();
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await _auth.signInWithPopup(provider);
  } catch (e) {
    if (e.code !== 'auth/popup-closed-by-user') showAuthErr(translateAuthError(e.code));
  }
}

// ── Recuperação de senha ─────────────────────────────────────
async function handleForgotPassword() {
  const email = document.getElementById('authEmail').value.trim();
  if (!email) { showAuthErr('Digite seu e-mail acima primeiro.'); return; }
  try {
    await _auth.sendPasswordResetEmail(email);
    clearAuthErr();
    toast('✓ E-mail de recuperação enviado!');
  } catch (e) { showAuthErr(translateAuthError(e.code)); }
}

// ── Logout ───────────────────────────────────────────────────
async function handleSignOut() {
  document.querySelectorAll('.modal-bg, .sheet-bg').forEach(el => el.classList.remove('open'));
  if (_unsubscribe) _unsubscribe();
  _cache = { expenses: {}, incomes: {}, budgets: {}, goals: [] };
  await _auth.signOut();
}

// ── Tradução de erros ────────────────────────────────────────
function translateAuthError(code) {
  const map = {
    'auth/email-already-in-use':  'Este e-mail já está cadastrado.',
    'auth/invalid-email':          'E-mail inválido.',
    'auth/user-not-found':         'Nenhuma conta encontrada com este e-mail.',
    'auth/wrong-password':         'Senha incorreta.',
    'auth/weak-password':          'A senha deve ter pelo menos 6 caracteres.',
    'auth/too-many-requests':      'Muitas tentativas. Tente novamente em alguns minutos.',
    'auth/network-request-failed': 'Sem conexão com a internet.',
    'auth/invalid-credential':     'E-mail ou senha incorretos.',
  };
  return map[code] || 'Erro ao autenticar. Tente novamente.';
}

// ── Controle de telas ────────────────────────────────────────
function showScreen(name) {
  document.getElementById('loadingScreen').style.display = 'none';
  document.getElementById('authScreen').style.display    = name === 'auth' ? 'flex' : 'none';
  document.getElementById('appScreen').style.display     = name === 'app'  ? 'flex' : 'none';
}

// ── Atualiza UI com dados do usuário logado ──────────────────
function updateUserUI(user) {
  const initial = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
  const name    = user.displayName || 'Usuário';
  const email   = user.email || '';
  const photo   = user.photoURL;

  function setAvatar(el) {
    if (!el) return;
    if (photo) {
      const img = document.createElement('img');
      img.src = photo; img.alt = name;
      el.innerHTML = '';
      el.appendChild(img);
    } else {
      el.textContent = initial;
    }
  }

  setAvatar(document.getElementById('topAvatar'));
  setAvatar(document.getElementById('modalAvatar'));
  setAvatar(document.getElementById('mMenuAvatar'));

  if (document.getElementById('topEmail'))      document.getElementById('topEmail').textContent      = name;
  if (document.getElementById('modalUserName')) document.getElementById('modalUserName').textContent = name;
  if (document.getElementById('modalUserEmail'))document.getElementById('modalUserEmail').textContent= email;
  if (document.getElementById('mMenuName'))     document.getElementById('mMenuName').textContent     = name;
  if (document.getElementById('mMenuEmail'))    document.getElementById('mMenuEmail').textContent    = email;
}

function syncBothBalanceInputs() {
  // Saldo agora vem das receitas lançadas — não há mais campo de saldo manual
}

// ── Inicializa Firebase e escuta mudanças de autenticação ────
function initFirebase() {
  if (!window.FIREBASE_CONFIG || window.FIREBASE_CONFIG.apiKey === 'SUA_API_KEY') {
    console.error('Firebase não configurado. Edite firebase-config.js');
    showScreen('auth');
    return;
  }
  if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
  _auth = firebase.auth();
  _db   = firebase.firestore();
  _db.enablePersistence({ synchronizeTabs: true }).catch(() => {});

  _auth.onAuthStateChanged(async user => {
    if (user) {
      _user = user;
      updateUserUI(user);
      await loadUserData();
      fillCatSelects();
      ['dataGasto', 'mDataGasto', 'editData'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = today();
      });
      syncBothBalanceInputs();
      render();
      showScreen('app');
    } else {
      _user = null;
      showScreen('auth');
      setAuthLoading(false);
    }
  });
}
