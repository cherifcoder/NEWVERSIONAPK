/* ------------------------------------------------------------------
   aiTasks.js — Registre des tâches du Studio IA
   ------------------------------------------------------------------
   Une seule promesse : chaque tâche fonctionne TOUJOURS, même sans clé
   API et sans réseau. Deux moteurs par tâche :

     1. `local(input, ctx)`  → un rendu Markdown déterministe, calculé à
        partir de l'état réel de l'app (aucun réseau).
     2. `prompt(input, ctx)` → le prompt envoyé à un LLM compatible
        OpenAI, SI l'utilisateur a configuré une clé (Réglages).

   `runAiTask` tente le LLM puis retombe sur le moteur local en cas
   d'échec : l'utilisateur ne voit jamais un écran vide.

   Le débrief de journal (tâche « debrief ») reste géré par aiAgent.js et
   son composant dédié.
------------------------------------------------------------------- */

import { buildDigest, buildInsights, buildMetrics, detectTrends, hypnosisSuggestion } from './aiAnalysis'
import { callLLM } from './aiAgent'
import { formatMinutes } from './utils'

/* ------------------------------------------------------------------ */
/*  Contexte partagé                                                   */
/* ------------------------------------------------------------------ */

export const buildContext = (state = {}) => {
  const metrics = buildMetrics(state)
  return {
    state,
    metrics,
    insights: buildInsights(state),
    trends: detectTrends(state),
    digest: buildDigest(state),
    hypnosis: hypnosisSuggestion(state),
  }
}

const ctxSummary = (ctx) => {
  const m = ctx.metrics
  return [
    `Taux d'incarnation : ${m.incarnRate}% (moyenne 7 j : ${m.avgRate7}%)`,
    `Travail profond 7 j : ${Math.round(m.deepWork7 / 60)} h`,
    `Piliers sous 50% : ${m.neglected.map((p) => p.short).join(', ') || 'aucun'}`,
    `Projets ouverts : ${m.openProjectCount} · Tâches ouvertes : ${m.openTasks}`,
    `Série : ${m.streak?.current || 0} j · Journal : ${m.journalCount} débrief(s)`,
    `Hypnose : ${m.hySessions} séance(s) · ${m.hyMinutes} min`,
  ].join('\n- ')
}

const HEADER =
  "Tu es un mentor d'élite francophone : froid, précis, exigeant, élégant. Tu tutoies. Tu mobilises Napoleon Hill, Machiavel, Robert Greene (48 lois du pouvoir), Joe Dispenza, Tony Robbins, Tim Ferriss, Ryan Holiday. Tu réponds en Markdown, sans préambule."

const basePrompt = (ctx, body) => `${HEADER}

ÉTAT MESURÉ DE L'UTILISATEUR :
- ${ctxSummary(ctx)}

${body}

Maximum 450 mots. Pas de préambule, pas de conclusion hors format.`

/* ------------------------------------------------------------------ */
/*  Moteur local : petites briques réutilisables                       */
/* ------------------------------------------------------------------ */

const bullet = (items) => items.map((i) => `- ${i}`).join('\n')
const numbered = (items) => items.map((i, n) => `${n + 1}. ${i}`).join('\n')

const clean = (s = '') => String(s).trim()

/* ------------------------------------------------------------------ */
/*  Tâche — Décoder une situation                                      */
/* ------------------------------------------------------------------ */

const SITUATION_ANGLES = {
  negociation: {
    label: 'Négociation',
    power: "l'information et la patience",
    move: "Ne fais jamais la première offre chiffrée. Laisse l'autre parler, note ses contraintes, puis recadre sur tes intérêts.",
    avoid: "Céder sur le principe pour gagner du temps. Le principe est exactement ce que tu défends.",
  },
  desaccord: {
    label: 'Désaccord',
    power: "le calme et la question",
    move: "Reformule sa position mieux qu'il ne l'a formulée, puis pose UNE question qui expose la faille. Celui qui questionne dirige.",
    avoid: "Vouloir avoir raison. Tu veux obtenir, pas gagner un débat.",
  },
  demande: {
    label: 'Demande / faveur',
    power: "la clarté et l'alternative",
    move: "Fais une demande précise, datée, avec une porte de sortie. « Si ce n'est pas possible, dis-moi ce qui le serait. »",
    avoid: "T'excuser d'exister ou noyer la demande dans un roman.",
  },
  conflit: {
    label: 'Conflit',
    power: "le silence et le temps",
    move: "Baisse le ton, ralentis, laisse un silence de deux secondes. La personne qui remplit le silence perd le cadre.",
    avoid: "Répondre à chaud. Le premier qui s'énerve a déjà perdu la salle.",
  },
  prise_parole: {
    label: 'Prise de parole',
    power: "la structure et le souffle",
    move: "Annonce ta structure en une phrase, dis trois points, conclus par une demande. Respire aux virgules.",
    avoid: "Remplir les silences et t'excuser de parler.",
  },
}

