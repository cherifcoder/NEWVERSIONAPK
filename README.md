# NEWVERSIONAPK

**METHOD — Incarne ton Futur Toi** · *The Ultimate Elite Persona*

Application mobile (Android) 100 % **hors-ligne** : un système d'exploitation
personnel fondé sur le Method Acting, les neurosciences et la stratégie d'élite.
Aucune donnée ne quitte ton téléphone.

---

## 📲 Télécharger l'application (APK)

| Source | Lien |
| --- | --- |
| **Dernière version (GitHub Releases)** | https://github.com/cherifcoder/NEWVERSIONAPK/releases/latest |
| Artefact de build (Actions) | onglet **Actions** → dernier build réussi → *METHOD-1.5.0-apk* |

**Fichier :** `METHOD-1.5.0.apk` — min. Android 7.0 (API 24).

### Installation sur le téléphone

1. Télécharge `METHOD-1.5.0.apk` sur ton téléphone.
2. Ouvre le fichier (Gestionnaire de fichiers → *Téléchargements*).
3. Android affiche un avertissement : autorise **« Installer des applications inconnues »**
   pour ton navigateur / gestionnaire de fichiers.
4. Installe, ouvre l'app, définis ton **code PIN** (4 à 6 chiffres) au premier lancement.
5. Termine l'**onboarding** : ton Persona Cible, tes piliers, ta mission.

> Le clavier du code PIN est **mélangé à chaque saisie** (anti-épaule-surveillance)
> et le code n'est **jamais stocké en clair** (SHA-256 salé, itéré 12 000 fois).

---

## 🧠 Les modules

| # | Module | Rôle |
| --- | --- | --- |
| 1 | **Incar-Check** (Dashboard) | Score du jour, piliers, citation, prochaine action |
| 2 | **Panthéon des Modèles** | Character Bible : archétypes & figures d'élite à incarner |
| 3 | **Éloquence · Négociation · Anglais** | Drills de prise de parole, répliques, vocabulaire |
| 4 | **Dispatcher « Zéro Abandon »** | Décompose une ambition en actions immédiates |
| 5 | **Académie du non-verbal** | Entrer, s'asseoir, saluer, se présenter, parler, sortir — micro-leçons, postures vectorielles, audio hors-ligne |
| 6 | **Hypnose éricksonienne** | 7 séances guidées, voix et ambiances embarquées, laboratoire binaural, minuteur de sommeil, progression |
| 7 | **Gym Quotidien des Mentors** | Exercices mentaux et physiques quotidiens |
| 8 | **Tracker des Piliers** | Deep Work chronométré, régularité, séries |
| 9 | **Journal de l'Acteur** | Journal de bord, humeur, insights, prompts |
| 10 | **Studio IA** (Agent IA) | Débrief chirurgical + 8 tâches (situation, projets, piliers, tendance, éloquence, hypnose, coach) + analyse |
| 11 | **Médiathèque** | Ressources audio / vidéo / texte téléchargeables **hors-ligne** |
| 12 | **Réglages** | Profil, sécurité (PIN), IA, export / import, réinitialisation |
| 13 | **Deep Work verrouillé** | Bloc de 90 min, **téléphone bloqué**, appels autorisés, anti-désinstallation |

### Académie du non-verbal (module 11)

Micro-learning à la Duolingo/Busuu pour la **communication non verbale** :
**3 unités · 9 leçons · 44 étapes**, une leçon de 3 à 6 minutes, une étape à
la fois, sans mécanique de « vies ».

- **Situations couvertes** : entrer dans une pièce et s'arrêter calmement ·
  balayer la pièce · posture assise · saluer et serrer la main · se présenter
  en 20 s · lecture à voix haute / élocution · demander un service · sortir
  d'une pièce.
- **Illustrations & mini-vidéos vectorielles** : dessinées par un moteur SVG
  paramétrique (`src/lib/figure.js`, 12 postures + 7 séquences animées) →
  **0 octet à télécharger**, nettes à toute résolution.
