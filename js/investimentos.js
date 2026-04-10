// ============================================================
// js/investimentos.js — investimentos como objeto independente
// Armazenados em _cache.investments[mKey()], igual às receitas
// ============================================================

const INV_TIPO_LABELS = {
  acoes:     'Ações / FIIs',
  rendafixa: 'Renda Fixa',
  tesouro:   'Tesouro Direto',
  cripto:    'Cripto',
  poupanca:  'Poupança',
  outros:    'Outros',
};

const INV_TIPO_COLORS = {
  acoes:     '#40d090',
  rendafixa: '#60b0ff',
  tesouro:   '#00d8ff',
  cripto:    '#ffb040',
  poupanca:  '#c080ff',
  outros:    '#8888a0',
};

// ── Adicionar (desktop) ───────────────────────────────────
function addInvestimento() {
  const desc  = (document.getElementById('invDesc')?.value || '').trim();
  const valor = parseFloat(document.getElementById('invValor')?.value || '');
  const tipo  = document.getElementById('invTipo')?.value || 'outros';
  const data  = document.getElementById('invData')?.value || today();

  if (!desc || !valor || valor <= 0) { toast('Preencha descrição e valor.'); return; }

  const inv = { id: Date.now(), desc, valor, data, tipo };
  const list = loadInv();
  list.unshift(inv);
  saveInv(list);

  if (document.getElementById('invDesc'))  document.getElementById('invDesc').value  = '';
  if (document.getElementById('invValor')) document.getElementById('invValor').value = '';
  if (document.getElementById('invData'))  document.getElementById('invData').value  = today();

  render();
  toast('Investimento adicionado!');
}

// ── Adicionar (mobile) ────────────────────────────────────
function saveInvestimentoMobile() {
  const desc  = (document.getElementById('mDesc')?.value || '').trim();
  const valor = parseFloat(document.getElementById('mValor')?.value || '');
  const tipo  = document.getElementById('mInvTipo')?.value || 'outros';
  const data  = document.getElementById('mDataGasto')?.value || today();

  if (!desc || !valor || valor <= 0) { toast('Preencha descrição e valor.'); return; }

  const inv = { id: Date.now(), desc, valor, data, tipo };
  const list = loadInv();
  list.unshift(inv);
  saveInv(list);

  closeSheet('sheetAdd');
  render();
  toast('Investimento adicionado!');
}

// ── Deletar ───────────────────────────────────────────────
function deleteInvestimento(id) {
  if (!confirm('Remover este investimento?')) return;
  saveInv(loadInv().filter(e => e.id !== id));
  render();
  toast('Removido.');
}

// ── Render ────────────────────────────────────────────────
function renderInvestimentos() {
  _renderInvestTable();
  _renderInvestMobile();
  _renderInvestSummary();
}

function _investCard(e) {
  const tipo  = e.tipo || 'outros';
  const label = INV_TIPO_LABELS[tipo] || tipo;
  const color = INV_TIPO_COLORS[tipo] || '#888';
  const neonIcon = isNeonTheme()
    ? `<div style="width:34px;height:34px;border-radius:10px;background:${color}20;display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <svg viewBox="0 0 16 16" fill="none" style="width:16px;height:16px">
          <path d="M2 12L6 8 9 10 14 4" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M11 4h3v3" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg></div>`
    : `<span class="pdot" style="background:${color}"></span>`;
  return { tipo, label, color, neonIcon };
}

function _renderInvestTable() {
  const tbody = document.getElementById('investTbody');
  if (!tbody) return;
  const list = loadInv();
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="empty">Nenhum investimento lançado este mês.</div></td></tr>';
    return;
  }
  tbody.innerHTML = list.map(e => {
    const { label, color } = _investCard(e);
    return `<tr>
      <td>${e.desc}</td>
      <td><span class="pill" style="background:${color}1a;color:${color}">
        <span class="pdot" style="background:${color}"></span>${label}</span></td>
      <td class="td-date">${fmtDate(e.data)}</td>
      <td class="td-r" style="color:var(--accent)">${fmt(e.valor)}</td>
      <td><button class="td-del" onclick="deleteInvestimento(${e.id})">×</button></td>
    </tr>`;
  }).join('');
}

function _renderInvestMobile() {
  const el = document.getElementById('mInvestList');
  if (!el) return;
  const list = loadInv();
  if (!list.length) {
    el.innerHTML = '<div class="m-empty">Nenhum investimento lançado este mês.</div>';
    return;
  }
  el.innerHTML = list.map(e => {
    const { label, color, neonIcon } = _investCard(e);
    return `<div class="m-exp-card">
      <div class="m-neon-card-head">
        ${neonIcon}
        <div style="flex:1;min-width:0">
          <div class="m-exp-desc">${e.desc}</div>
          <div class="m-exp-meta">
            <span class="pill" style="background:${color}1a;color:${color};border-color:${color}40">${label}</span>
          </div>
        </div>
        <div class="m-exp-valor" style="color:var(--accent)">${fmt(e.valor)}</div>
      </div>
      <div class="m-exp-foot">
        <span class="m-exp-date">${fmtDate(e.data)}</span>
        <button class="m-del-btn" onclick="deleteInvestimento(${e.id})">×</button>
      </div>
    </div>`;
  }).join('');
}

function _renderInvestSummary() {
  const el = document.getElementById('investSummary');
  if (!el) return;
  const list  = loadInv();
  const total = list.reduce((s, e) => s + e.valor, 0);
  if (!total) { el.innerHTML = ''; return; }
  const byTipo = {};
  list.forEach(e => { const t = e.tipo||'outros'; byTipo[t]=(byTipo[t]||0)+e.valor; });
  el.innerHTML = `
    <div class="inv-summary-total">Total investido: <strong>${fmt(total)}</strong></div>
    <div class="inv-summary-bars">
      ${Object.entries(byTipo).map(([t,v]) => {
        const pct = Math.round(v/total*100);
        const color = INV_TIPO_COLORS[t]||'#888';
        return `<div class="inv-bar-row">
          <span class="inv-bar-label" style="color:${color}">${INV_TIPO_LABELS[t]||t}</span>
          <div class="inv-bar-bg"><div style="width:${pct}%;background:${color};height:100%;border-radius:99px"></div></div>
          <span class="inv-bar-val">${fmt(v)}</span>
        </div>`;
      }).join('')}
    </div>`;
}

// ── Migração: converte cat='investimento' antigas para _cache.investments ──
function migrateInvestimentos() {
  let migrated = 0;
  Object.entries(_cache.expenses || {}).forEach(([key, list]) => {
    const toMigrate = (list || []).filter(e => e.cat === 'investimento');
    if (!toMigrate.length) return;
    // Move para investments
    if (!_cache.investments) _cache.investments = {};
    _cache.investments[key] = [
      ...(_cache.investments[key] || []),
      ...toMigrate.map(e => ({
        id: e.id, desc: e.desc, valor: e.valor, data: e.data,
        tipo: e.invTipo || 'outros'
      }))
    ];
    // Remove das expenses
    _cache.expenses[key] = list.filter(e => e.cat !== 'investimento');
    migrated += toMigrate.length;
  });
  if (migrated > 0) {
    scheduleSync();
    console.log(`[msd] Migrated ${migrated} investments to _cache.investments`);
  }
}
