// ============================================================
// js/commitments.js — painel de recorrentes e parcelamentos
// Varre todos os meses do cache para montar grupos únicos.
// ============================================================

// ── Coleta todos os grupos do cache ──────────────────────────
function _getAllRecurring() {
  const groups = {};
  Object.entries(_cache.expenses || {}).forEach(([key, list]) => {
    (list || []).forEach(e => {
      if (!e.recurringId) return;
      const id = e.recurringId;
      if (!groups[id]) {
        groups[id] = { id, desc: e.desc, valor: e.valor, cat: e.cat, pay: e.pay,
                       total: e.recurringTotal || 0, entries: [] };
      }
      groups[id].entries.push({ ...e, _key: key });
    });
  });
  // Ordena entradas por idx dentro de cada grupo
  Object.values(groups).forEach(g => g.entries.sort((a, b) => a.recurringIdx - b.recurringIdx));
  return Object.values(groups).sort((a, b) => b.id - a.id);
}

function _getAllInstallments() {
  const groups = {};
  Object.entries(_cache.expenses || {}).forEach(([key, list]) => {
    (list || []).forEach(e => {
      if (!e.installmentId) return;
      const id = e.installmentId;
      if (!groups[id]) {
        groups[id] = { id, desc: e.desc, cat: e.cat, pay: e.pay,
                       total: e.installmentTotal || 0,
                       valorTotal: e.installmentValorTotal || 0,
                       valorParcela: e.valor, entries: [] };
      }
      groups[id].entries.push({ ...e, _key: key });
    });
  });
  Object.values(groups).forEach(g => g.entries.sort((a, b) => a.installmentN - b.installmentN));
  return Object.values(groups).sort((a, b) => b.id - a.id);
}

// ── Helpers ───────────────────────────────────────────────────
function _nextEntry(entries) {
  const todayStr = today();
  return entries.find(e => e.data >= todayStr) || entries[entries.length - 1];
}

function _paidCount(entries) {
  const todayStr = today();
  return entries.filter(e => e.data < todayStr).length;
}

// Cancela recorrência a partir do índice atual ou futuro
function cancelRecurringFrom(rid, fromIdx) {
  _deleteRecurringFuture(rid, fromIdx);
  render();
  renderCommitments();
  toast('Recorrência cancelada.');
}

function cancelAllInstallments(iid) {
  if (!confirm('Remover todas as parcelas restantes?')) return;
  _deleteAllInstallments(iid);
  render();
  renderCommitments();
  toast('Parcelamento removido.');
}

// ── Render principal ──────────────────────────────────────────
function renderCommitments() {
  _renderCommitmentsDesk();
  _renderCommitmentsMobile();
}

function _buildRecurringHTML(groups) {
  if (!groups.length) return '<div class="cm-empty">Nenhuma recorrência ativa.</div>';

  return groups.map(g => {
    const cat      = catById(g.cat);
    const todayStr = today();
    const futureEntries = g.entries.filter(e => e.data >= todayStr);
    const next     = futureEntries.length ? futureEntries[0] : null;
    const paid     = _paidCount(g.entries);
    const remain   = futureEntries.length;
    const isActive = remain > 0;
    const pct      = g.total > 0 ? Math.round(paid / g.total * 100) : 0;
    const nextDate = next ? fmtDate(next.data) : '—';
    const statusTxt = isActive
      ? `${paid} de ${g.total} meses • próx. ${nextDate}`
      : `Encerrada — ${g.total} meses concluídos`;
    // Índice do primeiro entry futuro (para "cancelar a partir de agora")
    const firstFuture = futureEntries[0] || null;
    const cancelIdx = firstFuture ? firstFuture.recurringIdx : null;

    return `<div class="cm-card ${isActive ? '' : 'cm-done'}">
      <div class="cm-card-left">
        <div class="cm-dot" style="background:${cat.color}"></div>
        <div>
          <div class="cm-title">${g.desc}</div>
          <div class="cm-sub">${cat.name} · ${fmt(g.valor)}/mês</div>
          <div class="cm-status">${statusTxt}</div>
          ${g.total > 0 ? `<div class="cm-bar-bg"><div class="cm-bar-fill" style="width:${pct}%;background:${cat.color}"></div></div>` : ''}
        </div>
      </div>
      ${isActive && cancelIdx !== null
        ? `<button class="cm-cancel-btn" onclick="cancelRecurringFrom(${g.id}, ${cancelIdx})" title="Cancelar a partir de hoje">✕</button>`
        : ''}
    </div>`;
  }).join('');
}

function _buildInstallmentHTML(groups) {
  if (!groups.length) return '<div class="cm-empty">Nenhum parcelamento ativo.</div>';

  return groups.map(g => {
    const cat    = catById(g.cat);
    const paid   = _paidCount(g.entries);
    const remain = g.total - paid;
    const pct    = g.total > 0 ? Math.round(paid / g.total * 100) : 0;
    const next   = _nextEntry(g.entries);
    const nextDate = next ? fmtDate(next.data) : '—';
    const isActive = remain > 0;
    const statusTxt = isActive
      ? `${paid} de ${g.total} pagas · próx. ${nextDate}`
      : `Quitado — ${g.total} parcelas`;

    return `<div class="cm-card ${isActive ? '' : 'cm-done'}">
      <div class="cm-card-left">
        <div class="cm-dot" style="background:${cat.color}"></div>
        <div>
          <div class="cm-title">${g.desc}</div>
          <div class="cm-sub">${cat.name} · ${fmt(g.valorParcela)}/parcela · total ${fmt(g.valorTotal)}</div>
          <div class="cm-status">${statusTxt}</div>
          <div class="cm-bar-bg">
            <div class="cm-bar-fill" style="width:${pct}%;background:${cat.color}"></div>
          </div>
        </div>
      </div>
      ${isActive
        ? `<button class="cm-cancel-btn" onclick="cancelAllInstallments(${g.id})" title="Cancelar restantes">✕</button>`
        : ''}
    </div>`;
  }).join('');
}

function _renderCommitmentsDesk() {
  const recEl  = document.getElementById('cmRecurringDesk');
  const instEl = document.getElementById('cmInstallDesk');
  if (!recEl || !instEl) return;

  recEl.innerHTML  = _buildRecurringHTML(_getAllRecurring());
  instEl.innerHTML = _buildInstallmentHTML(_getAllInstallments());
}

function _renderCommitmentsMobile() {
  const recEl  = document.getElementById('cmRecurringM');
  const instEl = document.getElementById('cmInstallM');
  if (!recEl || !instEl) return;

  recEl.innerHTML  = _buildRecurringHTML(_getAllRecurring());
  instEl.innerHTML = _buildInstallmentHTML(_getAllInstallments());
}
