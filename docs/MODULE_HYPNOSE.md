# Module 12 — Hypnose éricksonienne

> Séances guidées, voix et ambiances sonores **écrites et générées sur l'appareil**.
> Aucune API, aucun réseau, aucun fichier tiers : tout le contenu est produit par
> le dépôt lui-même (`src/data/hypnosis/*.js`, `scripts/generate-hypnosis.mjs`
> et `scripts/generate-hypnosis-voice.mjs`).

---

## 1. Ce que fait le module

L'hypnose éricksonienne travaille par **pacing / leading** : on rejoint d'abord
l'expérience de la personne (son souffle, sa posture, ses sensations), puis on
l'accompagne doucement vers une ressource. Le module applique ce principe à
l'incarnation du « Futur Toi » : détente, concentration, prise de parole, sommeil,
estime de soi, projection.

Cinq onglets :

| Onglet | Contenu |
| --- | --- |
| **Séances** | Catalogue des 6 séances, recherche, filtre par niveau, séance conseillée, lecture du script intégral |
| **Voix** | Voix neuronales embarquées (pré-écoute, choix), moteur de voix, longueur des silences |
| **Hors-ligne** | Téléchargement / vérification des ambiances, repères sonores, scripts et voix |
| **Ambiances** | Laboratoire : battements binauraux (6 presets), boucles d'ambiance, repères |
| **Progression** | Statistiques, série de jours, séance conseillée, journal des ressentis, lecture de la pratique |

Le **lecteur de séance** (`SessionPlayer.jsx`) déroule une chronologie de phases,
affiche le texte ligne par ligne, joue l'ambiance et le battement binaural, et
lit le texte à voix haute avec la **voix neuronale embarquée** : chaque phrase est
un petit MP3 livré dans l'application, enchaîné par le lecteur avec un silence
dosé — c'est ce qui donne le rythme lent et la mise en évidence exacte de la
phrase lue. Si cette voix est indisponible, le lecteur retombe sur la **synthèse
vocale du système** (fr-FR), puis sur la **lecture silencieuse**. À la fin, un
bilan permet de noter son ressenti (enregistré dans le journal du module).

---

## 2. Les 7 séances

| # | Id | Titre | Niveau | Durée | Binaural |
| --- | --- | --- | --- | --- | --- |
| 1 | `hy-induction` | Le souffle qui descend | Découverte | 8 min | 200 + 7,83 Hz |
| 2 | `hy-escalier` | L'escalier intérieur | Découverte | 10 min | 140 + 5,5 Hz |
| 3 | `hy-focus` | Le bloc de verre | Intermédiaire | 8 min | 200 + 14 Hz |
| 4 | `hy-scene` | La salle te respecte | Intermédiaire | 10 min | 220 + 10 Hz |
| 5 | `hy-futur` | Le Futur Toi | Avancé | 12 min | 140 + 5,5 Hz |
| 6 | `hy-sommeil` | La nuit qui répare | Découverte | 12 min | 110 + 2,5 Hz |
| 7 | `hy-travail` | L'atelier du Futur Toi | Avancé | 15 min | 130 + 4,5 Hz |

`hy-travail` est la séance **PNL d'endormissement** : reprogrammation de
l'inconscient pendant le sommeil (amour du travail et du code, constance,
confiance en soi, sens des affaires, négociation, goût de la lecture et de la
récitation). Elle est marquée `sleep: true`, se termine **sans émergence** et
utilise une voix **« berceuse »** (voir § 6).

Chaque séance est une suite de **phases typées** :

```
accueil → induction → approfondissement → suggestion → visualisation → ancrage → emergence → silence
```

Une phase porte `{ id, kind, title, seconds, chime, lines[] }`. `lines[]` est le
texte dit **et** affiché : une seule source de vérité. Si aucune voix n'est
disponible, la séance reste pleinement utilisable en **lecture silencieuse**.

