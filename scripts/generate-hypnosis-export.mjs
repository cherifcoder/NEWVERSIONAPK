/* ------------------------------------------------------------------
   generate-hypnosis-export.mjs — Fichiers « prêts à écouter » (module 12)
   ------------------------------------------------------------------
   À partir des voix embarquées (une phrase = un MP3, cf.
   generate-hypnosis-voice.mjs), on fabrique UN fichier unique par séance
   et par voix, pour l'écoute nocturne en boucle dans n'importe quel
   lecteur du téléphone :

     • public/media/hypnosis/export/<séance>-<voix>.mp3   (audio seul)
     • public/media/hypnosis/export/<séance>-<voix>.mp4   (image douce + voix)
     • src/data/hypnosis/exports.js                       (manifeste généré)

   Les silences entre les phrases sont reproduits à l'identique du lecteur
   de l'app (PAUSE_BASE × PAUSE_BY_KIND), puis tout est mis bout à bout
   avec ffmpeg (nécessaire UNIQUEMENT ici, au moment de la génération :
   l'application, elle, reste 100 % hors-ligne).

   Usage :
     node scripts/generate-hypnosis-export.mjs [--session=hy-travail]
        [--voice=denise] [--format=mp3,mp4] [--ffmpeg=<chemin>] [--force]
   ------------------------------------------------------------------- */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { SESSIONS } from '../src/data/hypnosis/sessions.js'
import { NEURAL_VOICES, VOICE_TRACKS } from '../src/data/hypnosis/voiceTracks.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const OUT_DIR = join(ROOT, 'public', 'media', 'hypnosis', 'export')
const TMP_DIR = join(OUT_DIR, '_tmp')
const MANIFEST = join(ROOT, 'src', 'data', 'hypnosis', 'exports.js')

const arg = (name) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : null
}
const FORCE = process.argv.includes('--force')
const ONLY_SESSIONS = arg('session') ? arg('session').split(',') : null
const ONLY_VOICES = arg('voice') ? arg('voice').split(',') : ['denise']
const FORMATS = (arg('format') || 'mp3,mp4').split(',').map((f) => f.trim())

/* Même rythme que src/modules/hypnosis/SessionPlayer.jsx */
const PAUSE_BASE = 1400
const PAUSE_BY_KIND = {
  accueil: 0.7,
  induction: 1.15,
  approfondissement: 1.3,
  suggestion: 1.05,
  visualisation: 1.35,
  ancrage: 1.0,
  emergence: 0.8,
  silence: 1.7,
}
const LEAD_IN = 1100
const pauseMs = (kind) => Math.max(150, Math.round(PAUSE_BASE * (PAUSE_BY_KIND[kind] ?? 1)))

/* ---------------------------- ffmpeg ---------------------------- */

/**
 * Localise ffmpeg, dans l'ordre :
 *   1. --ffmpeg=<chemin>
 *   2. variable d'environnement FFMPEG_PATH
 *   3. « ffmpeg » dans le PATH
 * Sur Windows : `winget install Gyan.FFmpeg`, ou bien indique le chemin
 * complet du binaire.
 */
const ffmpegCandidates = () => {
  const list = []
  const explicit = arg('ffmpeg') || process.env.FFMPEG_PATH
  if (explicit) list.push(explicit)
  list.push('ffmpeg')
  return list
}

const findFfmpeg = () => {
  for (const c of ffmpegCandidates()) {
    try {
      execFileSync(c, ['-version'], { stdio: 'ignore' })
      return c
    } catch {
      /* essai suivant */
    }
  }
  return null
}

const ffmpeg = findFfmpeg()
if (!ffmpeg) {
  console.error('✖ ffmpeg est introuvable. Installe-le ou passe --ffmpeg=<chemin>.')
  process.exit(1)
}
console.log(`▶ ffmpeg : ${ffmpeg}`)

