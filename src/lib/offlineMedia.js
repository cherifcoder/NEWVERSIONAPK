/* ------------------------------------------------------------------
   offlineMedia.js — Gestionnaire de téléchargement hors-ligne
   ------------------------------------------------------------------
   Deux adaptateurs, choisis automatiquement :

   • Web / WebView (par défaut) : Cache Storage « method-media-v1 ».
     Les fichiers survivent au redémarrage de l'app, sont servis par le
     service worker (public/sw.js) et lus hors-ligne sans réseau.

   • Natif (APK Capacitor) : @capacitor/filesystem → répertoire Data de
     l'application. Le téléchargement est fait par le code natif
     (Filesystem.downloadFile), il ne bloque donc pas le thread JS et
     continue plus longtemps quand l'app passe en arrière-plan. Les
     fichiers vivent dans le stockage applicatif : ils résistent à
     l'éviction du cache navigateur et supportent des vidéos volumineuses.

   La file d'attente est persistée (localStorage) : un lot interrompu
   (app fermée, réseau coupé) reprend là où il s'était arrêté.
------------------------------------------------------------------- */

import { Capacitor } from '@capacitor/core'
import { Directory, Filesystem } from '@capacitor/filesystem'
import { cacheMedia, cacheAvailable, isMediaCached, removeCachedMedia } from './storage'

export const QUEUE_KEY = 'method.nonverbal.queue'
const NATIVE_DIR = 'method-media'
/** Marge de sécurité : on refuse un lot qui remplirait l'appareil à plus de 92 %. */
const QUOTA_HEADROOM = 0.92

export const isNative = () => {
  try {
    return Capacitor?.isNativePlatform?.() === true
  } catch {
    return false
  }
}

export const storageMode = () => {
  if (isNative()) return 'filesystem'
  if (cacheAvailable()) return 'cache'
  return 'unavailable'
}

/* --------------------------- Utilitaires --------------------------- */

export const absoluteUrl = (src) => {
  try {
    return new URL(src, typeof window !== 'undefined' ? window.location.href : 'https://localhost/').href
  } catch {
    return src
  }
}

const safeName = (src) => String(src).split('/').pop().split('?')[0] || 'media.bin'

/** Chemin natif d'un média : method-media/<mediaId>-<fichier>. */
const nativePath = (media) => `${NATIVE_DIR}/${media.id}-${safeName(media.src)}`

/* --------------------------- Capacité --------------------------- */

export const estimateQuota = async () => {
  try {
    if (!navigator.storage?.estimate) return null
    const { usage = 0, quota = 0 } = await navigator.storage.estimate()
    return { usage, quota, free: Math.max(0, quota - usage) }
  } catch {
    return null
  }
}

/**
 * Vérifie qu'il reste la place pour `bytes` (+ marge de sécurité).
 * Renvoie { ok, free, reason } — `reason` sert à expliquer le refus à l'utilisateur.
 */
export const hasRoomFor = async (bytes = 0) => {
  const est = await estimateQuota()
  if (!est) return { ok: true, free: null, reason: null }
  const usable = est.free * QUOTA_HEADROOM
  if (bytes > usable) {
    return {
      ok: false,
      free: est.free,
      reason: 'Espace insuffisant sur l\'appareil pour ce lot de leçons.',
    }
  }
  return { ok: true, free: est.free, reason: null }
}

/* --------------------------- Stockage natif --------------------------- */

const nativeExists = async (media) => {
  try {
    await Filesystem.stat({ path: nativePath(media), directory: Directory.Data })
    return true
  } catch {
    return false
  }
}

const nativeDownload = async (media, onProgress) => {
  let handle = null
  if (onProgress) {
    try {
      handle = await Filesystem.addListener('progress', (p) => {
        if (p.url?.includes(safeName(media.src))) {
          const pct = p.total > 0 ? Math.round((p.loaded / p.total) * 100) : 0
          onProgress(pct)
        }
      })
    } catch {
      handle = null
    }
  }
  try {
    const res = await Filesystem.downloadFile({
      url: absoluteUrl(media.src),
      path: nativePath(media),
      directory: Directory.Data,
      progress: Boolean(onProgress),
    })
    onProgress?.(100)
    const stat = await Filesystem.stat({ path: res.path || nativePath(media), directory: Directory.Data })
    return { bytes: Number(stat.size) || media.bytes || 0, path: res.path || nativePath(media) }
  } finally {
    handle?.remove?.()
  }
}

const nativeRemove = async (media) => {
  try {
    await Filesystem.deleteFile({ path: nativePath(media), directory: Directory.Data })
  } catch {
    /* déjà absent */
  }
}

const nativeSrc = (media) => {
  try {
    return Capacitor.convertFileSrc(nativePath(media))
  } catch {
    return absoluteUrl(media.src)
  }
}

/* ----------------------- Résolution d'une source ----------------------- */

const objectUrls = new Map()

/**
 * Renvoie une URL immédiatement lisible, hors-ligne si le média est stocké.
 * `stored` = info issue de l'état (state.nonverbal.downloads[media.id]).
 */
export const resolveMediaSrc = async (media, stored) => {
  if (!media) return null
  if (isNative()) {
    if (stored?.mode === 'filesystem' && (await nativeExists(media))) return nativeSrc(media)
    return absoluteUrl(media.src)
  }
  if (!cacheAvailable()) return media.src
  const cached = await isMediaCached(absoluteUrl(media.src))
  if (!cached) return media.src
  const key = media.id
  if (objectUrls.has(key)) return objectUrls.get(key)
  try {
    const cache = await caches.open('method-media-v1')
    const hit = await cache.match(absoluteUrl(media.src))
    const blob = await hit.blob()
    const url = URL.createObjectURL(blob)
    objectUrls.set(key, url)
    return url
  } catch {
    return media.src
  }
}

