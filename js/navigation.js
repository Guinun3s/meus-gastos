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

  if (name === 'home') {
    extras.style.display = '';
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  } else {
    extras.style.display = 'none';
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + name).classList.add('active');
    if (name === 'graficos')  renderCharts();
    if (name === 'historico') renderHistoryPanel();
  if (name === 'metas')     renderGoals();
  }
}

// ── Navegação de mês ─────────────────────────────────────────
function changeMonth(delta) {
  curMonth += delta;
  if (curMonth > 11) { curMonth = 0; curYear++; }
  if (curMonth < 0)  { curMonth = 11; curYear--; }
  syncBothBalanceInputs();
  render();
}

// ── Salvar saldo ─────────────────────────────────────────────
function saveBalance(v) {
  saveBal(parseFloat(v) || 0);
  ['balanceInput', 'balanceInputM'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el !== document.activeElement) el.value = v;
  });
  renderSummary();
  renderSidebar();
}
