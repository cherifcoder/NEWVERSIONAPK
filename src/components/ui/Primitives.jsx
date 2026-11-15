import { useEffect } from 'react'
import Icon from './Icon'
import { cx } from '../../lib/utils'

/* ------------------------------ Panel ------------------------------ */
export const Panel = ({ className = '', children, glow = false, flat = false, ...rest }) => (
  <div
    className={cx(flat ? 'panel-flat' : 'panel', glow && 'anim-scan overflow-hidden', 'p-4', className)}
    {...rest}
  >
    {children}
  </div>
)

/* --------------------------- SectionTitle --------------------------- */
export const SectionTitle = ({ eyebrow, title, subtitle, icon, right, className = '' }) => (
  <div className={cx('flex items-start justify-between gap-3', className)}>
    <div className="min-w-0">
      {eyebrow && (
        <div className="eyebrow mb-1 flex items-center gap-2">
          {icon && <Icon name={icon} size={13} />}
          {eyebrow}
        </div>
      )}
      {title && <h2 className="display text-xl leading-tight text-gold-100 sm:text-2xl">{title}</h2>}
      {subtitle && <p className="mt-1 text-[13px] leading-relaxed text-ash">{subtitle}</p>}
    </div>
    {right && <div className="shrink-0">{right}</div>}
  </div>
)

/* ------------------------------ Chip ------------------------------ */
export const Chip = ({ children, tone = 'gold', className = '', icon }) => {
  const tones = {
    gold: 'text-gold-200 border-gold-500/25 bg-gold-500/8',
    jade: 'text-emerald-200 border-emerald-500/25 bg-emerald-500/8',
    blood: 'text-rose-200 border-rose-500/25 bg-rose-500/8',
    sapphire: 'text-sky-200 border-sky-500/25 bg-sky-500/8',
    slate: 'text-slate-300 border-slate-500/25 bg-slate-500/8',
  }
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10.5px] font-semibold tracking-wide',
        tones[tone] || tones.gold,
        className,
      )}
    >
      {icon && <Icon name={icon} size={11} />}
      {children}
    </span>
  )
}

/* ------------------------------ Stat ------------------------------ */
export const Stat = ({ label, value, unit, icon, tone = 'gold', hint, className = '' }) => {
  const colors = {
    gold: 'text-gold-300',
    jade: 'text-emerald-300',
    blood: 'text-rose-300',
    sapphire: 'text-sky-300',
    slate: 'text-slate-300',
  }
  return (
    <div className={cx('panel-flat p-3', className)}>
      <div className="flex items-center gap-2 text-[10.5px] font-semibold tracking-widest text-ash uppercase">
        {icon && <Icon name={icon} size={12} className={colors[tone]} />}
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className={cx('font-mono text-xl font-medium tabular-nums', colors[tone])}>{value}</span>
        {unit && <span className="text-[11px] text-ash">{unit}</span>}
      </div>
      {hint && <div className="mt-0.5 text-[11px] text-ash/80">{hint}</div>}
    </div>
  )
}

/* --------------------------- ProgressRing --------------------------- */
export const ProgressRing = ({
  value = 0,
  size = 132,
  stroke = 9,
  label,
  sublabel,
  tone = '#cfa851',
  track = 'rgba(255,255,255,0.07)',
}) => {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, value))
  const offset = c - (clamped / 100) * c
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="display text-3xl leading-none text-gold-100 tabular-nums">
          {Math.round(clamped)}
          <span className="text-base text-gold-400">%</span>
        </span>
        {label && <span className="mt-1 text-[10px] font-semibold tracking-[0.18em] text-ash uppercase">{label}</span>}
        {sublabel && <span className="mt-0.5 text-[10.5px] text-ash/80">{sublabel}</span>}
      </div>
    </div>
  )
}

