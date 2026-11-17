/* ------------------------------------------------------------------
   hypnosisAudio.js — Moteur audio des séances d'hypnose
   ------------------------------------------------------------------
   Tout se passe dans le navigateur / le WebView, sans réseau et sans
   fichier temporaire :

   • Ambiance  : boucle WAV embarquée (public/media/hypnosis/ambience),
                 décodée en mémoire et lue en boucle via Web Audio.
   • Battement binaural : deux oscillateurs (gauche / droite) décalés de
                 quelques hertz → l'effet n'existe qu'au casque.
   • Repères  : cloche, gong, bol, souffle — fichiers embarqués, avec
                 repli sur une synthèse Web Audio si le chargement échoue.
   • Voix     : synthèse vocale du système (speechSynthesis), en français.
                 Si elle est absente, la séance se lit silencieusement.

   Le graphe : chaque source → son gain → master → sortie.
------------------------------------------------------------------- */

let ctx = null
let master = null

const runtime = {
  buffers: new Map(),
  ambience: null, // { source, gain, url }
  binaural: null, // { oscL, oscR, gain }
  voicesReady: false,
}

const hasWebAudio = () =>
  typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)

export const audioSupported = () => Boolean(hasWebAudio())

/** Crée (une fois) le contexte audio et le gain maître. */
const ensureContext = () => {
  if (ctx) return ctx
  if (!hasWebAudio()) return null
  const Ctor = window.AudioContext || window.webkitAudioContext
  ctx = new Ctor()
  master = ctx.createGain()
  master.gain.value = 0.85
  master.connect(ctx.destination)
  return ctx
}

/**
 * À appeler sur un geste utilisateur (clic « Démarrer ») : les navigateurs
 * et WebView suspendent l'audio tant qu'aucune interaction n'a eu lieu.
 */
export const primeAudio = async () => {
  const c = ensureContext()
  if (!c) return false
  try {
    if (c.state === 'suspended') await c.resume()
  } catch {
    /* ignoré : l'utilisateur réessaiera */
  }
  return c.state === 'running'
}

export const audioState = () => (ctx ? ctx.state : 'closed')

/* ------------------------- Chargement de fichiers ------------------------- */