const run = (args) => {
  try {
    execFileSync(ffmpeg, args, { stdio: ['ignore', 'ignore', 'pipe'] })
  } catch (err) {
    const detail = err?.stderr ? err.stderr.toString().split('\n').slice(-8).join('\n') : err?.message
    throw new Error(`ffmpeg a échoué :\n${detail}`)
  }
}

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} Mo`

/** « 14 min 54 s » — durée réelle mesurée, pas la durée annoncée. */
const fmtDuration = (s) => {
  const m = Math.floor(s / 60)
  const r = Math.round(s % 60)
  return r ? `${m} min ${String(r).padStart(2, '0')} s` : `${m} min`
}

/* ------------------------- Silences MP3 ------------------------- */

const silenceCache = {}
const silenceFor = (ms) => {
  const key = Math.round(ms)
  if (silenceCache[key]) return silenceCache[key]
  const path = join(TMP_DIR, `silence-${key}.mp3`)
  if (!existsSync(path)) {
    run([
      '-y',
      '-f', 'lavfi',
      '-i', 'anullsrc=r=24000:cl=mono',
      '-t', (key / 1000).toFixed(3),
      '-c:a', 'libmp3lame',
      '-b:a', '48k',
      '-ar', '24000',
      '-ac', '1',
      path,
    ])
  }
  silenceCache[key] = path
  return path
}

/* --------------------------- Vignette --------------------------- */

const coverSvg = (session, voice) => {
  const title = session.title.replace(/'/g, '’')
  const color = session.color || '#cfa851'
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="78%">
      <stop offset="0%" stop-color="#15110a"/>
      <stop offset="55%" stop-color="#0b0c11"/>
      <stop offset="100%" stop-color="#05060a"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.34"/>
      <stop offset="70%" stop-color="${color}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <circle cx="640" cy="300" r="300" fill="url(#glow)"/>
  <circle cx="640" cy="300" r="168" fill="none" stroke="${color}" stroke-width="1.4" opacity="0.55"/>
  <circle cx="640" cy="300" r="120" fill="none" stroke="${color}" stroke-width="1" opacity="0.32"/>
  <circle cx="640" cy="300" r="74" fill="none" stroke="${color}" stroke-width="0.8" opacity="0.2"/>
  <text x="640" y="536" font-family="Georgia, 'Times New Roman', serif" font-size="58" fill="#ecdcb0" text-anchor="middle">${title}</text>
  <text x="640" y="592" font-family="Georgia, 'Times New Roman', serif" font-size="25" fill="#9aa0b5" text-anchor="middle">METHOD · Hypnose PNL · ${session.minutes} min</text>
  <text x="640" y="634" font-family="Georgia, 'Times New Roman', serif" font-size="19" fill="#6f7488" text-anchor="middle">Voix ${voice.label} · écoute au casque ou sur haut-parleur, au lit</text>
</svg>`
}

/* ------------------------ Construction ------------------------ */

/** Construit la liste de segments et la durée totale (secondes) de la séance. */
const buildSegments = (session, voice) => {
  const track = VOICE_TRACKS[voice.id]?.[session.id]
  if (!track) throw new Error(`aucune voix ${voice.id} pour ${session.id}`)
  const files = []
  let total = 0
  session.phases.forEach((p, pi) => {
    const phase = track[p.id]
    if (!phase?.lines?.length) return
    if (pi > 0) {
      const gap = Math.max(LEAD_IN, pauseMs(p.kind))
      files.push(silenceFor(gap))
      total += gap / 1000
    }
    phase.lines.forEach((l, li) => {
      if (li > 0) {
        files.push(silenceFor(pauseMs(p.kind)))
        total += pauseMs(p.kind) / 1000
      }
      files.push(join(ROOT, 'public', l.src.replace('./', '')))
      total += l.seconds || 0
    })
  })
  return { files, total }
}