/* ---------------------------- ProgressBar ---------------------------- */
export const ProgressBar = ({ value = 0, tone = '#cfa851', height = 6, className = '' }) => (
  <div className={cx('w-full overflow-hidden rounded-full bg-white/6', className)} style={{ height }}>
    <div
      className="h-full rounded-full transition-all duration-700"
      style={{
        width: `${Math.max(0, Math.min(100, value))}%`,
        background: `linear-gradient(90deg, ${tone}66, ${tone})`,
      }}
    />
  </div>
)

/* ------------------------------ Button ------------------------------ */
export const Button = ({
  children,
  variant = 'ghost',
  icon,
  iconRight,
  className = '',
  full = false,
  size = 'md',
  ...rest
}) => {
  const sizes = { sm: 'px-3 py-1.5 text-[12px]', md: 'px-4 py-2.5 text-[13px]', lg: 'px-5 py-3 text-sm' }
  return (
    <button
      className={cx('btn', `btn-${variant}`, sizes[size], full && 'w-full', className)}
      {...rest}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 13 : 15} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 13 : 15} />}
    </button>
  )
}

/* ------------------------------ Modal ------------------------------ */
export const Modal = ({ open, onClose, title, subtitle, children, footer, wide = false }) => {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm anim-fade-in" onClick={onClose} />
      <div
        className={cx(
          'panel relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-b-none p-5 anim-fade-up sm:rounded-4xl',
          wide ? 'sm:max-w-2xl' : 'sm:max-w-lg',
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="display text-lg text-gold-100">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-[12.5px] text-ash">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ash transition hover:bg-white/8 hover:text-ivory">
            <Icon name="X" size={17} />
          </button>
        </div>
        {children}
        {footer && <div className="mt-5 flex flex-wrap gap-2 border-t border-gold-500/12 pt-4">{footer}</div>}
      </div>
    </div>
  )
}

/* ------------------------------ Tabs ------------------------------ */
export const Tabs = ({ tabs, value, onChange, className = '' }) => (
  <div className={cx('flex gap-1.5 overflow-x-auto pb-1', className)}>
    {tabs.map((t) => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        className={cx(
          'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition',
          value === t.id
            ? 'border-gold-500/45 bg-gold-500/15 text-gold-100'
            : 'border-white/8 bg-white/3 text-ash hover:border-gold-500/25 hover:text-ivory',
        )}
      >
        {t.icon && <Icon name={t.icon} size={12} />}
        {t.label}
      </button>
    ))}
  </div>
)

/* ------------------------------ Field ------------------------------ */
export const Labeled = ({ label, hint, children, className = '' }) => (
  <label className={cx('block', className)}>
    {label && <span className="mb-1.5 block text-[11.5px] font-semibold tracking-wide text-gold-200/90">{label}</span>}
    {children}
    {hint && <span className="mt-1 block text-[11px] text-ash/80">{hint}</span>}
  </label>
)

/* ---------------------------- EmptyState ---------------------------- */
export const EmptyState = ({ icon = 'Sparkles', title, text, action }) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gold-500/20 bg-white/2 px-6 py-10 text-center">
    <div className="rounded-full border border-gold-500/25 bg-gold-500/8 p-3">
      <Icon name={icon} size={22} className="text-gold-300" />
    </div>
    <p className="display text-base text-gold-100">{title}</p>
    {text && <p className="max-w-sm text-[12.5px] leading-relaxed text-ash">{text}</p>}
    {action}
  </div>
)

/* ------------------------------ Toast ------------------------------ */
export const Toast = ({ message, tone = 'gold', onDone }) => {
  useEffect(() => {
    if (!message) return undefined
    const t = setTimeout(() => onDone?.(), 2600)
    return () => clearTimeout(t)
  }, [message, onDone])
  if (!message) return null
  const tones = {
    gold: 'border-gold-500/40 bg-gold-500/12 text-gold-100',
    jade: 'border-emerald-500/40 bg-emerald-500/12 text-emerald-100',
    blood: 'border-rose-500/40 bg-rose-500/12 text-rose-100',
  }
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 sm:bottom-8">
      <div className={cx('rounded-xl border px-4 py-2.5 text-[12.5px] font-medium shadow-2xl anim-fade-up backdrop-blur-md', tones[tone])}>
        {message}
      </div>
    </div>
  )
}