const localSituation = (input) => {
  const situation = clean(input.situation) || '(situation non précisée)'
  const enjeu = SITUATION_ANGLES[input.enjeu] || SITUATION_ANGLES.desaccord
  const objectif = clean(input.objectif) || 'obtenir un accord clair'
  return [
    `## Décodage de la situation`,
    '',
    `**Ce que tu décris :** ${situation}`,
    `**Type d'enjeu :** ${enjeu.label}`,
    `**Ton objectif :** ${objectif}`,
    '',
    `### Lecture froide`,
    `Dans une ${enjeu.label.toLowerCase()}, le rapport de force repose sur ${enjeu.power}. Tant que tu n'as pas identifié ce que l'autre a à perdre, tu joues à l'aveugle.`,
    '',
    `### Ce que tu contrôles`,
    bullet([
      'Ton cadre : lieu, moment, durée de l\'échange.',
      'Ton rythme : parler lentement, laisser des silences.',
      'Ta demande finale : précise, datée, vérifiable.',
    ]),
    '',
    `### Le mouvement`,
    `> ${enjeu.move}`,
    '',
    `### L'erreur à éviter`,
    enjeu.avoid,
    '',
    `### Ta phrase d'ouverture`,
    `> « ${objectif.charAt(0).toUpperCase()}${objectif.slice(1)} — voici ce que je propose, et ce que j'attends en retour. »`,
    '',
    `### Prochaine action (aujourd'hui)`,
    numbered([
      'Écris en une phrase le résultat minimum acceptable (ta limite basse).',
      'Prépare deux arguments maximum — au-delà, tu noies le message.',
      'Fixe le moment exact où tu auras cette conversation.',
    ]),
  ].join('\n')
}

/* ------------------------------------------------------------------ */
/*  Tâche — Débloquer un projet                                        */
/* ------------------------------------------------------------------ */

const localProject = (input) => {
  const projet = clean(input.projet) || 'ton projet'
  const blocage = clean(input.blocage) || 'le démarrage'
  const prochaine = clean(input.prochaineEtape) || 'la prochaine action visible'
  return [
    `## Déblocage — ${projet}`,
    '',
    `**Blocage déclaré :** ${blocage}`,
    `**Prochaine étape visée :** ${prochaine}`,
    '',
    `### Diagnostic`,
    `Un projet bloqué l'est rarement par manque de temps : il l'est par manque de **prochaine action assez petite pour être évidente**. Tant que l'étape suivante demande une décision, ton cerveau fuit.`,
    '',
    `### Découpage (le plus petit incrément d'abord)`,
    numbered([
      `**15 min** : écris la prochaine action en une phrase, au présent, commençant par un verbe (« ouvrir… », « écrire… », « envoyer… »).`,
      `**45 min** : réalise uniquement cet incrément. Rien d'autre n'a le droit d'exister pendant ce bloc.`,
      `**10 min** : livre-le (commit, envoi, fichier) — même imparfait. Un incrément livré vaut mieux qu'un incrément parfait dans ta tête.`,
    ]),
    '',
    `### Les 3 pièges à retirer`,
    bullet([
      'Vouloir tout planifier avant de commencer (la planification est une procrastination déguisée).',
      'Travailler sur plusieurs projets en parallèle (chaque bascule coûte 20 minutes d\'attention).',
      'Attendre la motivation : elle vient après le premier geste, jamais avant.',
    ]),
    '',
    `### Engagements`,
    bullet([
      `Bloc de 90 min aujourd'hui, intention : « ${prochaine} ».`,
      'Téléphone en mode avion, porte fermée, notifications coupées.',
      'Un seul critère de réussite : un résultat **visible** avant la fin du bloc.',
    ]),
    '',
    `> Le projet ne se termine pas par inspiration. Il se termine par un incrément livré chaque jour, sans exception.`,
  ].join('\n')
}

