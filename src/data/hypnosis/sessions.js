/* ------------------------------------------------------------------
   sessions.js — Séances d'hypnose éricksonienne (contenu source)
   ------------------------------------------------------------------
   Chaque séance est un vrai script d'hypnose, écrit ici, versionné avec
   le code, puis exporté en fichier texte par scripts/generate-hypnosis.mjs.

   Structure d'une séance
   ----------------------
   • id, title, subtitle, goal        → ce que l'utilisateur voit
   • minutes, level, order, tags      → filtres et parcours conseillé
   • color, ambience, binaural        → bande-son de la séance
   • phases[]                         → la séquence temporelle :
        { id, kind, title, seconds, chime, lines[] }

   `lines` = le texte dit par la voix (synthèse vocale du téléphone) ET
   affiché à l'écran. Si la synthèse vocale est indisponible, la séance
   reste parfaitement utilisable en lecture silencieuse : c'est le même
   texte, un seul source de vérité.

   Langage éricksonien mobilisé : pacing / leading, truismes, « peut-être »,
   doubles contraintes, présuppositions, commandes enchâssées, métaphores,
   répétition et futurisation.
------------------------------------------------------------------- */

export const SESSION_LEVELS = ['Découverte', 'Intermédiaire', 'Avancé']

export const PHASE_KIND = {
  accueil: { label: 'Accueil', icon: 'Feather', color: '#9aa0b5' },
  induction: { label: 'Induction', icon: 'Waves', color: '#4a7fd4' },
  approfondissement: { label: 'Approfondissement', icon: 'Mountain', color: '#2f9e78' },
  suggestion: { label: 'Suggestion', icon: 'Sparkles', color: '#cfa851' },
  visualisation: { label: 'Visualisation', icon: 'Eye', color: '#8b7fd4' },
  ancrage: { label: 'Ancrage', icon: 'Target', color: '#b4323c' },
  emergence: { label: 'Émergence', icon: 'Sunrise', color: '#e0c07c' },
  silence: { label: 'Silence', icon: 'Hourglass', color: '#9aa0b5' },
}

export const phaseKindMeta = (kind) => PHASE_KIND[kind] || PHASE_KIND.suggestion

/* ------------------------------------------------------------------ */
/*  Le catalogue des séances                                          */
/* ------------------------------------------------------------------ */

