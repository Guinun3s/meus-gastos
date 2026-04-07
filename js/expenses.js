// ============================================================
// js/expenses.js — lançamentos: adicionar, editar, remover, listar
//
// Fluxo especial para categoria "meta":
//   1. Usuário seleciona categoria Meta
//   2. Aparece seletor "Qual meta?" com as metas existentes
//   3. A descrição é preenchida automaticamente
//   4. Ao salvar: registra o lançamento E incrementa goal.saved
// ============================================================

// ── Reação à mudança de categoria ────────────────────────────
function onCatChange(selectEl) {
  const isMeta = selectEl.value === 'meta';
  const isDesk = selectEl.id === 'catSelect';
  const wrapId = isDesk ? 'goalLinkWrap'  : 'mGoalLinkWrap';
  const descId = isDesk ? 'desc'          : 'mDesc';
  const linkId = isDesk ? 'goalLink'      : 'mGoalLink';

  const wrap = document.getElementById(wrapId);
  if (!wrap) return;

  if (isMeta) {
    _fillGoalLinkSelect(linkId);
    wrap.style.display = 'flex';
    _syncGoalDesc(linkId, descId);
  } else {
    wrap.style.display = 'none';
    const descEl = document.getElementById(descId);
    if (descEl && descEl.dataset.autoFilled === '1') {
      descEl.value = '';
      descEl.dataset.autoFilled = '0';
    }
  }
}

// Preenche o <select> de metas com nome + progresso
function _fillGoalLinkSelect(selectId) {
  const sel   = document.getElementById(selectId);
  if (!sel) return;
  const goals = loadGoals();

  if (!goals.length) {
    sel.innerHTML = '<option value="">— Nenhuma meta criada ainda —</option>';
    return;
  }
  sel.innerHTML = goals.map(g => {
    const saved  = parseFloat(g.saved) || 0;
    const pct    = g.target > 0 ? Math.round(saved / g.target * 100) : 0;
    const done   = saved >= g.target;
    const suffix = done ? ' ✓' : ` — ${pct}%`;
    return `<option value="${g.id}">${g.icon || '🎯'} ${g.name}${suffix}</option>`;
  }).join('');
}

// Auto-preenche descrição com o nome da meta selecionada
function _syncGoalDesc(linkId, descId) {
  const sel    = document.getElementById(linkId);
  const descEl = document.getElementById(descId);
  if (!sel || !descEl) return;
  const goal = loadGoals().find(g => g.id === parseInt(sel.value));
  if (goal) {
    descEl.value = `Meta: ${goal.name}`;
    descEl.dataset.autoFilled = '1';
  }
}

// Chamada pelo onchange do goalLink select para atualizar a descrição
function onGoalLinkChange(selectEl) {
  const isDesk = selectEl.id === 'goalLink';
  const descId = isDesk ? 'desc' : 'mDesc';
  _syncGoalDesc(selectEl.id, descId);
}

// ── Adicionar (desktop) ──────────────────────────────────────
function addExpense() {
  const desc   = document.getElementById('desc').value.trim();
  const valor  = parseFloat(document.getElementById('valor').value);
  const cat    = document.getElementById('catSelect').value;
  const pay    = document.getElementById('paySelect').value;
  const data   = document.getElementById('dataGasto').value || today();
  const goalId = cat === 'meta' ? parseInt(document.getElementById('goalLink')?.value) : null;

  if (_addExpense(desc, valor, cat, pay, data, goalId)) {
    document.getElementById('desc').value = '';
    document.getElementById('valor').value = '';
    document.getElementById('desc').dataset.autoFilled = '0';
    const wrap = document.getElementById('goalLinkWrap');
    if (wrap) wrap.style.display = 'none';
    document.getElementById('catSelect').value = CATS[0].id;
  }
}

// ── Adicionar/Salvar (mobile sheet) ─────────────────────────
function saveExpenseMobile() {
  const desc   = document.getElementById('mDesc').value.trim();
  const valor  = parseFloat(document.getElementById('mValor').value);
  const cat    = document.getElementById('mCatSelect').value;
  const pay    = document.getElementById('mPaySelect').value;
  const data   = document.getElementById('mDataGasto').value || today();
  const goalId = cat === 'meta' ? parseInt(document.getElementById('mGoalLink')?.value) : null;

  if (_editingId !== null) {
    _updateExpense(_editingId, desc, valor, cat, pay, data);
    closeSheet('sheetAdd');
  } else {
    if (_addExpense(desc, valor, cat, pay, data, goalId)) {
      document.getElementById('mDesc').value = '';
      document.getElementById('mValor').value = '';
      document.getElementById('mDesc').dataset.autoFilled = '0';
      closeSheet('sheetAdd');
    }
  }
}