export const releaseObjectUrl = (mediaId) => {
  const url = objectUrls.get(mediaId)
  if (url) {
    URL.revokeObjectURL(url)
    objectUrls.delete(mediaId)
  }
}

/* --------------------------- Téléchargement --------------------------- */

export const isStored = async (media) => {
  if (isNative()) return nativeExists(media)
  if (!cacheAvailable()) return false
  return isMediaCached(absoluteUrl(media.src))
}

/**
 * Télécharge un média. Renvoie { bytes, mode, path? }.
 * Lève une erreur explicite si le stockage est indisponible.
 */
export const downloadMedia = async (media, onProgress) => {
  if (!media?.src) throw new Error('Média sans source')
  if (isNative()) {
    const { bytes, path } = await nativeDownload(media, onProgress)
    return { bytes, mode: 'filesystem', path }
  }
  if (!cacheAvailable()) throw new Error('Stockage hors-ligne indisponible dans ce contexte.')
  const { size } = await cacheMedia(absoluteUrl(media.src), onProgress)
  return { bytes: size || media.bytes || 0, mode: 'cache' }
}

export const removeMedia = async (media) => {
  releaseObjectUrl(media.id)
  if (isNative()) return nativeRemove(media)
  if (!cacheAvailable()) return false
  return removeCachedMedia(absoluteUrl(media.src))
}

/* --------------------------- File d'attente --------------------------- */

export const loadQueue = () => {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) : { pending: [], doneAt: null }
  } catch {
    return { pending: [], doneAt: null }
  }
}

export const saveQueue = (queue) => {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  } catch {
    /* quota localStorage — non bloquant */
  }
}

export const enqueue = (mediaIds) => {
  const q = loadQueue()
  const next = [...new Set([...(q.pending || []), ...mediaIds])]
  saveQueue({ ...q, pending: next })
  return next
}

export const dequeue = (mediaId) => {
  const q = loadQueue()
  const next = (q.pending || []).filter((id) => id !== mediaId)
  saveQueue({ ...q, pending: next, doneAt: next.length ? null : new Date().toISOString() })
  return next
}

/**
 * Télécharge une liste de médias, séquentiellement (le réseau mobile ne
 * supporte pas 8 requêtes parallèles). Signale chaque étape.
 *
 * @param {object[]} mediaList
 * @param {object}   cbs  { onItem(media, state, pct), onDone(media, info), onError(media, err), onBatch(pct) }
 * @param {object}   opts { skipStored: true, shouldStop: () => bool }
 */
export const downloadBatch = async (mediaList, cbs = {}, opts = {}) => {
  const { skipStored = true, shouldStop } = opts
  const list = mediaList.filter(Boolean)
  const total = list.length || 1
  const results = { ok: [], failed: [], skipped: [] }
  let index = 0

  for (const media of list) {
    if (shouldStop?.()) break
    // eslint-disable-next-line no-await-in-loop
    if (skipStored && (await isStored(media))) {
      results.skipped.push(media.id)
      index += 1
      cbs.onBatch?.(Math.round((index / total) * 100))
      cbs.onItem?.(media, 'done', 100)
      continue
    }

    cbs.onItem?.(media, 'downloading', 0)
    try {
      // eslint-disable-next-line no-await-in-loop
      const info = await downloadMedia(media, (pct) => cbs.onItem?.(media, 'downloading', pct))
      enqueue([media.id])
      dequeue(media.id)
      results.ok.push({ id: media.id, ...info })
      cbs.onDone?.(media, info)
      cbs.onItem?.(media, 'done', 100)
    } catch (err) {
      results.failed.push({ id: media.id, error: err?.message || 'échec' })
      cbs.onError?.(media, err)
      cbs.onItem?.(media, 'error', 0)
    }
    index += 1
    cbs.onBatch?.(Math.round((index / total) * 100))
  }

  saveQueue({ pending: [], doneAt: new Date().toISOString() })
  return results
}

/* --------------------------- État du lot --------------------------- */

/**
 * État de synchronisation d'un ensemble de médias (une leçon, une unité
 * ou tout le cours).
 *   ready    → tout est sur l'appareil
 *   partial  → une partie seulement
 *   missing  → rien n'est stocké
 *   outdated → stocké mais la version du contenu a changé
 */
export const bundleStatus = (mediaIds = [], downloads = {}, manifest = {}) => {
  const ids = mediaIds.filter(Boolean)
  let stored = 0
  let bytes = 0
  let storedBytes = 0
  let outdated = false

  ids.forEach((id) => {
    const m = manifest[id]
    const d = downloads[id]
    bytes += m?.bytes || 0
    if (d) {
      stored += 1
      storedBytes += d.bytes || m?.bytes || 0
      if (m?.version && d.version && m.version !== d.version) outdated = true
    }
  })

  let state = 'missing'
  if (ids.length && stored === ids.length) state = outdated ? 'outdated' : 'ready'
  else if (stored > 0) state = 'partial'

  return {
    state,
    stored,
    total: ids.length,
    bytes,
    storedBytes,
    pct: ids.length ? Math.round((stored / ids.length) * 100) : 0,
  }
}

export const STATUS_META = {
  ready: { label: 'Hors-ligne', tone: 'jade', icon: 'CheckCircle2' },
  partial: { label: 'Incomplet', tone: 'gold', icon: 'Download' },
  missing: { label: 'À télécharger', tone: 'slate', icon: 'HardDrive' },
  outdated: { label: 'Mise à jour', tone: 'sapphire', icon: 'RefreshCw' },
  downloading: { label: 'Téléchargement…', tone: 'sapphire', icon: 'Download' },
  error: { label: 'Échec', tone: 'blood', icon: 'AlertTriangle' },
}
