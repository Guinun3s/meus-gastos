// ============================================================
// js/search.js — busca global por todos os meses
// ============================================================

let _searchOpen = false;
let _searchResults = [];
let _searchDebounce = null;

// ── Abrir / fechar ─────────────────────────────────────────
function openGlobalSearch() {
  _searchOpen = true;
  const overlay = document.getElementById('globalSearchOverlay');
  if (!overlay) return;
  overlay.classList.add('open');
  const inp = document.getElementById('globalSearchInput');
  if (inp) { inp.value = ''; inp.focus(); }
  _renderSearchResults([]);
}

function closeGlobalSearch() {
  _searchOpen = false;
  const overlay = document.getElementById('globalSearchOverlay');
  if (overlay) overlay.classList.remove('open');
}

// ── Input handler ──────────────────────────────────────────
function onGlobalSearchInput(val) {
  clearTimeout(_searchDebounce);
  const q = val.trim().toLowerCase();
  if (!q) { _renderSearchResults([]); return; }
  _searchDebounce = setTimeout(() => _doSearch(q), 180);
}

// ── Busca em todos os meses ────────────────────────────────
function _doSearch(q) {
  const results = [];
  const allExpMonths = _cache.expenses || {};
  const allIncMonths = _cache.incomes  || {};

  // Despesas
  Object.entries(allExpMonths).forEach(([key, list]) => {
    (list || []).forEach(e => {
      const match = e.desc?.toLowerCase().includes(q)
                 || catById(e.cat)?.name?.toLowerCase().includes(q)
                 || (PAY_LABELS[e.pay] || '').toLowerCase().includes(q)
                 || String(e.valor).includes(q);
      if (match) results.push({ ...e, _type: 'gasto', _monthKey: key });
    });
  });

  // Receitas
  Object.entries(allIncMonths).forEach(([key, list]) => {
    (list || []).forEach(e => {
      const match = e.desc?.toLowerCase().includes(q)
                 || (e.tipo || '').toLowerCase().includes(q)
                 || String(e.valor).includes(q);
      if (match) results.push({ ...e, _type: 'receita', _monthKey: key });
    });
  });

  // Ordena por data decrescente
  results.sort((a, b) => (b.data || '').localeCompare(a.data || ''));

  _searchResults = results;
  _renderSearchResults(results, q);
}

// ── Render dos resultados ──────────────────────────────────
function _renderSearchResults(results, q = '') {
  const el = document.getElementById('globalSearchResults');
  if (!el) return;

  if (!q) {
    el.innerHTML = `<div class="gs-empty">
      <div class="gs-empty-hint">Digite para buscar em todos os meses</div>
    </div>`;
    return;
  }

  if (!results.length) {
    el.innerHTML = `<div class="gs-empty">
      <div class="gs-empty-hint">Nenhum resultado para "<b>${_escHtml(q)}</b>"</div>
    </div>`;
    return;
  }

  const total = results.length;
  const shown = results.slice(0, 50); // máx 50 resultados

  el.innerHTML = `
    <div class="gs-count">${total} resultado${total !== 1 ? 's' : ''}${total > 50 ? ' (mostrando 50)' : ''}</div>
    <div class="gs-list">
      ${shown.map(e => _searchResultRow(e, q)).join('')}
    </div>`;
}

function _searchResultRow(e, q) {
  const isGasto = e._type === 'gasto';
  const cat = isGasto ? catById(e.cat) : null;
  const monthLabel = _monthKeyToLabel(e._monthKey);

  const iconHtml = isNeonTheme()
    ? (isGasto
        ? `<span class="gs-cat-icon">${catIconSVG(e.cat)}</span>`
        : `<span class="gs-inc-dot"></span>`)
    : `<span class="gs-dot" style="background:${isGasto ? (cat?.color || '#888') : 'var(--accent)'}"></span>`;

  const descHtml = _highlight(e.desc || '', q);
  const typeLabel = isGasto
    ? (cat?.name || e.cat)
    : ('Receita · ' + (e.tipo === 'banco' ? 'Banco' : 'Dinheiro'));

  const pill = isGasto ? `
    <span class="gs-pill" style="color:${cat?.color || 'var(--text2)'};border-color:${cat?.color || 'var(--border)'}40">
      ${cat?.name || e.cat}
    </span>` : `
    <span class="gs-pill gs-pill-income">Receita</span>`;

  const onClickNav = isGasto
    ? `onclick="closeGlobalSearch(); _navigateToEntry('${e._monthKey}', ${e.id}, 'gasto')"`
    : `onclick="closeGlobalSearch(); _navigateToEntry('${e._monthKey}', ${e.id}, 'receita')"`;

  return `<div class="gs-row" ${onClickNav}>
    ${iconHtml}
    <div class="gs-row-main">
      <div class="gs-row-desc">${descHtml}</div>
      <div class="gs-row-meta">${pill} <span class="gs-row-date">${fmtDate(e.data)} · ${monthLabel}</span></div>
    </div>
    <div class="gs-row-val ${isGasto ? 'gs-val-gasto' : 'gs-val-receita'}">${isGasto ? '-' : '+'}${fmt(e.valor)}</div>
  </div>`;
}

// ── Navegar até um lançamento de outro mês ─────────────────
function _navigateToEntry(monthKey, id, type) {
  // Extrai ano/mês da key (formato YYYY-MM)
  const [year, month] = monthKey.split('-').map(Number);
  if (!year || !month) return;

  // Navega para o mês correto
  curYear  = year;
  curMonth = month - 1; // 0-indexed
  render();

  // Pequeno delay para o DOM atualizar, então destaca a linha
  setTimeout(() => {
    if (type === 'receita') {
      switchTab('receitas', document.querySelector('.tab:nth-child(2)'));
    }
    // Destaca o item
    const rows = document.querySelectorAll(`[data-id="${id}"], .m-exp-card`);
    rows.forEach(r => {
      r.classList.add('gs-highlight');
      setTimeout(() => r.classList.remove('gs-highlight'), 2000);
    });
  }, 100);
}

// ── Utilitários ────────────────────────────────────────────
function _highlight(text, q) {
  if (!q || !text) return _escHtml(text);
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return _escHtml(text).replace(new RegExp(`(${escaped})`, 'gi'),
    '<mark class="gs-mark">$1</mark>');
}

function _escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function _monthKeyToLabel(key) {
  if (!key) return '';
  const [y, m] = key.split('-').map(Number);
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${months[m-1] || ''} de ${y}`;
}
