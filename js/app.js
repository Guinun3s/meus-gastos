// ============================================================
// js/app.js — inicialização geral e render global
// ============================================================

function render() {
  renderSummary();
  renderExpenses();      // inclui extrato (gastos+receitas+investimentos)
  renderSidebar();
  renderBudget();
  checkBudgetAlerts();
  renderGoals();
  renderPrevisao();
  renderResumoSemanal();
  const panelComp = document.getElementById('panel-compromissos');
  if (panelComp && panelComp.classList.contains('active')) renderCommitments();
  const panelCard = document.getElementById('panel-cartoes');
  if (panelCard && panelCard.classList.contains('active')) renderCards();
  const panelGraf = document.getElementById('panel-graficos');
  if (panelGraf && panelGraf.classList.contains('active')) renderDowChart();
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

function showUpdateBanner() {
  const b = document.getElementById('updateBanner');
  if (b) b.style.display = 'flex';
}

function applyUpdate() {
  navigator.serviceWorker.ready.then(reg => {
    if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
  });
  // Se não houver waiting, recarrega direto
  setTimeout(() => window.location.reload(), 500);
}

document.addEventListener('DOMContentLoaded', () => {
  // Aplica tema salvo (garante _curTheme correto e ícones da nav)
  if (typeof loadSavedTheme === 'function') loadSavedTheme();
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
  ['dataGasto', 'incData', 'extInvData', 'invData'].forEach(id => {
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
    navigator.serviceWorker.register('./sw.js').then(reg => {

      // Detecta nova versão sendo instalada
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          // Novo SW instalado e aguardando — mostra banner
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner();
          }
        });
      });

      // Verifica se já há uma versão nova esperando (ex: aba reaberta)
      if (reg.waiting && navigator.serviceWorker.controller) {
        showUpdateBanner();
      }

    }).catch(() => {});

    // Quando o novo SW assume o controle, recarrega a página automaticamente
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  initFirebase();
  // Notificações inicializadas após Firebase (dados já carregados)
  setTimeout(initNotifications, 3000);
});
