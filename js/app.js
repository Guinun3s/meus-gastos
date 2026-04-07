// ============================================================
// js/app.js — inicialização geral e render global
// ============================================================

function render() {
  renderSummary();
  renderExpenses();
  renderIncomes();
  renderSidebar();
  renderBudget();
  renderGoals();
}

function fillCatSelects() {
  const opts = CATS.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  ['catSelect', 'mCatSelect', 'editCatSelect'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = opts;
  });
  document.getElementById('filterCat').innerHTML =
    '<option value="">Todas categorias</option>' + opts;
}

document.addEventListener('DOMContentLoaded', () => {
  initOverlayClose();
  buildGoalPickers();

  // Enter nos campos de login
  ['authEmail', 'authPass', 'authPassConfirm', 'authName'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleEmailAuth();
    });
  });

  // Enter nos campos de despesa (desktop)
  ['desc', 'valor'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') addExpense();
    });
  });

  // Enter nos campos de receita (desktop)
  ['incDesc', 'incValor'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') addIncome();
    });
  });

  // Enter nos campos de meta (desktop)
  ['goalName', 'goalTarget', 'goalSaved'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') addGoal();
    });
  });

  // Data padrão dos formulários
  const t = today();
  ['dataGasto', 'incData'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = t;
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

  // Registrar Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  initFirebase();
});
