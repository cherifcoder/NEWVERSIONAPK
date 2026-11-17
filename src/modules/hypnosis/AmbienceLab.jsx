/* ------------------------------------------------------------------
   AmbienceLab.jsx — Onglet « Ambiances »
   ------------------------------------------------------------------
   Un petit laboratoire sonore, utilisable indépendamment des séances :
   • Battements binauraux (6 presets : delta → gamma)
   • Boucles d'ambiance embarquées (nappe, pluie, vagues, forêt, feu)
   • Repères sonores (cloche, gong, bol, souffles)

   Tout est synthétisé / lu par Web Audio, sans réseau. Rien n'est joué
   tant que l'utilisateur n'a pas touché un bouton (politique des
   navigateurs et du WebView).
------------------------------------------------------------------- */

import { useEffect, useState } from 'react'
import Icon from '../../components/ui/Icon'
import { Button, Chip, Panel, SectionTitle } from '../../components/ui/Primitives'
import { AMBIENCE_LIST, BINAURAL_PRESETS, CUE_LIST, HYPNOSIS_SAFETY } from '../../data/hypnosis'
import {
  audioSupported,
  playCue,
  primeAudio,
  setMasterVolume,
  startAmbience,
  startBinaural,
  stopAll,
  stopAmbience,
  stopBinaural,
} from '../../lib/hypnosisAudio'
import { cx, formatBytes } from '../../lib/utils'

