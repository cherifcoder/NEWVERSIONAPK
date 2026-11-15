/* ------------------------------------------------------------------
   registry.js — Cartographie des 11 modules de l'application
------------------------------------------------------------------- */
import Dashboard from './Dashboard'
import CharacterBible from './CharacterBible'
import EloquenceHub from './EloquenceHub'
import ZeroAbandon from './ZeroAbandon'
import MentorGym from './MentorGym'
import PillarsTracker from './PillarsTracker'
import ActorJournal from './ActorJournal'
import AiDirector from './AiDirector'
import MediaLibrary from './MediaLibrary'
import NonverbalAcademy from './nonverbal/NonverbalAcademy'
import SettingsPanel from './SettingsPanel'

export const MODULES = [
  {
    id: 'dashboard',
    label: 'Incar-Check',
    short: 'Incar',
    title: 'Dashboard Incar-Check',
    subtitle: 'Gouvernance quotidienne du personnage',
    icon: 'LayoutDashboard',
    Component: Dashboard,
    group: 'quotidien',
    primary: true,
  },
  {
    id: 'pillars',
    label: 'Piliers & Deep Work',
    short: 'Piliers',
    title: 'Tracker des Piliers d\'Excellence',
    subtitle: 'Le Charbon — code, savoir, tactique, spiritualité, verbe',
    icon: 'Gauge',
    Component: PillarsTracker,
    group: 'quotidien',
    primary: true,
  },
  {
    id: 'gym',
    label: 'Gym des Mentors',
    short: 'Gym',
    title: 'Le Gym Quotidien des Mentors',
    subtitle: 'Exercices, astuces et rituels tirés des livres de référence',
    icon: 'Dumbbell',
    Component: MentorGym,
    group: 'quotidien',
    primary: true,
  },
  {
    id: 'journal',
    label: 'Journal de l\'Acteur',
    short: 'Journal',
    title: 'Le Journal de l\'Acteur',
    subtitle: 'Débrief de fin de journée — sans complaisance',
    icon: 'NotebookPen',
    Component: ActorJournal,
    group: 'quotidien',
    primary: true,
  },
  {
    id: 'director',
    label: 'Agent IA — Le Metteur en Scène',
    short: 'IA',
    title: 'Le Metteur en Scène & Coach Stratège',
    subtitle: 'Évaluation chirurgicale, plan d\'action, ordre du jour',
    icon: 'Sparkles',
    Component: AiDirector,
    group: 'quotidien',
    primary: true,
  },
  {
    id: 'pantheon',
    label: 'Character Bible',
    short: 'Panthéon',
    title: 'Character Bible & Panthéon des Modèles',
    subtitle: 'Étudier, puis incorporer — la méthode du Method Acting',
    icon: 'Theater',
    Component: CharacterBible,
    group: 'incarnation',
  },
  {
    id: 'eloquence',
    label: 'Éloquence & Anglais',
    short: 'Éloquence',
    title: 'Hub Éloquence, Négociation & Anglais',
    subtitle: 'L\'art de la parole, l\'entregent, la langue du marché mondial',
    icon: 'Mic',
    Component: EloquenceHub,
    group: 'incarnation',
  },
  {
    id: 'dispatcher',
    label: 'Dispatcher Zéro Abandon',
    short: 'Zéro Abandon',
    title: 'Le Dispatcher « Zéro Abandon »',
    subtitle: 'Finir ce qu\'on commence — une boucle ouverte à la fois',
    icon: 'Swords',
    Component: ZeroAbandon,
    group: 'incarnation',
  },
  {
    id: 'nonverbal',
    label: 'Communication non verbale',
    short: 'Non-verbal',
    title: 'Académie du non-verbal',
    subtitle: 'Entrer, s\'asseoir, saluer, se présenter, prendre la parole — micro-leçons et postures vectorielles',
    icon: 'PersonStanding',
    Component: NonverbalAcademy,
    group: 'incarnation',
  },
  {
    id: 'library',
    label: 'Bibliothèque hors-ligne',
    short: 'Ressources',
    title: 'Bibliothèque hors-ligne',
    subtitle: 'Télécharge et révise sans connexion, comme avec Busuu',
    icon: 'Library',
    Component: MediaLibrary,
    group: 'système',
  },
  {
    id: 'settings',
    label: 'Réglages & Sauvegarde',
    short: 'Réglages',
    title: 'Réglages, Sécurité & Sauvegarde',
    subtitle: 'Code PIN, export/import, moteur IA, données locales',
    icon: 'Settings',
    Component: SettingsPanel,
    group: 'système',
  },
]

export const MODULE_MAP = Object.fromEntries(MODULES.map((m) => [m.id, m]))

export const NAV_GROUPS = [
  { id: 'quotidien', label: 'Le quotidien' },
  { id: 'incarnation', label: 'L\'incarnation' },
  { id: 'système', label: 'Le système' },
]