export const SESSIONS = [
  /* ============================ 1 ============================ */
  {
    id: 'hy-induction',
    title: 'Le souffle qui descend',
    subtitle: 'Induction & détente profonde',
    goal:
      "Entrer en état de détente profonde en moins de dix minutes, sans rien attendre de spécial : juste apprendre le chemin.",
    minutes: 8,
    level: 'Découverte',
    order: 1,
    tags: ['détente', 'souffle', 'stress', 'induction'],
    color: '#4a7fd4',
    ambience: 'hy-amb-nappe-basse',
    binaural: { carrier: 200, beat: 7.83 },
    phases: [
      {
        id: 'accueil',
        kind: 'accueil',
        title: 'Installation',
        seconds: 45,
        chime: true,
        lines: [
          "Installe-toi dans un endroit où tu ne seras pas dérangé pendant quelques minutes. Assis, le dos soutenu, ou allongé si tu préfères.",
          "Pose tes pieds bien à plat, tes mains le long du corps, et laisse ton regard se poser sur un point fixe, juste devant toi.",
          "Il n'y a rien à réussir ici. Il y a seulement à laisser faire.",
        ],
      },
      {
        id: 'induction',
        kind: 'induction',
        title: 'Le souffle',
        seconds: 150,
        chime: true,
        lines: [
          "Tu peux commencer par remarquer ta respiration, telle qu'elle est, sans la changer. Elle a son rythme, et ce rythme t'appartient.",
          "À chaque expiration, tu peux laisser tes paupières devenir plus lourdes. Peut-être qu'elles se ferment maintenant. Peut-être qu'elles se fermeront dans un instant. Peu importe : elles savent.",
          "Inspire par le nez… et à l'expiration, laisse descendre tes épaules. Encore. Et encore. À chaque souffle, tu descends d'un étage.",
          "Tu n'as pas besoin d'écouter chaque mot. Ton inconscient entend ce qui lui est utile, et il sait déjà ce qu'il est venu chercher.",
        ],
      },
      {
        id: 'approfondissement',
        kind: 'approfondissement',
        title: 'La descente',
        seconds: 150,
        chime: true,
        lines: [
          "Laisse une douce lourdeur gagner tes pieds, tes chevilles, tes jambes. Cette lourdeur n'est pas de la fatigue : c'est ton corps qui accepte de se poser.",
          "Elle monte maintenant dans ton bassin, ton ventre, ta poitrine. Chaque zone que tu traverses devient calme, lourde, tranquille.",
          "Tes bras, tes mains, tes doigts. Ton cou. Ta mâchoire se desserre. Ton front s'aplanit.",
          "Tout en haut de ta tête, une dernière tension s'éteint, comme une lumière qu'on baisse doucement.",
          "Et dans ce calme, tu peux remarquer quelque chose d'étrange et d'agréable : plus tu descends, plus tu es présent.",
        ],
      },
      {
        id: 'suggestion',
        kind: 'suggestion',
        title: 'Le calme disponible',
        seconds: 90,
        chime: true,
        lines: [
          "Ce calme que tu ressens, tu peux l'appeler quand tu veux. Il ne t'abandonne pas quand tu ouvres les yeux : il reste disponible, à un souffle de distance.",
          "Tu apprends, à chaque fois, que la détente est une compétence. Et une compétence se répète.",
          "Quoi que tu aies à faire ensuite, tu peux le faire depuis ce calme, plutôt que contre lui.",
        ],
      },
      {
        id: 'emergence',
        kind: 'emergence',
        title: 'Retour',
        seconds: 60,
        chime: true,
        lines: [
          "Dans un instant, je vais compter de un à cinq. À cinq, tu ouvriras les yeux, parfaitement éveillé, calme et clair.",
          "Un : l'énergie revient dans tes jambes. Deux : dans tes bras et ta poitrine. Trois : ta respiration s'éclaircit. Quatre : ton visage se réveille, le regard net.",
          "Cinq. Ouvre les yeux. Tu es là, entier, et tranquille.",
        ],
      },
    ],
  },

  /* ============================ 2 ============================ */
  {
    id: 'hy-escalier',
    title: "L'escalier de marbre",
    subtitle: 'Approfondissement guidé',
    goal:
      "Descendre volontairement d'un cran plus profond, avec un lieu intérieur sûr où revenir chaque fois que tu en as besoin.",
    minutes: 7,
    level: 'Découverte',
    order: 2,
    tags: ['approfondissement', 'lieu sûr', 'métaphore'],
    color: '#2f9e78',
    ambience: 'hy-amb-foret-nuit',
    binaural: { carrier: 180, beat: 6.3 },
    phases: [
      {
        id: 'accueil',
        kind: 'accueil',
        title: 'Avant de descendre',
        seconds: 40,
        chime: true,
        lines: [
          "Ferme les yeux quand tu veux, et prends trois respirations lentes. Ce que tu vas faire maintenant, tu l'as déjà fait sans le savoir : entrer dans un lieu intérieur.",
          "Aujourd'hui, ce lieu a une forme simple : un escalier.",
        ],
      },
      {
        id: 'induction',
        kind: 'induction',
        title: 'Le palier',
        seconds: 80,
        chime: true,
        lines: [
          "Tu te tiens en haut d'un escalier de marbre frais et lisse. Il descend doucement vers un endroit que tu connais déjà, même si tu ne l'as pas encore visité.",
          "La lumière y est basse et dorée. L'air y est plus léger qu'ici.",
          "Tu poses la main sur la rampe. Elle est solide. Tu peux descendre sans risque.",
        ],
      },
      {
        id: 'approfondissement',
        kind: 'approfondissement',
        title: 'Dix marches',
        seconds: 160,
        chime: true,
        lines: [
          "Dix. Tu descends une marche, et ton corps s'allège.",
          "Neuf. Une deuxième, et un bruit de fond s'éteint quelque part.",
          "Huit. Sept. À chaque marche, tu doubles la profondeur du calme.",
          "Six. Cinq. Tu remarques que tu n'as plus besoin de compter pour descendre.",
          "Quatre. Trois. L'endroit s'ouvre devant toi.",
          "Deux. Un. Tu poses le pied sur le sol, et tu es arrivé.",
        ],
      },
      {
        id: 'ancrage',
        kind: 'ancrage',
        title: 'Le lieu sûr',
        seconds: 80,
        chime: true,
        lines: [
          "Regarde autour de toi. Ce lieu t'appartient : peut-être une pièce, une terrasse, une forêt, une plage. Ce que tu y vois est exactement ce dont tu as besoin.",
          "Ressens le sol sous tes pieds, la température de l'air, les sons lointains. Plus tu le rends précis, plus il devient réel.",
          "Ce lieu, tu peux y revenir en fermant les yeux et en descendant ces dix marches. C'est un raccourci que tu viens d'installer.",
        ],
      },
      {
        id: 'emergence',
        kind: 'emergence',
        title: 'Remontée',
        seconds: 60,
        chime: true,
        lines: [
          "Tu peux maintenant remonter, lentement. Une marche, puis une autre. L'énergie revient, agréable.",
          "Cinq : les yeux prêts. Quatre : le souffle ample. Trois : les mains qui bougent. Deux : le visage clair.",
          "Un : ouvre les yeux. Tu gardes ce lieu avec toi.",
        ],
      },
    ],
  },

  /* ============================ 3 ============================ */
  {
    id: 'hy-scene',
    title: 'La salle te respecte',
    subtitle: 'Confiance en prise de parole',
    goal:
      "Répéter mentalement une prise de parole réussie pour installer, avant l'événement, la voix, la posture et le calme.",
    minutes: 10,
    level: 'Intermédiaire',
    order: 3,
    tags: ['confiance', 'prise de parole', 'répétition mentale', 'public'],
    color: '#cfa851',
    ambience: 'hy-amb-nappe-basse',
    binaural: { carrier: 220, beat: 10 },
    phases: [
      {
        id: 'accueil',
        kind: 'accueil',
        title: 'Le cadre',
        seconds: 45,
        chime: true,
        lines: [
          "Assieds-toi droit, épaules basses, et ferme les yeux. Tu vas répéter une scène avant qu'elle n'ait lieu — c'est ainsi que les acteurs, les sportifs et les orateurs préparent le réel.",
          "Le cerveau ne distingue pas complètement une scène imaginée d'une scène vécue. Autant lui donner la bonne version.",
        ],
      },
      {
        id: 'induction',
        kind: 'induction',
        title: 'Détente',
        seconds: 105,
        chime: true,
        lines: [
          "Trois respirations. À chaque expiration, laisse tomber une couche de tension.",
          "Relâche les épaules, la mâchoire, le front. Laisse tes mains s'ouvrir.",
          "Le trac n'est pas un ennemi : c'est de l'énergie qui attend une direction. Nous allons lui en donner une.",
        ],
      },
      {
        id: 'approfondissement',
        kind: 'approfondissement',
        title: 'La veille du moment',
        seconds: 90,
        chime: true,
        lines: [
          "Tu te vois, quelques minutes avant de prendre la parole. Tu es debout, calme, tes pieds bien ancrés dans le sol.",
          "Tu respires par le ventre. Tu entends le bruit de la salle, et tu ne le subis pas : tu l'écoutes.",
          "Il y a peut-être une accélération dans ta poitrine — et tu la laisses passer, parce que tu sais qu'elle redescend.",
        ],
      },
      {
        id: 'visualisation',
        kind: 'visualisation',
        title: 'La scène réussie',
        seconds: 210,
        chime: true,
        lines: [
          "Maintenant, la scène commence. Tu t'avances, sans te presser. Tu t'arrêtes, tu poses ton regard sur la salle. Un silence. Ce silence, c'est toi qui le tiens.",
          "Tu ouvres la bouche, et ta première phrase sort posée, plus lente que tu ne le crois nécessaire. On t'écoute.",
          "Tu vois les visages qui suivent, les têtes qui hochent, les stylos qui s'arrêtent. La salle te respecte, parce que tu te respectes.",
          "Tu articules, tu respires aux virgules, tu poses tes mains. Rien ne tremble.",
          "S'il y a une question difficile, tu la prends comme un cadeau : tu as le droit de réfléchir deux secondes avant de répondre.",
          "Et tu termines par une phrase nette, suivie d'un silence de deux secondes. C'est ce silence qu'on retiendra.",
        ],
      },
      {
        id: 'ancrage',
        kind: 'ancrage',
        title: "L'ancre",
        seconds: 90,
        chime: true,
        lines: [
          "Choisis un geste discret : le pouce contre l'index, ou la main posée à plat sur ta cuisse. Fais-le maintenant, alors que la confiance est à son sommet.",
          "Garde ce geste quelques secondes, et laisse la sensation s'y installer complètement.",
          "Plus tard, juste avant de parler, tu refais ce geste : la confiance revient avec lui. C'est un réflexe que tu viens de créer.",
        ],
      },
      {
        id: 'emergence',
        kind: 'emergence',
        title: 'Retour',
        seconds: 60,
        chime: true,
        lines: [
          "Un : la sensation reste dans ta main. Deux : l'énergie revient dans les jambes. Trois : le souffle s'ouvre. Quatre : le visage se réveille.",
          "Cinq : ouvre les yeux. Tu as déjà réussi une fois. La prochaine fois, ce sera un rappel.",
        ],
      },
    ],
  },

  /* ============================ 4 ============================ */
  {
    id: 'hy-focus',
    title: "L'atelier du mental",
    subtitle: 'Concentration profonde',
    goal:
      "Installer un état de concentration dense et silencieux, à déclencher avant un bloc de travail profond.",
    minutes: 9,
    level: 'Intermédiaire',
    order: 4,
    tags: ['focus', 'deep work', 'concentration', 'distraction'],
    color: '#2f9e78',
    ambience: 'hy-amb-pluie-douce',
    binaural: { carrier: 200, beat: 14 },
    phases: [
      {
        id: 'accueil',
        kind: 'accueil',
        title: 'Fermer la porte',
        seconds: 40,
        chime: true,
        lines: [
          "Téléphone en mode avion. Porte fermée. Tu viens de décider que les quarante prochaines minutes t'appartiennent.",
          "Ferme les yeux. Tu vas transformer le bruit du monde en matière première.",
        ],
      },
      {
        id: 'induction',
        kind: 'induction',
        title: 'Le tri',
        seconds: 100,
        chime: true,
        lines: [
          "Laisse passer les pensées qui arrivent, comme des voitures sur une route : tu les regardes, tu ne montes pas dedans.",
          "Chaque pensée qui passe et que tu ne suis pas libère un peu de ta bande passante.",
          "Respire. À l'expiration, imagine que tu déposes une charge au sol, et que tu ne la reprends pas.",
        ],
      },
      {
        id: 'approfondissement',
        kind: 'approfondissement',
        title: 'La pièce de travail',
        seconds: 100,
        chime: true,
        lines: [
          "Tu descends dans une pièce silencieuse. Les murs sont épais. Aucun bruit n'entre, sauf celui que tu choisis.",
          "Il y a une table, une chaise, une lumière nette sur ton plan de travail. Rien d'autre n'a le droit d'être là.",
          "Tu t'assois. Le temps, dehors, continue sans toi. Ici, seul compte le geste suivant.",
        ],
      },
      {
        id: 'suggestion',
        kind: 'suggestion',
        title: 'Le geste suivant',
        seconds: 180,
        chime: true,
        lines: [
          "Tu ne travailles pas sur toute la montagne. Tu poses une seule brique, parfaitement.",
          "Quand l'envie de vérifier ton téléphone arrive, elle arrive dans une autre pièce, derrière une porte fermée. Tu l'entends à peine.",
          "Ton attention est un muscle, et il est chaud maintenant. Tu peux la poser sur une seule chose et l'y garder.",
          "Tu remarques la qualité de ce silence intérieur : c'est là que naissent les meilleures idées, parce que rien ne les interrompt.",
          "Encore quelques respirations, et tu emportes cette pièce avec toi.",
        ],
      },
      {
        id: 'ancrage',
        kind: 'ancrage',
        title: 'Le signal de départ',
        seconds: 60,
        chime: true,
        lines: [
          "Pose la main à plat sur ton plan de travail, ou sur ta cuisse. Sens la surface. C'est ton signal : quand tu fais ce geste, tu entres dans l'atelier.",
          "Garde-le trois secondes. La concentration s'y attache.",
        ],
      },
      {
        id: 'emergence',
        kind: 'emergence',
        title: 'Mise au travail',
        seconds: 60,
        chime: true,
        lines: [
          "Un : l'énergie revient. Deux : le regard devient net. Trois : tu sais exactement quelle est ta prochaine brique. Quatre : tu as hâte de la poser.",
          "Cinq : ouvre les yeux, et commence dans les dix secondes. Pas de transition. Le premier geste, maintenant.",
        ],
      },
    ],
  },

  /* ============================ 5 ============================ */
  {
    id: 'hy-sommeil',
    title: 'La nuit qui répare',
    subtitle: 'Endormissement & récupération',
    goal:
      "Relâcher le corps et laisser venir le sommeil, sans lutter, avec un balayage du corps qui éteint une zone à la fois.",
    minutes: 12,
    level: 'Découverte',
    order: 5,
    tags: ['sommeil', 'récupération', 'détente', 'nuit'],
    color: '#4a7fd4',
    ambience: 'hy-amb-vagues',
    binaural: { carrier: 120, beat: 4 },
    phases: [
      {
        id: 'accueil',
        kind: 'accueil',
        title: 'Éteindre la journée',
        seconds: 50,
        chime: true,
        lines: [
          "Allonge-toi, dans ton lit, dans la position où tu dors le mieux. Éteins la lumière. Laisse le téléphone loin de la main.",
          "Il n'y a plus rien à régler ce soir. La journée est finie, elle a le droit d'être imparfaite.",
          "Ferme les yeux, et laisse le matelas te porter entièrement.",
        ],
      },
      {
        id: 'induction',
        kind: 'induction',
        title: 'Le souffle lent',
        seconds: 130,
        chime: true,
        lines: [
          "Respire lentement. Inspire sur quatre temps, expire sur six. L'expiration longue dit à ton corps qu'il est en sécurité.",
          "À chaque expiration, tu t'enfonces d'un millimètre de plus dans le matelas.",
          "Tu n'as pas besoin de m'écouter jusqu'au bout. Si tu t'endors avant la fin, c'est exactement ce qui doit arriver.",
        ],
      },
      {
        id: 'approfondissement',
        kind: 'approfondissement',
        title: 'Le balayage du corps',
        seconds: 150,
        chime: true,
        lines: [
          "Porte ton attention sur tes pieds. Laisse-les devenir lourds, chauds, immobiles. Ils ont fini de travailler pour aujourd'hui.",
          "Tes jambes. Tes genoux. Tes cuisses. Tout se pose.",
          "Ton bassin, ton ventre, qui se soulève et retombe au rythme du souffle.",
          "Ta poitrine. Tes épaules, qui descendent enfin. Tes bras, tes mains, tes doigts.",
          "Ton cou. Ta mâchoire, qui s'entrouvre. Ta langue, qui se détend. Tes paupières, déjà lourdes.",
          "Et maintenant ton front, ton crâne, jusqu'au sommet. Ta tête est posée, elle aussi.",
        ],
      },
      {
        id: 'visualisation',
        kind: 'visualisation',
        title: 'Le lieu du repos',
        seconds: 150,
        chime: false,
        lines: [
          "Dans ce calme, laisse venir une image simple. Peut-être une pièce chaude avec une lumière douce. Peut-être une plage au soir, ou une cabane dans la forêt.",
          "Tu t'y reposes. Il n'y a rien à faire. Personne ne t'attend.",
          "Le son lointain que tu entends, ce sont les vagues, ou la pluie, ou le vent dans les feuilles — peu importe, ce son te berce.",
          "Chaque respiration t'éloigne un peu plus de la journée, et te rapproche du repos.",
        ],
      },
      {
        id: 'suggestion',
        kind: 'suggestion',
        title: 'Lâcher prise',
        seconds: 180,
        chime: false,
        lines: [
          "Tu peux déposer les soucis de demain sur une étagère, hors de portée. Ils seront encore là au matin, mais toi, tu auras dormi.",
          "Ton corps sait comment réparer. Tu n'as pas à le diriger. Tu as juste à le laisser faire.",
          "Si une pensée revient, tu la laisses passer comme un nuage, sans la suivre. Le nuage s'en va, et toi tu restes, plus lourd, plus calme.",
          "Plus lente est ta respiration, plus proche est le sommeil.",
          "Tu n'as rien à réussir. Tu as seulement à te laisser descendre.",
        ],
      },
      {
        id: 'silence',
        kind: 'silence',
        title: 'Le silence',
        seconds: 60,
        chime: false,
        lines: [
          "Il n'y a plus rien à dire. Le son s'éloigne. Le corps est lourd et chaud.",
          "Laisse le sommeil venir, à son rythme, comme l'eau monte.",
          "Bonne nuit.",
        ],
      },
    ],
  },

  /* ============================ 6 ============================ */
  {
    id: 'hy-futur',
    title: 'Le Futur Toi',
    subtitle: 'Répétition mentale identitaire',
    goal:
      "Se voir, en détail, dans la version aboutie de soi-même, et ramener de cette vision une décision concrète pour aujourd'hui.",
    minutes: 11,
    level: 'Avancé',
    order: 6,
    tags: ['identité', 'visualisation', 'futurisation', 'incarnation'],
    color: '#b4323c',
    ambience: 'hy-amb-nappe-basse',
    binaural: { carrier: 210, beat: 8 },
    phases: [
      {
        id: 'accueil',
        kind: 'accueil',
        title: 'Le rôle',
        seconds: 45,
        chime: true,
        lines: [
          "Ferme les yeux. Aujourd'hui, tu ne vas pas imaginer une chose : tu vas devenir quelqu'un, le temps d'une séance.",
          "Ce quelqu'un, tu le connais : c'est toi, dans quelques années, une fois le travail fait.",
        ],
      },
      {
        id: 'induction',
        kind: 'induction',
        title: 'Détente et disponibilité',
        seconds: 90,
        chime: true,
        lines: [
          "Trois respirations lentes. Épaules basses. Mâchoire desserrée.",
          "Laisse ton corps devenir calme et disponible, comme une scène avant la représentation, quand la salle est encore vide.",
        ],
      },
      {
        id: 'approfondissement',
        kind: 'approfondissement',
        title: 'Le seuil',
        seconds: 105,
        chime: true,
        lines: [
          "Devant toi, il y a une porte. Derrière elle, il y a une journée ordinaire de ta vie future.",
          "Tu poses la main sur la poignée. Tu respires. Tu ouvres.",
        ],
      },
      {
        id: 'visualisation',
        kind: 'visualisation',
        title: 'Une journée du Futur Toi',
        seconds: 240,
        chime: true,
        lines: [
          "Tu te réveilles tôt, sans lutte. Le corps est entraîné, l'esprit clair. Tu sais pourquoi tu te lèves.",
          "Tu travailles en blocs profonds. Ton téléphone ne te commande pas. Tu termines ce que tu commences, systématiquement — parce que ta parole vaut quelque chose.",
          "Tu parles avec assurance : ta voix est posée, tu respires, tu ne remplis pas les silences. Les gens t'écoutent.",
          "Tu lis, tu apprends, ton corps est fort. Tu es à l'aise dans ta langue comme dans une seconde langue.",
          "Tu négocies, tu décides, tu ne t'excuses plus d'exister. Tu as des projets finis, des preuves, pas des intentions.",
          "Regarde ce visage : c'est le tien. Regarde ces mains : ce sont les tiennes. Rien dans cet homme (ou cette femme) n'est hors de portée de celui que tu es aujourd'hui.",
          "Demande-toi, en silence : quelle est la plus petite habitude que cet être ne négocierait jamais ?",
        ],
      },
      {
        id: 'suggestion',
        kind: 'suggestion',
        title: 'Le pont',
        seconds: 120,
        chime: true,
        lines: [
          "Ce Futur Toi n'est pas un rêve : c'est la somme de journées ordinaires tenues. Il a été construit exactement comme tu peux le construire : une brique, un jour, sans exception.",
          "Tu peux désormais le consulter. Avant chaque décision, une seule question : que ferait-il, lui ?",
          "Et tu remarques que la réponse est presque toujours plus simple que ce que tu redoutes.",
        ],
      },
      {
        id: 'emergence',
        kind: 'emergence',
        title: 'Retour avec une décision',
        seconds: 60,
        chime: true,
        lines: [
          "Un : tu ramènes une image précise de ce visage. Deux : une sensation dans la poitrine. Trois : le souffle s'ouvre. Quatre : tu choisis, maintenant, la première brique d'aujourd'hui.",
          "Cinq : ouvre les yeux. Et fais-la, cette brique, avant que la journée ne te reprenne.",
        ],
      },
    ],
  },
]

