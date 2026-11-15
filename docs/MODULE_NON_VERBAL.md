# Module 11 — Académie du non-verbal

> **Objectif.** Ajouter à METHOD un 11ᵉ module qui entraîne la **communication
> non verbale** : entrer dans une pièce, s'arrêter calmement, s'asseoir, saluer,
> se présenter, demander un service, lire à voix haute, sortir. Format
> **micro-learning** (codes Duolingo / Busuu) : leçons de 3 à 6 minutes, une
> étape à la fois, illustrations vectorielles, mini-vidéos animées, audio et
> textes **téléchargeables pour un usage 100 % hors-ligne**.
>
> **Contrainte structurante.** Aucune API, aucun réseau, aucune clé : *toute*
> la génération de contenu (images, vidéos, audio, textes) est locale.

---

## 1. Modèle pédagogique

| Principe | Mise en œuvre |
| --- | --- |
| Micro-leçons | Une leçon = 3 à 6 étapes de ~30–60 s, 4 à 6 min au total |
| Une chose à la fois | Une étape est **atomique** et d'un seul type |
| Pas de punition | **Aucune notion de « vies »** : on mesure la régularité, pas l'échec |
| Progression visible | Barre type Duolingo + XP + niveau + série de jours |
| Ancrage | **Répétition espacée** des questions : boîtes 1 → 3 → 7 → 21 → 60 jours |
| Déblocage | Une unité se déverrouille à 60 % de la précédente ; une leçon s'ouvre quand la précédente est finie |
| Actif | Étapes `practice` chronométrées avec critères de réussite cochables |

**Parcours livré** : 3 unités · 9 leçons · 44 étapes.

| Unité | Leçons |
| --- | --- |
| **U1 — Le corps avant les mots** | L'axe vertical · Entrer dans une pièce et s'arrêter · Balayer la pièce |
| **U2 — S'asseoir, saluer, sortir** | Posture assise · Saluer et serrer la main · Sortir d'une pièce |
| **U3 — Prendre la parole** | Se présenter en 20 s · Élocution (lecture à voix haute) · Demander un service |

**Six types d'étape** (`STEP_KIND_META`) :

| `kind` | Contenu | Ressource | Hors-ligne |
| --- | --- | --- | --- |
| `illustration` | Planche de posture + points clés | `poseId` (SVG calculé) | Embarqué (0 o) |
| `clip` | Mini-vidéo vectorielle animée | `clipId` (SVG animé) | Embarqué (0 o) |
| `audio` | Métronome / souffle / appuis | `mediaId` → WAV | Téléchargeable |
| `reading` | Scénario / fiche / exercice | `mediaId` → `.txt` | Embarqué **et** téléchargeable |
| `quiz` | Question à choix unique | — | Embarqué |
| `practice` | Minuteur + checklist + drill | `drillId` (optionnel) | Embarqué |

> Les étapes `reading` sont lisibles **immédiatement** : le texte est dans le
> bundle (`inlineTextFor()`), le `.txt` téléchargé n'est qu'une copie figée
> partageable / archivable.

---

## 2. Modèle de données

### 2.1 Contenu (immuable, dans le bundle)

```
src/data/nonverbal/
  curriculum.js   COURSE → unités → leçons → étapes        (source de vérité)
  media.js        MEDIA (16 ressources) + CLIPS (7) + KIND_META
  scripts.js      SCRIPTS (7 storyboards) · FICHES · DRILLS  → texte des .txt
  index.js        ré-export
```

`COURSE` est un arbre pur, sans JSX ni logique :

```js
COURSE = {
  id, title, subtitle, minutes, level, icon,
  units: [{
    id, title, subtitle, color,
    lessons: [{
      id, title, goal, minutes, tags,
      steps: [
        { id, kind:'illustration', poseId, showAxis, title, caption, points[] },
        { id, kind:'clip',         clipId,      title, caption },
        { id, kind:'audio',        mediaId,     title, caption, tip },
        { id, kind:'reading',      mediaId,     title, caption },
        { id, kind:'quiz',         question, options[], answer, explain },
        { id, kind:'practice',     brief, seconds, drillId, checklist[] },
      ],
    }],
  }],
}
```

