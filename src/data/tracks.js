/* ------------------------------------------------------------------
   tracks.js — Les 6 piliers d'excellence (« Le Charbon »)
   Chaque pilier : objectif quotidien, unité, couleur, icône Lucide.
------------------------------------------------------------------- */

export const PILLARS = [
  {
    id: 'code',
    label: 'Code & Deep Work',
    short: 'Code',
    unit: 'minutes',
    dailyTarget: 270, // 4h30
    icon: 'Code2',
    color: '#cfa851',
    accent: 'gold',
    description:
      'MERN, mobile, architecture. Le travail profond est la seule monnaie qui achète la liberté technique.',
    ritual: 'Blocs de 90 min, téléphone en mode avion, une seule tâche par bloc.',
  },
  {
    id: 'reading',
    label: 'Savoir & Stratégie',
    short: 'Lecture',
    unit: 'pages',
    dailyTarget: 30,
    icon: 'BookOpen',
    color: '#e0c07c',
    accent: 'gold',
    description:
      'Lecture vorace : stratégie, psychologie, biographie. Un lecteur devient inarrêtable en 3 ans.',
    ritual: '20 pages le matin, 10 pages le soir + 3 notes applicables.',
  },
  {
    id: 'chess',
    label: 'Échecs & Tactique',
    short: 'Échecs',
    unit: 'parties',
    dailyTarget: 2,
    icon: 'Crown',
    color: '#9aa0b5',
    accent: 'slate',
    description:
      "L'échiquier est le seul miroir qui ne flatte jamais. Chaque erreur y est chiffrée et rejouable.",
    ritual: '1 partie longue analysée + 1 série de puzzles tactiques.',
  },
  {
    id: 'islamic',
    label: 'Étude Islamique',
    short: 'Coran',
    unit: 'minutes',
    dailyTarget: 45,
    icon: 'Moon',
    color: '#2f9e78',
    accent: 'jade',
    description:
      'La rigueur spirituelle est le socle : elle donne la constance que la volonté seule ne peut fournir.',
    ritual: 'Lecture du Coran + mémorisation + 1 réflexion écrite.',
  },
  {
    id: 'eloquence',
    label: 'Éloquence & Négociation',
    short: 'Éloquence',
    unit: 'minutes',
    dailyTarget: 30,
    icon: 'Mic',
    color: '#b4323c',
    accent: 'blood',
    description:
      "La parole est une arme de construction massive. Celui qui la maîtrise n'a plus besoin de crier.",
    ritual: '10 min de diction à voix haute + 1 exercice de persuasion.',
  },
  {
    id: 'english',
    label: 'Anglais Business & Rue',
    short: 'Anglais',
    unit: 'minutes',
    dailyTarget: 45,
    icon: 'Languages',
    color: '#4a7fd4',
    accent: 'sapphire',
    description:
      "L'anglais n'est pas une langue étrangère : c'est la langue du marché mondial. Il se conquiert à l'oreille et à la bouche.",
    ritual: '15 min shadowing + 10 expressions idiomatiques + 1 mini-pitch parlé.',
  },
]

export const PILLAR_MAP = Object.fromEntries(PILLARS.map((p) => [p.id, p]))

export const emptyPillars = () => Object.fromEntries(PILLARS.map((p) => [p.id, 0]))

export const DEEP_WORK_BLOCK_MINUTES = 90
