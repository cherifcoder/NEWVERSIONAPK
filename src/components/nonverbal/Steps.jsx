/* ------------------------------------------------------------------
   Steps.jsx — Les 6 types d'étapes d'une leçon
   ------------------------------------------------------------------
   illustration · clip · audio · reading · quiz · practice

   Chaque étape est autonome : elle gère sa validation et prévient le
   lecteur via onComplete(). Le lecteur ne connaît pas les détails.
------------------------------------------------------------------- */

import { useEffect, useRef, useState } from 'react'
import Icon from '../ui/Icon'
import { Button, Chip, ProgressBar } from '../ui/Primitives'
import { ClipView, Illustration, Storyboard } from './Visuals'
import { POSES } from '../../lib/figure'
import { KIND_META, inlineTextFor, mediaFor } from '../../data/nonverbal/media'
import { DRILL_MAP } from '../../data/nonverbal/scripts'
import { resolveMediaSrc } from '../../lib/offlineMedia'
import { cx, formatClock } from '../../lib/utils'

/* ------------------------------ En-tête d'étape ------------------------------ */

const StepHeader = ({ step, index, total }) => {
  const meta = { illustration: 'Illustration', clip: 'Mini-vidéo', audio: 'Audio', reading: 'Lecture', quiz: 'Question', practice: 'Pratique' }
  const tone = { illustration: 'sapphire', clip: 'blood', audio: 'jade', reading: 'gold', quiz: 'gold', practice: 'jade' }
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Chip tone={tone[step.kind]} icon={{ illustration: 'PersonStanding', clip: 'Video', audio: 'Headphones', reading: 'FileText', quiz: 'ListChecks', practice: 'Target' }[step.kind]}>
            {meta[step.kind]}
          </Chip>
          <span className="font-mono text-[11px] text-ash">
            {index + 1}/{total}
          </span>
        </div>
        <h3 className="display mt-2 text-lg leading-tight text-gold-100">{step.title}</h3>
        {step.caption && <p className="mt-1 text-[12.5px] leading-relaxed text-ash">{step.caption}</p>}
      </div>
    </div>
  )
}

const ActionBar = ({ children }) => <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gold-500/12 pt-4">{children}</div>

/* ================================ 1. Illustration ================================ */

export const IllustrationStep = ({ step, index, total, onComplete }) => {
  const p = POSES[step.poseId]
  return (
    <div className="space-y-3">
      <StepHeader step={step} index={index} total={total} />
      <Illustration poseId={step.poseId} showAxis={step.showAxis} />
      {step.points?.length > 0 && (
        <ul className="space-y-1.5">
          {step.points.map((pt) => (
            <li key={pt} className="flex gap-2 text-[13px] leading-relaxed text-ivory/88">
              <Icon name="Check" size={14} className="mt-[3px] shrink-0 text-emerald-400" />
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      )}
      <ActionBar>
        <Button variant="gold" icon="ArrowRight" onClick={() => onComplete(step)}>
          J\'ai compris
        </Button>
        {p?.intent && <span className="text-[11px] text-ash">Repère : {p.intent}</span>}
      </ActionBar>
    </div>
  )
}

/* ================================== 2. Clip ================================== */

export const ClipStep = ({ step, index, total, onComplete }) => (
  <div className="space-y-3">
    <StepHeader step={step} index={index} total={total} />
    <ClipView clipId={step.clipId} />
    <Storyboard clipId={step.clipId} />
    <ActionBar>
      <Button variant="gold" icon="ArrowRight" onClick={() => onComplete(step)}>
        Vu
      </Button>
    </ActionBar>
  </div>
)

/* ================================== 3. Audio ================================== */

export const AudioStep = ({ step, index, total, downloads, onComplete }) => {
  const media = mediaFor(step.mediaId)
  const stored = downloads?.[step.mediaId]
  const [src, setSrc] = useState(null)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    let alive = true
    resolveMediaSrc(media, stored).then((u) => {
      if (alive) setSrc(u)
    })
    return () => {
      alive = false
    }
  }, [media, stored])

  if (!media) return null

  return (
    <div className="space-y-3">
      <StepHeader step={step} index={index} total={total} />
      <div className="panel-flat p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-2.5">
            <Icon name="Headphones" size={18} className="text-emerald-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-gold-100">{media.title}</p>
            <p className="text-[11.5px] text-ash">{media.subtitle}</p>
          </div>
          <Chip tone="slate" icon="Clock">
            {media.duration}
          </Chip>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <Button
            variant={playing ? 'ghost' : 'gold'}
            icon={playing ? 'Pause' : 'Play'}
            size="sm"
            onClick={() => {
              const el = audioRef.current
              if (!el) return
              if (el.paused) {
                el.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
              } else {
                el.pause()
                setPlaying(false)
              }
            }}
          >
            {playing ? 'Pause' : 'Écouter'}
          </Button>
          {stored ? (
            <Chip tone="jade" icon="CheckCircle2">
              Hors-ligne
            </Chip>
          ) : (
            <Chip tone="slate" icon="Wifi">
              Streaming
            </Chip>
          )}
        </div>

        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio
          ref={audioRef}
          src={src || undefined}
          onEnded={() => setPlaying(false)}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          className="mt-3 w-full"
          controls
        />
      </div>

      <p className="text-[12.5px] leading-relaxed text-ash">{media.description}</p>
      {step.tip && (
        <div className="flex items-start gap-2 rounded-xl border border-gold-500/25 bg-gold-500/8 p-3">
          <Icon name="Info" size={14} className="mt-0.5 shrink-0 text-gold-300" />
          <p className="text-[12px] leading-relaxed text-gold-100">{step.tip}</p>
        </div>
      )}

      <ActionBar>
        <Button variant="gold" icon="ArrowRight" onClick={() => onComplete(step)}>
          Suivant
        </Button>
      </ActionBar>
    </div>
  )
}

/* ================================= 4. Lecture ================================= */

export const ReadingStep = ({ step, index, total, onComplete }) => {
  const media = mediaFor(step.mediaId)
  const [text, setText] = useState(() => inlineTextFor(step.mediaId) || step.text || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (text) return
    let alive = true
    setLoading(true)
    fetch(media?.src || '')
      .then((r) => r.text())
      .then((t) => alive && setText(t))
      .catch(() => alive && setText('Contenu indisponible. Télécharge la ressource pour la consulter hors-ligne.'))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.mediaId])

  return (
    <div className="space-y-3">
      <StepHeader step={step} index={index} total={total} />
      <div className="rounded-2xl border border-gold-500/15 bg-void/50 p-4">
        {loading ? (
          <p className="py-8 text-center text-[12.5px] text-ash">Chargement…</p>
        ) : (
          <pre className="max-h-[52vh] overflow-auto font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-ivory/88">
            {text}
          </pre>
        )}
      </div>
      {media && (
        <div className="flex items-center gap-2">
          <Chip tone="gold" icon="FileText">
            {media.title}
          </Chip>
          <Chip tone="slate" icon="Clock">
            {media.duration}
          </Chip>
        </div>
      )}
      <ActionBar>
        <Button variant="gold" icon="ArrowRight" onClick={() => onComplete(step)}>
          Lu
        </Button>
      </ActionBar>
    </div>
  )
}

