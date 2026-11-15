import { useMemo, useState } from 'react'
import Icon from '../components/ui/Icon'
import {
  Button,
  Chip,
  Modal,
  Panel,
  ProgressBar,
  SectionTitle,
  Stat,
  Tabs,
} from '../components/ui/Primitives'
import { useApp } from '../context/AppContext'
import { EXERCISES, EXERCISE_CATEGORIES, EXERCISE_MAP, pickDailyExercises } from '../data/exercises'
import { PILLAR_MAP } from '../data/tracks'
import { cx, dayKey } from '../lib/utils'

const MICRO_GESTURES = [
  { gesture: 'S\'asseoir', rule: 'Dos droit, épaules basses, pieds au sol, mains visibles. Aucun affalement, jamais.' },
  { gesture: 'Marcher', rule: '20 % plus lentement. Pas posés, regard horizontal, mains calmes.' },
  { gesture: 'Ouvrir une porte', rule: 'Main ferme, un seul mouvement, aucune hésitation. Tu entres, tu ne te glisses pas.' },
  { gesture: 'Tenir un verre', rule: 'À la base, coude bas, jamais devant le visage. Les mains libres pour parler.' },
  { gesture: 'Serrer une main', rule: 'Regard dans les yeux, deux secousses, pression ferme mais brève. Tu relâches le premier.' },
  { gesture: 'Écouter', rule: 'Corps orienté vers l\'autre, tête légèrement inclinée, aucune interruption. Silence actif.' },
]

