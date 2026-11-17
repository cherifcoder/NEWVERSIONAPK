/* ------------------------------------------------------------------
   aiAnalysis.js — Analyse transversale, 100 % locale
   ------------------------------------------------------------------
   Ce module ne fait AUCUN appel réseau. Il lit l'état de l'application
   (piliers, travail profond, journal, projets, non-verbal, hypnose) et
   en tire :

   • buildMetrics(state)        → tous les chiffres utiles, normalisés
   • detectTrends(state)        → 7 derniers jours vs 7 précédents
   • buildInsights(state)       → constats + action concrète
   • buildDigest(state)         → revue de semaine en Markdown
   • hypnosisSuggestion(state)  → quelle séance faire maintenant, et pourquoi
   • hypnosisDigest(state)      → lecture de la pratique d'hypnose

   Utilisé par le Studio IA (onglet Analyse / Tendance) et par le module
   hypnose. Les moteurs LLM (optionnels) s'appuient sur ces mêmes données
   pour éviter d'inventer des chiffres.
------------------------------------------------------------------- */

import { sessionFor, sessionList } from '../data/hypnosis'
import { PILLARS } from '../data/tracks'
import { clamp, dayKey, daysBetween, pct, sum } from './utils'

const DAY = 86400000

const backDays = (n, offset = 0) =>
  Array.from({ length: n }, (_, i) => dayKey(new Date(Date.now() - (i + offset) * DAY)))

const fmtList = (arr = []) => arr.filter(Boolean).join(', ')

/* ------------------------------------------------------------------ */
/*  Métriques                                                          */
/* ------------------------------------------------------------------ */

export const buildMetrics = (state = {}) => {
  const pillarsToday = state.today?.pillars || {}
  const targets = state.pillars || {}
  const targetSum = sum(PILLARS, (p) => targets[p.id] || 0)
  const doneSum = sum(PILLARS, (p) => Math.min(pillarsToday[p.id] || 0, targets[p.id] || 0))
  const incarnRate = targetSum ? clamp(Math.round((doneSum / targetSum) * 100)) : 0

  const last7 = backDays(7)
  const prev7 = backDays(7, 7)
  const history = state.history || {}
  const today = dayKey()

  const rateOf = (d) => (d === today ? incarnRate : history[d]?.incarnRate || 0)
  const avg = (days) => (days.length ? Math.round(sum(days, rateOf) / days.length) : 0)

  const dwSessions = state.deepWork?.sessions || []
  const dwIn = (days) => sum(dwSessions.filter((s) => days.includes(s.date)), (s) => s.minutes || 0)
  const dwToday = sum(dwSessions.filter((s) => s.date === today), (s) => s.minutes || 0)

  const journal = state.journal || []
  const jRecent = journal.filter((j) => last7.includes(j.date))
  const jScores = jRecent.map((j) => j.score).filter((n) => typeof n === 'number')
  const journalAvg = jScores.length ? Math.round(sum(jScores) / jScores.length) : null
  const lastJournal = journal[0] || null
  const daysSinceJournal = lastJournal ? daysBetween(lastJournal.date, today) : null

  const openProjects = (state.projects || []).filter((p) => p.status === 'open')
  const oldestLoopDays =
    openProjects
      .map((p) => daysBetween(dayKey(new Date(p.startedAt || p.createdAt || Date.now())), today))
      .sort((a, b) => b - a)[0] ?? null

  const tasks = state.tasks || []
  const openTasks = tasks.filter((t) => !t.done)

  const nv = state.nonverbal || {}
  const nvLessons = Object.values(nv.progress || {}).filter((p) => p.done).length

  const hy = state.hypnosis || {}
  const hyProgress = hy.progress || {}
  const hySessions = sum(Object.values(hyProgress), (p) => p.sessions || 0)
  const hyMinutes = sum(Object.values(hyProgress), (p) => p.minutes || 0)
  const hyLastAt = Object.values(hyProgress).map((p) => p.lastAt).filter(Boolean).sort().pop() || null

  const pillars = PILLARS.map((p) => {
    const t = pillarsToday[p.id] || 0
    const target = targets[p.id] || 0
    const past = last7.filter((d) => d !== today).map((d) => history[d]?.pillars?.[p.id] || 0)
    const average = past.length ? Math.round(sum(past) / past.length) : 0
    return { ...p, today: t, target, average, pct: pct(t, target), gap: Math.max(0, target - t) }
  })
  const neglected = pillars.filter((p) => p.pct < 50).sort((a, b) => a.pct - b.pct)

  return {
    date: today,
    incarnRate,
    avgRate7: avg(last7),
    avgRatePrev7: avg(prev7),
    deepWorkToday: dwToday,
    deepWork7: dwIn(last7),
    deepWorkPrev7: dwIn(prev7),
    journalCount: journal.length,
    journalAvg,
    lastJournal,
    daysSinceJournal,
    openProjects,
    openProjectCount: openProjects.length,
    oldestLoopDays,
    finishedProjects: (state.finishedProjects || []).length,
    openTasks: openTasks.length,
    tasksTotal: tasks.length,
    nvLessons,
    nvXp: nv.xp || 0,
    hySessions,
    hyMinutes,
    hyLastAt,
    pillars,
    neglected,
    streak: state.streak || { current: 0, best: 0 },
    english: state.english || {},
  }
}

