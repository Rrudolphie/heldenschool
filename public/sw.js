// Offline werken: bij het eerste bezoek worden alle bestanden bewaard.
// De lijst en de versie worden bij het bouwen ingevuld (zie vite.config.ts).
const CACHE = 'spider-sommen-__VERSIE__'
const BESTANDEN = '__BESTANDEN__'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(BESTANDEN)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return

  // de pagina zelf: eerst internet (dan komen updates binnen), anders de bewaarde versie
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('./', { ignoreSearch: true, ignoreVary: true })))
    return
  }

  // overige bestanden: eerst uit de cache
  // (ignoreVary: servers sturen soms 'Vary: Origin', dan zou de bewaarde versie niet passen)
  event.respondWith(caches.match(req, { ignoreSearch: true, ignoreVary: true }).then((hit) => hit || fetch(req)))
})
