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
  // Atualiza compromissos só se o painel estiver visível
  const panel = document.getElementById('panel-compromissos');
  if (panel && panel.classList.contains('active')) renderCommitments();
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

  ['authEmail', 'authPass', 'authPassConfirm', 'authName'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleEmailAuth();
    });
  });

  ['desc', 'valor'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') addExpense();
    });
  });

  ['incDesc', 'incValor'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') addIncome();
    });
  });

  ['goalName', 'goalTarget', 'goalSaved'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') addGoal();
    });
  });

  const t = today();
  ['dataGasto', 'incData'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = t;
  });

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

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  initFirebase();
});
