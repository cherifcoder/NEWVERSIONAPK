/* ------------------------------------------------------------------
   archetypes.js — Le Panthéon des Modèles & la Character Bible

   Chaque archétype est décomposé selon la méthode du Method Acting :
   circonstances données, objectif du personnage, vie intérieure,
   physique/posture, langage, réaction sous pression, exercices
   d'incorporation et « déclencheur » (rappel sensoriel).
------------------------------------------------------------------- */

export const SELF_ARCHETYPE = {
  id: 'self',
  name: 'Le Futur Toi',
  epithet: 'L\'hybride définitif',
  era: 'Ton année 2032',
  avatarTone: 'gold',
  tagline:
    'Il a déjà réussi. Tu ne construis pas son caractère : tu le rappelles.',
  summary:
    "Le Futur Toi est la fusion opérationnelle de trois lignées : le bourreau de travail polymath, le négociateur d'élite et le polyglotte orateur. Il ne « fait » pas ces choses : il les EST. Sa signature est une exécution chirurgicale sans abandon.",
  traits: [
    { label: 'Exécution', value: 'Zéro abandon', detail: 'Tout ce qui est commencé est livré, déployé, prouvé.' },
    { label: 'Décision', value: 'Vitesse & précision', detail: 'Esprit critique aiguisé, décision en moins de 2 minutes sur 90 % des cas.' },
    { label: 'Profondeur', value: '90 min non interruptibles', detail: 'Le téléphone est un outil, jamais un maître.' },
    { label: 'Présence', value: 'Calme dominant', detail: 'Parle lentement, regarde franchement, occupe l\'espace sans effort.' },
    { label: 'Verbe', value: 'Persuasion élégante', detail: 'Retourne n\'importe quelle situation, sans jamais hausser le ton.' },
    { label: 'Langues', value: 'Bilingue opérationnel', detail: 'Pense, négocie et plaisante en anglais.' },
  ],
  mindset: [
    'Je ne cherche pas la motivation : je suis un système qui tourne.',
    'Une décision imparfaite exécutée vaut mille décisions parfaites reportées.',
    'L\'obstacle n\'est pas sur le chemin : il EST le chemin.',
    'Je ne négocie jamais ma parole avec moi-même.',
  ],
  voice:
    'Voix posée, grave, débit maîtrisé. Phrases courtes, verbes forts. Silences assumés après une affirmation clé. Vocabulaire précis, jamais vulgaire, jamais bavard.',
  posture:
    'Épaules basses et ouvertes, menton parallèle au sol, démarche lente et sûre, gestes amples mais rares. Occupe l\'espace comme quelqu\'un qui n\'a rien à prouver.',
  adversity:
    'Face à l\'échec : il ne s\'excuse pas, il extrait la donnée. Face à l\'attaque : il ralentit, questionne, désarme. Face à la perte : il encaisse, ajuste, revient plus précis.',
  laws: [
    { ref: 'Les 48 lois du pouvoir', text: 'Loi 3 — Dissimule tes intentions.' },
    { ref: 'Napoleon Hill', text: 'Le désir brûlant transforme la pensée en équivalent physique.' },
    { ref: 'Machiavel', text: 'Mieux vaut être craint pour sa rigueur que plaint pour ses excuses.' },
    { ref: 'Joe Dispenza', text: 'L\'identité change quand l\'émotion précède l\'expérience.' },
  ],
  exercises: [
    {
      title: 'Le Rappel sensoriel',
      how: 'Yeux fermés, 3 minutes. Visualise la scène la plus ordinaire de ta journée (ouvrir ton laptop) et joue-la comme lui : posture, respiration, silence. Ajoute un déclencheur physique (toucher ton stylo, inspirer 4-7-8).',
      duration: '3 min',
    },
    {
      title: 'La question du réalisateur',
      how: 'Avant chaque décision : « Que ferait-il, lui, là, maintenant, dans cette seconde ? » Puis exécute sans délibérer.',
      duration: '15 s',
    },
    {
      title: 'La répétition à froid',
      how: 'Répète à voix haute la négociation difficile de demain, 3 fois, en variant le ton (calme, ferme, complice). Ton cerveau ne distingue pas la répétition de la réalité.',
      duration: '6 min',
    },
  ],
}

