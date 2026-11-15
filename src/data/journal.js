/* ------------------------------------------------------------------
   journal.js — Le Journal de l'Acteur (débrief de fin de journée)
------------------------------------------------------------------- */

export const JOURNAL_QUESTIONS = [
  {
    id: 'break',
    label: 'Rupture de personnage',
    question:
      "À quel moment de fausse route ou de procrastination as-tu brisé le personnage aujourd'hui ?",
    hint: 'Sois précis : heure, déclencheur, ce que tu as fait à la place du rôle.',
    icon: 'AlertTriangle',
    required: true,
  },
  {
    id: 'finish',
    label: 'Zéro abandon',
    question: 'As-tu mené à terme tout ce que tu as commencé ? Si non, qu\'est-ce qui reste ouvert ?',
    hint: 'Nomme chaque boucle laissée ouverte. Pas de vague, pas d\'excuse.',
    icon: 'CheckCircle2',
    required: true,
  },
  {
    id: 'social',
    label: 'Éloquence & entregent',
    question:
      'Comment as-tu géré tes interactions sociales, ta négociation ou ton éloquence aujourd\'hui ?',
    hint: 'Une interaction réussie, une ratée, et la leçon exacte à en tirer.',
    icon: 'Users',
    required: true,
  },
  {
    id: 'deep',
    label: 'Travail profond',
    question: 'Quel a été ton meilleur bloc de concentration, et qu\'as-tu réellement livré ?',
    hint: 'Livrable concret : commit, page écrite, décision prise. Pas d\'intention.',
    icon: 'Target',
    required: true,
  },
  {
    id: 'english',
    label: 'Anglais & parole',
    question: 'As-tu parlé anglais à voix haute aujourd\'hui ? Combien de temps, et sur quoi ?',
    hint: 'Si non : écris-le franchement. Le déni est un luxe que tu ne peux pas t\'offrir.',
    icon: 'Languages',
    required: false,
  },
  {
    id: 'tomorrow',
    label: 'Le crapaud de demain',
    question: 'Quelle est la tâche la plus dure que tu avaleras en premier demain matin ?',
    hint: 'Une seule. Écrite avant de dormir.',
    icon: 'Flame',
    required: true,
  },
]

export const ACTOR_STATES = [
  { id: 'mastery', label: 'Maîtrise', emoji: '◆', min: 90, desc: 'Le rôle t\'a habité toute la journée.' },
  { id: 'conqueror', label: 'Conquérant', emoji: '▲', min: 75, desc: 'Journée forte, quelques fuites mineures.' },
  { id: 'progress', label: 'En progression', emoji: '▬', min: 55, desc: 'Costume porté, scène à moitié jouée.' },
  { id: 'decor', label: 'Décor', emoji: '▽', min: 35, desc: 'Présence physique, absence d\'exécution.' },
  { id: 'figuration', label: 'Figuration', emoji: '○', min: 0, desc: 'Le rôle a été joué par quelqu\'un d\'autre.' },
]

export const stateForScore = (score) =>
  ACTOR_STATES.find((s) => score >= s.min) || ACTOR_STATES.at(-1)
