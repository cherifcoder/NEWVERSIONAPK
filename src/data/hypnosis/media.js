/* ------------------------------------------------------------------
   media.js — Manifeste des médias du module « Hypnose éricksonienne »
   ------------------------------------------------------------------
   Trois familles de fichiers, toutes générées localement par
   scripts/generate-hypnosis.mjs (aucune API, aucun réseau) :

   1. AMBIANCES  (public/media/hypnosis/ambience/*.wav)
      Boucles sonores de 24 s, lues en boucle pendant la séance.
      WAV PCM 16 bits mono, 11 025 Hz → propres et légères.

   2. SONS       (public/media/hypnosis/sons/*.wav)
      Repères sonores courts : cloche, gong, bol tibétain, souffle.

   3. SCRIPTS    (public/media/hypnosis/voix/*.txt)
      Le texte intégral de chaque séance, à relire hors-ligne.

   Les mêmes fichiers sont disponibles dans le bundle (chemins relatifs) :
   sur l'APK ils sont déjà embarqués dans les assets, sur le web ils sont
   servis par le service worker. Le téléchargement explicite (onglet
   Hors-ligne) ne fait que garantir leur présence.
------------------------------------------------------------------- */

import { SESSIONS } from './sessions.js'

export const HY_KIND_META = {
  ambience: { label: 'Ambiance', icon: 'Waves', tone: 'sapphire', color: '#4a7fd4' },
  cue: { label: 'Repère sonore', icon: 'BellRing', tone: 'jade', color: '#2f9e78' },
  script: { label: 'Script', icon: 'FileText', tone: 'gold', color: '#cfa851' },
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

/* ------------------------- Vue d'ensemble ------------------------- */

export const HY_MEDIA = { ...AMBIENCES, ...CUES, ...SCRIPTS_MEDIA }

export const HY_MEDIA_LIST = Object.values(HY_MEDIA)

export const hyMediaFor = (id) => HY_MEDIA[id] || null

export const ambienceFor = (session) => (session?.ambience ? AMBIENCES[session.ambience] || null : null)

export const AMBIENCE_LIST = Object.values(AMBIENCES)
export const CUE_LIST = Object.values(CUES)
export const SCRIPT_LIST = Object.values(SCRIPTS_MEDIA)

export const TOTAL_HY_BYTES = HY_MEDIA_LIST.reduce((t, m) => t + (m.bytes || 0), 0)

/** Tous les identifiants de médias utiles à une séance (ambiance + script). */
export const sessionMediaIds = (session) => {
  if (!session) return []
  const ids = []
  if (session.ambience) ids.push(session.ambience)
  const scriptId = `hy-txt-${session.id}`
  if (HY_MEDIA[scriptId]) ids.push(scriptId)
  return ids
}
