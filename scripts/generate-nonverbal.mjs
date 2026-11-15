/* ------------------------------------------------------------------
   generate-nonverbal.mjs
   Génère, 100 % en local (aucune API, aucun réseau), tous les médias
   du module « Communication non verbale » :

   • public/media/nonverbal/audio/*.wav     → 4 pistes audio réelles
       (métronomes de cadence 60 et 110 BPM, souffle 3-4-5,
        appuis de syllabes) — encodées en WAV PCM 8 kHz mono
   • public/media/nonverbal/texts/*.txt     → 7 scénarios de mini-film,
       1 fiche pratique, 4 exercices d'élocution
   • public/media/nonverbal/poses/*.svg     → 12 planches de posture
       vectorielles autonomes (export de src/lib/figure.js)
   • public/media/nonverbal/clips/*.svg     → 7 mini-vidéos vectorielles
       animées (mêmes postures, séquencées)
   • public/media/nonverbal/manifest.json   → inventaire + tailles

   Point clé : les illustrations et les mini-vidéos sont produites par le
   MÊME moteur que celui utilisé à l'exécution dans l'application
   (src/lib/figure.js). Une seule source de vérité → cohérence de style
   garantie, et zéro dérive entre ce qui est affiché et ce qui est exporté.

   Lancer : node scripts/generate-nonverbal.mjs
------------------------------------------------------------------- */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { POSES, clipSvg, standaloneSvg } from '../src/lib/figure.js'
import { CLIPS, MEDIA } from '../src/data/nonverbal/media.js'
import { DRILLS, FICHES, SCRIPTS, drillToText, ficheToText, scriptToText } from '../src/data/nonverbal/scripts.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const base = join(root, 'public', 'media', 'nonverbal')
const inventory = []

const write = (rel, content, encoding = 'utf8') => {
  const full = join(base, rel)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, content, encoding)
  const size = Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content)
  inventory.push({ path: `media/nonverbal/${rel}`, bytes: size })
  console.log(`  ✓ ${rel} (${(size / 1024).toFixed(1)} Ko)`)
  return size
}

/* ================================================================== */
/*  1. AUDIO — encodeur WAV minimal (PCM 8 bits mono, 8 kHz)           */
/* ================================================================== */
const SAMPLE_RATE = 8000

const wavFromSamples = (samples, sampleRate = SAMPLE_RATE) => {
  const n = samples.length
  const buf = Buffer.alloc(44 + n)
  buf.write('RIFF', 0)
  buf.writeUInt32LE(36 + n, 4)
  buf.write('WAVE', 8)
  buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20) // PCM
  buf.writeUInt16LE(1, 22) // mono
  buf.writeUInt32LE(sampleRate, 24)
  buf.writeUInt32LE(sampleRate, 28) // byte rate (8 bits mono)
  buf.writeUInt16LE(1, 32) // block align
  buf.writeUInt16LE(8, 34) // bits per sample
  buf.write('data', 36)
  buf.writeUInt32LE(n, 40)
  for (let i = 0; i < n; i += 1) {
    const v = Math.max(-1, Math.min(1, samples[i]))
    buf[44 + i] = Math.round((v * 0.5 + 0.5) * 255)
  }
  return buf
}

const envelope = (t, dur, attack = 0.02, release = 0.05) => {
  if (t < attack) return t / attack
  if (t > dur - release) return Math.max(0, (dur - t) / release)
  return 1
}

/** Métronome : un « tic » par battement, accent tous les 4 temps. */
const buildMetronome = (bpm, seconds) => {
  const beat = 60 / bpm
  const beats = Math.floor(seconds / beat)
  const n = Math.floor((beats * beat + 0.5) * SAMPLE_RATE)
  const out = new Float32Array(n)
  for (let b = 0; b < beats; b += 1) {
    const start = b * beat
    const accent = b % 4 === 0
    const freq = accent ? 1400 : 950
    const gain = accent ? 0.55 : 0.32
    const dur = 0.05
    for (let t = 0; t < dur; t += 1 / SAMPLE_RATE) {
      const i = Math.floor((start + t) * SAMPLE_RATE)
      if (i < n) out[i] += gain * Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 65)
    }
  }
  return wavFromSamples(out)
}

