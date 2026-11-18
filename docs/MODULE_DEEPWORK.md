# Module 13 — Deep Work verrouillé

> Un bloc de travail profond pendant lequel **le téléphone est bloqué** :
> réseaux sociaux, navigateurs, Paramètres, Play Store et la page « infos de
> l'application » sont interceptés et renvoyés vers METHOD. **Une seule
> exception : les appels téléphoniques**, entrants comme sortants.
> Le blocage vit dans une couche **native Android** (service d'accessibilité +
> surimpression + administrateur d'appareil) ; l'interface METHOD en est la face
> visible et le poste de commande.

---

## 1. Ce que fait le module

| Onglet | Contenu |
| --- | --- |
| **Session** | Intention du bloc, durée (25 min → 2 h), bascule « Verrouillage strict », lancement, statistiques, rappel de la liste blanche |
| **Réglages** | Autorisations système (liste de contrôle), durée par défaut, verrouillage strict par défaut, liste blanche d'applications |
| **Historique** | Blocs enregistrés (durée, blocages) et sorties de secours (motif, temps écoulé) |

Trois durées de bloc sont proposées d'emblée, avec **90 minutes** comme défaut —
le « bloc profond ».

Quand un bloc verrouillé démarre, `App.jsx` remplace toute l'application par
`StrictSession.jsx` : un écran plein, sombre, avec un **anneau de décompte**, le
compteur de tentatives de contournement, la rotation lente des citations et une
**sortie de secours** volontairement difficile.

---

## 2. Les trois niveaux de blocage

Le module s'adapte automatiquement à ce que l'appareil autorise. Aucun
réglage manuel : `FocusGuard.permissions()` détecte l'état réel.

### Niveau 1 — Minuteur simple (aucune autorisation)

Le téléphone n'est pas bloqué. Le décompte, l'historique et le crédit du pilier
« Code & Deep Work » fonctionnent normalement. C'est ce qui se passe dans le
navigateur, et sur Android si le service d'accessibilité n'est pas activé.

### Niveau 2 — Verrouillage strict (service d'accessibilité + surimpression)

Dès que le **service d'accessibilité** est activé, METHOD observe les
changements de fenêtre. Toute application hors liste blanche qui passe au premier
plan déclenche :

1. l'incrémentation du compteur de contournements (`FocusManager.onBlocked`) ;
2. l'affichage d'une **surimpression opaque** par-dessus l'app fautive
   (`FocusOverlay`, type `TYPE_ACCESSIBILITY_OVERLAY`), avec un seul bouton
   actif : **« Revenir à METHOD »**.

La surimpression **consomme les touches** : l'application en dessous ne reçoit
plus rien. Comme elle est opaque, l'utilisateur ne voit même pas l'app bloquée.

L'**administrateur d'appareil** ajoute la protection anti-désinstallation :
Android refuse alors de désinstaller METHOD tant que la protection est active, et
la page « infos de l'application » est de toute façon interceptée.

### Niveau 3 — Verrouillage absolu (Device Owner)

Si METHOD est **propriétaire de l'appareil** (`dpm set-device-owner`), la
désinstallation devient **réellement impossible** pendant le bloc :

- `setUninstallBlocked(admin, packageName, true)` ;
- `DISALLOW_SAFE_BOOT` (le mode sans échec est fermé) ;
- `setLockTaskPackages(...)` + `startLockTask()` : mode kiosque, sans échappatoire.

C'est la **seule** voie qui rend l'anti-désinstallation mathématique. Elle exige
un provisionnement ADB (et le plus souvent une réinitialisation d'usine, car le
provisionnement échoue si l'appareil a déjà des comptes). Le module le détecte et
l'affiche, mais ne l'impose pas.

---

## 3. L'exception : les appels téléphoniques

Les appels sont **toujours** fonctionnels, quel que soit le niveau :

- `FocusManager.isCallActive()` lit `AudioManager.getMode()` et considère
  `MODE_IN_CALL`, `MODE_IN_COMMUNICATION` et `MODE_RINGTONE` comme un appel en
  cours — **aucune permission** (`READ_PHONE_STATE` n'est pas demandée) ;
- pendant un appel, la surimpression est **masquée** (`FocusOverlay.hide()`), donc
  l'interface d'appel native n'est jamais recouverte ;
- la chaîne d'appel est dans la liste blanche : `com.android.phone`,
  `com.android.server.telecom`, les composeurs Android/Google/Samsung/OnePlus/
  OPPO/ColorOS, `com.android.incallui`, `com.android.emergency`.

Tout le reste est bloqué.

---

## 4. Liste blanche

Autorisés d'office, en plus de METHOD :

- **UI système** : `android`, `com.android.systemui`, les contrôleurs de
  permission (Android et Google) ;
- **chaîne d'appel** (voir § 3) ;
- **clavier courant** : le paquet de `Settings.Secure.DEFAULT_INPUT_METHOD` est
  ajouté dynamiquement, pour que la saisie reste possible.

L'utilisateur peut ajouter des paquets supplémentaires depuis
*Réglages → Liste blanche* (séparés par des virgules), stockés dans
`SharedPreferences` (`extra_whitelist`) et transmis par `setWhitelist`.

---

## 5. Sortie de secours

Sortir d'un bloc verrouillé n'est pas interdit — c'est **rendu difficile** pour
empêcher l'abandon impulsif :

1. **appui continu de 5 secondes** (`EXIT_HOLD_MS`) sur un bouton qui affiche le
   décompte ;
2. **recopie exacte** de la phrase `JE CHOISIS D'ABANDONNER` (normalisation des
   apostrophes typographiques, des espaces multiples et de la casse) ;
3. chaque abandon est **consigné** dans `deepWork.exits` avec le motif, le temps
   écoulé et le nombre de blocages — le temps déjà travaillé reste crédité.

---

## 6. Architecture

```
Interface web (React)                     Couche native (Java)
──────────────────────                    ────────────────────
src/lib/focusGuard.js        ──plugin──▶  FocusGuardPlugin.java
  guardStart / guardStop                     start / stop / status
  guardPermissions / guardListen             permissions / requestDeviceAdmin
                                             requestNotifications / openSettings
                                             setWhitelist / whitelist
                                                  │
src/context/AppContext.jsx                        ▼
  effet : démarre/relâche le natif          FocusManager.java   (état + verdicts)
  écoute guardState/guardBlocked/           FocusService.java   (décompte + notif FGS)
         guardEnded                         FocusAccessibilityService.java
  fin auto (setTimeout sur endAt)           FocusOverlay.java   (surimpression)
                                            FocusDeviceAdminReceiver.java
src/modules/deepwork/                       FocusBootReceiver.java
  DeepWork.jsx / StrictSession.jsx
  GuardSetup.jsx / ExitDialog.jsx
```

**Événements natifs → JS** : `guardState` (état de la session),
`guardBlocked` (une app a été interceptée), `guardEnded` (session terminée côté
natif). Le JS ne conclut jamais à la fin d'une session sur `guardState.active ===
false` (course possible au démarrage) : il s'appuie sur `guardEnded`, sur son
propre minuteur (`endAt`) et sur `StrictSession` quand `remaining <= 0`.

**Idempotence** : `start` reçoit `startedAt` depuis le JS, si bien que le WebView
et le natif calculent exactement la même fin de session. Ré-appeler `start` sur
la même session ne la réinitialise pas.

**Anti-blocage-fantôme** : `FocusManager.reconcile()` est appelé au lancement de
`MainActivity`, à la connexion du service d'accessibilité et au redémarrage
(`FocusBootReceiver`). Si aucune session valide ne subsiste, tout est relâché.

---

## 7. Autorisations

| Autorisation | Rôle | Requise ? |
| --- | --- | --- |
| Service d'accessibilité | Intercepter les applications interdites | **Oui** (sinon niveau 1) |
| Affichage par-dessus les autres apps | Afficher la surimpression | Recommandée |
| Administrateur de l'appareil | Dissuader / empêcher la désinstallation | Recommandée |
| Notifications | Notification persistante du décompte | Recommandée |
| Batterie sans restriction | Éviter la mise en veille pendant le bloc | Recommandée |
| Device Owner (ADB) | Désinstallation **impossible** | Optionnelle |

`POST_NOTIFICATIONS` est déclarée via `@Permission(alias = "notifications")` et
demandée par `requestNotifications()` (API ≥ 33).

---

## 8. Modèle de données

Tout vit dans `state.deepWork` (aucune donnée ne quitte l'appareil) :

```js
deepWork: {
  activeSession: null, // { startedAt, intent, blockIndex, durationMinutes, guard, blocked }
  sessions: [],        // { id, date, minutes, intent, startedAt, endedAt, blocked, guarded }
  totalMinutes: 0,
  blockedCount: 0,     // total cumulé de contournements bloqués
  guard: {
    enabled: true,     // verrouillage strict par défaut
    duration: 90,
    allowCalls: true,
    whitelist: [],     // paquets supplémentaires
    lastBlockedAt: null,
    lastBlockedPackage: null,
  },
  exits: [],           // { id, at, reason, elapsedSeconds, blocked }
}
```

`mergeImported` (export/import) et le chargement initial (`AppContext`) fusionnent
`deepWork` en profondeur, si bien qu'un état enregistré par une version
antérieure récupère automatiquement le bloc `guard` manquant.

---

## 9. Limites connues

Le blocage d'autres applications via un service d'accessibilité est **contraire
aux règles du Google Play Store** — acceptable pour un APK personnel, pas pour
une publication sur le store.

Limites résiduelles, acceptables et documentées :

- **mode sans échec** : neutralisé seulement en Device Owner (`DISALLOW_SAFE_BOOT`) ;
- **`adb uninstall`** et **force-stop via ADB** : hors de portée d'une app ;
- après un **redémarrage**, la reprise dépend de `FocusBootReceiver` et de la
  reconnexion du service d'accessibilité.

---

## 10. Tester

Sur l'APK :

1. *Réglages Android → Accessibilité → METHOD* : activer le service ;
2. dans METHOD, *Deep Work → Réglages* : vérifier que les lignes passent au vert ;
3. lancer un bloc de 25 min, puis essayer d'ouvrir **Paramètres**, le **Play
   Store**, un **navigateur** → la surimpression doit apparaître et le compteur
   s'incrémenter ;
4. se faire **appeler** (ou appeler) pendant le bloc → la surimpression disparaît,
   l'interface d'appel est normale ;
5. tester la **sortie de secours** : appui 5 s + phrase exacte.

En local (Windows, JDK 21 + Android SDK) :

```powershell
npm run build
npx cap sync android
cd android
$env:JAVA_HOME = "<chemin vers JDK 21>"
.\gradlew.bat :app:assembleDebug
```
