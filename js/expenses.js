// ============================================================
// js/expenses.js — lançamentos: adicionar, editar, remover, listar
// Suporta: normal | recorrente (N meses) | parcelado (N parcelas)
// ============================================================


// Paleta de cores para avatares (neon theme)
const AVATAR_PALETTE = [
  {bg:'rgba(124,92,255,0.2)', color:'#a080ff'},
  {bg:'rgba(255,80,64,0.2)',  color:'#ff7060'},
  {bg:'rgba(64,208,144,0.2)', color:'#40d090'},
  {bg:'rgba(64,192,208,0.2)', color:'#40c0d0'},
  {bg:'rgba(255,160,64,0.2)', color:'#ffa040'},
  {bg:'rgba(224,120,192,0.2)',color:'#e078c0'},
  {bg:'rgba(96,168,255,0.2)', color:'#60a8ff'},
  {bg:'rgba(255,200,64,0.2)', color:'#ffc840'},
];

function _avatarStyle(str) {
  const idx = (str.charCodeAt(0) || 0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

// ── Reação à mudança de categoria ────────────────────────────
function onCatChange(selectEl) {
  const cat    = selectEl.value;
  const isMeta = cat === 'meta';
  const isAssig = cat === 'assinatura';
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

  // Assinatura → configura automaticamente como recorrente
  if (isAssig) {
    const typeId  = isDesk ? 'expType'       : 'mExpType';
    const extraId = isDesk ? 'expTypeExtra'  : 'mExpTypeExtra';
    const labelId = isDesk ? 'expTypeLabel'  : 'mExpTypeLabel';
    const inputId = isDesk ? 'expTypeQty'    : 'mExpTypeQty';
    const prevId  = isDesk ? 'expTypePreview': 'mExpTypePreview';
    const typeEl  = document.getElementById(typeId);
    if (typeEl) typeEl.value = 'recorrente';
    const extra = document.getElementById(extraId);
    if (extra) extra.style.display = 'flex';
    const label = document.getElementById(labelId);
    if (label) label.textContent = 'Repetir por';
    const input = document.getElementById(inputId);
    if (input) input.value = '';
    const prev = document.getElementById(prevId);
    if (prev) prev.textContent = 'meses';
  }
}

// Reação à mudança de forma de pagamento — mostra seletor de cartão se crédito
function onPayChange(selectEl) {
  const isCredito = selectEl.value === 'credito';
  let wrapId;
  if      (selectEl.id === 'paySelect')     wrapId = 'cardWrap';
  else if (selectEl.id === 'editPaySelect') wrapId = 'editCardWrap';
  else if (selectEl.id === 'mPaySelect')    wrapId = 'mCardWrap';
  const wrap = document.getElementById(wrapId);
  if (!wrap) return;
  if (isCredito && loadCards().length > 0) {
    _fillCardSelect(wrap.querySelector('select'));
    wrap.style.display = 'flex';
  } else {
    wrap.style.display = 'none';
  }
}

function _fillCardSelect(sel) {
  if (!sel) return;
  sel.innerHTML = '<option value="">— Sem vínculo —</option>' +
    loadCards().map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

// Reação ao tipo de lançamento (normal/recorrente/parcelado)
function onExpTypeChange(selectEl) {
  const isDesk   = selectEl.id === 'expType';
  const extraId  = isDesk ? 'expTypeExtra'  : 'mExpTypeExtra';
  const labelId  = isDesk ? 'expTypeLabel'  : 'mExpTypeLabel';
  const inputId  = isDesk ? 'expTypeQty'    : 'mExpTypeQty';
  const previewId = isDesk ? 'expTypePreview' : 'mExpTypePreview';
  const extra    = document.getElementById(extraId);
  const label    = document.getElementById(labelId);
  const input    = document.getElementById(inputId);
  const preview  = document.getElementById(previewId);
  if (!extra) return;

  if (selectEl.value === 'normal') {
    extra.style.display = 'none';
  } else {
    extra.style.display = 'flex';
    if (selectEl.value === 'recorrente') {
      label.textContent = 'Repetir por';
      input.value       = '';
      input.placeholder = '12';
      if (preview) preview.textContent = 'meses';
    } else {
      label.textContent = 'Parcelas';
      input.value       = '';
      input.placeholder = '2';
      _updateInstallPreview(isDesk);
    }
  }
}

// Atualiza o preview "R$X/parcela"
function _updateInstallPreview(isDesk) {
  const valorId   = isDesk ? 'valor'       : 'mValor';
  const inputId   = isDesk ? 'expTypeQty'  : 'mExpTypeQty';
  const previewId = isDesk ? 'expTypePreview' : 'mExpTypePreview';
  const typeId    = isDesk ? 'expType'     : 'mExpType';
  const type      = document.getElementById(typeId)?.value;
  const preview   = document.getElementById(previewId);
  if (!preview) return;

  if (type === 'parcelado') {
    const val = parseFloat(document.getElementById(valorId)?.value) || 0;
    const n   = parseInt(document.getElementById(inputId)?.value)   || 1;
    preview.textContent = n > 1 && val > 0
      ? fmt(val / n) + '/parcela'
      : 'parcelas';
  } else {
    preview.textContent = 'meses';
  }
}

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
    const suffix = saved >= g.target ? ' ✓' : ` — ${pct}%`;
    return `<option value="${g.id}">${g.icon || '🎯'} ${g.name}${suffix}</option>`;
  }).join('');
}

