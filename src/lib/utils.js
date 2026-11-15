/* ------------------------------------------------------------------
   utils.js — helpers transverses
------------------------------------------------------------------- */

export const cx = (...parts) => parts.filter(Boolean).join(' ')

export const clamp = (n, min = 0, max = 100) => Math.min(max, Math.max(min, n))

export const uid = (prefix = 'id') =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

/** Date locale au format YYYY-MM-DD (jamais UTC : l'utilisateur vit dans son fuseau). */
export const dayKey = (date = new Date()) => {
  const d = new Date(date)
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export const addDays = (date, n) => {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export const daysBetween = (a, b) => {
  const d1 = new Date(`${a}T00:00:00`)
  const d2 = new Date(`${b}T00:00:00`)
  return Math.round((d2 - d1) / 86400000)
}

const FR_DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const FR_MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

export const formatLongDate = (date = new Date()) => {
  const d = new Date(date)
  return `${FR_DAYS[d.getDay()]} ${d.getDate()} ${FR_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export const formatShortDate = (date = new Date()) => {
  const d = new Date(date)
  return `${`${d.getDate()}`.padStart(2, '0')}/${`${d.getMonth() + 1}`.padStart(2, '0')}`
}

/** minutes -> "1h30" / "45m" */
export const formatMinutes = (min = 0) => {
  const m = Math.max(0, Math.round(min))
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const rest = m % 60
  return rest ? `${h}h${`${rest}`.padStart(2, '0')}` : `${h}h`
}

/** secondes -> "MM:SS" ou "H:MM:SS" */
export const formatClock = (totalSeconds = 0) => {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n) => `${n}`.padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
}

export const formatBytes = (bytes = 0) => {
  if (!bytes) return '—'
  const units = ['o', 'Ko', 'Mo', 'Go']
  let i = 0
  let v = bytes
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i += 1
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}

/** Générateur pseudo-aléatoire déterministe (même jour = même contenu). */
export const seededRandom = (seed) => {
  let h = 2166136261
  const str = String(seed)
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const pickSeeded = (array, seed) => {
  if (!array?.length) return null
  const rnd = seededRandom(seed)
  return array[Math.floor(rnd() * array.length)]
}

export const shuffle = (array) => {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const pct = (value, target) => (target > 0 ? clamp(Math.round((value / target) * 100)) : 0)

export const groupBy = (arr, keyFn) =>
  arr.reduce((acc, item) => {
    const k = keyFn(item)
    ;(acc[k] ||= []).push(item)
    return acc
  }, {})

export const sum = (arr, fn = (x) => x) => arr.reduce((t, x) => t + (fn(x) || 0), 0)

export const slugify = (s = '') =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