/* ------------------------------------------------------------------ */
/*  Tâche — Rééquilibrer les piliers                                   */
/* ------------------------------------------------------------------ */

const localPillars = (input, ctx) => {
  const m = ctx.metrics
  const weak = m.neglected.length ? m.neglected : m.pillars.slice().sort((a, b) => a.pct - b.pct).slice(0, 2)
  const focus = clean(input.focus)
  return [
    `## Rééquilibrage des piliers`,
    '',
    `**Taux d'incarnation du jour :** ${m.incarnRate}%`,
    `**Moyenne 7 jours :** ${m.avgRate7}%`,
    focus ? `**Pilier que tu veux prioriser :** ${focus}` : '',
    '',
    `### État actuel`,
    bullet(
      m.pillars.map(
        (p) => `${p.label} : ${p.today}/${p.target} ${p.unit} — **${p.pct}%** (moyenne 7 j : ${p.average})`,
      ),
    ),
    '',
    `### Priorités`,
    weak.length
      ? bullet(
          weak
            .slice(0, 3)
            .map((p) => `**${p.label}** — il manque ${p.gap} ${p.unit} pour atteindre l'objectif. Version minimale : ${Math.max(5, Math.round(p.target * 0.3))} ${p.unit}.`),
        )
      : bullet(['Aucun pilier sous 50% : maintiens le rythme et augmente un seul pilier de 20%.']),
    '',
    `### Plan de la journée (réaliste)`,
    numbered([
      'Le pilier le plus faible **en premier**, avant midi, en version minimale.',
      'Un bloc de travail profond de 90 min sur le pilier « Code & Deep Work ».',
      'Une action de 15 min sur le deuxième pilier le plus faible.',
      'Le soir : une séance d\'hypnose d\'ancrage pour consolider.',
    ]),
    '',
    `> Un royaume ne tombe pas d'un coup : il tombe province par province. Reprends-les une par une.`,
  ]
    .filter((l) => l !== '')
    .join('\n')
}

/* ------------------------------------------------------------------ */
/*  Tâche — Lire la tendance                                           */
/* ------------------------------------------------------------------ */

const localTrend = (_input, ctx) => {
  const lines = [ctx.digest]
  return lines.join('\n')
}

/* ------------------------------------------------------------------ */
/*  Tâche — Affûter un message                                         */
/* ------------------------------------------------------------------ */

const TONES = {
  direct: { label: 'Direct', tip: 'Phrases courtes, verbes d\'action, zéro adjectif inutile.' },
  diplomate: { label: 'Diplomate', tip: 'Reconnais d\'abord, propose ensuite, laisse une porte ouverte.' },
  inspirant: { label: 'Inspirant', tip: 'Pars d\'une image, relie-la à un enjeu plus grand, termine par un appel.' },
  ferme: { label: 'Ferme', tip: 'Affirme, ne justifie pas, conclus par une limite claire.' },
}

const localEloquence = (input) => {
  const message = clean(input.message) || '(message non précisé)'
  const destinataire = clean(input.destinataire) || 'ton interlocuteur'
  const ton = TONES[input.ton] || TONES.direct
  return [
    `## Message affûté`,
    '',
    `**Destinataire :** ${destinataire}`,
    `**Ton visé :** ${ton.label}`,
    `**Message d'origine :** ${message}`,
    '',
    `### Structure en 3 temps`,
    numbered([
      `**L'accroche (1 phrase)** : dis l'essentiel tout de suite. « ${message.split(/[.!?]/)[0]?.trim() || 'Voici ce que je propose'}. »`,
      `**Le corps (3 points max)** : ce que tu veux, pourquoi c'est juste, ce que tu offres en retour.`,
      `**La chute (1 phrase)** : une demande précise et datée. Termine par un silence de deux secondes.`,
    ]),
    '',
    `### Version réécrite (ton ${ton.label.toLowerCase()})`,
    `> ${destinataire}, ${message.replace(/\s+/g, ' ').replace(/^(je|j')/i, 'je')}. Voici ce que je propose : [action précise]. En retour, j'attends [contrepartie précise]. Dis-moi si c'est faisable avant [date].`,
    '',
    `### Les 4 règles`,
    bullet([
      ton.tip,
      'Supprime tout ce qui ressemble à une excuse ou à une justification de ta place.',
      'Un seul message, une seule demande. Deux demandes = zéro réponse.',
      'Relis à voix haute : si tu manques d\'air, la phrase est trop longue.',
    ]),
    '',
    `> Celui qui parle lentement et se tait au bon moment n'a pas besoin d'élever la voix.`,
  ].join('\n')
}