Index dérivés, calculés une seule fois : `UNIT_MAP`, `LESSON_MAP`,
`STEP_MAP` (clé `"<lessonId>:<stepId>"`).

**Médias** (`MEDIA`) — les seuls fichiers téléchargeables :

```js
{ id, kind:'audio'|'text'|'video', title, subtitle, src, bytes, duration, version, description }
```

`bytes` est une **estimation** affichée avant téléchargement ; la taille réelle
est mesurée puis stockée dans l'état (`downloads[id].bytes`). `version` permet
de détecter un contenu « outdated » (état `outdated`).

### 2.2 État utilisateur (mutable, persisté)

Tout vit sous **une seule clé** de l'état global, `state.nonverbal`
(`defaultNonverbal()` dans `src/data/defaults.js`) :

```js
nonverbal = {
  version: 1,
  xp: 0,
  dailyGoal: 3,
  progress:  { [lessonId]: { done, stepsDone:[stepId], attempts, completedAt } },
  reviews:   { 'lessonId:stepId': { box, due, lastAt } },   // répétition espacée
  downloads: { [mediaId]: { bytes, mode:'cache'|'filesystem', path?, downloadedAt, version } },
  log:       { 'YYYY-MM-DD': { lessons, minutes, xp } },     // régularité
}
```

**Pourquoi un seul objet ?** L'export / import de sauvegarde
(`buildExportPayload` / `mergeImported` dans `src/lib/storage.js`) sérialise
l'état entier. En regroupant tout le module sous `nonverbal`, la sauvegarde et
la restauration du parcours non verbal sont **gratuites** — aucune sérialisation
ad hoc. `mergeImported` fusionne en plus les sous-objets `progress`, `reviews`,
`downloads` et `log` pour ne rien écraser lors d'un import partiel.

### 2.3 Logique pure (`src/lib/curriculum.js`)

Aucune dépendance à React : tout est testable isolément.

| Domaine | Fonctions |
| --- | --- |
| Parcours | `allLessons`, `allSteps`, `lessonMediaIds`, `courseMediaIds`, `unitMediaIds` |
| Progression | `stepIsDone`, `lessonIsDone`, `lessonPct`, `unitProgress`, `courseProgress` |
| Déblocage | `isUnitUnlocked`, `isLessonUnlocked`, `nextLesson` |
| Gamification | `XP_PER_STEP` (6), `XP_LESSON_BONUS` (20), `xpForLesson`, `levelFromXp`, `learningStreak`, `bumpDailyLog` |
| Mémoire | `scheduleReview`, `dueReviews` |
| Recherche | `searchLessons` |

---

## 3. Illustrations & mini-vidéos : moteur SVG paramétrique

**Décision clé.** Les visuels ne sont **ni des images ni des vidéos**, mais du
**SVG calculé à la volée** par un moteur pur (`src/lib/figure.js`).

```
POSES (12 postures)  →  skeleton(pose)  →  figureSvg(pose, opts)   →  planche fixe
                                        ↘  clipSvg({ frames })     →  mini-vidéo animée
                                        ↘  standaloneSvg(poseId)   →  fichier .svg autonome
```

- **12 postures** : `stand-neutral`, `enter-stop`, `enter-scan`, `seat-upright`,
  `handshake`, `present-open`, `listen-active`, `speak-gesture`, `ask-service`,
  `exit-turn`, `breath-low`, `walk-slow`.
- **7 clips** (`CLIPS`) : séquences de 2–3 postures (`clip-enter`, `clip-walk`,
  `clip-seat`, `clip-handshake`, `clip-exit`, `clip-elocution`, `clip-service`).
- Thèmes `dark` / `light` (`theme()`), accessoires (`PROPS`), axe d'alignement
  optionnel (`showAxis`), silhouettes articulées + ombre au sol.

