/* ------------------------------------------------------------------
   media.js — Manifeste des médias du module « Hypnose éricksonienne »
   ------------------------------------------------------------------
   Quatre familles de fichiers, toutes embarquées et disponibles hors-ligne :

   1. AMBIANCES  (public/media/hypnosis/ambience/*.wav)
      Boucles sonores de 24 s, lues en boucle pendant la séance.
      WAV PCM 16 bits mono, 11 025 Hz → propres et légères.

   2. SONS       (public/media/hypnosis/sons/*.wav)
      Repères sonores courts : cloche, gong, bol tibétain, souffle.

   3. SCRIPTS    (public/media/hypnosis/voix/*.txt)
      Le texte intégral de chaque séance, à relire hors-ligne.

   4. VOIX       (public/media/hypnosis/voix/<voix>/<séance>/*.mp3)
      La voix neuronale française de chaque phrase, enregistrée une fois
      pour toutes par scripts/generate-hypnosis-voice.mjs (manifeste
      voiceTracks.js). Identique sur tous les appareils, douce et humaine,
      sans synthèse vocale du système.

   Les mêmes fichiers sont disponibles dans le bundle (chemins relatifs) :
   sur l'APK ils sont déjà embarqués dans les assets, sur le web ils sont
   servis par le service worker. Le téléchargement explicite (onglet
   Hors-ligne) ne fait que garantir leur présence.
------------------------------------------------------------------- */

import { SESSIONS } from './sessions.js'
import { NEURAL_VOICES, VOICE_ENGINE, VOICE_GENERATED_AT, VOICE_SAMPLE, VOICE_TOTALS, VOICE_TRACKS } from './voiceTracks.js'
import { HY_EXPORTS } from './exports.js'

export { VOICE_ENGINE, VOICE_GENERATED_AT }

export const HY_KIND_META = {
  ambience: { label: 'Ambiance', icon: 'Waves', tone: 'sapphire', color: '#4a7fd4' },
  cue: { label: 'Repère sonore', icon: 'BellRing', tone: 'jade', color: '#2f9e78' },
  script: { label: 'Script', icon: 'FileText', tone: 'gold', color: '#cfa851' },
  voice: { label: 'Voix neuronale', icon: 'AudioLines', tone: 'gold', color: '#e0c07c' },
  export: { label: 'Écoute nocturne', icon: 'Moon', tone: 'gold', color: '#cfa851' },
}

const ambience = (id, title, subtitle, src, bytes, description) => ({
  id,
  kind: 'ambience',
  title,
  subtitle,
  src,
  bytes,
  duration: '0:24',
  version: 1,
  loop: true,
  description,
})

const cue = (id, title, subtitle, src, bytes, description) => ({
  id,
  kind: 'cue',
  title,
  subtitle,
  src,
  bytes,
  duration: '0:04',
  version: 1,
  description,
})

const script = (id, title, subtitle, src, bytes, description) => ({
  id,
  kind: 'script',
  title,
  subtitle,
  src,
  bytes,
  duration: '5 min de lecture',
  version: 1,
  description,
})

/* --------------------------- Ambiances --------------------------- */

export const AMBIENCES = {
  'hy-amb-nappe-basse': ambience(
    'hy-amb-nappe-basse',
    'Nappe basse — souffle doré',
    'Nappe chaude et continue, sans mélodie',
    './media/hypnosis/ambience/nappe-basse.wav',
    535858,
    "Une nappe de fréquences basses qui berce l'oreille sans jamais attirer l'attention. Idéale pour l'induction, le focus et la répétition mentale.",
  ),
  'hy-amb-pluie-douce': ambience(
    'hy-amb-pluie-douce',
    'Pluie douce',
    'Pluie fine filtrée, régulière',
    './media/hypnosis/ambience/pluie-douce.wav',
    535858,
    'Une pluie fine et régulière, filtrée pour ne garder que le souffle. Le fond sonore le plus efficace pour travailler.',
  ),
  'hy-amb-vagues': ambience(
    'hy-amb-vagues',
    'Vagues lentes',
    'Ressac lent, respiration de l\'océan',
    './media/hypnosis/ambience/vagues.wav',
    535858,
    "Des vagues lentes qui montent et redescendent au rythme d'une respiration calme. Parfait pour l'endormissement.",
  ),
  'hy-amb-foret-nuit': ambience(
    'hy-amb-foret-nuit',
    'Forêt de nuit',
    'Souffle du vent et grillons lointains',
    './media/hypnosis/ambience/foret-nuit.wav',
    535858,
    "Le vent dans les feuilles et quelques grillons lointains : un lieu sûr, vivant et rassurant.",
  ),
  'hy-amb-feu-doux': ambience(
    'hy-amb-feu-doux',
    'Feu de cheminée',
    'Crépitements doux et chaleur sourde',
    './media/hypnosis/ambience/feu-doux.wav',
    535858,
    "Un feu qui crépite doucement. À utiliser pour la lecture des scripts ou une détente d'intérieur.",
  ),
}