/* ------------------------------------------------------------------ */
/*  Tâche — Écrire un script d'hypnose                                 */
/* ------------------------------------------------------------------ */

const localHypno = (input) => {
  const objectif = clean(input.objectif) || 'retrouver le calme avant de parler en public'
  const obstacle = clean(input.obstacle) || 'la peur du jugement'
  const duree = input.duree || '8'
  return [
    `## Script d'hypnose personnalisé`,
    '',
    `**Objectif :** ${objectif}`,
    `**Obstacle travaillé :** ${obstacle}`,
    `**Durée conseillée :** ${duree} minutes`,
    '',
    `> Lis ce script à voix lente (environ 90 mots/minute), ou enregistre-toi. Fais une pause d'une seconde après chaque phrase. Ne cherche pas à bien faire : laisse simplement les mots agir.`,
    '',
    `### 1. Accueil (1 min)`,
    `Installe-toi confortablement, les pieds bien posés, les mains ouvertes. Ferme les yeux quand tu veux. Il n'y a rien à réussir : seulement à laisser faire.`,
    '',
    `### 2. Induction (2 min)`,
    `Remarque ta respiration, telle qu'elle est. À chaque expiration, laisse tes épaules descendre un peu plus bas. Tu peux compter de dix à un, et à chaque chiffre descendre une marche vers un endroit calme, tiède, à toi.`,
    '',
    `### 3. Approfondissement (2 min)`,
    `Plus tu descends, plus ton corps devient lourd et tranquille. Ta mâchoire se desserre, ton front s'aplanit. Et peut-être que, sans que tu le décides, ton inconscient commence à comprendre ce qu'il est venu chercher ici.`,
    '',
    `### 4. Suggestions (2–3 min)`,
    `Ton objectif est simple : **${objectif}**.`,
    `Tu connais l'obstacle : **${obstacle}**. Cet obstacle n'est pas un mur : c'est une vieille protection. Tu peux le remercier, puis le déposer, parce que tu n'en as plus besoin.`,
    `À chaque fois que ${obstacle.replace(/^la |^le |^l'/i, '')} revient, tu remarques quelque chose d'étrange : tu peux respirer, ralentir, et répondre depuis un endroit plus large.`,
    `Tu n'as pas besoin de chasser la peur. Tu as seulement besoin de faire ce que tu as décidé, peur incluse.`,
    `Chaque fois que tu agis malgré elle, elle perd un peu de pouvoir, et toi tu gagnes une preuve.`,
    '',
    `### 5. Ancrage (1 min)`,
    `Choisis un geste discret : le pouce contre l'index, ou la main posée à plat. Fais-le maintenant, alors que le calme est à son sommet. Garde-le quelques secondes : la sensation s'y installe. Plus tard, ce geste la rappellera.`,
    '',
    `### 6. Émergence (1 min)`,
    `Dans un instant, je compte de un à cinq. Un : l'énergie revient dans tes jambes. Deux : dans ta poitrine. Trois : ton souffle s'ouvre. Quatre : ton visage se réveille. Cinq : ouvre les yeux, calme et clair, et va faire la première petite chose que tu as décidée.`,
    '',
    `### Comment l'utiliser`,
    bullet([
      'Le matin avant une échéance, ou le soir pour consolider.',
      'Une séance audio guidée équivalente est disponible dans le module Hypnose (onglet Séances).',
      'La répétition compte plus que la durée : 8 minutes par jour battent 1 heure une fois par mois.',
    ]),
  ].join('\n')
}

/* ------------------------------------------------------------------ */
/*  Tâche — Coach libre                                                */
/* ------------------------------------------------------------------ */

