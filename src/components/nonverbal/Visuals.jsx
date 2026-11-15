/* ------------------------------------------------------------------
   Visuals.jsx — Rendu des illustrations et mini-vidéos vectorielles
   ------------------------------------------------------------------
   Le SVG est produit par src/lib/figure.js (fonction pure → chaîne SVG)
   puis injecté. Aucune requête réseau, aucun fichier à télécharger :
   le dessin est calculé par l'appareil, en clair ou en sombre.
------------------------------------------------------------------- */

import { useMemo, useState } from 'react'
import Icon from '../ui/Icon'
import { Chip } from '../ui/Primitives'
import { POSES, clipSvg, figureSvg } from '../../lib/figure'
import { CLIPS } from '../../data/nonverbal/media'
import { cx } from '../../lib/utils'

/** Vrai si l'utilisateur a demandé à réduire les animations (accessibilité). */
const prefersReducedMotion = () => {
  try {
    return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  } catch {
    return false
  }
}

/* ----------------------------- Cadre « scène » ----------------------------- */

const Stage = ({ children, themeName = 'dark', className = '', ratio = 'aspect-[4/3]', ...rest }) => (
  <div
    className={cx(
      'relative overflow-hidden rounded-2xl border',
      themeName === 'dark' ? 'border-gold-500/18 bg-void/60' : 'border-ink-600/30 bg-[#f8f4ea]',
      ratio,
      className,
    )}
    {...rest}
  >
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          themeName === 'dark'
            ? 'radial-gradient(80% 55% at 50% 8%, rgba(207,168,81,0.16), transparent 70%)'
            : 'radial-gradient(80% 55% at 50% 8%, rgba(185,141,52,0.14), transparent 70%)',
      }}
    />
    <div className="absolute inset-0 [&>svg]:h-full [&>svg]:w-full">{children}</div>
  </div>
)

/* ------------------------------ Illustration ------------------------------ */

export const Figure = ({ poseId, pose, showAxis, props, themeName = 'dark', className = '' }) => {
  const p = POSES[poseId]
  const html = useMemo(
    () =>
      figureSvg(pose || p?.pose || {}, {
        theme: themeName,
        showAxis: showAxis ?? p?.showAxis,
        props: props ?? p?.props,
      }),
    [pose, p, showAxis, props, themeName],
  )
  return (
    <div
      className={cx('[&>svg]:h-full [&>svg]:w-full', className)}
      // SVG produit par une fonction pure locale (aucune entrée utilisateur)
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export const Illustration = ({ poseId, showAxis, themeName = 'dark', ratio }) => {
  const p = POSES[poseId]
  return (
    <Stage themeName={themeName} ratio={ratio}>
      <Figure poseId={poseId} showAxis={showAxis} themeName={themeName} />
      {p && (
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 pt-6 pb-2">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-gold-100">{p.label}</p>
            <p className="truncate text-[10px] text-ash">{p.intent}</p>
          </div>
        </div>
      )}
    </Stage>
  )
}

/* ------------------------------ Mini-vidéo SVG ------------------------------ */

export const ClipView = ({ clipId, themeName = 'dark', ratio = 'aspect-[4/3]', compact = false }) => {
  const clip = CLIPS[clipId]
  // Respecte « réduire les animations » : on démarre en pause.
  const [paused, setPaused] = useState(prefersReducedMotion)
  const [runKey, setRunKey] = useState(0)

  const html = useMemo(
    () =>
      clipSvg({
        frames: clip?.frames || [],
        title: clip?.title,
        subtitle: clip?.subtitle,
        theme: themeName,
        hold: clip?.hold || 2.6,
      }),
    [clip, themeName],
  )

  if (!clip) return null

  return (
    <div className="space-y-2">
      <Stage themeName={themeName} ratio={ratio} className="clip-stage" data-paused={paused}>
        <div
          key={runKey}
          className="absolute inset-0 [&>svg]:h-full [&>svg]:w-full"
          // SVG produit par une fonction pure locale
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <button
          type="button"
          onClick={() => setPaused((v) => !v)}
          className="absolute top-2 right-2 rounded-full border border-gold-500/30 bg-black/45 p-1.5 text-gold-100 backdrop-blur-sm"
          aria-label={paused ? 'Reprendre' : 'Mettre en pause'}
        >
          <Icon name={paused ? 'Play' : 'Pause'} size={13} />
        </button>
      </Stage>

      {!compact && (
        <div className="flex items-center gap-2">
          <Chip tone="blood" icon="Video">
            Mini-vidéo vectorielle
          </Chip>
          <Chip tone="slate" icon="Layers">
            {clip.frames.length} plans
          </Chip>
          <button
            type="button"
            className="chip transition hover:border-gold-500/50"
            onClick={() => {
              setRunKey((k) => k + 1)
              setPaused(false)
            }}
          >
            <Icon name="RotateCcw" size={11} /> Rejouer
          </button>
        </div>
      )}
    </div>
  )
}

/* --------------------------- Bande de plans (storyboard) --------------------------- */

export const Storyboard = ({ clipId, themeName = 'dark' }) => {
  const clip = CLIPS[clipId]
  if (!clip) return null
  return (
    <div className="grid grid-cols-3 gap-2">
      {clip.frames.map((f, i) => (
        <div key={f} className="space-y-1">
          <Stage themeName={themeName} ratio="aspect-square">
            <Figure poseId={f} themeName={themeName} />
          </Stage>
          <p className="text-center text-[10px] text-ash">
            {i + 1}. {POSES[f]?.label || f}
          </p>
        </div>
      ))}
    </div>
  )
}

export default Illustration
