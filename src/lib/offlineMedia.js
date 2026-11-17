/* ------------------------------------------------------------------
   offlineMedia.js — Gestionnaire de téléchargement hors-ligne
   ------------------------------------------------------------------
   Deux adaptateurs, choisis automatiquement :

   • Web / WebView (par défaut) : Cache Storage « method-media-v1 ».
     Les fichiers survivent au redémarrage de l'app, sont servis par le
     service worker (public/sw.js) et lus hors-ligne sans réseau.

   • Natif (APK Capacitor) : les médias livrés dans l'APK (public/media/…)
     sont DÉJÀ dans les assets et lus directement par le WebView via
     https://localhost/… : ils sont hors-ligne par construction. On les
     marque simplement comme disponibles (mode « bundled »), sans copie.
     Seuls les médias réellement distants (autre origine, ex. videoUrl
     hébergée) passent par @capacitor/filesystem → répertoire Data.

     ⚠ Piège Capacitor : « https://localhost » n'est PAS un vrai serveur.
     Il n'est répondu que par le WebView (WebViewLocalServer, en cours de
     process). Un client HTTP natif comme Filesystem.downloadFile tente une
     vraie connexion TCP sur localhost:443, où rien n'écoute → échec. Il ne
     faut donc jamais envoyer une URL https://localhost à downloadFile.

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

const ABSOLUTE_URL_RE = /^[a-z][a-z0-9+.-]*:/i

/**
 * Un média « embarqué » est livré avec l'application elle-même : chemin
 * relatif, même origine que l'app, ou schéma local (data:/blob:/capacitor:).
 * Sur l'APK il est donc déjà dans les assets : rien à télécharger ni à
 * recopier, il est hors-ligne par construction.
 */
export const isBundledMedia = (media) => {
  const src = String(media?.src || '')
  if (!src) return false
  if (src.startsWith('data:') || src.startsWith('blob:')) return true
  if (!ABSOLUTE_URL_RE.test(src)) return true // chemin relatif → embarqué
  try {
    const base = typeof window !== 'undefined' ? window.location.href : 'https://localhost/'
    const url = new URL(src, base)
    if (url.protocol === 'capacitor:' || url.protocol === 'file:') return true
    if (typeof window !== 'undefined' && url.origin === window.location.origin) return true
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  } catch {
    return true
  }
}

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
  // Sur l'APK, l'espace disque est géré par le système de fichiers natif :
  // le quota annoncé par le WebView n'est pas représentatif (souvent 0) et
  // refuserait le téléchargement à tort. On laisse Android arbitrer.
  if (isNative()) return { ok: true, free: null, reason: null }
  const est = await estimateQuota()
  // Quota inconnu ou nul : on ne bloque pas, on laisse la requête trancher.
  if (!est || !est.quota) return { ok: true, free: null, reason: null }
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
    // Embarqué : l'URL https://localhost/… est servie par le WebView depuis
    // les assets de l'APK, donc lisible hors-ligne sans aucun téléchargement.
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

  // Sur l'APK, un média embarqué (chemin relatif / même origine) est déjà
  // dans les assets : le WebView le lit sans réseau. Inutile — et impossible —
  // de le faire télécharger par le code natif (https://localhost n'est pas un
  // vrai serveur). On le marque simplement comme disponible.
  if (isNative() && isBundledMedia(media)) {
    onProgress?.(100)
    return { bytes: media.bytes || 0, mode: 'bundled' }
  }

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
  if (isNative()) {
    // Un média embarqué vit dans l'APK : il n'y a rien à supprimer.
    if (isBundledMedia(media)) return true
    return nativeRemove(media)
  }
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

/* ----------------------- Export vers l'appareil ----------------------- */

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '')
    reader.onerror = () => reject(new Error('Lecture du fichier impossible'))
    reader.readAsDataURL(blob)
  })

/**
 * Enregistre un média SUR l'appareil, pour l'écouter dans un autre lecteur
 * (musique, lecteur vidéo) — c'est le bouton « Télécharger » de l'onglet
 * Hors-ligne.
 *
 *   • Web  : déclenche un téléchargement classique du navigateur.
 *   • Natif : lit les octets avec fetch (le WebView répond sur
 *     https://localhost — on n'utilise donc JAMAIS Filesystem.downloadFile,
 *     voir la note en tête de fichier), écrit le fichier dans le dossier
 *     Documents de l'app, puis propose le partage.
 *
 * Renvoie { mode, fileName, bytes, uri? }.
 */
export const saveMediaToDevice = async (media) => {
  if (!media?.src) throw new Error('Média sans source')
  const url = absoluteUrl(media.src)
  const fileName = media.fileName || safeName(media.src)

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fichier indisponible (${res.status})`)
  const blob = await res.blob()

  if (!isNative()) {
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(href), 60000)
    return { mode: 'download', fileName, bytes: blob.size }
  }

  const base64 = await blobToBase64(blob)
  const path = `METHOD/${fileName}`
  await Filesystem.writeFile({ path, data: base64, directory: Directory.Documents, recursive: true })
  const { uri } = await Filesystem.getUri({ path, directory: Directory.Documents })
  try {
    const { Share } = await import('@capacitor/share')
    await Share.share({ title: media.title || fileName, url: uri, dialogTitle: 'Garder le fichier' })
  } catch {
    /* le partage est un bonus, jamais une condition de réussite */
  }
  return { mode: 'filesystem', fileName, path, bytes: blob.size, uri }
}
