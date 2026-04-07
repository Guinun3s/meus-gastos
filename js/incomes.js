// ============================================================
// js/incomes.js — receitas: adicionar, editar, remover, listar
// ============================================================

const TIPO_LABELS = { banco: '💳 Banco', dinheiro: '💵 Dinheiro' };
const TIPO_COLORS = { banco: '#60a8f0', dinheiro: '#7ab648' };

// ── Adicionar (desktop) ──────────────────────────────────────
function addIncome() {
  const desc  = document.getElementById('incDesc').value.trim();
  const valor = parseFloat(document.getElementById('incValor').value);
  const tipo  = document.getElementById('incTipo').value;
  const data  = document.getElementById('incData').value || today();

  if (_addIncome(desc, valor, tipo, data)) {
    document.getElementById('incDesc').value  = '';
    document.getElementById('incValor').value = '';
  }
}

// ── Adicionar/Salvar (mobile sheet) ─────────────────────────
function saveIncomeMobile() {
  const desc  = document.getElementById('mIncDesc').value.trim();
  const valor = parseFloat(document.getElementById('mIncValor').value);
  const tipo  = document.getElementById('mIncTipo').value;
  const data  = document.getElementById('mIncData').value || today();

  if (_editingIncomeId !== null) {
    _updateIncome(_editingIncomeId, desc, valor, tipo, data);
    closeSheet('sheetIncome');
  } else {
    if (_addIncome(desc, valor, tipo, data)) {
      document.getElementById('mIncDesc').value  = '';
      document.getElementById('mIncValor').value = '';
      closeSheet('sheetIncome');
    }
  }
}

// ── Abrir sheet de adição (mobile) ───────────────────────────
function openAddIncomeSheet() {
  _editingIncomeId = null;
  document.getElementById('mIncDesc').value  = '';
  document.getElementById('mIncValor').value = '';
  document.getElementById('mIncData').value  = today();
  document.getElementById('mIncTipo').value  = 'banco';
  _setIncomeSheetMode('add');
  openSheet('sheetIncome');
}

// ── Abrir edição ─────────────────────────────────────────────
function openEditIncome(id) {
  const inc = loadInc().find(i => i.id === id);
  if (!inc) return;
  _editingIncomeId = id;

  if (isMobile()) {
    document.getElementById('mIncDesc').value  = inc.desc;
    document.getElementById('mIncValor').value = inc.valor;
    document.getElementById('mIncData').value  = inc.data;
    document.getElementById('mIncTipo').value  = inc.tipo;
    _setIncomeSheetMode('edit');
    openSheet('sheetIncome');
  } else {
    document.getElementById('editIncDesc').value  = inc.desc;
    document.getElementById('editIncValor').value = inc.valor;
    document.getElementById('editIncData').value  = inc.data;
    document.getElementById('editIncTipo').value  = inc.tipo;
    openModal('modalEditIncome');
  }
}

// ── Salvar edição (desktop modal) ────────────────────────────
function saveEditIncome() {
  const desc  = document.getElementById('editIncDesc').value.trim();
  const valor = parseFloat(document.getElementById('editIncValor').value);
  const tipo  = document.getElementById('editIncTipo').value;
  const data  = document.getElementById('editIncData').value || today();
  _updateIncome(_editingIncomeId, desc, valor, tipo, data);
  closeModal('modalEditIncome');
}

// ── Deletar ──────────────────────────────────────────────────
function deleteIncome(id) {
  if (!confirm('Remover esta receita?')) return;
  saveInc(loadInc().filter(i => i.id !== id));
  render();
  toast('Receita removida.');
}

// ── Helpers internos ─────────────────────────────────────────
function _addIncome(desc, valor, tipo, data) {
  if (!desc || isNaN(valor) || valor <= 0) {
    toast('Preencha descrição e valor.');
    return false;
  }
  const list  = loadInc();
  const entry = { id: Date.now(), desc, valor, tipo, data };
  list.push(entry);
  list.sort((a, b) => b.data.localeCompare(a.data));
  saveInc(list);
  render();
  toast('Receita adicionada!');
  return true;
}

function _updateIncome(id, desc, valor, tipo, data) {
  if (!desc || isNaN(valor) || valor <= 0) {
    toast('Preencha descrição e valor.');
    return;
  }
  const list = loadInc()
    .map(i => i.id === id ? { ...i, desc, valor, tipo, data } : i)
    .sort((a, b) => b.data.localeCompare(a.data));
  saveInc(list);
  _editingIncomeId = null;
  render();
  toast('Receita atualizada!');
}

function _setIncomeSheetMode(mode) {
  const titleEl = document.getElementById('sheetIncomeTitle');
  const btnEl   = document.getElementById('sheetIncomeBtn');
  if (titleEl) titleEl.textContent = mode === 'edit' ? 'Editar receita'    : 'Nova receita';
  if (btnEl)   btnEl.textContent   = mode === 'edit' ? 'Salvar alterações' : 'Adicionar receita';
}

// ── Renderizar tabela (desktop) e cards (mobile) ─────────────
function renderIncomes() {
  const list = loadInc();
  _renderIncomesDesktop(list);
  _renderIncomesMobile(list);
}

function _renderIncomesDesktop(list) {
  const tbody = document.getElementById('incomeTbody');
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="empty">Nenhuma receita lançada ainda.</div></td></tr>';
    return;
  }

  tbody.innerHTML = list.map(i => {
    const tc = TIPO_COLORS[i.tipo] || '#585860';
    const tl = TIPO_LABELS[i.tipo] || i.tipo;
    return `<tr>
      <td>${i.desc}</td>
      <td><span class="pill" style="background:${tc}1a;color:${tc}">
        <span class="pdot" style="background:${tc}"></span>${tl}</span></td>
      <td class="td-date">${fmtDate(i.data)}</td>
      <td class="td-r" style="color:var(--accent)">${fmt(i.valor)}</td>
      <td>
        <button class="td-edit" onclick="openEditIncome(${i.id})" title="Editar">✎</button>
        <button class="td-del"  onclick="deleteIncome(${i.id})"  title="Remover">×</button>
      </td>
    </tr>`;
  }).join('');
}

function _renderIncomesMobile(list) {
  const el = document.getElementById('mIncomeList');
  if (!el) return;

  if (!list.length) {
    el.innerHTML = '<div class="m-empty">💰 Nenhuma receita lançada.</div>';
    return;
  }

  el.innerHTML = list.map(i => {
    const tc = TIPO_COLORS[i.tipo] || '#585860';
    const tl = TIPO_LABELS[i.tipo] || i.tipo;
    return `<div class="m-exp-card">
      <div class="m-exp-desc">${i.desc}</div>
      <div class="m-exp-valor" style="color:var(--accent)">${fmt(i.valor)}</div>
      <div class="m-exp-meta">
        <span class="pill" style="background:${tc}1a;color:${tc}">
          <span class="pdot" style="background:${tc}"></span>${tl}</span>
      </div>
      <div class="m-exp-foot">
        <span class="m-exp-date">${fmtDate(i.data)}</span>
        <div style="display:flex;gap:4px">
          <button class="m-edit-btn" onclick="openEditIncome(${i.id})">✎</button>
          <button class="m-del-btn"  onclick="deleteIncome(${i.id})">×</button>
        </div>
      </div>
    </div>`;
  }).join('');
}