export const ARCHETYPES = [
  {
    id: 'specter',
    name: 'Harvey Specter',
    epithet: 'L\'Avocat d\'Élite',
    era: 'Suits',
    avatarTone: 'sapphire',
    tagline: 'Je ne joue pas les règles. Je joue les gens.',
    summary:
      "Incarnation de la confiance transactionnelle : il gagne avant que la conversation ne commence, parce qu'il a préparé l'information que l'autre ignore qu'il détient.",
    traits: [
      { label: 'Cœur de métier', value: 'Levier informationnel', detail: 'Toujours la personne la mieux informée de la pièce.' },
      { label: 'Signature', value: 'Sang-froid total', detail: 'Ne se précipite jamais, ne s\'énerve jamais en public.' },
      { label: 'Arme', value: 'Le silence', detail: 'Laisse l\'autre remplir le vide — et se livrer.' },
      { label: 'Code', value: 'Loyauté sélective', detail: 'Protège son cercle, élimine le reste sans émotion.' },
    ],
    mindset: [
      'Je ne demande pas la permission, je crée la situation.',
      'Une bonne négociation se gagne avant la réunion.',
      'Le désespoir se sent. Je n\'en montre jamais.',
    ],
    voice:
      'Débit lent, articulation nette, métaphores sportives. Frappe une phrase courte après une longue explication pour marquer le point.',
    posture:
      'Costume impeccable, mains visibles, contact visuel soutenu, dos droit, jamais affalé.',
    adversity:
      'Sous pression, il ralentit, sourit, et pose la question qui déplace le rapport de force. Il transforme l\'attaque en preuve de la faiblesse adverse.',
    laws: [
      { ref: 'Les 48 lois du pouvoir', text: 'Loi 4 — Dis toujours moins que nécessaire.' },
      { ref: 'Les 48 lois du pouvoir', text: 'Loi 9 — Gagne par tes actions, jamais par tes arguments.' },
      { ref: 'Robert Greene', text: 'Loi 21 — Joue l\'idiot : personne ne se méfie d\'un naïf.' },
    ],
    exercises: [
      { title: 'L\'information d\'avance', how: 'Avant chaque interaction importante, prépare UNE donnée que l\'autre ne sait pas que tu connais. Place-la au bon moment.', duration: '10 min' },
      { title: 'Le silence de 3 secondes', how: 'Après chaque question posée, compte 3 secondes avant de parler. Observe l\'effet.', duration: 'Toute la journée' },
      { title: 'Reformulation d\'autorité', how: 'Prends 3 phrases hésitantes de ta journée et réécris-les en 5 mots affirmatifs.', duration: '8 min' },
    ],
  },
  {
    id: 'greene',
    name: 'Le Stratège de Cour',
    epithet: 'Robert Greene / Machiavel',
    era: 'XVIe siècle → aujourd\'hui',
    avatarTone: 'blood',
    tagline: 'La vérité est un outil, pas un cri du cœur.',
    summary:
      "Lecture froide des dynamiques de pouvoir : qui a besoin de qui, qui perd la face si l'on refuse, où se trouve le vrai centre de décision.",
    traits: [
      { label: 'Grille', value: 'Intérêts > émotions', detail: 'Cherche l\'intérêt réel derrière chaque discours.' },
      { label: 'Patience', value: 'Le temps comme arme', detail: 'Attend que l\'adversaire s\'épuise à vouloir gagner vite.' },
      { label: 'Discrétion', value: 'Jamais de vanité', detail: 'Le travail se voit dans le résultat, pas dans l\'annonce.' },
      { label: 'Adaptabilité', value: 'Caméléon social', detail: 'Devient ce que la pièce exige, sans perdre son objectif.' },
    ],
    mindset: [
      'Rends tes ennemis utiles ou rends-les inutiles.',
      'Ne montre jamais le travail avant qu\'il ne soit irréversible.',
      'Ce que tu ne contrôles pas peut être neutralisé par la patience.',
    ],
    voice:
      'Ton neutre, vocabulaire dense, aucune émotion inutile. Cite les faits, laisse l\'autre conclure.',
    posture:
      'Immobile, économique. Observateur : regarde les mains, pas la bouche.',
    adversity:
      'Ne réagit pas à chaud. Il archive, calcule, puis frappe au moment où l\'adversaire a oublié le conflit.',
    laws: [
      { ref: 'Machiavel', text: 'Le Prince : paraître vertueux vaut mieux qu\'être impuissant.' },
      { ref: 'Les 48 lois du pouvoir', text: 'Loi 15 — Écrase complètement ton ennemi.' },
      { ref: 'Les 48 lois du pouvoir', text: 'Loi 33 — Découvre les pouces de chacun.' },
    ],
    exercises: [
      { title: 'Carte des intérêts', how: 'Choisis 3 personnes de ton entourage professionnel. Écris ce qu\'elles veulent vraiment (peur, besoin, ambition).', duration: '12 min' },
      { title: 'Retenue stratégique', how: 'Aujourd\'hui, garde pour toi une bonne nouvelle jusqu\'au moment le plus rentable pour la révéler.', duration: 'Journée' },
      { title: 'Question désarmante', how: 'Prépare 2 questions qui obligent l\'autre à se positionner clairement.', duration: '10 min' },
    ],
  },
  {
    id: 'dispenza',
    name: 'Le Neuro-Architecte',
    epithet: 'Joe Dispenza',
    era: 'Neurosciences contemporaines',
    avatarTone: 'jade',
    tagline: 'Répète l\'émotion du futur jusqu\'à ce que le corps y croie.',
    summary:
      "Il ne s'agit pas de « penser positif » : il s'agit de répéter une identité jusqu'à ce que le cerveau crée le câblage correspondant et que le corps agisse sans effort conscient.",
    traits: [
      { label: 'Mécanisme', value: 'Émotion avant expérience', detail: 'Ressens le résultat avant de l\'obtenir.' },
      { label: 'Répétition', value: 'Myélinisation', detail: 'Chaque répétition épaissit la gaine du circuit.' },
      { label: 'Rupture', value: 'Réécrire l\'habitude', detail: 'Le même déclencheur doit produire une nouvelle réponse.' },
      { label: 'Corps', value: 'Cohérence cardiaque', detail: 'Respiration et posture gouvernent l\'état interne.' },
    ],
    mindset: [
      'Ma personnalité crée ma réalité personnelle.',
      'Je ne répète pas une action, je renforce un circuit.',
      'Le corps doit cesser d\'anticiper l\'ancienne vie.',
    ],
    voice:
      'Ton calme et incarné, phrases descriptives, présent de l\'indicatif comme si c\'était déjà fait.',
    posture:
      'Détendue mais alignée. Respiration basse, épaules relâchées, mouvement fluide et lent.',
    adversity:
      'Il traite l\'échec comme un signal d\'ancien circuit à réécrire : pas de jugement, une recalibration.',
    laws: [
      { ref: 'Joe Dispenza', text: 'Placebo/Nocebo : la croyance modifie la biologie.' },
      { ref: 'Napoleon Hill', text: 'L\'autosuggestion est le pont entre la pensée et la matière.' },
      { ref: 'Tony Robbins', text: 'L\'état précède la stratégie : change l\'état, tu changes la performance.' },
    ],
    exercises: [
      { title: 'Répétition mentale (5 min)', how: 'Assis, dos droit. Visualise ta journée réussie en ressentant la fierté DÈS MAINTENANT. Termine par 10 respirations 4-7-8.', duration: '5 min' },
      { title: 'Reconfiguration du déclencheur', how: 'Choisis un déclencheur (notif, fatigue, café). Écris la nouvelle réponse. Tiens-la 3 fois aujourd\'hui.', duration: 'Journée' },
      { title: 'Journal d\'identité', how: 'Écris au présent : « Je suis quelqu\'un qui… » × 5, uniquement des faits vérifiables.', duration: '6 min' },
    ],
  },
  {
    id: 'da-vinci',
    name: 'Le Polymath',
    epithet: 'Léonard / Le Bourreau de Travail',
    era: 'Renaissance → ingénierie moderne',
    avatarTone: 'gold',
    tagline: 'Le savoir est un système : chaque discipline amplifie les autres.',
    summary:
      "Maîtrise cumulative : le code nourrit la logique, les échecs nourrissent la stratégie, la lecture nourrit le vocabulaire, la spiritualité nourrit la constance. Rien n'est décoratif.",
    traits: [
      { label: 'Rythme', value: 'Travail long et régulier', detail: 'Le génie est un horaire, pas un éclair.' },
      { label: 'Curiosité', value: 'Transfert inter-domaines', detail: 'Une solution d\'un domaine résout l\'autre.' },
      { label: 'Rigueur', value: 'Preuve > opinion', detail: 'Tout est mesuré, journalisé, amélioré.' },
      { label: 'Finition', value: 'Livré, pas presque', detail: 'Le « presque fini » est la défaite déguisée.' },
    ],
    mindset: [
      'Je termine avant de commencer autre chose.',
      'Ce que je ne mesure pas, je ne l\'améliore pas.',
      'La régularité bat l\'intensité.',
    ],
    voice:
      'Précis, structuré, pédagogique. Il explique simplement ce qui est complexe, sans jargon inutile.',
    posture:
      'Assis droit, épaules ouvertes, gestes économes. Attentif et présent, jamais avachi sur son téléphone.',
    adversity:
      'Il découpe le problème, isole la variable, teste une hypothèse minimale. Jamais de panique : une expérience.',
    laws: [
      { ref: 'Napoleon Hill', text: 'La connaissance ne s\'accumule pas : elle s\'organise.' },
      { ref: 'Tim Ferriss', text: '80/20 : identifie les 20 % qui produisent tout.' },
      { ref: 'Brian Tracy', text: 'Avale le crapaud : la tâche la plus dure, en premier.' },
    ],
    exercises: [
      { title: 'Audit 80/20', how: 'Liste tes 10 activités d\'hier. Barre les 8 qui produisent le moins. Reconstruis ta journée sur les 2 restantes.', duration: '10 min' },
      { title: 'Bloc unique', how: 'Choisis UNE tâche qui change tout. 90 minutes, aucune interruption, résultat visible à la fin.', duration: '90 min' },
      { title: 'Fermeture de boucle', how: 'Prends la plus ancienne tâche inachevée et finis-la aujourd\'hui, même imparfaitement.', duration: '45 min' },
    ],
  },
  {
    id: 'clason',
    name: 'Le Sage de Babylone',
    epithet: 'George Clason — Richesse & Discipline',
    era: 'Babylone',
    avatarTone: 'gold',
    tagline: 'Une part de tout ce que tu gagnes est à toi pour rester.',
    summary:
      "La prospérité est une discipline mécanique : paye-toi d'abord, contrôle les dépenses, fais travailler l'épargne, protège le capital. Valable pour l'argent comme pour l'attention.",
    traits: [
      { label: 'Principe', value: 'Paye-toi d\'abord', detail: '10 % de tout revenu est intouchable — idem pour 10 % de ton temps.' },
      { label: 'Contrôle', value: 'Budget strict', detail: 'Ce qui n\'est pas alloué est perdu.' },
      { label: 'Placement', value: 'Effet composé', detail: 'Petits gains répétés, jamais de pari destructeur.' },
      { label: 'Protection', value: 'Capital & réputation', detail: 'Ne risque jamais ce qui te fait vivre sur un coup de dés.' },
    ],
    mindset: [
      'L\'or fuit celui qui l\'ignore, il accourt vers celui qui le comprend.',
      'La chance est attirée par l\'action, jamais par l\'attente.',
      'Protège ta réputation autant que ton capital.',
    ],
    voice:
      'Ton de conseil, proverbes courts, images simples. Autorité calme du vieux sage.',
    posture:
      'Assis posément, mains jointes, regard direct. Rien de nerveux, rien de pressé.',
    adversity:
      'Il revient toujours à la cause première : quelle règle ai-je violée ? Puis il corrige la règle, pas l\'humeur.',
    laws: [
      { ref: 'L\'homme le plus riche de Babylone', text: 'Règle 1 — Commence à remplir ta bourse.' },
      { ref: 'Les clés du succès', text: 'Le travail acharné et l\'application attirent la chance.' },
      { ref: 'Napoleon Hill', text: 'La persistance transforme l\'échec en plan.' },
    ],
    exercises: [
      { title: 'Les 10 % intouchables', how: 'Aujourd\'hui, réserve 45 minutes intouchables à ton actif le plus rentable. Zéro exception.', duration: '45 min' },
      { title: 'Budget d\'attention', how: 'Alloue tes heures comme un budget : travail, corps, esprit, gens. Ce qui n\'est pas alloué est consommé par les autres.', duration: '12 min' },
      { title: 'Protège la réputation', how: 'Écris un engagement tenu aujourd\'hui, visible par quelqu\'un.', duration: 'Journée' },
    ],
  },
]

export const ARCHETYPE_MAP = Object.fromEntries(ARCHETYPES.map((a) => [a.id, a]))
