/* ------------------------------------------------------------------
   curriculum.js — Logique pure du parcours d'apprentissage
   ------------------------------------------------------------------
   Aucun état ici : uniquement des fonctions dérivées (progression,
   déverrouillage, prochaine leçon, XP, niveaux, répétition espacée).
   Cela garde les écrans simples et testables.
------------------------------------------------------------------- */

import { dayKey, daysBetween, addDays } from './utils'

/* ------------------------- Aplatissement ------------------------- */

export const allLessons = (course) =>
  (course?.units || []).flatMap((unit, unitIndex) =>
    (unit.lessons || []).map((lesson, lessonIndex) => ({
      ...lesson,
      unitId: unit.id,
      unitTitle: unit.title,
      unitIndex,
      lessonIndex,
      index: 0,
    })),
  ).map((l, i) => ({ ...l, index: i }))

export const allSteps = (course) => allLessons(course).flatMap((l) => l.steps || [])

/** Tous les médias référencés par une leçon (audio/vidéo/textes à télécharger). */
export const lessonMediaIds = (lesson) => {
  const ids = new Set()
  ;(lesson?.steps || []).forEach((s) => {
    if (s.mediaId) ids.add(s.mediaId)
    ;(s.mediaIds || []).forEach((m) => ids.add(m))
  })
  return [...ids]
}

export const courseMediaIds = (course) => [...new Set(allLessons(course).flatMap(lessonMediaIds))]

export const unitMediaIds = (unit) => [...new Set((unit.lessons || []).flatMap(lessonMediaIds))]

/* --------------------------- Progression --------------------------- */

export const stepIsDone = (progress, lessonId, stepId) =>
  Boolean(progress?.[lessonId]?.stepsDone?.includes(stepId))

export const lessonIsDone = (progress, lessonId) => Boolean(progress?.[lessonId]?.done)

export const lessonPct = (lesson, progress) => {
  const steps = lesson?.steps || []
  if (!steps.length) return 0
  const done = steps.filter((s) => stepIsDone(progress, lesson.id, s.id)).length
  return Math.round((done / steps.length) * 100)
}

export const unitProgress = (unit, progress) => {
  const lessons = unit?.lessons || []
  const done = lessons.filter((l) => lessonIsDone(progress, l.id)).length
  return { done, total: lessons.length, pct: lessons.length ? Math.round((done / lessons.length) * 100) : 0 }
}

export const courseProgress = (course, progress) => {
  const lessons = allLessons(course)
  const done = lessons.filter((l) => lessonIsDone(progress, l.id)).length
  const minutes = lessons.filter((l) => lessonIsDone(progress, l.id)).reduce((t, l) => t + (l.minutes || 0), 0)
  return { done, total: lessons.length, minutes, pct: lessons.length ? Math.round((done / lessons.length) * 100) : 0 }
}

/* ------------------------- Déverrouillage ------------------------- */

/** Une unité s'ouvre quand l'unité précédente est maîtrisée à 60 %. */
export const isUnitUnlocked = (course, unitIndex, progress) => {
  if (unitIndex <= 0) return true
  const prev = course.units[unitIndex - 1]
  return unitProgress(prev, progress).pct >= 60
}

export const isLessonUnlocked = (course, lesson, progress) => {
  if (!isUnitUnlocked(course, lesson.unitIndex, progress)) return false
  if (lesson.lessonIndex === 0) return true
  const unit = course.units[lesson.unitIndex]
  const prev = unit.lessons[lesson.lessonIndex - 1]
  return lessonIsDone(progress, prev.id)
}

/** Prochaine leçon à travailler (première non terminée déverrouillée). */
export const nextLesson = (course, progress) => {
  const lessons = allLessons(course)
  return (
    lessons.find((l) => isLessonUnlocked(course, l, progress) && !lessonIsDone(progress, l.id)) ||
    lessons.find((l) => !lessonIsDone(progress, l.id)) ||
    null
  )
}

/* ------------------------------- XP ------------------------------- */

export const XP_PER_STEP = 6
export const XP_LESSON_BONUS = 20

export const xpForLesson = (lesson) => (lesson?.steps?.length || 0) * XP_PER_STEP + XP_LESSON_BONUS

const LEVELS = [
  { min: 0, title: 'Figurant' },
  { min: 120, title: 'Silhouette' },
  { min: 320, title: 'Second rôle' },
  { min: 640, title: 'Premier rôle' },
  { min: 1100, title: 'Tête d\'affiche' },
  { min: 1800, title: 'Maître de scène' },
  { min: 2800, title: 'Légende' },
]

export const levelFromXp = (xp = 0) => {
  let idx = 0
  LEVELS.forEach((l, i) => {
    if (xp >= l.min) idx = i
  })
  const current = LEVELS[idx]
  const next = LEVELS[idx + 1] || null
  const span = next ? next.min - current.min : 1
  const into = xp - current.min
  return {
    level: idx + 1,
    title: current.title,
    nextTitle: next?.title || null,
    toNext: next ? next.min - xp : 0,
    pct: next ? Math.min(100, Math.round((into / span) * 100)) : 100,
  }
}

/* --------------------- Journal quotidien --------------------- */

export const bumpDailyLog = (log = {}, { lessons = 0, minutes = 0, xp = 0 } = {}) => {
  const key = dayKey()
  const day = log[key] || { lessons: 0, minutes: 0, xp: 0 }
  return {
    ...log,
    [key]: {
      lessons: day.lessons + lessons,
      minutes: day.minutes + minutes,
      xp: day.xp + xp,
    },
  }
}

/** Série de jours consécutifs avec au moins une leçon. */
export const learningStreak = (log = {}) => {
  const keys = Object.keys(log).filter((k) => (log[k]?.lessons || 0) > 0).sort()
  if (!keys.length) return { current: 0, best: 0, lastDay: null }
  let best = 1
  let run = 1
  for (let i = 1; i < keys.length; i += 1) {
    if (daysBetween(keys[i - 1], keys[i]) === 1) run += 1
    else run = 1
    best = Math.max(best, run)
  }
  const today = dayKey()
  const lastDay = keys[keys.length - 1]
  const gap = daysBetween(lastDay, today)
  const current = gap <= 1 ? run : 0
  return { current, best: Math.max(best, current), lastDay }
}

/* ------------------ Répétition espacée (révisions) ------------------ */

const BOXES = [1, 3, 7, 21, 60]

export const scheduleReview = (reviews = {}, itemId, correct = true) => {
  const prev = reviews[itemId] || { box: 0 }
  const box = correct ? Math.min(BOXES.length - 1, prev.box + 1) : 0
  const due = dayKey(addDays(new Date(), BOXES[box]))
  return { ...reviews, [itemId]: { box, due, lastAt: dayKey() } }
}

export const dueReviews = (reviews = {}, limit = 20) => {
  const today = dayKey()
  return Object.entries(reviews)
    .filter(([, v]) => v.due <= today)
    .slice(0, limit)
    .map(([id]) => id)
}

/* --------------------------- Recherche --------------------------- */

export const searchLessons = (course, query) => {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return []
  return allLessons(course).filter((l) => {
    const hay = [l.title, l.goal, l.unitTitle, ...(l.tags || [])].join(' ').toLowerCase()
    return hay.includes(q)
  })
}
