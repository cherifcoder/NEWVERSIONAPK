/* ------------------------------------------------------------------
   media.js — Manifeste des médias du module non verbal
   ------------------------------------------------------------------
   Deux familles, volontairement séparées :

   1. INLINE (0 octet, 0 téléchargement)
      Les illustrations et mini-vidéos sont du SVG vectoriel calculé à
      la volée (src/lib/figure.js). Elles font partie du bundle : elles
      sont donc disponibles hors-ligne par construction, à n'importe
      quelle résolution, et ne coûtent rien en stockage.

   2. TÉLÉCHARGEABLES (MEDIA)
      Audio (pistes WAV de cadence / souffle) et textes (scénarios,
      fiches, exercices). Ce sont les seuls fichiers que l'utilisateur
      télécharge — quelques mégaoctets pour tout le cours.

   Les vidéos réelles (.mp4) sont supportées : si une leçon déclare
   `videoUrl`, elle est traitée comme un média téléchargeable classique
   (voir lessonMediaIds() et OfflineManager).
------------------------------------------------------------------- */

import { DRILL_MAP, FICHE_MAP, SCRIPT_MAP, drillToText, ficheToText, scriptToText } from './scripts'

export const KIND_META = {
  audio: { label: 'Audio', icon: 'Headphones', tone: 'jade', color: '#2f9e78' },
  text: { label: 'Lecture', icon: 'FileText', tone: 'gold', color: '#cfa851' },
  video: { label: 'Vidéo', icon: 'Video', tone: 'blood', color: '#b4323c' },
  illustration: { label: 'Illustration', icon: 'PersonStanding', tone: 'sapphire', color: '#4a7fd4' },
}

const audio = (id, title, subtitle, src, bytes, duration, description) => ({
  id,
  kind: 'audio',
  title,
  subtitle,
  src,
  bytes,
  duration,
  version: 1,
  description,
})

const text = (id, title, subtitle, src, description) => ({
  id,
  kind: 'text',
  title,
  subtitle,
  src,
  bytes: 4096,
  duration: '3 min de lecture',
  version: 1,
  description,
})

/* ------------------------- Médias téléchargeables ------------------------- */

export const MEDIA = {
  /* --- Audio : cadence, souffle, appuis --- */
  'aud-cadence-lente': audio(
    'aud-cadence-lente',
    'Cadence lente — 60 mots/minute',
    'Métronome 60 BPM pour la diction posée',
    './media/nonverbal/audio/cadence-lente.wav',
    480000,
    '1:00',
    'Un mot par battement. Pour les virelangues et la lecture à voix haute lente : articulation nette, aucune syllabe avalée.',
  ),
  'aud-cadence-parole': audio(
    'aud-cadence-parole',
    'Cadence de parole — 110 mots/minute',
    'Métronome 110 BPM, débit naturel de présentation',
    './media/nonverbal/audio/cadence-parole.wav',
    480000,
    '1:00',
    'Cadence cible d\'une prise de parole en public. Ni trop lent (condescendant), ni trop rapide (anxieux).',
  ),
  'aud-souffle-345': audio(
    'aud-souffle-345',
    'Souffle 3-4-5',
    'Trois cycles de respiration ventrale guidée',
    './media/nonverbal/audio/souffle-345.wav',
    380000,
    '0:40',
    'Inspiration 3 s, apnée 4 s, expiration 5 s. À faire avant de franchir une porte ou de prendre la parole.',
  ),
  'aud-appui-syllabes': audio(
    'aud-appui-syllabes',
    'Appuis de syllabes',
    'Quatre motifs rythmiques pour l\'accentuation',
    './media/nonverbal/audio/appui-syllabes.wav',
    320000,
    '0:45',
    'Motifs binaires et ternaires pour travailler l\'accentuation française : on entend la structure de la phrase, pas seulement les mots.',
  ),

  /* --- Textes : scénarios des mini-vidéos --- */
  'txt-scr-entrer': text('txt-scr-entrer', 'Scénario — Entrer et s\'arrêter', 'Découpage complet du mini-film', './media/nonverbal/texts/scr-entrer.txt', 'Plan par plan : action visible et voix off de la leçon 2.'),
  'txt-scr-assise': text('txt-scr-assise', 'Scénario — Posture assise', 'Découpage complet du mini-film', './media/nonverbal/texts/scr-assise.txt', 'Oreille-épaule-hanche, mains visibles, appuis au sol.'),
  'txt-scr-saluer': text('txt-scr-saluer', 'Scénario — Saluer', 'Découpage complet du mini-film', './media/nonverbal/texts/scr-saluer.txt', 'Regard, main, prénom : la première impression en 1 minute.'),
  'txt-scr-presenter': text('txt-scr-presenter', 'Scénario — Se présenter', 'Découpage complet du mini-film', './media/nonverbal/texts/scr-presenter.txt', 'La formule prénom / rôle / intention en 20 secondes.'),
  'txt-scr-elocution': text('txt-scr-elocution', 'Scénario — Lecture à voix haute', 'Découpage complet du mini-film', './media/nonverbal/texts/scr-elocution.txt', 'Échauffement, métronome, respiration, projection.'),
  'txt-scr-service': text('txt-scr-service', 'Scénario — Demander un service', 'Découpage complet du mini-film', './media/nonverbal/texts/scr-service.txt', 'Demande → raison → durée → porte de sortie.'),
  'txt-scr-sortir': text('txt-scr-sortir', 'Scénario — Sortir d\'une pièce', 'Découpage complet du mini-film', './media/nonverbal/texts/scr-sortir.txt', 'Sortir sans fuir : terminer, saluer, tourner les épaules en dernier.'),

  /* --- Fiche pratique --- */
  'txt-fiche-observation': text('txt-fiche-observation', 'Grille d\'observation', 'Fiche pratique à relire avant une situation sociale', './media/nonverbal/texts/fiche-observation.txt', 'Les 5 signaux qui parlent avant toi, le protocole d\'entrée en 6 temps, les erreurs à éliminer.'),

  /* --- Exercices d'élocution --- */
  'txt-drill-virelangue-1': text('txt-drill-virelangue-1', 'Exercice — Virelangue 1', 'Consonnes d\'attaque, 60 BPM', './media/nonverbal/texts/drill-virelangue-1.txt', 'Chaussettes de l\'archiduchesse : consonnes qui claquent, syllabes complètes.'),
  'txt-drill-virelangue-2': text('txt-drill-virelangue-2', 'Exercice — Virelangue 2', 'Groupes consonantiques, 60 BPM', './media/nonverbal/texts/drill-virelangue-2.txt', 'Le chasseur sachant chasser : pauses réelles à la ponctuation.'),
  'txt-drill-projection': text('txt-drill-projection', 'Exercice — Projection', 'Viser le dernier rang, 110 BPM', './media/nonverbal/texts/drill-projection.txt', 'Volume constant, épaules basses, silence de deux secondes à la fin.'),
  'txt-drill-respiration': text('txt-drill-respiration', 'Exercice — Respiration', 'Ponctuer par le souffle', './media/nonverbal/texts/drill-respiration.txt', 'Trois cycles 3-4-5, puis une phrase de présentation d\'un seul souffle.'),
}

