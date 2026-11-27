/* Guarda la app en el equipo para que abra rápido y sin conexión.
   Siempre intenta traer la versión nueva primero; si no hay internet, usa la guardada. */
const VERSION = 'cuentas-f4d3db4026';
const BASE = ['./', 'index.html', 'plataforma.js', 'vendor/supabase.js', 'vendor/jspdf.umd.min.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png', 'icons/logo-emotion.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return; // Supabase, Google, fuentes: directo a internet
  e.respondWith(
    fetch(r).then(res => {
      if (res && res.ok) { const copia = res.clone(); caches.open(VERSION).then(c => c.put(r, copia)); }
      return res;
    }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || (r.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});

/* Avisos (Web Push): los manda la función "avisos" de Supabase cada mañana */
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { titulo: e.data ? e.data.text() : 'Cuentas' }; }
  e.waitUntil(self.registration.showNotification(d.titulo || 'Cuentas', {
    body: d.cuerpo || '', tag: d.tag || undefined, data: { url: d.url || './' },
    icon: 'icons/icon-192.png', badge: 'icons/icon-192.png'
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    const c = cs.find(x => x.url.startsWith(self.registration.scope));
    if (c) { c.postMessage({ tipo: 'abrir', url }); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
