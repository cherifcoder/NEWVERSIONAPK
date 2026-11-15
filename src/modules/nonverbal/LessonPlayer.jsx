/* ------------------------------------------------------------------
   LessonPlayer.jsx — Lecteur de leçon (micro-learning)
   ------------------------------------------------------------------
   Barre de progression type Duolingo, une étape à la fois, écran de
   bilan avec XP. Aucune notion de « vies » : ici, on mesure la
   régularité, pas la punition.
------------------------------------------------------------------- */

import { useMemo, useState } from 'react'
import Icon from '../../components/ui/Icon'
import { Button, Chip, Panel, ProgressBar } from '../../components/ui/Primitives'
import { StepRenderer } from '../../components/nonverbal/Steps'
import { useApp } from '../../context/AppContext'
import { XP_LESSON_BONUS, XP_PER_STEP, stepIsDone } from '../../lib/curriculum'
import { cx } from '../../lib/utils'

export const LessonPlayer = ({ lesson, unit, onExit, onNext, hasNext }) => {
  const { state, nvCompleteStep, nvCompleteLesson, nvRecordReview } = useApp()
  const progress = state.nonverbal?.progress || {}
  const steps = lesson.steps || []
  const [index, setIndex] = useState(() => {
    const firstUndone = steps.findIndex((s) => !stepIsDone(progress, lesson.id, s.id))
    return firstUndone === -1 ? 0 : firstUndone
  })
  const [finished, setFinished] = useState(false)
  const [gained, setGained] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  const step = steps[index]
  const doneCount = steps.filter((s) => stepIsDone(progress, lesson.id, s.id)).length
  const pct = steps.length ? Math.round((doneCount / steps.length) * 100) : 0

  const quizCount = useMemo(() => (lesson.steps || []).filter((s) => s.kind === 'quiz').length, [lesson.steps])

  const handleComplete = (s, payload) => {
    const already = stepIsDone(progress, lesson.id, s.id)
    nvCompleteStep(lesson.id, s.id)
    if (!already) setGained((g) => g + XP_PER_STEP)
    if (s.kind === 'quiz' && payload) {
      nvRecordReview(`${lesson.id}:${s.id}`, payload.correct)
      if (payload.correct) setCorrectCount((c) => c + 1)
    }
    if (index + 1 < steps.length) {
      setIndex(index + 1)
    } else {
      const bonus = stepIsDone(progress, lesson.id, s.id) ? 0 : XP_LESSON_BONUS
      nvCompleteLesson(lesson.id, { xp: bonus, minutes: lesson.minutes || 4 })
      setGained((g) => g + bonus)
      setFinished(true)
    }
  }

  /* ------------------------------- Bilan ------------------------------- */
  if (finished) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Panel glow className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/12">
            <Icon name="Trophy" size={28} className="text-emerald-300" />
          </div>
          <p className="eyebrow">Leçon terminée</p>
          <h2 className="display mt-1 text-2xl text-gold-100">{lesson.title}</h2>
          <p className="mx-auto mt-2 max-w-md text-[12.5px] leading-relaxed text-ash">{lesson.goal}</p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="panel-flat p-3">
              <p className="font-mono text-xl text-gold-200">+{gained}</p>
              <p className="text-[10px] tracking-wide text-ash uppercase">XP gagnés</p>
            </div>
            <div className="panel-flat p-3">
              <p className="font-mono text-xl text-emerald-300">
                {correctCount}/{quizCount}
              </p>
              <p className="text-[10px] tracking-wide text-ash uppercase">Justes</p>
            </div>
            <div className="panel-flat p-3">
              <p className="font-mono text-xl text-sky-300">{lesson.minutes}′</p>
              <p className="text-[10px] tracking-wide text-ash uppercase">Durée</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {hasNext && (
              <Button variant="gold" icon="ArrowRight" onClick={onNext}>
                Leçon suivante
              </Button>
            )}
            <Button variant="ghost" icon="RotateCcw" onClick={() => { setIndex(0); setFinished(false); setGained(0); setCorrectCount(0) }}>
              Rejouer
            </Button>
            <Button variant="ghost" icon="LayoutDashboard" onClick={onExit}>
              Parcours
            </Button>
          </div>
        </Panel>

        <Panel flat>
          <p className="eyebrow mb-2">Mise en pratique réelle</p>
          <p className="text-[12.5px] leading-relaxed text-ivory/88">
            Une leçon ne devient une compétence qu\'exécutée dans les 24 heures. Choisis <strong className="text-gold-200">une</strong> situation
            aujourd\'hui — entrer dans un lieu public, t\'asseoir à une table, saluer quelqu\'un — et applique la séquence complète. Puis note
            en une phrase ce que ton corps a fait de différent.
          </p>
        </Panel>
      </div>
    )
  }

  /* ------------------------------ Lecteur ------------------------------ */
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {/* Barre supérieure */}
      <div className="sticky top-0 z-10 -mx-1 flex items-center gap-3 rounded-2xl border border-gold-500/12 bg-void/85 px-3 py-2.5 backdrop-blur-xl">
        <button
          type="button"
          onClick={onExit}
          className="rounded-lg border border-gold-500/18 p-2 text-gold-200 transition hover:bg-white/6"
          aria-label="Quitter la leçon"
        >
          <Icon name="X" size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold text-gold-100">{lesson.title}</p>
          <p className="truncate text-[10px] text-ash">{unit?.title}</p>
        </div>
        <Chip tone="gold" icon="Zap">
          +{gained}
        </Chip>
      </div>

      <ProgressBar value={pct} height={7} />

      <Panel>
        {step && (
          <StepRenderer
            key={step.id}
            step={step}
            index={index}
            total={steps.length}
            downloads={state.nonverbal?.downloads}
            onComplete={handleComplete}
          />
        )}
      </Panel>

      {/* Points d'étape */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {steps.map((s, i) => {
          const done = stepIsDone(progress, lesson.id, s.id)
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              title={s.title}
              className={cx(
                'h-2.5 rounded-full transition-all',
                i === index ? 'w-7 bg-gold-400' : done ? 'w-2.5 bg-emerald-400/70' : 'w-2.5 bg-white/12',
              )}
              aria-label={`Étape ${i + 1} : ${s.title}`}
            />
          )
        })}
      </div>
    </div>
  )
}

export default LessonPlayer
