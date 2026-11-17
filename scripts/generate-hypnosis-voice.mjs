/* ------------------------------------------------------------------
   generate-hypnosis-voice.mjs — Voix neuronales des séances (module 12)
   ------------------------------------------------------------------
   Enregistre, UNE FOIS POUR TOUTES, la voix de chaque séance avec une
   voix neuronale française (Microsoft Edge « Read Aloud »). Le résultat
   est embarqué dans l'application : sur le téléphone, la voix est donc
   toujours la même, douce et humaine, sans réseau ni synthèse vocale du
   système.

   Granularité : une phrase = un fichier. L'application enchaîne les
   phrases et place elle-même les silences entre elles : le rythme reste
   celui de l'hypnose (lent, respiré), et la phrase en cours est mise en
   évidence à l'écran avec une précision exacte.

   Sortie
   ------
   • public/media/hypnosis/voix/<voix>/<séance>/<phase>-<n>.mp3
   • public/media/hypnosis/voix/<voix>/sample.mp3      (pré-écoute)
   • src/data/hypnosis/voiceTracks.js                  (manifeste généré)

   Usage : node scripts/generate-hypnosis-voice.mjs [--force]
   (sans --force, un fichier déjà présent est réutilisé tel quel.)
------------------------------------------------------------------- */

import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SESSIONS } from '../src/data/hypnosis/sessions.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const OUT_ROOT = join(ROOT, 'public', 'media', 'hypnosis', 'voix')
const MODULE_OUT = join(ROOT, 'src', 'data', 'hypnosis', 'voiceTracks.js')

const FORCE = process.argv.includes('--force')
/** audio-24khz-48kbitrate-mono-mp3 → 48 000 bits/s constants (CBR). */
const BITRATE = 48000

const VOICES = [
  {
    id: 'denise',
    label: 'Denise',
    gender: 'Femme',
    voice: 'fr-FR-DeniseNeural',
    rate: '-10%',
    pitch: '-2Hz',
    color: '#cfa851',
    description:
      "Voix féminine douce, chaude et posée. La plus apaisante des deux : idéale pour l'induction, la détente et le sommeil.",
  },
  {
    id: 'henri',
    label: 'Henri',
    gender: 'Homme',
    voice: 'fr-FR-HenriNeural',
    rate: '-12%',
    pitch: '-4Hz',
    color: '#4a7fd4',
    description:
      "Voix masculine grave et très stable. Un accompagnement rassurant pour l'ancrage, le focus et la visualisation.",
  },
]

const SAMPLE_TEXT =
  "Bienvenue. Ferme les yeux, laisse ta respiration trouver son rythme, et laisse ma voix t'accompagner."

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const round = (n) => Math.round(n * 100) / 100
const bytesToSeconds = (bytes) => round((bytes * 8) / BITRATE)

/** Synthétise un texte et renvoie le Buffer MP3 complet. */
const synth = (tts, text, prosody) =>
  new Promise((resolve, reject) => {
    let stream
    try {
      stream = tts.toStream(text, prosody).audioStream
    } catch (err) {
      reject(err)
      return
    }
    const chunks = []
    let settled = false
    const timer = setTimeout(() => finish(reject, new Error('délai de synthèse dépassé')), 45000)
    function finish(fn, arg) {
      if (settled) return
      settled = true
      clearTimeout(timer)
      fn(arg)
    }
    stream.on('data', (c) => chunks.push(c))
    stream.on('error', (err) => finish(reject, err))
    stream.on('end', () => finish(resolve, Buffer.concat(chunks)))
    stream.on('close', () => setTimeout(() => finish(resolve, Buffer.concat(chunks)), 40))
  })

const withRetry = async (fn, tries = 4) => {
  let lastErr
  for (let i = 0; i < tries; i += 1) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      process.stdout.write(`      ↻ nouvelle tentative (${i + 1}/${tries}) — ${err?.message || err}\n`)
      await sleep(800 * (i + 1))
    }
  }
  throw lastErr
}

/** Écrit un MP3 (ou le réutilise s'il existe déjà) et renvoie sa taille. */
const renderTo = async (tts, text, prosody, absPath) => {
  if (!FORCE && existsSync(absPath)) {
    const size = statSync(absPath).size
    if (size > 0) return size
  }
  const buf = await withRetry(() => synth(tts, text, prosody))
  if (!buf.length) throw new Error('audio vide')
  mkdirSync(dirname(absPath), { recursive: true })
  writeFileSync(absPath, buf)
  return buf.length
}

