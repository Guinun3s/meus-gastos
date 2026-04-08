// ============================================================
// js/budget.js — painel de orçamento por categoria
// ============================================================

// Threshold de alerta (80%)
const BUDGET_ALERT_PCT = 80;

// _alertedCats  = toasts já disparados (evita spam na sessão)
// _dismissedAlerts = pills que o usuário fechou (zera ao reabrir o app)
const _alertedCats    = new Set();
const _dismissedAlerts = new Set();

function dismissAlert(key) {
  _dismissedAlerts.add(key);
  checkBudgetAlerts(); // re-renderiza sem o pill dispensado
}

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
    const alertBadge = b > 0 && pct >= BUDGET_ALERT_PCT
      ? `<span class="budget-alert-badge" style="color:${over ? 'var(--red)' : '#f0b860'}">${pct}%</span>`
      : '';

    return `<div class="brow">
      <div class="bdot" style="background:${c.color}"></div>
      <div class="bname">${c.name} ${alertBadge}</div>
      <div class="bspent">gasto: ${fmt(s)}</div>
      <input class="binput" type="number" min="0" step="10" placeholder="Sem limite"
        value="${budgets[c.id] || ''}" inputmode="decimal"
        onchange="updateBudget('${c.id}', this.value)" />
      <div class="bstatus" style="color:${over ? 'var(--red)' : 'var(--accent)'}"> ${st}</div>
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

// ── Verificar alertas e exibir banners ────────────────────────
function checkBudgetAlerts() {
  const budgets  = loadBud();
  const ct       = catTotals();
  const el       = document.getElementById('budgetAlertsBar');
  if (!el) return;

  const alerts = [];

  CATS.forEach(c => {
    const b   = parseFloat(budgets[c.id]) || 0;
    const s   = ct[c.id] || 0;
    if (b <= 0 || s <= 0) return;
    const pct = Math.round(s / b * 100);
    if (pct < BUDGET_ALERT_PCT) return;

    const over  = s > b;
    const key   = `${c.id}_${over ? 'over' : 'near'}`;
    const color = over ? 'var(--red)' : '#f0b860';
    const icon  = over ? '🚨' : '⚠️';
    const msg   = over
      ? `${c.name}: orçamento excedido em ${fmt(s - b)}`
      : `${c.name}: ${pct}% do orçamento usado`;

    alerts.push({ key, color, icon, msg });

    // Toast apenas uma vez por sessão por categoria
    if (!_alertedCats.has(key)) {
      _alertedCats.add(key);
      setTimeout(() => toast(`${icon} ${msg}`), 400);
    }
  });

  // Filtra os já dispensados pelo usuário
  const visible = alerts.filter(a => !_dismissedAlerts.has(a.key));

  if (visible.length) {
    el.innerHTML = visible.map(a =>
      `<div class="budget-alert-pill" style="border-color:${a.color};color:${a.color}">
        <span>${a.icon} ${a.msg}</span>
        <button class="alert-dismiss-btn" onclick="dismissAlert('${a.key}')" title="Dispensar">✕</button>
      </div>`
    ).join('');
    el.style.display = '';
  } else {
    el.innerHTML = '';
    el.style.display = 'none';
  }
}
