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
| Artefact de build (Actions) | onglet **Actions** → dernier build réussi → *METHOD-1.0.0-apk* |

**Fichier :** `METHOD-1.0.0.apk` (~5,8 Mo) — min. Android 7.0 (API 24).

### Installation sur le téléphone

1. Télécharge `METHOD-1.0.0.apk` sur ton téléphone.
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
| 6 | **Gym Quotidien des Mentors** | Exercices mentaux et physiques quotidiens |
| 7 | **Tracker des Piliers** | Deep Work chronométré, régularité, séries |
| 8 | **Journal de l'Acteur** | Journal de bord, humeur, insights, prompts |
| 9 | **Le Metteur en Scène** (Agent IA) | Rapport d'analyse personnalisé, moteur local **ou** API LLM |
| 10 | **Médiathèque** | Ressources audio / vidéo / texte téléchargeables **hors-ligne** |
| 11 | **Réglages** | Profil, sécurité (PIN), IA, export / import, réinitialisation |

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


### Agent IA « Le Metteur en Scène »

- **Moteur local (par défaut)** : fonctionne **sans réseau**, analyse tes données
  (piliers, journal, régularité) et rédige un rapport.
- **Moteur API (optionnel)** : renseigne une clé dans *Réglages → IA* pour utiliser
  un fournisseur compatible **OpenAI** ou **Gemini** (Groq, OpenRouter, OpenAI, Gemini, custom).
  En cas d'échec réseau, l'app **retombe automatiquement** sur le moteur local.

---

## 🔐 Vie privée

- Toutes les données restent **sur l'appareil** (`localStorage`, clé `method.state.v1`).
- Médias hors-ligne : **Cache Storage** (`method-media-v1`) sur le web, dossier
  applicatif natif (`Directory.Data`) dans l'APK via `@capacitor/filesystem`.
- Aucun compte, aucun tracking, aucun serveur propriétaire.
- **Export / Import** JSON dans *Réglages* pour sauvegarder ou transférer
  (inclut la progression du module non-verbal).

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
git tag v1.0.0
git push origin v1.0.0
```

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
  hooks/          useDeepWorkTimer
  lib/            aiAgent, crypto (PIN), storage, utils
                  + figure (moteur SVG), curriculum, offlineMedia
  modules/        les 11 modules + registry.js (+ nonverbal/)
public/
  sw.js           service worker (shell hors-ligne + cache médias)
  media/          ressources générées (posters, audio, textes, nonverbal/)
  logo.svg
docs/             MODULE_NON_VERBAL.md (architecture du module 11)
scripts/          generate-media.mjs, generate-nonverbal.mjs, generate-icons.mjs
android/          projet Capacitor natif
.github/          workflow de build APK
```

---

## 📜 Licence

Projet personnel — usage privé. Logo, textes et ressources générés pour l'application.
