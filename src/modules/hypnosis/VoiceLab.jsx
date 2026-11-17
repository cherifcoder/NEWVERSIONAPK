/* ------------------------------------------------------------------
   VoiceLab.jsx — Onglet « Voix » du module hypnose
   ------------------------------------------------------------------
   La voix des séances, réglée une fois pour toutes :

   • Voix embarquée : deux voix neuronales françaises (Denise, Henri)
     enregistrées dans l'app — douces, humaines, identiques sur tous les
     appareils et 100 % hors-ligne. Pré-écoute en un clic.
   • Voix du téléphone : repli sur la synthèse vocale du système.
   • Silencieuse : le texte seul, au rythme des phases.

   Le rythme (longueur des silences entre les phrases) se règle ici aussi.
------------------------------------------------------------------- */

import { useEffect, useState } from 'react'
import Icon from '../../components/ui/Icon'
import { Button, Chip, Panel, SectionTitle } from '../../components/ui/Primitives'
import { useApp } from '../../context/AppContext'
import {
  NEURAL_VOICE_LIST,
  VOICE_ENGINE,
  VOICE_TOTAL_BYTES,
  voiceSampleSrc,
  voiceStats,
} from '../../data/hypnosis/media'
import {
  audioSupported,
  playVoiceLine,
  primeAudio,
  speak,
  stopAll,
  ttsSupported,
  warmVoices,
} from '../../lib/hypnosisAudio'
import { cx, formatBytes, formatMinutes } from '../../lib/utils'

const SAMPLE_TEXT = "Ferme les yeux, respire lentement, et laisse ma voix t'accompagner."

const ENGINES = [
  { id: 'neural', label: 'Voix embarquée', hint: 'Douce, humaine, identique sur tous les appareils', icon: 'Sparkles' },
  { id: 'device', label: 'Voix du téléphone', hint: 'Synthèse vocale du système', icon: 'Smartphone' },
  { id: 'off', label: 'Silencieuse', hint: 'Le texte seul, au rythme des phases', icon: 'VolumeX' },
]

const PAUSES = [
  { value: 0.6, label: 'Courtes', hint: 'Débit plus soutenu' },
  { value: 1, label: 'Moyennes', hint: 'Rythme équilibré' },
  { value: 1.5, label: 'Longues', hint: 'Hypnose profonde, très lent' },
]

