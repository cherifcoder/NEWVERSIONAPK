/* ------------------------------------------------------------------
   eloquence.js — Hub « Éloquence, Négociation & Entregent »
------------------------------------------------------------------- */

export const RHETORIC_DRILLS = [
  {
    id: 'dict-1',
    title: 'Diction — les virelangues d\'élite',
    duration: '6 min',
    goal: 'Articulation nette, aucune syllabe avalée.',
    steps: [
      '« Les chaussettes de l\'archiduchesse sont-elles sèches, archi-sèches ? » ×5 lentement.',
      '« Un chasseur sachant chasser doit savoir chasser sans son chien. » ×5 en accélérant.',
      'Relis ton texte de référence en sur-articulant chaque consonne, 2 minutes.',
      'Termine par 60 secondes en débit normal : tu dois entendre la différence.',
    ],
    metric: 'Aucune reprise, aucune hésitation sur la dernière série.',
  },
  {
    id: 'dict-2',
    title: 'Le ton en 4 couleurs',
    duration: '8 min',
    goal: 'Contrôler l\'émotion transmise, pas seulement le mot.',
    steps: [
      'Prends une phrase neutre : « Nous allons régler ce dossier cette semaine. »',
      'Dis-la en 4 tons : calme d\'autorité, chaleureux, glacial, enthousiaste.',
      'Enregistre-toi. Réécoute. Note laquelle était crédible et pourquoi.',
      'Choisis la meilleure et garde-la pour ta prochaine réunion.',
    ],
    metric: 'Un enregistrement produit + une auto-évaluation écrite.',
  },
  {
    id: 'dict-3',
    title: 'Le silence comme ponctuation',
    duration: '5 min',
    goal: 'Utiliser le silence pour créer de l\'autorité.',
    steps: [
      'Lis un paragraphe à voix haute en marquant une pause de 2 secondes après chaque idée forte.',
      'Refais-le en remplaçant les mots de remplissage (« euh », « en fait », « genre ») par un silence.',
      'Note le nombre de silences tenus.',
    ],
    metric: 'Zéro mot de remplissage sur la seconde lecture.',
  },
  {
    id: 'dict-4',
    title: 'Structure PREP',
    duration: '10 min',
    goal: 'Répondre à n\'importe quelle question de façon inattaquable.',
    steps: [
      'P — Point : ton affirmation en une phrase.',
      'R — Raison : pourquoi, en une phrase.',
      'E — Exemple : un fait, un chiffre, une anecdote courte.',
      'P — Point : répète ton affirmation, formulée autrement.',
      'Applique PREP à une question réelle qu\'on t\'a posée récemment.',
    ],
    metric: 'Une réponse PREP complète, chronométrée sous 60 secondes.',
  },
  {
    id: 'dict-5',
    title: 'La voix grave (résonance)',
    duration: '5 min',
    goal: 'Descendre la voix dans la poitrine : crédibilité immédiate.',
    steps: [
      'Main sur le sternum. Prononce « mmm » jusqu\'à sentir la vibration dans la poitrine.',
      'Descends progressivement le ton jusqu\'au plus grave confortable.',
      'Lis 3 phrases à cette hauteur, sans forcer la gorge.',
      'Termine par une expiration longue et contrôlée.',
    ],
    metric: 'Trois phrases tenues sans casser la voix.',
  },
]

export const PERSUASION_TOOLS = [
  {
    id: 'p-1',
    name: 'L\'ancrage par le contraste',
    source: 'Pouvoir illimité — Tony Robbins',
    when: 'Quand tu veux faire accepter une option raisonnable.',
    how: 'Présente d\'abord une option clairement excessive, puis ton option réelle. Le cerveau juge par comparaison, jamais dans l\'absolu.',
    phrase: '« Deux options : soit on refait tout le système sur 6 mois, soit on corrige la faille ce soir et on gagne 6 mois. »',
  },
  {
    id: 'p-2',
    name: 'Le recadrage de valeur',
    source: 'Les 48 lois du pouvoir — Loi 4',
    when: 'Quand on te demande de baisser ton prix ou ton effort.',
    how: 'Ne défends pas le prix : déplace la discussion sur le coût de l\'absence de résultat.',
    phrase: '« Je peux baisser le prix. La question : combien vous coûte une solution qui ne tient pas ? »',
  },
  {
    id: 'p-3',
    name: 'Le pied dans la porte',
    source: 'Psychologie de l\'engagement',
    when: 'Pour obtenir un grand accord en commençant petit.',
    how: 'Obtiens d\'abord un micro-accord trivial, puis élargis. La cohérence interne fait le reste.',
    phrase: '« Vous êtes d\'accord sur un point : le problème doit être réglé cette semaine. »',
  },
  {
    id: 'p-4',
    name: 'La question qui déplace',
    source: 'Suits — Harvey Specter',
    when: 'Quand on t\'attaque ou qu\'on te met sous pression.',
    how: 'Ne réponds pas à l\'attaque : pose une question qui oblige l\'autre à se justifier. Tu reprends la main sans élever la voix.',
    phrase: '« Avant d\'aller plus loin : sur quelle base chiffrez-vous ça ? »',
  },
  {
    id: 'p-5',
    name: 'La triple alternative',
    source: 'Négociation d\'élite',
    when: 'Pour sortir d\'un blocage « oui/non ».',
    how: 'Propose trois options dont tu acceptes les trois. Tu contrôles le cadre, l\'autre a l\'illusion du choix.',
    phrase: '« On peut : (A) démarrer lundi, (B) livrer un pilote vendredi, (C) faire un test sur un seul module. »',
  },
  {
    id: 'p-6',
    name: 'L\'étiquetage émotionnel',
    source: 'Techniques FBI de négociation',
    when: 'Face à quelqu\'un de tendu ou d\'agressif.',
    how: 'Nomme son émotion sans la juger. Elle perd immédiatement de sa puissance.',
    phrase: '« J\'ai l\'impression que cette situation vous met sous pression. »',
  },
]

