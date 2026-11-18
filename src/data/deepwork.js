/* ------------------------------------------------------------------
   deepwork.js — Données du module « Deep Work verrouillé »
------------------------------------------------------------------- */

export const DEEP_WORK_DURATIONS = [
  { id: 25, label: '25 min', hint: 'Pomodoro' },
  { id: 45, label: '45 min', hint: 'Bloc court' },
  { id: 60, label: '1 h', hint: 'Standard' },
  { id: 90, label: '90 min', hint: 'Bloc profond' },
  { id: 120, label: '2 h', hint: 'Marathon' },
]

/** Phrase exacte à recopier pour sortir d'un bloc verrouillé. */
export const EXIT_PHRASE = "JE CHOISIS D'ABANDONNER"

/** Durée d'appui continu exigée avant de pouvoir abandonner (ms). */
export const EXIT_HOLD_MS = 5000

/** Conditions système du verrouillage strict. */
export const GUARD_REQUIREMENTS = [
  {
    id: 'accessibility',
    label: "Service d'accessibilité",
    required: true,
    icon: 'Eye',
    why: "C'est lui qui surveille les applications ouvertes et renvoie toute distraction vers METHOD (Paramètres, Play Store, navigateurs, réseaux sociaux).",
  },
  {
    id: 'overlay',
    label: 'Affichage par-dessus les autres apps',
    required: false,
    icon: 'Layers',
    why: "Affiche l'écran de blocage par-dessus l'application interdite et permet de ramener METHOD au premier plan.",
  },
  {
    id: 'deviceAdmin',
    label: "Administrateur de l'appareil",
    required: false,
    icon: 'ShieldCheck',
    why: 'Android refuse alors de désinstaller METHOD tant que cette protection est active — c\'est la protection anti-désinstallation.',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    required: false,
    icon: 'BellRing',
    why: 'Affiche la notification persistante qui rappelle le temps restant.',
  },
  {
    id: 'battery',
    label: 'Batterie sans restriction',
    required: false,
    icon: 'BatteryCharging',
    why: 'Empêche le système de mettre le verrouillage en veille pendant les 90 minutes.',
  },
]

/** Libellés lisibles pour les paquets bloqués les plus courants. */
export const PACKAGE_LABELS = {
  'com.android.settings': 'Paramètres',
  'com.android.vending': 'Play Store',
  'com.google.android.gms': 'Services Google',
  'com.android.chrome': 'Chrome',
  'org.mozilla.firefox': 'Firefox',
  'com.instagram.android': 'Instagram',
  'com.zhiliaoapp.musically': 'TikTok',
  'com.facebook.katana': 'Facebook',
  'com.twitter.android': 'X',
  'com.snapchat.android': 'Snapchat',
  'com.whatsapp': 'WhatsApp',
  'com.google.android.youtube': 'YouTube',
  'com.reddit.frontpage': 'Reddit',
  'com.linkedin.android': 'LinkedIn',
  'com.netflix.mediaclient': 'Netflix',
}

export const packageLabel = (pkg) => PACKAGE_LABELS[pkg] || pkg || 'Application'

/** Citations affichées pendant le bloc, en rotation lente. */
export const FOCUS_QUOTES = [
  'Le téléphone est une porte ouverte sur le monde. Cette porte est fermée pendant 90 minutes.',
  'La concentration n\'est pas un talent. C\'est une décision, répétée.',
  'Ce que tu fais pendant ce bloc est ce que le Futur Toi récoltera.',
  'Chaque tentative de contournement est une preuve de plus que le personnage résiste.',
  'Une seule tâche. Une seule fenêtre. Rien d\'autre.',
  'La discipline est le pont entre l\'intention et l\'incarnation.',
  'Le monde attendra. Ton travail, non.',
  'Tu ne rates rien. Tu construis quelqu\'un.',
]
