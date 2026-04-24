// ============================================================
// js/sync.js — sincronização com o Firebase Firestore
// ============================================================
// A persistência offline do Firestore (enablePersistence em auth.js)
// já enfileira escritas em IndexedDB automaticamente. Este módulo
// cuida do status visual e de não travar em escritas pendentes.

function _isOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

function scheduleSync() {
  if (!_isOffline()) setSyncStatus("syncing");
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(syncNow, 1500);
}

async function syncNow() {
  if (!_db || !_user) return;
  const payload = {
    expenses:  _cache.expenses,
    incomes:      _cache.incomes      || {},
    investments:  _cache.investments  || {},
    goals:     _cache.goals    || [],
    budgets:   _cache.budgets,
    cards:     _cache.cards    || [],
    updatedAt: new Date().toISOString(),
  };

  // Com persistência ativa, .set() escreve no cache local imediatamente
  // e só resolve no server após reconectar. Não bloqueamos _syncing
  // indefinidamente — liberamos assim que a escrita local foi aceita.
  _syncing = true;
  const writePromise = _db.collection("gastos").doc(_user.uid).set(payload);

  if (_isOffline()) {
    // Escrita aceita localmente; servidor resolverá ao reconectar.
    _syncing = false;
    setSyncStatus('offline');
    // Ainda ouvimos a promessa para limpar status quando voltar.
    writePromise
      .then(() => { if (!_isOffline()) setSyncStatus('ok'); })
      .catch(e => console.warn('[sync] write rejeitada:', e));
    return;
  }

  try {
    await writePromise;
    setSyncStatus("ok");
  } catch (e) {
    if (e && (e.code === 'unavailable' || _isOffline())) {
      setSyncStatus('offline');
    } else {
      console.error("Sync error:", e);
      setSyncStatus("error");
    }
  } finally {
    _syncing = false;
  }
}

function attachListener() {
  if (_unsubscribe) _unsubscribe();
  if (!_db || !_user) return;

  _unsubscribe = _db.collection("gastos").doc(_user.uid).onSnapshot(
    { includeMetadataChanges: true },
    snap => {
      if (snap.exists && !_syncing) {
        const d = snap.data();
        _cache.expenses = d.expenses || {};
        _cache.incomes      = d.incomes      || {};
        _cache.investments  = d.investments  || {};
        _cache.budgets      = d.budgets      || {};
        _cache.goals        = d.goals        || [];
        _cache.cards        = d.cards        || [];
        if (typeof migrateInvestimentos === 'function') migrateInvestimentos();
        render();
      }

      // Status baseado em metadata real do Firestore.
      const m = snap.metadata || {};
      if (_isOffline() || m.fromCache) {
        setSyncStatus(m.hasPendingWrites ? 'pending' : 'offline');
      } else if (m.hasPendingWrites) {
        setSyncStatus('pending');
      } else {
        setSyncStatus('ok');
      }
    },
    err => {
      if (_isOffline() || (err && err.code === 'unavailable')) {
        setSyncStatus('offline');
      } else {
        console.error('[sync] listener error:', err);
        setSyncStatus('error');
      }
    }
  );
}

async function loadUserData() {
  if (!_db || !_user) return;
  setSyncStatus(_isOffline() ? 'offline' : 'syncing');
  try {
    const snap = await _db.collection("gastos").doc(_user.uid).get();
    if (snap.exists) {
      const d = snap.data();
      _cache.expenses = d.expenses || {};
      _cache.incomes      = d.incomes      || {};
      _cache.investments  = d.investments  || {};
      _cache.budgets      = d.budgets      || {};
      _cache.goals        = d.goals        || [];
      _cache.cards        = d.cards        || [];
    }
    const fromCache = snap.metadata && snap.metadata.fromCache;
    setSyncStatus(fromCache || _isOffline() ? 'offline' : 'ok');
  } catch (e) {
    if (_isOffline() || (e && e.code === 'unavailable')) {
      setSyncStatus('offline');
    } else {
      console.error('[sync] loadUserData:', e);
      setSyncStatus('error');
    }
  }
  attachListener();
}
