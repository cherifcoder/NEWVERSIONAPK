/* ------------------------------------------------------------------
   generate-hypnosis.mjs
   Génère, 100 % en local (aucune API, aucun réseau), tous les médias du
   module « Hypnose éricksonienne » :

   • public/media/hypnosis/ambience/*.wav → 5 boucles d'ambiance de 24 s
       (nappe basse, pluie douce, vagues lentes, forêt de nuit, feu doux)
       encodées en WAV PCM 16 bits mono, 11 025 Hz.
   • public/media/hypnosis/sons/*.wav     → 5 repères sonores courts
       (cloche claire, gong doux, bol tibétain, souffle entrée / sortie)
   • public/media/hypnosis/voix/*.txt     → le script intégral des 6 séances
   • public/media/hypnosis/manifest.json  → inventaire + tailles

   Les scripts sont rédigés dans src/data/hypnosis/sessions.js : une seule
   source de vérité, la même que celle lue par la synthèse vocale de
   l'application.

   Lancer : node scripts/generate-hypnosis.mjs
------------------------------------------------------------------- */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { SESSIONS, sessionToText } from '../src/data/hypnosis/sessions.js'
import { AMBIENCES, CUES, SCRIPTS_MEDIA } from '../src/data/hypnosis/media.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const base = join(root, 'public', 'media', 'hypnosis')
const inventory = []

const write = (rel, content, encoding = 'utf8') => {
  const full = join(base, rel)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, content, encoding)
  const size = Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content)
  inventory.push({ path: `media/hypnosis/${rel}`, bytes: size })
  console.log(`  ✓ ${rel} (${(size / 1024).toFixed(1)} Ko)`)
  return size
}

/* ================================================================== */
/*  0. Outils DSP : bruit déterministe, filtres, normalisation         */
/* ================================================================== */

const SR = 11025

/** PRNG déterministe (mulberry32) : même graine → même audio. */
const rng = (seed) => {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const noise = (n, seed) => {
  const r = rng(seed)
  const out = new Float32Array(n)
  for (let i = 0; i < n; i += 1) out[i] = r() * 2 - 1
  return out
}

/** Filtre passe-bas un pôle (cutoff < SR/2). */
const lowpass = (input, cutoff) => {
  const dt = 1 / SR
  const rc = 1 / (2 * Math.PI * Math.min(cutoff, SR * 0.45))
  const a = dt / (rc + dt)
  const out = new Float32Array(input.length)
  let prev = 0
  for (let i = 0; i < input.length; i += 1) {
    prev += a * (input[i] - prev)
    out[i] = prev
  }
  return out
}

/** Filtre passe-haut un pôle. */
const highpass = (input, cutoff) => {
  const dt = 1 / SR
  const rc = 1 / (2 * Math.PI * Math.min(cutoff, SR * 0.45))
  const a = rc / (rc + dt)
  const out = new Float32Array(input.length)
  let prevIn = 0
  let prevOut = 0
  for (let i = 0; i < input.length; i += 1) {
    const x = input[i]
    prevOut = a * (prevOut + x - prevIn)
    prevIn = x
    out[i] = prevOut
  }
  return out
}

/** Normalise le pic à `peak` (évite la saturation). */
const normalize = (samples, peak = 0.85) => {
  let max = 0
  for (let i = 0; i < samples.length; i += 1) max = Math.max(max, Math.abs(samples[i]))
  if (max === 0) return samples
  const k = peak / max
  for (let i = 0; i < samples.length; i += 1) samples[i] *= k
  return samples
}

/**
 * Rend une boucle sans clic : on génère `seconds + fade` de signal, puis on
 * fond la queue dans la tête. La boucle produite dure exactement `seconds`.
 */
const loopify = (samples, fade = 1.2) => {
  const f = Math.floor(fade * SR)
  const n = samples.length - f
  const out = new Float32Array(n)
  for (let i = 0; i < n; i += 1) out[i] = samples[i]
  for (let i = 0; i < f; i += 1) {
    const a = i / f
    out[i] = samples[i] * a + samples[n + i] * (1 - a)
  }
  return out
}

/** Fondu d'entrée / sortie (pour les sons courts, non bouclés). */
const fadeEdges = (samples, inSec = 0.01, outSec = 0.4) => {
  const n = samples.length
  const fi = Math.floor(inSec * SR)
  const fo = Math.floor(outSec * SR)
  for (let i = 0; i < fi; i += 1) samples[i] *= i / fi
  for (let i = 0; i < fo; i += 1) samples[n - 1 - i] *= i / fo
  return samples
}

/* ================================================================== */
/*  1. Encodeur WAV PCM 16 bits mono                                   */
/* ================================================================== */

const wav16 = (samples, sampleRate = SR) => {
  const n = samples.length
  const buf = Buffer.alloc(44 + n * 2)
  buf.write('RIFF', 0)
  buf.writeUInt32LE(36 + n * 2, 4)
  buf.write('WAVE', 8)
  buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20) // PCM
  buf.writeUInt16LE(1, 22) // mono
  buf.writeUInt32LE(sampleRate, 24)
  buf.writeUInt32LE(sampleRate * 2, 28) // byte rate
  buf.writeUInt16LE(2, 32) // block align
  buf.writeUInt16LE(16, 34) // bits per sample
  buf.write('data', 36)
  buf.writeUInt32LE(n * 2, 40)
  for (let i = 0; i < n; i += 1) {
    const v = Math.max(-1, Math.min(1, samples[i]))
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2)
  }
  return buf
}

