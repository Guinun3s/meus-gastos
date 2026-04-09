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
  _curTheme = saved;
  document.documentElement.setAttribute('data-theme', saved);
  // Atualiza ícones da nav e botões do modal sem re-renderizar dados
  if (typeof _refreshNavIcons === 'function') _refreshNavIcons();
  _updateThemeBtns();
  // Atualiza meta theme-color
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', saved === 'neon' ? '#06060f' : '#0e0e0f');
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