Le rythme est piloté par le lecteur : chaque phrase de la phase est lue à voix
haute ; la phase suivante ne démarre qu'une fois la dernière phrase terminée (ou
le temps écoulé, si la voix est coupée). Un **repère sonore** (gong au début,
cloche entre les phases, bol à l'ancrage, gong à la fin) marque chaque transition.

---

## 3. Modèle de données

Tout l'état vit dans `state.hypnosis` (voir `src/data/defaults.js → defaultHypnosis()`) :

```js
{
  version: 1,
  prefs: {              // préférences de lecture
    voiceEngine: 'neural', // 'neural' (embarquée) | 'device' (téléphone) | 'off'
    voiceId: 'denise',  // voix neuronale choisie (denise | henri)
    voicePause: 1,      // longueur des silences entre phrases (×)
    voice: true,        // voix activée
    voiceRate: 0.9,     // débit de la voix du téléphone
    voicePitch: 0.95,   // tonalité de la voix du téléphone
    volume: 0.7,        // volume maître (0 → 1)
    ambience: true,     // fond sonore
    binaural: true,     // battement binaural
    chime: true,        // repères de transition
    sleepTimer: 0,      // minuteur de sommeil en minutes (0 = fin de séance)
  },
  progress: {           // { [sessionId]: { sessions, minutes, lastAt } }
    'hy-induction': { sessions: 3, minutes: 24, lastAt: '…' },
  },
  log: {                // { 'YYYY-MM-DD': { sessions, minutes } }
    '2026-11-17': { sessions: 2, minutes: 16 },
  },
  downloads: {          // { [mediaId]: { bytes, mode, downloadedAt, version } }
    'hy-amb-nappe-basse': { bytes: 535858, mode: 'bundled' },
  },
  journal: [            // ressentis après séance
    { id: 'hyj_…', sessionId: 'hy-induction', mood: 'calme', note: '…', createdAt: '…' },
  ],
}
```

Actions exposées par `AppContext` (mêmes garanties que le module non-verbal : elles
recréent `hypnosis` si absent, ce qui rend les sauvegardes anciennes compatibles) :

| Action | Effet |
| --- | --- |
| `hySetPrefs(patch)` | Met à jour les préférences de lecture |
| `hyCompleteSession(id, { minutes })` | Incrémente la progression + le journal quotidien |
| `hyAddJournalEntry({ sessionId, mood, note })` | Ajoute un ressenti |
| `hyMarkDownload(id, info)` / `hyUnmarkDownload(id)` | Suit l'état hors-ligne |
| `hyResetProgress()` | Efface progression, log et journal (médias conservés) |

L'**export / import** de sauvegarde couvre `hypnosis` automatiquement
(`mergeImported` fait une fusion imbriquée de `prefs`, `progress`, `downloads`,
`log` et `journal`).

---

## 4. Contenu sonore : 100 % généré localement

Deux scripts produisent tout le contenu du module, **sans aucun échantillon
externe**.

`scripts/generate-hypnosis.mjs` → **17 fichiers** (~3,1 Mo) dans
`public/media/hypnosis/` :

| Famille | Fichiers | Format | Détail |
| --- | --- | --- | --- |
| **Ambiances** | 5 | WAV PCM 16 bits mono 11 025 Hz, 24 s | Nappe basse, pluie douce, vagues, forêt de nuit, feu de cheminée |
| **Repères** | 5 | WAV PCM 16 bits mono 11 025 Hz | Cloche claire, gong doux, bol tibétain, souffle entrée, souffle sortie |
| **Scripts** | 6 | texte UTF-8 | Texte intégral de chaque séance, phase par phase |
| **Manifeste** | 1 | JSON | `manifest.json` : ids, octets, durées, chemins |

Tout est synthétisé par le script (aucun échantillon externe) : bruit filtré,
oscillateurs, enveloppes, réverbération courte. Le WAV mono basse fréquence est
volontaire : propre, léger, et décodable partout.

`scripts/generate-hypnosis-voice.mjs` → **228 MP3** (~10,7 Mo) dans
`public/media/hypnosis/voix/` (voir § 6) : **une phrase = un fichier**, pour
chaque voix. Les MP3 sont produits **une fois pour toutes à la compilation** ;
au runtime, l'application ne fait que les lire — donc aucune synthèse, aucun
réseau.

> **Régénérer** (après modification des scripts, des ambiances ou des voix) :
> ```bash
> node scripts/generate-hypnosis.mjs
> node scripts/generate-hypnosis-voice.mjs
> ```

Le manifeste `src/data/hypnosis/media.js` reflète les octets réels produits ;
`src/data/hypnosis/voiceTracks.js` (fichier **généré**) décrit chaque phrase.

---

## 5. Moteur audio (`src/lib/hypnosisAudio.js`)

Tout passe par **Web Audio**, sans fichier temporaire ni réseau :

- **Ambiance** : le WAV embarqué est décodé en mémoire (`decodeAudioData`) puis
  lu **en boucle** via un `AudioBufferSourceNode` → gain → master.
- **Battement binaural** : deux `OscillatorNode` (une fréquence par oreille,
  écartées de quelques hertz) pannées à gauche / droite via `StereoPannerNode`.
  L'effet n'existe **qu'au casque**.
- **Repères** : lecture du WAV ; en cas d'échec de chargement, repli sur une
  **cloche synthétisée** (`synthChime`) — jamais de silence inattendu.
- **Voix embarquée** : `playVoiceLine(url)` charge le MP3 (`fetch` +
  `decodeAudioData`, résultat mis en cache) et le lit via un
  `AudioBufferSourceNode` → gain → master. La promesse résout `ended` /
  `stopped` / `error` / `unsupported`, ce qui permet au lecteur d'enchaîner
  proprement. `stopVoice()` interrompt la phrase en cours (pause, saut de phase,
  sortie).
- **Voix du téléphone (repli)** : `speechSynthesis` en `fr-FR`, avec sélection
  d'une voix française de qualité si disponible. `onEnd` est toujours appelé
  (même en erreur) pour que le lecteur puisse enchaîner.
- **Volume maître** : `setMasterVolume` avec rampe linéaire (fade) pour éviter les
  clics. `primeAudio()` doit être appelé sur un geste utilisateur (les WebView
  suspendent l'audio avant interaction).

---

## 6. Voix neuronales embarquées

La voix des séances est **livrée avec l'application** : elle ne dépend plus du
téléphone et reste **identique partout**.

- **Deux voix** (`NEURAL_VOICES`, généré) :

  | Id | Voix | Genre | Réglage |
  | --- | --- | --- | --- |
  | `denise` (défaut) | `fr-FR-DeniseNeural` | Femme | débit −10 %, ton −2 Hz |
  | `henri` | `fr-FR-HenriNeural` | Homme | débit −12 %, ton −4 Hz |

- **Prosodie « berceuse » par séance** (`SLEEP_PROSODY` dans le générateur) : les
  séances d'endormissement sont enregistrées **exprès** plus lentes et plus
  graves. `hy-travail` est ainsi générée à **débit −22 %, ton −8 Hz** : une voix
  très douce, au bord du sommeil. Les autres séances gardent la prosodie de base,
  et leurs MP3 ne sont donc pas régénérés.

- **Granularité : une phrase = un MP3.** Le lecteur met les phrases bout à bout
  et insère lui-même les silences : le tempo est **maîtrisé par l'application**
  (pas par la synthèse) et la phrase en cours se surligne **exactement**.
- **Silences** : `PAUSE_BASE` (1,4 s) modulé par le type de phase
  (`PAUSE_BY_KIND`) — plus longs pendant l'induction et la visualisation — et par
  la préférence `voicePause` (Courtes / Moyennes / Longues). Un `LEAD_IN` de
  1,1 s précède la première phrase de chaque phase.
- **Moteur de voix** (`prefs.voiceEngine`) : `neural` (défaut) → `device`
  (synthèse du téléphone) → `off` (silencieux). Le repli est **automatique** :
  si la voix embarquée manque pour une séance ou si Web Audio est absent, le
  lecteur passe au moteur suivant, et la séance reste toujours utilisable.
- **Onglet *Voix*** (`VoiceLab.jsx`) : pré-écoute d'un extrait par voix
  (`sample.mp3`), choix de la voix et du moteur, réglage du débit / de la
  tonalité de la voix du téléphone, et longueur des silences.
- **Préchargement** : le lecteur précharge en tâche de fond les phrases de la
  phase courante **et** de la phase suivante → enchaînements sans blanc.

> **Génération** : `node scripts/generate-hypnosis-voice.mjs` (option `--force`
> pour tout régénérer). Le script s'appuie sur `msedge-tts` — dépendance **de
> développement uniquement** : la voix neuronale « Read Aloud » de Microsoft Edge
> est sollicitée **au moment du build**, puis les MP3 sont embarqués. Au runtime,
> l'application n'a **aucune** dépendance réseau.
> Sortie : `public/media/hypnosis/voix/<voix>/<séance>/<phase>-NN.mp3`
> (+ `sample.mp3` par voix) et le manifeste `src/data/hypnosis/voiceTracks.js`.

---

## 7. Stratégie hors-ligne

Le module réutilise le gestionnaire transversal `src/lib/offlineMedia.js`
(`downloadBatch`, `bundleStatus`, `isStored`, `removeMedia`, `hasRoomFor`,
`storageMode`…).

- **Sur l'APK (Capacitor)** : les fichiers de `public/media/hypnosis/` sont **déjà
  embarqués** dans les assets et servis par le WebView via `https://localhost/…`.
  Ils sont marqués `mode: 'bundled'` : aucun téléchargement réel n'est nécessaire,
  l'onglet *Hors-ligne* ne fait que confirmer leur disponibilité.
- **Sur le web** : les fichiers sont servis par le service worker
  (`public/sw.js`, cache-first sur `/media/`) ; l'onglet *Hors-ligne* les place
  dans **Cache Storage** (`method-media-v1`) pour un accès durable sans réseau.

Chaque famille (ambiances / repères / scripts) a son état (`ready`, `partial`,
`missing`), son poids, un bouton de lot et un bouton de retrait, avec barre de
progression et messages d'erreur explicites. Les **voix** (226 phrases) sont
regroupées **par voix**, sous forme de résumé compact, pour ne pas afficher des
centaines de lignes. **Jamais de silence** : chaque action donne un retour visible.

---

## 8. Minuteur de sommeil & fichiers prêts à écouter

Deux outils pensés pour l'**écoute au lit**, disponibles pour toutes les séances.

**Minuteur de sommeil** (`prefs.sleepTimer`, réglé dans le lecteur) : `Fin de
séance` (défaut), 15, 30, 45, 60 ou 90 minutes. Pendant la lecture, un décompte
est affiché ; quand le temps choisi est écoulé, la séance **s'arrête toute seule**,
en douceur (`stopAll` avec fondu de 5 s), et un message le confirme. On peut ainsi
s'endormir sans avoir à toucher au téléphone. Le décompte suit la lecture : il se
met en pause avec elle et reprend avec elle.

**Fichiers prêts à écouter** (`scripts/generate-hypnosis-export.mjs`) : chaque
séance d'endormissement existe aussi en **un seul fichier**, pour l'écouter en
boucle dans n'importe quel lecteur du téléphone :

| Format | Contenu | Chemin |
| --- | --- | --- |
| MP3 | la séance entière (voix + silences) | `public/media/hypnosis/export/<séance>-<voix>.mp3` |
| MP4 | la même piste + une image calme et fixe | `public/media/hypnosis/export/<séance>-<voix>.mp4` |

Les silences insérés reproduisent **exactement** ceux du lecteur (`PAUSE_BASE` ×
`PAUSE_BY_KIND`), puis tout est mis bout à bout avec **ffmpeg** — outil nécessaire
**uniquement au moment de la génération** (l'app, elle, reste 100 % hors-ligne).
Le manifeste `src/data/hypnosis/exports.js` est régénéré à chaque exécution.

Dans l'app, ces fichiers apparaissent dans l'onglet **Hors-ligne** (« Écoute
nocturne ») et directement dans le lecteur de séance, avec un bouton
**Télécharger** :

- **Web** : téléchargement classique du navigateur (`<a download>`).
- **APK** : les octets sont lus par `fetch` (le WebView répond sur
  `https://localhost`), écrits dans `Documents/METHOD/` via `@capacitor/filesystem`,
  puis proposés au partage (`@capacitor/share`). On peut donc les sortir de l'app
  (musique, cloud, ordinateur…). Voir `saveMediaToDevice` dans `offlineMedia.js`.

---

## 9. Intégration IA (analyse locale + Studio IA)

Le module s'appuie sur deux briques transversales, **100 % locales** :

- `src/lib/aiAnalysis.js` : `buildMetrics`, `detectTrends`, `buildInsights`,
  `buildDigest`, `hypnosisSuggestion`, `hypnosisDigest`.
- `src/lib/aiTasks.js` : registre des tâches du **Studio IA** (module « Agent IA »),
  dont une tâche **Hypnose** qui rédige un script éricksonien personnalisé.

**Séance conseillée** (`hypnosisSuggestion`) : choisit la séance la plus utile
selon l'heure (séance d'endormissement le soir), l'historique de pratique, l'état
des piliers (focus, éloquence) et le taux d'incarnation. La raison est affichée à
l'utilisateur — jamais une recommandation opaque.

Si une clé API est configurée dans *Réglages → IA*, les tâches du Studio IA
peuvent être affinées par un LLM ; en cas d'échec réseau, le **moteur local prend
le relais** automatiquement.

---

## 10. Sécurité & usage responsable

> Séance à faire **assis ou allongé, jamais en conduisant**. Les battements
> binauraux nécessitent un **casque** et ne remplacent aucun soin médical.

- À éviter en cas d'épilepsie, de grossesse, ou en conduisant.
- Le module est un **outil de détente et de concentration**, pas un dispositif
  médical. En cas de doute, consulter un professionnel de santé.
- Ces consignes sont affichées dans les onglets *Séances* et *Ambiances*
  (constante `HYPNOSIS_SAFETY`).

---

## 11. Fichiers du module

```
src/data/hypnosis/
  sessions.js    7 séances complètes (phases, textes, ambiances, binaural)
  media.js       manifeste des médias (ambiances, repères, scripts, voix, exports)
  voiceTracks.js manifeste GÉNÉRÉ des voix (phrases, durées, octets)
  exports.js     manifeste GÉNÉRÉ des fichiers prêts à écouter (MP3 / MP4)
  presets.js     6 presets binauraux + consigne de sécurité
  index.js       point d'entrée

src/lib/
  hypnosisAudio.js   moteur Web Audio + voix embarquée + synthèse de repli
  offlineMedia.js    gestionnaire hors-ligne (partagé) + export vers l'appareil
  aiAnalysis.js      analyse transversale locale (partagée)
  aiTasks.js         registre des tâches du Studio IA (partagée)

src/modules/hypnosis/
  HypnosisStudio.jsx     racine + onglets + catalogue + modal script
  SessionPlayer.jsx      lecteur de séance (voix embarquée, minuteur, exports, bilan)
  VoiceLab.jsx           onglet Voix (voix embarquées, moteur, rythme)
  AmbienceLab.jsx        laboratoire binaural / ambiances / repères
  HypnosisOffline.jsx    gestionnaire hors-ligne du module + écoute nocturne
  HypnosisProgress.jsx   statistiques, journal, lecture de la pratique

scripts/generate-hypnosis.mjs        générateur local (WAV + textes + manifeste)
scripts/generate-hypnosis-voice.mjs  générateur local des voix (MP3, msedge-tts)
scripts/generate-hypnosis-export.mjs générateur local MP3/MP4 (ffmpeg, au build)
public/media/hypnosis/               ressources générées (dont voix/ et export/)
```