const COACH_KB = [
  {
    match: ['procrastin', 'remets', 'remettre', 'flemme', 'pas envie', 'motivation'],
    title: 'Procrastination',
    body: [
      'La procrastination n\'est pas un problème de temps, c\'est un problème d\'émotion : tu fuis une sensation (peur d\'échouer, ennui, ambiguïté).',
      '',
      numbered([
        'Réduis la tâche à un geste de 2 minutes, absurdement petit.',
        'Engage-toi sur le geste, pas sur le résultat.',
        'Choisis une heure fixe et un lieu fixe : l\'habitude remplace la volonté.',
        'Rends l\'échec non négociable : « je fais 2 minutes, puis je peux arrêter ».',
      ]),
      '',
      '> La motivation suit l\'action. Elle ne la précède jamais.',
    ],
  },
  {
    match: ['peur', 'trac', 'stress', 'anxiété', 'angoisse', 'jugement'],
    title: 'Peur & trac',
    body: [
      'Le trac est de l\'énergie sans direction. Il ne s\'agit pas de le supprimer, mais de lui donner une tâche.',
      '',
      bullet([
        'Respire lentement, expiration deux fois plus longue que l\'inspiration.',
        'Rappelle-toi une fois où tu as tenu bon : le corps ne distingue pas le souvenir du présent.',
        'Agis peur incluse. Chaque action malgré la peur est une preuve déposée au dossier.',
      ]),
      '',
      '> Le courage n\'est pas l\'absence de peur. C\'est décider que quelque chose compte plus qu\'elle.',
    ],
  },
  {
    match: ['focus', 'concentration', 'distrait', 'attention', 'téléphone'],
    title: 'Concentration',
    body: [
      'L\'attention est un muscle et une ressource finie. On ne l\'augmente pas, on la protège.',
      '',
      numbered([
        'Un bloc de 90 minutes, une seule tâche, téléphone dans une autre pièce.',
        'Écris l\'intention du bloc en une phrase avant de commencer.',
        'Note les distractions sur un papier au lieu de les suivre.',
        'Termine par 5 minutes de revue : qu\'est-ce qui a été livré ?',
      ]),
      '',
      '> Le travail profond est la seule monnaie qui achète la liberté technique.',
    ],
  },
  {
    match: ['temps', 'organisation', 'planifi', 'emploi du temps', 'débordé'],
    title: 'Temps & organisation',
    body: [
      'Tu n\'as pas un problème de temps : tu as un problème de priorités. Tout ne peut pas être fait, et c\'est une bonne nouvelle.',
      '',
      bullet([
        'Identifie les 3 tâches qui produisent 80% du résultat. Le reste attend.',
        'Bloque-les dans ton agenda comme des rendez-vous non déplaçables.',
        'Dis non par défaut : chaque oui est un non à quelque chose de plus important.',
      ]),
      '',
      '> Si tout est prioritaire, rien ne l\'est.',
    ],
  },
  {
    match: ['sommeil', 'dormir', 'nuit', 'fatigué', 'épuisé', 'insomnie'],
    title: 'Sommeil & récupération',
    body: [
      'La récupération n\'est pas une récompense, c\'est une condition de performance.',
      '',
      numbered([
        'Heure de lever fixe, même le week-end.',
        'Pas d\'écran 45 minutes avant le coucher ; lumière basse.',
        'Une séance d\'hypnose « La nuit qui répare » pour éteindre le mental.',
        'Caféine : rien après 14h.',
      ]),
      '',
      '> Celui qui méprise son sommeil paiera la facture en jugement et en volonté.',
    ],
  },
  {
    match: ['confiance', 'estime', 'légitime', 'imposteur', 'doute'],
    title: 'Confiance en soi',
    body: [
      'La confiance n\'est pas un trait, c\'est un compte en banque : elle se remplit par des preuves, pas par des affirmations.',
      '',
      bullet([
        'Chaque jour, dépose une preuve visible (commit, envoi, exercice, page lue).',
        'Rappelle-toi : la posture précède la pensée. Tiens-toi droit, parle lentement.',
        'Répète mentalement tes prises de parole (séance « La salle te respecte »).',
      ]),
      '',
      '> On ne se sent pas prêt. On devient prêt en agissant.',
    ],
  },
  {
    match: ['argent', 'financ', 'richesse', 'revenu', 'business'],
    title: 'Argent & création de valeur',
    body: [
      'L\'argent suit la valeur livrée, pas l\'intention. Commence par rendre un service mesurable à quelqu\'un.',
      '',
      numbered([
        'Écris la compétence rare que tu peux vendre dans 90 jours.',
        'Trouve une personne qui a ce problème aujourd\'hui, pas un marché abstrait.',
        'Livre une version 1 imparfaite, encaisse, améliore.',
        'Réinvestis une part fixe dans tes compétences.',
      ]),
      '',
      '> La première richesse est la capacité de livrer sans supervision.',
    ],
  },
  {
    match: ['discipline', 'régularité', 'constance', 'abandon', 'tenir'],
    title: 'Discipline',
    body: [
      'La discipline est une architecture, pas une qualité morale. Tu ne tiens pas par volonté : tu tiens par système.',
      '',
      bullet([
        'Rends le geste évident : matériel prêt, lieu dédié, heure fixe.',
        'Réduis la friction à zéro et augmente la friction des distractions.',
        'Ne casse jamais deux fois de suite la chaîne. Un jour manqué, on reprend le lendemain, sans drame.',
      ]),
      '',
      '> Tu ne montes pas au niveau de tes objectifs. Tu descends au niveau de tes systèmes.',
    ],
  },
]

