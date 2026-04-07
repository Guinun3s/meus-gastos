// ============================================================
// js/budget.js — painel de orçamento por categoria
// ============================================================

function renderBudget() {
  const budgets = loadBud();
  const ct      = catTotals();

  document.getElementById('budgetGrid').innerHTML = CATS.map(c => {
    const b    = parseFloat(budgets[c.id]) || 0;
    const s    = ct[c.id] || 0;
    const pct  = b > 0 ? Math.min(100, Math.round(s / b * 100)) : 0;
    const over = b > 0 && s > b;
    const st   = b > 0
      ? (over ? `excedeu ${fmt(s - b)}` : `sobra ${fmt(b - s)}`)
      : '—';
    const bar = b > 0
      ? `<div class="bbar-wrap">
           <div class="bbar" style="width:${pct}%;background:${over ? 'var(--red)' : 'var(--accent)'}"></div>
         </div>`
      : '';

    return `<div class="brow">
      <div class="bdot" style="background:${c.color}"></div>
      <div class="bname">${c.name}</div>
      <div class="bspent">gasto: ${fmt(s)}</div>
      <input class="binput" type="number" min="0" step="10" placeholder="Sem limite"
        value="${budgets[c.id] || ''}" inputmode="decimal"
        onchange="updateBudget('${c.id}', this.value)" />
      <div class="bstatus" style="color:${over ? 'var(--red)' : 'var(--accent)'}">${st}</div>
      ${bar}
    </div>`;
  }).join('');
}

function updateBudget(id, val) {
  const b = loadBud();
  if (val === '' || parseFloat(val) === 0) {
    delete b[id];
  } else {
    b[id] = val;
  }
  saveBud(b);
  renderSummary();
  renderBudget();
  renderSidebar();
}