export const SESSION_MAP = Object.fromEntries(SESSIONS.map((s) => [s.id, s]))

export const sessionFor = (id) => SESSION_MAP[id] || null

export const sessionList = () => [...SESSIONS].sort((a, b) => (a.order || 0) - (b.order || 0))

/** Durée totale d'une séance (somme des phases), en secondes. */
export const sessionSeconds = (session) =>
  (session?.phases || []).reduce((t, p) => t + (p.seconds || 0), 0)

export const phaseText = (phase) => (phase?.lines || []).join('\n\n')

export const sessionText = (session) => (session?.phases || []).map(phaseText).join('\n\n')

/* ------------------------------------------------------------------ */
/*  Export texte (fiches téléchargeables / hors-ligne)                */
/* ------------------------------------------------------------------ */

const rule = (s) => `${s}\n${'='.repeat(Math.max(8, s.length))}`

export const sessionToText = (session) => {
  if (!session) return ''
  const total = sessionSeconds(session)
  const mm = `${Math.floor(total / 60)}`
  return [
    rule(`METHOD — Hypnose éricksonienne · ${session.title}`),
    `${session.subtitle}   ·   ${mm} min   ·   ${session.level}`,
    '',
    `OBJECTIF\n${session.goal}`,
    '',
    `BANDE-SON\n  Ambiance : ${session.ambience || '—'}${
      session.binaural ? `\n  Battement binaural : ${session.binaural.carrier} Hz + ${session.binaural.beat} Hz` : ''
    }`,
    '',
    'DÉROULÉ',
    ...session.phases.flatMap((p, i) => [
      '',
      `[${i + 1}] ${p.title} — ${Math.round((p.seconds || 0) / 60 * 10) / 10} min (${PHASE_KIND[p.kind]?.label || p.kind})`,
      ...p.lines.map((l) => `    ${l}`),
    ]),
    '',
    'CONSEILS',
    '  • Casque recommandé si tu utilises le battement binaural.',
    '  • Ne conduis jamais pendant une séance.',
    '  • Les séances « sommeil » se terminent sans retour : laisse-toi glisser.',
    '',
    'METHOD — Incarne ton Futur Toi',
  ].join('\n')
}
