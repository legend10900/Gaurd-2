// GuardShield service worker - self-healing.
// Clears all stale caches and unregisters itself so the app always loads
// fresh assets from the server. No offline caching is needed for this web app.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),
      self.registration.unregister(),
    ]).then(() => self.clients.claim())
  );
});