export const AmbienceLab = ({ onGoOffline }) => {
  const [primed, setPrimed] = useState(false)
  const [binauralId, setBinauralId] = useState(null)
  const [ambienceId, setAmbienceId] = useState(null)
  const [volume, setVolume] = useState(0.6)
  const [cuePlaying, setCuePlaying] = useState(null)

  // Le volume maître suit le curseur en direct.
  useEffect(() => {
    setMasterVolume(volume, 0.15)
  }, [volume])

  // Nettoyage : on coupe tout en quittant l'onglet.
  useEffect(() => () => stopAll({ fade: 0.3 }), [])

  const prime = async () => {
    const ok = await primeAudio()
    setPrimed(ok)
    return ok
  }

  const toggleBinaural = async (preset) => {
    if (!primed) await prime()
    if (binauralId === preset.id) {
      stopBinaural({ fade: 1 })
      setBinauralId(null)
      return
    }
    startBinaural({ carrier: preset.carrier, beat: preset.beat, gain: 0.12 })
    setBinauralId(preset.id)
  }

  const toggleAmbience = async (item) => {
    if (!primed) await prime()
    if (ambienceId === item.id) {
      stopAmbience({ fade: 1 })
      setAmbienceId(null)
      return
    }
    const ok = await startAmbience(item.src, { gain: 0.5 })
    setAmbienceId(ok ? item.id : null)
  }

  const fireCue = async (item) => {
    if (!primed) await prime()
    setCuePlaying(item.id)
    await playCue(item.src, { gain: 0.7 })
    setTimeout(() => setCuePlaying((c) => (c === item.id ? null : c)), 1400)
  }

  if (!audioSupported()) {
    return (
      <Panel>
        <SectionTitle eyebrow="Audio" title="Audio indisponible" icon="VolumeX" />
        <p className="mt-2 text-[12.5px] leading-relaxed text-ash">
          Ce navigateur / WebView ne fournit pas d'API audio. Les séances restent utilisables en lecture silencieuse :
          le texte des phases s'affiche à l'écran et le repère visuel marque chaque changement.
        </p>
      </Panel>
    )
  }

  return (
    <div className="space-y-4">
      <Panel glow>
        <SectionTitle
          eyebrow="Laboratoire sonore"
          title="Battements binauraux & ambiances"
          subtitle="À utiliser au casque pour les battements binauraux. Monte le volume progressivement."
          icon="SlidersHorizontal"
          right={
            <Chip tone={primed ? 'jade' : 'slate'} icon={primed ? 'Volume2' : 'Power'}>
              {primed ? 'Son actif' : 'Son en veille'}
            </Chip>
          }
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {!primed && (
            <Button variant="gold" icon="Power" onClick={prime}>
              Activer le son
            </Button>
          )}
          <label className="flex items-center gap-2 text-[12px] text-ash">
            <Icon name="Volume1" size={14} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 w-40 cursor-pointer accent-gold-400"
            />
            <span className="w-9 font-mono text-[11px] text-ash">{Math.round(volume * 100)}%</span>
          </label>
          {(binauralId || ambienceId) && (
            <Button
              variant="ghost"
              icon="Square"
              onClick={() => {
                stopAll({ fade: 0.8 })
                setBinauralId(null)
                setAmbienceId(null)
              }}
            >
              Tout couper
            </Button>
          )}
        </div>
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/8 p-2.5 text-[11.5px] leading-relaxed text-amber-100">
          <Icon name="AlertTriangle" size={14} className="mt-0.5 shrink-0 text-amber-300" />
          {HYPNOSIS_SAFETY}
        </p>
      </Panel>

      {/* ---------------------- Battements binauraux ---------------------- */}
      <Panel>
        <SectionTitle
          eyebrow="Ondes cérébrales"
          title="Battements binauraux"
          subtitle="Deux fréquences très proches, une par oreille : le cerveau perçoit la différence."
          icon="Radio"
        />
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {BINAURAL_PRESETS.map((p) => {
            const active = binauralId === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleBinaural(p)}
                className={cx(
                  'flex items-center gap-3 rounded-2xl border p-3 text-left transition',
                  active ? 'border-gold-500/45 bg-gold-500/12' : 'border-white/8 bg-white/2 hover:border-gold-500/25',
                )}
              >
                <span
                  className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-full border', active && 'anim-pulse-soft')}
                  style={{ borderColor: `${p.color}66`, color: p.color, background: `${p.color}1a` }}
                >
                  <Icon name={active ? 'Pause' : p.icon} size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold text-gold-100">{p.label}</span>
                  <span className="block text-[10.5px] text-ash">{p.usage}</span>
                </span>
                <span className="shrink-0 font-mono text-[10.5px] text-gold-300">
                  {p.carrier}+{p.beat} Hz
                </span>
              </button>
            )
          })}
        </div>
      </Panel>

      {/* --------------------------- Ambiances --------------------------- */}
      <Panel>
        <SectionTitle
          eyebrow="Fonds sonores"
          title="Boucles d'ambiance"
          subtitle="Fichiers embarqués dans l'application : lisibles sans réseau."
          icon="Waves"
          right={
            onGoOffline ? (
              <Button size="sm" variant="ghost" icon="HardDrive" onClick={onGoOffline}>
                Hors-ligne
              </Button>
            ) : null
          }
        />
        <div className="mt-3 space-y-1.5">
          {AMBIENCE_LIST.map((a) => {
            const active = ambienceId === a.id
            return (
              <div
                key={a.id}
                className={cx(
                  'flex items-center gap-3 rounded-xl border p-2.5 transition',
                  active ? 'border-sky-500/40 bg-sky-500/10' : 'border-white/8 bg-white/2',
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleAmbience(a)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-200 transition hover:bg-gold-500/20"
                  aria-label={active ? `Arrêter ${a.title}` : `Écouter ${a.title}`}
                >
                  <Icon name={active ? 'Pause' : 'Play'} size={13} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-gold-100">{a.title}</p>
                  <p className="truncate text-[10.5px] text-ash">{a.subtitle}</p>
                </div>
                <Chip tone="slate" icon="Clock">
                  {a.duration}
                </Chip>
                <span className="shrink-0 font-mono text-[10.5px] text-ash">{formatBytes(a.bytes)}</span>
              </div>
            )
          })}
        </div>
      </Panel>

      {/* ------------------------ Repères sonores ------------------------ */}
      <Panel flat>
        <SectionTitle
          eyebrow="Signaux"
          title="Repères sonores"
          subtitle="Utilisés aux transitions de phase pendant les séances."
          icon="BellRing"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {CUE_LIST.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => fireCue(c)}
              className={cx(
                'flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition',
                cuePlaying === c.id
                  ? 'border-emerald-500/45 bg-emerald-500/15 text-emerald-100'
                  : 'border-white/8 bg-white/3 text-ash hover:border-gold-500/25 hover:text-ivory',
              )}
            >
              <Icon name={cuePlaying === c.id ? 'AudioWaveform' : 'BellRing'} size={13} />
              {c.title}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-ash">
          Les repères sonores marquent le passage d'une phase à l'autre sans casser l'état de détente. Ils sont
          facultatifs : tu peux les désactiver dans une séance (le rythme des phases reste identique).
        </p>
      </Panel>
    </div>
  )
}

export default AmbienceLab
