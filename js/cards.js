// ============================================================
// js/cards.js — cartões de crédito: CRUD, faturas, limites
// ============================================================

const CARD_COLORS = [
  "#60a8f0", "#c8f060", "#f06060", "#f0b860",
  "#a888f0", "#50c8a0", "#f08860", "#e878c0"
];

let _selectedCardColor = CARD_COLORS[0];
let _editingCardId = null;

// ── Storage ───────────────────────────────────────────────────
function loadCards()     { return _cache.cards || []; }
function saveCards(list) { _cache.cards = list; scheduleSync(); }

// Gastos do mês em um cartão específico
function cardGastosMes(cardId, key) {
  const exps = _cache.expenses[key || mKey()] || [];
  return exps.filter(e => e.pay === "credito" && e.cardId === cardId)
             .reduce((s, e) => s + e.valor, 0);
}

// ── Formulário desktop ────────────────────────────────────────
function openCardForm(id) {
  _editingCardId = id || null;
  const card = id ? loadCards().find(c => c.id === id) : null;

  document.getElementById("cardFormTitle").textContent = card ? "Editar cartão" : "Novo cartão";
  document.getElementById("cardFormSubmit").textContent = card ? "Salvar" : "Criar cartão";
  document.getElementById("cardName").value    = card ? card.name    : "";
  document.getElementById("cardLimit").value   = card ? card.limit   : "";
  document.getElementById("cardClosing").value = card ? card.closing : "";
  document.getElementById("cardDue").value     = card ? card.due     : "";
  _selectedCardColor = card ? card.color : CARD_COLORS[0];
  _renderCardColorPicker("cardColorPicker");

  if (isMobile()) openSheet("sheetCard");
  else            openModal("modalCard");
}

function closeCardForm() {
  if (isMobile()) closeSheet("sheetCard");
  else            closeModal("modalCard");
}

function saveCard() {
  const name    = document.getElementById("cardName").value.trim();
  const limit   = parseFloat(document.getElementById("cardLimit").value);
  const closing = parseInt(document.getElementById("cardClosing").value);
  const due     = parseInt(document.getElementById("cardDue").value);

  if (!name)                          { toast("Informe o nome do cartão."); return; }
  if (isNaN(limit) || limit <= 0)     { toast("Informe o limite."); return; }
  if (isNaN(closing) || closing < 1 || closing > 31) { toast("Dia de fechamento inválido."); return; }
  if (isNaN(due)     || due < 1     || due > 31)     { toast("Dia de vencimento inválido."); return; }

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
  toast(_editingCardId ? "Cartão atualizado!" : "Cartão adicionado!");
  _editingCardId = null;
}

function deleteCard(id) {
  if (!confirm("Remover este cartão? Os lançamentos vinculados não serão apagados.")) return;
  saveCards(loadCards().filter(c => c.id !== id));
  renderCards();
  toast("Cartão removido.");
}

// Pagar fatura: cria despesa no mês atual com o total do cartão
function pagarFatura(cardId) {
  const card  = loadCards().find(c => c.id === cardId);
  if (!card) return;
  const total = cardGastosMes(cardId);
  if (total <= 0) { toast("Nenhum gasto neste cartão este mês."); return; }

  if (!confirm("Lançar pagamento de " + fmt(total) + " para a fatura do " + card.name + "?")) return;

  const list  = loadExp();
  const entry = {
    id: Date.now(),
    desc: "Fatura " + card.name,
    valor: total,
    cat: "divida",
    pay: "pix",
    data: today(),
    faturaCardId: cardId
  };
  list.push(entry);
  list.sort((a, b) => b.data.localeCompare(a.data));
  saveExp(list);
  render();
  toast("Fatura lançada!");
}

// ── Color picker ──────────────────────────────────────────────
function _renderCardColorPicker(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = CARD_COLORS.map(c =>
    "<div class=\"cpick-dot\" style=\"background:" + c + ";" +
    (c === _selectedCardColor ? "outline:2px solid #fff;outline-offset:2px" : "") +
    "\" onclick=\"_selectCardColor(this, '" + c + "')\">&nbsp;</div>"
  ).join("");
}

function _selectCardColor(el, color) {
  _selectedCardColor = color;
  el.closest(".color-picker").querySelectorAll(".cpick-dot")
    .forEach(d => d.style.outline = "");
  el.style.outline = "2px solid #fff";
  el.style.outlineOffset = "2px";
}

// ── Render principal ──────────────────────────────────────────
function renderCards() {
  _renderCardsDesk();
  _renderCardsMobile();
}

function _buildCardsHTML(cards) {
  if (!cards.length) {
    return "<div class=\"cm-empty\">Nenhum cartão cadastrado.<br>" +
           "<button class=\"btn-p\" style=\"margin-top:12px;font-size:12px\" onclick=\"openCardForm()\">+ Adicionar cartão</button></div>";
  }

  return cards.map(c => {
    const gasto = cardGastosMes(c.id);
    const pct   = c.limit > 0 ? Math.min(100, Math.round(gasto / c.limit * 100)) : 0;
    const disp  = c.limit - gasto;
    const danger = pct >= 90;

    return "<div class=\"cc-card\">" +
      "<div class=\"cc-header\" style=\"border-left:4px solid " + c.color + "\">" +
        "<div>" +
          "<div class=\"cc-name\">" + c.name + "</div>" +
          "<div class=\"cc-meta\">Fecha dia " + c.closing + " · Vence dia " + c.due + "</div>" +
        "</div>" +
        "<div style=\"display:flex;gap:4px\">" +
          "<button class=\"td-edit\" onclick=\"openCardForm(" + c.id + ")\">✎</button>" +
          "<button class=\"td-del\"  onclick=\"deleteCard(" + c.id + ")\">×</button>" +
        "</div>" +
      "</div>" +
      "<div class=\"cc-body\">" +
        "<div class=\"cc-valores\">" +
          "<div><div class=\"cc-val-label\">Utilizado</div>" +
              "<div class=\"cc-val\" style=\"color:" + (danger ? "var(--red)" : c.color) + "\">" + fmt(gasto) + "</div></div>" +
          "<div><div class=\"cc-val-label\">Disponível</div>" +
              "<div class=\"cc-val\" style=\"color:" + (disp < 0 ? "var(--red)" : "var(--accent)") + "\">" + fmt(Math.max(0, disp)) + "</div></div>" +
          "<div><div class=\"cc-val-label\">Limite</div>" +
              "<div class=\"cc-val\">" + fmt(c.limit) + "</div></div>" +
        "</div>" +
        "<div class=\"cc-bar-bg\"><div class=\"cc-bar-fill\" style=\"width:" + pct + "%;background:" +
          (danger ? "var(--red)" : c.color) + "\"></div></div>" +
        "<div class=\"cc-bar-label\">" + pct + "% do limite usado</div>" +
        (gasto > 0
          ? "<button class=\"cc-pay-btn\" onclick=\"pagarFatura(" + c.id + ")\">Lançar pagamento da fatura · " + fmt(gasto) + "</button>"
          : "") +
      "</div>" +
    "</div>";
  }).join("");
}

function _renderCardsDesk() {
  const el = document.getElementById("cardsListDesk");
  if (!el) return;
  el.innerHTML = _buildCardsHTML(loadCards());
}

function _renderCardsMobile() {
  const el = document.getElementById("cardsListM");
  if (!el) return;
  el.innerHTML = _buildCardsHTML(loadCards());
}
