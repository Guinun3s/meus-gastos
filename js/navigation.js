// ============================================================
// js/navigation.js — navegação entre abas, páginas e meses
// ============================================================

function switchTab(name, btn) {
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('panel-' + name).classList.add('active');
  if (name === 'graficos')       { renderCharts(); renderDowChart(); }
  if (name === 'historico')      renderHistoryPanel();
  if (name === 'metas')          renderGoals();
  if (name === 'compromissos')   renderCommitments();
  if (name === 'cartoes')        renderCards();
}

function switchMobilePage(name, btn) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const extras = document.getElementById('mHomeExtras');
  const fab    = document.querySelector('.fab');

  if (name === 'home') {
    extras.style.display = '';
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    if (fab) { fab.style.display = ''; fab.textContent = '+'; fab.onclick = openAddSheet; }
  } else {
    extras.style.display = 'none';
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + name).classList.add('active');
    if (name === 'graficos')     { renderCharts(); renderDowChart(); }
    if (name === 'historico')    renderHistoryPanel();
    if (name === 'metas')        renderGoals();
    if (name === 'compromissos') renderCommitments();
    if (name === 'cartoes')      renderCards();
    // FAB removido — o botão + agora está integrado na nav
  }
}

function _refreshNavIcons() {
  const isNeon = isNeonTheme();
  document.querySelectorAll('.nav-svg[data-nav]').forEach(el => {
    const key = el.dataset.nav;
    if (isNeon && NAV_ICONS[key]) {
      el.innerHTML = NAV_ICONS[key];
    } else {
      // Restore text icons
      const fallbacks = {
        home:'⌂', lancamentos:'≡', receitas:'↑', graficos:'◎',
        historico:'⏱', orcamento:'◈', metas:'★', compromissos:'⊟', cartoes:'💳', menu:'☰'
      };
      el.textContent = fallbacks[key] || '';
    }
  });
}

function changeMonth(delta) {
  curMonth += delta;
  if (curMonth > 11) { curMonth = 0; curYear++; }
  if (curMonth < 0)  { curMonth = 11; curYear--; }
  render();
}

// Navega para aba Gastos e marca o botão correto na nav
function _navToGastos() {
  const btn = document.querySelector('#bottomNav .nav-btn:nth-child(2)');
  switchMobilePage('lancamentos', btn || document.querySelector('.nav-btn'));
}
