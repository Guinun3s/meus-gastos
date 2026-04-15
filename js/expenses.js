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
    return `<option value="${g.id}">${g.name}${suffix}</option>`;
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

// ── Toggle Gasto / Receita no sheetAdd ──────────────────────
let _addSheetMode = 'gasto'; // 'gasto' | 'receita'

function setAddSheetMode(mode) {
  _addSheetMode = mode;

  // Atualiza botões do toggle
  document.getElementById('addTypeBtnGasto')?.classList.toggle('active',       mode === 'gasto');
  document.getElementById('addTypeBtnReceita')?.classList.toggle('active',     mode === 'receita');
  document.getElementById('addTypeBtnInvest')?.classList.toggle('active',      mode === 'investimento');

  // Mostra/oculta campos por modo
  const gastoOnly = ['mCatSelect','mPaySelect','mExpType'];
  document.querySelectorAll('#sheetAdd .form-field').forEach(f => {
    const inp = f.querySelector('select, input');
    if (!inp) return;
    if (gastoOnly.includes(inp.id)) f.style.display = mode === 'gasto' ? '' : 'none';
  });
  // Campos extras de gasto
  document.getElementById('mCardWrap').style.display    = 'none';
  document.getElementById('mGoalLinkWrap').style.display = 'none';
  document.getElementById('mExpTypeExtra').style.display = 'none';
  // Tipo receita
  const incWrap = document.getElementById('mIncTipoWrap');
  if (incWrap) incWrap.style.display = mode === 'receita' ? '' : 'none';
  // Tipo investimento
  const invWrap = document.getElementById('mInvTipoWrap');
  if (invWrap) invWrap.style.display = mode === 'investimento' ? '' : 'none';

  // Título e botão
  const titles = { gasto:'Novo lançamento', receita:'Nova receita', investimento:'Novo investimento' };
  const labels = { gasto:'Adicionar lançamento', receita:'Adicionar receita', investimento:'Adicionar investimento' };
  const fns    = { gasto: saveExpenseMobile, receita: saveUnifiedIncomeMobile, investimento: saveInvestimentoMobile };
  const titleEl = document.getElementById('sheetAddTitle');
  const btnEl   = document.getElementById('sheetAddBtn');
  if (titleEl) titleEl.textContent = titles[mode] || 'Novo lançamento';
  if (btnEl)   { btnEl.textContent = labels[mode] || 'Adicionar'; btnEl.onclick = fns[mode] || saveExpenseMobile; }
}

function saveUnifiedIncomeMobile() {
  const desc  = document.getElementById('mDesc').value.trim();
  const valor = parseFloat(document.getElementById('mValor').value);
  const data  = document.getElementById('mDataGasto').value || today();
  const tipo  = document.getElementById('mIncTipoUnified')?.value || 'banco';

  if (!desc || !valor || valor <= 0) { toast('Preencha descrição e valor.'); return; }

  const rec = { id: Date.now(), desc, valor, data, tipo };
  const list = loadInc();
  list.unshift(rec);
  saveInc(list);
  closeSheet('sheetAdd');
  render();
  toast('Receita adicionada!');
}

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
  setAddSheetMode('gasto'); // sempre abre como gasto
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
      'Lançamento recorrente',
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
      `Parcela ${exp.installmentN}/${exp.installmentTotal}`,
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
  if (e.recurringId)   badge += ` <span class="badge-rec" title="Recorrente ${e.recurringIdx+1}/${e.recurringTotal}">${uiIcon('recurring')} ${e.recurringIdx+1}/${e.recurringTotal}</span>`;
  if (e.installmentId) badge += ` <span class="badge-inst" title="${fmt(e.installmentValorTotal||0)} total">${uiIcon('installment')} ${e.installmentN}/${e.installmentTotal}</span>`;
  if (e.cardId) {
    const card = loadCards().find(c => c.id === e.cardId);
    if (card) badge += ` <span class="badge-card" style="background:${card.color}1a;color:${card.color}">${uiIcon('card')} ${card.name}</span>`;
  }
  return badge;
}


// ── Toggle de formulário desktop (gasto/receita/investimento) ────
function setDesktopFormType(type, btn) {
  // Atualiza botões
  document.querySelectorAll('[data-ftype]').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  // Mostra/oculta formulários
  const fg = document.getElementById('deskFormGasto');
  const fr = document.getElementById('deskFormReceita');
  const fi = document.getElementById('deskFormInvest');
  if (fg) fg.style.display = type === 'gasto'        ? '' : 'none';
  if (fr) fr.style.display = type === 'receita'      ? '' : 'none';
  if (fi) fi.style.display = type === 'investimento' ? '' : 'none';
}

