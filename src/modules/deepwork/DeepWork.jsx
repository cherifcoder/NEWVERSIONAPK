import { useCallback, useEffect, useMemo, useState } from 'react'
import Icon from '../../components/ui/Icon'
import {
  Button,
  Chip,
  EmptyState,
  Labeled,
  Panel,
  ProgressBar,
  SectionTitle,
  Stat,
  Tabs,
  Toast,
} from '../../components/ui/Primitives'
import { useApp } from '../../context/AppContext'
import { DEEP_WORK_DURATIONS, packageLabel } from '../../data/deepwork'
import {
  guardPermissions,
  guardSetWhitelist,
  guardSupported,
  guardWhitelist,
  WEB_PERMISSIONS,
} from '../../lib/focusGuard'
import { useDeepWorkClock } from '../../hooks/useDeepWorkTimer'
import { cx, formatClock, formatLongDate, formatMinutes } from '../../lib/utils'
import { GuardSetup } from './GuardSetup'

const TABS = [
  { id: 'session', label: 'Session', icon: 'Timer' },
  { id: 'reglages', label: 'Réglages', icon: 'SlidersHorizontal' },
  { id: 'historique', label: 'Historique', icon: 'ListChecks' },
]

const EXIT_REASONS = {
  friction: 'Sortie de secours',
  cancelled: 'Abandon manuel',
  expired: 'Fin automatique',
}

const parsePackages = (raw) =>
  String(raw || '')
    .split(/[\s,;]+/)
    .map((p) => p.trim())
    .filter(Boolean)

