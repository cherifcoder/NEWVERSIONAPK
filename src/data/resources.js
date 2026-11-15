/* ------------------------------------------------------------------
   resources.js — Bibliothèque de ressources hors-ligne
   (téléchargeables puis consultables sans connexion, façon Busuu)

   Les fichiers livrés sont réels et embarqués dans /public/media :
   posters SVG, pistes audio WAV générées, animation GIF.
   L'utilisateur peut aussi ajouter ses propres URLs (vidéo incluse).
------------------------------------------------------------------- */

export const RESOURCE_CATEGORIES = [
  { id: 'all', label: 'Tout', icon: 'Library' },
  { id: 'rhetoric', label: 'Éloquence', icon: 'Mic' },
  { id: 'english', label: 'Anglais', icon: 'Languages' },
  { id: 'mind', label: 'Esprit', icon: 'Brain' },
  { id: 'body', label: 'Corps', icon: 'Activity' },
  { id: 'strategy', label: 'Stratégie', icon: 'Crown' },
]

export const RESOURCE_TYPES = {
  video: { label: 'Vidéo', icon: 'Play', color: '#b4323c' },
  audio: { label: 'Audio', icon: 'Headphones', color: '#2f9e78' },
  image: { label: 'Visuel', icon: 'Image', color: '#4a7fd4' },
  text: { label: 'Brief', icon: 'FileText', color: '#cfa851' },
}

export const RESOURCES = [
  {
    id: 'res-posture',
    title: 'Le corps qui commande',
    subtitle: 'Cycle de posture — présence physique d\'élite',
    category: 'body',
    type: 'image',
    url: './media/posters/posture.svg',
    duration: 'Visuel',
    description:
      "Planche visuelle des 4 micro-gestes : s'asseoir, marcher, ouvrir une porte, tenir un verre. À consulter avant chaque situation sociale importante.",
    tags: ['posture', 'présence', 'micro-gestes'],
  },
  {
    id: 'res-breathing',
    title: 'Recalibrage 4-7-8',
    subtitle: 'Piste audio de cohérence cardiaque (4 cycles)',
    category: 'body',
    type: 'audio',
    url: './media/audio/breathing-478.wav',
    duration: '1:52',
    description:
      "Guide sonore de respiration 4-7-8 pour basculer dans l'état du personnage avant une négociation ou un bloc de travail profond.",
    tags: ['respiration', 'dispenza', 'état'],
  },
  {
    id: 'res-metronome',
    title: 'Métronome de diction',
    subtitle: 'Cadence 90 BPM pour les virelangues et la lecture à voix haute',
    category: 'rhetoric',
    type: 'audio',
    url: './media/audio/metronome-90.wav',
    duration: '2:00',
    description:
      "Un mot par battement, articulation nette, aucune syllabe avalée. Utilise-le pour les exercices de diction et le shadowing anglais.",
    tags: ['diction', 'rythme', 'shadowing'],
  },
  {
    id: 'res-drill-motion',
    title: 'Drill de séquence — Zéro Abandon',
    subtitle: 'Animation de rappel : commencer → tenir → livrer',
    category: 'strategy',
    type: 'image',
    url: './media/motion/drill-loop.svg',
    duration: 'Boucle',
    description:
      "Rappel visuel de la règle d'or : une boucle ouverte à la fois. À afficher en fond d'écran ou à consulter avant de lancer un nouveau projet.",
    tags: ['zéro abandon', 'discipline', 'séquence'],
  },
  {
    id: 'res-pantheon',
    title: 'Panthéon des modèles',
    subtitle: 'Planche d\'étude — les 5 archétypes',
    category: 'strategy',
    type: 'image',
    url: './media/posters/pantheon.svg',
    duration: 'Visuel',
    description:
      "Carte mentale des 5 archétypes : traits dominants, voix, posture, réaction sous pression. Support d'étude pour la Character Bible.",
    tags: ['archétypes', 'method acting', 'identité'],
  },
  {
    id: 'res-rhetoric-map',
    title: 'Carte de rhétorique',
    subtitle: 'Structure PREP + 6 outils de persuasion',
    category: 'rhetoric',
    type: 'image',
    url: './media/posters/rhetoric.svg',
    duration: 'Visuel',
    description:
      "Mémo visuel : Point-Raison-Exemple-Point, contraste, recadrage de valeur, triple alternative. À garder ouvert pendant une préparation de réunion.",
    tags: ['rhétorique', 'persuasion', 'prep'],
  },
  {
    id: 'res-english-board',
    title: 'Business & Street Board',
    subtitle: '20 idiomes anglais en contexte',
    category: 'english',
    type: 'image',
    url: './media/posters/english.svg',
    duration: 'Visuel',
    description:
      "Tableau des expressions essentielles du business anglophone et de la rue, avec leur usage en phrase réelle.",
    tags: ['anglais', 'idiomes', 'business'],
  },
  {
    id: 'res-battle-plan',
    title: 'Battle Plan — Méthode METHOD',
    subtitle: 'Brief de lecture : le protocole complet en 1 page',
    category: 'mind',
    type: 'text',
    url: './media/texts/battle-plan.txt',
    duration: '5 min de lecture',
    description:
      "Le condensé opérationnel du système : les 6 piliers, la règle Zéro Abandon, le protocole matinal et le débrief du soir.",
    tags: ['protocole', 'méthode', 'lecture'],
  },
  {
    id: 'res-deepwork-brief',
    title: 'Deep Work — Protocole 90 minutes',
    subtitle: 'Brief de lecture : préparation, exécution, clôture',
    category: 'mind',
    type: 'text',
    url: './media/texts/deep-work.txt',
    duration: '4 min de lecture',
    description:
      "Le protocole exact d'un bloc de travail profond : déclaration d'intention, isolation, clôture et traçabilité.",
    tags: ['deep work', 'focus', 'protocole'],
  },
]

export const RESOURCE_MAP = Object.fromEntries(RESOURCES.map((r) => [r.id, r]))
