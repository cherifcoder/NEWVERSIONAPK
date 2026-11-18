import { useMemo, useState } from 'react'
import Icon from '../components/ui/Icon'
import {
  Button,
  Chip,
  Panel,
  ProgressBar,
  ProgressRing,
  SectionTitle,
  Stat,
} from '../components/ui/Primitives'
import { useApp } from '../context/AppContext'
import { PILLARS } from '../data/tracks'
import { WISDOM } from '../data/wisdom'
import { pickDailyExercises } from '../data/exercises'
import { stateForScore } from '../data/journal'
import { useDeepWorkClock } from '../hooks/useDeepWorkTimer'
import { clamp, dayKey, formatClock, formatMinutes, pct, pickSeeded } from '../lib/utils'

export const Dashboard = ({ onNavigate }) => {
  const { state, derived, addPillarValue, toggleExercise, isExerciseDone, startDeepWork } = useApp()
  const [toast, setToast] = useState('')
  const clock = useDeepWorkClock(state.deepWork.activeSession)

  const today = dayKey()
  const wisdom = useMemo(() => pickSeeded(WISDOM, today), [today])
  const dailyExercises = useMemo(() => pickDailyExercises(today, 3), [today])
  const actorState = stateForScore(derived.incarnRate)

  const priorityProject = [...(derived.openProjects || [])].sort(
    (a, b) => (a.priority || 2) - (b.priority || 2),
  )[0]

  const hour = new Date().getHours()
  const greeting = hour < 6 ? 'Debout avant le monde' : hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* ------------------------- HERO ------------------------- */}
      <Panel className="relative overflow-hidden !p-5 sm:!p-6" glow>
        <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
          <ProgressRing
            value={derived.incarnRate}
            size={148}
            label="Incarné"
            sublabel={actorState.label}
            tone={derived.incarnRate >= 75 ? '#e0c07c' : derived.incarnRate >= 45 ? '#cfa851' : '#b4323c'}
          />

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="eyebrow">{greeting}, {state.profile.name || 'Acteur'}</p>
            <h2 className="display mt-1 text-2xl leading-tight text-gold-100 sm:text-3xl">
              Tu es <span className="gold-text">{state.profile.codename || 'Le Futur Toi'}</span>
            </h2>
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-ash">
              {actorState.emoji} <span className="text-gold-200">{actorState.label}</span> — {actorState.desc}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Deep Work" value={formatMinutes(derived.todayMinutes)} icon="Timer" tone="gold" />
              <Stat label="Série" value={state.streak?.current || 0} unit="jours" icon="Flame" tone="jade" />
              <Stat
                label="Boucles"
                value={derived.openLoops}
                unit="ouvertes"
                icon="Swords"
                tone={derived.openLoops ? 'blood' : 'jade'}
              />
              <Stat
                label="Débrief"
                value={derived.journaledToday ? 'Fait' : 'À faire'}
                icon="NotebookPen"
                tone={derived.journaledToday ? 'jade' : 'slate'}
              />
            </div>
          </div>
        </div>

        {/* Bandeau Deep Work */}
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-gold-500/18 bg-gradient-to-r from-gold-500/10 to-transparent p-3.5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-gold-500/25 bg-void/60 p-2.5">
              <Icon name="ShieldAlert" size={20} className="text-gold-300" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-gold-100">
                {state.deepWork.activeSession ? 'Bloc en cours' : 'Lancer un bloc verrouillé'}
              </p>
              <p className="font-mono text-[19px] leading-tight text-gold-200 tabular-nums">
                {state.deepWork.activeSession ? formatClock(clock.seconds) : '90:00'}
              </p>
            </div>
          </div>
          <div className="flex-1">
            {state.deepWork.activeSession && (
              <ProgressBar value={clock.blockProgress} tone="#e0c07c" />
            )}
          </div>
          <Button
            variant="gold"
            icon={state.deepWork.activeSession ? 'Gauge' : 'Play'}
            onClick={() => onNavigate?.('deepwork')}
          >
            {state.deepWork.activeSession ? 'Voir le chrono' : 'Démarrer'}
          </Button>
        </div>
      </Panel>

      {/* -------------------- PILIERS + SAGESSE -------------------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Piliers */}
        <Panel className="lg:col-span-2">
          <SectionTitle
            eyebrow="Le Charbon"
            title="Piliers de la journée"
            icon="Gauge"
            right={
              <Button size="sm" variant="ghost" icon="ArrowRight" onClick={() => onNavigate?.('pillars')}>
                Détail
              </Button>
            }
          />
          <div className="mt-4 space-y-3.5">
            {PILLARS.map((p) => {
              const value = derived.pillarsToday[p.id] || 0
              const target = derived.targets[p.id] || 1
              const ratio = pct(value, target)
              const done = ratio >= 100
              return (
                <div key={p.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Icon name={p.icon} size={14} style={{ color: p.color }} />
                      <span className="truncate text-[12.5px] font-medium text-ivory/90">{p.short}</span>
                      {done && <Icon name="CheckCircle2" size={13} className="text-emerald-400" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11.5px] text-ash tabular-nums">
                        {value}/{target} {p.unit === 'minutes' ? 'min' : p.unit}
                      </span>
                      {p.unit === 'minutes' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => addPillarValue(p.id, 15)}
                            className="rounded-md border border-gold-500/22 px-1.5 py-0.5 font-mono text-[10px] text-gold-200 transition hover:bg-gold-500/12"
                          >
                            +15
                          </button>
                          <button
                            onClick={() => addPillarValue(p.id, 45)}
                            className="rounded-md border border-gold-500/22 px-1.5 py-0.5 font-mono text-[10px] text-gold-200 transition hover:bg-gold-500/12"
                          >
                            +45
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <ProgressBar value={ratio} tone={done ? '#2f9e78' : p.color} />
                </div>
              )
            })}
          </div>
        </Panel>

        {/* Sagesse du jour */}
        <Panel className="relative overflow-hidden">
          <SectionTitle eyebrow="Loi & Sagesse du jour" title={wisdom.law} icon="Quote" />
          <div className="mt-3 rounded-2xl border border-gold-500/15 bg-void/50 p-4">
            <Icon name="Quote" size={20} className="text-gold-500/40" />
            <p className="display mt-2 text-[15.5px] leading-relaxed text-gold-100 italic">
              « {wisdom.quote} »
            </p>
            <p className="mt-3 text-[11.5px] font-semibold tracking-wide text-gold-300">
              {wisdom.author} — <span className="text-ash">{wisdom.book}</span>
            </p>
          </div>
          <div className="mt-3">
            <p className="eyebrow mb-1.5">Stratégie à appliquer aujourd'hui</p>
            <p className="text-[12.5px] leading-relaxed text-ivory/88">{wisdom.strategy}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Chip tone="gold" icon="BookOpen">{wisdom.book}</Chip>
            <Chip tone="slate">{wisdom.tag}</Chip>
          </div>
        </Panel>
      </div>

      {/* -------------------- GYM + PROJET -------------------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <SectionTitle
            eyebrow="Gym des Mentors"
            title="Exercices du jour"
            icon="Dumbbell"
            right={
              <Button size="sm" variant="ghost" icon="ArrowRight" onClick={() => onNavigate?.('gym')}>
                Tout voir
              </Button>
            }
          />
          <div className="mt-4 space-y-2.5">
            {dailyExercises.map((ex) => {
              const done = isExerciseDone(ex.id)
              return (
                <button
                  key={ex.id}
                  onClick={() => toggleExercise(ex.id)}
                  className="flex w-full items-start gap-3 rounded-2xl border border-gold-500/12 bg-white/2 p-3 text-left transition hover:border-gold-500/30 hover:bg-gold-500/6"
                >
                  <span
                    className={
                      done
                        ? 'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-emerald-500/50 bg-emerald-500/20'
                        : 'mt-0.5 h-5 w-5 shrink-0 rounded-md border border-gold-500/30'
                    }
                  >
                    {done && <Icon name="Check" size={12} className="text-emerald-300" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className={done ? 'text-[13px] text-ash line-through' : 'text-[13px] font-semibold text-gold-100'}>
                        {ex.title}
                      </span>
                      <Chip tone="slate" icon="Clock">{ex.duration}</Chip>
                    </span>
                    <span className="mt-1 block text-[12px] leading-relaxed text-ash">{ex.brief}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel>
            <SectionTitle eyebrow="Zéro Abandon" title="Le crapaud du jour" icon="Flame" />
            {priorityProject ? (
              <>
                <p className="mt-3 text-[13px] font-semibold text-gold-100">{priorityProject.title}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-ash">
                  {priorityProject.nextStep || 'Définis le prochain pas concret.'}
                </p>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[10.5px] text-ash">
                    <span>Avancement</span>
                    <span className="font-mono">{priorityProject.progress}%</span>
                  </div>
                  <ProgressBar value={priorityProject.progress} />
                </div>
                <Button
                  variant="ghost"
                  full
                  className="mt-3"
                  icon="Swords"
                  onClick={() => onNavigate?.('dispatcher')}
                >
                  Ouvrir le dispatcher
                </Button>
              </>
            ) : (
              <p className="mt-3 text-[12.5px] text-ash">
                Aucune boucle ouverte. C'est propre — lance un projet ambitieux.
              </p>
            )}
          </Panel>

          <Panel className="border-gold-500/25">
            <SectionTitle eyebrow="Débrief" title="Fin de journée" icon="NotebookPen" />
            <p className="mt-2 text-[12.5px] leading-relaxed text-ash">
              {derived.journaledToday
                ? 'Rapport déposé. Le Metteur en Scène a rendu son verdict.'
                : 'Le plateau ferme. Un acteur professionnel débriefe avant de dormir.'}
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                variant={derived.journaledToday ? 'ghost' : 'gold'}
                full
                icon="NotebookPen"
                onClick={() => onNavigate?.('journal')}
              >
                {derived.journaledToday ? 'Revoir' : 'Débriefer'}
              </Button>
              <Button variant="ghost" icon="Sparkles" onClick={() => onNavigate?.('director')} />
            </div>
          </Panel>

          <Panel>
            <SectionTitle eyebrow="Rappel" title="Règle d'or" icon="ShieldCheck" />
            <p className="display mt-2 text-[14px] leading-relaxed text-gold-200 italic">
              « Tout ce qui est commencé est mené jusqu'au bout, avec une exécution chirurgicale. »
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="panel-flat p-2">
                <p className="font-mono text-base text-gold-200">{clamp(state.deepWork.sessions?.length || 0)}</p>
                <p className="text-[9.5px] tracking-wide text-ash uppercase">Blocs</p>
              </div>
              <div className="panel-flat p-2">
                <p className="font-mono text-base text-gold-200">{formatMinutes(state.deepWork.totalMinutes || 0)}</p>
                <p className="text-[9.5px] tracking-wide text-ash uppercase">Total</p>
              </div>
              <div className="panel-flat p-2">
                <p className="font-mono text-base text-gold-200">{state.streak?.best || 0}</p>
                <p className="text-[9.5px] tracking-wide text-ash uppercase">Record</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {toast && <div className="text-[12px] text-gold-200">{toast}</div>}
    </div>
  )
}

export default Dashboard