/* ---------------------------- Sons ---------------------------- */

export const CUES = {
  'hy-son-cloche-claire': cue(
    'hy-son-cloche-claire',
    'Cloche claire',
    'Repère de transition de phase',
    './media/hypnosis/sons/cloche-claire.wav',
    79424,
    "Un tintement cristallin qui marque le passage d'une phase à l'autre sans casser l'état de détente.",
  ),
  'hy-son-gong-doux': cue(
    'hy-son-gong-doux',
    'Gong doux',
    'Ouverture et fermeture de séance',
    './media/hypnosis/sons/gong-doux.wav',
    114704,
    'Un gong grave et enveloppant : on l\'entend au début, on le retrouve à la fin.',
  ),
  'hy-son-bol-tibetain': cue(
    'hy-son-bol-tibetain',
    'Bol tibétain',
    'Résonance longue pour l\'ancrage',
    './media/hypnosis/sons/bol-tibetain.wav',
    141164,
    'Un bol qui vibre longuement, avec des harmoniques qui se superposent. Excellent support d\'ancrage.',
  ),
  'hy-son-souffle-entree': cue(
    'hy-son-souffle-entree',
    'Souffle — inspiration',
    'Repère sonore d\'inspiration',
    './media/hypnosis/sons/souffle-entree.wav',
    88244,
    'Un souffle qui monte, pour accompagner l\'inspiration guidée.',
  ),
  'hy-son-souffle-sortie': cue(
    'hy-son-souffle-sortie',
    'Souffle — expiration',
    'Repère sonore d\'expiration',
    './media/hypnosis/sons/souffle-sortie.wav',
    110294,
    'Un souffle qui redescend, pour accompagner l\'expiration longue.',
  ),
}

/* --------------------------- Scripts --------------------------- */

export const SCRIPTS_MEDIA = Object.fromEntries(
  SESSIONS.map((s) => [
    `hy-txt-${s.id}`,
    script(
      `hy-txt-${s.id}`,
      `Script — ${s.title}`,
      s.subtitle,
      `./media/hypnosis/voix/${s.id}.txt`,
      3200,
      `Texte intégral de la séance « ${s.title} », phase par phase, à relire ou à prêter.`,
    ),
  ]),
)

/* ------------------------ Voix neuronales ------------------------ */

/**
 * Voix neuronales embarquées (générées par generate-hypnosis-voice.mjs).
 * Chaque séance est découpée en phrases : un MP3 par phrase, mis bout à
 * bout par le lecteur, qui place lui-même les silences. C'est ce qui donne
 * un rythme lent, respiré, et une mise en évidence exacte de la phrase lue.
 */
export const NEURAL_VOICE_LIST = NEURAL_VOICES

export const NEURAL_VOICE_DEFAULT = NEURAL_VOICES[0]?.id || null

export const voiceSampleSrc = (voiceId) => VOICE_SAMPLE[voiceId] || null

/** Statistiques d'une voix : { seconds, bytes, lines }. */
export const voiceStats = (voiceId) => VOICE_TOTALS[voiceId] || null

/** Données d'une voix pour une séance : { [phaseId]: { lines, seconds, bytes } }. */
export const voiceTrack = (sessionId, voiceId) => VOICE_TRACKS[voiceId]?.[sessionId] || null

