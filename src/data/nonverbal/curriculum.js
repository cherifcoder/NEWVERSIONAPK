/* ------------------------------------------------------------------
   curriculum.js — Parcours « Communication non verbale »
   ------------------------------------------------------------------
   Modèle : Cours → Unités → Leçons → Étapes.

   • Une leçon dure 4 à 6 minutes (micro-learning, codes Duolingo).
   • Une étape est atomique et d'un seul type :
       illustration · clip · audio · reading · quiz · practice
   • Les visuels (illustration, clip) sont référencés par identifiant
     (poseId / clipId) : ils sont vectoriels et embarqués → 0 octet à
     télécharger.
   • Les médias lourds (audio, textes, vidéo optionnelle) sont
     référencés par mediaId → téléchargeables pour le hors-ligne.
------------------------------------------------------------------- */

export const COURSE = {
  id: 'nv-presence',
  title: 'Présence & Situations sociales',
  subtitle: 'Le corps qui parle avant toi : entrer, s\'arrêter, s\'asseoir, saluer, parler, sortir.',
  minutes: 42,
  level: 'Fondation',
  icon: 'PersonStanding',
  units: [
    /* ============================ UNITÉ 1 ============================ */
    {
      id: 'u1',
      title: 'Le corps avant les mots',
      subtitle: 'L\'axe, le pas, l\'arrêt. Ce qui se lit avant la première syllabe.',
      color: '#cfa851',
      lessons: [
        {
          id: 'l1-axe',
          title: 'L\'axe vertical',
          goal: 'Tenir une verticale oreille-épaule-hanche sans raideur.',
          minutes: 4,
          tags: ['posture', 'alignement', 'base'],
          steps: [
            {
              id: 's1',
              kind: 'illustration',
              poseId: 'stand-neutral',
              showAxis: true,
              title: 'La verticale de référence',
              caption: 'Le point de départ de tout : un corps aligné, immobile, disponible.',
              points: [
                'Menton parallèle au sol — ni haut (arrogance), ni bas (soumission).',
                'Épaules basses : la respiration doit pouvoir descendre au ventre.',
                'Poids réparti à 50/50, genoux non verrouillés.',
                'Mains calmes, visibles, le long du corps ou croisées devant à hauteur de taille.',
              ],
            },
            {
              id: 's2',
              kind: 'quiz',
              title: 'Lecture du signal',
              question: 'Un interlocuteur s\'approche de toi avec les épaules remontées et le menton bas. Qu\'est-ce qui est perçu en premier ?',
              options: [
                'De la timidité et une envie de se protéger.',
                'De la fatigue passagère.',
                'Rien de particulier, personne ne remarque.',
              ],
              answer: 0,
              explain:
                'Les épaules remontées ferment la cage thoracique : on lit une mise en défense. Le menton bas coupe le contact visuel. Le message envoyé précède tes mots d\'au moins deux secondes.',
            },
            {
              id: 's3',
              kind: 'practice',
              title: 'Correction en 60 secondes',
              brief: 'Debout devant un miroir ou une caméra frontale. Tu passes en revue les quatre points, du bas vers le haut.',
              seconds: 60,
              checklist: [
                'Pieds largeur de bassin, poids 50/50',
                'Genoux déverrouillés, bassin neutre',
                'Épaules relâchées sur une expiration',
                'Menton parallèle, regard à l\'horizontale',
              ],
            },
            {
              id: 's4',
              kind: 'reading',
              mediaId: 'txt-fiche-observation',
              title: 'Grille d\'observation',
              caption: 'À relire avant chaque situation sociale importante. Téléchargeable pour la consulter hors-ligne.',
            },
          ],
        },
        {
          id: 'l2-entrer',
          title: 'Entrer dans une pièce et s\'arrêter',
          goal: 'Franchir un seuil, faire deux pas lents, s\'arrêter net au centre.',
          minutes: 5,
          tags: ['entrée', 'situation sociale', 'arrêt'],
          steps: [
            {
              id: 's1',
              kind: 'clip',
              clipId: 'clip-enter',
              title: 'La séquence complète',
              caption: 'Franchir → deux pas → arrêt net → scan d\'une seconde → avancer vers la cible.',
            },
            {
              id: 's2',
              kind: 'illustration',
              poseId: 'enter-stop',
              showAxis: true,
              title: 'L\'arrêt qui installe',
              caption: 'L\'arrêt net est le geste le plus sous-estimé : il transforme une intrusion en entrée.',
              points: [
                'Porte ouverte d\'un seul mouvement, main ferme : aucune hésitation.',
                'Deux pas seulement — 20 % plus lents que ton pas habituel.',
                'Arrêt complet, pieds parallèles : le corps dit « je suis attendu ici ».',
                'Une seconde de scan avant de choisir ta direction.',
              ],
            },
            {
              id: 's3',
              kind: 'audio',
              mediaId: 'aud-souffle-345',
              title: 'Le souffle d\'avant-porte',
              caption: 'Trois cycles de respiration ventrale. À écouter juste avant d\'entrer quelque part.',
              tip: 'Ventre, pas poitrine. L\'expiration est plus longue que l\'inspiration : c\'est elle qui calme.',
            },
            {
              id: 's4',
              kind: 'quiz',
              title: 'Erreur à identifier',
              question: 'Tu entres dans une salle pleine. Tu passes la tête d\'abord, tu avances vite et tu te colles au mur. Qu\'est-ce que tu viens de dire ?',
              options: [
                '« Je ne suis pas à ma place ici. »',
                '« Je suis pressé. »',
                '« Je suis discret et respectueux. »',
              ],
              answer: 0,
              explain:
                'La vitesse et le mur sont deux stratégies d\'évitement. La correction est toujours la même : ralentir, s\'arrêter au centre, scanner, puis choisir une cible et y aller.',
            },
            {
              id: 's5',
              kind: 'practice',
              title: 'Répétition à blanc',
              brief: 'Dans un couloir ou une pièce vide : ouvre une porte, fais deux pas lents, arrête-toi net, compte une seconde, puis marche vers un point précis.',
              seconds: 120,
              checklist: [
                'Main ferme, porte ouverte d\'un seul geste',
                'Deux pas, plus lents que d\'habitude',
                'Arrêt complet, sans balancement',
                'Scan d\'une seconde, puis direction choisie',
              ],
            },
            {
              id: 's6',
              kind: 'reading',
              mediaId: 'txt-scr-entrer',
              title: 'Scénario du mini-film',
              caption: 'Le découpage plan par plan de la vidéo « Entrer et s\'arrêter calmement ».',
            },
          ],
        },
        {
          id: 'l3-scan',
          title: 'Balayer la pièce',
          goal: 'Lire une salle en une seconde : table, issue, visages.',
          minutes: 3,
          tags: ['observation', 'regard', 'stratégie'],
          steps: [
            {
              id: 's1',
              kind: 'illustration',
              poseId: 'enter-scan',
              title: 'Le scan utile',
              caption: 'Une seconde, trois informations. Pas un regard qui balaye au hasard.',
              points: [
                '1 — la table : où est le centre de gravité social ?',
                '2 — l\'issue : tu sais toujours comment tu ressortiras.',
                '3 — les visages : qui te regarde déjà ?',
                'Le scan se fait avec la tête, pas avec les yeux seuls.',
              ],
            },
            {
              id: 's2',
              kind: 'practice',
              title: 'Exercice d\'une seconde',
              brief: 'Ouvre une photo de foule ou regarde une pièce réelle : compte une seconde, puis cite mentalement la table, l\'issue et un visage.',
              seconds: 45,
              checklist: ['Temps tenu à une seconde', 'Trois informations nommées', 'Aucun mouvement de tout le corps'],
            },
            {
              id: 's3',
              kind: 'quiz',
              title: 'Priorité du regard',
              question: 'Après le scan, que fais-tu du regard ?',
              options: [
                'Tu choisis une cible et tu y vas sans hésiter.',
                'Tu regardes partout en marchant pour ne rien manquer.',
                'Tu baisses les yeux pour ne pas fixer les gens.',
              ],
              answer: 0,
              explain:
                'Le scan produit une décision. Continuer à balayer en marchant te fait paraître perdu. Regarder le sol te fait paraître soumis. Décider, puis avancer.',
            },
          ],
        },
      ],
    },

    /* ============================ UNITÉ 2 ============================ */
    {
      id: 'u2',
      title: 'S\'asseoir, saluer, sortir',
      subtitle: 'Les trois gestes qui se répètent cent fois par semaine.',
      color: '#4a7fd4',
      lessons: [
        {
          id: 'l4-assise',
          title: 'Posture assise',
          goal: 'Dos droit sans raideur, mains visibles, pieds à plat.',
          minutes: 5,
          tags: ['posture assise', 'réunion', 'mains'],
          steps: [
            {
              id: 's1',
              kind: 'illustration',
              poseId: 'seat-upright',
              showAxis: true,
              title: 'Oreille · épaule · hanche',
              caption: 'Trois points proches d\'une verticale : tu as l\'air présent sans avoir l\'air rigide.',
              points: [
                'Hanches au fond de l\'assise, appuis sous les ischions.',
                'Avant-bras posés, mains visibles sur la table — jamais dessous.',
                'Pieds à plat, largeur de bassin : ils t\'ancrent.',
                'La posture revient : tu te corriges dix fois par réunion, en silence.',
              ],
            },
            {
              id: 's2',
              kind: 'clip',
              clipId: 'clip-seat',
              title: 'S\'installer, puis écouter',
              caption: 'La posture n\'est pas figée : elle alterne entre alignement et écoute active.',
            },
            {
              id: 's3',
              kind: 'quiz',
              title: 'Les mains sous la table',
              question: 'Quel signal envoie le fait de garder les mains cachées sous la table pendant une réunion ?',
              options: [
                'De la réserve, voire une suspicion de dissimulation.',
                'De la concentration.',
                'Un bon maintien, c\'est plus élégant.',
              ],
              answer: 0,
              explain:
                'Les mains visibles sont une déclaration de franchise. Cachées, elles privent l\'autre de la moitié de ton message et déclenchent un doute silencieux.',
            },
            {
              id: 's4',
              kind: 'practice',
              title: 'Assise de contrôle',
              brief: 'Assieds-toi, installe les trois repères, puis tiens 60 secondes en te corrigeant à chaque fois que tu t\'affaisses.',
              seconds: 60,
              checklist: ['Hanches au fond', 'Avant-bras sur la table', 'Pieds à plat', 'Épaules basses'],
            },
            {
              id: 's5',
              kind: 'reading',
              mediaId: 'txt-scr-assise',
              title: 'Scénario du mini-film',
              caption: 'Découpage plan par plan de « Posture assise ».',
            },
          ],
        },
        {
          id: 'l5-saluer',
          title: 'Saluer et serrer la main',
          goal: 'Regard, main, prénom : une première impression dont on se souvient.',
          minutes: 5,
          tags: ['saluer', 'poignée de main', 'prénom'],
          steps: [
            {
              id: 's1',
              kind: 'illustration',
              poseId: 'handshake',
              title: 'La poignée de main',
              caption: 'Deux secousses, pression ferme et brève. Tu relâches le premier.',
              points: [
                'Approche de face, distance d\'un bras : jamais de trois-quarts.',
                'Main verticale, paume ni au-dessus ni en dessous.',
                'Contact visuel pendant la main, pas avant, pas après.',
                'Tu répètes le prénom : c\'est le cadeau le moins cher qui existe.',
              ],
            },
            {
              id: 's2',
              kind: 'clip',
              clipId: 'clip-handshake',
              title: 'Saluer puis se présenter',
              caption: 'La salutation ouvre, la présentation enchaîne.',
            },
            {
              id: 's3',
              kind: 'reading',
              mediaId: 'txt-scr-saluer',
              title: 'Scénario du mini-film',
              caption: 'Le découpage de « Saluer les gens ».',
            },
            {
              id: 's4',
              kind: 'quiz',
              title: 'Le tempo',
              question: 'Qui doit relâcher la main en premier ?',
              options: [
                'Toi — c\'est toi qui donnes le tempo.',
                'L\'autre — c\'est plus poli d\'attendre.',
                'Peu importe, personne ne le remarque.',
              ],
              answer: 0,
              explain:
                'Relâcher le premier, après deux secousses, signale que tu maîtrises l\'échange. Trois ou quatre secousses et une main qui s\'attarde donnent une impression d\'insistance.',
            },
            {
              id: 's5',
              kind: 'practice',
              title: 'Séquence complète',
              brief: 'Face caméra : approche de face, main tendue, deux secousses, regard, puis « Enchanté, [prénom] » — et silence.',
              seconds: 60,
              checklist: ['Approche frontale', 'Deux secousses exactement', 'Regard pendant la main', 'Prénom répété à voix haute'],
            },
          ],
        },
        {
          id: 'l6-sortir',
          title: 'Sortir d\'une pièce',
          goal: 'Partir proprement : terminer, saluer, tourner les épaules en dernier.',
          minutes: 4,
          tags: ['sortie', 'clôture', 'sortir'],
          steps: [
            {
              id: 's1',
              kind: 'clip',
              clipId: 'clip-exit',
              title: 'Sortir sans fuir',
              caption: 'Terminer la phrase → se redresser → saluer d\'un regard → partir lentement.',
            },
            {
              id: 's2',
              kind: 'illustration',
              poseId: 'exit-turn',
              title: 'Les épaules en dernier',
              caption: 'Un seul regard en arrière. Jamais deux.',
              points: [
                'On ne se lève pas au milieu d\'une phrase.',
                'Une phrase de clôture, pas trois excuses empilées.',
                'Marche lente, porte refermée calmement.',
                'Se retourner deux fois annule la sortie : on lit une hésitation.',
              ],
            },
            {
              id: 's3',
              kind: 'reading',
              mediaId: 'txt-scr-sortir',
              title: 'Scénario du mini-film',
              caption: 'Découpage de « Sortir d\'une pièce ».',
            },
            {
              id: 's4',
              kind: 'quiz',
              title: 'Sortie ou fuite ?',
              question: 'Quelle est la différence observable entre sortir et fuir ?',
              options: [
                'La vitesse et la propreté de la clôture.',
                'La distance parcourue.',
                'Le nombre de personnes saluées.',
              ],
              answer: 0,
              explain:
                'Fuir, c\'est partir vite sans clore. Sortir, c\'est terminer sa phrase, saluer d\'un regard et partir lentement. La porte se referme sans claquer : c\'est la dernière chose qu\'on entendra de toi.',
            },
            {
              id: 's5',
              kind: 'practice',
              title: 'Répétition de clôture',
              brief: 'Assis, puis debout, puis sortie : exécute la séquence en 45 secondes sans t\'excuser.',
              seconds: 45,
              checklist: ['Phrase terminée', 'Une seule phrase de clôture', 'Un seul regard arrière', 'Porte fermée calmement'],
            },
          ],
        },
      ],
    },

    /* ============================ UNITÉ 3 ============================ */
    {
      id: 'u3',
      title: 'Prendre la parole',
      subtitle: 'Se présenter, articuler, demander. Le verbe au service du corps.',
      color: '#2f9e78',
      lessons: [
        {
          id: 'l7-presenter',
          title: 'Se présenter en 20 secondes',
          goal: 'Prénom, rôle, intention — puis silence.',
          minutes: 4,
          tags: ['présentation', 'prise de parole', 'silence'],
          steps: [
            {
              id: 's1',
              kind: 'illustration',
              poseId: 'present-open',
              title: 'Paumes ouvertes, débit lent',
              caption: 'Trois briques, vingt secondes, un silence.',
              points: [
                '« Je m\'appelle X. »',
                '« Je fais Y. »',
                '« Je suis venu pour Z. »',
                'Puis tu te tais. Le silence rend la phrase mémorable.',
              ],
            },
            {
              id: 's2',
              kind: 'reading',
              mediaId: 'txt-scr-presenter',
              title: 'Scénario du mini-film',
              caption: 'Découpage de « Se présenter ».',
            },
            {
              id: 's3',
              kind: 'audio',
              mediaId: 'aud-cadence-parole',
              title: 'Cadence cible : 110 mots/minute',
              caption: 'Suis le métronome en récitant ta présentation. Ni trop lent, ni trop rapide.',
              tip: 'Si tu es essoufflé avant la fin de la phrase, tu parles trop vite pour ta respiration.',
            },
            {
              id: 's4',
              kind: 'quiz',
              title: 'Les mots qui affaiblissent',
              question: 'Quelle formulation détruit le plus ta présentation ?',
              options: [
                '« Je suis quelqu\'un de plutôt… enfin, je fais surtout… »',
                '« Je m\'appelle Samir, je suis développeur. »',
                '« Je suis venu pour comprendre votre méthode. »',
              ],
              answer: 0,
              explain:
                'Les adverbes de doute (« plutôt », « enfin », « surtout ») sont des fuites : ils signalent que tu négocies ta propre place avant qu\'on te la conteste.',
            },
            {
              id: 's5',
              kind: 'practice',
              title: 'Ta présentation en 20 s',
              brief: 'Écris tes trois briques, puis dis-les à voix haute, chronométré, avec le métronome.',
              seconds: 20,
              checklist: ['Trois briques exactement', 'Aucun adverbe de doute', 'Pause de 2 s à la fin', 'Regard horizontal'],
            },
          ],
        },
        {
          id: 'l8-elocution',
          title: 'Élocution : lecture à voix haute',
          goal: 'Articuler, respirer, se faire entendre au dernier rang.',
          minutes: 6,
          tags: ['élocution', 'diction', 'lecture', 'voix'],
          steps: [
            {
              id: 's1',
              kind: 'clip',
              clipId: 'clip-elocution',
              title: 'La boucle : souffle → voix → geste',
              caption: 'Le souffle ouvre, la voix porte, le geste ponctue.',
            },
            {
              id: 's2',
              kind: 'audio',
              mediaId: 'aud-cadence-lente',
              title: 'Cadence 60 mots/minute',
              caption: 'Un mot par battement. La base de la diction : consonnes devant, voyelles tenues.',
              tip: 'Si tu perds le battement, ralentis encore. La clarté prime sur la vitesse.',
            },
            {
              id: 's3',
              kind: 'practice',
              title: 'Virelangue au métronome',
              brief: '« Les chaussettes de l\'archiduchesse sont-elles sèches, archi-sèches ? » — un mot par battement, trois passages.',
              seconds: 45,
              drillId: 'drill-virelangue-1',
              checklist: ['Aucune syllabe avalée', 'Fin de phrase audible', 'Deux respirations placées'],
            },
            {
              id: 's4',
              kind: 'audio',
              mediaId: 'aud-appui-syllabes',
              title: 'Appuis de syllabes',
              caption: 'Quatre motifs rythmiques pour travailler l\'accentuation.',
              tip: 'On doit entendre la structure de la phrase, pas seulement les mots.',
            },
            {
              id: 's5',
              kind: 'practice',
              title: 'Projection — viser le dernier rang',
              brief: 'Dis ta présentation en visant un point imaginaire au fond de la salle. On ne crie pas : on envoie.',
              seconds: 60,
              drillId: 'drill-projection',
              checklist: ['Volume constant jusqu\'au dernier mot', 'Épaules basses', 'Silence de 2 s à la fin'],
            },
            {
              id: 's6',
              kind: 'reading',
              mediaId: 'txt-scr-elocution',
              title: 'Scénario du mini-film',
              caption: 'Découpage complet de « Lecture à voix haute — l\'élocution qui porte ».',
            },
          ],
        },
        {
          id: 'l9-service',
          title: 'Demander un service',
          goal: 'Obtenir un « oui » sans forcer : demande, raison, durée, porte de sortie.',
          minutes: 4,
          tags: ['demande', 'négociation', 'service'],
          steps: [
            {
              id: 's1',
              kind: 'illustration',
              poseId: 'ask-service',
              title: 'La structure qui fait dire oui',
              caption: 'Demande → raison → durée → porte de sortie.',
              points: [
                'Approche frontale, 1,20 m, quand l\'autre est disponible.',
                'La raison rend la demande légitime : sans elle, c\'est une exigence.',
                'La durée rend le coût prévisible : « deux minutes ».',
                'La porte de sortie double le taux d\'acceptation : elle retire le coût du refus.',
              ],
            },
            {
              id: 's2',
              kind: 'clip',
              clipId: 'clip-service',
              title: 'Demander, puis se taire',
              caption: 'Le silence après la demande est une partie de la demande.',
            },
            {
              id: 's3',
              kind: 'reading',
              mediaId: 'txt-scr-service',
              title: 'Scénario du mini-film',
              caption: 'Découpage de « Demander un service ».',
            },
            {
              id: 's4',
              kind: 'quiz',
              title: 'La porte de sortie',
              question: 'Pourquoi ajouter « si ce n\'est pas le moment, dis-le-moi » ?',
              options: [
                'Parce que cela retire le coût du refus et augmente le taux de oui.',
                'Parce que cela montre qu\'on n\'est pas sûr de soi.',
                'Parce que c\'est une politesse purement formelle.',
              ],
              answer: 0,
              explain:
                'En laissant une sortie honorable, tu ne prends plus l\'autre en otage. Il peut refuser sans casser la relation — et c\'est précisément ce qui le rend libre de dire oui.',
            },
            {
              id: 's5',
              kind: 'practice',
              title: 'Ta demande en 15 secondes',
              brief: 'Formule une demande réelle en quatre temps, puis tiens trois secondes de silence sans rien ajouter.',
              seconds: 45,
              checklist: ['Quatre temps respectés', 'Durée annoncée', 'Porte de sortie incluse', 'Trois secondes de silence tenues'],
            },
          ],
        },
      ],
    },
  ],
}

/* ------------------------------ Index ------------------------------ */

export const UNIT_MAP = Object.fromEntries(COURSE.units.map((u) => [u.id, u]))
export const LESSON_MAP = Object.fromEntries(COURSE.units.flatMap((u) => u.lessons).map((l) => [l.id, l]))
export const STEP_MAP = Object.fromEntries(
  COURSE.units.flatMap((u) => u.lessons).flatMap((l) => l.steps.map((s) => [`${l.id}:${s.id}`, { ...s, lessonId: l.id }])),
)

export const STEP_KIND_META = {
  illustration: { label: 'Illustration', icon: 'PersonStanding', tone: 'sapphire' },
  clip: { label: 'Mini-vidéo', icon: 'Video', tone: 'blood' },
  audio: { label: 'Audio', icon: 'Headphones', tone: 'jade' },
  reading: { label: 'Lecture', icon: 'FileText', tone: 'gold' },
  quiz: { label: 'Question', icon: 'ListChecks', tone: 'gold' },
  practice: { label: 'Pratique', icon: 'Target', tone: 'jade' },
}