**Pourquoi c'est le bon choix ici :**

| Bénéfice | Détail |
| --- | --- |
| 0 octet, 0 réseau | Le dessin est **calculé par l'appareil** → hors-ligne par construction |
| Cohérence garantie | Une seule fonction produit tous les visuels : même style, mêmes proportions, mêmes couleurs |
| Une source de vérité | Le script d'export importe **le même module** que l'application |
| Adaptatif | Vectoriel → net à toute résolution, thème clair/sombre, recolorable |
| Léger à maintenir | Ajouter une posture = ajouter une entrée dans `POSES` |

### Rendu dans React (`src/components/nonverbal/Visuals.jsx`)

- `Figure` → `useMemo(figureSvg)` + `dangerouslySetInnerHTML` (la chaîne SVG
  provient d'une **fonction pure locale**, jamais d'une entrée utilisateur).
- `Illustration` → `Figure` + bandeau légende/intention.
- `ClipView` → `clipSvg` + lecture/pause + rejouer ; **démarre en pause** si le
  système demande `prefers-reduced-motion`.
- `Storyboard` → bande des plans (vignettes `Figure`).
- `Stage` → cadre commun (ratio, lueur radiale, thème).

### Animation des mini-vidéos

Les keyframes CSS vivent **dans le `<style>` interne du SVG**. La pause/reprise
ne reconstruit pas le document : on bascule l'attribut `data-paused` sur la
scène, et une règle CSS fige les animations (`src/index.css`) :

```css
.clip-stage[data-paused='true'] * { animation-play-state: paused !important; }
```

Rejouer = `key={runKey}` (remontage du sous-arbre SVG), donc redémarrage propre
sans toucher aux animations elles-mêmes.

---

## 4. Stratégie hors-ligne

### 4.1 Deux familles de médias

| Famille | Poids | Emplacement | Téléchargement |
| --- | --- | --- | --- |
| **Inline** (illustrations, clips, quiz, textes lisibles) | 0 o | Bundle JS | Aucun — déjà là |
| **Téléchargeable** (audio WAV, `.txt`, `.mp4` éventuel) | ~1,45 Mo | Cache / système de fichiers | À la demande |

Concrètement : **16 ressources téléchargeables** (4 audio ≈ 1,4 Mo, 12 textes
≈ 12 Ko). Tout le reste est embarqué.

### 4.2 Deux adaptateurs, choisis automatiquement (`src/lib/offlineMedia.js`)

`storageMode()` renvoie :

- **`filesystem`** (APK Capacitor, `isNative()`) → `@capacitor/filesystem`,
  `Directory.Data`, chemin `method-media/<mediaId>-<fichier>`. Le téléchargement
  est fait par le **code natif** (`Filesystem.downloadFile`, événement
  `progress`) : il ne bloque pas le thread JS et survit mieux à l'arrière-plan.
  Lecture via `Capacitor.convertFileSrc()`. Les fichiers résistent à l'éviction
  du cache navigateur et supportent de grosses vidéos.
- **`cache`** (web / WebView) → **Cache Storage** `method-media-v1` via
  `cacheMedia()` (`src/lib/storage.js`). Lecture via `URL.createObjectURL`
  (mis en cache en mémoire, `releaseObjectUrl()` pour libérer).

`resolveMediaSrc(media, stored)` renvoie toujours une URL **immédiatement
lisible** : fichier local si présent, sinon la source réseau (streaming).

### 4.3 Vérification d'espace

Avant un lot, `hasRoomFor(bytes)` interroge `navigator.storage.estimate()` et
refuse si le lot dépasserait **92 %** de l'espace utilisable
(`QUOTA_HEADROOM`). Le motif du refus est renvoyé pour être affiché tel quel à
l'utilisateur.

### 4.4 File d'attente persistante & reprise

- Clé `localStorage` **`method.nonverbal.queue`** (`QUEUE_KEY`) :
  `{ pending: [mediaId], doneAt }`.
