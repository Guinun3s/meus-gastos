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
