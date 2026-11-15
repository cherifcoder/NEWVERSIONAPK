/* ------------------------------------------------------------------
   scripts.js — Scénarios des mini-vidéos + exercices d'élocution
   ------------------------------------------------------------------
   Génération 100 % locale : les scripts sont rédigés ici, versionnés
   avec le code, puis exportés en fichiers texte par
   scripts/generate-nonverbal.mjs. Aucune API, aucun réseau.

   Chaque scénario est un vrai découpage : plan / durée / action visible
   à l'écran / voix off. Il sert à deux choses :
     • produire la fiche de lecture téléchargeable (hors-ligne) ;
     • décrire exactement la séquence de postures animée (CLIPS) que
       l'application joue en vectoriel.
------------------------------------------------------------------- */

/* ------------------------------- Scénarios ------------------------------- */

export const SCRIPTS = [
  {
    id: 'scr-entrer',
    title: 'Entrer dans une pièce remplie de monde et s\'arrêter calmement',
    kind: 'video',
    duration: '1:40',
    target: 'Unités 1 · Leçon 2',
    promise: 'Après cette vidéo : tu franchis une porte sans t\'excuser d\'exister.',
    shots: [
      { plan: 'Plan large, porte fermée', duree: '0:00–0:12', action: 'Main sur la poignée. Une respiration basse. Les épaules descendent.', voice: 'Avant d\'ouvrir, une seule chose compte : ton souffle. Ventre, pas poitrine. Trois secondes.' },
      { plan: 'Contrechamp, seuil', duree: '0:12–0:30', action: 'La porte s\'ouvre d\'un seul mouvement, main ferme, aucune hésitation.', voice: 'Tu ouvres franchement. Pas de porte entrouverte, pas de tête qui passe d\'abord. Tu entres, tu ne te glisses pas.' },
      { plan: 'Plan moyen, deux pas', duree: '0:30–0:52', action: 'Deux pas posés, 20 % plus lents que ton pas habituel. Regard horizontal.', voice: 'Deux pas. Plus lents que tu ne le voudrais. Le pas lent dit : je suis attendu ici.' },
      { plan: 'Arrêt net, axe vertical', duree: '0:52–1:12', action: 'Arrêt complet. Pieds parallèles, poids réparti, mains calmes. Une seconde de scan.', voice: 'Puis tu t\'arrêtes. Vraiment. Une seconde de scan : la table, l\'issue, les visages. Ce silence-là, c\'est ta prise de parole.' },
      { plan: 'Plan serré visage', duree: '1:12–1:40', action: 'Sourire bref, contact visuel deux secondes, puis tu vas vers ton objectif.', voice: 'Enfin, tu choisis ta cible et tu avances. Tu n\'attends pas qu\'on vienne te chercher.' },
    ],
    notes: 'Erreur fréquente : entrer vite et se coller au mur. Corriger par un arrêt net au centre.',
  },
  {
    id: 'scr-assise',
    title: 'Posture assise — dos droit, mains visibles, pieds à plat',
    kind: 'video',
    duration: '1:20',
    target: 'Unités 2 · Leçon 1',
    promise: 'Après cette vidéo : tu ne t\'affales plus jamais, même fatigué.',
    shots: [
      { plan: 'Chaise, plan de profil', duree: '0:00–0:18', action: 'On s\'assoit en avançant les hanches au fond de l\'assise, sans se laisser tomber.', voice: 'On ne tombe pas sur une chaise, on s\'y installe. Hanches au fond, appuis sous les ischions.' },
      { plan: 'Profil, repères', duree: '0:18–0:40', action: 'Oreille, épaule, hanche : trois points proches d\'une verticale. Pieds à plat, largeur de bassin.', voice: 'Oreille, épaule, hanche. Si les trois s\'alignent, tu as l\'air présent sans avoir l\'air rigide.' },
      { plan: 'Mains, gros plan', duree: '0:40–1:00', action: 'Avant-bras sur la table, mains visibles, doigts détendus. Jamais sous la table.', voice: 'Les mains visibles sont une déclaration de franchise. Sous la table, on te soupçonne.' },
      { plan: 'Plan large', duree: '1:00–1:20', action: 'Déplacement du poids, une épaule qui se relâche, retour à l\'axe. La posture respire.', voice: 'Une bonne posture n\'est pas figée : elle revient. Tu te corriges dix fois par réunion, en silence.' },
    ],
    notes: 'Micro-correction à répéter : « oreille-épaule-hanche » en boucle intérieure.',
  },
  {
    id: 'scr-saluer',
    title: 'Saluer les gens — regard, main, prénom',
    kind: 'video',
    duration: '1:10',
    target: 'Unités 2 · Leçon 2',
    promise: 'Après cette vidéo : une poignée de main dont on se souvient.',
    shots: [
      { plan: 'Deux personnes, plan moyen', duree: '0:00–0:16', action: 'Approche frontale, distance d\'un bras, corps orienté.', voice: 'On salue de face. Jamais de trois-quarts avec la main tendue : ça fuit.' },
      { plan: 'Gros plan mains', duree: '0:16–0:38', action: 'Main verticale, paume ni dessus ni dessous, deux secousses, pression ferme et brève.', voice: 'Deux secousses, pas quatre. Ferme, court. Tu relâches le premier : c\'est toi qui donnes le tempo.' },
      { plan: 'Plan serré visage', duree: '0:38–0:58', action: 'Contact visuel pendant la poignée de main, puis le prénom est répété.', voice: 'Les yeux pendant la main. Et tu répètes le prénom : « Enchanté, Karim. » Retenir un prénom, c\'est un cadeau.' },
      { plan: 'Plan large', duree: '0:58–1:10', action: 'On se décale d\'un demi-pas pour laisser passer la conversation suivante.', voice: 'Puis tu libères le passage. Saluer, c\'est aussi savoir terminer.' },
    ],
    notes: 'Main moite, regard fuyant, secousses multiples : les trois signaux qui détruisent la première impression.',
  },
  {
    id: 'scr-presenter',
    title: 'Se présenter — prénom, rôle, intention',
    kind: 'video',
    duration: '1:05',
    target: 'Unités 3 · Leçon 1',
    promise: 'Après cette vidéo : une présentation de 20 secondes qui ouvre des portes.',
    shots: [
      { plan: 'Face caméra, buste', duree: '0:00–0:14', action: 'Pieds ancrés, paumes ouvertes à hauteur de taille.', voice: 'Trois briques : qui tu es, ce que tu fais, ce que tu veux ici.' },
      { plan: 'Insert texte', duree: '0:14–0:34', action: 'La formule s\'affiche : « Je m\'appelle X, je fais Y, et je suis venu pour Z. »', voice: 'Je m\'appelle… je fais… je suis venu pour… Rien de plus. Vingt secondes.' },
      { plan: 'Plan moyen', duree: '0:34–0:52', action: 'Débit ralenti, une pause après la dernière phrase. Aucun regard vers le sol.', voice: 'Tu termines, puis tu te tais. Le silence qui suit est ce qui rend la phrase mémorable.' },
      { plan: 'Champ-contrechamp', duree: '0:52–1:05', action: 'Question renvoyée à l\'autre : « Et vous, qu\'est-ce qui vous amène ? »', voice: 'Et tu rends la parole. Un bon présentateur est un intervieweur qui s\'ignore.' },
    ],
    notes: 'Interdit : « je suis quelqu\'un de plutôt… » — les adverbes de doute sont des fuites.',
  },
  {
    id: 'scr-elocution',
    title: 'Lecture à voix haute — l\'élocution qui porte',
    kind: 'video',
    duration: '1:45',
    target: 'Unités 3 · Leçon 2',
    promise: 'Après cette vidéo : tu articules, tu respires, on t\'entend au fond de la salle.',
    shots: [
      { plan: 'Buste, plan serré', duree: '0:00–0:20', action: 'Échauffement : mâchoire relâchée, lèvres « prrrt », langue « la-la-la ».', voice: 'Trois échauffements, trente secondes. Une mâchoire serrée mange la moitié de tes consonnes.' },
      { plan: 'Insert texte', duree: '0:20–0:45', action: 'Un virelangue défile avec un métronome à 60 battements.', voice: 'Un mot par battement. Les consonnes devant, les voyelles tenues. On ne court pas.' },
      { plan: 'Profil, respiration', duree: '0:45–1:10', action: 'Inspiration ventrale par le nez, phrase longue, respiration posée en fin de sens.', voice: 'Tu respires aux virgules, jamais au milieu d\'un groupe de sens. La respiration est une ponctuation.' },
      { plan: 'Plan large, salle', duree: '1:10–1:32', action: 'Projection vers le dernier rang. Volume constant, articulation nette.', voice: 'Tu vises le dernier rang. Ce n\'est pas crier : c\'est envoyer.' },
      { plan: 'Gros plan', duree: '1:32–1:45', action: 'Pause de deux secondes après le dernier mot.', voice: 'Et tu te tais deux secondes. La fin d\'un discours, c\'est le début de l\'autorité.' },
    ],
    notes: 'À coupler avec les pistes audio de cadence (60 et 110 mots/minute).',
  },
  {
    id: 'scr-service',
    title: 'Demander un service — court, clair, avec une porte de sortie',
    kind: 'video',
    duration: '1:15',
    target: 'Unités 3 · Leçon 3',
    promise: 'Après cette vidéo : tu obtiens plus souvent un « oui ».',
    shots: [
      { plan: 'Approche, plan moyen', duree: '0:00–0:16', action: 'Approche frontale, 1,20 m, on attend que l\'autre soit disponible.', voice: 'On n\'intercepte pas, on se rend disponible. Un mètre vingt, de face.' },
      { plan: 'Insert texte', duree: '0:16–0:40', action: 'La structure s\'affiche : demande → raison → durée → porte de sortie.', voice: 'Demande, raison, durée, porte de sortie. « Karim, est-ce que tu peux m\'ouvrir cette porte — j\'ai un dossier à récupérer — ça prend deux minutes. Si ce n\'est pas le moment, dis-le-moi. »' },
      { plan: 'Plan serré', duree: '0:40–1:00', action: 'On se tait et on attend la réponse sans la remplir.', voice: 'Puis tu laisses un silence. Combler le silence, c\'est négocier contre soi.' },
      { plan: 'Plan large', duree: '1:00–1:15', action: 'Remerciement précis, engagement de réciprocité, sortie propre.', voice: 'Un merci précis : « merci d\'avoir pris deux minutes ». Et tu retiens qui tu dois rendre service.' },
    ],
    notes: 'La « porte de sortie » double le taux d\'acceptation : elle retire le coût du refus.',
  },
  {
    id: 'scr-sortir',
    title: 'Sortir d\'une pièce — sans fuir',
    kind: 'video',
    duration: '0:55',
    target: 'Unités 2 · Leçon 3',
    promise: 'Après cette vidéo : tu pars, on te regrette.',
    shots: [
      { plan: 'Assis, plan moyen', duree: '0:00–0:14', action: 'On termine sa phrase, on pose ses mains, on se redresse.', voice: 'On ne se lève pas au milieu d\'une phrase. On termine, puis on se redresse.' },
      { plan: 'Debout, plan large', duree: '0:14–0:32', action: 'Salutation d\'un regard, un mot de conclusion, pas de justification longue.', voice: 'Un regard, une phrase de clôture : « je file, on se reparle ». Pas d\'excuses empilées.' },
      { plan: 'Dos, contrechamp', duree: '0:32–0:46', action: 'Marche lente, épaules orientées en dernier, sans se retourner deux fois.', voice: 'Tu tournes les épaules en dernier. Un seul regard en arrière, jamais deux.' },
      { plan: 'Porte, plan large', duree: '0:46–0:55', action: 'La porte se referme calmement.', voice: 'La porte se ferme sans claquer. C\'est la dernière chose qu\'on entendra de toi.' },
    ],
    notes: 'Fuir, c\'est partir vite. Sortir, c\'est partir proprement.',
  },
]