/* ================================================================== */
/*  2. Ambiances (boucles de 24 s)                                     */
/* ================================================================== */

const DUR = 24
const NS = Math.floor((DUR + 1.5) * SR) // marge pour le fondu de boucle

/** Nappe basse : partiels chauds + souffle filtré. */
const nappeBasse = () => {
  const out = new Float32Array(NS)
  const partials = [
    { f: 55, g: 0.30, lfo: 0.05 },
    { f: 82.5, g: 0.17, lfo: 0.037 },
    { f: 110, g: 0.13, lfo: 0.023 },
    { f: 164.81, g: 0.07, lfo: 0.017 },
    { f: 220, g: 0.05, lfo: 0.011 },
  ]
  for (const p of partials) {
    const ph = ((p.f * 0.37) % 1) * 2 * Math.PI
    for (let i = 0; i < NS; i += 1) {
      const t = i / SR
      const amp = p.g * (0.72 + 0.28 * Math.sin(2 * Math.PI * p.lfo * t))
      out[i] += amp * Math.sin(2 * Math.PI * p.f * t + ph)
    }
  }
  const bed = lowpass(noise(NS, 11), 420)
  for (let i = 0; i < NS; i += 1) out[i] += 0.06 * bed[i]
  return normalize(loopify(out))
}

/** Pluie douce : bruit passe-bande + micro-modulation. */
const pluieDouce = () => {
  const src = noise(NS, 21)
  const hp = highpass(src, 900)
  const shaped = lowpass(hp, 4200)
  const out = new Float32Array(NS)
  for (let i = 0; i < NS; i += 1) {
    const t = i / SR
    out[i] = shaped[i] * (0.85 + 0.15 * Math.sin(2 * Math.PI * 0.13 * t))
  }
  return normalize(loopify(out))
}

/** Vagues lentes : bruit bas filtré dont le gain et la coupure respirent. */
const vagues = () => {
  const src = noise(NS, 31)
  const out = new Float32Array(NS)
  let lp = 0
  for (let i = 0; i < NS; i += 1) {
    const t = i / SR
    // deux ressacs par boucle de 24 s → période 12 s, plus un souffle à 3 s
    const swell = 0.5 + 0.5 * Math.sin(2 * Math.PI * t / 12 - Math.PI / 2)
    const cutoff = 500 + 2400 * swell
    const dt = 1 / SR
    const rc = 1 / (2 * Math.PI * Math.min(cutoff, SR * 0.45))
    const a = dt / (rc + dt)
    lp += a * (src[i] - lp)
    out[i] = lp * (0.25 + 0.75 * swell) * (0.9 + 0.1 * Math.sin(2 * Math.PI * 0.25 * t))
  }
  return normalize(loopify(out))
}

