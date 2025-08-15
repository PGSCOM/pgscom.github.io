const CACHE_NAME = 'pgscom-cache-v1';
const DEFAULT_PREFETCH = ['/vid/loop.mp4'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  // Intentar prefetch durante la instalación (no crítico si falla)
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        await Promise.all(DEFAULT_PREFETCH.map(async (url) => {
          const res = await fetch(url, { credentials: 'same-origin' });
          if (res && res.ok) await cache.put(url, res.clone());
        }));
      } catch (e) {
        // fallos no bloquean la instalación
        console.warn('Prefetch en install falló:', e);
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const reqUrl = new URL(event.request.url);
  // Interceptar la petición del vídeo y servir desde caché si está, o traer y cachear
  if (reqUrl.pathname === '/vid/loop.mp4') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match('/vid/loop.mp4');
        if (cached) return cached;
        try {
          const networkResp = await fetch(event.request);
          if (networkResp && networkResp.ok) {
            cache.put('/vid/loop.mp4', networkResp.clone()).catch(() => {});
          }
          return networkResp;
        } catch (e) {
          // Si todo falla, devolver un Response vacío o un fallback si lo tuvieras
          return new Response(null, { status: 503, statusText: 'Service Worker fetch failed' });
        }
      })
    );
  } else {
    // Para el resto, comportamiento por defecto: intentar red y cache como fallback
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => cached))
    );
  }
});

// Soporta mensaje para forzar prefetch de una URL desde la página
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data && data.type === 'PREFETCH_VIDEO' && data.url) {
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const resp = await fetch(data.url, { credentials: 'same-origin' });
        if (resp && resp.ok) await cache.put(data.url, resp.clone());
        // opcional: notificar clientes
        const clients = await self.clients.matchAll();
        clients.forEach((client) => client.postMessage({ type: 'PREFETCH_COMPLETE', url: data.url }));
      } catch (e) {
        console.warn('Prefetch via message falló:', e);
      }
    });
  }
});