function _syncGoalDesc(linkId, descId) {
  const sel    = document.getElementById(linkId);
  const descEl = document.getElementById(descId);
  if (!sel || !descEl) return;
  const goal = loadGoals().find(g => g.id === parseInt(sel.value));
  if (goal) { descEl.value = `Meta: ${goal.name}`; descEl.dataset.autoFilled = '1'; }
}

function onGoalLinkChange(selectEl) {
  const isDesk = selectEl.id === 'goalLink';
  _syncGoalDesc(selectEl.id, isDesk ? 'desc' : 'mDesc');
}

// ── Adicionar (desktop) ──────────────────────────────────────
function addExpense() {
  const desc   = document.getElementById('desc').value.trim();
  const valor  = parseFloat(document.getElementById('valor').value);
  const cat    = document.getElementById('catSelect').value;
  const pay    = document.getElementById('paySelect').value;
  const data   = document.getElementById('dataGasto').value || today();
  const type   = document.getElementById('expType').value;
  const rawQty = document.getElementById('expTypeQty').value;
  const qty    = parseInt(rawQty) || (type === 'parcelado' ? 2 : 12);
  const goalId = cat === 'meta' ? parseInt(document.getElementById('goalLink')?.value) : null;
  const cardId = pay === 'credito' ? (parseInt(document.getElementById('cardSelect')?.value) || null) : null;

  if (_dispatchAdd(desc, valor, cat, pay, data, type, qty, goalId, cardId)) {
    document.getElementById('desc').value  = '';
    document.getElementById('valor').value = '';
    document.getElementById('desc').dataset.autoFilled = '0';
    document.getElementById('expType').value = 'normal';
    document.getElementById('expTypeQty').value = '';
    document.getElementById('expTypeExtra').style.display = 'none';
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
  const type   = document.getElementById('mExpType').value;
  const rawQty = document.getElementById('mExpTypeQty').value;
  const qty    = parseInt(rawQty) || (type === 'parcelado' ? 2 : 12);
  const goalId = cat === 'meta' ? parseInt(document.getElementById('mGoalLink')?.value) : null;
  const cardId = pay === 'credito' ? (parseInt(document.getElementById('mCardSelect')?.value) || null) : null;

  if (_editingId !== null) {
    const editCardId = pay === 'credito' ? (parseInt(document.getElementById('mCardSelect')?.value) || null) : null;
    _updateExpense(_editingId, desc, valor, cat, pay, data, editCardId);
    closeSheet('sheetAdd');
  } else {
    if (_dispatchAdd(desc, valor, cat, pay, data, type, qty, goalId)) {
      document.getElementById('mDesc').value  = '';
      document.getElementById('mValor').value = '';
      document.getElementById('mDesc').dataset.autoFilled = '0';
      document.getElementById('mExpType').value = 'normal';
      document.getElementById('mExpTypeExtra').style.display = 'none';
      closeSheet('sheetAdd');
    }
  }
}

function _dispatchAdd(desc, valor, cat, pay, data, type, qty, goalId, cardId) {
  if (type === 'recorrente') return _createRecurring(desc, valor, cat, pay, data, qty, goalId, cardId);
  if (type === 'parcelado')  return _createInstallment(desc, valor, cat, pay, data, qty, cardId);
  return _addExpense(desc, valor, cat, pay, data, goalId, cardId);
}

// ── Abrir sheet de adição (mobile FAB) ───────────────────────
function openAddSheet() {
  _editingId = null;
  document.getElementById('mDesc').value        = '';
  document.getElementById('mValor').value       = '';
  document.getElementById('mDataGasto').value   = today();
  document.getElementById('mDesc').dataset.autoFilled = '0';
  document.getElementById('mExpType').value     = 'normal';
  document.getElementById('mExpTypeQty').value  = '';
  document.getElementById('mExpTypeExtra').style.display = 'none';
  const cat  = document.getElementById('mCatSelect');
  if (cat)  cat.selectedIndex = 0;
  const pay  = document.getElementById('mPaySelect');
  if (pay)  pay.selectedIndex = 0;
  const wrap = document.getElementById('mGoalLinkWrap');
  if (wrap) wrap.style.display = 'none';
  const cw = document.getElementById('mCardWrap');
  if (cw) cw.style.display = 'none';
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
    document.getElementById('mExpType').value   = 'normal';
    document.getElementById('mExpTypeExtra').style.display = 'none';
    const wrap = document.getElementById('mGoalLinkWrap');
    if (wrap) wrap.style.display = exp.cat === 'meta' ? 'flex' : 'none';
    if (exp.cat === 'meta') _fillGoalLinkSelect('mGoalLink');

    // Pagamento + seletor de cartão
    const mPay = document.getElementById('mPaySelect');
    mPay.value = exp.pay;
    onPayChange(mPay);
    if (exp.pay === 'credito' && exp.cardId) {
      const mCard = document.getElementById('mCardSelect');
      if (mCard) mCard.value = exp.cardId;
    }

    _setSheetAddMode('edit');
    openSheet('sheetAdd');
  } else {
    document.getElementById('editDesc').value      = exp.desc;
    document.getElementById('editValor').value     = exp.valor;
    document.getElementById('editData').value      = exp.data;
    document.getElementById('editCatSelect').value = exp.cat;

    // Pagamento + seletor de cartão
    const editPay = document.getElementById('editPaySelect');
    editPay.value = exp.pay;
    onPayChange(editPay);
    if (exp.pay === 'credito' && exp.cardId) {
      const editCard = document.getElementById('editCardSelect');
      if (editCard) editCard.value = exp.cardId;
    }

    openModal('modalEdit');
  }
}

