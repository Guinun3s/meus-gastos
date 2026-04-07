// ============================================================
// js/app.js — inicialização geral e render global
// Ponto de entrada após todos os outros módulos carregarem.
// ============================================================

// ── Render global: atualiza todas as seções visíveis ─────────
function render() {
  renderSummary();
  renderExpenses();
  renderSidebar();
  renderBudget();
  renderGoals();
}

// ── Preenche todos os <select> de categoria ──────────────────
function fillCatSelects() {
  const opts = CATS.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  // Selects de adicionar/editar
  ['catSelect', 'mCatSelect', 'editCatSelect'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = opts;
  });

  // Select de filtro
  document.getElementById('filterCat').innerHTML =
    '<option value="">Todas categorias</option>' + opts;
}

// ── Inicialização ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Fechar modais/sheets ao clicar no fundo
  initOverlayClose();

  // Monta os pickers de ícone e cor das metas
  buildGoalPickers();

  // Enter no formulário de login
  ['authEmail', 'authPass', 'authPassConfirm', 'authName'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleEmailAuth();
    });
  });

  // Enter nos campos de lançamento (desktop)
  ['desc', 'valor'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') addExpense();
    });
  });

  // Enter nos campos da meta (desktop)
  ['goalName', 'goalTarget', 'goalSaved'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') addGoal();
    });
  });

  // Swipe down para fechar sheets (mobile)
  document.querySelectorAll('.sheet').forEach(sheet => {
    let startY = 0;
    sheet.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
    sheet.addEventListener('touchend', e => {
      const dy = e.changedTouches[0].clientY - startY;
      if (dy > 80 && sheet.scrollTop === 0) {
        sheet.closest('.sheet-bg')?.classList.remove('open');
      }
    }, { passive: true });
  });

  // Registrar Service Worker (PWA offline)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // Inicializa Firebase (que por sua vez controla qual tela exibir)
  initFirebase();
});