/* ================================== 5. Quiz ================================== */

export const QuizStep = ({ step, index, total, onComplete }) => {
  const [choice, setChoice] = useState(null)
  const [checked, setChecked] = useState(false)
  const correct = choice === step.answer

  return (
    <div className="space-y-3">
      <StepHeader step={step} index={index} total={total} />
      <p className="text-[14px] leading-relaxed font-medium text-ivory">{step.question}</p>

      <div className="space-y-2">
        {step.options.map((opt, i) => {
          const isChoice = choice === i
          const isAnswer = checked && i === step.answer
          const isWrong = checked && isChoice && !correct
          return (
            <button
              key={opt}
              type="button"
              disabled={checked}
              onClick={() => setChoice(i)}
              className={cx(
                'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition',
                isAnswer && 'border-emerald-500/50 bg-emerald-500/10',
                isWrong && 'border-rose-500/50 bg-rose-500/10',
                !checked && isChoice && 'border-gold-500/50 bg-gold-500/12',
                !isAnswer && !isWrong && !isChoice && 'border-white/8 bg-white/3 hover:border-gold-500/25',
              )}
            >
              <span
                className={cx(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px]',
                  isAnswer
                    ? 'border-emerald-400 text-emerald-200'
                    : isWrong
                      ? 'border-rose-400 text-rose-200'
                      : 'border-gold-500/35 text-gold-200',
                )}
              >
                {isAnswer ? <Icon name="Check" size={12} /> : isWrong ? <Icon name="X" size={12} /> : String.fromCharCode(65 + i)}
              </span>
              <span className="text-[13px] leading-relaxed text-ivory/90">{opt}</span>
            </button>
          )
        })}
      </div>

      {checked && (
        <div
          className={cx(
            'flex items-start gap-2 rounded-xl border p-3',
            correct ? 'border-emerald-500/35 bg-emerald-500/10' : 'border-rose-500/35 bg-rose-500/10',
          )}
        >
          <Icon name={correct ? 'CheckCircle2' : 'AlertTriangle'} size={15} className={cx('mt-0.5 shrink-0', correct ? 'text-emerald-300' : 'text-rose-300')} />
          <p className="text-[12.5px] leading-relaxed text-ivory/90">{step.explain}</p>
        </div>
      )}

      <ActionBar>
        {!checked ? (
          <Button variant="gold" icon="Check" disabled={choice === null} onClick={() => setChecked(true)}>
            Vérifier
          </Button>
        ) : (
          <Button variant="gold" icon="ArrowRight" onClick={() => onComplete(step, { correct })}>
            Continuer
          </Button>
        )}
      </ActionBar>
    </div>
  )
}

/* ================================= 6. Pratique ================================= */