const main = async () => {
  const tracks = {}
  const samples = {}
  const totals = {}

  for (const v of VOICES) {
    process.stdout.write(`\n▶ Voix « ${v.label} » (${v.voice})\n`)
    const tts = new MsEdgeTTS({ enableLogger: false })
    await tts.setMetadata(v.voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)
    const prosody = { rate: v.rate, pitch: v.pitch }

    const vDir = join(OUT_ROOT, v.id)
    mkdirSync(vDir, { recursive: true })

    const sampleAbs = join(vDir, 'sample.mp3')
    await renderTo(tts, SAMPLE_TEXT, prosody, sampleAbs)
    samples[v.id] = `./media/hypnosis/voix/${v.id}/sample.mp3`

    tracks[v.id] = {}
    let vBytes = 0
    let vLines = 0
    let vSeconds = 0

    for (const s of SESSIONS) {
      tracks[v.id][s.id] = {}
      const sDir = join(vDir, s.id)
      mkdirSync(sDir, { recursive: true })
      for (const p of s.phases) {
        const lines = []
        let pBytes = 0
        let pSeconds = 0
        for (let i = 0; i < p.lines.length; i += 1) {
          const rel = `./media/hypnosis/voix/${v.id}/${s.id}/${p.id}-${String(i).padStart(2, '0')}.mp3`
          const abs = join(ROOT, 'public', rel.replace('./', ''))
          const bytes = await renderTo(tts, p.lines[i], prosody, abs)
          const seconds = bytesToSeconds(bytes)
          lines.push({ src: rel, seconds, bytes })
          pBytes += bytes
          pSeconds += seconds
        }
        tracks[v.id][s.id][p.id] = { lines, seconds: round(pSeconds), bytes: pBytes }
        vBytes += pBytes
        vSeconds += pSeconds
        vLines += lines.length
        process.stdout.write(
          `   ${s.id} / ${p.id} — ${lines.length} phrase(s), ${pSeconds.toFixed(1)} s, ${(pBytes / 1024).toFixed(0)} Ko\n`,
        )
      }
    }

    totals[v.id] = { seconds: round(vSeconds), bytes: vBytes, lines: vLines }
    process.stdout.write(
      `   ✔ ${v.label} : ${vLines} phrases · ${(vSeconds / 60).toFixed(1)} min · ${(vBytes / 1024 / 1024).toFixed(1)} Mo\n`,
    )
    tts.close()
  }

  const voicesMeta = VOICES.map((v) => ({
    id: v.id,
    label: v.label,
    gender: v.gender,
    voice: v.voice,
    color: v.color,
    description: v.description,
  }))

  const header = `/* ------------------------------------------------------------------
   voiceTracks.js — FICHIER GÉNÉRÉ, NE PAS ÉDITER À LA MAIN
   ------------------------------------------------------------------
   Produit par scripts/generate-hypnosis-voice.mjs à partir de
   src/data/hypnosis/sessions.js et de voix neuronales françaises
   (Microsoft Edge « Read Aloud »). Les MP3 sont embarqués dans
   public/media/hypnosis/voix/ : la voix est donc identique sur tous
   les appareils, douce et humaine, et fonctionne 100 % hors-ligne.

   Régénérer :  node scripts/generate-hypnosis-voice.mjs
------------------------------------------------------------------- */

`

  const moduleSrc =
    header +
    `export const VOICE_GENERATED_AT = ${JSON.stringify(new Date().toISOString())}\n\n` +
    `export const VOICE_ENGINE = ${JSON.stringify('Voix neuronales françaises (Microsoft Edge)')}\n\n` +
    `export const NEURAL_VOICES = ${JSON.stringify(voicesMeta, null, 2)}\n\n` +
    `export const VOICE_SAMPLE = ${JSON.stringify(samples, null, 2)}\n\n` +
    `export const VOICE_TOTALS = ${JSON.stringify(totals, null, 2)}\n\n` +
    `export const VOICE_TRACKS = ${JSON.stringify(tracks, null, 2)}\n`

  writeFileSync(MODULE_OUT, moduleSrc, 'utf8')
  process.stdout.write(`\n✔ Manifeste écrit : ${MODULE_OUT}\n`)
}

main().catch((err) => {
  console.error('\n✖ Échec :', err?.message || err)
  process.exit(1)
})