/* ------------------------------------------------------------------ */
/*  Tendances                                                          */
/* ------------------------------------------------------------------ */

const deltaPct = (now, before) => (before > 0 ? Math.round(((now - before) / before) * 100) : now > 0 ? 100 : 0)

export const detectTrends = (state = {}) => {
  const m = buildMetrics(state)
  const trends = []

  trends.push({
    id: 'incarn',
    label: "Taux d'incarnation",
    value: `${m.avgRate7}%`,
    delta: deltaPct(m.avgRate7, m.avgRatePrev7),
    detail: `7 j : ${m.avgRate7}% · 7 j précédents : ${m.avgRatePrev7}%`,
  })

  trends.push({
    id: 'deepwork',
    label: 'Travail profond',
    value: `${Math.round(m.deepWork7 / 60)} h`,
    delta: deltaPct(m.deepWork7, m.deepWorkPrev7),
    detail: `7 j : ${m.deepWork7} min · 7 j précédents : ${m.deepWorkPrev7} min`,
  })

  if (m.journalAvg != null) {
    trends.push({
      id: 'journal',
      label: 'Score de débrief',
      value: `${m.journalAvg}/100`,
      delta: 0,
      detail: `${m.journalCount} débrief(s) au total · dernier il y a ${m.daysSinceJournal ?? '—'} j`,
    })
  }

  trends.push({
    id: 'hypnose',
    label: 'Hypnose',
    value: `${m.hySessions}`,
    delta: 0,
    detail: `${m.hyMinutes} min cumulées${m.hyLastAt ? ` · dernière séance il y a ${Math.max(0, daysBetween(dayKey(new Date(m.hyLastAt)), m.date))} j` : ''}`,
  })

  return trends
}

/* ------------------------------------------------------------------ */
/*  Constats + action                                                  */
/* ------------------------------------------------------------------ */

export const buildInsights = (state = {}) => {
  const m = buildMetrics(state)
  const out = []

  if (m.neglected.length) {
    out.push({
      tone: 'blood',
      icon: 'AlertTriangle',
      title: `Piliers en souffrance : ${fmtList(m.neglected.slice(0, 3).map((p) => p.short))}`,
      text: `Le pilier « ${m.neglected[0].label} » est à ${m.neglected[0].pct}% de son objectif. Une seule brique de 20 minutes suffit à sortir du rouge : choisis-en une et fais-la avant ce soir.`,
    })
  } else {
    out.push({
      tone: 'jade',
      icon: 'CheckCircle2',
      title: 'Tous les piliers sont alimentés',
      text: "Aucun pilier n'est sous 50% de son objectif. C'est exactement l'état d'un système qui tient. Protège-le : la régularité vaut plus que l'intensité.",
    })
  }

  if (m.deepWork7 < 300) {
    out.push({
      tone: 'gold',
      icon: 'Timer',
      title: 'Le travail profond est sous la barre',
      text: `Seulement ${Math.round(m.deepWork7 / 60)} h de concentration sur 7 jours. Le deep work est la seule monnaie qui achète la liberté technique : bloque 90 minutes, téléphone en mode avion, une seule tâche.`,
    })
  }

  if (m.daysSinceJournal == null || m.daysSinceJournal >= 3) {
    out.push({
      tone: 'sapphire',
      icon: 'NotebookPen',
      title: 'Le débrief est en retard',
      text: "Un système non mesuré dérive. Prends 4 minutes pour débriefing ta journée : ce qui a marché, ce qui a fui, la prochaine action.",
    })
  }

  if (m.openProjectCount > 3) {
    out.push({
      tone: 'blood',
      icon: 'Waypoints',
      title: `${m.openProjectCount} boucles ouvertes`,
      text: `Trop de projets en parallèle dilue l'attention. Ferme, délègue ou archive jusqu'à n'en garder que 2–3. La plus vieille boucle a ${m.oldestLoopDays ?? '?'} jours : c'est elle qui pèse.`,
    })
  }

  if (m.hySessions === 0) {
    out.push({
      tone: 'sapphire',
      icon: 'Waves',
      title: "L'hypnose n'est pas encore dans ta semaine",
      text: "Dix minutes d'induction avant un bloc de travail changent la qualité de la journée. Commence par « Le souffle qui descend ».",
    })
  }

  if (m.streak?.current >= 3) {
    out.push({
      tone: 'jade',
      icon: 'Flame',
      title: `Série de ${m.streak.current} jours`,
      text: `Ne casse pas la chaîne. Même une journée minimale compte : la seule erreur serait un zéro.`,
    })
  }

  if (m.openTasks > 8) {
    out.push({
      tone: 'gold',
      icon: 'ListChecks',
      title: `${m.openTasks} tâches en attente`,
      text: "Au-delà de 8 tâches ouvertes, la liste devient un cimetière. Choisis les 3 qui comptent, supprime ou reporte le reste sans culpabilité.",
    })
  }

  return out
}

