# Module 12 — Hypnose éricksonienne

> Séances guidées, voix et ambiances sonores **écrites et générées sur l'appareil**.
> Aucune API, aucun réseau, aucun fichier tiers : tout le contenu est produit par
> le dépôt lui-même (`src/data/hypnosis/*.js` + `scripts/generate-hypnosis.mjs`).

---

## 1. Ce que fait le module

L'hypnose éricksonienne travaille par **pacing / leading** : on rejoint d'abord
l'expérience de la personne (son souffle, sa posture, ses sensations), puis on
l'accompagne doucement vers une ressource. Le module applique ce principe à
l'incarnation du « Futur Toi » : détente, concentration, prise de parole, sommeil,
estime de soi, projection.

Quatre onglets :

| Onglet | Contenu |
| --- | --- |
| **Séances** | Catalogue des 6 séances, recherche, filtre par niveau, séance conseillée, lecture du script intégral |
| **Hors-ligne** | Téléchargement / vérification des ambiances, repères sonores et scripts |
| **Ambiances** | Laboratoire : battements binauraux (6 presets), boucles d'ambiance, repères |
| **Progression** | Statistiques, série de jours, séance conseillée, journal des ressentis, lecture de la pratique |

Le **lecteur de séance** (`SessionPlayer.jsx`) déroule une chronologie de phases,
affiche le texte ligne par ligne, joue l'ambiance et le battement binaural, et
lit le texte à voix haute via la **synthèse vocale du système** (fr-FR). À la fin,
un bilan permet de noter son ressenti (enregistré dans le journal du module).

---

## 2. Les 6 séances

| # | Id | Titre | Niveau | Durée | Binaural |
| --- | --- | --- | --- | --- | --- |
| 1 | `hy-induction` | Le souffle qui descend | Découverte | 8 min | 200 + 7,83 Hz |
| 2 | `hy-escalier` | L'escalier intérieur | Découverte | 10 min | 140 + 5,5 Hz |
| 3 | `hy-focus` | Le bloc de verre | Intermédiaire | 8 min | 200 + 14 Hz |
| 4 | `hy-scene` | La salle te respecte | Intermédiaire | 10 min | 220 + 10 Hz |
| 5 | `hy-futur` | Le Futur Toi | Avancé | 12 min | 140 + 5,5 Hz |
| 6 | `hy-sommeil` | La nuit qui répare | Découverte | 12 min | 110 + 2,5 Hz |

Chaque séance est une suite de **phases typées** :

```
accueil → induction → approfondissement → suggestion → visualisation → ancrage → emergence → silence
```

Une phase porte `{ id, kind, title, seconds, chime, lines[] }`. `lines[]` est le
texte dit **et** affiché : une seule source de vérité. Si la synthèse vocale est
indisponible, la séance reste pleinement utilisable en **lecture silencieuse**.

Le rythme est piloté par le lecteur : le texte d'une phase est lu à voix haute ;
la phase suivante ne démarre qu'une fois la parole terminée (ou le temps écoulé,
si la voix est coupée). Un **repère sonore** (gong au début, cloche entre les
phases, bol à l'ancrage, gong à la fin) marque chaque transition.

---

## 3. Modèle de données

Tout l'état vit dans `state.hypnosis` (voir `src/data/defaults.js → defaultHypnosis()`) :

```js
{
  version: 1,
  prefs: {              // préférences de lecture
    voice: true,        // synthèse vocale
    voiceRate: 0.9,
    voicePitch: 0.95,
    volume: 0.7,        // volume maître (0 → 1)
    ambience: true,     // fond sonore
    binaural: true,     // battement binaural
    chime: true,        // repères de transition
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

`scripts/generate-hypnosis.mjs` produit **17 fichiers** (~3,1 Mo) dans
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

> **Régénérer** (après modification des scripts ou des ambiances) :
> ```bash
> node scripts/generate-hypnosis.mjs
> ```

Le manifeste `src/data/hypnosis/media.js` reflète les octets réels produits.

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
- **Voix** : `speechSynthesis` en `fr-FR`, avec sélection d'une voix française de
  qualité si disponible. `onEnd` est toujours appelé (même en erreur) pour que le
  lecteur puisse enchaîner.
- **Volume maître** : `setMasterVolume` avec rampe linéaire (fade) pour éviter les
  clics. `primeAudio()` doit être appelé sur un geste utilisateur (les WebView
  suspendent l'audio avant interaction).

---

## 6. Stratégie hors-ligne

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
progression et messages d'erreur explicites. **Jamais de silence** : chaque action
donne un retour visible.

---

## 7. Intégration IA (analyse locale + Studio IA)

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

## 8. Sécurité & usage responsable

> Séance à faire **assis ou allongé, jamais en conduisant**. Les battements
> binauraux nécessitent un **casque** et ne remplacent aucun soin médical.

- À éviter en cas d'épilepsie, de grossesse, ou en conduisant.
- Le module est un **outil de détente et de concentration**, pas un dispositif
  médical. En cas de doute, consulter un professionnel de santé.
- Ces consignes sont affichées dans les onglets *Séances* et *Ambiances*
  (constante `HYPNOSIS_SAFETY`).

---

## 9. Fichiers du module

```
src/data/hypnosis/
  sessions.js    6 séances complètes (phases, textes, ambiances, binaural)
  media.js       manifeste des médias (ambiances, repères, scripts)
  presets.js     6 presets binauraux + consigne de sécurité
  index.js       point d'entrée

src/lib/
  hypnosisAudio.js   moteur Web Audio + synthèse vocale
  aiAnalysis.js      analyse transversale locale (partagée)
  aiTasks.js         registre des tâches du Studio IA (partagée)

src/modules/hypnosis/
  HypnosisStudio.jsx     racine + onglets + catalogue + modal script
  SessionPlayer.jsx      lecteur de séance (chronologie, orbe, bilan)
  AmbienceLab.jsx        laboratoire binaural / ambiances / repères
  HypnosisOffline.jsx    gestionnaire hors-ligne du module
  HypnosisProgress.jsx   statistiques, journal, lecture de la pratique

scripts/generate-hypnosis.mjs   générateur local (WAV + textes + manifeste)
public/media/hypnosis/          ressources générées
```