export const MEDIA_LIST = Object.values(MEDIA)

export const mediaFor = (id) => MEDIA[id] || null

export const TOTAL_MEDIA_BYTES = MEDIA_LIST.reduce((t, m) => t + (m.bytes || 0), 0)

/* ------------------------- Texte embarqué (lecture) ------------------------- */
/**
 * Le texte des scénarios / fiches / exercices est aussi disponible en clair,
 * directement dans le bundle : la lecture fonctionne donc même avant tout
 * téléchargement (le .txt téléchargé sert de version hors-ligne figée et
 * partageable). Une seule source de vérité : ./scripts.js.
 */
export const inlineTextFor = (mediaId) => {
  if (!mediaId) return null
  const key = mediaId.replace(/^txt-/, '')
  if (SCRIPT_MAP[key]) return scriptToText(SCRIPT_MAP[key])
  if (FICHE_MAP[key]) return ficheToText(FICHE_MAP[key])
  if (DRILL_MAP[key]) return drillToText(DRILL_MAP[key])
  return null
}

/* ---------------------------- Clips inline ---------------------------- */
/**
 * Séquence animée de postures (mini-vidéo vectorielle).
 * `frames` = identifiants de postures (src/lib/figure.js → POSES).
 */
export const CLIPS = {
  'clip-enter': {
    id: 'clip-enter',
    title: 'Entrer, s\'arrêter, scanner',
    subtitle: 'Franchir · deux pas · arrêt net',
    hold: 2.6,
    frames: ['enter-stop', 'enter-scan', 'stand-neutral'],
  },
  'clip-walk': {
    id: 'clip-walk',
    title: 'Marcher 20 % plus lentement',
    subtitle: 'Pas posés · regard horizontal',
    hold: 2.4,
    frames: ['walk-slow', 'stand-neutral'],
  },
  'clip-seat': {
    id: 'clip-seat',
    title: 'S\'installer et écouter',
    subtitle: 'Oreille-épaule-hanche',
    hold: 3,
    frames: ['seat-upright', 'listen-active'],
  },
  'clip-handshake': {
    id: 'clip-handshake',
    title: 'Saluer et se présenter',
    subtitle: 'Regard · main · prénom',
    hold: 2.6,
    frames: ['handshake', 'present-open'],
  },
  'clip-exit': {
    id: 'clip-exit',
    title: 'Sortir sans fuir',
    subtitle: 'Terminer · saluer · partir',
    hold: 2.8,
    frames: ['exit-turn', 'stand-neutral'],
  },
  'clip-elocution': {
    id: 'clip-elocution',
    title: 'Souffle, voix, geste',
    subtitle: 'La boucle de la prise de parole',
    hold: 2.6,
    frames: ['breath-low', 'present-open', 'speak-gesture'],
  },
  'clip-service': {
    id: 'clip-service',
    title: 'Demander un service',
    subtitle: 'Demande · silence · merci précis',
    hold: 2.6,
    frames: ['ask-service', 'listen-active'],
  },
}

export const CLIP_LIST = Object.values(CLIPS)
export const clipFor = (id) => CLIPS[id] || null