const VoiceCard = ({ voice, active, playing, onChoose, onPreview }) => {
  const stats = voiceStats(voice.id)
  return (
    <div
      className={cx(
        'rounded-2xl border p-3 transition',
        active ? 'border-gold-500/45 bg-gold-500/10' : 'border-white/8 bg-white/2 hover:border-gold-500/25',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"
          style={{ borderColor: `${voice.color}66`, color: voice.color, background: `${voice.color}18` }}
        >
          <Icon name={voice.gender === 'Femme' ? 'Sparkles' : 'AudioLines'} size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="display text-[15px] leading-tight text-gold-100">{voice.label}</p>
            <Chip tone="slate">{voice.gender}</Chip>
            {active && <Chip tone="gold" icon="Check">Choisie</Chip>}
          </div>
          <p className="mt-1 text-[11.5px] leading-relaxed text-ivory/70">{voice.description}</p>
          {stats && (
            <p className="mt-1.5 text-[10.5px] text-ash">
              {stats.lines} phrases · {formatMinutes(stats.seconds / 60)} de voix · {formatBytes(stats.bytes)}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 border-t border-gold-500/12 pt-3">
        <Button
          size="sm"
          variant={active ? 'gold' : 'ghost'}
          icon={playing ? 'Volume2' : 'Play'}
          onClick={() => onPreview(voice.id)}
          disabled={!audioSupported()}
        >
          {playing ? 'Écoute…' : 'Écouter un extrait'}
        </Button>
        <Button size="sm" variant={active ? 'ghost' : 'gold'} icon="Check" onClick={() => onChoose(voice.id)} disabled={active}>
          {active ? 'Sélectionnée' : 'Choisir cette voix'}
        </Button>
      </div>
    </div>
  )
}

export const VoiceLab = ({ onGoOffline }) => {
  const { state, hySetPrefs } = useApp()
  const prefs = state.hypnosis?.prefs || {}
  const voiceId = prefs.voiceId || NEURAL_VOICE_LIST[0]?.id || null
  const engine = prefs.voice === false ? 'off' : prefs.voiceEngine || 'neural'
  const pauseValue = typeof prefs.voicePause === 'number' ? prefs.voicePause : 1
  const rate = typeof prefs.voiceRate === 'number' ? prefs.voiceRate : 0.9
  const pitch = typeof prefs.voicePitch === 'number' ? prefs.voicePitch : 0.95

  const [playing, setPlaying] = useState('')
  const [ttsVoices, setTtsVoices] = useState([])

  useEffect(() => {
    warmVoices().then((list) => setTtsVoices((list || []).filter((v) => /^fr[-_]/i.test(v.lang))))
    return () => stopAll({ fade: 0.2 })
  }, [])

  const frenchName = ttsVoices[0]?.name || null

  const previewVoice = async (id) => {
    const src = voiceSampleSrc(id)
    if (!src) return
    stopAll({ fade: 0.1 })
    setPlaying(id)
    await primeAudio()
    await playVoiceLine(src, { gain: 1 })
    setPlaying((cur) => (cur === id ? '' : cur))
  }

  const previewDevice = async () => {
    stopAll({ fade: 0.1 })
    setPlaying('device')
    await primeAudio()
    speak(SAMPLE_TEXT, { rate, pitch, onEnd: () => setPlaying((cur) => (cur === 'device' ? '' : cur)) })
  }

  const chooseVoice = (id) => {
    hySetPrefs({ voiceId: id, voiceEngine: 'neural', voice: true })
  }

  const chooseEngine = (id) => {
    if (id === 'off') hySetPrefs({ voiceEngine: 'off', voice: false })
    else hySetPrefs({ voiceEngine: id, voice: true })
  }

  const choosePause = (value) => hySetPrefs({ voicePause: value })

  return (
    <div className="space-y-4">
      <Panel glow className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-10 h-52 w-52 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SectionTitle
            eyebrow="Voix des séances"
            title="Une voix douce et humaine, toujours la même"
            subtitle="La voix est enregistrée dans l'application : elle ne dépend plus du téléphone, ne change jamais, et fonctionne entièrement hors-ligne."
            icon="AudioLines"
          />
          <div className="flex shrink-0 flex-wrap gap-2">
            <Chip tone="jade" icon="Download">
              {formatBytes(VOICE_TOTAL_BYTES)} embarqués
            </Chip>
            <Chip tone="sapphire" icon="Layers">
              {NEURAL_VOICE_LIST.length} voix
            </Chip>
          </div>
        </div>
        <p className="relative mt-3 flex items-start gap-2 rounded-xl border border-white/8 bg-white/3 p-2.5 text-[11.5px] leading-relaxed text-ash">
          <Icon name="Info" size={14} className="mt-0.5 shrink-0 text-gold-400" />
          {VOICE_ENGINE} — phrases enregistrées une à une, enchaînées par l'application avec un silence entre chacune.
        </p>
      </Panel>

      {/* ---------------------- Voix embarquées ---------------------- */}
      <Panel>
        <SectionTitle eyebrow="Voix embarquées" title="Choisis ta voix" icon="Sparkles" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {NEURAL_VOICE_LIST.map((v) => (
            <VoiceCard
              key={v.id}
              voice={v}
              active={engine === 'neural' && v.id === voiceId}
              playing={playing === v.id}
              onChoose={chooseVoice}
              onPreview={previewVoice}
            />
          ))}
        </div>
        {!audioSupported() && (
          <p className="mt-3 flex items-start gap-2 text-[11.5px] text-amber-200">
            <Icon name="AlertTriangle" size={13} className="mt-0.5 shrink-0" />
            La lecture audio n'est pas disponible dans ce contexte : la pré-écoute est désactivée.
          </p>
        )}
      </Panel>

      {/* ------------------------- Moteur ------------------------- */}
      <Panel>
        <SectionTitle eyebrow="Moteur de voix" title="Comment lire les séances" icon="SlidersHorizontal" />
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {ENGINES.map((e) => {
            const active = engine === e.id
            const disabled = e.id === 'neural' ? !audioSupported() : e.id === 'device' ? !ttsSupported() : false
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => chooseEngine(e.id)}
                disabled={disabled}
                className={cx(
                  'flex items-start gap-3 rounded-2xl border p-3 text-left transition',
                  active ? 'border-gold-500/45 bg-gold-500/10' : 'border-white/8 bg-white/2 hover:border-gold-500/25',
                  disabled && 'opacity-45',
                )}
              >
                <span className={cx('mt-0.5 shrink-0', active ? 'text-gold-200' : 'text-ash')}>
                  <Icon name={e.icon} size={16} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-semibold text-gold-100">{e.label}</span>
                  <span className="block text-[10.5px] leading-relaxed text-ash">{e.hint}</span>
                </span>
              </button>
            )
          })}
        </div>

        {engine === 'device' && (
          <div className="mt-4 space-y-3 rounded-2xl border border-white/8 bg-white/2 p-3">
            <p className="text-[11.5px] text-ash">
              {ttsSupported()
                ? frenchName
                  ? `Voix française détectée : « ${frenchName} ».`
                  : "Aucune voix française détectée : installe-en une dans les réglages du téléphone."
                : "La synthèse vocale n'est pas disponible sur cet appareil."}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-[11.5px] text-ash">
                <span className="mb-1 block">Débit · {rate.toFixed(2)}×</span>
                <input
                  type="range"
                  min="0.6"
                  max="1.2"
                  step="0.05"
                  value={rate}
                  onChange={(e) => hySetPrefs({ voiceRate: Number(e.target.value) })}
                  className="h-1 w-full cursor-pointer accent-gold-400"
                />
              </label>
              <label className="text-[11.5px] text-ash">
                <span className="mb-1 block">Tonalité · {pitch.toFixed(2)}</span>
                <input
                  type="range"
                  min="0.6"
                  max="1.4"
                  step="0.05"
                  value={pitch}
                  onChange={(e) => hySetPrefs({ voicePitch: Number(e.target.value) })}
                  className="h-1 w-full cursor-pointer accent-gold-400"
                />
              </label>
            </div>
            <Button size="sm" variant="ghost" icon="Play" onClick={previewDevice} disabled={!ttsSupported()}>
              {playing === 'device' ? 'Écoute…' : 'Tester la voix du téléphone'}
            </Button>
          </div>
        )}
      </Panel>

      {/* ------------------------- Rythme ------------------------- */}
      <Panel>
        <SectionTitle
          eyebrow="Rythme"
          title="Longueur des silences"
          subtitle="Les pauses entre les phrases donnent à la séance son tempo lent et respiré."
          icon="Hourglass"
        />
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {PAUSES.map((p) => {
            const active = Math.abs(pauseValue - p.value) < 0.01
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => choosePause(p.value)}
                className={cx(
                  'rounded-2xl border p-3 text-left transition',
                  active ? 'border-gold-500/45 bg-gold-500/10' : 'border-white/8 bg-white/2 hover:border-gold-500/25',
                )}
              >
                <span className="block text-[12.5px] font-semibold text-gold-100">{p.label}</span>
                <span className="block text-[10.5px] text-ash">{p.hint}</span>
              </button>
            )
          })}
        </div>
      </Panel>

      {onGoOffline && (
        <Panel flat>
          <div className="flex flex-wrap items-center gap-3">
            <Icon name="HardDrive" size={16} className="text-gold-400" />
            <p className="min-w-0 flex-1 text-[11.5px] text-ash">
              Sur l'APK, les voix sont déjà embarquées. Sur le web, ouvre l'onglet Hors-ligne pour les garder sans réseau.
            </p>
            <Button size="sm" variant="ghost" icon="Download" onClick={onGoOffline}>
              Gérer le hors-ligne
            </Button>
          </div>
        </Panel>
      )}
    </div>
  )
}

export default VoiceLab