export const PracticeStep = ({ step, index, total, onComplete }) => {
  const totalSec = step.seconds || 60
  const [left, setLeft] = useState(totalSec)
  const [running, setRunning] = useState(false)
  const [checks, setChecks] = useState(() => (step.checklist || []).map(() => false))
  const drill = step.drillId ? DRILL_MAP[step.drillId] : null

  useEffect(() => {
    if (!running) return undefined
    const t = setInterval(() => setLeft((v) => (v <= 1 ? 0 : v - 1)), 1000)
    return () => clearInterval(t)
  }, [running])

  const done = left === 0
  const active = running && !done
  const checkedCount = checks.filter(Boolean).length
  const pct = Math.round(((totalSec - left) / totalSec) * 100)

  return (
    <div className="space-y-3">
      <StepHeader step={step} index={index} total={total} />

      <div className="panel-flat p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon name="Timer" size={16} className="text-gold-300" />
            <span className={cx('font-mono text-2xl tabular-nums', done ? 'text-emerald-300' : 'text-gold-100')}>
              {formatClock(left)}
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant={active ? 'ghost' : 'gold'} icon={active ? 'Pause' : 'Play'} onClick={() => setRunning((v) => !v)} disabled={done}>
              {active ? 'Pause' : 'Lancer'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon="RotateCcw"
              onClick={() => {
                setLeft(totalSec)
                setRunning(false)
              }}
            >
              Reprendre
            </Button>
          </div>
        </div>
        <ProgressBar className="mt-3" value={pct} tone={done ? '#2f9e78' : '#cfa851'} />
        <p className="mt-3 text-[12.5px] leading-relaxed text-ivory/88">{step.brief}</p>
      </div>

      {drill && (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 p-3">
          <p className="eyebrow mb-1 text-[9px]">Exercice</p>
          <p className="text-[13px] leading-relaxed text-emerald-50">« {drill.text} »</p>
          <p className="mt-1.5 text-[11.5px] text-emerald-100/80">{drill.instruction}</p>
        </div>
      )}

      {step.checklist?.length > 0 && (
        <div className="space-y-1.5">
          <p className="eyebrow text-[9px]">Critères de réussite</p>
          {step.checklist.map((c, i) => (
            <button
              key={c}
              type="button"
              onClick={() => setChecks((arr) => arr.map((v, j) => (j === i ? !v : v)))}
              className="flex w-full items-center gap-2.5 rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-left transition hover:border-gold-500/25"
            >
              <span
                className={cx(
                  'flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border',
                  checks[i] ? 'border-emerald-400 bg-emerald-500/20' : 'border-gold-500/35',
                )}
              >
                {checks[i] && <Icon name="Check" size={11} className="text-emerald-300" />}
              </span>
              <span className={cx('text-[12.5px]', checks[i] ? 'text-ivory/70 line-through' : 'text-ivory/90')}>{c}</span>
            </button>
          ))}
        </div>
      )}

      <ActionBar>
        <Button
          variant="gold"
          icon="CheckCircle2"
          onClick={() => onComplete(step, { seconds: totalSec - left, checks: checkedCount })}
        >
          {done ? 'Terminer' : 'Valider la pratique'}
        </Button>
        {checkedCount > 0 && (
          <span className="text-[11px] text-ash">
            {checkedCount}/{step.checklist?.length || 0} critères validés
          </span>
        )}
      </ActionBar>
    </div>
  )
}

/* ------------------------------- Aiguillage ------------------------------- */

export const StepRenderer = ({ step, ...rest }) => {
  switch (step.kind) {
    case 'illustration':
      return <IllustrationStep step={step} {...rest} />
    case 'clip':
      return <ClipStep step={step} {...rest} />
    case 'audio':
      return <AudioStep step={step} {...rest} />
    case 'reading':
      return <ReadingStep step={step} {...rest} />
    case 'quiz':
      return <QuizStep step={step} {...rest} />
    case 'practice':
      return <PracticeStep step={step} {...rest} />
    default:
      return null
  }
}

/* --------------------------- Carte de média (UI) --------------------------- */

export const MediaRow = ({ media, stored, onDownload, onRemove, busy, pct }) => {
  const meta = KIND_META[media.kind] || KIND_META.text
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 p-3">
      <div className="rounded-lg border p-2" style={{ borderColor: `${meta.color}44`, background: `${meta.color}14` }}>
        <Icon name={meta.icon} size={15} style={{ color: meta.color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-medium text-gold-100">{media.title}</p>
        <p className="truncate text-[11px] text-ash">{media.subtitle}</p>
        {typeof pct === 'number' && <ProgressBar className="mt-1.5" value={pct} tone={meta.color} height={4} />}
      </div>
      {stored ? (
        <div className="flex shrink-0 items-center gap-1.5">
          <Chip tone="jade" icon="CheckCircle2">
            Hors-ligne
          </Chip>
          {onRemove && (
            <button type="button" className="rounded-lg p-1.5 text-ash transition hover:text-rose-300" onClick={() => onRemove(media)} aria-label="Retirer">
              <Icon name="Trash2" size={14} />
            </button>
          )}
        </div>
      ) : (
        <Button size="sm" variant="ghost" icon="Download" disabled={busy} onClick={() => onDownload(media)}>
          {busy ? '…' : 'Télécharger'}
        </Button>
      )}
    </div>
  )
}

export default StepRenderer