// ── Abrir sheet de adição (mobile FAB) ───────────────────────
function openAddSheet() {
  _editingId = null;
  document.getElementById('mDesc').value = '';
  document.getElementById('mValor').value = '';
  document.getElementById('mDataGasto').value = today();
  document.getElementById('mDesc').dataset.autoFilled = '0';
  const cat = document.getElementById('mCatSelect');
  if (cat) cat.selectedIndex = 0;
  const pay = document.getElementById('mPaySelect');
  if (pay) pay.selectedIndex = 0;
  const wrap = document.getElementById('mGoalLinkWrap');
  if (wrap) wrap.style.display = 'none';
  _setSheetAddMode('add');
  openSheet('sheetAdd');
}

// ── Abrir edição de lançamento ───────────────────────────────
function openEditExpense(id) {
  const exp = loadExp().find(e => e.id === id);
  if (!exp) return;
  _editingId = id;

  if (isMobile()) {
    document.getElementById('mDesc').value      = exp.desc;
    document.getElementById('mValor').value     = exp.valor;
    document.getElementById('mDataGasto').value = exp.data;
    document.getElementById('mCatSelect').value = exp.cat;
    document.getElementById('mPaySelect').value = exp.pay;
    const wrap = document.getElementById('mGoalLinkWrap');
    if (wrap) wrap.style.display = exp.cat === 'meta' ? 'flex' : 'none';
    if (exp.cat === 'meta') _fillGoalLinkSelect('mGoalLink');
    _setSheetAddMode('edit');
    openSheet('sheetAdd');
  } else {
    document.getElementById('editDesc').value      = exp.desc;
    document.getElementById('editValor').value     = exp.valor;
    document.getElementById('editData').value      = exp.data;
    document.getElementById('editCatSelect').value = exp.cat;
    document.getElementById('editPaySelect').value = exp.pay;
    openModal('modalEdit');
  }
}

// ── Salvar edição (desktop modal) ────────────────────────────
function saveEditExpense() {
  const desc  = document.getElementById('editDesc').value.trim();
  const valor = parseFloat(document.getElementById('editValor').value);
  const cat   = document.getElementById('editCatSelect').value;
  const pay   = document.getElementById('editPaySelect').value;
  const data  = document.getElementById('editData').value || today();
  _updateExpense(_editingId, desc, valor, cat, pay, data);
  closeModal('modalEdit');
}

// ── Deletar ──────────────────────────────────────────────────
function deleteExpense(id) {
  if (!confirm('Remover este lançamento?')) return;
  saveExp(loadExp().filter(e => e.id !== id));
  render();
  toast('Removido.');
}

// ── Helpers internos ─────────────────────────────────────────
function _addExpense(desc, valor, cat, pay, data, goalId = null) {
  if (!desc || isNaN(valor) || valor <= 0) {
    toast('Preencha descrição e valor.');
    return false;
  }

  // Vincula ao goal se categoria for meta
  if (cat === 'meta') {
    if (!goalId || isNaN(goalId)) {
      toast('Selecione a meta de destino.');
      return false;
    }
    const goals = loadGoals();
    const goal  = goals.find(g => g.id === goalId);
    if (!goal) { toast('Meta não encontrada.'); return false; }
    goal.saved = (parseFloat(goal.saved) || 0) + valor;
    saveGoals(goals);
  }

  const list  = loadExp();
  const entry = { id: Date.now(), desc, valor, cat, pay, data };
  if (goalId) entry.goalId = goalId;
  list.push(entry);
  list.sort((a, b) => b.data.localeCompare(a.data));
  saveExp(list);
  render();
  toast('Lançamento adicionado!');
  return true;
}

