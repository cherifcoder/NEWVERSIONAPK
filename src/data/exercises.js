/* ------------------------------------------------------------------
   exercises.js — Le Gym Quotidien des Mentors
   Chaque exercice : source (livre), pilier ciblé, durée, protocole.
------------------------------------------------------------------- */

export const EXERCISE_CATEGORIES = [
  { id: 'focus', label: 'Focus & Levier', icon: 'Target' },
  { id: 'courage', label: 'Courage & Décision', icon: 'Flame' },
  { id: 'social', label: 'Entregent & Verbe', icon: 'Users' },
  { id: 'body', label: 'Micro-gestes & Présence', icon: 'Footprints' },
  { id: 'mind', label: 'Esprit & Stratégie', icon: 'Brain' },
  { id: 'wealth', label: 'Richesse & Discipline', icon: 'Coins' },
]

export const EXERCISES = [
  /* ---------------- Focus & Levier ---------------- */
  {
    id: 'ex-80-20',
    category: 'focus',
    pillar: 'code',
    source: 'La semaine de 4 heures — Tim Ferriss',
    title: 'Audit 80/20 brutal',
    duration: '12 min',
    brief:
      "Élimine le superflu : identifie les 20 % d'efforts qui produisent 80 % de ton résultat, et supprime le reste.",
    steps: [
      'Liste tout ce que tu as fait hier (10 lignes minimum).',
      'À côté de chaque ligne, note : impact fort / moyen / nul.',
      'Barre tout ce qui est « nul » — définitivement, pas « plus tard ».',
      'Garde 2 éléments « impact fort ». Ce sont tes priorités du jour.',
    ],
    proof: 'Une action supprimée de ta liste, pour toujours.',
  },
  {
    id: 'ex-bloc-90',
    category: 'focus',
    pillar: 'code',
    source: 'Deep Work — Cal Newport',
    title: 'Bloc de 90 minutes inviolable',
    duration: '90 min',
    brief:
      "Un seul objectif, un seul onglet, aucune interruption. Le talent se paie en blocs non interruptibles.",
    steps: [
      'Écris UNE phrase : « À la fin de ce bloc, ceci existera : ___ ».',
      'Téléphone en mode avion, hors de la pièce. Notifications coupées.',
      'Lance le chronomètre du module Deep Work.',
      'À la fin : note ce qui a été livré, pas ce que tu as ressenti.',
    ],
    proof: 'Un artefact : commit, fichier, page, décision écrite.',
  },
  {
    id: 'ex-single-task',
    category: 'focus',
    pillar: 'code',
    source: 'Avaler le crapaud — Brian Tracy',
    title: 'Le crapaud du jour',
    duration: '45-90 min',
    brief:
      "Attaque la tâche la plus difficile en premier. Tout le reste de la journée devient facile par contraste.",
    steps: [
      'Écris la tâche que tu redoutes le plus (celle qui te fait scroller).',
      'Commence-la AVANT toute lecture de message, avant tout café.',
      'Interdiction de la remplacer par une tâche plus confortable.',
      'Termine-la ou livre un incrément visible aujourd\'hui.',
    ],
    proof: 'La tâche redoutée démarrée avant 8h00.',
  },
  {
    id: 'ex-not-to-do',
    category: 'focus',
    pillar: 'reading',
    source: 'La semaine de 4 heures — Tim Ferriss',
    title: 'La liste « ne pas faire »',
    duration: '8 min',
    brief:
      "Le temps ne se gère pas, il se protège. Ce que tu refuses définit mieux ton niveau que ce que tu acceptes.",
    steps: [
      'Écris 5 choses que tu feras systématiquement « non » cette semaine.',
      'Pour chacune, prépare une phrase de refus élégante (une seule).',
      'Applique dès aujourd\'hui à la première sollicitation.',
    ],
    proof: 'Un « non » dit à voix haute, calmement.',
  },

  /* ---------------- Courage & Décision ---------------- */
  {
    id: 'ex-obstacle',
    category: 'courage',
    pillar: 'reading',
    source: "L'obstacle est le chemin — Ryan Holiday",
    title: 'Retournement tactique',
    duration: '10 min',
    brief:
      "Transforme un échec technique ou social en avantage tactique immédiat.",
    steps: [
      'Décris l\'échec ou le blocage d\'hier en une phrase factuelle (sans jugement).',
      'Écris 3 avantages cachés qu\'il te donne (compétence, info, réputation, temps).',
      'Choisis-en UN et exploite-le avant ce soir.',
    ],
    proof: 'Un avantage exploité, pas seulement identifié.',
  },
  {
    id: 'ex-decision-2min',
    category: 'courage',
    pillar: 'reading',
    source: 'Réfléchissez et devenez riche — Napoleon Hill',
    title: 'La règle des 2 minutes',
    duration: 'Toute la journée',
    brief:
      "L'indécision est la plus grande cause d'échec. Décide vite sur tout ce qui est réversible.",
    steps: [
      'Règle : toute décision réversible se prend en moins de 2 minutes.',
      'Toute décision irréversible : écris 3 options, choisis-en une, fixe une date.',
      'Compte tes décisions du jour. Objectif : zéro « je verrai plus tard ».',
    ],
    proof: 'Trois décisions prises sans report.',
  },
  {
    id: 'ex-mille-1',
    category: 'courage',
    pillar: 'reading',
    source: 'Les clés du succès — Napoleon Hill',
    title: 'Le mille-unième pas',
    duration: '30 min',
    brief:
      "Le succès se trouve juste après le point d'abandon habituel. Reprends le dossier abandonné.",
    steps: [
      'Ouvre le projet ou la conversation que tu as laissée tomber.',
      'Fais un pas concret : un message, un commit, un appel, une page.',
      'Note combien de temps il t\'a fallu — tu verras que c\'était court.',
    ],
    proof: 'Une boucle ouverte réactivée.',
  },
  {
    id: 'ex-refus-poli',
    category: 'courage',
    pillar: 'eloquence',
    source: 'Le Prince — Machiavel',
    title: 'Le refus élégant',
    duration: '6 min',
    brief:
      "Dire non sans casser la relation : c'est la compétence la plus rentable du monde professionnel.",
    steps: [
      'Formule : « J\'aimerais, mais mon agenda est verrouillé sur ___ jusqu\'au ___. Reviens vers moi après. »',
      'Répète-la 5 fois à voix haute, ton calme et chaleureux.',
      'Applique-la à une demande réelle dans les 24h.',
    ],
    proof: 'Un refus dit sans excuse ni agressivité.',
  },

  /* ---------------- Entregent & Verbe ---------------- */
  {
    id: 'ex-brise-glace',
    category: 'social',
    pillar: 'eloquence',
    source: 'Pouvoir illimité — Tony Robbins',
    title: 'Brise-glace en 30 secondes',
    duration: 'Toute la journée',
    brief:
      "L'entregent n'est pas un talent : c'est un script répété jusqu'à devenir naturel.",
    steps: [
      'Va vers un inconnu (commerce, salle, file d\'attente).',
      'Ouvre avec un détail de contexte : « Je n\'arrive jamais à choisir entre ces deux-là, vous prendriez lequel ? »',
      'Écoute 80 % du temps, pose 2 questions ouvertes.',
      'Termine par un compliment sincère et précis, puis pars le premier.',
    ],
    proof: 'Une conversation avec un inconnu, minimum 60 secondes.',
  },
  {
    id: 'ex-silence',
    category: 'social',
    pillar: 'eloquence',
    source: 'Les 48 lois du pouvoir — Loi 4',
    title: 'Le silence de pouvoir',
    duration: 'Toute la journée',
    brief:
      "Celui qui parle le moins contrôle la conversation. Le silence est une arme de position.",
    steps: [
      'Après chaque question posée, compte 3 secondes pleines avant de reprendre.',
      'Ne remplis jamais un silence par du bavardage.',
      'Une idée = une phrase. Puis arrête-toi net.',
    ],
    proof: 'Trois silences tenus là où tu aurais parlé.',
  },
  {
    id: 'ex-pitch-60',
    category: 'social',
    pillar: 'eloquence',
    source: 'Suits — Harvey Specter (étude de cas)',
    title: 'Le pitch de 60 secondes',
    duration: '10 min',
    brief:
      "Structure : Problème → Coût → Solution → Preuve → Demande. Aucune phrase de plus.",
    steps: [
      'Écris ton pitch en 5 lignes, une par étape.',
      'Chronomètre : 60 secondes maximum, à voix haute.',
      'Coupe 20 % des mots. Enregistre-toi si possible.',
    ],
    proof: 'Un pitch enregistré ou récité à quelqu\'un.',
  },
  {
    id: 'ex-lecture-froide',
    category: 'social',
    pillar: 'eloquence',
    source: 'L\'art de la guerre — Sun Tzu',
    title: 'Lecture à froid',
    duration: '5 min',
    brief:
      "Observe avant de parler : posture, mains, rythme de parole, micro-expressions.",
    steps: [
      'Choisis 2 personnes dans une pièce (réelle ou en visio).',
      'Note : qui mène, qui subit, qui a peur, qui veut quelque chose.',
      'Prépare une phrase qui exploite ce que tu as vu.',
    ],
    proof: 'Deux profils écrits en 3 lignes chacun.',
  },

  /* ---------------- Micro-gestes & Présence ---------------- */
  {
    id: 'ex-posture',
    category: 'body',
    pillar: 'islamic',
    source: 'Pouvoir illimité — Tony Robbins (physiologie)',
    title: 'Le corps qui commande',
    duration: 'Toute la journée',
    brief:
      "Comment s'asseoir, marcher, ouvrir une porte, tenir un verre avec l'assurance d'un homme riche et influent.",
    steps: [
      'Assieds-toi : dos droit, épaules basses, pieds au sol, mains visibles. Tiens 10 minutes sans te corriger.',
      'Marche : 20 % plus lentement qu\'à ton habitude, pas posés, regard à l\'horizontale.',
      'Ouvre une porte : main ferme, mouvement unique, sans hésitation.',
      'Tiens ton verre à la base, coude bas, jamais devant ton visage.',
    ],
    proof: 'Les 4 gestes appliqués au moins une fois chacun.',
  },
  {
    id: 'ex-respiration',
    category: 'body',
    pillar: 'islamic',
    source: 'Joe Dispenza — cohérence corps/esprit',
    title: 'Recalibrage 4-7-8',
    duration: '4 min',
    brief:
      "Le corps gouverne l'état mental. Change la respiration, tu changes la décision qui suit.",
    steps: [
      'Inspire 4 secondes par le nez, ventre.',
      'Retiens 7 secondes.',
      'Expire 8 secondes par la bouche.',
      'Répète 4 cycles. Puis note ton état avant/après (1 mot chacun).',
    ],
    proof: '4 cycles complets + 2 mots notés.',
  },
  {
    id: 'ex-silence-matinal',
    category: 'body',
    pillar: 'islamic',
    source: 'Rigueur spirituelle — constance',
    title: 'La première heure sans bruit',
    duration: '60 min',
    brief:
      "La première heure décide du personnage de la journée. Aucun écran, aucune parole inutile.",
    steps: [
      'Réveil : aucun téléphone avant d\'avoir bu de l\'eau et lu 5 minutes.',
      'Lecture spirituelle + intention écrite en 1 phrase.',
      'Puis la tâche la plus dure (crapaud).',
    ],
    proof: 'Aucun écran pendant la première heure.',
  },
  {
    id: 'ex-immobilite',
    category: 'body',
    pillar: 'chess',
    source: 'Stoïcisme — calme du stratège',
    title: 'L\'immobilité du stratège',
    duration: '5 min',
    brief:
      "Le corps agité trahit l'esprit agité. Entraîne le calme physique sous stimulation.",
    steps: [
      'Assieds-toi sans bouger 5 minutes, pendant que d\'autres parlent ou que ton téléphone vibre.',
      'Ne réponds pas. Ne bouge pas. Observe.',
      'Note ce que tu as ressenti à la 3e minute.',
    ],
    proof: '5 minutes d\'immobilité totale.',
  },

  /* ---------------- Esprit & Stratégie ---------------- */
  {
    id: 'ex-echiquier',
    category: 'mind',
    pillar: 'chess',
    source: 'L\'art de la guerre — Sun Tzu',
    title: 'Une partie, trois leçons',
    duration: '40 min',
    brief:
      "L'échiquier chiffre tes erreurs de jugement. Chaque défaite est une donnée exploitable.",
    steps: [
      'Joue UNE partie longue, sans blitz, sans distraction.',
      'Analyse-la : trouve 3 moments où tu as choisi le confort au lieu du meilleur coup.',
      'Écris le principe général derrière chaque erreur.',
    ],
    proof: '3 principes écrits, réutilisables hors de l\'échiquier.',
  },
  {
    id: 'ex-mastermind',
    category: 'mind',
    pillar: 'reading',
    source: 'Réfléchissez et devenez riche — Napoleon Hill',
    title: 'Apport au Mastermind',
    duration: '15 min',
    brief:
      "Aucun esprit n'est complet seul. Apporte de la valeur avant de demander.",
    steps: [
      'Choisis une personne plus avancée que toi.',
      'Prépare un apport gratuit et précis (ressource, intro, analyse, correction).',
      'Envoie-le sans rien demander en retour.',
    ],
    proof: 'Un message envoyé avec de la valeur dedans.',
  },
  {
    id: 'ex-pre-mortem',
    category: 'mind',
    pillar: 'code',
    source: 'Stratégie & esprit critique',
    title: 'Pré-mortem du projet',
    duration: '12 min',
    brief:
      "Imagine que ton projet a échoué dans 3 mois. Écris pourquoi. Puis neutralise la cause aujourd'hui.",
    steps: [
      'Écris 5 causes d\'échec plausibles.',
      'Classe-les par probabilité × impact.',
      'Prends une mesure concrète contre la plus dangereuse, aujourd\'hui.',
    ],
    proof: 'Une contre-mesure appliquée.',
  },
  {
    id: 'ex-48lois',
    category: 'mind',
    pillar: 'reading',
    source: 'Les 48 lois du pouvoir — Robert Greene',
    title: 'Une loi, une scène',
    duration: '10 min',
    brief:
      "Une loi du pouvoir ne sert que si tu la joues dans une scène réelle aujourd'hui.",
    steps: [
      'Choisis une loi dans la sagesse du jour.',
      'Écris la scène précise où tu vas l\'appliquer (qui, quand, où).',
      'Joue-la. Note le résultat en une ligne.',
    ],
    proof: 'Une loi appliquée et documentée.',
  },

  /* ---------------- Richesse & Discipline ---------------- */
  {
    id: 'ex-paye-toi',
    category: 'wealth',
    pillar: 'code',
    source: "L'homme le plus riche de Babylone — G. Clason",
    title: 'Les 10 % intouchables',
    duration: '45 min',
    brief:
      "Paye-toi d'abord : réserve une part intouchable de ton temps à ton actif le plus rentable.",
    steps: [
      'Bloque 45 minutes dans ton agenda, marquées « intouchable ».',
      'Travaille uniquement sur ton actif à effet composé (skill, produit, audience).',
      'Aucune exception, aucun report.',
    ],
    proof: '45 minutes tenues, non négociées.',
  },
  {
    id: 'ex-compte-perso',
    category: 'wealth',
    pillar: 'reading',
    source: 'Les clés du succès — Napoleon Hill',
    title: 'L\'aller le mille-unième pas',
    duration: '10 min',
    brief:
      "Documente ta persistance : ce que tu poursuis, depuis combien de temps, quel est le prochain pas.",
    steps: [
      'Écris ton objectif principal, chiffré et daté.',
      'Note les refus rencontrés et ce qu\'ils t\'ont appris.',
      'Écris le prochain pas, aujourd\'hui.',
    ],
    proof: 'Un objectif écrit + un pas exécuté.',
  },
  {
    id: 'ex-audit-energie',
    category: 'wealth',
    pillar: 'islamic',
    source: 'Pouvoir illimité — Tony Robbins',
    title: 'Audit d\'énergie',
    duration: '8 min',
    brief:
      "Ton énergie est ton capital premier. Coupe ce qui la détruit, augmente ce qui la produit.",
    steps: [
      'Note ce qui t\'a donné de l\'énergie hier (3 lignes) et ce qui t\'en a pris (3 lignes).',
      'Supprime UNE source négative dès aujourd\'hui.',
      'Programme DEUX sources positives demain matin.',
    ],
    proof: 'Une source d\'énergie coupée.',
  },
  {
    id: 'ex-debrief-fin',
    category: 'wealth',
    pillar: 'english',
    source: 'Method Acting — fin de journée',
    title: 'Débrief de l\'acteur (3 lignes)',
    duration: '5 min',
    brief:
      "Un acteur professionnel ne quitte jamais le plateau sans débrief. Sans trace, pas de progression.",
    steps: [
      'Écris : où as-tu brisé le personnage ?',
      'Écris : as-tu fini tout ce que tu as commencé ?',
      'Écris : le seul ajustement pour demain, en une phrase.',
    ],
    proof: 'Trois lignes écrites dans le Journal.',
  },
]

export const EXERCISE_MAP = Object.fromEntries(EXERCISES.map((e) => [e.id, e]))

export const pickDailyExercises = (seed, count = 4) => {
  // Sélection déterministe, répartie sur toutes les catégories
  const byCat = EXERCISE_CATEGORIES.map((c) => ({
    cat: c.id,
    items: EXERCISES.filter((e) => e.category === c.id),
  })).filter((g) => g.items.length)

  const hash = String(seed)
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)

  const chosen = []
  for (let i = 0; i < count && byCat.length; i += 1) {
    const group = byCat[(hash + i * 3) % byCat.length]
    const item = group.items[(hash + i * 7) % group.items.length]
    if (item && !chosen.includes(item)) chosen.push(item)
  }
  // Complète si doublons
  let k = 0
  while (chosen.length < count && k < EXERCISES.length) {
    const cand = EXERCISES[(hash + k * 5) % EXERCISES.length]
    if (!chosen.includes(cand)) chosen.push(cand)
    k += 1
  }
  return chosen
}