/** Respiration 3-4-5 : inspiration 3 s, apnée 4 s, expiration 5 s. */
const buildBreath345 = (cycles = 3) => {
  const cycle = 12
  const total = cycle * cycles + 1
  const n = Math.floor(total * SAMPLE_RATE)
  const out = new Float32Array(n)
  const put = (t, v) => {
    const i = Math.floor(t * SAMPLE_RATE)
    if (i >= 0 && i < n) out[i] += v
  }

  for (let c = 0; c < cycles; c += 1) {
    const b = c * cycle
    // Inspiration : 3 s, ton qui monte 200 → 320 Hz
    for (let t = 0; t < 3; t += 1 / SAMPLE_RATE) {
      const f = 200 + (120 * t) / 3
      put(b + t, 0.32 * Math.sin(2 * Math.PI * f * t) * envelope(t, 3, 0.3, 0.3))
    }
    // Apnée : 4 s, pulsation douce à chaque seconde
    for (let t = 0; t < 4; t += 1 / SAMPLE_RATE) {
      const pulse = Math.pow(Math.max(0, 1 - (t % 1) / 0.25), 2)
      put(b + 3 + t, 0.12 * Math.sin(2 * Math.PI * 430 * t) * pulse)
    }
    // Expiration : 5 s, ton qui descend 300 → 150 Hz
    for (let t = 0; t < 5; t += 1 / SAMPLE_RATE) {
      const f = 300 - (150 * t) / 5
      put(b + 7 + t, 0.3 * Math.sin(2 * Math.PI * f * t) * envelope(t, 5, 0.2, 0.5))
    }
  }
  return wavFromSamples(out)
}

/** Appuis de syllabes : 4 motifs rythmiques (binaire, ternaire, anapeste, ïambe). */
const buildAppui = () => {
  const patterns = [
    [1, 0, 1, 0], // binaire
    [1, 0, 0, 1, 0, 0], // ternaire
    [0, 0, 1], // anapeste
    [0, 1], // ïambe
  ]
  const unit = 0.34
  const gap = 1.2
  const repeats = 4
  const total = patterns.reduce((t, p) => t + p.length * unit * repeats + gap, 0) + 0.5
  const n = Math.floor(total * SAMPLE_RATE)
  const out = new Float32Array(n)

  const click = (start) => {
    for (let t = 0; t < 0.03; t += 1 / SAMPLE_RATE) {
      const i = Math.floor((start + t) * SAMPLE_RATE)
      if (i < n) out[i] += 0.4 * Math.sin(2 * Math.PI * 1600 * t) * Math.exp(-t * 90)
    }
  }
  const tone = (start, stress) => {
    const dur = stress ? 0.13 : 0.09
    const freq = stress ? 520 : 380
    const gain = stress ? 0.3 : 0.17
    for (let t = 0; t < dur; t += 1 / SAMPLE_RATE) {
      const i = Math.floor((start + t) * SAMPLE_RATE)
      if (i < n) out[i] += gain * Math.sin(2 * Math.PI * freq * t) * envelope(t, dur, 0.012, 0.05)
    }
  }

  let cursor = 0.2
  patterns.forEach((p) => {
    for (let r = 0; r < repeats; r += 1) {
      p.forEach((stress, k) => {
        const start = cursor + k * unit
        click(start)
        tone(start, Boolean(stress))
      })
      cursor += p.length * unit
    }
    cursor += gap
  })
  return wavFromSamples(out)
}

const AUDIO = {
  'cadence-lente.wav': () => buildMetronome(60, 60),
  'cadence-parole.wav': () => buildMetronome(110, 60),
  'souffle-345.wav': () => buildBreath345(3),
  'appui-syllabes.wav': () => buildAppui(),
}

