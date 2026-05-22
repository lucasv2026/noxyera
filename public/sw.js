const CACHE_NAME = 'noxyera-tech-v1'
const CACHED_ROUTES = ['/technicien/missions', '/technicien/profil']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CACHED_ROUTES)))
})

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)))
})

// Push notification handler
self.addEventListener('push', (e) => {
  let data = { title: 'Noxyera', body: 'Nouvelle notification', url: '/technicien/missions' }

  if (e.data) {
    try {
      data = { ...data, ...e.data.json() }
    } catch {
      data.body = e.data.text()
    }
  }

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: { url: data.url ?? '/technicien/missions' },
      vibrate: [200, 100, 200],
    })
  )
})

// Notification click — focus or open the app
self.addEventListener('notificationclick', (e) => {
  e.notification.close()

  const targetUrl = (e.notification.data && e.notification.data.url)
    ? e.notification.data.url
    : '/technicien/missions'

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing window if open
      for (const client of clients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})
