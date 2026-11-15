import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { defaultState, DEMO_TASKS } from '../data/defaults'
import { PILLARS, emptyPillars } from '../data/tracks'
import { hashPin, verifyPin as verifyPinHash } from '../lib/crypto'
import {
  buildExportPayload,
  downloadJson,
  loadState,
  mergeImported,
  saveBackup,
  saveState,
  wipeAll,
} from '../lib/storage'
import { clamp, dayKey, daysBetween, sum, uid } from '../lib/utils'

const AppContext = createContext(null)

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp doit être utilisé dans <AppProvider>')
  return ctx
}

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    const stored = loadState()
    if (!stored) return { ...defaultState(), tasks: DEMO_TASKS }
    return { ...defaultState(), ...stored, tasks: stored.tasks || DEMO_TASKS }
  })

  const [locked, setLocked] = useState(false)
  const [booted, setBooted] = useState(false)
  const hiddenAt = useRef(null)

  /* --------------------- Persistance --------------------- */
  useEffect(() => {
    saveState(state)
    saveBackup(state)
  }, [state])

  /* --------------------- Verrouillage --------------------- */
  useEffect(() => {
    if (!state.security.pinEnabled) {
      setLocked(false)
    } else if (!booted) {
      setLocked(true)
    }
  }, [state.security.pinEnabled, booted])

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt.current = Date.now()
      } else if (hiddenAt.current && state.security.pinEnabled) {
        const away = (Date.now() - hiddenAt.current) / 60000
        if (away >= (state.security.autoLockMinutes ?? 5)) setLocked(true)
        hiddenAt.current = null
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [state.security.pinEnabled, state.security.autoLockMinutes])

  /* --------------------- Passage de journée --------------------- */
  useEffect(() => {
    const today = dayKey()
    if (state.today?.date && state.today.date !== today) {
      setState((s) => {
        const previous = s.today
        const prevPillars = previous.pillars || emptyPillars()
        const targetSum = sum(PILLARS, (p) => s.pillars[p.id] || 0)
        const doneSum = sum(PILLARS, (p) => prevPillars[p.id] || 0)
        const rate = targetSum ? clamp(Math.round((doneSum / targetSum) * 100)) : 0
        const last = s.streak?.lastDay
        const gap = last ? daysBetween(last, previous.date) : null
        const continued = gap === 1 || last === previous.date
        return {
          ...s,
          history: { ...s.history, [previous.date]: { pillars: prevPillars, incarnRate: rate } },
          today: { date: today, pillars: emptyPillars() },
          streak: {
            ...s.streak,
            current: rate >= 50 ? (continued ? (s.streak.current || 0) + 1 : 1) : 0,
            best: Math.max(s.streak.best || 0, rate >= 50 ? (continued ? (s.streak.current || 0) + 1 : 1) : 0),
            lastDay: previous.date,
          },
        }
      })
    }
  }, [state.today?.date, state.pillars, state.streak])

  /* --------------------- Dérivés --------------------- */
  const derived = useMemo(() => {
    const pillarsToday = state.today?.pillars || emptyPillars()
    const targets = state.pillars || {}
    const targetSum = sum(PILLARS, (p) => targets[p.id] || 0)
    const doneSum = sum(PILLARS, (p) => Math.min(pillarsToday[p.id] || 0, targets[p.id] || 0))
    const incarnRate = targetSum ? clamp(Math.round((doneSum / targetSum) * 100)) : 0

    const todayMinutes = pillarsToday.code || 0

    const openProjects = (state.projects || []).filter((p) => p.status === 'open')
    const openLoops = openProjects.length
    const openTasks = (state.tasks || []).filter((t) => !t.done).length

    const brokenPillars = PILLARS.filter(
      (p) => (pillarsToday[p.id] || 0) < (targets[p.id] || 0) * 0.5,
    ).map((p) => p.short)

    const journaledToday = (state.journal || []).some((j) => j.date === dayKey())

    return {
      pillarsToday,
      targets,
      incarnRate,
      todayMinutes,
      openLoops,
      openTasks,
      openProjects,
      brokenPillars,
      journaledToday,
    }
  }, [state])

  /* --------------------- Actions --------------------- */
  const setPillarValue = useCallback((pillarId, value) => {
    setState((s) => ({
      ...s,
      today: {
        ...s.today,
        date: dayKey(),
        pillars: { ...(s.today?.pillars || emptyPillars()), [pillarId]: Math.max(0, Number(value) || 0) },
      },
    }))
  }, [])

  const addPillarValue = useCallback((pillarId, delta) => {
    setState((s) => {
      const current = s.today?.pillars?.[pillarId] || 0
      return {
        ...s,
        today: {
          ...s.today,
          date: dayKey(),
          pillars: { ...(s.today?.pillars || emptyPillars()), [pillarId]: Math.max(0, current + delta) },
        },
      }
    })
  }, [])

  const setTarget = useCallback((pillarId, value) => {
    setState((s) => ({ ...s, pillars: { ...s.pillars, [pillarId]: Math.max(1, Number(value) || 1) } }))
  }, [])

  /* --- Deep Work --- */
  const startDeepWork = useCallback((intent = '') => {
    setState((s) => ({
      ...s,
      deepWork: {
        ...s.deepWork,
        activeSession: { startedAt: Date.now(), intent, blockIndex: (s.deepWork.sessions || []).length + 1 },
      },
    }))
  }, [])

  const cancelDeepWork = useCallback(() => {
    setState((s) => ({ ...s, deepWork: { ...s.deepWork, activeSession: null } }))
  }, [])

  const stopDeepWork = useCallback(({ addToPillar = true } = {}) => {
    setState((s) => {
      const active = s.deepWork.activeSession
      if (!active) return s
      const minutes = Math.max(1, Math.round((Date.now() - active.startedAt) / 60000))
      const session = {
        id: uid('dw'),
        date: dayKey(),
        minutes,
        intent: active.intent,
        startedAt: new Date(active.startedAt).toISOString(),
        endedAt: new Date().toISOString(),
      }
      const pillars = { ...(s.today?.pillars || emptyPillars()) }
      if (addToPillar) pillars.code = (pillars.code || 0) + minutes
      return {
        ...s,
        today: { ...s.today, date: dayKey(), pillars },
        deepWork: {
          ...s.deepWork,
          activeSession: null,
          sessions: [session, ...(s.deepWork.sessions || [])].slice(0, 300),
          totalMinutes: (s.deepWork.totalMinutes || 0) + minutes,
        },
      }
    })
  }, [])

  /* --- Tâches --- */
  const addTask = useCallback((title, pillar = 'code', projectId = null) => {
    if (!title?.trim()) return
    setState((s) => ({
      ...s,
      tasks: [{ id: uid('tsk'), title: title.trim(), done: false, pillar, projectId, createdAt: new Date().toISOString() }, ...(s.tasks || [])],
    }))
  }, [])

  const toggleTask = useCallback((id) => {
    setState((s) => ({
      ...s,
      tasks: (s.tasks || []).map((t) => (t.id === id ? { ...t, done: !t.done, doneAt: !t.done ? new Date().toISOString() : null } : t)),
    }))
  }, [])

  const removeTask = useCallback((id) => {
    setState((s) => ({ ...s, tasks: (s.tasks || []).filter((t) => t.id !== id) }))
  }, [])

  /* --- Projets / Open Loops --- */
  const addProject = useCallback((project) => {
    setState((s) => ({
      ...s,
      projects: [
        {
          id: uid('prj'),
          title: project.title?.trim() || 'Projet sans nom',
          type: project.type || 'Code',
          status: 'open',
          progress: clamp(Number(project.progress) || 0),
          nextStep: project.nextStep || '',
          note: project.note || '',
          deployedUrl: '',
          priority: Number(project.priority) || 2,
          createdAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
          finishedAt: null,
        },
        ...(s.projects || []),
      ],
    }))
  }, [])

  const updateProject = useCallback((id, patch) => {
    setState((s) => ({
      ...s,
      projects: (s.projects || []).map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))
  }, [])

  const finishProject = useCallback((id, proof = '') => {
    setState((s) => {
      const project = (s.projects || []).find((p) => p.id === id)
      if (!project) return s
      const finished = {
        ...project,
        status: 'done',
        progress: 100,
        finishedAt: new Date().toISOString(),
        proof,
      }
      return {
        ...s,
        projects: (s.projects || []).filter((p) => p.id !== id),
        finishedProjects: [finished, ...(s.finishedProjects || [])],
      }
    })
  }, [])

  const reopenProject = useCallback((id) => {
    setState((s) => {
      const project = (s.finishedProjects || []).find((p) => p.id === id)
      if (!project) return s
      return {
        ...s,
        finishedProjects: (s.finishedProjects || []).filter((p) => p.id !== id),
        projects: [{ ...project, status: 'open', finishedAt: null }, ...(s.projects || [])],
      }
    })
  }, [])

  const removeProject = useCallback((id) => {
    setState((s) => ({
      ...s,
      projects: (s.projects || []).filter((p) => p.id !== id),
      finishedProjects: (s.finishedProjects || []).filter((p) => p.id !== id),
    }))
  }, [])

  /* --- Gym / Exercices --- */
  const toggleExercise = useCallback((exerciseId) => {
    const today = dayKey()
    setState((s) => {
      const log = { ...(s.exerciseLog || {}) }
      const done = new Set(log[today] || [])
      if (done.has(exerciseId)) done.delete(exerciseId)
      else done.add(exerciseId)
      log[today] = [...done]
      return { ...s, exerciseLog: log }
    })
  }, [])

  const isExerciseDone = useCallback(
    (exerciseId) => (state.exerciseLog?.[dayKey()] || []).includes(exerciseId),
    [state.exerciseLog],
  )

  /* --- Journal --- */
  const saveJournalEntry = useCallback((entry) => {
    setState((s) => ({
      ...s,
      journal: [
        {
          id: uid('jrn'),
          date: dayKey(),
          createdAt: new Date().toISOString(),
          ...entry,
        },
        ...(s.journal || []).filter((j) => j.date !== dayKey()),
      ],
    }))
  }, [])

  const deleteJournalEntry = useCallback((id) => {
    setState((s) => ({ ...s, journal: (s.journal || []).filter((j) => j.id !== id) }))
  }, [])

  /* --- Anglais --- */
  const toggleIdiomLearned = useCallback((en) => {
    setState((s) => {
      const list = new Set(s.english?.idiomsLearned || [])
      if (list.has(en)) list.delete(en)
      else list.add(en)
      return { ...s, english: { ...s.english, idiomsLearned: [...list] } }
    })
  }, [])

  const setEnglishLevel = useCallback((level) => {
    setState((s) => ({ ...s, english: { ...s.english, level }, profile: { ...s.profile, englishLevel: level } }))
  }, [])

  /* --- Médias hors-ligne --- */
  const markMedia = useCallback((resourceId, info) => {
    setState((s) => ({
      ...s,
      media: { ...(s.media || {}), [resourceId]: info },
    }))
  }, [])

  const unmarkMedia = useCallback((resourceId) => {
    setState((s) => {
      const next = { ...(s.media || {}) }
      delete next[resourceId]
      return { ...s, media: next }
    })
  }, [])

  /* --- Réglages / Profil / Sécurité --- */
  const updateSettings = useCallback((patch) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
  }, [])

  const updateProfile = useCallback((patch) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }))
  }, [])

  const updateSecurity = useCallback((patch) => {
    setState((s) => ({ ...s, security: { ...s.security, ...patch } }))
  }, [])

  const setPin = useCallback(async (pin) => {
    const { salt, hash } = await hashPin(pin)
    setState((s) => ({
      ...s,
      security: {
        ...s.security,
        pinEnabled: true,
        pinHash: hash,
        pinSalt: salt,
        pinLength: String(pin).length,
        failedAttempts: 0,
      },
    }))
    return true
  }, [])

  const changePin = useCallback(
    async (currentPin, newPinValue) => {
      const ok = await verifyPinHash(currentPin, {
        salt: state.security.pinSalt,
        hash: state.security.pinHash,
      })
      if (!ok) return false
      await setPin(newPinValue)
      return true
    },
    [state.security.pinSalt, state.security.pinHash, setPin],
  )

  const disablePin = useCallback(async (currentPin) => {
    const ok = await verifyPinHash(currentPin, {
      salt: state.security.pinSalt,
      hash: state.security.pinHash,
    })
    if (!ok) return false
    setState((s) => ({
      ...s,
      security: { ...s.security, pinEnabled: false, pinHash: null, pinSalt: null },
    }))
    setLocked(false)
    return true
  }, [state.security.pinSalt, state.security.pinHash])

  const unlock = useCallback(
    async (pin) => {
      const ok = await verifyPinHash(pin, {
        salt: state.security.pinSalt,
        hash: state.security.pinHash,
      })
      if (ok) {
        setState((s) => ({
          ...s,
          security: { ...s.security, failedAttempts: 0, lastUnlockAt: new Date().toISOString() },
        }))
        setLocked(false)
        return true
      }
      setState((s) => ({
        ...s,
        security: { ...s.security, failedAttempts: (s.security.failedAttempts || 0) + 1 },
      }))
      return false
    },
    [state.security.pinSalt, state.security.pinHash],
  )

  const lock = useCallback(() => {
    if (state.security.pinEnabled) setLocked(true)
  }, [state.security.pinEnabled])

  const completeOnboarding = useCallback((profile) => {
    setState((s) => ({
      ...s,
      profile: { ...s.profile, ...profile },
      ui: { ...s.ui, seenOnboarding: true },
    }))
    setBooted(true)
  }, [])

  const setLastModule = useCallback((moduleId) => {
    setState((s) => ({ ...s, ui: { ...s.ui, lastModule: moduleId } }))
  }, [])

  /* --- Sauvegarde --- */
  const exportData = useCallback(() => {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    downloadJson(`method-sauvegarde-${stamp}.json`, buildExportPayload(state))
  }, [state])

  const importData = useCallback((raw) => {
    const merged = mergeImported(raw, defaultState())
    setState({ ...merged, tasks: merged.tasks || [] })
    setBooted(true)
    return true
  }, [])

  const resetAll = useCallback(() => {
    wipeAll()
    const fresh = { ...defaultState(), tasks: [] }
    setState(fresh)
    setLocked(false)
    setBooted(false)
  }, [])

  const value = useMemo(
    () => ({
      state,
      setState,
      derived,
      locked,
      setLocked,
      booted,
      setBooted,
      // actions
      setPillarValue,
      addPillarValue,
      setTarget,
      startDeepWork,
      stopDeepWork,
      cancelDeepWork,
      addTask,
      toggleTask,
      removeTask,
      addProject,
      updateProject,
      finishProject,
      reopenProject,
      removeProject,
      toggleExercise,
      isExerciseDone,
      saveJournalEntry,
      deleteJournalEntry,
      toggleIdiomLearned,
      setEnglishLevel,
      markMedia,
      unmarkMedia,
      updateSettings,
      updateProfile,
      updateSecurity,
      setPin,
      changePin,
      disablePin,
      unlock,
      lock,
      completeOnboarding,
      setLastModule,
      exportData,
      importData,
      resetAll,
    }),
    [
      state,
      derived,
      locked,
      booted,
      setPillarValue,
      addPillarValue,
      setTarget,
      startDeepWork,
      stopDeepWork,
      cancelDeepWork,
      addTask,
      toggleTask,
      removeTask,
      addProject,
      updateProject,
      finishProject,
      reopenProject,
      removeProject,
      toggleExercise,
      isExerciseDone,
      saveJournalEntry,
      deleteJournalEntry,
      toggleIdiomLearned,
      setEnglishLevel,
      markMedia,
      unmarkMedia,
      updateSettings,
      updateProfile,
      updateSecurity,
      setPin,
      changePin,
      disablePin,
      unlock,
      lock,
      completeOnboarding,
      setLastModule,
      exportData,
      importData,
      resetAll,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