export const loadBuffer = async (url) => {
  const c = ensureContext()
  if (!c || !url) return null
  if (runtime.buffers.has(url)) return runtime.buffers.get(url)
  try {
    const res = await fetch(url, { cache: 'force-cache' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const raw = await res.arrayBuffer()
    const buffer = await c.decodeAudioData(raw.slice(0))
    runtime.buffers.set(url, buffer)
    return buffer
  } catch (err) {
    console.warn('[hypnose] audio illisible', url, err?.message)
    return null
  }
}

export const preload = (urls = []) => Promise.all(urls.filter(Boolean).map((u) => loadBuffer(u)))

/* --------------------------- Volume maître --------------------------- */

export const setMasterVolume = (value, fadeSec = 0.3) => {
  const c = ensureContext()
  if (!c || !master) return
  const v = Math.max(0, Math.min(1, value))
  try {
    master.gain.cancelScheduledValues(c.currentTime)
    master.gain.setValueAtTime(master.gain.value, c.currentTime)
    master.gain.linearRampToValueAtTime(v, c.currentTime + Math.max(0.01, fadeSec))
  } catch {
    master.gain.value = v
  }
}

/* ----------------------------- Ambiance ----------------------------- */

export const startAmbience = async (url, { gain = 0.5, fade = 2 } = {}) => {
  const c = ensureContext()
  if (!c || !url) return false
  stopAmbience({ fade: 0.4 })
  const buffer = await loadBuffer(url)
  if (!buffer) return false
  const source = c.createBufferSource()
  source.buffer = buffer
  source.loop = true
  const g = c.createGain()
  g.gain.value = 0
  source.connect(g)
  g.connect(master)
  const now = c.currentTime
  g.gain.linearRampToValueAtTime(Math.max(0, gain), now + fade)
  source.start(now)
  runtime.ambience = { source, gain: g, url }
  return true
}

export const stopAmbience = ({ fade = 2 } = {}) => {
  const a = runtime.ambience
  if (!a || !ctx) return
  runtime.ambience = null
  try {
    const now = ctx.currentTime
    a.gain.gain.cancelScheduledValues(now)
    a.gain.gain.setValueAtTime(a.gain.gain.value, now)
    a.gain.gain.linearRampToValueAtTime(0, now + Math.max(0.05, fade))
    a.source.stop(now + Math.max(0.1, fade) + 0.05)
  } catch {
    try {
      a.source.stop()
    } catch {
      /* déjà arrêté */
    }
  }
}

export const ambienceRunning = () => Boolean(runtime.ambience)

/* -------------------------- Battement binaural -------------------------- */

export const startBinaural = ({ carrier = 200, beat = 8, gain = 0.12, fade = 2 } = {}) => {
  const c = ensureContext()
  if (!c) return false
  stopBinaural({ fade: 0.3 })
  const now = c.currentTime
  const g = c.createGain()
  g.gain.value = 0
  g.connect(master)

  const oscL = c.createOscillator()
  oscL.type = 'sine'
  oscL.frequency.value = carrier
  const panL = c.createStereoPanner ? c.createStereoPanner() : null
  if (panL) {
    panL.pan.value = -1
    oscL.connect(panL)
    panL.connect(g)
  } else {
    oscL.connect(g)
  }

  const oscR = c.createOscillator()
  oscR.type = 'sine'
  oscR.frequency.value = carrier + beat
  const panR = c.createStereoPanner ? c.createStereoPanner() : null
  if (panR) {
    panR.pan.value = 1
    oscR.connect(panR)
    panR.connect(g)
  } else {
    oscR.connect(g)
  }

  g.gain.linearRampToValueAtTime(Math.max(0, gain), now + fade)
  oscL.start(now)
  oscR.start(now)
  runtime.binaural = { oscL, oscR, gain: g }
  return true
}

export const stopBinaural = ({ fade = 1.5 } = {}) => {
  const b = runtime.binaural
  if (!b || !ctx) return
  runtime.binaural = null
  try {
    const now = ctx.currentTime
    b.gain.gain.cancelScheduledValues(now)
    b.gain.gain.setValueAtTime(b.gain.gain.value, now)
    b.gain.gain.linearRampToValueAtTime(0, now + Math.max(0.05, fade))
    b.oscL.stop(now + Math.max(0.1, fade) + 0.05)
    b.oscR.stop(now + Math.max(0.1, fade) + 0.05)
  } catch {
    /* ignoré */
  }
}

export const binauralRunning = () => Boolean(runtime.binaural)

/* ---------------------------- Repères sonores ---------------------------- */

/** Cloche de secours, synthétisée (si le fichier ne charge pas). */
export const synthChime = (freq = 880, { gain = 0.35, seconds = 2.6 } = {}) => {
  const c = ensureContext()
  if (!c) return
  const now = c.currentTime
  const g = c.createGain()
  g.gain.value = gain
  g.connect(master)
  const partials = [
    { m: 1, g: 1, d: 2.4 },
    { m: 2.76, g: 0.5, d: 3.6 },
    { m: 5.4, g: 0.2, d: 5 },
  ]
  partials.forEach((p) => {
    const o = c.createOscillator()
    o.type = 'sine'
    o.frequency.value = freq * p.m
    const pg = c.createGain()
    pg.gain.setValueAtTime(p.g, now)
    pg.gain.exponentialRampToValueAtTime(0.0001, now + p.d)
    o.connect(pg)
    pg.connect(g)
    o.start(now)
    o.stop(now + p.d + 0.05)
  })
  setTimeout(() => {
    try {
      g.disconnect()
    } catch {
      /* ignoré */
    }
  }, (seconds + 4) * 1000)
}

/**
 * Joue un repère sonore embarqué. Repli automatique sur la cloche
 * synthétisée si le fichier est indisponible (hors-ligne, format refusé…).
 */
export const playCue = async (url, { gain = 0.6 } = {}) => {
  const c = ensureContext()
  if (!c) return false
  const buffer = url ? await loadBuffer(url) : null
  if (!buffer) {
    synthChime()
    return false
  }
  try {
    const source = c.createBufferSource()
    source.buffer = buffer
    const g = c.createGain()
    g.gain.value = gain
    source.connect(g)
    g.connect(master)
    source.start()
    return true
  } catch {
    synthChime()
    return false
  }
}

/* ------------------------------ Voix (TTS) ------------------------------ */

export const ttsSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

const frenchVoice = () => {
  if (!ttsSupported()) return null
  const voices = window.speechSynthesis.getVoices() || []
  return (
    voices.find((v) => /^fr[-_]/i.test(v.lang) && /google|natural|siri|premium/i.test(v.name)) ||
    voices.find((v) => /^fr[-_]/i.test(v.lang)) ||
    null
  )
}

/** Certains moteurs ne remplissent la liste des voix qu'après un événement. */
export const warmVoices = () =>
  new Promise((resolve) => {
    if (!ttsSupported()) return resolve([])
    const list = window.speechSynthesis.getVoices()
    if (list && list.length) return resolve(list)
    const handler = () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', handler)
      resolve(window.speechSynthesis.getVoices() || [])
    }
    window.speechSynthesis.addEventListener?.('voiceschanged', handler)
    setTimeout(() => resolve(window.speechSynthesis.getVoices() || []), 1200)
    return undefined
  })

/**
 * Lit un texte en français. `onEnd` est appelé à la fin (ou si la voix
 * n'est pas disponible), afin que le lecteur puisse toujours enchaîner.
 */
export const speak = (text, { rate = 0.9, pitch = 0.95, volume = 1, onEnd } = {}) => {
  if (!ttsSupported() || !text) {
    onEnd?.()
    return false
  }
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(String(text))
    u.lang = 'fr-FR'
    u.rate = Math.max(0.5, Math.min(1.4, rate))
    u.pitch = Math.max(0.5, Math.min(1.6, pitch))
    u.volume = Math.max(0, Math.min(1, volume))
    const v = frenchVoice()
    if (v) u.voice = v
    u.onend = () => onEnd?.()
    u.onerror = () => onEnd?.()
    window.speechSynthesis.speak(u)
    return true
  } catch {
    onEnd?.()
    return false
  }
}

export const stopSpeaking = () => {
  if (!ttsSupported()) return
  try {
    window.speechSynthesis.cancel()
  } catch {
    /* ignoré */
  }
}

export const speaking = () => (ttsSupported() ? window.speechSynthesis.speaking : false)

/* ------------------------------- Nettoyage ------------------------------- */

export const stopAll = ({ fade = 1 } = {}) => {
  stopSpeaking()
  stopAmbience({ fade })
  stopBinaural({ fade })
}

/** Coupe tout et ferme le contexte (quitte le module). */
export const dispose = async () => {
  stopAll({ fade: 0.2 })
  runtime.ambience = null
  runtime.binaural = null
  runtime.buffers.clear()
  if (ctx) {
    const c = ctx
    ctx = null
    master = null
    try {
      await c.close()
    } catch {
      /* ignoré */
    }
  }
}