const localCoach = (input, ctx) => {
  const q = clean(input.question)
  const low = q.toLowerCase()
  const hit = COACH_KB.find((k) => k.match.some((m) => low.includes(m)))
  const m = ctx.metrics
  const situation = [
    `**Ta situation mesurée :** incarnation ${m.incarnRate}%, travail profond 7 j ${Math.round(m.deepWork7 / 60)} h, série ${m.streak?.current || 0} j, projets ouverts ${m.openProjectCount}.`,
    m.neglected.length ? `**Point faible détecté :** ${m.neglected[0].label} (${m.neglected[0].pct}%).` : '**Aucun pilier en rouge.**',
  ].join('\n')

  if (hit) {
    return [
      `## ${hit.title}`,
      '',
      situation,
      '',
      `**Ta question :** ${q || '(aucune question précise)'}`,
      '',
      ...hit.body,
      '',
      `### Action immédiate`,
      `Fais la plus petite chose de cette liste dans les 10 prochaines minutes. Pas demain : maintenant.`,
    ].join('\n')
  }

  return [
    `## Réponse du coach`,
    '',
    situation,
    '',
    `**Ta question :** ${q || '(aucune question précise)'}`,
    '',
    `### Le cadre`,
    bullet([
      'Découpe le problème jusqu\'à ce que la prochaine action tienne en une phrase.',
      'Choisis ce qui a le plus de conséquences, pas ce qui est le plus agréable.',
      'Agis sur le seul élément que tu contrôles vraiment : ton prochain geste.',
    ]),
    '',
    `### Trois mouvements`,
    numbered([
      'Écris le résultat que tu veux obtenir, mesurable, avec une date.',
      'Liste les trois obstacles probables. Pour chacun, une parade prête à l\'emploi.',
      'Lance le premier bloc de 25 minutes maintenant, sur l\'obstacle le plus probable.',
    ]),
    '',
    `> La clarté vient de l'action, pas de la réflexion. Commence, et la suite s'éclaire.`,
  ].join('\n')
}

/* ------------------------------------------------------------------ */
/*  Registre                                                           */
/* ------------------------------------------------------------------ */

const field = (id, label, extra = {}) => ({ id, label, ...extra })

