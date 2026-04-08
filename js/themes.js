// ============================================================
// js/themes.js — sistema de temas: Classic e Neon
// ============================================================

const THEME_DEFS = {
  classic: { label: 'Classic', icon: '🌑' },
  neon:    { label: 'Neon',    icon: '✨' },
};

let _curTheme = 'classic';

function applyTheme(themeId, save = true) {
  if (!THEME_DEFS[themeId]) themeId = 'classic';
  _curTheme = themeId;
  document.documentElement.setAttribute('data-theme', themeId);

  // Atualiza meta theme-color do mobile
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', themeId === 'neon' ? '#050510' : '#0e0e0f');

  if (save) localStorage.setItem('theme', themeId);

  // Re-renderiza e atualiza ícones
  if (typeof _refreshNavIcons === 'function') _refreshNavIcons();
  if (typeof render === 'function') render();
  _updateThemeBtns();
}

function loadSavedTheme() {
  const saved = localStorage.getItem('theme') || 'classic';
  // Aplica sem salvar (já está salvo) e sem re-render (dados ainda carregando)
  _curTheme = saved;
  document.documentElement.setAttribute('data-theme', saved);
}

function _updateThemeBtns() {
  document.querySelectorAll('[data-theme-opt]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeOpt === _curTheme);
  });
}

function openThemeModal() {
  _updateThemeBtns();
  openModal('modalTheme');
}