- `downloadBatch(list, cbs, { skipStored, shouldStop })` télécharge
  **séquentiellement** (le réseau mobile ne supporte pas 8 requêtes parallèles),
  saute ce qui est déjà stocké, signale chaque étape
  (`onItem`, `onDone`, `onError`, `onBatch`) et **s'arrête proprement** si
  `shouldStop()` renvoie vrai (bouton « Arrêter », via une `ref` pour éviter les
  fermetures obsolètes).
- Un lot interrompu (app fermée, réseau coupé) **reprend** là où il s'est arrêté.

### 4.5 État de synchronisation

`bundleStatus(mediaIds, downloads, mediaFor)` calcule, pour une leçon, une
unité ou tout le cours :

```
state: 'ready' | 'partial' | 'missing' | 'outdated'
stored, total, bytes, storedBytes, pct
```

`outdated` est déclenché quand `MEDIA[id].version` ≠ la version enregistrée
lors du téléchargement. `STATUS_META` fournit libellé/couleur/icône par état.

### 4.6 Service worker

`public/sw.js` sert déjà `/media/` **cache-first** (et les destinations
`audio`/`image`/`video`). Comme les ressources vivent sous
`public/media/nonverbal/*`, elles sont couvertes **sans aucune modification**
du service worker.

---

## 5. Interface (`src/modules/nonverbal/`)

| Fichier | Rôle |
| --- | --- |
| `NonverbalAcademy.jsx` | Racine : 3 onglets (Parcours / Hors-ligne / Progrès), chemin de leçons, atelier de postures, recherche |
| `LessonPlayer.jsx` | Lecteur : barre de progression, une étape à la fois, écran de bilan + XP |
| `OfflineManager.jsx` | Inventaire des médias, téléchargement par lot / unité / tout, quota, file d'attente |
| `ProgressPanel.jsx` | Niveau, série, régularité 7 jours, progression par unité, révisions, réinitialisation |

Composants partagés : `src/components/nonverbal/Visuals.jsx` (rendu des
visuels) et `src/components/nonverbal/Steps.jsx` (les 6 rendus d'étape +
`MediaRow`).

