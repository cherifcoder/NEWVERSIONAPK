/* ------------------------------------------------------------------
   defaults.js — État initial de l'application
------------------------------------------------------------------- */

import { PILLARS, emptyPillars } from './tracks'
import { dayKey, uid } from '../lib/utils'

export const APP_VERSION = 1

export const defaultState = () => ({
  schema: APP_VERSION,
  createdAt: new Date().toISOString(),

  profile: {
    name: '',
    codename: 'Le Futur Toi',
    vision:
      "Devenir un hybride redoutable : bourreau de travail polymath (code, lecture, échecs, Coran), négociateur d'élite à la Harvey Specter et polyglotte orateur. Zéro abandon.",
    startDate: dayKey(),
    targetDate: `${new Date().getFullYear() + 1}-${`${new Date().getMonth() + 1}`.padStart(2, '0')}-${`${new Date().getDate()}`.padStart(2, '0')}`,
    englishLevel: 'b1',
  },

  security: {
    pinEnabled: false,
    pinHash: null,
    pinSalt: null,
    pinLength: 4,
    autoLockMinutes: 5,
    failedAttempts: 0,
    lastUnlockAt: null,
  },

  settings: {
    aiEnabled: true,
    aiProvider: 'groq',
    aiApiKey: '',
    aiModel: '',
    aiEndpoint: '',
    dailyReminder: true,
    soundEffects: false,
    compactMode: false,
  },

  pillars: Object.fromEntries(PILLARS.map((p) => [p.id, p.dailyTarget])),

  today: {
    date: dayKey(),
    pillars: emptyPillars(),
  },

  history: {}, // { 'YYYY-MM-DD': { pillars: {...}, incarnRate, score, journaledAt } }

  deepWork: {
    activeSession: null, // { startedAt, intent, blockIndex }
    sessions: [], // { id, date, minutes, intent, startedAt, endedAt }
    totalMinutes: 0,
  },

  // Le Dispatcher « Zéro Abandon »
  projects: [
    {
      id: uid('prj'),
      title: 'METHOD — Application de suivi d\'incarnation',
      type: 'Code',
      status: 'open',
      progress: 15,
      nextStep: 'Boucler le module de débrief et l\'agent IA',
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      finishedAt: null,
      deployedUrl: '',
      note: 'Projet fondateur : il sert de preuve que le système fonctionne.',
      priority: 1,
    },
  ],
  finishedProjects: [],

  // Exercices du gym marqués comme faits (par jour)
  exerciseLog: {}, // { 'YYYY-MM-DD': ['ex-id'] }

  // Journal
  journal: [], // { id, date, answers, score, verdict, report, source, createdAt }

  // Anglais
  english: {
    level: 'b1',
    idiomsLearned: [],
    minutesByDay: {},
  },

  // Bibliothèque hors-ligne
  media: {}, // { [resourceId]: { url, size, downloadedAt } }

  streak: { current: 0, best: 0, lastDay: null, freezes: 0 },

  ui: {
    lastModule: 'dashboard',
    seenOnboarding: false,
  },
})

export const DEMO_TASKS = [
  { id: uid('tsk'), title: 'Terminer le module Journal + Agent IA', done: false, pillar: 'code', createdAt: new Date().toISOString() },
  { id: uid('tsk'), title: 'Lire 30 pages — Les 48 lois du pouvoir', done: false, pillar: 'reading', createdAt: new Date().toISOString() },
  { id: uid('tsk'), title: 'Analyse d\'une partie d\'échecs', done: true, pillar: 'chess', createdAt: new Date().toISOString() },
]