export const SCRIPT_MAP = Object.fromEntries(SCRIPTS.map((s) => [s.id, s]))

/* --------------------------- Fiches pratiques --------------------------- */

export const FICHES = [
  {
    id: 'fiche-observation',
    title: 'Grille d\'observation du non-verbal',
    kind: 'fiche',
    duration: '4 min de lecture',
    sections: [
      { h: 'Les 5 signaux qui parlent avant toi', items: ['Vitesse du pas à l\'entrée', 'Position des mains (visibles / cachées)', 'Axe de la tête (menton haut, bas, parallèle)', 'Distance d\'approche (moins de 1 m = intrusion)', 'Silences : qui les supporte ?'] },
      { h: 'Protocole d\'entrée en 6 temps', items: ['Souffle ventral (3 s)', 'Main ferme sur la poignée', 'Deux pas lents', 'Arrêt net au centre', 'Scan d\'une seconde', 'Choix de la cible et marche directe'] },
      { h: 'Erreurs à éliminer cette semaine', items: ['Se coller au mur en entrant', 'Tendre la main en trois-quarts', 'Parler en remplissant chaque silence', 'Regarder le sol en réfléchissant', 'Justifier une sortie sur trois phrases'] },
    ],
  },
]

export const FICHE_MAP = Object.fromEntries(FICHES.map((f) => [f.id, f]))

