// ============================================================
// js/storage.js — leitura e escrita no cache em memória
// ============================================================

// Pagamentos que saem do banco (crédito é dívida futura, não sai agora)
const BANK_PAYS = ["debito", "pix", "transferencia", "boleto"];

// ── Despesas ──────────────────────────────────────────────────
function loadExp() { return _cache.expenses[mKey()] || []; }
function loadBud() { return _cache.budgets || {}; }

function saveExp(list) { _cache.expenses[mKey()] = list; scheduleSync(); }
function saveBud(b)    { _cache.budgets = b;             scheduleSync(); }

// ── Receitas ──────────────────────────────────────────────────
function loadInc() { return (_cache.incomes || {})[mKey()] || []; }
function saveInc(list) {
  if (!_cache.incomes) _cache.incomes = {};
  _cache.incomes[mKey()] = list;
  scheduleSync();
}

// ── Cartões ───────────────────────────────────────────────────
function loadCards()     { return _cache.cards || []; }
function saveCards(list) { _cache.cards = list; scheduleSync(); }

// ── Cálculos de saldo ─────────────────────────────────────────
function calcReceitaBanco()    { return loadInc().filter(i => i.tipo === "banco").reduce((s, i) => s + i.valor, 0); }
function calcReceitaDinheiro() { return loadInc().filter(i => i.tipo === "dinheiro").reduce((s, i) => s + i.valor, 0); }
function calcReceitaTotal()    { return calcReceitaBanco() + calcReceitaDinheiro(); }

// Gastos no banco: exclui crédito (não saiu ainda) — inclui pagamentos de fatura (faturaCardId)
function calcGastosBanco()    {
  return loadExp()
    .filter(e => BANK_PAYS.includes(e.pay) || e.faturaCardId)
    .reduce((s, e) => s + e.valor, 0);
}
function calcGastosDinheiro() { return loadExp().filter(e => e.pay === "dinheiro").reduce((s, e) => s + e.valor, 0); }

function calcSaldoBanco()    { return calcReceitaBanco()    - calcGastosBanco(); }
function calcSaldoDinheiro() { return calcReceitaDinheiro() - calcGastosDinheiro(); }
// Saldo real exclui gastos no crédito (dívida futura) — só conta quando a fatura é paga
function calcSaldoReal() {
  const gastosSemCredito = loadExp()
    .filter(e => e.pay !== 'credito')
    .reduce((s, e) => s + e.valor, 0);
  return calcReceitaTotal() - gastosSemCredito;
}

// ── Totais por categoria ──────────────────────────────────────
function catTotals() {
  const t = {};
  CATS.forEach(c => { t[c.id] = 0; });
  loadExp().forEach(e => { t[e.cat] = (t[e.cat] || 0) + e.valor; });
  return t;
}

// ── Histórico mensal ──────────────────────────────────────────
function getMonthlyHistory(numMonths = 6) {
  const result = [];
  let m = curMonth;
  let y = curYear;

  for (let i = 0; i < numMonths; i++) {
    const key  = `${y}_${m}`;
    const exps = _cache.expenses[key] || [];
    const incs = (_cache.incomes || {})[key] || [];
    const receita = incs.reduce((s, i) => s + i.valor, 0);
    const total   = exps.reduce((s, e) => s + e.valor, 0);
    const invest  = exps.filter(e => e.cat === "investimento").reduce((s, e) => s + e.valor, 0);
    const gastos  = total - invest;
    const label   = fmtMonthShort(y, m);

    result.unshift({ key, label, total, gastos, invest, receita, month: m, year: y });

    m--;
    if (m < 0) { m = 11; y--; }
  }

  return result;
}

// ── Metas ─────────────────────────────────────────────────────
function loadGoals()     { return _cache.goals || []; }
function saveGoals(list) { _cache.goals = list; scheduleSync(); }