// ── Salvar edição (desktop modal) ────────────────────────────
function saveEditExpense() {
  const desc   = document.getElementById('editDesc').value.trim();
  const valor  = parseFloat(document.getElementById('editValor').value);
  const cat    = document.getElementById('editCatSelect').value;
  const pay    = document.getElementById('editPaySelect').value;
  const data   = document.getElementById('editData').value || today();
  const cardId = pay === 'credito' ? (parseInt(document.getElementById('editCardSelect')?.value) || null) : null;
  _updateExpense(_editingId, desc, valor, cat, pay, data, cardId);
  closeModal('modalEdit');
}

// ── Deletar ──────────────────────────────────────────────────
// Ajusta goal.saved em delta (positivo = adiciona, negativo = subtrai)
function _adjustGoalSaved(goalId, delta) {
  if (!goalId || !delta) return;
  const goals = loadGoals();
  // Usa Number() para evitar mismatch de tipo (string vs number do Firestore)
  const goal  = goals.find(g => Number(g.id) === Number(goalId));
  if (!goal) return;
  goal.saved = Math.max(0, (parseFloat(goal.saved) || 0) + delta);
  saveGoals(goals);
}

// Decrementa goal.saved ao deletar um lançamento de meta
// Suporta: goalId explícito (novo) e fallback por descrição (lançamentos antigos sem goalId)
function _decrementGoalForExpense(exp) {
  if (!exp || exp.cat !== 'meta') return;

  if (exp.goalId) {
    _adjustGoalSaved(exp.goalId, -exp.valor);
    return;
  }

  // Fallback: busca a meta pelo nome na descrição ("Meta: Nome da Meta")
  const prefix = 'Meta: ';
  if (exp.desc && exp.desc.startsWith(prefix)) {
    const goalName = exp.desc.slice(prefix.length);
    const goals = loadGoals();
    const goal  = goals.find(g => g.name === goalName);
    if (goal) _adjustGoalSaved(goal.id, -exp.valor);
  }
}

