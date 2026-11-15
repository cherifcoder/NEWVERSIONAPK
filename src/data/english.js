/* ------------------------------------------------------------------
   english.js — Immersion Anglais « Business & Street »
------------------------------------------------------------------- */

export const ENGLISH_IDIOMS = [
  { en: 'to move the needle', fr: 'faire bouger les choses de façon mesurable', use: '« This feature will really move the needle on retention. »' },
  { en: 'to cut to the chase', fr: 'aller droit au but', use: '« Let me cut to the chase: we need a decision today. »' },
  { en: 'a ballpark figure', fr: 'un ordre de grandeur', use: '« Give me a ballpark figure, we\'ll refine later. »' },
  { en: 'to touch base', fr: 'prendre contact / faire un point', use: '« I\'ll touch base with you on Friday. »' },
  { en: 'to be on the same page', fr: 'être alignés', use: '« Let\'s make sure we\'re on the same page before the call. »' },
  { en: 'to circle back', fr: 'revenir sur le sujet plus tard', use: '« Let\'s circle back once we have the numbers. »' },
  { en: 'low-hanging fruit', fr: 'le gain facile', use: '« We\'ll grab the low-hanging fruit first. »' },
  { en: 'to pull the trigger', fr: 'se décider / lancer', use: '« We\'re ready, we just need to pull the trigger. »' },
  { en: 'a game changer', fr: 'un tournant décisif', use: '« That partnership is a real game changer. »' },
  { en: 'to own it', fr: 'assumer pleinement', use: '« I own it — my mistake, here\'s the fix. »' },
  { en: 'no strings attached', fr: 'sans contrepartie', use: '« I\'ll send it over, no strings attached. »' },
  { en: 'to play hardball', fr: 'jouer dur', use: '« If they play hardball, we walk away. »' },
  { en: 'to keep someone in the loop', fr: 'tenir informé', use: '« Keep me in the loop on that thread. »' },
  { en: 'a long shot', fr: 'peu probable mais tentable', use: '« It\'s a long shot, but worth the email. »' },
  { en: 'to take it offline', fr: 'en discuter en privé', use: '« Let\'s take it offline and sort it out. »' },
  { en: 'to have skin in the game', fr: 'être personnellement engagé', use: '« I have skin in the game — I built it. »' },
  { en: 'to make a killing', fr: 'faire fortune', use: '« They made a killing on that launch. »' },
  { en: 'to drop the ball', fr: 'rater son coup / lâcher la balle', use: '« We dropped the ball on QA last week. »' },
  { en: 'back to square one', fr: 'retour à la case départ', use: '« The client refused — back to square one. »' },
  { en: 'to be swamped', fr: 'être débordé', use: '« I\'m swamped until Thursday. »' },
]

export const ENGLISH_STREET = [
  { en: 'What\'s good?', fr: 'Quoi de neuf ? (salutation informelle)', register: 'Rue' },
  { en: 'I\'m not gonna lie (NGL)', fr: 'Je ne vais pas mentir', register: 'Rue' },
  { en: 'That\'s a steal', fr: 'C\'est une affaire en or', register: 'Rue' },
  { en: 'He\'s got it going on', fr: 'Il assure / il a tout compris', register: 'Rue' },
  { en: 'Cut it out', fr: 'Arrête ça', register: 'Rue' },
  { en: 'I\'m all ears', fr: 'Je t\'écoute attentivement', register: 'Neutre' },
  { en: 'Fair enough', fr: 'D\'accord, c\'est juste', register: 'Neutre' },
  { en: 'That\'s on me', fr: 'C\'est ma faute / c\'est pour moi', register: 'Neutre' },
  { en: 'Let\'s bounce', fr: 'On se casse / on y va', register: 'Rue' },
  { en: 'Keep it 100', fr: 'Reste honnête à 100 %', register: 'Rue' },
]

