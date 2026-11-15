import { useEffect, useState } from 'react'
import Logo from './Logo'
import { PinDots, PinKeypad } from './PinKeypad'
import Icon from './ui/Icon'
import { useApp } from '../context/AppContext'
import { cx, formatLongDate } from '../lib/utils'

const MAX_ATTEMPTS = 5

export const LockScreen = () => {
  const { state, unlock } = useApp()
  const profile = state.profile
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [shake, setShake] = useState(false)

  const length = state.security.pinLength || 4
  const lockedOut = attempts >= MAX_ATTEMPTS

  useEffect(() => {
    if (pin.length !== length || busy || lockedOut) return undefined
    let cancelled = false
    setBusy(true)
    unlock(pin).then((ok) => {
      if (cancelled) return
      if (!ok) {
        setError(true)
        setShake(true)
        setAttempts((a) => a + 1)
        setTimeout(() => {
          setPin('')
          setError(false)
          setShake(false)
        }, 620)
      }
      setBusy(false)
    })
    return () => {
      cancelled = true
    }
  }, [pin, length, busy, lockedOut, unlock])

  const handleDigit = (d) => {
    if (pin.length >= length || busy || lockedOut) return
    setPin((p) => p + d)
  }

  const remaining = MAX_ATTEMPTS - attempts

  return (
    <div className="app-bg safe-top safe-bottom relative flex min-h-full flex-col items-center justify-between px-6 py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold-500/10 blur-3xl" />
      </div>

      <header className="relative z-10 flex flex-col items-center gap-3 pt-6 text-center">
        <Logo size={76} />
        <div>
          <h1 className="display text-3xl tracking-[0.16em] text-gold-100">METHOD</h1>
          <p className="eyebrow mt-1">Incarné · Sécurisé · Hors-ligne</p>
        </div>
        <p className="mt-1 text-[12px] text-ash capitalize">{formatLongDate()}</p>
      </header>

      <main className={cx('relative z-10 w-full max-w-xs', shake && 'anim-shake')}>
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-[12px] text-ash">
            <Icon name="Fingerprint" size={14} className="text-gold-300" />
            <span>{profile?.name ? `Bon retour, ${profile.name}` : 'Entre ton code'}</span>
          </div>
          <PinDots length={length} filled={pin.length} error={error} />
          <div className="h-4 text-center">
            {error && !lockedOut && (
              <p className="text-[11.5px] font-medium text-rose-300">
                Code incorrect — {remaining} essai{remaining > 1 ? 's' : ''} restant{remaining > 1 ? 's' : ''}
              </p>
            )}
            {lockedOut && (
              <p className="text-[11.5px] font-medium text-rose-300">
                Trop de tentatives. Ferme puis rouvre l'application.
              </p>
            )}
          </div>
        </div>

        <PinKeypad
          length={length}
          value={pin}
          onDigit={handleDigit}
          onDelete={() => setPin((p) => p.slice(0, -1))}
          disabled={busy || lockedOut}
        />
      </main>

      <footer className="relative z-10 flex flex-col items-center gap-1.5 pb-2 text-center">
        <div className="flex items-center gap-1.5 text-[10.5px] text-ash/70">
          <Icon name="ShieldCheck" size={12} />
          <span>Code haché localement · aucune donnée envoyée</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10.5px] text-ash/50">
          <Icon name="HardDrive" size={12} />
          <span>100 % stocké sur ton appareil</span>
        </div>
      </footer>
    </div>
  )
}

export default LockScreen