/* ------------------------------------------------------------------ */
/*  Revue de semaine                                                   */
/* ------------------------------------------------------------------ */

export const buildDigest = (state = {}) => {
  const m = buildMetrics(state)
  const trends = detectTrends(state)
  const insights = buildInsights(state)
  const arrow = (d) => (d > 0 ? `▲ +${d}%` : d < 0 ? `▼ ${d}%` : '= stable')

  return [
    `# Revue de la semaine`,
    `_Générée localement le ${new Date().toLocaleDateString('fr-FR')} — aucune donnée n'a quitté l'appareil._`,
    '',
    `## Chiffres clés`,
    `- **Incarnation** : ${m.incarnRate}% aujourd'hui, ${m.avgRate7}% en moyenne sur 7 jours (${arrow(trends[0]?.delta ?? 0)})`,
    `- **Travail profond** : ${Math.round(m.deepWork7 / 60)} h sur 7 jours (${arrow(trends[1]?.delta ?? 0)})`,
    `- **Série** : ${m.streak?.current || 0} jour(s) en cours · record ${m.streak?.best || 0}`,
    `- **Journal** : ${m.journalCount} débrief(s)${m.journalAvg != null ? ` · score moyen ${m.journalAvg}/100` : ''}`,
    `- **Projets ouverts** : ${m.openProjectCount} · ${m.finishedProjects} terminé(s)`,
    `- **Non-verbal** : ${m.nvLessons} leçon(s) validée(s) · ${m.nvXp} XP`,
    `- **Hypnose** : ${m.hySessions} séance(s) · ${m.hyMinutes} min`,
    '',
    `## Piliers`,
    ...m.pillars.map((p) => `- ${p.label} : ${p.today}/${p.target} ${p.unit} (${p.pct}%) — moyenne 7 j : ${p.average}`),
    '',
    `## Ce que je vois`,
    ...insights.flatMap((i) => [`### ${i.title}`, i.text, '']),
    `## Prochaine action`,
    m.neglected.length
      ? `> Fais **${m.neglected[0].label}** pendant 20 minutes, aujourd'hui, avant toute autre chose.`
      : m.openTasks > 0
        ? `> Choisis la tâche la plus difficile de ta liste et commence-la dans les 10 minutes.`
        : `> Lance un bloc de travail profond de 90 minutes sur ton projet prioritaire.`,
    '',
    `_METHOD — Incarne ton Futur Toi_`,
  ].join('\n')
}

/* ------------------------------------------------------------------ */
/*  Hypnose                                                            */
/* ------------------------------------------------------------------ */

