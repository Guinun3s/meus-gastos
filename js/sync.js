// ============================================================
// js/sync.js — sincronização com o Firebase Firestore
// ============================================================

function scheduleSync() {
  setSyncStatus("syncing");
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(syncNow, 1500);
}

async function syncNow() {
  if (!_db || !_user) return;
  const payload = {
    expenses:  _cache.expenses,
    incomes:   _cache.incomes  || {},
    goals:     _cache.goals    || [],
    budgets:   _cache.budgets,
    cards:     _cache.cards    || [],
    updatedAt: new Date().toISOString(),
  };
  try {
    _syncing = true;
    await _db.collection("gastos").doc(_user.uid).set(payload);
    setSyncStatus("ok");
  } catch (e) {
    console.error("Sync error:", e);
    setSyncStatus("error");
  } finally {
    _syncing = false;
  }
}

function attachListener() {
  if (_unsubscribe) _unsubscribe();
  if (!_db || !_user) return;

  _unsubscribe = _db.collection("gastos").doc(_user.uid).onSnapshot(snap => {
    if (snap.exists && !_syncing) {
      const d = snap.data();
      _cache.expenses = d.expenses || {};
      _cache.incomes  = d.incomes  || {};
      _cache.budgets  = d.budgets  || {};
      _cache.goals    = d.goals    || [];
      _cache.cards    = d.cards    || [];
      render();
    }
    setSyncStatus("ok");
  }, () => setSyncStatus("error"));
}

async function loadUserData() {
  if (!_db || !_user) return;
  setSyncStatus("syncing");
  try {
    const snap = await _db.collection("gastos").doc(_user.uid).get();
    if (snap.exists) {
      const d = snap.data();
      _cache.expenses = d.expenses || {};
      _cache.incomes  = d.incomes  || {};
      _cache.budgets  = d.budgets  || {};
      _cache.goals    = d.goals    || [];
      _cache.cards    = d.cards    || [];
    }
    setSyncStatus("ok");
  } catch {
    setSyncStatus("error");
  }
  attachListener();
}
