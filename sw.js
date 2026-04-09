const CACHE = 'gastos-v8';

const SHELL = [
  './index.html',
  './manifest.json',
];

// Instala e pré-cria o cache com apenas o shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL))
  );
  // Não chama skipWaiting — o banner decide
});

// Remove caches antigos ao ativar
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Recebe sinal do app para ativar imediatamente
self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Firebase — nunca intercepta
  if (url.hostname.includes('firestore.googleapis.com') ||
      url.hostname.includes('firebase') ||
      url.hostname.includes('identitytoolkit') ||
      url.hostname.includes('securetoken') ||
      url.hostname.includes('gstatic.com')) return;

  const isLocal = url.hostname === self.location.hostname;
  const isFont  = url.hostname.includes('fonts.googleapis') ||
                  url.hostname.includes('fonts.gstatic') ||
                  url.hostname.includes('cdnjs.cloudflare');

  if (isLocal) {
    // Arquivos do próprio site → NETWORK-FIRST
    // Sempre busca a versão mais nova; usa cache só se offline
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  if (isFont) {
    // Fontes e libs externas → CACHE-FIRST (raramente mudam)
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }
});

// Abre o app ao clicar na notificação
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || './';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes('meus-gastos'));
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});