function deleteExpense(id) {
  const exp = loadExp().find(e => e.id === id);
  if (!exp) return;

  if (exp.recurringId) {
    openDeleteModal(
      '🔄 Lançamento recorrente',
      'Como deseja remover?',
      'Só este mês',     () => { _decrementGoalForExpense(exp); saveExp(loadExp().filter(e => e.id !== id)); render(); toast('Removido.'); },
      'Este e os futuros', () => {
        // Subtrai todos os futuros vinculados à meta
        if (exp.goalId) {
          Object.values(_cache.expenses).forEach(list => {
            (list || []).forEach(e => {
              if (e.recurringId === exp.recurringId && e.recurringIdx >= exp.recurringIdx && e.goalId)
                _adjustGoalSaved(e.goalId, -e.valor);
            });
          });
        }
        _deleteRecurringFuture(exp.recurringId, exp.recurringIdx); render(); toast('Recorrência removida.');
      }
    );
  } else if (exp.installmentId) {
    openDeleteModal(
      `📦 Parcela ${exp.installmentN}/${exp.installmentTotal}`,
      'Como deseja remover?',
      'Só esta parcela', () => { _decrementGoalForExpense(exp); saveExp(loadExp().filter(e => e.id !== id)); render(); toast('Parcela removida.'); },
      'Todas as parcelas', () => { _deleteAllInstallments(exp.installmentId); render(); toast('Parcelamento removido.'); }
    );
  } else {
    if (!confirm('Remover este lançamento?')) return;
    _decrementGoalForExpense(exp);
    saveExp(loadExp().filter(e => e.id !== id));
    render();
    toast('Removido.');
  }
}

// Mini-modal de escolha para delete
function openDeleteModal(title, subtitle, labelA, cbA, labelB, cbB) {
  document.getElementById('delModalTitle').textContent    = title;
  document.getElementById('delModalSubtitle').textContent = subtitle;
  document.getElementById('delBtnA').textContent          = labelA;
  document.getElementById('delBtnB').textContent          = labelB;
  document.getElementById('delBtnA').onclick = () => { closeModal('modalDelete'); cbA(); };
  document.getElementById('delBtnB').onclick = () => { closeModal('modalDelete'); cbB(); };
  openModal('modalDelete');
}