export const ENGLISH_BUSINESS_PHRASES = [
  { en: 'I\'d like to walk you through our approach.', fr: 'J\'aimerais vous présenter notre approche.' },
  { en: 'Just to be clear on the scope —', fr: 'Juste pour clarifier le périmètre —' },
  { en: 'What would a successful outcome look like for you?', fr: 'À quoi ressemblerait un résultat réussi pour vous ?' },
  { en: 'Let me play devil\'s advocate for a second.', fr: 'Laissez-moi jouer l\'avocat du diable un instant.' },
  { en: 'I\'ll follow up with a written summary.', fr: 'Je vous enverrai un récapitulatif écrit.' },
  { en: 'We can have that delivered by end of week.', fr: 'Nous pouvons livrer ça avant la fin de semaine.' },
  { en: 'That works for me — let\'s lock it in.', fr: 'Ça me convient — on valide.' },
  { en: 'I appreciate you making the time.', fr: 'Merci de m\'avoir accordé du temps.' },
  { en: 'Correct me if I\'m wrong, but —', fr: 'Corrigez-moi si je me trompe, mais —' },
  { en: 'Let\'s keep this tight and actionable.', fr: 'Restons concis et opérationnels.' },
  { en: 'I\'m confident we can turn this around.', fr: 'Je suis convaincu que nous pouvons retourner la situation.' },
  { en: 'Shall we move forward?', fr: 'Est-ce qu\'on avance ?' },
]

export const ENGLISH_MODULES = [
  {
    id: 'en-shadowing',
    title: 'Shadowing — 15 min',
    goal: 'Accent, rythme, liaison. La langue s\'attrape à l\'oreille.',
    steps: [
      'Choisis un extrait audio/vidéo de 60 à 90 secondes (podcast, discours, série).',
      'Écoute 1 fois sans lire. Note le sujet.',
      'Réécoute en répétant à voix haute, en même temps que le locuteur (shadowing).',
      'Enregistre-toi en train de reproduire l\'extrait seul. Compare le rythme, pas les mots.',
    ],
  },
  {
    id: 'en-idioms',
    title: '10 idiomes en contexte',
    goal: 'Ne jamais apprendre un mot seul : toujours dans une phrase que tu peux dire.',
    steps: [
      'Prends 5 idiomes business + 5 expressions de rue du jour.',
      'Pour chacun, écris UNE phrase sur ta propre vie.',
      'Dis-les à voix haute, sans lire, en une seule respiration.',
      'Le soir, restitue-en 5 sans regarder.',
    ],
  },
  {
    id: 'en-pitch',
    title: 'Mini-pitch parlé (60 s)',
    goal: 'Parler de ton projet en anglais comme un natif du business.',
    steps: [
      'Structure : Problem → Cost → Solution → Proof → Ask.',
      'Écris 5 phrases en anglais. Maximum 12 mots par phrase.',
      'Chronomètre 60 secondes à voix haute, 3 fois.',
      'Enregistre la 3e version. C\'est ta version de référence.',
    ],
  },
  {
    id: 'en-think',
    title: 'Pensée en anglais (monologue interne)',
    goal: 'Arrêter de traduire : penser directement.',
    steps: [
      'Choisis 3 moments de la journée (réveil, trajet, douche).',
      'Pendant 5 minutes, décris ce que tu fais, en anglais, à voix basse.',
      'Interdiction de traduire depuis le français. Si un mot manque, contourne.',
      'Note les 3 mots manquants à apprendre.',
    ],
  },
]

export const ENGLISH_LEVELS = [
  { id: 'a2', label: 'A2 — Survie', target: 'Se présenter, commander, demander son chemin.' },
  { id: 'b1', label: 'B1 — Autonomie', target: 'Tenir une conversation professionnelle simple.' },
  { id: 'b2', label: 'B2 — Opérationnel', target: 'Négocier, argumenter, plaisanter en réunion.' },
  { id: 'c1', label: 'C1 — Autorité', target: 'Convaincre, improviser, diriger une salle en anglais.' },
]