/* ------------------------ Élocution — exercices ------------------------ */

export const DRILLS = [
  {
    id: 'drill-virelangue-1',
    title: 'Virelangue — consonnes d\'attaque',
    level: 'Fondation',
    seconds: 45,
    tempo: 60,
    text: 'Les chaussettes de l\'archiduchesse sont-elles sèches, archi-sèches ?',
    instruction: 'Un mot par battement du métronome 60 BPM. Les consonnes claquent, les voyelles restent ouvertes.',
    criteria: ['Aucune syllabe avalée', 'Fin de phrase entendue au dernier rang', 'Deux respirations placées aux virgules'],
  },
  {
    id: 'drill-virelangue-2',
    title: 'Virelangue — groupes consonantiques',
    level: 'Intermédiaire',
    seconds: 45,
    tempo: 60,
    text: 'Un chasseur sachant chasser doit savoir chasser sans son chien.',
    instruction: 'Même cadence, mais on marque la ponctuation par une pause réelle d\'une demi-seconde.',
    criteria: ['Pause visible aux virgules', 'Volume constant du début à la fin', 'Aucun essoufflement en fin de phrase'],
  },
  {
    id: 'drill-projection',
    title: 'Projection — viser le dernier rang',
    level: 'Intermédiaire',
    seconds: 60,
    tempo: 110,
    text: 'Je m\'appelle … je fais … et je suis venu pour …',
    instruction: 'Remplis les trois trous à voix haute, en visant un point imaginaire au fond de la salle. On ne crie pas : on envoie.',
    criteria: ['Le volume ne baisse pas sur le dernier mot', 'Aucune tension dans les épaules', 'Silence de 2 secondes à la fin'],
  },
  {
    id: 'drill-respiration',
    title: 'Respiration — ponctuer par le souffle',
    level: 'Fondation',
    seconds: 40,
    tempo: 0,
    text: 'Inspiration 3 s · apnée 4 s · expiration 5 s',
    instruction: 'Trois cycles, assis, dos droit. Puis relis ta phrase de présentation d\'un seul souffle.',
    criteria: ['Ventre qui se gonfle (pas les épaules)', 'Expiration plus longue que l\'inspiration', 'Aucun vertige'],
  },
]