// ── Helpers de criação ────────────────────────────────────────
function _addExpense(desc, valor, cat, pay, data, goalId = null, cardId = null) {
  if (!desc || isNaN(valor) || valor <= 0) { toast('Preencha descrição e valor.'); return false; }

  if (cat === 'meta') {
    if (!goalId || isNaN(goalId)) { toast('Selecione a meta de destino.'); return false; }
    const goals = loadGoals();
    const goal  = goals.find(g => g.id === goalId);
    if (!goal) { toast('Meta não encontrada.'); return false; }
    goal.saved = (parseFloat(goal.saved) || 0) + valor;
    saveGoals(goals);
    checkGoalAlerts(goals);
  }

  const list  = loadExp();
  const entry = { id: Date.now(), desc, valor, cat, pay, data };
  if (goalId) entry.goalId = goalId;
  if (cardId) entry.cardId = cardId;
  list.push(entry);
  list.sort((a, b) => b.data.localeCompare(a.data));
  saveExp(list);
  render();
  toast('Lançamento adicionado!');
  return true;
}

function _createRecurring(desc, valor, cat, pay, data, months, goalId, cardId) {
  if (!desc || isNaN(valor) || valor <= 0) { toast('Preencha descrição e valor.'); return false; }
  if (isNaN(months) || months < 1 || months > 60) { toast('Informe entre 1 e 60 meses.'); return false; }

  const rid        = Date.now();
  const [y, m, d]  = data.split('-').map(Number);

  for (let i = 0; i < months; i++) {
    const totalMonths = (m - 1) + i;
    const ny   = y + Math.floor(totalMonths / 12);
    const nm   = totalMonths % 12;          // 0-indexed
    const key  = `${ny}_${nm}`;
    const days = new Date(ny, nm + 1, 0).getDate();
    const day  = Math.min(d, days);
    const entryData = `${ny}-${String(nm + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

    if (!_cache.expenses[key]) _cache.expenses[key] = [];
    const recEntry = { id: rid + i, desc, valor, cat, pay, data: entryData, recurringId: rid, recurringIdx: i, recurringTotal: months };
    if (cardId) recEntry.cardId = cardId;
    _cache.expenses[key].push(recEntry);
    _cache.expenses[key].sort((a, b) => b.data.localeCompare(a.data));
  }

  scheduleSync();
  render();
  toast(`Recorrência criada por ${months} meses!`);
  return true;
}

function _createInstallment(desc, valor, cat, pay, data, nParcelas, cardId) {
  if (!desc || isNaN(valor) || valor <= 0) { toast('Preencha descrição e valor.'); return false; }
  if (isNaN(nParcelas) || nParcelas < 2 || nParcelas > 48) { toast('Informe entre 2 e 48 parcelas.'); return false; }

  const iid       = Date.now();
  const [y, m, d] = data.split('-').map(Number);
  // Distribui centavos: primeira parcela leva o arredondamento
  const base      = Math.floor(valor / nParcelas * 100) / 100;
  const remainder = Math.round((valor - base * nParcelas) * 100) / 100;

  for (let i = 0; i < nParcelas; i++) {
    const totalMonths = (m - 1) + i;
    const ny   = y + Math.floor(totalMonths / 12);
    const nm   = totalMonths % 12;
    const key  = `${ny}_${nm}`;
    const days = new Date(ny, nm + 1, 0).getDate();
    const day  = Math.min(d, days);
    const entryData = `${ny}-${String(nm + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const valorParcela = i === 0 ? base + remainder : base;

    if (!_cache.expenses[key]) _cache.expenses[key] = [];
    const instEntry = { id: iid + i, desc, valor: valorParcela, cat, pay, data: entryData, installmentId: iid, installmentN: i + 1, installmentTotal: nParcelas, installmentValorTotal: valor };
    if (cardId) instEntry.cardId = cardId;
    _cache.expenses[key].push(instEntry);
    _cache.expenses[key].sort((a, b) => b.data.localeCompare(a.data));
  }

  scheduleSync();
  render();
  toast(`Parcelado em ${nParcelas}x de ${fmt(base)}!`);
  return true;
}

// ── Helpers de deleção ────────────────────────────────────────
function _deleteRecurringFuture(rid, fromIdx) {
  // Remove este e todos os futuros (idx >= fromIdx) em todos os meses do cache
  Object.keys(_cache.expenses).forEach(key => {
    _cache.expenses[key] = _cache.expenses[key].filter(
      e => !(e.recurringId === rid && e.recurringIdx >= fromIdx)
    );
  });
  scheduleSync();
}

function _deleteAllInstallments(iid) {
  Object.keys(_cache.expenses).forEach(key => {
    _cache.expenses[key] = _cache.expenses[key].filter(e => e.installmentId !== iid);
  });
  scheduleSync();
}

function _updateExpense(id, desc, valor, cat, pay, data, cardId = null) {
  if (!desc || isNaN(valor) || valor <= 0) { toast('Preencha descrição e valor.'); return; }

  // Ajusta goal.saved se o lançamento estava ou passa a estar vinculado a uma meta
  const oldExp = loadExp().find(e => e.id === id);
  if (oldExp) {
    if (oldExp.goalId && oldExp.cat === 'meta') {
      if (cat === 'meta') {
        // Mesma meta: ajusta pela diferença de valor
        _adjustGoalSaved(oldExp.goalId, valor - oldExp.valor);
      } else {
        // Deixou de ser meta: reverte o valor antigo
        _adjustGoalSaved(oldExp.goalId, -oldExp.valor);
      }
    }
    // Nota: mudar PARA meta via edição não é suportado (sem seletor de goal no edit modal)
  }

  const list = loadExp()
    .map(e => {
      if (e.id !== id) return e;
      const updated = { ...e, desc, valor, cat, pay, data };
      if (pay === 'credito' && cardId) updated.cardId = cardId;
      else delete updated.cardId;
      // Mantém goalId se categoria continua sendo meta
      if (cat !== 'meta') delete updated.goalId;
      return updated;
    })
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
  if (btnEl)   btnEl.textContent   = mode === 'edit' ? 'Salvar alterações' : 'Adicionar lançamento';
}

// ── Badges de tipo ────────────────────────────────────────────
function _typeBadge(e) {
  let badge = '';
  if (e.recurringId)   badge += ` <span class="badge-rec" title="Recorrente ${e.recurringIdx+1}/${e.recurringTotal}">🔄</span>`;
  if (e.installmentId) badge += ` <span class="badge-inst" title="${fmt(e.installmentValorTotal||0)} total">${e.installmentN}/${e.installmentTotal}</span>`;
  if (e.cardId) {
    const card = loadCards().find(c => c.id === e.cardId);
    if (card) badge += ` <span class="badge-card" style="background:${card.color}1a;color:${card.color}">💳 ${card.name}</span>`;
  }
  return badge;
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
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty">Nenhum lançamento encontrado.</div></td></tr>';
    return;
  }

  tbody.innerHTML = list.map(e => {
    const goalPin = e.cat === 'meta' ? ' <span style="font-size:10px;opacity:.55">🎯</span>' : '';
    const initial = (e.desc || '?')[0].toUpperCase();
    const av = _avatarStyle(e.desc || '');
    const descCell = isNeonTheme()
      ? `<span class="neon-avatar">
           <span class="neon-avatar-circle" style="background:${av.bg};color:${av.color}">${initial}</span>
           <span>${e.desc}${goalPin}${_typeBadge(e)}</span>
         </span>`
      : `${e.desc}${goalPin}${_typeBadge(e)}`;
    return `<tr>
      <td>${descCell}</td>
      <td>${catPill(e.cat)}</td>
      <td>${payPill(e.pay)}</td>
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
    const goalPin = e.cat === 'meta' ? ' ★' : '';
    return `<div class="m-exp-card">
      <div class="m-exp-desc">${e.desc}${goalPin}${_typeBadge(e)}</div>
      <div class="m-exp-valor">${fmt(e.valor)}</div>
      <div class="m-exp-meta">
        ${catPill(e.cat)}
        ${payPill(e.pay)}
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