- **Hors-ligne** : audio (métronomes, souffle 3-4-5, appuis de syllabes) et
  textes (scénarios, fiche, exercices) **téléchargeables** (~1,45 Mo pour tout
  le cours). File d'attente persistante, reprise après coupure, vérification
  d'espace.
- **Régularité, pas punition** : XP, niveaux, série de jours et **répétition
  espacée** des questions (1 → 3 → 7 → 21 → 60 jours).

📄 Détails techniques (modèle de données, stratégie hors-ligne, moteur SVG,
génération 100 % locale) : **[docs/MODULE_NON_VERBAL.md](docs/MODULE_NON_VERBAL.md)**.


### Hypnose éricksonienne (module 12)

Séances guidées d'hypnose éricksonienne, **écrites et sonorisées sur l'appareil** :

- **7 séances** (détente, focus, prise de parole, sommeil, estime, projection,
  travail), déroulées en phases typées — accueil → induction →
  approfondissement → suggestion → visualisation → ancrage → émergence.
  La 7ᵉ, **« L'atelier du Futur Toi »**, est une séance **PNL d'endormissement**
  (15 min) : reprogrammation de l'inconscient **pendant le sommeil** (amour du
  travail et du code, constance, confiance en soi, sens des affaires,
  négociation, goût de la lecture et de la récitation). Elle se termine sans
  émergence, avec une voix **« berceuse »** enregistrée exprès (plus lente, plus
  grave).
- **Voix neuronale française embarquée** : deux voix douces et humaines (Denise,
  Henri) enregistrées **dans l'application** (un MP3 par phrase) — la même sur
  tous les téléphones, sans réseau, avec des silences dosés entre les phrases
  pour un vrai rythme d'hypnose. Onglet *Voix* : pré-écoute, choix de la voix,
  moteur (embarquée / téléphone / silencieuse) et longueur des pauses. Repli
  automatique sur la synthèse du téléphone, puis sur la lecture silencieuse.
- **Minuteur de sommeil** : choisis 15, 30, 45, 60 ou 90 min — la lecture
  **s'arrête toute seule**, en douceur, pendant que tu dors.
- **Fichiers prêts à écouter** : la séance d'endormissement existe aussi en **un
  seul fichier** — **MP3** (lecteur de musique) et **MP4** (image calme, pour
  l'écran ou le partage), téléchargeables depuis l'app et écoutables en boucle,
  hors-ligne, dans n'importe quel lecteur.
- **Bande-son embarquée** : 5 boucles d'ambiance (nappe, pluie, vagues, forêt,
  feu) + 5 repères sonores (cloche, gong, bol, souffles), plus un **battement
  binaural** généré en direct (6 presets : delta → gamma).
- **Laboratoire « Ambiances »** : écoute libre des presets binauraux, des boucles
  et des repères, avec réglage du volume.
- **Progression** : séances, minutes, série de jours, **séance conseillée** par
  l'analyse locale, journal des ressentis, lecture de la pratique.
- **Hors-ligne** : les sons, les scripts, **les voix** et les **fichiers prêts à
  écouter** sont **embarqués dans l'APK** (et mis en cache sur le web) — lisibles
  sans réseau, à vie.

> Séance à faire assis ou allongé, **jamais en conduisant** ; le battement
> binaural nécessite un casque et ne remplace aucun soin médical.

📄 Détails techniques (modèle de données, moteur Web Audio, génération 100 %
locale, intégration IA) : **[docs/MODULE_HYPNOSE.md](docs/MODULE_HYPNOSE.md)**.


### Studio IA (Agent IA)

- **Onglet Débrief** : le « Metteur en Scène » analyse ton rapport du jour et
  rédige un verdict chirurgical.