/** Une phase : { lines: [{ src, seconds, bytes }], seconds, bytes } | null. */
export const voicePhase = (sessionId, voiceId, phaseId) => VOICE_TRACKS[voiceId]?.[sessionId]?.[phaseId] || null

/** Une voix neuronale embarquée existe-t-elle pour cette séance ? */
export const hasNeuralVoice = (sessionId) =>
  NEURAL_VOICES.some((v) => Boolean(VOICE_TRACKS[v.id]?.[sessionId]))

const voiceItem = (voice, session, phase, line, index) => ({
  id: `hy-voix-${voice.id}-${session.id}-${phase.id}-${String(index).padStart(2, '0')}`,
  kind: 'voice',
  title: `${session.title} · ${phase.title}`,
  subtitle: `${voice.label} — phrase ${index + 1}`,
  src: line.src,
  bytes: line.bytes,
  duration: `${Math.round(line.seconds)} s`,
  version: 1,
  voiceId: voice.id,
  sessionId: session.id,
  phaseId: phase.id,
  lineIndex: index,
  description: `Phrase ${index + 1} de la phase « ${phase.title} » (${session.title}), dite par la voix ${voice.label}.`,
})

export const VOICE_MEDIA = {}
for (const voice of NEURAL_VOICES) {
  for (const session of SESSIONS) {
    const byPhase = VOICE_TRACKS[voice.id]?.[session.id] || {}
    for (const phase of session.phases) {
      const track = byPhase[phase.id]
      if (!track) continue
      track.lines.forEach((line, index) => {
        const item = voiceItem(voice, session, phase, line, index)
        VOICE_MEDIA[item.id] = item
      })
    }
  }
}

export const VOICE_MEDIA_LIST = Object.values(VOICE_MEDIA)

export const voiceMediaList = (voiceId) => VOICE_MEDIA_LIST.filter((m) => m.voiceId === voiceId)

export const VOICE_TOTAL_BYTES = VOICE_MEDIA_LIST.reduce((t, m) => t + (m.bytes || 0), 0)

/* --------------------- Fichiers prêts à écouter --------------------- */

/**
 * Exports « prêts à écouter » (MP3 unique + MP4), générés par
 * scripts/generate-hypnosis-export.mjs. Ce sont de vrais fichiers
 * téléchargeables, à écouter en boucle la nuit dans n'importe quel lecteur.
 */
export const EXPORT_MEDIA = Object.fromEntries(HY_EXPORTS.map((e) => [e.id, e]))

export const EXPORT_LIST = HY_EXPORTS

/** Exports disponibles pour une séance (MP3 et/ou MP4). */
export const exportMediaFor = (sessionId) => HY_EXPORTS.filter((e) => e.sessionId === sessionId)

export const hasExports = (sessionId) => exportMediaFor(sessionId).length > 0

/* ------------------------- Vue d'ensemble ------------------------- */

export const HY_MEDIA = { ...AMBIENCES, ...CUES, ...SCRIPTS_MEDIA, ...VOICE_MEDIA, ...EXPORT_MEDIA }

export const HY_MEDIA_LIST = Object.values(HY_MEDIA)

export const hyMediaFor = (id) => HY_MEDIA[id] || null

export const ambienceFor = (session) => (session?.ambience ? AMBIENCES[session.ambience] || null : null)

export const AMBIENCE_LIST = Object.values(AMBIENCES)
export const CUE_LIST = Object.values(CUES)
export const SCRIPT_LIST = Object.values(SCRIPTS_MEDIA)

export const TOTAL_HY_BYTES = HY_MEDIA_LIST.reduce((t, m) => t + (m.bytes || 0), 0)

/** Tous les identifiants de médias utiles à une séance (ambiance + script + voix + exports). */
export const sessionMediaIds = (session) => {
  if (!session) return []
  const ids = []
  if (session.ambience) ids.push(session.ambience)
  const scriptId = `hy-txt-${session.id}`
  if (HY_MEDIA[scriptId]) ids.push(scriptId)
  for (const m of VOICE_MEDIA_LIST) if (m.sessionId === session.id) ids.push(m.id)
  for (const e of HY_EXPORTS) if (e.sessionId === session.id) ids.push(e.id)
  return ids
}
