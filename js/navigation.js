// ============================================================
// js/navigation.js — navegação entre abas e páginas mobile
// ============================================================

// ── Mês / Ano ─────────────────────────────────────────────────
function changeMonth(delta) {
  curMonth += delta;
  if (curMonth > 11) { curMonth = 0;  curYear++; }
  if (curMonth < 0)  { curMonth = 11; curYear--; }
  render();
}

// ── Aba desktop ───────────────────────────────────────────────
function switchTab(name, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

  // alias para compatibilidade
  const panelName = (name === 'lancamentos') ? 'extrato' : name;
  const panel = document.getElementById('panel-' + panelName);
  if (panel) panel.classList.add('active');
  if (btn)   btn.classList.add('active');

  if (panelName === 'extrato')       renderExtrato();
  else if (name === 'receitas')      renderIncomes();
  else if (panelName === 'investimentos') renderInvestimentos();
  else if (panelName === 'graficos') renderCharts();
  else if (panelName === 'historico')renderHistoryPanel();
  else if (panelName === 'orcamento')renderBudget();
  else if (panelName === 'metas')    renderGoals();
  else if (panelName === 'compromissos') renderCommitments();
  else if (panelName === 'cartoes')  renderCards();
}

// ── Página mobile ──────────────────────────────────────────────
function switchMobilePage(name, btn) {
  // Normaliza alias
  if (name === 'extrato') name = 'lancamentos';

  const mainContent  = document.getElementById('mHomeExtras');
  const contentArea  = document.querySelector('.content');
  const mobilePages  = document.querySelectorAll('.m-page');

  // Remove active de todos os botões da nav
  document.querySelectorAll('#bottomNav .nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (name === 'home') {
    // Mostra home
    mainContent && (mainContent.style.display = '');
    document.querySelectorAll('.m-page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.cards').forEach(c => c.style.display = '');
    const mHero = document.querySelector('.m-hero-saldo');
    if (mHero) mHero.style.display = '';
    render();
    return;
  }

  // Para as outras páginas, mostra o content area e o panel correto
  mainContent && (mainContent.style.display = 'none');
  const mHero = document.querySelector('.m-hero-saldo');
  if (mHero) mHero.style.display = 'none';
  document.querySelectorAll('.cards').forEach(c => c.style.display = 'none');

  // Encontra o panel correspondente
  const panelMap = {
    lancamentos:   'extrato',
    receitas:      'extrato',
    graficos:      'graficos',
    historico:     'historico',
    orcamento:     'orcamento',
    metas:         'metas',
    compromissos:  'compromissos',
    cartoes:       'cartoes',
    investimentos: 'investimentos',
  };

  const panelName = panelMap[name] || name;
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('panel-' + panelName);
  if (panel) panel.classList.add('active');

  // Renderiza conteúdo correto
  if (panelName === 'extrato')       renderExtrato();
  else if (panelName === 'investimentos') renderInvestimentos();
  else if (panelName === 'graficos') renderCharts();
  else if (panelName === 'historico')renderHistoryPanel();
  else if (panelName === 'orcamento')renderBudget();
  else if (panelName === 'metas')    renderGoals();
  else if (panelName === 'compromissos') renderCommitments();
  else if (panelName === 'cartoes')  renderCards();
}

// ── Atualiza ícones SVG da nav mobile ────────────────────────
function _refreshNavIcons() {
  const isNeon = isNeonTheme();
  document.querySelectorAll('.nav-svg[data-nav]').forEach(el => {
    const key = el.dataset.nav;
    if (isNeon && typeof NAV_ICONS !== 'undefined' && NAV_ICONS[key]) {
      el.innerHTML = NAV_ICONS[key];
    } else if (typeof NAV_ICONS_CLASSIC !== 'undefined' && NAV_ICONS_CLASSIC[key]) {
      el.innerHTML = NAV_ICONS_CLASSIC[key]();
    }
  });
}

// ── Navegar para aba Gastos (extrato) ────────────────────────
function _navToGastos() {
  const btn = document.querySelector('#bottomNav .nav-btn:nth-child(2)');
  if (btn) btn.click();
  else switchMobilePage('lancamentos', document.querySelector('.nav-btn'));
}
