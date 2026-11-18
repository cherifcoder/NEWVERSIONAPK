import { useEffect, useRef, useState } from 'react'
import Icon from '../../components/ui/Icon'
import { Button, Modal } from '../../components/ui/Primitives'
import { EXIT_HOLD_MS, EXIT_PHRASE } from '../../data/deepwork'
import { cx } from '../../lib/utils'

/** Tolère les apostrophes typographiques et les espaces multiples. */
const normalize = (value) =>
  String(value || '')
    .replace(/[\u2018\u2019\u02BC`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()

/**
 * ExitDialog — la sortie de secours d'un bloc verrouillé, volontairement
 * difficile : appui continu de 5 secondes, puis recopie exacte d'une phrase.
 * L'objectif n'est pas d'empêcher l'abandon, mais d'empêcher l'abandon
 * impulsif.
 */
export const ExitDialog = ({ open, onClose, onConfirm, elapsedLabel, blocked = 0 }) => {
  const [phase, setPhase] = useState('hold')
  const [progress, setProgress] = useState(0)
  const [phrase, setPhrase] = useState('')
  const timer = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    setPhase('hold')
    setProgress(0)
    setPhrase('')
    return () => {
      if (timer.current) clearInterval(timer.current)
      timer.current = null
    }
  }, [open])

  const stopHold = () => {
    if (timer.current) {
      clearInterval(timer.current)
      timer.current = null
    }
    setProgress(0)
  }

  const startHold = () => {
    if (phase !== 'hold' || timer.current) return
    const startedAt = Date.now()
    timer.current = setInterval(() => {
      const ratio = Math.min(1, (Date.now() - startedAt) / EXIT_HOLD_MS)
      setProgress(ratio * 100)
      if (ratio >= 1) {
        if (timer.current) clearInterval(timer.current)
        timer.current = null
        setProgress(100)
        setPhase('type')
      }
    }, 50)
  }

  const phraseOk = normalize(phrase) === normalize(EXIT_PHRASE)
  const ringR = 30
  const ringC = 2 * Math.PI * ringR

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Sortie de secours"
      subtitle="Tu peux abandonner ce bloc. Mais pas sur un coup de tête."
    >
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/6 p-3 text-[12px] leading-relaxed text-rose-100">
        <div className="flex items-center gap-2 font-semibold">
          <Icon name="AlertTriangle" size={14} />
          Abandonner maintenant
        </div>
        <p className="mt-1 text-rose-100/85">
          Bloc en cours depuis <strong>{elapsedLabel}</strong>
          {blocked > 0 ? ` · ${blocked} tentative${blocked > 1 ? 's' : ''} de contournement` : ''}. Le temps déjà travaillé sera
          tout de même crédité.
        </p>
      </div>

      {phase === 'hold' ? (
        <div className="mt-4 flex flex-col items-center gap-3">
          <button
            type="button"
            onPointerDown={startHold}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            onPointerCancel={stopHold}
            className={cx(
              'relative flex h-24 w-24 touch-none items-center justify-center rounded-full border-2 transition select-none',
              progress > 0 ? 'border-rose-400/70 bg-rose-500/12' : 'border-white/12 bg-white/4 hover:border-rose-400/40',
            )}
          >
            <svg width={72} height={72} className="absolute -rotate-90">
              <circle cx={36} cy={36} r={ringR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
              <circle
                cx={36}
                cy={36}
                r={ringR}
                fill="none"
                stroke="#fb7185"
                strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray={ringC}
                strokeDashoffset={ringC - (progress / 100) * ringC}
              />
            </svg>
            <span className="flex flex-col items-center gap-1 text-rose-200">
              <Icon name="Hand" size={20} />
              <span className="text-[10px] font-semibold tracking-widest uppercase">
                {progress > 0 ? `${Math.ceil((EXIT_HOLD_MS / 1000) * (1 - progress / 100))} s` : 'Appuyer'}
              </span>
            </span>
          </button>
          <p className="text-center text-[12px] text-ash">
            Maintiens le doigt appuyé <strong className="text-ivory">5 secondes</strong> pour déverrouiller l'étape suivante.
          </p>
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-gold-200">
            <Icon name="KeyRound" size={13} />
            Recopie exactement cette phrase
          </div>
          <div className="mt-2 rounded-lg border border-gold-500/25 bg-gold-500/8 px-3 py-2 font-mono text-[13px] tracking-wide text-gold-100 select-none">
            {EXIT_PHRASE}
          </div>
          <input
            autoFocus
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="Tape la phrase ici…"
            spellCheck={false}
            autoCapitalize="characters"
            autoComplete="off"
            className="field mt-3 w-full font-mono text-[13px]"
          />
          <div className={cx('mt-1.5 flex items-center gap-1.5 text-[11.5px]', phraseOk ? 'text-emerald-300' : 'text-ash')}>
            <Icon name={phraseOk ? 'CheckCircle2' : 'Info'} size={12} />
            {phraseOk ? 'Phrase correcte.' : 'La phrase doit correspondre au caractère près.'}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2 border-t border-gold-500/12 pt-4">
        <Button variant="gold" icon="Play" onClick={onClose}>
          Reprendre le travail
        </Button>
        <Button
          variant="danger"
          disabled={phase !== 'type' || !phraseOk}
          icon="LogOut"
          onClick={() => onConfirm?.('abandon')}
        >
          Abandonner le bloc
        </Button>
      </div>
    </Modal>
  )
}

export default ExitDialog