**Actions du contexte** (`src/context/AppContext.jsx`, via un helper interne
`nvPatch` qui garantit l'existence de `state.nonverbal`) :

| Action | Effet |
| --- | --- |
| `nvCompleteStep(lessonId, stepId)` | Marque l'étape, +`XP_PER_STEP` **une seule fois** |
| `nvCompleteLesson(lessonId, { xp, minutes })` | Clôt la leçon, bonus XP, journal du jour |
| `nvRecordReview(itemId, correct)` | Replanifie la question (boîte suivante ou retour) |
| `nvMarkDownload(id, info)` / `nvUnmarkDownload(id)` | État de synchronisation d'un média |
| `nvSetDailyGoal(n)` | Objectif quotidien |
| `nvResetProgress()` | Efface XP / progression / révisions (les fichiers restent) |

Le module est enregistré comme **11ᵉ entrée** de `src/modules/registry.js`
(groupe `incarnation`, icône `PersonStanding`) ; il n'est **pas** `primary`,
donc la barre de navigation basse reste à 5 items.

---

## 6. Génération de contenu 100 % locale

Un seul script produit **tous** les médias : `scripts/generate-nonverbal.mjs`.

```bash
node scripts/generate-nonverbal.mjs
```

| Sortie | Procédé |
| --- | --- |
| `audio/*.wav` (4) | **Synthèse** : encodeur WAV PCM 8 bits mono 8 kHz écrit à la main. `buildMetronome(60/110 BPM)`, `buildBreath345()` (3-4-5), `buildAppui()` (4 motifs rythmiques) |
| `texts/*.txt` (12) | `scriptToText` / `ficheToText` / `drillToText` (mêmes données que l'app) |
| `poses/*.svg` (12) | `standaloneSvg(poseId)` — **le même `figure.js`** que l'exécution |
| `clips/*.svg` (7) | `clipSvg({ frames })` |
| `manifest.json` | Inventaire + tailles réelles + comparaison aux `bytes` déclarés |

Le script **importe les modules de l'application** (`src/lib/figure.js`,
`src/data/nonverbal/*.js`) : pas de duplication, pas de dérive possible entre
ce qui est affiché et ce qui est exporté. Il est **idempotent** (relancer
écrase proprement) et ne fait **aucun appel réseau**.

> Pourquoi du WAV et pas du MP3 ? L'encodage MP3 exigerait une dépendance
> externe. Le WAV PCM est **trivial à écrire**, sans dépendance, et les pistes
> sont courtes (≈ 1,4 Mo au total). Si un vrai `.mp4`/`.mp3` est ajouté plus
> tard, il suffit de déclarer `videoUrl`/`src` dans une leçon : il est traité
> comme un média téléchargeable standard.

---

## 7. Intégration à METHOD

| Point | Détail |
| --- | --- |
| Registre | 11ᵉ module, groupe `incarnation`, non `primary` |
| Icônes | `PersonStanding`, `Video`, `Trophy` ajoutées au registre `Icon.jsx` |
| État | `nonverbal` dans `defaultState()` (`src/data/defaults.js`) |
| Sauvegarde | Couverte automatiquement par l'export/import global |
| Stockage | État : `localStorage method.state.v1` · Médias : Cache `method-media-v1` (web) ou `Directory.Data` (APK) · File : `method.nonverbal.queue` |
| Design | Tokens existants (`panel`, `btn-gold`, `chip`, `display`, `eyebrow`) — aucune palette nouvelle |

---

## 8. Carte des fichiers

```
src/lib/
  figure.js          moteur SVG paramétrique (POSES, figureSvg, clipSvg, standaloneSvg)
  curriculum.js      progression, déblocage, XP, séries, répétition espacée
  offlineMedia.js    téléchargement, quota, file, état de synchronisation
src/data/nonverbal/
  curriculum.js      COURSE (3 unités · 9 leçons · 44 étapes)
  media.js           MEDIA (16) + CLIPS (7) + KIND_META + inlineTextFor
  scripts.js         SCRIPTS · FICHES · DRILLS + sérialiseurs texte
  index.js           ré-export
src/components/nonverbal/
  Visuals.jsx        Figure · Illustration · ClipView · Storyboard · Stage
  Steps.jsx          6 rendus d'étape + MediaRow
src/modules/nonverbal/
  NonverbalAcademy.jsx · LessonPlayer.jsx · OfflineManager.jsx · ProgressPanel.jsx
scripts/
  generate-nonverbal.mjs   génération locale de tous les médias
public/media/nonverbal/
  audio/ · texts/ · poses/ · clips/ · manifest.json   (générés)
```

---

## 9. Points d'extension

- **Nouvelle posture** : ajouter une entrée dans `POSES` (`figure.js`) → elle est
  aussitôt disponible en `illustration`, dans les `clip` et à l'export `.svg`.
- **Nouvelle leçon** : ajouter un objet dans `COURSE.units[].lessons` ; les
  index, le déblocage et la progression se recalculent d'eux-mêmes.
- **Vraie vidéo** : déclarer `videoUrl` sur une leçon → média téléchargeable
  standard (le `OfflineManager` et `bundleStatus` le prennent en charge).
- **Nouvel exercice audio** : ajouter une fonction de synthèse dans le script et
  une entrée dans `MEDIA`.
- **Autres langues** : `COURSE`, `SCRIPTS`, `MEDIA` sont des données pures → un
  second fichier de contenu suffit (aucun changement de moteur).

---

## 10. Vérifications

```bash
node scripts/generate-nonverbal.mjs   # 36 fichiers, ~1,45 Mo téléchargeables
npm run build                          # bundle + médias dans dist/
npm run lint                           # 0 erreur
```

Le `manifest.json` généré contient la liste exacte des fichiers, leurs tailles
réelles et la comparaison avec les tailles estimées déclarées — utile pour
détecter tout écart après régénération.
