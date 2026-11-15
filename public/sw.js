/* ------------------------------------------------------------------
   METHOD — Service Worker
   • Met en cache la coquille de l'application (app shell)
   • Sert les médias téléchargés depuis le Cache Storage « method-media-v1 »
   • Repli hors-ligne sur index.html pour la navigation
------------------------------------------------------------------- */

const SHELL_CACHE = 'method-shell-v1'
const MEDIA_CACHE = 'method-media-v1'
const SHELL_ASSETS = ['./', './index.html', './logo.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS).catch(() => undefined))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== SHELL_CACHE && k !== MEDIA_CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // 1. Médias explicitement téléchargés : cache-first strict (hors-ligne total)
  if (url.origin === self.location.origin && (url.pathname.includes('/media/') || request.destination === 'video' || request.destination === 'audio' || request.destination === 'image')) {
    event.respondWith(
      caches.open(MEDIA_CACHE).then(async (cache) => {
        const hit = await cache.match(request.url)
        if (hit) return hit
        try {
          const res = await fetch(request)
          return res
        } catch {
          return new Response('', { status: 504, statusText: 'Hors-ligne' })
        }
      }),
    )
    return
  }

  // 2. Navigation : réseau d'abord, repli sur le shell en cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(SHELL_CACHE).then((c) => c.put('./index.html', copy))
          return res
        })
        .catch(() => caches.match('./index.html')),
    )
    return
  }

  // 3. Assets statiques : cache-first puis réseau
  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit
      return fetch(request)
        .then((res) => {
          if (res.ok && url.origin === self.location.origin) {
            const copy = res.clone()
            caches.open(SHELL_CACHE).then((c) => c.put(request, copy))
          }
          return res
        })
        .catch(() => caches.match('./index.html'))
    }),
  )
})