/** Forêt de nuit : vent bas + grillons lointains. */
const foretNuit = () => {
  const wind = lowpass(noise(NS, 41), 700)
  const out = new Float32Array(NS)
  for (let i = 0; i < NS; i += 1) {
    const t = i / SR
    out[i] = wind[i] * (0.45 + 0.35 * Math.sin(2 * Math.PI * 0.07 * t))
  }
  const r = rng(77)
  const chirps = 42
  for (let c = 0; c < chirps; c += 1) {
    const start = Math.floor(r() * (NS - SR))
    const dur = 0.12 + r() * 0.12
    const f = 3900 + r() * 900
    const gain = 0.05 + r() * 0.05
    for (let t = 0; t < dur; t += 1 / SR) {
      const i = start + Math.floor(t * SR)
      if (i >= NS) break
      const trem = Math.max(0, Math.sin(2 * Math.PI * 38 * t))
      const env = Math.sin((Math.PI * t) / dur)
      out[i] += gain * trem * env * Math.sin(2 * Math.PI * f * t)
    }
  }
  return normalize(loopify(out))
}

/** Feu de cheminée : grondement bas + crépitements aléatoires. */
const feuDoux = () => {
  const rumble = lowpass(noise(NS, 51), 320)
  const out = new Float32Array(NS)
  for (let i = 0; i < NS; i += 1) out[i] = rumble[i] * 0.7
  const r = rng(88)
  const crackles = 160
  for (let c = 0; c < crackles; c += 1) {
    const start = Math.floor(r() * (NS - SR * 0.2))
    const dur = 0.015 + r() * 0.05
    const gain = 0.1 + r() * 0.35
    const f = 1200 + r() * 2600
    for (let t = 0; t < dur; t += 1 / SR) {
      const i = start + Math.floor(t * SR)
      if (i >= NS) break
      out[i] += gain * Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 90)
    }
  }
  return normalize(loopify(out))
}

const AMBIENCE_BUILDERS = {
  'nappe-basse': nappeBasse,
  'pluie-douce': pluieDouce,
  vagues,
  'foret-nuit': foretNuit,
  'feu-doux': feuDoux,
}

/* ================================================================== */
/*  3. Repères sonores (sons courts)                                   */
/* ================================================================== */

const bell = (f0, seconds, seed = 1) => {
  const n = Math.floor(seconds * SR)
  const out = new Float32Array(n)
  const partials = [
    { m: 1, g: 1.0, d: 2.6 },
    { m: 2.76, g: 0.5, d: 4.0 },
    { m: 5.4, g: 0.22, d: 6.0 },
    { m: 8.9, g: 0.1, d: 9.0 },
  ]
  const r = rng(seed)
  for (const p of partials) {
    const ph = r() * Math.PI
    for (let i = 0; i < n; i += 1) {
      const t = i / SR
      out[i] += p.g * Math.exp(-t * p.d) * Math.sin(2 * Math.PI * f0 * p.m * t + ph)
    }
  }
  return fadeEdges(normalize(out, 0.8), 0.004, 0.5)
}

const gong = (seconds) => {
  const n = Math.floor(seconds * SR)
  const out = new Float32Array(n)
  const partials = [
    { f: 96, g: 1.0, d: 1.1 },
    { f: 143, g: 0.6, d: 1.4 },
    { f: 197, g: 0.35, d: 1.8 },
    { f: 286, g: 0.2, d: 2.4 },
    { f: 421, g: 0.12, d: 3.2 },
  ]
  for (const p of partials) {
    for (let i = 0; i < n; i += 1) {
      const t = i / SR
      // léger battement pour un timbre vivant
      const beat = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.7 * t)
      out[i] += p.g * beat * Math.exp(-t * p.d) * Math.sin(2 * Math.PI * p.f * t)
    }
  }
  const air = lowpass(noise(n, 61), 900)
  for (let i = 0; i < n; i += 1) {
    const t = i / SR
    out[i] += 0.12 * air[i] * Math.exp(-t * 0.8)
  }
  return fadeEdges(normalize(out, 0.8), 0.006, 0.8)
}

const singingBowl = (seconds) => {
  const n = Math.floor(seconds * SR)
  const out = new Float32Array(n)
  const base = 224
  const partials = [
    { f: base, g: 1.0, d: 0.5 },
    { f: base + 1.5, g: 0.8, d: 0.5 }, // battement lent
    { f: base * 2.01, g: 0.4, d: 0.7 },
    { f: base * 3.02, g: 0.18, d: 1.0 },
    { f: base * 4.7, g: 0.08, d: 1.4 },
  ]
  for (const p of partials) {
    for (let i = 0; i < n; i += 1) {
      const t = i / SR
      out[i] += p.g * Math.exp(-t * p.d) * Math.sin(2 * Math.PI * p.f * t)
    }
  }
  return fadeEdges(normalize(out, 0.8), 0.008, 1.2)
}

