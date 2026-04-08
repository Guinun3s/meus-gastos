// ============================================================
// js/notifications.js — push notifications + alertas de meta
// ============================================================

// ── Configurações (persistidas em localStorage) ───────────────
function _getNotifSettings() {
  try { return JSON.parse(localStorage.getItem('notifSettings') || '{}'); }
  catch { return {}; }
}
function _saveNotifSettings(s) {
  localStorage.setItem('notifSettings', JSON.stringify(s));
}

// ── Permissão ─────────────────────────────────────────────────
async function requestNotifPermission() {
  if (!('Notification' in window)) {
    toast('Seu navegador não suporta notificações.');
    return false;
  }
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') {
    toast('Notificações bloqueadas. Habilite nas configurações do browser.');
    return false;
  }
  const result = await Notification.requestPermission();
  return result === 'granted';
}

// ── Mostrar notificação via Service Worker ────────────────────
async function _showNotification(title, body, tag) {
  if (Notification.permission !== 'granted') return;
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body,
      icon:  './icon-192.png',
      badge: './icon-192.png',
      tag,
      renotify: false,
      data: { url: './' }
    });
  } catch {
    // Fallback para Notification API direta
    new Notification(title, { body, icon: './icon-192.png', tag });
  }
}

// ── Lembrete diário/semanal ───────────────────────────────────
function scheduleReminder() {
  const s = _getNotifSettings();
  if (!s.enabled || Notification.permission !== 'granted') return;

  const todayStr = today();
  const lastKey  = 'lastReminderDate';
  const lastShown = localStorage.getItem(lastKey) || '';

  // Verifica frequência
  if (s.freq === 'diario' && lastShown === todayStr) return;
  if (s.freq === 'semanal') {
    // Só mostra às segundas-feiras
    const dow = new Date().getDay();
    if (dow !== 1) return;
    const weekKey = _isoWeekKey(new Date());
    if (lastShown === weekKey) return;
    localStorage.setItem(lastKey, weekKey);
  }

  // Verifica se já tem gasto hoje
  const hasToday = (_cache.expenses[mKey()] || []).some(e => e.data === todayStr);
  if (hasToday) return;

  // Dispara após 8s (app já carregou)
  setTimeout(async () => {
    const msgs = {
      diario:  'Lembre-se de registrar seus gastos de hoje 💰',
      semanal: 'Início de semana: que tal revisar seus gastos? 📊'
    };
    await _showNotification(
      'meu $ dinheiro',
      msgs[s.freq] || msgs.diario,
      'reminder'
    );
    if (s.freq === 'diario') localStorage.setItem(lastKey, todayStr);
  }, 8000);
}

// ── Alerta de meta atingida ───────────────────────────────────
function checkGoalAlerts(goals) {
  const celebrated = JSON.parse(localStorage.getItem('celebratedGoals') || '[]');
  let changed = false;

  goals.forEach(g => {
    if (!g.target || g.saved < g.target) return;
    if (celebrated.includes(g.id)) return;

    // Toast imediato
    setTimeout(() => toast(`🎉 Meta "${g.name}" atingida! Parabéns!`), 300);

    // Push se habilitado
    _showNotification(
      '🎉 Meta atingida!',
      `Parabéns! Você concluiu a meta "${g.name}" de ${fmt(g.target)}!`,
      `goal-${g.id}`
    );

    celebrated.push(g.id);
    changed = true;
  });

  if (changed) localStorage.setItem('celebratedGoals', JSON.stringify(celebrated));
}

// ── Painel de configurações de notificação ────────────────────
function openNotifSettings() {
  const s    = _getNotifSettings();
  const perm = Notification.permission;

  document.getElementById('notifPermStatus').textContent =
    perm === 'granted' ? '✓ Permitido' :
    perm === 'denied'  ? '✗ Bloqueado' : 'Não solicitado';
  document.getElementById('notifPermStatus').style.color =
    perm === 'granted' ? 'var(--accent)' : 'var(--red)';

  document.getElementById('notifEnabled').checked = !!s.enabled;
  document.getElementById('notifFreq').value      = s.freq || 'diario';

  _updateNotifFormState();
  openModal('modalNotif');
}

function _updateNotifFormState() {
  const enabled = document.getElementById('notifEnabled').checked;
  document.getElementById('notifFreqRow').style.opacity = enabled ? '1' : '0.4';
  document.getElementById('notifFreqRow').style.pointerEvents = enabled ? '' : 'none';
}

async function saveNotifSettings() {
  const enabled = document.getElementById('notifEnabled').checked;

  if (enabled) {
    const granted = await requestNotifPermission();
    if (!granted) {
      document.getElementById('notifEnabled').checked = false;
      return;
    }
  }

  const s = {
    enabled,
    freq: document.getElementById('notifFreq').value
  };
  _saveNotifSettings(s);
  closeModal('modalNotif');
  toast(enabled ? 'Notificações ativadas!' : 'Notificações desativadas.');
}

// ── Inicialização ─────────────────────────────────────────────
function initNotifications() {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return;
  // Agenda lembrete após dados carregarem (chamado do loadUserData)
  scheduleReminder();
}