/** Quelle séance faire maintenant, et pourquoi (moteur local). */
export const hypnosisSuggestion = (state = {}) => {
  const m = buildMetrics(state)
  const done = (id) => state.hypnosis?.progress?.[id]?.sessions || 0
  const hour = new Date().getHours()

  if (hour >= 22 || hour < 5) {
    return { session: sessionFor('hy-sommeil'), reason: "Il est tard : une séance d'endormissement prépare une nuit réparatrice." }
  }
  if (m.hySessions === 0) {
    return { session: sessionFor('hy-induction'), reason: "Première séance : on apprend le chemin de la détente profonde, sans rien attendre de plus." }
  }
  const focus = m.pillars.find((p) => p.id === 'code')
  if (focus && focus.pct < 50 && m.deepWork7 < 300) {
    return { session: sessionFor('hy-focus'), reason: "Ton travail profond est en retrait : installe l'état de concentration avant ton prochain bloc." }
  }
  const elo = m.pillars.find((p) => p.id === 'eloquence')
  if (elo && elo.pct < 50) {
    return { session: sessionFor('hy-scene'), reason: "L'éloquence est sous-alimentée : répète mentalement une prise de parole réussie." }
  }
  if (m.incarnRate < 50) {
    return { session: sessionFor('hy-futur'), reason: "Journée en demi-teinte : reconnecte-toi à ton Futur Toi et repars sur une seule brique." }
  }
  const least = sessionList()
    .slice()
    .sort((a, b) => done(a.id) - done(b.id))[0]
  return { session: least, reason: "Pour équilibrer ta pratique, va vers la séance que tu connais le moins." }
}

/** Lecture de la pratique d'hypnose, en Markdown, 100 % locale. */
export const hypnosisDigest = (state = {}) => {
  const m = buildMetrics(state)
  const hy = state.hypnosis || {}
  const log = hy.log || {}
  const progress = hy.progress || {}
  const sessions = sessionList()
  const week = backDays(7)

  const weekMinutes = sum(week, (d) => log[d]?.minutes || 0)
  const weekSessions = sum(week, (d) => log[d]?.sessions || 0)
  const activeDays = week.filter((d) => (log[d]?.sessions || 0) > 0).length

  const ranking = sessions
    .map((s) => ({ s, n: progress[s.id]?.sessions || 0, min: progress[s.id]?.minutes || 0 }))
    .sort((a, b) => b.n - a.n)
  const most = ranking[0]
  const least = ranking[ranking.length - 1]

  const journal = hy.journal || []
  const moods = journal.reduce((acc, e) => {
    acc[e.mood] = (acc[e.mood] || 0) + 1
    return acc
  }, {})
  const topMood = Object.entries(moods).sort((a, b) => b[1] - a[1])[0]?.[0]

  const verdict =
    m.hySessions === 0
      ? "Tu n'as pas encore commencé. La première séance est toujours la plus difficile : choisis « Le souffle qui descend », 8 minutes."
      : weekSessions >= 5
        ? 'Pratique très régulière. À ce rythme, la détente devient un réflexe disponible en quelques respirations.'
        : weekSessions >= 2
          ? 'Pratique correcte. Vise un rendez-vous fixe (même heure, même lieu) pour transformer l\'essai en habitude.'
          : 'Pratique encore épisodique. Une séance le matin et une le soir suffisent à installer le réflexe.'

  return [
    `# Lecture de ta pratique d'hypnose`,
    '',
    `## 7 derniers jours`,
    `- **${weekSessions} séance(s)** · **${weekMinutes} min** · **${activeDays}/7 jours** actifs`,
    `- Cumul total : ${m.hySessions} séance(s) · ${m.hyMinutes} min`,
    '',
    `## Ce que tu pratiques`,
    most && most.n > 0 ? `- La plus utilisée : **${most.s.title}** (${most.n}×)` : '- Aucune séance enregistrée pour le moment',
    least ? `- La moins utilisée : **${least.s.title}**${least.n ? ` (${least.n}×)` : ' — jamais faite'}` : '',
    topMood ? `- Ressenti dominant après séance : **${topMood}**` : '',
    '',
    `## Diagnostic`,
    verdict,
    '',
    `## Prochaine étape`,
    least && least.n === 0
      ? `> Essaie **${least.s.title}** : c'est la seule séance que tu n'as jamais faite.`
      : `> Ajoute une séance « ancrage » juste avant un moment stressant : la répétition mentale fait le reste.`,
    '',
    `_Aucune donnée ne quitte ton téléphone._`,
  ]
    .filter((l) => l !== '')
    .join('\n')
}

export const analysis = { buildMetrics, detectTrends, buildInsights, buildDigest, hypnosisSuggestion, hypnosisDigest }