const breath = (seconds, rising) => {
  const n = Math.floor(seconds * SR)
  const src = noise(n, rising ? 71 : 72)
  const out = new Float32Array(n)
  let lp = 0
  for (let i = 0; i < n; i += 1) {
    const t = i / SR
    const k = t / seconds
    const cutoff = rising ? 500 + 2600 * k : 3000 - 2300 * k
    const dt = 1 / SR
    const rc = 1 / (2 * Math.PI * Math.max(200, cutoff))
    const a = dt / (rc + dt)
    lp += a * (src[i] - lp)
    const env = rising ? Math.sin((Math.PI / 2) * k) : Math.cos((Math.PI / 2) * k)
    out[i] = lp * env
  }
  return fadeEdges(normalize(out, 0.55), 0.05, 0.25)
}

const CUE_BUILDERS = {
  'cloche-claire': () => bell(880, 3.6, 3),
  'gong-doux': () => gong(5.2),
  'bol-tibetain': () => singingBowl(6.4),
  'souffle-entree': () => breath(4, true),
  'souffle-sortie': () => breath(5, false),
}

/* ================================================================== */
/*  4. Exécution                                                       */
/* ================================================================== */

console.log('\n▸ Ambiances (boucles 24 s · WAV PCM 16 bits mono 11 025 Hz)')
Object.values(AMBIENCES).forEach((m) => {
  const key = m.src.split('/').pop().replace(/\.wav$/, '')
  const build = AMBIENCE_BUILDERS[key]
  if (!build) throw new Error(`Ambiance inconnue : ${key}`)
  write(`ambience/${key}.wav`, wav16(build()), null)
})

console.log('\n▸ Repères sonores')
Object.values(CUES).forEach((m) => {
  const key = m.src.split('/').pop().replace(/\.wav$/, '')
  const build = CUE_BUILDERS[key]
  if (!build) throw new Error(`Repère inconnu : ${key}`)
  write(`sons/${key}.wav`, wav16(build()), null)
})

console.log('\n▸ Scripts des séances (texte)')
Object.values(SCRIPTS_MEDIA).forEach((m) => {
  const sessionId = m.id.replace(/^hy-txt-/, '')
  const session = SESSIONS.find((s) => s.id === sessionId)
  if (!session) throw new Error(`Séance introuvable : ${sessionId}`)
  write(`voix/${sessionId}.txt`, sessionToText(session))
})

/* ================================================================== */
/*  5. Manifeste + vérification                                        */
/* ================================================================== */

const declared = Object.values({ ...AMBIENCES, ...CUES, ...SCRIPTS_MEDIA }).map((m) => ({
  id: m.id,
  kind: m.kind,
  src: m.src.replace(/^\.\//, ''),
  declaredBytes: m.bytes,
  actualBytes: inventory.find((i) => m.src.endsWith(i.path.split('/').pop()))?.bytes ?? null,
}))

const total = inventory.reduce((t, i) => t + i.bytes, 0)
const ambBytes = inventory.filter((i) => i.path.includes('/ambience/')).reduce((t, i) => t + i.bytes, 0)
const cueBytes = inventory.filter((i) => i.path.includes('/sons/')).reduce((t, i) => t + i.bytes, 0)
const txtBytes = inventory.filter((i) => i.path.includes('/voix/')).reduce((t, i) => t + i.bytes, 0)

write(
  'manifest.json',
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      note: 'Médias du module hypnose éricksonienne — générés localement, aucune API.',
      format: { codec: 'pcm_s16le', sampleRate: SR, channels: 1 },
      totals: { files: inventory.length, ambBytes, cueBytes, txtBytes, totalBytes: total },
      sessions: SESSIONS.length,
      files: inventory,
      declared,
    },
    null,
    2,
  ),
)

console.log('\n─────────────────────────────────────────────')
console.log(`  Fichiers générés : ${inventory.length}`)
console.log(`  Poids total      : ${(total / 1024).toFixed(1)} Ko`)
console.log(`    · ambiances    : ${(ambBytes / 1024).toFixed(1)} Ko`)
console.log(`    · repères      : ${(cueBytes / 1024).toFixed(1)} Ko`)
console.log(`    · scripts      : ${(txtBytes / 1024).toFixed(1)} Ko`)
console.log(`  Séances          : ${SESSIONS.length}`)
console.log('─────────────────────────────────────────────\n')