export const AI_TASKS = [
  {
    id: 'situation',
    label: 'Situation',
    short: 'Décoder',
    icon: 'Handshake',
    eyebrow: 'Stratégie',
    title: 'Décoder une situation',
    subtitle: 'Un rapport de force, une demande, un désaccord : la lecture froide et le mouvement juste.',
    fields: [
      field('situation', 'La situation, en quelques lignes', { type: 'textarea', placeholder: 'Ex. : mon associé veut augmenter sa part sans apporter plus de travail…', required: true }),
      field('enjeu', 'Type d\'enjeu', {
        type: 'select',
        options: [
          { value: 'negociation', label: 'Négociation' },
          { value: 'desaccord', label: 'Désaccord' },
          { value: 'demande', label: 'Demande / faveur' },
          { value: 'conflit', label: 'Conflit' },
          { value: 'prise_parole', label: 'Prise de parole' },
        ],
      }),
      field('objectif', 'Ton objectif', { placeholder: 'Ex. : obtenir un accord écrit cette semaine' }),
    ],
    local: localSituation,
    prompt: (input, ctx) =>
      basePrompt(
        ctx,
        `TÂCHE : décoder une situation et donner un plan d'action.
SITUATION : ${clean(input.situation) || '(non précisée)'}
TYPE D'ENJEU : ${input.enjeu || 'desaccord'}
OBJECTIF : ${clean(input.objectif) || '(non précisé)'}

FORMAT :
## Décodage de la situation
### Rapport de force
### Trois options (de la plus douce à la plus ferme)
### Ta phrase d'ouverture
### L'erreur à éviter
### Prochaine action (aujourd'hui)`,
      ),
  },
  {
    id: 'project',
    label: 'Projets',
    short: 'Débloquer',
    icon: 'Rocket',
    eyebrow: 'Zéro abandon',
    title: 'Débloquer un projet',
    subtitle: 'Découper le blocage jusqu\'au plus petit incrément livrable aujourd\'hui.',
    fields: [
      field('projet', 'Le projet', { placeholder: 'Ex. : application de suivi d\'incarnation', required: true }),
      field('blocage', 'Où ça bloque', { type: 'textarea', placeholder: 'Ex. : je ne sais pas par où commencer, je tourne en rond…' }),
      field('prochaineEtape', 'Prochaine étape visée', { placeholder: 'Ex. : publier une première version' }),
    ],
    local: localProject,
    prompt: (input, ctx) =>
      basePrompt(
        ctx,
        `TÂCHE : débloquer un projet (règle absolue : tout ce qui est commencé est terminé).
PROJET : ${clean(input.projet) || '(non précisé)'}
BLOCAGE : ${clean(input.blocage) || '(non précisé)'}
PROCHAINE ÉTAPE VISÉE : ${clean(input.prochaineEtape) || '(non précisée)'}

FORMAT :
## Déblocage — <projet>
### Diagnostic
### Découpage (15 / 45 / 10 minutes)
### Les pièges à retirer
### Engagements mesurables du jour`,
      ),
  },
  {
    id: 'pillars',
    label: 'Piliers',
    short: 'Rééquilibrer',
    icon: 'Layers',
    eyebrow: 'Le Charbon',
    title: 'Rééquilibrer les piliers',
    subtitle: 'Un plan de journée réaliste à partir de tes chiffres réels.',
    fields: [field('focus', 'Pilier à prioriser (optionnel)', { placeholder: 'Ex. : Éloquence & Négociation' })],
    local: localPillars,
    prompt: (input, ctx) =>
      basePrompt(
        ctx,
        `TÂCHE : rééquilibrer les 6 piliers à partir des chiffres fournis.
PILIER À PRIORISER : ${clean(input.focus) || '(libre)'}

FORMAT :
## Rééquilibrage des piliers
### État actuel (par pilier)
### Priorités (les 3 plus faibles)
### Plan de la journée (réaliste, horodaté)`,
      ),
  },
  {
    id: 'trend',
    label: 'Tendance',
    short: 'Lire',
    icon: 'TrendingUp',
    eyebrow: 'Analyse',
    title: 'Lire la tendance',
    subtitle: 'Comparaison des 7 derniers jours avec les 7 précédents, et ce que ça annonce.',
    fields: [],
    local: localTrend,
    prompt: (_input, ctx) =>
      basePrompt(
        ctx,
        `TÂCHE : analyser la tendance sur 7 jours et anticiper.
DONNÉES FOURNIES DANS LA REVUE CI-DESSOUS :
${ctx.digest}

FORMAT :
## Tendance de la semaine
### Ce qui monte
### Ce qui décroche
### Ce que ça annonce si rien ne change
### Le levier n°1 à activer cette semaine`,
      ),
  },
  {
    id: 'eloquence',
    label: 'Éloquence',
    short: 'Affûter',
    icon: 'Mic',
    eyebrow: 'La parole',
    title: 'Affûter un message',
    subtitle: 'Transformer un message confus en une demande claire qui obtient une réponse.',
    fields: [
      field('message', 'Ton message actuel', { type: 'textarea', placeholder: 'Ex. : je voulais te dire que peut-être on pourrait voir pour…', required: true }),
      field('destinataire', 'Destinataire', { placeholder: 'Ex. : un client, mon manager…' }),
      field('ton', 'Ton visé', {
        type: 'select',
        options: [
          { value: 'direct', label: 'Direct' },
          { value: 'diplomate', label: 'Diplomate' },
          { value: 'inspirant', label: 'Inspirant' },
          { value: 'ferme', label: 'Ferme' },
        ],
      }),
    ],
    local: localEloquence,
    prompt: (input, ctx) =>
      basePrompt(
        ctx,
        `TÂCHE : réécrire un message pour qu'il obtienne une réponse.
MESSAGE : ${clean(input.message) || '(non précisé)'}
DESTINATAIRE : ${clean(input.destinataire) || '(non précisé)'}
TON : ${input.ton || 'direct'}

FORMAT :
## Message affûté
### Structure en 3 temps
### Version réécrite (prête à envoyer)
### Variante plus courte
### Les règles à respecter`,
      ),
  },
  {
    id: 'hypno',
    label: 'Hypnose',
    short: 'Script',
    icon: 'Waves',
    eyebrow: 'Hypnose éricksonienne',
    title: 'Écrire un script d\'hypnose',
    subtitle: 'Un script personnalisé (induction → suggestion → émergence) que tu peux lire ou enregistrer.',
    fields: [
      field('objectif', 'Objectif de la séance', { placeholder: 'Ex. : rester calme avant une prise de parole', required: true }),
      field('obstacle', 'Obstacle / peur à travailler', { type: 'textarea', placeholder: 'Ex. : la peur du jugement des autres' }),
      field('duree', 'Durée', {
        type: 'select',
        options: [
          { value: '5', label: '5 minutes' },
          { value: '8', label: '8 minutes' },
          { value: '12', label: '12 minutes' },
        ],
      }),
    ],
    local: localHypno,
    prompt: (input, ctx) =>
      basePrompt(
        ctx,
        `TÂCHE : écrire un script d'hypnose éricksonienne en français, à lire à voix lente.
OBJECTIF : ${clean(input.objectif) || '(non précisé)'}
OBSTACLE : ${clean(input.obstacle) || '(non précisé)'}
DURÉE : ${input.duree || '8'} minutes

CONSIGNES : langage éricksonien (pacing/leading, truismes, « peut-être », doubles contraintes, commandes enchâssées, métaphores). Phrases courtes, pauses marquées.

FORMAT :
## Script d'hypnose personnalisé
### 1. Accueil
### 2. Induction
### 3. Approfondissement
### 4. Suggestions
### 5. Ancrage
### 6. Émergence
### Comment l'utiliser`,
      ),
  },
  {
    id: 'coach',
    label: 'Coach libre',
    short: 'Demander',
    icon: 'MessageSquare',
    eyebrow: 'Mentor',
    title: 'Coach libre',
    subtitle: 'Pose une question franche : tu obtiens une réponse sans complaisance et une action immédiate.',
    fields: [field('question', 'Ta question', { type: 'textarea', placeholder: 'Ex. : je procrastine depuis trois jours, comment je casse ça ?', required: true })],
    local: localCoach,
    prompt: (input, ctx) =>
      basePrompt(
        ctx,
        `TÂCHE : répondre à la question de l'utilisateur comme un mentor d'élite.
QUESTION : ${clean(input.question) || '(non précisée)'}

FORMAT :
## Réponse du coach
### Le cadre (ce que dit la situation)
### Trois mouvements concrets
### Action immédiate (dans les 10 minutes)`,
      ),
  },
]