export const DRILL_MAP = Object.fromEntries(DRILLS.map((d) => [d.id, d]))

/* ------------------------------ Export texte ------------------------------ */

const rule = (s) => `${s}\n${'='.repeat(Math.max(8, s.length))}`

export const scriptToText = (script) =>
  [
    rule(`METHOD — ${script.title}`),
    `Durée : ${script.duration}   ·   ${script.target}`,
    script.promise,
    '',
    'DÉCOUPAGE',
    ...script.shots.map(
      (s, i) => `\n[${i + 1}] ${s.plan} — ${s.duree}\n    Action : ${s.action}\n    Voix  : « ${s.voice} »`,
    ),
    '',
    `NOTE DE TOURNAGE\n${script.notes}`,
    '',
    'METHOD — Incarne ton Futur Toi',
  ].join('\n')

export const ficheToText = (fiche) =>
  [
    rule(`METHOD — ${fiche.title}`),
    fiche.duration,
    '',
    ...fiche.sections.flatMap((s) => [`${s.h}`, ...s.items.map((i) => `  • ${i}`), '']),
    'METHOD — Incarne ton Futur Toi',
  ].join('\n')

export const drillToText = (drill) =>
  [
    rule(`METHOD — ${drill.title}`),
    `${drill.level} · ${drill.seconds} s${drill.tempo ? ` · ${drill.tempo} BPM` : ''}`,
    '',
    `TEXTE\n  ${drill.text}`,
    '',
    `CONSIGNE\n  ${drill.instruction}`,
    '',
    'CRITÈRES DE RÉUSSITE',
    ...drill.criteria.map((c) => `  ✓ ${c}`),
    '',
    'METHOD — Incarne ton Futur Toi',
  ].join('\n')