export const MentorGym = () => {
  const { isExerciseDone, toggleExercise, state } = useApp()
  const [seed, setSeed] = useState(() => dayKey())
  const [category, setCategory] = useState('all')
  const [open, setOpen] = useState(null)
  const [showMicro, setShowMicro] = useState(false)

  const daily = useMemo(() => pickDailyExercises(seed, 4), [seed])

  const filtered = useMemo(
    () => (category === 'all' ? EXERCISES : EXERCISES.filter((e) => e.category === category)),
    [category],
  )

  const doneToday = (state.exerciseLog?.[dayKey()] || []).filter((id) => EXERCISE_MAP[id]).length
  const targetToday = daily.length
  const weekCount = Object.entries(state.exerciseLog || {})
    .filter(([d]) => {
      const diff = (Date.now() - new Date(`${d}T00:00:00`).getTime()) / 86400000
      return diff < 7
    })
    .reduce((t, [, ids]) => t + ids.length, 0)

  const regenerate = () => {
    setSeed(`${dayKey()}#${Math.random().toString(36).slice(2, 7)}`)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* ---------------- En-tête ---------------- */}
      <Panel>
        <SectionTitle
          eyebrow="Gym Quotidien des Mentors"
          title="Ton entraînement du jour"
          subtitle="Des exercices extraits des livres de référence, transformés en actes mesurables. Pas de théorie sans exécution."
          icon="Dumbbell"
          right={
            <Button size="sm" variant="ghost" icon="RefreshCw" onClick={regenerate}>
              Régénérer
            </Button>
          }
        />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Faits aujourd'hui" value={`${doneToday}/${targetToday}`} icon="CheckCircle2" tone="jade" />
          <Stat label="Cette semaine" value={weekCount} unit="exercices" icon="TrendingUp" />
          <Stat label="Bibliothèque" value={EXERCISES.length} unit="exercices" icon="Library" tone="sapphire" />
          <Stat label="Catégories" value={EXERCISE_CATEGORIES.length} icon="Layers" tone="slate" />
        </div>
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-[11px] text-ash">
            <span>Progression du jour</span>
            <span className="font-mono">{targetToday ? Math.round((doneToday / targetToday) * 100) : 0}%</span>
          </div>
          <ProgressBar value={targetToday ? (doneToday / targetToday) * 100 : 0} />
        </div>
      </Panel>

      {/* ---------------- Exercices du jour ---------------- */}
      <div className="grid gap-3 sm:grid-cols-2">
        {daily.map((ex) => {
          const done = isExerciseDone(ex.id)
          const cat = EXERCISE_CATEGORIES.find((c) => c.id === ex.category)
          const pillar = PILLAR_MAP[ex.pillar]
          return (
            <Panel
              key={ex.id}
              className={cx('flex flex-col transition', done && 'border-emerald-500/30')}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl border border-gold-500/20 bg-void/50 p-2">
                    <Icon name={cat?.icon || 'Target'} size={17} className="text-gold-300" />
                  </div>
                  <div>
                    <p className="eyebrow text-[9.5px]">{cat?.label}</p>
                    <h3 className="display text-[15px] leading-tight text-gold-100">{ex.title}</h3>
                  </div>
                </div>
                <button
                  onClick={() => toggleExercise(ex.id)}
                  className={cx(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition',
                    done
                      ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                      : 'border-gold-500/30 text-transparent hover:bg-gold-500/10',
                  )}
                  title={done ? 'Marquer comme non fait' : 'Marquer comme fait'}
                >
                  <Icon name="Check" size={15} />
                </button>
              </div>

              <p className="mt-3 flex-1 text-[12.5px] leading-relaxed text-ash">{ex.brief}</p>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Chip tone="slate" icon="Clock">{ex.duration}</Chip>
                <Chip tone="gold" icon={pillar?.icon}>{pillar?.short}</Chip>
              </div>

              <div className="mt-3 flex items-center gap-2 border-t border-gold-500/10 pt-3">
                <p className="min-w-0 flex-1 truncate text-[11px] text-ash/80 italic">{ex.source}</p>
                <Button size="sm" variant="ghost" iconRight="ChevronRight" onClick={() => setOpen(ex)}>
                  Protocole
                </Button>
              </div>
            </Panel>
          )
        })}
      </div>

      {/* ---------------- Micro-gestes ---------------- */}
      <Panel className="border-gold-500/22">
        <SectionTitle
          eyebrow="Micro-gestes du quotidien"
          title="La présence physique d'un homme influent"
          subtitle="Le personnage s'installe par le corps avant de s'installer dans la tête."
          icon="Footprints"
          right={
            <Button size="sm" variant={showMicro ? 'gold' : 'ghost'} icon={showMicro ? 'ChevronUp' : 'ChevronDown'} onClick={() => setShowMicro((v) => !v)}>
              {showMicro ? 'Replier' : 'Déplier'}
            </Button>
          }
        />
        {showMicro && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {MICRO_GESTURES.map((m) => (
              <div key={m.gesture} className="panel-flat p-3">
                <p className="flex items-center gap-2 text-[12.5px] font-semibold text-gold-100">
                  <Icon name="Check" size={13} className="text-gold-400" />
                  {m.gesture}
                </p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-ash">{m.rule}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* ---------------- Bibliothèque ---------------- */}
      <Panel>
        <SectionTitle
          eyebrow="Bibliothèque complète"
          title="Tous les exercices des mentors"
          subtitle="Chaque exercice est rattaché à un livre et à un pilier."
          icon="Library"
        />
        <Tabs
          className="mt-4"
          value={category}
          onChange={setCategory}
          tabs={[{ id: 'all', label: 'Tout', icon: 'Layers' }, ...EXERCISE_CATEGORIES]}
        />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ex) => {
            const done = isExerciseDone(ex.id)
            return (
              <button
                key={ex.id}
                onClick={() => setOpen(ex)}
                className={cx(
                  'flex flex-col rounded-2xl border p-3 text-left transition',
                  done
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-gold-500/12 bg-white/2 hover:border-gold-500/35 hover:bg-gold-500/6',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[12.5px] font-semibold text-gold-100">{ex.title}</span>
                  {done && <Icon name="CheckCircle2" size={14} className="shrink-0 text-emerald-400" />}
                </div>
                <span className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-ash">{ex.brief}</span>
                <span className="mt-2 flex items-center gap-1.5 text-[10.5px] text-gold-400/80">
                  <Icon name="Clock" size={11} /> {ex.duration}
                </span>
              </button>
            )
          })}
        </div>
      </Panel>

      {/* ---------------- Modal protocole ---------------- */}
      <Modal
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        title={open?.title}
        subtitle={open?.source}
        wide
        footer={
          open ? (
            <>
              <Button
                variant={isExerciseDone(open.id) ? 'ghost' : 'gold'}
                icon={isExerciseDone(open.id) ? 'RotateCcw' : 'Check'}
                onClick={() => toggleExercise(open.id)}
              >
                {isExerciseDone(open.id) ? 'Marquer non fait' : 'Marquer comme exécuté'}
              </Button>
              <Button variant="ghost" onClick={() => setOpen(null)}>Fermer</Button>
            </>
          ) : null
        }
      >
        {open && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              <Chip tone="gold" icon="Clock">{open.duration}</Chip>
              <Chip tone="slate" icon="Layers">
                {EXERCISE_CATEGORIES.find((c) => c.id === open.category)?.label}
              </Chip>
              <Chip tone="jade" icon={PILLAR_MAP[open.pillar]?.icon}>{PILLAR_MAP[open.pillar]?.label}</Chip>
            </div>

            <p className="text-[13px] leading-relaxed text-ivory/90">{open.brief}</p>

            <div>
              <p className="eyebrow mb-2">Protocole d'exécution</p>
              <ol className="space-y-2">
                {open.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 rounded-xl border border-gold-500/12 bg-white/2 p-3">
                    <span className="display flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold-500/30 text-[12px] text-gold-200">
                      {i + 1}
                    </span>
                    <span className="text-[12.5px] leading-relaxed text-ivory/88">{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-3.5">
              <p className="eyebrow mb-1 !text-emerald-300/90">Preuve exigée</p>
              <p className="text-[12.5px] leading-relaxed text-emerald-100/90">{open.proof}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default MentorGym