export const TASK_MAP = Object.fromEntries(AI_TASKS.map((t) => [t.id, t]))
export const taskById = (id) => TASK_MAP[id] || null

/* ------------------------------------------------------------------ */
/*  Exécution : LLM si dispo, sinon moteur local (jamais d'écran vide)  */
/* ------------------------------------------------------------------ */

export const runAiTask = async ({ taskId, input = {}, state = {}, settings = {}, signal }) => {
  const task = taskById(taskId)
  if (!task) throw new Error(`Tâche inconnue : ${taskId}`)
  const ctx = buildContext(state)
  const local = task.local(input, ctx)

  const hasKey = Boolean(settings?.aiApiKey) && settings?.aiEnabled !== false
  if (hasKey) {
    try {
      const text = await callLLM({ prompt: task.prompt(input, ctx), settings, signal })
      return { text, local, source: 'ia', provider: settings.aiProvider }
    } catch (err) {
      return { text: local, local, source: 'local', error: err?.message || 'Erreur inconnue' }
    }
  }
  return { text: local, local, source: 'local' }
}

/** Petite accroche affichée avant de lancer une tâche. */
export const taskHint = (taskId) => {
  const t = taskById(taskId)
  if (!t) return ''
  return t.fields?.length ? 'Renseigne les champs puis lance l\'analyse.' : 'Lance l\'analyse : elle s\'appuie sur tes données locales.'
}

export const formatMetric = (v) => formatMinutes(v)
