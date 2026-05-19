const CACHE_NAME = 'noxyera-tech-v1'
const CACHED_ROUTES = ['/technicien/missions', '/technicien/profil']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CACHED_ROUTES)))
})

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)))
})
