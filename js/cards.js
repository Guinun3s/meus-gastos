// ============================================================
// js/cards.js — cartões de crédito: CRUD, faturas, limites
// ============================================================

const CARD_COLORS = [
  '#60a8f0', '#c8f060', '#f06060', '#f0b860',
  '#a888f0', '#50c8a0', '#f08860', '#e878c0'
];

let _selectedCardColor = CARD_COLORS[0];
let _editingCardId = null;

// ── Storage ───────────────────────────────────────────────────
function loadCards()     { return _cache.cards || []; }
function saveCards(list) { _cache.cards = list; scheduleSync(); }

function cardGastosMes(cardId, key) {
  const exps = _cache.expenses[key || mKey()] || [];
  return exps.filter(e => e.pay === 'credito' && e.cardId === cardId)
             .reduce((s, e) => s + e.valor, 0);
}

// ── Leitura dos campos (resolve IDs desktop vs mobile) ────────
function _cardField(baseId) {
  if (isMobile()) {
    const m = document.getElementById(baseId + 'M');
    if (m) return m;
  }
  return document.getElementById(baseId);
}

// ── Formulário ────────────────────────────────────────────────
function openCardForm(id) {
  _editingCardId = id || null;
  const card = id ? loadCards().find(c => c.id === id) : null;

  const title  = card ? 'Editar cartão' : 'Novo cartão';
  const submit = card ? 'Salvar'        : 'Criar cartão';

  // Preenche desktop
  const dTitle  = document.getElementById('cardFormTitle');
  const dSubmit = document.getElementById('cardFormSubmit');
  if (dTitle)  dTitle.textContent  = title;
  if (dSubmit) dSubmit.textContent = submit;
  const dName    = document.getElementById('cardName');
  const dLimit   = document.getElementById('cardLimit');
  const dClosing = document.getElementById('cardClosing');
  const dDue     = document.getElementById('cardDue');
  if (dName)    dName.value    = card ? card.name    : '';
  if (dLimit)   dLimit.value   = card ? card.limit   : '';
  if (dClosing) dClosing.value = card ? card.closing : '';
  if (dDue)     dDue.value     = card ? card.due     : '';

  // Preenche mobile
  const mTitle  = document.getElementById('cardFormTitleM');
  const mSubmit = document.getElementById('cardFormSubmitM');
  if (mTitle)  mTitle.textContent  = title;
  if (mSubmit) mSubmit.textContent = submit;
  const mName    = document.getElementById('cardNameM');
  const mLimit   = document.getElementById('cardLimitM');
  const mClosing = document.getElementById('cardClosingM');
  const mDue     = document.getElementById('cardDueM');
  if (mName)    mName.value    = card ? card.name    : '';
  if (mLimit)   mLimit.value   = card ? card.limit   : '';
  if (mClosing) mClosing.value = card ? card.closing : '';
  if (mDue)     mDue.value     = card ? card.due     : '';

  _selectedCardColor = card ? card.color : CARD_COLORS[0];
  _renderCardColorPicker('cardColorPicker');
  _renderCardColorPicker('cardColorPickerM');

  if (isMobile()) openSheet('sheetCard');
  else            openModal('modalCard');
}

function closeCardForm() {
  if (isMobile()) closeSheet('sheetCard');
  else            closeModal('modalCard');
}

function saveCard() {
  const name    = (_cardField('cardName')?.value    || '').trim();
  const limit   = parseFloat(_cardField('cardLimit')?.value);
  const closing = parseInt(_cardField('cardClosing')?.value);
  const due     = parseInt(_cardField('cardDue')?.value);

  if (!name)                           { toast('Informe o nome do cartão.'); return; }
  if (isNaN(limit) || limit <= 0)      { toast('Informe o limite.');         return; }
  if (isNaN(closing) || closing < 1 || closing > 31) { toast('Dia de fechamento inválido.'); return; }
  if (isNaN(due)     || due < 1     || due > 31)     { toast('Dia de vencimento inválido.'); return; }

  const cards = loadCards();
  if (_editingCardId !== null) {
    const idx = cards.findIndex(c => c.id === _editingCardId);
    if (idx > -1) cards[idx] = { ...cards[idx], name, limit, closing, due, color: _selectedCardColor };
  } else {
    cards.push({ id: Date.now(), name, limit, closing, due, color: _selectedCardColor });
  }
  saveCards(cards);
  closeCardForm();
  renderCards();
  toast(_editingCardId ? 'Cartão atualizado!' : 'Cartão adicionado!');
  _editingCardId = null;
}