/* --------------------------- MarkdownLite --------------------------- */
/**
 * Rendu Markdown minimaliste pour les comptes-rendus de l'agent IA.
 * Gère : ## / ### titres, **gras**, *italique*, > citation, listes -, listes 1.
 */
export const MarkdownLite = ({ text = '', className = '' }) => {
  const lines = String(text).split('\n')
  const out = []
  let list = null

  const inline = (s, key) => {
    const parts = []
    let rest = s
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
    let m
    let i = 0
    while ((m = regex.exec(rest)) !== null) {
      if (m.index > i) parts.push(rest.slice(i, m.index))
      const token = m[0]
      if (token.startsWith('**'))
        parts.push(
          <strong key={`${key}-b-${m.index}`} className="font-semibold text-gold-100">
            {token.slice(2, -2)}
          </strong>,
        )
      else if (token.startsWith('`'))
        parts.push(
          <code key={`${key}-c-${m.index}`} className="rounded bg-white/8 px-1 py-0.5 font-mono text-[12px] text-gold-200">
            {token.slice(1, -1)}
          </code>,
        )
      else
        parts.push(
          <em key={`${key}-i-${m.index}`} className="text-ivory/80 italic">
            {token.slice(1, -1)}
          </em>,
        )
      i = m.index + token.length
    }
    if (i < rest.length) parts.push(rest.slice(i))
    return parts
  }

  const flush = () => {
    if (list) {
      out.push(
        list.ordered ? (
          <ol key={`l-${out.length}`} className="ml-4 list-decimal space-y-1.5">
            {list.items}
          </ol>
        ) : (
          <ul key={`l-${out.length}`} className="space-y-1.5">
            {list.items}
          </ul>
        ),
      )
      list = null
    }
  }

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd()
    if (/^###\s+/.test(line)) {
      flush()
      out.push(
        <h4 key={idx} className="eyebrow mt-4 mb-1.5">
          {line.replace(/^###\s+/, '')}
        </h4>,
      )
    } else if (/^##\s+/.test(line)) {
      flush()
      out.push(
        <h3 key={idx} className="display mt-1 mb-2 text-base text-gold-200">
          {inline(line.replace(/^##\s+/, ''), idx)}
        </h3>,
      )
    } else if (/^#\s+/.test(line)) {
      flush()
      out.push(
        <h2 key={idx} className="display mb-2 text-lg text-gold-100">
          {inline(line.replace(/^#\s+/, ''), idx)}
        </h2>,
      )
    } else if (/^>\s?/.test(line)) {
      flush()
      out.push(
        <blockquote key={idx} className="my-2 border-l-2 border-gold-500/50 bg-gold-500/5 py-1.5 pl-3 text-[12.5px] text-gold-200/90 italic">
          {inline(line.replace(/^>\s?/, ''), idx)}
        </blockquote>,
      )
    } else if (/^[-*]\s+/.test(line)) {
      if (!list || list.ordered) flush()
      list ||= { ordered: false, items: [] }
      list.items.push(
        <li key={idx} className="flex gap-2 text-[13px] leading-relaxed text-ivory/88">
          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-gold-400" />
          <span>{inline(line.replace(/^[-*]\s+/, ''), idx)}</span>
        </li>,
      )
    } else if (/^\d+\.\s+/.test(line)) {
      if (!list || !list.ordered) flush()
      list ||= { ordered: true, items: [] }
      list.items.push(
        <li key={idx} className="pl-1 text-[13px] leading-relaxed text-ivory/88">
          {inline(line.replace(/^\d+\.\s+/, ''), idx)}
        </li>,
      )
    } else if (!line.trim()) {
      flush()
      out.push(<div key={idx} className="h-2" />)
    } else {
      flush()
      out.push(
        <p key={idx} className="text-[13px] leading-relaxed text-ivory/88">
          {inline(line, idx)}
        </p>,
      )
    }
  })
  flush()

  return <div className={cx('space-y-0.5', className)}>{out}</div>
}
