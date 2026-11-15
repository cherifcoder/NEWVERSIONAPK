import { useMemo, useState } from 'react'
import Icon from '../components/ui/Icon'
import {
  Button,
  Chip,
  EmptyState,
  Labeled,
  Modal,
  Panel,
  ProgressBar,
  ProgressRing,
  SectionTitle,
  Stat,
  Tabs,
} from '../components/ui/Primitives'
import { useApp } from '../context/AppContext'
import { PILLARS, PILLAR_MAP, DEEP_WORK_BLOCK_MINUTES } from '../data/tracks'
import { useDeepWorkClock } from '../hooks/useDeepWorkTimer'
import { cx, dayKey, formatClock, formatMinutes, pct } from '../lib/utils'

const UNITS = { minutes: 'min', pages: 'pages', parties: 'parties' }

export const PillarsTracker = () => {
  const {
    state,
    derived,
    setPillarValue,
    setTarget,
    startDeepWork,
    stopDeepWork,
    cancelDeepWork,
    addPillarValue,
  } = useApp()

  const [tab, setTab] = useState('code')
  const [intent, setIntent] = useState('')
  const [showTargets, setShowTargets] = useState(false)
  const [toast, setToast] = useState('')

  const clock = useDeepWorkClock(state.deepWork.activeSession)
  const pillar = PILLAR_MAP[tab]
  const value = derived.pillarsToday[tab] || 0
  const target = derived.targets[tab] || 1

  const weekStats = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = dayKey(d)
      const rec = key === dayKey() ? { pillars: derived.pillarsToday } : state.history?.[key] || { pillars: {} }
      const total = PILLARS.reduce((t, p) => t + (rec.pillars?.[p.id] || 0), 0)
      days.push({ key, label: ['D', 'L', 'M', 'M', 'J', 'V', 'S'][d.getDay()], total, isToday: key === dayKey() })
    }
    return days
  }, [state.history, derived.pillarsToday])

  const maxTotal = Math.max(1, ...weekStats.map((d) => d.total))

  const sessionsToday = (state.deepWork.sessions || []).filter((s) => s.date === dayKey())
  const todayDeepMinutes = sessionsToday.reduce((t, s) => t + s.minutes, 0)

  const handleStop = () => {
    stopDeepWork({ addToPillar: true })
    setToast('Bloc enregistré — preuve déposée.')
    setTimeout(() => setToast(''), 2400)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* ---------------------- En-tête ---------------------- */}
      <Panel>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <ProgressRing value={derived.incarnRate} size={116} stroke={8} label="Global" />
          <div className="flex-1">
            <SectionTitle
              eyebrow="Le Charbon"
              title="Tracker des Piliers d'Excellence"
              subtitle="Six piliers. Pas d'option. Chaque unité comptée est une répétition du personnage."
              right={
                <Button size="sm" variant="ghost" icon="Settings" onClick={() => setShowTargets(true)}>
                  Objectifs
                </Button>
              }
            />
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Aujourd'hui" value={formatMinutes(todayDeepMinutes)} icon="Timer" />
              <Stat label="Blocs du jour" value={sessionsToday.length} icon="Layers" tone="jade" />
              <Stat label="Total cumulé" value={formatMinutes(state.deepWork.totalMinutes || 0)} icon="TrendingUp" tone="sapphire" />
              <Stat
                label="Piliers validés"
                value={`${PILLARS.filter((p) => (derived.pillarsToday[p.id] || 0) >= (derived.targets[p.id] || 1)).length}/${PILLARS.length}`}
                icon="BadgeCheck"
                tone="gold"
              />
            </div>
          </div>
        </div>
      </Panel>

      {/* ---------------------- Chronomètre Deep Work ---------------------- */}
      <Panel className={cx('relative overflow-hidden', state.deepWork.activeSession && 'border-gold-500/45')} glow={Boolean(state.deepWork.activeSession)}>
        <SectionTitle
          eyebrow="Chronomètre"
          title={state.deepWork.activeSession ? 'Bloc en cours — ne coupe pas' : `Bloc de ${DEEP_WORK_BLOCK_MINUTES} minutes`}
          icon="Timer"
          right={
            state.deepWork.activeSession ? (
              <Chip tone="gold" icon="CircleDot">{intentLabel(state.deepWork.activeSession)}</Chip>
            ) : null
          }
        />

        {state.deepWork.activeSession ? (
          <div className="mt-4 space-y-4">
            <div className="text-center">
              <p className="font-mono text-5xl tracking-tight text-gold-100 tabular-nums sm:text-6xl">
                {formatClock(clock.seconds)}
              </p>
              <p className="mt-1.5 text-[12px] text-ash">
                Objectif : {DEEP_WORK_BLOCK_MINUTES} min ·{' '}
                {clock.minutes >= DEEP_WORK_BLOCK_MINUTES ? 'Bloc accompli ✓' : `${DEEP_WORK_BLOCK_MINUTES - clock.minutes} min restantes`}
              </p>
            </div>
            <ProgressBar value={clock.blockProgress} tone={clock.blockProgress >= 100 ? '#2f9e78' : '#e0c07c'} height={8} />
            {state.deepWork.activeSession.intent && (
              <div className="panel-flat p-3">
                <p className="eyebrow mb-1">Intention déclarée</p>
                <p className="text-[12.5px] text-ivory/90">{state.deepWork.activeSession.intent}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button variant="gold" icon="Square" onClick={handleStop}>
                Terminer & créditer {clock.minutes} min
              </Button>
              <Button variant="ghost" icon="Pause" onClick={() => setToast('Mets le téléphone en mode avion.')}>
                Pause
              </Button>
              <Button variant="danger" icon="X" onClick={cancelDeepWork}>
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <Labeled label="Intention du bloc" hint="Une phrase. Ce qui existera à la fin du bloc.">
              <input
                className="field"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="Ex. Terminer l'API d'authentification et la déployer"
              />
            </Labeled>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="gold"
                icon="Play"
                onClick={() => {
                  startDeepWork(intent)
                  setIntent('')
                }}
              >
                Lancer le bloc de 90 min
              </Button>
              <Button variant="ghost" icon="Plus" onClick={() => addPillarValue('code', 30)}>
                Créditer 30 min manuellement
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Deep Work — Code', 'Deep Work — Lecture', 'Deep Work — Échecs', 'Deep Work — Anglais'].map((q) => (
                <button
                  key={q}
                  onClick={() => setIntent(q)}
                  className="chip transition hover:border-gold-500/45"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </Panel>

      {/* ---------------------- Piliers détaillés ---------------------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <Tabs
            tabs={PILLARS.map((p) => ({ id: p.id, label: p.short, icon: p.icon }))}
            value={tab}
            onChange={setTab}
          />

          <div className="mt-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl border border-gold-500/20 bg-void/50 p-3">
                <Icon name={pillar.icon} size={26} style={{ color: pillar.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="display text-lg text-gold-100">{pillar.label}</h3>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-ash">{pillar.description}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-gold-500/12 bg-white/2 p-4">
              <div className="mb-2 flex items-end justify-between">
                <div>
                  <p className="eyebrow">Aujourd'hui</p>
                  <p className="display text-3xl text-gold-100 tabular-nums">
                    {value}
                    <span className="ml-1.5 text-sm text-ash">
                      / {target} {UNITS[pillar.unit]}
                    </span>
                  </p>
                </div>
                <span className="font-mono text-sm text-gold-300">{pct(value, target)}%</span>
              </div>
              <ProgressBar value={pct(value, target)} tone={pillar.color} height={8} />

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {[1, 5, 15, 30].map((n) => (
                  <button
                    key={`m${n}`}
                    onClick={() => addPillarValue(pillar.id, n)}
                    className="btn btn-ghost !px-2.5 !py-1.5 font-mono !text-[11px]"
                  >
                    +{n}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    onClick={() => setPillarValue(pillar.id, value - 1)}
                    className="rounded-lg border border-white/10 p-1.5 text-ash transition hover:text-ivory"
                  >
                    <Icon name="Minus" size={14} />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={value}
                    onChange={(e) => setPillarValue(pillar.id, e.target.value)}
                    className="field w-20 !py-1.5 text-center font-mono !text-[13px]"
                  />
                  <button
                    onClick={() => addPillarValue(pillar.id, 1)}
                    className="rounded-lg border border-white/10 p-1.5 text-ash transition hover:text-ivory"
                  >
                    <Icon name="Plus" size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-gold-500/15 bg-gold-500/5 p-3">
              <Icon name="Sparkles" size={15} className="mt-0.5 shrink-0 text-gold-300" />
              <p className="text-[12.5px] leading-relaxed text-gold-100/90">
                <span className="font-semibold">Rituel :</span> {pillar.ritual}
              </p>
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          {/* Semaine */}
          <Panel>
            <SectionTitle eyebrow="7 derniers jours" title="Volume total" icon="BarChart3" />
            <div className="mt-4 flex h-32 items-end gap-1.5">
              {weekStats.map((d) => (
                <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-full w-full items-end">
                    <div
                      className={cx('w-full rounded-t-md transition-all duration-700', d.isToday ? 'bg-gold-400' : 'bg-gold-500/35')}
                      style={{ height: `${Math.max(3, (d.total / maxTotal) * 100)}%` }}
                      title={`${d.total} unités`}
                    />
                  </div>
                  <span className={cx('text-[10px] font-semibold', d.isToday ? 'text-gold-200' : 'text-ash/70')}>
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-center text-[11px] text-ash">
              La régularité bat l'intensité. Objectif : aucune barre vide.
            </p>
          </Panel>

          {/* Sessions */}
          <Panel>
            <SectionTitle eyebrow="Historique" title="Sessions de Deep Work" icon="Layers" />
            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
              {(state.deepWork.sessions || []).length === 0 ? (
                <EmptyState icon="Timer" title="Aucune session" text="Lance ton premier bloc de 90 minutes." />
              ) : (
                (state.deepWork.sessions || []).slice(0, 40).map((s) => (
                  <div key={s.id} className="panel-flat flex items-center gap-3 p-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold-500/20 bg-gold-500/8">
                      <span className="font-mono text-[11px] text-gold-200">{s.minutes}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] text-ivory/90">{s.intent || 'Bloc sans intention'}</p>
                      <p className="text-[10.5px] text-ash">
                        {new Date(s.startedAt).toLocaleDateString('fr-FR')} ·{' '}
                        {new Date(s.startedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-8">
          <div className="rounded-xl border border-gold-500/40 bg-gold-500/12 px-4 py-2.5 text-[12.5px] font-medium text-gold-100 backdrop-blur-md">
            {toast}
          </div>
        </div>
      )}

      {/* ---------------------- Objectifs ---------------------- */}
      <Modal
        open={showTargets}
        onClose={() => setShowTargets(false)}
        title="Objectifs quotidiens"
        subtitle="Règle tes piliers. Un objectif trop bas ne construit rien ; trop haut, il démolit la confiance."
        footer={<Button variant="gold" full icon="Check" onClick={() => setShowTargets(false)}>Valider</Button>}
      >
        <div className="space-y-3">
          {PILLARS.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <Icon name={p.icon} size={16} style={{ color: p.color }} />
              <span className="flex-1 text-[12.5px] text-ivory/90">{p.label}</span>
              <input
                type="number"
                min="1"
                value={derived.targets[p.id]}
                onChange={(e) => setTarget(p.id, e.target.value)}
                className="field w-24 !py-1.5 text-center font-mono !text-[13px]"
              />
              <span className="w-14 text-[11px] text-ash">{UNITS[p.unit]}</span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}

const intentLabel = (session) => (session.intent ? 'En cours' : 'Bloc actif')

export default PillarsTracker
