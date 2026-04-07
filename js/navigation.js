// ============================================================
// js/navigation.js — navegação entre abas, páginas e meses
// ============================================================

// ── Desktop: troca de abas ───────────────────────────────────
function switchTab(name, btn) {
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('panel-' + name).classList.add('active');
  if (name === 'graficos')  renderCharts();
  if (name === 'historico') renderHistoryPanel();
  if (name === 'metas')     renderGoals();
}

// ── Mobile: troca de página via nav inferior ─────────────────
function switchMobilePage(name, btn) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const extras = document.getElementById('mHomeExtras');
  const fab    = document.querySelector('.fab');

  if (name === 'home') {
    extras.style.display = '';
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    if (fab) { fab.textContent = '+'; fab.onclick = openAddSheet; }
  } else {
    extras.style.display = 'none';
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + name).classList.add('active');
    if (name === 'graficos')  renderCharts();
    if (name === 'historico') renderHistoryPanel();
    if (name === 'metas')     renderGoals();
    // FAB contextual: receitas abre sheet de receita
    if (fab) {
      fab.textContent = '+';
      fab.onclick = name === 'receitas' ? openAddIncomeSheet : openAddSheet;
    }
  }
}

// ── Navegação de mês ─────────────────────────────────────────
function changeMonth(delta) {
  curMonth += delta;
  if (curMonth > 11) { curMonth = 0; curYear++; }
  if (curMonth < 0)  { curMonth = 11; curYear--; }
  render();
}