// ── Filtro de tipo do extrato ────────────────────────────────────
let _extratoType = 'todos'; // 'gastos' | 'receitas' | 'investimentos' | 'todos'

function setExtratoType(type, btn) {
  _extratoType = type;
  // Atualiza botões ativos (desktop)
  document.querySelectorAll('.extrato-type-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  // Atualiza botões ativos (mobile)
  document.querySelectorAll('.m-extrato-type-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.etype === type)
  );
  renderExtrato();
}

// ── Extrato unificado: gastos + receitas + investimentos ────────
function renderExtrato() {
  const fc  = document.getElementById('filterCat')?.value  || '';
  const fp  = document.getElementById('filterPay')?.value  || '';
  const fsD = document.getElementById('filterSearch')?.value  || '';
  const fsM = document.getElementById('filterSearchM')?.value || '';
  const fs  = (isMobile() ? fsM : fsD).toLowerCase();

  const showGastos = _extratoType === 'todos' || _extratoType === 'gastos';
  const showReceitas = _extratoType === 'todos' || _extratoType === 'receitas';
  const showInvest = _extratoType === 'todos' || _extratoType === 'investimentos';

  // Monta lista unificada ordenada por data
  let gastos = [];
  if (showGastos) {
    gastos = loadExp().filter(e => e.cat !== 'investimento'); // safety
    if (fc) gastos = gastos.filter(e => e.cat === fc);
    if (fp) gastos = gastos.filter(e => e.pay === fp);
    if (fs) gastos = gastos.filter(e => e.desc?.toLowerCase().includes(fs));
  }

  let receitas = [];
  if (showReceitas) {
    receitas = fs ? loadInc().filter(e => e.desc?.toLowerCase().includes(fs)) : loadInc();
  }

  let investimentos = [];
  if (showInvest) {
    investimentos = fs ? loadInv().filter(e => e.desc?.toLowerCase().includes(fs)) : loadInv();
  }

  // Unifica e ordena por data desc
  const unified = [
    ...gastos.map(e => ({ ...e, _tipo: 'gasto' })),
    ...receitas.map(e => ({ ...e, _tipo: 'receita' })),
    ...investimentos.map(e => ({ ...e, _tipo: 'investimento' })),
  ].sort((a, b) => (b.data || '').localeCompare(a.data || ''));

  _renderExtratoDesktop(unified);
  _renderExtratoMobile(unified);
}

function _renderExtratoDesktop(unified) {
  const tbody = document.getElementById('expenseTbody');
  if (!tbody) return;
  if (!unified.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty">Nenhum lançamento encontrado.</div></td></tr>';
    return;
  }
  tbody.innerHTML = unified.map(e => {
    let catCell = '', payCell = '', valColor = '', prefix = '';
    if (e._tipo === 'gasto') {
      catCell = catPill(e.cat);
      payCell = payPill(e.pay);
      valColor = 'var(--red)';
      prefix = '−';
    } else if (e._tipo === 'receita') {
      const c = e.tipo === 'banco' ? '#60b0ff' : '#40d090';
      const l = e.tipo === 'banco' ? 'Banco' : 'Dinheiro';
      catCell = `<span class="pill" style="background:${c}1a;color:${c}"><span class="pdot" style="background:${c}"></span>Receita</span>`;
      payCell = `<span class="pill" style="background:${c}1a;color:${c}"><span class="pdot" style="background:${c}"></span>${l}</span>`;
      valColor = 'var(--accent)';
      prefix = '+';
    } else {
      const { label, color } = _invMeta(e);
      catCell = `<span class="pill" style="background:${color}1a;color:${color}"><span class="pdot" style="background:${color}"></span>${label}</span>`;
      payCell = `<span class="pill extrato-inv-pill">Investimento</span>`;
      valColor = '#60b0ff';
      prefix = '↗';
    }
    const _editIco = typeof icon === 'function' ? icon('pencil','icon-sm') : '✎';
    const _delIco  = typeof icon === 'function' ? icon('x','icon-sm') : '×';
    const deleteBtn = e._tipo === 'gasto'
      ? `<button class="td-edit" onclick="openEditExpense(${e.id})" title="Editar">${_editIco}</button>
         <button class="td-del" onclick="deleteExpense(${e.id})">${_delIco}</button>`
      : e._tipo === 'receita'
      ? `<button class="td-edit" onclick="openEditIncome(${e.id})" title="Editar">${_editIco}</button>
         <button class="td-del" onclick="deleteIncome(${e.id})">${_delIco}</button>`
      : `<button class="td-edit" onclick="openEditInvestimento(${e.id})" title="Editar">${_editIco}</button>
         <button class="td-del" onclick="deleteInvestimento(${e.id})">${_delIco}</button>`;
    return `<tr>
      <td>${e.desc}${e._tipo === 'gasto' ? _typeBadge(e) : ''}</td>
      <td>${catCell}</td><td>${payCell}</td>
      <td class="td-date">${fmtDate(e.data)}</td>
      <td class="td-r" style="color:${valColor}">${prefix}${fmt(e.valor)}</td>
      <td>${deleteBtn}</td>
    </tr>`;
  }).join('');
}

function _invMeta(e) {
  const tipo  = e.tipo || 'outros';
  const INV_LABELS = {acoes:'Ações/FIIs',rendafixa:'Renda Fixa',tesouro:'Tesouro',cripto:'Cripto',poupanca:'Poupança',outros:'Outros'};
  const INV_COLS   = {acoes:'#40d090',rendafixa:'#60b0ff',tesouro:'#00d8ff',cripto:'#ffb040',poupanca:'#c080ff',outros:'#8888a0'};
  return { label: INV_LABELS[tipo]||tipo, color: INV_COLS[tipo]||'#888' };
}

function _renderExtratoMobile(unified) {
  const el = document.getElementById('mExpenseList');
  if (!el) return;
  if (!unified.length) {
    el.innerHTML = '<div class="m-empty">Nenhum lançamento encontrado.</div>';
    return;
  }
  el.innerHTML = unified.map(e => {
    let iconHtml, valColor, prefix, metaPill, delBtn;
    if (e._tipo === 'gasto') {
      iconHtml = isNeonTheme()
        ? `<span class="neon-cat-avatar">${catIconSVG(e.cat)}</span>`
        : `<span class="m-top-cat-dot" style="background:${catById(e.cat)?.color||'#888'}"></span>`;
      metaPill = catPill(e.cat) + payPill(e.pay);
      valColor = 'var(--red)'; prefix = '−';
      const _ei = typeof icon === 'function' ? icon('pencil','icon-sm') : '✎';
      const _di = typeof icon === 'function' ? icon('x','icon-sm') : '×';
      delBtn = `<button class="m-edit-btn" onclick="openEditExpense(${e.id})">${_ei}</button>
                <button class="m-del-btn" onclick="deleteExpense(${e.id})">${_di}</button>`;
    } else if (e._tipo === 'receita') {
      const c = e.tipo==='banco' ? '#60b0ff' : '#40d090';
      iconHtml = `<span class="m-top-cat-dot" style="background:${c}"></span>`;
      metaPill = `<span class="pill" style="background:${c}1a;color:${c};border-color:${c}40">Receita · ${e.tipo==='banco'?'Banco':'Dinheiro'}</span>`;
      valColor = 'var(--accent)'; prefix = '+';
      const _ei2 = typeof icon === 'function' ? icon('pencil','icon-sm') : '✎';
      const _di2 = typeof icon === 'function' ? icon('x','icon-sm') : '×';
      delBtn = `<button class="m-edit-btn" onclick="openEditIncome(${e.id})">${_ei2}</button>
                <button class="m-del-btn" onclick="deleteIncome(${e.id})">${_di2}</button>`;
    } else {
      const { label, color } = _invMeta(e);
      iconHtml = `<span class="m-top-cat-dot" style="background:${color}"></span>`;
      metaPill = `<span class="pill" style="background:${color}1a;color:${color};border-color:${color}40">${label}</span>`;
      valColor = '#60b0ff'; prefix = '↗';
      const _ei3 = typeof icon === 'function' ? icon('pencil','icon-sm') : '✎';
      const _di3 = typeof icon === 'function' ? icon('x','icon-sm') : '×';
      delBtn = `<button class="m-edit-btn" onclick="openEditInvestimento(${e.id})">${_ei3}</button>
                <button class="m-del-btn" onclick="deleteInvestimento(${e.id})">${_di3}</button>`;
    }
    return `<div class="m-exp-card">
      <div class="m-neon-card-head">
        ${iconHtml}
        <div style="flex:1;min-width:0">
          <div class="m-exp-desc">${e.desc}${e._tipo==='gasto'?_typeBadge(e):''}</div>
          <div class="m-exp-meta">${metaPill}</div>
        </div>
        <div class="m-exp-valor" style="color:${valColor}">${prefix}${fmt(e.valor)}</div>
      </div>
      <div class="m-exp-foot">
        <span class="m-exp-date">${fmtDate(e.data)}</span>
        <div style="display:flex;gap:4px">${delBtn}</div>
      </div>
    </div>`;
  }).join('');
}


// ── Renderizar tabela (desktop) e cards (mobile) ─────────────
function renderExpenses() {
  // Delega para renderExtrato que gerencia os tipos
  renderExtrato();
}