function deleteCard(id) {
  if (!confirm('Remover este cartão? Os lançamentos vinculados não serão apagados.')) return;
  saveCards(loadCards().filter(c => c.id !== id));
  renderCards();
  toast('Cartão removido.');
}

function pagarFatura(cardId) {
  const card  = loadCards().find(c => c.id === cardId);
  if (!card) return;
  const total = cardGastosMes(cardId);
  if (total <= 0) { toast('Nenhum gasto neste cartão este mês.'); return; }
  if (!confirm(`Lançar pagamento de ${fmt(total)} para a fatura do ${card.name}?`)) return;

  const list  = loadExp();
  const entry = {
    id: Date.now(),
    desc: `Fatura ${card.name}`,
    valor: total,
    cat: 'divida',
    pay: 'pix',
    data: today(),
    faturaCardId: cardId
  };
  list.push(entry);
  list.sort((a, b) => b.data.localeCompare(a.data));
  saveExp(list);
  render();
  toast('Fatura lançada!');
}

// ── Color picker ──────────────────────────────────────────────
function _renderCardColorPicker(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = CARD_COLORS.map(c => {
    const active = c === _selectedCardColor ? 'outline:2px solid #fff;outline-offset:2px;' : '';
    return `<div class="cpick-dot" style="background:${c};${active}" onclick="_selectCardColor(this,'${c}')">&nbsp;</div>`;
  }).join('');
}

function _selectCardColor(el, color) {
  _selectedCardColor = color;
  // Atualiza ambos os pickers
  ['cardColorPicker', 'cardColorPickerM'].forEach(pid => {
    const picker = document.getElementById(pid);
    if (picker) picker.querySelectorAll('.cpick-dot').forEach(d => {
      d.style.outline = '';
      d.style.outlineOffset = '';
    });
  });
  el.style.outline = '2px solid #fff';
  el.style.outlineOffset = '2px';
}

// ── Render ────────────────────────────────────────────────────
function renderCards() {
  const html = _buildCardsHTML(loadCards());
  const d = document.getElementById('cardsListDesk');
  const m = document.getElementById('cardsListM');
  if (d) d.innerHTML = html;
  if (m) m.innerHTML = html;
}

function _buildCardsHTML(cards) {
  if (!cards.length) {
    return `<div class="cm-empty">Nenhum cartão cadastrado.<br>
      <button class="btn-p" style="margin-top:12px;font-size:12px" onclick="openCardForm()">+ Adicionar cartão</button>
    </div>`;
  }

  return cards.map(c => {
    const gasto  = cardGastosMes(c.id);
    const pct    = c.limit > 0 ? Math.min(100, Math.round(gasto / c.limit * 100)) : 0;
    const disp   = c.limit - gasto;
    const danger = pct >= 90;
    const barColor  = danger ? 'var(--red)' : c.color;
    const usedColor = danger ? 'var(--red)' : c.color;
    const dispColor = disp < 0 ? 'var(--red)' : 'var(--accent)';

    return `
<div class="cc-card">
  <div class="cc-header" style="border-left:4px solid ${c.color}">
    <div>
      <div class="cc-name">${c.name}</div>
      <div class="cc-meta">Fecha dia ${c.closing} · Vence dia ${c.due}</div>
    </div>
    <div style="display:flex;gap:4px">
      <button class="td-edit" onclick="openCardForm(${c.id})">✎</button>
      <button class="td-del"  onclick="deleteCard(${c.id})">×</button>
    </div>
  </div>
  <div class="cc-body">
    <div class="cc-valores">
      <div>
        <div class="cc-val-label">Utilizado</div>
        <div class="cc-val" style="color:${usedColor}">${fmt(gasto)}</div>
      </div>
      <div>
        <div class="cc-val-label">Disponível</div>
        <div class="cc-val" style="color:${dispColor}">${fmt(Math.max(0, disp))}</div>
      </div>
      <div>
        <div class="cc-val-label">Limite</div>
        <div class="cc-val">${fmt(c.limit)}</div>
      </div>
    </div>
    <div class="cc-bar-bg">
      <div class="cc-bar-fill" style="width:${pct}%;background:${barColor}"></div>
    </div>
    <div class="cc-bar-label">${pct}% do limite usado</div>
    ${gasto > 0 ? `<button class="cc-pay-btn" onclick="pagarFatura(${c.id})">Lançar pagamento da fatura · ${fmt(gasto)}</button>` : ''}
  </div>
</div>`;
  }).join('');
}