/* ================================================================== */
/*  2. TEXTES — scénarios, fiche, exercices                            */
/* ================================================================== */
const TEXTS = {
  'scr-entrer.txt': () => scriptToText(SCRIPTS.find((s) => s.id === 'scr-entrer')),
  'scr-assise.txt': () => scriptToText(SCRIPTS.find((s) => s.id === 'scr-assise')),
  'scr-saluer.txt': () => scriptToText(SCRIPTS.find((s) => s.id === 'scr-saluer')),
  'scr-presenter.txt': () => scriptToText(SCRIPTS.find((s) => s.id === 'scr-presenter')),
  'scr-elocution.txt': () => scriptToText(SCRIPTS.find((s) => s.id === 'scr-elocution')),
  'scr-service.txt': () => scriptToText(SCRIPTS.find((s) => s.id === 'scr-service')),
  'scr-sortir.txt': () => scriptToText(SCRIPTS.find((s) => s.id === 'scr-sortir')),
  'fiche-observation.txt': () => ficheToText(FICHES.find((f) => f.id === 'fiche-observation')),
  'drill-virelangue-1.txt': () => drillToText(DRILLS.find((d) => d.id === 'drill-virelangue-1')),
  'drill-virelangue-2.txt': () => drillToText(DRILLS.find((d) => d.id === 'drill-virelangue-2')),
  'drill-projection.txt': () => drillToText(DRILLS.find((d) => d.id === 'drill-projection')),
  'drill-respiration.txt': () => drillToText(DRILLS.find((d) => d.id === 'drill-respiration')),
}

/* ================================================================== */
/*  3. EXÉCUTION                                                       */
/* ================================================================== */

console.log('\n▸ Audio (WAV PCM 8 kHz mono)')
Object.entries(AUDIO).forEach(([name, build]) => write(`audio/${name}`, build(), null))

console.log('\n▸ Textes pédagogiques')
Object.entries(TEXTS).forEach(([name, build]) => {
  const txt = build()
  if (!txt) throw new Error(`Texte introuvable pour ${name}`)
  write(`texts/${name}`, txt)
})

console.log('\n▸ Planches de posture (SVG autonomes)')
Object.keys(POSES).forEach((id) => write(`poses/${id}.svg`, standaloneSvg(id, { theme: 'dark', w: 900, h: 900 })))

console.log('\n▸ Mini-vidéos vectorielles animées (SVG)')
Object.values(CLIPS).forEach((clip) =>
  write(
    `clips/${clip.id}.svg`,
    clipSvg({ frames: clip.frames, title: clip.title, subtitle: clip.subtitle, theme: 'dark', hold: clip.hold }),
  ),
)

/* ================================================================== */
/*  4. MANIFESTE + VÉRIFICATION                                        */
/* ================================================================== */

const declared = Object.values(MEDIA).map((m) => ({
  id: m.id,
  kind: m.kind,
  src: m.src.replace(/^\.\//, ''),
  declaredBytes: m.bytes,
  actualBytes: inventory.find((i) => m.src.endsWith(i.path.split('/').pop()))?.bytes ?? null,
}))

const total = inventory.reduce((t, i) => t + i.bytes, 0)
const audioBytes = inventory.filter((i) => i.path.includes('/audio/')).reduce((t, i) => t + i.bytes, 0)
const textBytes = inventory.filter((i) => i.path.includes('/texts/')).reduce((t, i) => t + i.bytes, 0)

write(
  'manifest.json',
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      note: 'Médias du module non verbal — générés localement, aucune API.',
      downloadable: { count: declared.length, audioBytes, textBytes, totalBytes: audioBytes + textBytes },
      inline: {
        poses: Object.keys(POSES).length,
        clips: Object.values(CLIPS).length,
        note: 'Illustrations et mini-vidéos vectorielles : embarquées dans le bundle, 0 octet à télécharger.',
      },
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
console.log(`    · audio        : ${(audioBytes / 1024).toFixed(1)} Ko`)
console.log(`    · textes       : ${(textBytes / 1024).toFixed(1)} Ko`)
console.log(`  Postures SVG     : ${Object.keys(POSES).length}`)
console.log(`  Clips SVG        : ${Object.values(CLIPS).length}`)
console.log('─────────────────────────────────────────────\n')