const buildMp3 = (session, voice, outPath) => {
  const { files, total } = buildSegments(session, voice)
  const listPath = join(TMP_DIR, `${session.id}-${voice.id}.txt`)
  writeFileSync(listPath, files.map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n'), 'utf8')
  run([
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', listPath,
    '-c:a', 'libmp3lame',
    '-b:a', '48k',
    '-ar', '24000',
    '-ac', '1',
    '-write_xing', '1',
    outPath,
  ])
  return total
}

/**
 * Vidéo = image fixe + piste audio. On force la durée EXACTE (`-t`) plutôt
 * que de compter sur `-shortest` : selon la version de ffmpeg, la piste
 * image peut déborder de plusieurs secondes après la fin de la voix.
 */
const buildMp4 = (mp3Path, coverPath, outPath, seconds) => {
  run([
    '-y',
    '-loop', '1',
    '-i', coverPath,
    '-i', mp3Path,
    '-c:v', 'libx264',
    '-tune', 'stillimage',
    '-preset', 'veryfast',
    '-crf', '30',
    '-pix_fmt', 'yuv420p',
    '-r', '2',
    '-c:a', 'aac',
    '-b:a', '56k',
    '-movflags', '+faststart',
    '-t', Number(seconds).toFixed(3),
    outPath,
  ])
}

/* --------------------------- Principal --------------------------- */

const targets = SESSIONS.filter((s) => (ONLY_SESSIONS ? ONLY_SESSIONS.includes(s.id) : s.sleep))
const voices = NEURAL_VOICES.filter((v) => ONLY_VOICES.includes(v.id))

if (!targets.length) {
  console.error('✖ Aucune séance cible (utilise --session=<id>).')
  process.exit(1)
}

mkdirSync(OUT_DIR, { recursive: true })
mkdirSync(TMP_DIR, { recursive: true })

const entries = []

for (const session of targets) {
  for (const voice of voices) {
    const base = `${session.id}-${voice.id}`
    const mp3Path = join(OUT_DIR, `${base}.mp3`)
    const mp4Path = join(OUT_DIR, `${base}.mp4`)
    const coverPath = join(TMP_DIR, `${base}.png`)
    const needMp3 = FORCE || !existsSync(mp3Path)
    const needMp4 = FORMATS.includes('mp4') && (FORCE || !existsSync(mp4Path) || needMp3)

    const { total } = buildSegments(session, voice)

    if (needMp3 || needMp4) {
      console.log(`\n▶ ${session.title} · voix ${voice.label}`)
      if (needMp3) {
        process.stdout.write('   · assemblage des phrases… ')
        buildMp3(session, voice, mp3Path)
        console.log('ok')
      }
      if (needMp4) {
        process.stdout.write('   · vignette… ')
        await sharp(Buffer.from(coverSvg(session, voice))).png().toFile(coverPath)
        console.log('ok')
        process.stdout.write('   · vidéo MP4… ')
        buildMp4(mp3Path, coverPath, mp4Path, total)
        console.log('ok')
      }
    }

    const title = session.title
    if (existsSync(mp3Path)) {
      const bytes = statSync(mp3Path).size
      entries.push({
        id: `hy-export-${base}-mp3`,
        sessionId: session.id,
        voiceId: voice.id,
        format: 'mp3',
        kind: 'export',
        title: `${title} — MP3`,
        subtitle: `Voix ${voice.label} · fichier unique`,
        src: `./media/hypnosis/export/${base}.mp3`,
        fileName: `METHOD-${base}.mp3`,
        mime: 'audio/mpeg',
        bytes,
        duration: fmtDuration(total),
        seconds: Math.round(total),
        version: 1,
        description:
          "Toute la séance en un seul fichier audio : à mettre dans le lecteur du téléphone et à écouter en boucle au lit, avec le minuteur de sommeil du lecteur.",
      })
      console.log(`   ✔ ${base}.mp3 — ${mb(bytes)}`)
    }
    if (existsSync(mp4Path)) {
      const bytes = statSync(mp4Path).size
      entries.push({
        id: `hy-export-${base}-mp4`,
        sessionId: session.id,
        voiceId: voice.id,
        format: 'mp4',
        kind: 'export',
        title: `${title} — MP4`,
        subtitle: `Voix ${voice.label} · vidéo douce`,
        src: `./media/hypnosis/export/${base}.mp4`,
        fileName: `METHOD-${base}.mp4`,
        mime: 'video/mp4',
        bytes,
        duration: fmtDuration(total),
        seconds: Math.round(total),
        version: 1,
        description:
          "La même séance en vidéo, avec une image calme et fixe : pratique pour l'écran d'un téléviseur ou le partage. À lire avec n'importe quel lecteur vidéo.",
      })
      console.log(`   ✔ ${base}.mp4 — ${mb(bytes)}`)
    }
  }
}

/* Manifeste (fichier généré) */
const header = `/* ------------------------------------------------------------------
   exports.js — FICHIER GÉNÉRÉ, NE PAS ÉDITER À LA MAIN
   ------------------------------------------------------------------
   Fichiers « prêts à écouter » (MP3 unique + MP4) produits par
   scripts/generate-hypnosis-export.mjs à partir des voix embarquées.
   Ils sont livrés dans l'app (public/media/hypnosis/export/) : on peut
   donc les télécharger et les écouter hors-ligne, dans n'importe quel
   lecteur.

   Régénérer :  node scripts/generate-hypnosis-export.mjs
------------------------------------------------------------------- */

`
const src =
  header +
  `export const HY_EXPORT_GENERATED_AT = ${JSON.stringify(new Date().toISOString())}\n\n` +
  `export const HY_EXPORTS = ${JSON.stringify(entries, null, 2)}\n`
writeFileSync(MANIFEST, src, 'utf8')

rmSync(TMP_DIR, { recursive: true, force: true })

console.log(`\n✔ ${entries.length} fichier(s) · manifeste écrit : ${MANIFEST}`)
console.log(`  Poids total : ${mb(entries.reduce((t, e) => t + e.bytes, 0))}`)
