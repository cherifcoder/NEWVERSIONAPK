/* ------------------------------------------------------------------
   storage.js — persistance 100 % locale (mémoire du téléphone)

   • localStorage  : état de l'application (léger, synchrone)
   • Cache Storage : médias téléchargés pour le mode hors-ligne
   Aucune donnée ne part sur un serveur. Export / Import JSON fournis.
------------------------------------------------------------------- */

export const STORAGE_KEY = 'method.state.v1'
export const BACKUP_KEY = 'method.state.backup'
export const MEDIA_CACHE = 'method-media-v1'

/* ---------------------------- État ---------------------------- */

export const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch (err) {
    console.error('[storage] lecture impossible', err)
    return null
  }
}

export const saveState = (state) => {
  try {
    const payload = JSON.stringify(state)
    localStorage.setItem(STORAGE_KEY, payload)
    return true
  } catch (err) {
    console.error('[storage] écriture impossible', err)
    return false
  }
}

/** Filet de sécurité : copie de secours horodatée (1 par jour). */
export const saveBackup = (state) => {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const raw = localStorage.getItem(BACKUP_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (parsed?.savedAt?.startsWith(today)) return
    localStorage.setItem(BACKUP_KEY, JSON.stringify({ savedAt: new Date().toISOString(), state }))
  } catch (err) {
    console.warn('[storage] backup ignoré', err)
  }
}

export const loadBackup = () => {
  try {
    const raw = localStorage.getItem(BACKUP_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const wipeAll = () => {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(BACKUP_KEY)
}

/* ------------------------- Export / Import ------------------------- */

export const buildExportPayload = (state) => ({
  app: 'METHOD — Incarne ton Futur Toi',
  schema: 1,
  exportedAt: new Date().toISOString(),
  device: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  state,
})

export const downloadJson = (filename, data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export const readJsonFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)))
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })

/** Fusionne un état importé avec l'état par défaut (tolérant aux versions). */
export const mergeImported = (imported, defaults) => {
  const incoming = imported?.state ?? imported
  if (!incoming || typeof incoming !== 'object') throw new Error('Fichier invalide')
  return {
    ...defaults,
    ...incoming,
    profile: { ...defaults.profile, ...(incoming.profile || {}) },
    settings: { ...defaults.settings, ...(incoming.settings || {}) },
    security: { ...defaults.security, ...(incoming.security || {}) },
    pillars: { ...defaults.pillars, ...(incoming.pillars || {}) },
    media: { ...defaults.media, ...(incoming.media || {}) },
    nonverbal: {
      ...(defaults.nonverbal || {}),
      ...(incoming.nonverbal || {}),
      progress: { ...(defaults.nonverbal?.progress || {}), ...(incoming.nonverbal?.progress || {}) },
      reviews: { ...(defaults.nonverbal?.reviews || {}), ...(incoming.nonverbal?.reviews || {}) },
      downloads: { ...(defaults.nonverbal?.downloads || {}), ...(incoming.nonverbal?.downloads || {}) },
      log: { ...(defaults.nonverbal?.log || {}), ...(incoming.nonverbal?.log || {}) },
    },
    hypnosis: {
      ...(defaults.hypnosis || {}),
      ...(incoming.hypnosis || {}),
      prefs: { ...(defaults.hypnosis?.prefs || {}), ...(incoming.hypnosis?.prefs || {}) },
      progress: { ...(defaults.hypnosis?.progress || {}), ...(incoming.hypnosis?.progress || {}) },
      downloads: { ...(defaults.hypnosis?.downloads || {}), ...(incoming.hypnosis?.downloads || {}) },
      log: { ...(defaults.hypnosis?.log || {}), ...(incoming.hypnosis?.log || {}) },
      journal: incoming.hypnosis?.journal || defaults.hypnosis?.journal || [],
    },
  }
}

/* ---------------------------- Médias ---------------------------- */

export const cacheAvailable = () =>
  typeof caches !== 'undefined' && typeof caches.open === 'function'

export const isMediaCached = async (url) => {
  if (!cacheAvailable()) return false
  try {
    const cache = await caches.open(MEDIA_CACHE)
    const hit = await cache.match(url)
    return Boolean(hit)
  } catch {
    return false
  }
}

export const cacheMedia = async (url, onProgress) => {
  if (!cacheAvailable()) throw new Error("Le stockage hors-ligne n'est pas disponible")
  const cache = await caches.open(MEDIA_CACHE)
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Téléchargement échoué (${res.status})`)
  const total = Number(res.headers.get('content-length') || 0)

  if (onProgress && res.body && total) {
    const reader = res.body.getReader()
    const chunks = []
    let received = 0
    for (;;) {
      // eslint-disable-next-line no-await-in-loop
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      received += value.length
      onProgress(Math.min(100, Math.round((received / total) * 100)))
    }
    const blob = new Blob(chunks)
    await cache.put(url, new Response(blob, { headers: res.headers }))
    return { size: blob.size }
  }

  await cache.put(url, res.clone())
  const stored = await cache.match(url)
  const size = Number(stored?.headers.get('content-length') || 0)
  onProgress?.(100)
  return { size }
}

export const removeCachedMedia = async (url) => {
  if (!cacheAvailable()) return false
  const cache = await caches.open(MEDIA_CACHE)
  return cache.delete(url)
}

export const listCachedUrls = async () => {
  if (!cacheAvailable()) return []
  try {
    const cache = await caches.open(MEDIA_CACHE)
    const keys = await cache.keys()
    return keys.map((k) => k.url)
  } catch {
    return []
  }
}

export const clearMediaCache = async () => {
  if (!cacheAvailable()) return
  await caches.delete(MEDIA_CACHE)
}

/**
 * Renvoie une URL exploitable hors-ligne : objet-URL du blob mis en cache
 * si présent, sinon l'URL d'origine.
 */
export const resolveMediaUrl = async (url) => {
  if (!cacheAvailable()) return url
  try {
    const cache = await caches.open(MEDIA_CACHE)
    const hit = await cache.match(url)
    if (!hit) return url
    const blob = await hit.blob()
    return URL.createObjectURL(blob)
  } catch {
    return url
  }
}

export const estimateStorage = async () => {
  try {
    if (!navigator.storage?.estimate) return null
    const { usage = 0, quota = 0 } = await navigator.storage.estimate()
    return { usage, quota }
  } catch {
    return null
  }
}