export const DeepWork = ({ onNavigate }) => {
  const { state, startDeepWork, stopDeepWork, cancelDeepWork, updateGuardPrefs, setGuardWhitelist } = useApp()

  const deepWork = state.deepWork || {}
  const guard = deepWork.guard || {}
  const session = deepWork.activeSession
  const clock = useDeepWorkClock(session)
  const supported = guardSupported()

  const [tab, setTab] = useState('session')
  const [intent, setIntent] = useState('')
  const [duration, setDuration] = useState(guard.duration || 90)
  const [guardOn, setGuardOn] = useState(guard.enabled ?? true)
  const [perms, setPerms] = useState(WEB_PERMISSIONS)
  const [whitelistText, setWhitelistText] = useState((guard.whitelist || []).join(', '))
  const [baseWhitelist, setBaseWhitelist] = useState([])
  const [toast, setToast] = useState('')

  const refreshGuard = useCallback(async () => {
    if (!supported) {
      setPerms(WEB_PERMISSIONS)
      return
    }
    const [p, w] = await Promise.all([guardPermissions(), guardWhitelist()])
    setPerms(p || WEB_PERMISSIONS)
    setBaseWhitelist(parsePackages(w?.base))
  }, [supported])

  /* Autorisations système : à l'ouverture, au retour au premier plan, et
     périodiquement (l'utilisateur revient des réglages Android). */
  useEffect(() => {
    refreshGuard()
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshGuard()
    }
    document.addEventListener('visibilitychange', onVisible)
    const id = setInterval(refreshGuard, 15000)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      clearInterval(id)
    }
  }, [refreshGuard])

  useEffect(() => {
    setWhitelistText((guard.whitelist || []).join(', '))
  }, [guard.whitelist])

  const stats = useMemo(
    () => ({
      blocks: (deepWork.sessions || []).length,
      totalMinutes: deepWork.totalMinutes || 0,
      blockedCount: deepWork.blockedCount || 0,
      exits: (deepWork.exits || []).length,
    }),
    [deepWork.sessions, deepWork.totalMinutes, deepWork.blockedCount, deepWork.exits],
  )

  const launch = (withGuard) => {
    if (!intent.trim()) return
    startDeepWork(intent.trim(), { guard: withGuard, duration })
    updateGuardPrefs({ duration, enabled: withGuard })
    setIntent('')
    if (withGuard && supported && !perms.accessibility) {
      setToast("Bloc lancé, mais le service d'accessibilité est requis pour bloquer le téléphone.")
    }
  }

  const saveWhitelist = async () => {
    const list = parsePackages(whitelistText)
    setGuardWhitelist(list)
    await guardSetWhitelist(list.join(','))
    setToast('Liste blanche enregistrée.')
  }

  /* ------------------ Session en cours (sans verrouillage strict) ------------------ */
  if (session && !session.guard) {
    return (
      <div className="space-y-4">
        <SectionTitle
          eyebrow="Deep Work"
          title="Bloc en cours"
          subtitle="Session sans verrouillage strict : le minuteur tourne, le téléphone reste accessible."
          icon="Timer"
        />
        <Panel>
          <div className="flex flex-col items-center gap-4 py-4">
            <span className="display font-mono text-5xl text-gold-100 tabular-nums">{formatClock(clock.seconds)}</span>
            {session.intent && <p className="text-center text-[13px] text-ash italic">« {session.intent} »</p>}
            <ProgressBar value={clock.blockProgress} className="max-w-sm" />
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="gold" icon="Square" onClick={() => stopDeepWork({ addToPillar: true })}>
                Terminer le bloc
              </Button>
              <Button variant="danger" icon="X" onClick={() => cancelDeepWork()}>
                Annuler
              </Button>
            </div>
          </div>
        </Panel>
        <GuardSetup perms={perms} onRefresh={refreshGuard} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <SectionTitle
        eyebrow="Module · Focus"
        title="Deep Work verrouillé"
        subtitle="Un bloc de travail profond pendant lequel le téléphone est bloqué : réseaux sociaux, navigateurs, Paramètres et Play Store sont interceptés. Les appels restent entièrement fonctionnels."
        icon="ShieldAlert"
        right={
          <Chip tone={supported ? (perms.accessibility ? 'jade' : 'gold') : 'slate'} icon="Smartphone">
            {supported ? (perms.accessibility ? 'Prêt' : 'À configurer') : 'Web'}
          </Chip>
        }
      />

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {/* ------------------------------ Onglet Session ------------------------------ */}
      {tab === 'session' && (
        <div className="space-y-4">
          <Panel>
            <div className="eyebrow mb-1 flex items-center gap-2">
              <Icon name="Target" size={13} />
              Nouveau bloc
            </div>
            <p className="text-[12.5px] leading-relaxed text-ash">
              Définis ton intention, choisis la durée, puis lance. Une fois lancé, seuls un appel ou la sortie de secours
              interrompent le bloc.
            </p>

            <div className="mt-4">
              <Labeled label="Intention du bloc" hint="Une seule tâche. Écris-la à l'impératif.">
                <input
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  placeholder="Ex. : écrire l'API d'authentification"
                  className="field"
                />
              </Labeled>
            </div>

            <div className="mt-4">
              <div className="mb-2 text-[11.5px] font-semibold tracking-wide text-gold-200/90">Durée</div>
              <div className="flex flex-wrap gap-2">
                {DEEP_WORK_DURATIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDuration(d.id)}
                    className={cx(
                      'rounded-xl border px-3 py-2 text-left transition',
                      duration === d.id
                        ? 'border-gold-500/45 bg-gold-500/15 text-gold-100'
                        : 'border-white/8 bg-white/3 text-ash hover:border-gold-500/25 hover:text-ivory',
                    )}
                  >
                    <div className="text-[13px] font-semibold">{d.label}</div>
                    <div className="text-[10.5px] opacity-70">{d.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setGuardOn((v) => !v)}
              className={cx(
                'mt-4 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition',
                guardOn ? 'border-gold-500/35 bg-gold-500/10' : 'border-white/8 bg-white/3',
              )}
            >
              <span
                className={cx(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
                  guardOn ? 'border-gold-500/40 bg-gold-500/15 text-gold-200' : 'border-white/10 bg-white/5 text-ash',
                )}
              >
                <Icon name={guardOn ? 'ShieldAlert' : 'ShieldOff'} size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-ivory">Verrouillage strict</span>
                <span className="block text-[11.5px] leading-relaxed text-ash">
                  {guardOn
                    ? 'Le téléphone est bloqué pendant le bloc. Appels autorisés.'
                    : 'Minuteur simple : aucune application bloquée.'}
                </span>
              </span>
              <span
                className={cx(
                  'h-6 w-11 shrink-0 rounded-full border transition',
                  guardOn ? 'border-gold-500/50 bg-gold-500/30' : 'border-white/12 bg-white/6',
                )}
              >
                <span
                  className={cx(
                    'mt-0.5 block h-5 w-5 rounded-full bg-gold-200 transition',
                    guardOn ? 'translate-x-5' : 'translate-x-0.5',
                  )}
                />
              </span>
            </button>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="gold" size="lg" icon="ShieldAlert" onClick={() => launch(true)} disabled={!intent.trim()}>
                Lancer le bloc verrouillé
              </Button>
              <Button variant="ghost" icon="Timer" onClick={() => launch(false)} disabled={!intent.trim()}>
                Minuteur simple
              </Button>
            </div>
          </Panel>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Blocs" value={stats.blocks} icon="Layers" />
            <Stat label="Temps profond" value={formatMinutes(stats.totalMinutes)} icon="Clock" tone="jade" />
            <Stat label="Blocages" value={stats.blockedCount} icon="Ban" tone="blood" />
            <Stat label="Sorties" value={stats.exits} icon="LogOut" tone="slate" />
          </div>

          <GuardSetup perms={perms} onRefresh={refreshGuard} compact />

          <Panel flat className="flex items-start gap-3">
            <Icon name="PhoneCall" size={16} className="mt-0.5 shrink-0 text-emerald-300" />
            <p className="text-[12px] leading-relaxed text-ash">
              <strong className="text-ivory">Exception unique — les appels.</strong> Pendant un bloc, les appels entrants et
              sortants restent 100 % fonctionnels : la surimpression s'efface dès qu'un appel sonne et l'interface d'appel
              native n'est jamais bloquée. Tout le reste est intercepté.
            </p>
          </Panel>
        </div>
      )}

      {/* ------------------------------ Onglet Réglages ------------------------------ */}
      {tab === 'reglages' && (
        <div className="space-y-4">
          <GuardSetup perms={perms} onRefresh={refreshGuard} />

          <Panel>
            <SectionTitle
              eyebrow="Réglages"
              title="Paramètres du verrouillage"
              subtitle="Ces préférences s'appliquent aux prochains blocs."
              icon="SlidersHorizontal"
            />

            <div className="mt-4">
              <div className="mb-2 text-[11.5px] font-semibold tracking-wide text-gold-200/90">Durée par défaut</div>
              <div className="flex flex-wrap gap-2">
                {DEEP_WORK_DURATIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setDuration(d.id)
                      updateGuardPrefs({ duration: d.id })
                    }}
                    className={cx(
                      'rounded-full border px-3 py-1.5 text-[12px] font-semibold transition',
                      (guard.duration || 90) === d.id
                        ? 'border-gold-500/45 bg-gold-500/15 text-gold-100'
                        : 'border-white/8 bg-white/3 text-ash hover:text-ivory',
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => updateGuardPrefs({ enabled: !(guard.enabled ?? true) })}
              className="mt-4 flex w-full items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/3 p-3 text-left"
            >
              <span>
                <span className="block text-[13px] font-semibold text-ivory">Verrouillage strict par défaut</span>
                <span className="block text-[11.5px] text-ash">Active le blocage du téléphone à chaque nouveau bloc.</span>
              </span>
              <span
                className={cx(
                  'h-6 w-11 shrink-0 rounded-full border transition',
                  (guard.enabled ?? true) ? 'border-gold-500/50 bg-gold-500/30' : 'border-white/12 bg-white/6',
                )}
              >
                <span
                  className={cx(
                    'mt-0.5 block h-5 w-5 rounded-full bg-gold-200 transition',
                    (guard.enabled ?? true) ? 'translate-x-5' : 'translate-x-0.5',
                  )}
                />
              </span>
            </button>

            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/6 p-3">
              <span className="flex items-center gap-2 text-[12.5px] text-emerald-100">
                <Icon name="PhoneCall" size={14} />
                Appels téléphoniques
              </span>
              <Chip tone="jade" icon="Lock">
                Toujours autorisés
              </Chip>
            </div>
          </Panel>

          <Panel>
            <SectionTitle
              eyebrow="Liste blanche"
              title="Applications autorisées en plus"
              subtitle="Par défaut, tout est bloqué sauf METHOD, le téléphone et l'UI système. Ajoute ici des paquets supplémentaires (séparés par des virgules)."
              icon="ListChecks"
            />
            <div className="mt-4">
              <Labeled label="Paquets supplémentaires" hint="Ex. : com.android.calculator2, com.termux">
                <textarea
                  value={whitelistText}
                  onChange={(e) => setWhitelistText(e.target.value)}
                  rows={3}
                  placeholder="com.android.calculator2, com.termux"
                  className="field font-mono text-[12px]"
                />
              </Labeled>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="gold" size="sm" icon="Save" onClick={saveWhitelist}>
                  Enregistrer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="RotateCcw"
                  onClick={() => {
                    setWhitelistText('')
                    setGuardWhitelist([])
                    guardSetWhitelist('')
                    setToast('Liste blanche réinitialisée.')
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </div>

            {baseWhitelist.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-[11.5px] font-semibold tracking-wide text-gold-200/90">
                  Liste blanche effective ({baseWhitelist.length}) — socle + tes ajouts
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {baseWhitelist.map((p) => (
                    <span
                      key={p}
                      className="rounded-md border border-white/8 bg-white/3 px-2 py-0.5 font-mono text-[10.5px] text-ash"
                    >
                      {packageLabel(p)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Panel>
        </div>
      )}

      {/* ------------------------------ Onglet Historique ------------------------------ */}
      {tab === 'historique' && (
        <div className="space-y-4">
          <Panel>
            <SectionTitle eyebrow="Historique" title="Blocs enregistrés" icon="ListChecks" />
            <div className="mt-4 space-y-2">
              {(deepWork.sessions || []).length === 0 ? (
                <EmptyState
                  icon="Timer"
                  title="Aucun bloc enregistré"
                  text="Lance ton premier bloc verrouillé : il apparaîtra ici avec sa durée et son nombre de tentatives bloquées."
                />
              ) : (
                (deepWork.sessions || []).slice(0, 40).map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 p-3">
                    <span
                      className={cx(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                        s.guarded ? 'border-gold-500/30 bg-gold-500/10 text-gold-200' : 'border-white/10 bg-white/5 text-ash',
                      )}
                    >
                      <Icon name={s.guarded ? 'ShieldAlert' : 'Timer'} size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] text-ivory">{s.intent || 'Bloc sans intention'}</div>
                      <div className="text-[11px] text-ash">
                        {formatLongDate(new Date(s.startedAt))} · {formatMinutes(s.minutes)}
                        {s.blocked > 0 ? ` · ${s.blocked} blocage${s.blocked > 1 ? 's' : ''}` : ''}
                      </div>
                    </div>
                    {s.guarded && <Chip tone="gold">Verrouillé</Chip>}
                  </div>
                ))
              )}
            </div>
          </Panel>

          <Panel>
            <SectionTitle
              eyebrow="Signal"
              title="Sorties de secours"
              subtitle="Chaque abandon est consigné. L'objectif n'est pas la culpabilité : c'est de voir le motif."
              icon="LogOut"
            />
            <div className="mt-4 space-y-2">
              {(deepWork.exits || []).length === 0 ? (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/6 p-3 text-[12.5px] text-emerald-100">
                  <Icon name="ShieldCheck" size={14} className="mr-1.5 inline" />
                  Aucune sortie de secours utilisée. Verrouillage tenu jusqu'au bout.
                </div>
              ) : (
                (deepWork.exits || []).slice(0, 20).map((e) => (
                  <div key={e.id} className="flex items-center gap-3 rounded-xl border border-rose-500/18 bg-rose-500/5 p-3">
                    <Icon name="LogOut" size={14} className="shrink-0 text-rose-300" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] text-ivory">{EXIT_REASONS[e.reason] || e.reason}</div>
                      <div className="text-[11px] text-ash">
                        {formatLongDate(new Date(e.at))} · après {formatClock(e.elapsedSeconds)}
                        {e.blocked > 0 ? ` · ${e.blocked} blocage${e.blocked > 1 ? 's' : ''}` : ''}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      )}

      {onNavigate && (
        <div className="flex justify-center pb-2">
          <Button variant="ghost" size="sm" icon="LayoutDashboard" onClick={() => onNavigate('dashboard')}>
            Retour au tableau de bord
          </Button>
        </div>
      )}

      <Toast message={toast} tone="gold" onDone={() => setToast('')} />
    </div>
  )
}

export default DeepWork
