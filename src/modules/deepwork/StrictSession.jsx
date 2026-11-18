import { useEffect, useState } from 'react'
import Icon from '../../components/ui/Icon'
import { Button, Chip } from '../../components/ui/Primitives'
import { useApp } from '../../context/AppContext'
import { FOCUS_QUOTES, packageLabel } from '../../data/deepwork'
import { guardPermissions, guardSupported, guardOpenSettings, WEB_PERMISSIONS } from '../../lib/focusGuard'
import { useNow } from '../../hooks/useDeepWorkTimer'
import { clamp, cx, formatClock } from '../../lib/utils'
import { ExitDialog } from './ExitDialog'

/**
 * StrictSession — l'écran de verrouillage plein écran affiché dans METHOD
 * pendant un bloc verrouillé. Le vrai blocage du téléphone est assuré par la
 * couche native ; cet écran est la face visible de la session : décompte,
 * tentatives de contournement, appels autorisés, sortie de secours.
 */
export const StrictSession = () => {
  const { state, stopDeepWork, abandonDeepWork } = useApp()
  const session = state.deepWork?.activeSession
  const [perms, setPerms] = useState(WEB_PERMISSIONS)
  const [exitOpen, setExitOpen] = useState(false)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const now = useNow(1000, Boolean(session))

  const durationMinutes = session?.durationMinutes || 90
  const totalSeconds = durationMinutes * 60
  const endAt = (session?.startedAt || 0) + totalSeconds * 1000
  const remaining = Math.max(0, Math.floor((endAt - now) / 1000))
  const elapsedSeconds = Math.max(0, totalSeconds - remaining)
  const progress = totalSeconds ? clamp((elapsedSeconds / totalSeconds) * 100) : 0
  const blocked = session?.blocked || 0

  /* Autorisations : re-vérifiées régulièrement (l'utilisateur peut revenir des
     réglages Android sans recharger l'app). */
  useEffect(() => {
    if (!guardSupported()) return undefined
    let alive = true
    const refresh = () => guardPermissions().then((p) => alive && setPerms(p || WEB_PERMISSIONS))
    refresh()
    const id = setInterval(refresh, 20000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

  /* Rotation lente des citations. */
  useEffect(() => {
    const id = setInterval(() => setQuoteIndex((i) => (i + 1) % FOCUS_QUOTES.length), 26000)
    return () => clearInterval(id)
  }, [])

  /* Fin du bloc : on clôture immédiatement si l'app est au premier plan. */
  useEffect(() => {
    if (session && remaining <= 0) stopDeepWork()
  }, [session, remaining, stopDeepWork])

  if (!session) return null

  const ringSize = 244
  const ringStroke = 10
  const ringR = (ringSize - ringStroke) / 2
  const ringC = 2 * Math.PI * ringR
  const ringOffset = ringC - (progress / 100) * ringC
  const accessibilityMissing = guardSupported() && !perms.accessibility

  return (
    <div className="app-bg fixed inset-0 z-40 flex flex-col overflow-hidden">
      {/* ------------------------------ En-tête ------------------------------ */}
      <header className="flex items-center justify-between gap-3 px-5 pt-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-200">
            <Icon name="LockKeyhole" size={15} />
          </span>
          <div className="leading-tight">
            <div className="display gold-text text-sm font-semibold tracking-wide">METHOD</div>
            <div className="text-[10px] font-semibold tracking-[0.22em] text-ash uppercase">Bloc verrouillé</div>
          </div>
        </div>
        <Chip tone={accessibilityMissing ? 'blood' : 'jade'} icon={accessibilityMissing ? 'ShieldOff' : 'ShieldCheck'}>
          {accessibilityMissing ? 'Blocage inactif' : 'Blocage actif'}
        </Chip>
      </header>

      {accessibilityMissing && (
        <div className="mx-5 mt-3 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[12px] leading-relaxed text-rose-100">
          <Icon name="ShieldOff" size={15} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            Le service d'accessibilité METHOD est désactivé : les autres applications ne sont pas réellement bloquées.
          </div>
          <Button size="sm" variant="danger" onClick={() => guardOpenSettings('accessibility')}>
            Réparer
          </Button>
        </div>
      )}

      {/* ------------------------------ Corps ------------------------------ */}
      <main className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-6">
        <div className="relative" style={{ width: ringSize, height: ringSize }}>
          <svg width={ringSize} height={ringSize} className="-rotate-90">
            <circle cx={ringSize / 2} cy={ringSize / 2} r={ringR} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={ringStroke} />
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringR}
              fill="none"
              stroke="#cfa851"
              strokeWidth={ringStroke}
              strokeLinecap="round"
              strokeDasharray={ringC}
              strokeDashoffset={ringOffset}
              style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="display font-mono text-5xl leading-none text-gold-100 tabular-nums">{formatClock(remaining)}</span>
            <span className="mt-2 text-[10.5px] font-semibold tracking-[0.2em] text-ash uppercase">restant</span>
            <span className="mt-3 text-[11px] text-ash/80">{Math.round(progress)} % accompli</span>
          </div>
        </div>

        {session.intent && (
          <div className="max-w-md text-center">
            <div className="eyebrow mb-1">Intention du bloc</div>
            <p className="display text-lg leading-snug text-ivory">{session.intent}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Chip tone="jade" icon="PhoneCall">
            Appels autorisés
          </Chip>
          <Chip tone="slate" icon="BellOff">
            Notifications coupées
          </Chip>
          {perms.deviceOwner ? (
            <Chip tone="jade" icon="Crown">
              Désinstallation impossible
            </Chip>
          ) : perms.deviceAdmin ? (
            <Chip tone="gold" icon="ShieldCheck">
              Désinstallation dissuadée
            </Chip>
          ) : (
            <Chip tone="slate" icon="ShieldOff">
              Anti-désinstallation inactif
            </Chip>
          )}
        </div>

        <div
          className={cx(
            'flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12px]',
            blocked > 0 ? 'border-rose-500/30 bg-rose-500/8 text-rose-100' : 'border-white/8 bg-white/3 text-ash',
          )}
        >
          <Icon name={blocked > 0 ? 'Ban' : 'CircleDot'} size={13} />
          {blocked > 0 ? (
            <span>
              <strong>{blocked}</strong> tentative{blocked > 1 ? 's' : ''} de contournement bloquée{blocked > 1 ? 's' : ''}
              {state.deepWork?.guard?.lastBlockedPackage ? ` · ${packageLabel(state.deepWork.guard.lastBlockedPackage)}` : ''}
            </span>
          ) : (
            <span>Aucune tentative de contournement</span>
          )}
        </div>

        <p className="max-w-lg text-center text-[13px] leading-relaxed text-ash italic">« {FOCUS_QUOTES[quoteIndex]} »</p>
      </main>

      {/* ------------------------------ Pied ------------------------------ */}
      <footer className="flex flex-col items-center gap-2 px-6 pb-7">
        <Button variant="ghost" icon="LogOut" onClick={() => setExitOpen(true)}>
          Sortie de secours
        </Button>
        <p className="text-center text-[11px] text-ash/70">
          Une sortie existe, mais elle est volontairement difficile. Les appels restent toujours possibles.
        </p>
      </footer>

      <ExitDialog
        open={exitOpen}
        onClose={() => setExitOpen(false)}
        onConfirm={(action) => {
          setExitOpen(false)
          if (action === 'abandon') abandonDeepWork('friction')
        }}
        elapsedLabel={formatClock(elapsedSeconds)}
        blocked={blocked}
      />
    </div>
  )
}

export default StrictSession
