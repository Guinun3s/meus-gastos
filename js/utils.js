// ============================================================
// js/utils.js — funções utilitárias e helpers de UI
// ============================================================

// ── Detecção de dispositivo ──────────────────────────────────
function isMobile() { return window.innerWidth < 768; }

// ── Formatação ───────────────────────────────────────────────
function fmt(v) {
  return 'R$ ' + Number(v).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtDate(d) {
  if (!d) return '—';
  const [, m, day] = d.split('-');
  return `${day}/${m}`;
}

function fmtMonthShort(year, month) {
  return capitalize(
    new Date(year, month, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
  );
}

function today() { return new Date().toISOString().slice(0, 10); }

function mName() {
  return new Date(curYear, curMonth, 1)
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ── Lookup de categoria ──────────────────────────────────────
function catById(id) { return CATS.find(c => c.id === id) || CATS.at(-1); }

// ── Chave do mês atual ───────────────────────────────────────
function mKey() { return `${curYear}_${curMonth}`; }

// ── Toast de notificação ─────────────────────────────────────
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2800);
}

// ── Modais e sheets ──────────────────────────────────────────
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function openSheet(id)  { document.getElementById(id).classList.add('open'); }
function closeSheet(id) { document.getElementById(id).classList.remove('open'); }

// ── Fechar ao clicar no fundo ────────────────────────────────
function initOverlayClose() {
  document.querySelectorAll('.modal-bg').forEach(bg =>
    bg.addEventListener('click', e => { if (e.target === bg) bg.classList.remove('open'); })
  );
  document.querySelectorAll('.sheet-bg').forEach(bg =>
    bg.addEventListener('click', e => { if (e.target === bg) bg.classList.remove('open'); })
  );
}

// ── Sync status dot ──────────────────────────────────────────
function setSyncStatus(s) {
  const dot = document.getElementById('syncDot');
  if (!dot) return;
  dot.setAttribute('data-s', s);
  dot.title = {
    syncing: 'Sincronizando...',
    ok:      '✓ Sincronizado',
    error:   'Erro de sincronização',
  }[s] || '';
}

// ── Renderização de pills com suporte a tema neon ─────────────
// Gera o HTML de uma pill de categoria
function catPill(catId) {
  const cat = catById(catId);
  if (isNeonTheme()) {
    return `<span class="pill neon-pill">
      <span class="neon-icon">${catIconSVG(catId)}</span>
      <span>${cat.name}</span>
    </span>`;
  }
  return `<span class="pill" style="background:${cat.color}1a;color:${cat.color}">
    <span class="pdot" style="background:${cat.color}"></span>${cat.name}
  </span>`;
}

// Gera o HTML de uma pill de pagamento
function payPill(payId) {
  const pc = PAY_COLORS[payId] || '#585860';
  const pl = PAY_LABELS[payId] || payId || '—';
  if (isNeonTheme()) {
    return `<span class="pill neon-pill">
      <span class="neon-icon">${payIconSVG(payId)}</span>
      <span>${pl}</span>
    </span>`;
  }
  return `<span class="pill" style="background:${pc}1a;color:${pc}">
    <span class="pdot" style="background:${pc}"></span>${pl}
  </span>`;
}

// Gera um dot/ícone de categoria para sidebar/home
function catDot(catId, color) {
  if (isNeonTheme()) {
    return `<span class="neon-sidebar-icon">${catIconSVG(catId)}</span>`;
  }
  return `<div class="bdot" style="background:${color}"></div>`;
}
