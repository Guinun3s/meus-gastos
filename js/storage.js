// ============================================================
// js/storage.js — leitura e escrita no cache em memória
// O cache é espelhado no Firestore via sync.js.
// ============================================================

function loadExp()  { return _cache.expenses[mKey()] || []; }
function loadBud()  { return _cache.budgets || {}; }
function loadBal()  { return parseFloat(_cache.balances[mKey()]) || 0; }

function saveExp(list) { _cache.expenses[mKey()] = list; scheduleSync(); }
function saveBud(b)    { _cache.budgets = b;             scheduleSync(); }
function saveBal(v)    { _cache.balances[mKey()] = parseFloat(v) || 0; scheduleSync(); }

// Totais por categoria para o mês atual
function catTotals() {
  const t = {};
  CATS.forEach(c => { t[c.id] = 0; });
  loadExp().forEach(e => { t[e.cat] = (t[e.cat] || 0) + e.valor; });
  return t;
}

// Retorna os totais de gastos dos últimos N meses (para o histórico)
function getMonthlyHistory(numMonths = 6) {
  const result = [];
  let m = curMonth;
  let y = curYear;

  for (let i = 0; i < numMonths; i++) {
    const key  = `${y}_${m}`;
    const exps = _cache.expenses[key] || [];
    const bal  = parseFloat(_cache.balances[key]) || 0;
    const total   = exps.reduce((s, e) => s + e.valor, 0);
    const invest  = exps.filter(e => e.cat === 'investimento').reduce((s, e) => s + e.valor, 0);
    const gastos  = total - invest;
    const label   = fmtMonthShort(y, m);

    result.unshift({ key, label, total, gastos, invest, bal, month: m, year: y });

    m--;
    if (m < 0) { m = 11; y--; }
  }

  return result;
}

// ── Metas ─────────────────────────────────────────────────────
function loadGoals()     { return _cache.goals || []; }
function saveGoals(list) { _cache.goals = list; scheduleSync(); }