- **8 tâches** : Situation, Projets, Piliers, Tendance, Éloquence, Hypnose, Coach
  libre — chacune avec un **moteur local** (fonctionne **sans réseau**, à partir de
  tes données réelles) et, si une clé est configurée, un affinage par LLM.
- **Onglet Analyse** : métriques, état des piliers, tendances (7 jours vs 7 jours
  précédents), constats + action, et revue de semaine copiable.
- **Moteur API (optionnel)** : renseigne une clé dans *Réglages → IA* pour utiliser
  un fournisseur compatible **OpenAI** ou **Gemini** (Groq, OpenRouter, OpenAI, Gemini, custom).
  En cas d'échec réseau, l'app **retombe automatiquement** sur le moteur local :
  jamais d'écran vide.

---

### Deep Work verrouillé (module 13)

Un bloc de travail profond pendant lequel **le téléphone est bloqué** : réseaux
sociaux, navigateurs, Paramètres, Play Store et la page « infos de l'application »
sont interceptés et renvoyés vers METHOD. **Une seule exception : les appels**,
entrants comme sortants, restent 100 % fonctionnels.

- **Blocage strict** : un **service d'accessibilité** observe les changements de
  fenêtre et affiche une **surimpression opaque** par-dessus toute application
  interdite (type `TYPE_ACCESSIBILITY_OVERLAY`, qui ne consomme aucune permission
  et passe au-dessus de tout sauf la barre d'état). L'app fautive ne reçoit plus
  aucune touche.
- **Exception appels** : la détection d'appel lit `AudioManager.getMode()`
  (aucune permission `READ_PHONE_STATE`) ; pendant un appel, la surimpression
  s'efface et l'interface d'appel native n'est jamais recouverte.
- **Anti-désinstallation** : l'**administrateur d'appareil** dissuade fortement la
  désinstallation (Android refuse tant qu'il est actif, et les Paramètres sont
  bloqués). Si METHOD est **Device Owner**, la désinstallation devient
  **réellement impossible** et le mode kiosque s'active automatiquement.
- **Liste blanche totale** : tout est bloqué sauf METHOD, la chaîne d'appel, l'UI
  système et le clavier — plus les paquets que tu ajoutes toi-même.
- **Sortie de secours** : appui continu de **5 secondes** + recopie exacte de
  `JE CHOISIS D'ABANDONNER`. Chaque abandon est consigné (motif, temps, blocages).
- **Auto-détection** : aucune configuration manuelle — l'app détecte l'état réel
  des autorisations et affiche toujours un retour visible (vert = prêt).
- **Hors-ligne, 100 % local** : l'état vit dans `state.deepWork`, comme le reste.

> Le blocage d'autres applications via un service d'accessibilité est contraire
> aux règles du Google Play Store : réservé à cet **APK personnel**. En Device
> Owner, l'anti-désinstallation est totale ; sinon elle reste fortement
> dissuasive. Voir **[docs/MODULE_DEEPWORK.md](docs/MODULE_DEEPWORK.md)**.

---

## 🔐 Vie privée

- Toutes les données restent **sur l'appareil** (`localStorage`, clé `method.state.v1`).
- Médias hors-ligne : **Cache Storage** (`method-media-v1`) sur le web ; dans
  l'APK, l'audio et les fiches sont **déjà embarqués** dans les assets et lus
  sans réseau (seuls de vrais médias distants passent par `Directory.Data` via
  `@capacitor/filesystem`).
- Aucun compte, aucun tracking, aucun serveur propriétaire.
- **Export / Import** JSON dans *Réglages* pour sauvegarder ou transférer
  (inclut la progression des modules non-verbal, hypnose **et deep work**).

---

## 🛠️ Stack technique

- **React 19** + **Vite 8** (`base: './'` pour fonctionner en WebView `file://`)
- **Tailwind CSS v4** (`@tailwindcss/vite`, thème `@theme` — dark luxe « cabinet d'élite »)
- **lucide-react** (icônes), design system maison (`panel`, `btn-gold`, `nav-item`…)
- **Capacitor 8** → projet Android natif (`@capacitor/filesystem`, `@capacitor/share`)
- Service worker maison (`public/sw.js`) pour le shell hors-ligne + cache des médias

---

## 🚀 Développement

```bash
npm install       # dépendances
npm run dev       # serveur de dev (http://localhost:5173)
npm run build     # bundle de production -> dist/
npm run preview   # prévisualiser le build
npm run lint      # oxlint
```

### Régénérer les ressources hors-ligne

```bash
node scripts/generate-media.mjs        # posters SVG, audio WAV, textes
node scripts/generate-nonverbal.mjs    # module 11 : audio, textes, postures et clips SVG
node scripts/generate-hypnosis.mjs     # module 12 : ambiances WAV, repères sonores, scripts
node scripts/generate-hypnosis-voice.mjs   # module 12 : voix neuronales françaises (MP3)
node scripts/generate-icons.mjs        # icônes + splash (PNG depuis public/logo.svg)
npx capacitor-assets generate --android   # distribue icônes/splash dans android/
```

---

## 🤖 Build de l'APK

### En local (Windows, JDK 21 + Android SDK)

```powershell
# 1. Configurer le SDK (chemin vers ton Android SDK)
'android\local.properties' | Set-Content -Value 'sdk.dir=C:\Users\<toi>\AppData\Local\Android\Sdk'

# 2. Bundle web + synchronisation Capacitor
npm run build
npx cap sync android

# 3. APK signé
cd android
$env:JAVA_HOME = "<chemin vers JDK 21>"
.\gradlew.bat assembleRelease
```

L'APK signé est produit ici :

```
android/app/build/outputs/apk/release/app-release.apk
```

### Automatique (GitHub Actions)

Le workflow `.github/workflows/android.yml` construit l'APK signé à chaque
`push` sur `main`, et publie une **Release GitHub** (lien de téléchargement public)
lors d'un tag `v*` :

```bash
git tag v1.5.0
git push origin v1.5.0
```

L'APK est nommé d'après la version : `METHOD-1.5.0.apk`.

### Signature

L'APK release est signé avec la clé auto-signée du dépôt
(`android/method-release.keystore`, alias `method`, config `android/keystore.properties`).
Clé destinée à la **distribution personnelle** — remplace-la avant toute publication sur le Play Store.

---

## 📁 Structure

```
src/
  components/     Logo, LockScreen, PinKeypad, Onboarding, Shell, UI primitives
                  + nonverbal/ (Visuals, Steps)
  context/        AppContext (état global, persistance, PIN, rollover de jour)
  data/           tracks, archetypes, wisdom, exercises, eloquence, english, resources…
                  + nonverbal/ (curriculum, media, scripts)
                  + hypnosis/  (sessions, media, presets, voiceTracks)
  hooks/          useDeepWorkTimer
  lib/            aiAgent, aiAnalysis, aiTasks, crypto (PIN), storage, utils, focusGuard
                  + figure (moteur SVG), curriculum, offlineMedia, hypnosisAudio
  modules/        les 13 modules + registry.js (+ nonverbal/, hypnosis/, deepwork/)
public/
  sw.js           service worker (shell hors-ligne + cache médias)
  media/          ressources générées (posters, audio, textes, nonverbal/, hypnosis/)
  logo.svg
docs/             MODULE_NON_VERBAL.md, MODULE_HYPNOSE.md, MODULE_DEEPWORK.md
scripts/          generate-media.mjs, generate-nonverbal.mjs, generate-hypnosis.mjs,
                  generate-hypnosis-voice.mjs, generate-icons.mjs
android/          projet Capacitor natif
.github/          workflow de build APK
```

---

## 📜 Licence

Projet personnel — usage privé. Logo, textes et ressources générés pour l'application.
