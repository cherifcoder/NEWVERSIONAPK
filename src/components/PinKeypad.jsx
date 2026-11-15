import { useEffect, useMemo, useState } from 'react'
import Icon from './ui/Icon'
import { cx, shuffle } from '../lib/utils'

/**
 * PinKeypad — Pavé numérique à disposition ALÉATOIRE.
 * Objectif : empêcher toute lecture du code par un observateur
 * (empreintes de doigts, mémorisation de la position des touches).
 */
export const PinKeypad = ({ length = 4, value = '', onDigit, onDelete, onShuffle, disabled }) => {
  const [order, setOrder] = useState(() => shuffle(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']))

  const reshuffle = () => {
    const next = shuffle(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'])
    setOrder(next)
    onShuffle?.()
  }

  // Re-mélange à chaque changement de longueur saisie (protection anti-observation)
  useEffect(() => {
    setOrder((prev) => shuffle(prev))
  }, [value.length])

  const keys = useMemo(() => order, [order])

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-2.5">
        {keys.slice(0, 9).map((k) => (
          <KeyButton key={k} label={k} onClick={() => onDigit(k)} disabled={disabled} />
        ))}
        <button
          type="button"
          onClick={reshuffle}
          className="flex h-14 items-center justify-center rounded-2xl border border-gold-500/15 bg-white/3 text-ash transition hover:border-gold-500/35 hover:text-gold-200"
          title="Mélanger les touches"
        >
          <Icon name="Shuffle" size={18} />
        </button>
        <KeyButton label={keys[9]} onClick={() => onDigit(keys[9])} disabled={disabled} />
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled || !value.length}
          className={cx(
            'flex h-14 items-center justify-center rounded-2xl border transition',
            value.length
              ? 'border-gold-500/25 bg-gold-500/8 text-gold-200 hover:bg-gold-500/16'
              : 'border-white/6 bg-white/2 text-ash/40',
          )}
          title="Effacer"
        >
          <Icon name="Delete" size={19} />
        </button>
      </div>
      <p className="mt-3 text-center text-[10.5px] tracking-wide text-ash/70">
        Disposition aléatoire · {value.length}/{length}
      </p>
    </div>
  )
}

const KeyButton = ({ label, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="display h-14 rounded-2xl border border-gold-500/18 bg-gradient-to-b from-white/6 to-white/2 text-2xl text-gold-100 transition active:scale-95 active:border-gold-500/50 active:bg-gold-500/15 disabled:opacity-40"
  >
    {label}
  </button>
)

/* ------------------------- Affichage des points ------------------------- */
export const PinDots = ({ length = 4, filled = 0, error = false }) => (
  <div className={cx('flex items-center justify-center gap-3', error && 'anim-fade-in')}>
    {Array.from({ length }).map((_, i) => (
      <span
        key={i}
        className={cx(
          'h-3.5 w-3.5 rounded-full border transition-all duration-200',
          i < filled
            ? error
              ? 'scale-110 border-rose-400 bg-rose-400'
              : 'scale-110 border-gold-400 bg-gold-400 shadow-[0_0_12px_rgba(207,168,81,0.65)]'
            : 'border-gold-500/35 bg-transparent',
        )}
      />
    ))}
  </div>
)

export default PinKeypad