function _updateExpense(id, desc, valor, cat, pay, data) {
  if (!desc || isNaN(valor) || valor <= 0) {
    toast('Preencha descrição e valor.');
    return;
  }
  const list = loadExp()
    .map(e => e.id === id ? { ...e, desc, valor, cat, pay, data } : e)
    .sort((a, b) => b.data.localeCompare(a.data));
  saveExp(list);
  _editingId = null;
  render();
  toast('Lançamento atualizado!');
}

function _setSheetAddMode(mode) {
  const titleEl = document.getElementById('sheetAddTitle');
  const btnEl   = document.getElementById('sheetAddBtn');
  if (titleEl) titleEl.textContent = mode === 'edit' ? 'Editar lançamento' : 'Novo lançamento';
  if (btnEl)   btnEl.textContent   = mode === 'edit' ? 'Salvar alterações'  : 'Adicionar lançamento';
}

// ── Renderizar tabela (desktop) e cards (mobile) ─────────────
function renderExpenses() {
  const fc  = document.getElementById('filterCat').value;
  const fp  = document.getElementById('filterPay').value;
  const fsD = (document.getElementById('filterSearch')  || {}).value || '';
  const fsM = (document.getElementById('filterSearchM') || {}).value || '';
  const fs  = (isMobile() ? fsM : fsD).toLowerCase();

  let list = loadExp();
  if (fc) list = list.filter(e => e.cat === fc);
  if (fp) list = list.filter(e => e.pay === fp);
  if (fs) list = list.filter(e => e.desc.toLowerCase().includes(fs));

  _renderDesktopTable(list);
  _renderMobileCards(list);
}

function _renderDesktopTable(list) {
  const tbody = document.getElementById('expenseTbody');
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty">Nenhum lançamento encontrado.</div></td></tr>';
    return;
  }

  tbody.innerHTML = list.map(e => {
    const cat = catById(e.cat);
    const pc  = PAY_COLORS[e.pay] || '#585860';
    const pl  = PAY_LABELS[e.pay] || e.pay || '—';
    const goalPin = e.cat === 'meta' ? ' <span style="font-size:10px;opacity:.55">🎯</span>' : '';
    return `<tr>
      <td>${e.desc}${goalPin}</td>
      <td><span class="pill" style="background:${cat.color}1a;color:${cat.color}">
        <span class="pdot" style="background:${cat.color}"></span>${cat.name}</span></td>
      <td><span class="pill" style="background:${pc}1a;color:${pc}">
        <span class="pdot" style="background:${pc}"></span>${pl}</span></td>
      <td class="td-date">${fmtDate(e.data)}</td>
      <td class="td-r">${fmt(e.valor)}</td>
      <td>
        <button class="td-edit" onclick="openEditExpense(${e.id})" title="Editar">✎</button>
        <button class="td-del"  onclick="deleteExpense(${e.id})"  title="Remover">×</button>
      </td>
    </tr>`;
  }).join('');
}

function _renderMobileCards(list) {
  const el = document.getElementById('mExpenseList');
  if (!el) return;

  if (!list.length) {
    el.innerHTML = '<div class="m-empty">📋 Nenhum lançamento encontrado.</div>';
    return;
  }

  el.innerHTML = list.map(e => {
    const cat     = catById(e.cat);
    const pc      = PAY_COLORS[e.pay] || '#585860';
    const pl      = PAY_LABELS[e.pay] || e.pay || '—';
    const goalPin = e.cat === 'meta' ? ' ★' : '';
    return `<div class="m-exp-card">
      <div class="m-exp-desc">${e.desc}${goalPin}</div>
      <div class="m-exp-valor">${fmt(e.valor)}</div>
      <div class="m-exp-meta">
        <span class="pill" style="background:${cat.color}1a;color:${cat.color}">
          <span class="pdot" style="background:${cat.color}"></span>${cat.name}</span>
        <span class="pill" style="background:${pc}1a;color:${pc}">
          <span class="pdot" style="background:${pc}"></span>${pl}</span>
      </div>
      <div class="m-exp-foot">
        <span class="m-exp-date">${fmtDate(e.data)}</span>
        <div style="display:flex;gap:4px">
          <button class="m-edit-btn" onclick="openEditExpense(${e.id})">✎</button>
          <button class="m-del-btn"  onclick="deleteExpense(${e.id})">×</button>
        </div>
      </div>
    </div>`;
  }).join('');
}
