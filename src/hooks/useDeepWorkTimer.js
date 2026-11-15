import { useEffect, useState } from 'react'

/** Horloge réactive (1 tick / seconde) — pour les chronomètres. */
export const useNow = (intervalMs = 1000, enabled = true) => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!enabled) return undefined
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs, enabled])
  return now
}

/** Chronomètre de Deep Work : lit la session active depuis le contexte. */
export const useDeepWorkClock = (activeSession) => {
  const now = useNow(1000, Boolean(activeSession))
  if (!activeSession) return { seconds: 0, minutes: 0, blockProgress: 0 }
  const seconds = Math.max(0, Math.floor((now - activeSession.startedAt) / 1000))
  const minutes = Math.floor(seconds / 60)
  return {
    seconds,
    minutes,
    blockProgress: Math.min(100, ((seconds / 60) / 90) * 100),
  }
}