export const BODY_LANGUAGE = [
  { cue: 'Mains visibles, paumes ouvertes', read: 'Ouverture, honnêteté perçue.', use: 'Dès le début d\'une négociation, mains sur la table.' },
  { cue: 'Pieds orientés vers la sortie', read: 'L\'autre veut partir ou n\'est pas convaincu.', use: 'Raccourcis, ou change d\'angle immédiatement.' },
  { cue: 'Clignement accéléré', read: 'Stress, calcul, mensonge possible.', use: 'Ralentis, pose une question ouverte, laisse un silence.' },
  { cue: 'Menton relevé, tête haute', read: 'Défi ou supériorité.', use: 'Ne surenchéris pas : baisse ton débit, garde un ton égal.' },
  { cue: 'Copie de ta posture', read: 'Adhésion en construction (rapport établi).', use: 'Avance vers ta demande maintenant.' },
  { cue: 'Bras croisés + épaules hautes', read: 'Défense, désaccord non exprimé.', use: 'Nomme la tension : « Vous n\'êtes pas convaincu, dites-moi ce qui bloque. »' },
  { cue: 'Regard qui fuit vers le haut', read: 'Recherche d\'une réponse construite.', use: 'Attends. Ne remplis pas le silence.' },
  { cue: 'Sourire asymétrique', read: 'Mépris ou ironie.', use: 'Reprends le cadre factuel, sans répondre à la provocation.' },
]

export const SOCIAL_PLAYBOOK = [
  {
    id: 's-1',
    title: 'Briser la glace en 3 temps',
    detail:
      'Contexte (on est ensemble dans cette situation) → Question facile (ouverte, sans piège) → Compliment précis (sur un choix, jamais sur la personne).',
    example: '« Cette file est interminable… vous venez souvent ici ? … En tout cas, votre veste est excellente, ça se voit que ce n\'est pas un hasard. »',
  },
  {
    id: 's-2',
    title: 'Se souvenir des prénoms',
    detail:
      'Répète le prénom immédiatement dans une phrase, associe-le à une image mentale absurde, et réutilise-le une fois avant de partir.',
    example: '« Karim, donc. Karim, tu travailles sur quoi en ce moment ? »',
  },
  {
    id: 's-3',
    title: 'Sortir d\'une conversation',
    detail:
      'Ne t\'excuse jamais de partir. Remercie, valorise l\'échange, indique un prochain contact concret.',
    example: '« J\'ai adoré cet échange. Je te renvoie le document demain matin. »',
  },
  {
    id: 's-4',
    title: 'Le désarmement du conflit',
    detail:
      'Accuse réception de l\'émotion, isole le fait, propose une action. Jamais de contre-attaque immédiate.',
    example: '« Je comprends la frustration. Sur le fond, il y a un seul point à régler. Je m\'en occupe avant vendredi. »',
  },
  {
    id: 's-5',
    title: 'Créer la dette positive',
    detail:
      'Donne un avantage réel, sans contrepartie annoncée. La réciprocité travaille pour toi pendant des mois.',
    example: '« Je t\'ai mis en relation avec X, tu lui diras bonjour de ma part. »',
  },
  {
    id: 's-6',
    title: 'La sortie par le haut',
    detail:
      'Quitte une réunion ou une soirée au moment où ton capital social est au plus haut, pas quand tout le monde est épuisé.',
    example: 'Après ta meilleure intervention : « Je file, mais c\'était excellent. À très vite. »',
  },
]

export const NEGOTIATION_STEPS = [
  { n: 1, title: 'Préparer le BATNA', detail: 'Écris ton alternative si aucun accord. Sans alternative, tu ne négocies pas : tu supplies.' },
  { n: 2, title: 'Fixer le cadre', detail: 'Choisis l\'heure, le lieu, l\'ordre du jour. Le cadre décide souvent du résultat.' },
  { n: 3, title: 'Écouter 70 %', detail: 'Fais parler. Note les mots exacts, ils contiennent les vraies contraintes.' },
  { n: 4, title: 'Ancrer haut', detail: 'Premier chiffre posé = référence mentale. Sois ambitieux mais justifiable.' },
  { n: 5, title: 'Ne jamais concéder seul', detail: 'Chaque concession se paie : « Je peux, si vous… ». Jamais gratuit.' },
  { n: 6, title: 'Silence final', detail: 'Après ton offre : tais-toi. Le premier qui parle après une offre perd souvent l\'avantage.' },
]
