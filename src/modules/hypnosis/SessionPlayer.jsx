/* ------------------------------------------------------------------
   SessionPlayer.jsx — Lecteur de séance d'hypnose
   ------------------------------------------------------------------
   • Chronologie par phases (accueil → induction → … → émergence)
   • Orbe de respiration animée + anneau de progression
   • Bande-son : ambiance embarquée + battement binaural (Web Audio)
   • Voix : synthèse vocale française, qui pilote le rythme des phases
   • Le texte de la phase s'affiche et se surligne ligne par ligne
   • Bilan de fin : ressenti + note, enregistrés dans le journal
------------------------------------------------------------------- */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../../components/ui/Icon'
import { Button, Chip, Panel, ProgressBar, ProgressRing, SectionTitle } from '../../components/ui/Primitives'
import { useApp } from '../../context/AppContext'
import { ambienceFor, CUES } from '../../data/hypnosis/media'
import { PHASE_KIND, sessionSeconds } from '../../data/hypnosis/sessions'
import {
  binauralRunning,
  playCue,
  primeAudio,
  setMasterVolume,
  speak,
  speaking,
  startAmbience,
  startBinaural,
  stopAll,
  stopAmbience,
  stopBinaural,
  stopSpeaking,
  ttsSupported,
} from '../../lib/hypnosisAudio'
import { cx, formatClock, formatMinutes } from '../../lib/utils'

const MOODS = [
  { id: 'calme', label: 'Calme', icon: 'Waves', tone: 'jade' },
  { id: 'leger', label: 'Léger', icon: 'Feather', tone: 'gold' },
  { id: 'neutre', label: 'Neutre', icon: 'CircleDot', tone: 'slate' },
  { id: 'agite', label: 'Agité', icon: 'Activity', tone: 'blood' },
]

const cueUrl = (id) => CUES[id]?.src || null

/** Choix du repère sonore : gong à l'ouverture, bol à la fermeture. */
const cueForPhase = (phase, index, total) => {
  if (index === 0) return cueUrl('hy-son-gong-doux')
  if (phase.kind === 'emergence' || phase.kind === 'silence') return cueUrl('hy-son-bol-tibetain')
  if (index === total - 1) return cueUrl('hy-son-gong-doux')
  return cueUrl('hy-son-cloche-claire')
}

export const SessionPlayer = ({ session, onExit, onNext, hasNext }) => {
  const { state, hySetPrefs, hyCompleteSession, hyAddJournalEntry } = useApp()
  const prefs = state.hypnosis?.prefs || {}

  const [status, setStatus] = useState('idle') // idle | running | paused | done
  const [pi, setPi] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [mood, setMood] = useState('calme')
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [notice, setNotice] = useState('')

  const speakingRef = useRef(false)
  const startedAtRef = useRef(null)

  const phases = session.phases
  const total = useMemo(() => sessionSeconds(session), [session])
  const phase = phases[Math.min(pi, phases.length - 1)]
  const phaseSeconds = phase?.seconds || 1
  const doneSeconds = useMemo(
    () => phases.slice(0, pi).reduce((t, p) => t + (p.seconds || 0), 0) + Math.min(elapsed, phaseSeconds),
    [phases, pi, elapsed, phaseSeconds],
  )
  const overallPct = total ? Math.round((doneSeconds / total) * 100) : 0
  const activeLine = Math.min(
    (phase?.lines?.length || 1) - 1,
    Math.floor((elapsed / phaseSeconds) * (phase?.lines?.length || 1)),
  )

  const voice = prefs.voice !== false && ttsSupported()
  const ambienceOn = prefs.ambience !== false
  const binauralOn = prefs.binaural !== false
  const volume = typeof prefs.volume === 'number' ? prefs.volume : 0.7

  /* ------------------------- Parole ------------------------- */

  const startSpeech = useCallback(
    (phaseObj, fromLine = 0) => {
      speakingRef.current = false
      if (!voice || !phaseObj) return
      const lines = phaseObj.lines.slice(fromLine)
      if (!lines.length) return
      speakingRef.current = true
      const ok = speak(lines.join('\n\n'), {
        rate: prefs.voiceRate || 0.9,
        pitch: prefs.voicePitch || 0.95,
        onEnd: () => {
          speakingRef.current = false
        },
      })
      if (!ok) speakingRef.current = false
    },
    [voice, prefs.voiceRate, prefs.voicePitch],
  )

  /* ------------------------- Chronologie ------------------------- */

  const goToPhase = useCallback(
    (index) => {
      const clamped = Math.max(0, Math.min(phases.length - 1, index))
      const target = phases[clamped]
      stopSpeaking()
      setPi(clamped)
      setElapsed(0)
      if (prefs.chime !== false) {
        const url = cueForPhase(target, clamped, phases.length)
        if (url) playCue(url, { gain: 0.5 })
      }
      startSpeech(target)
    },
    [phases, prefs.chime, startSpeech],
  )

  const finish = useCallback(() => {
    setStatus('done')
    stopAll({ fade: 1.5 })
    speakingRef.current = false
    const minutes = Math.max(1, Math.round((Date.now() - (startedAtRef.current || Date.now())) / 60000))
    hyCompleteSession(session.id, { minutes })
  }, [hyCompleteSession, session.id])

  // Tic de progression
  useEffect(() => {
    if (status !== 'running') return undefined
    const id = setInterval(() => setElapsed((e) => e + 0.25), 250)
    return () => clearInterval(id)
  }, [status])

  // Passage de phase / fin de séance
  useEffect(() => {
    if (status !== 'running') return
    if (elapsed < phaseSeconds) return
    if (speakingRef.current || speaking()) return
    if (pi + 1 < phases.length) goToPhase(pi + 1)
    else finish()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, status, pi, phaseSeconds])

  // Volume maître
  useEffect(() => {
    setMasterVolume(volume, 0.2)
  }, [volume])

  // Nettoyage à la sortie
  useEffect(
    () => () => {
      stopAll({ fade: 0.4 })
      speakingRef.current = false
    },
    [],
  )

  /* ------------------------- Commandes ------------------------- */

  const start = async () => {
    setNotice('')
    setSaved(false)
    await primeAudio()
    setMasterVolume(volume, 0.1)
    startedAtRef.current = Date.now()
    if (ambienceOn) {
      const ok = await startAmbience(ambienceFor(session)?.src || null, { gain: 0.5 })
      if (!ok) setNotice("L'ambiance n'a pas pu être chargée : la séance continue sans fond sonore.")
    }
    if (binauralOn && session.binaural) {
      startBinaural({ carrier: session.binaural.carrier, beat: session.binaural.beat, gain: 0.1 })
    }
    setStatus('running')
    setPi(0)
    setElapsed(0)
    if (prefs.chime !== false) {
      const url = cueForPhase(phases[0], 0, phases.length)
      if (url) playCue(url, { gain: 0.5 })
    }
    startSpeech(phases[0])
  }

  const pause = () => {
    setStatus('paused')
    stopSpeaking()
    speakingRef.current = false
  }

  const resume = () => {
    setStatus('running')
    startSpeech(phase, activeLine)
  }

  const stop = () => {
    stopAll({ fade: 0.6 })
    speakingRef.current = false
    setStatus('idle')
    setPi(0)
    setElapsed(0)
  }

  const exit = () => {
    stopAll({ fade: 0.3 })
    speakingRef.current = false
    onExit?.()
  }

  const toggleAmbience = async () => {
    const next = !ambienceOn
    hySetPrefs({ ambience: next })
    if (status === 'running' || status === 'paused') {
      if (next) await startAmbience(ambienceFor(session)?.src || null, { gain: 0.5 })
      else stopAmbience({ fade: 1.2 })
    }
  }

  const toggleBinaural = () => {
    const next = !binauralOn
    hySetPrefs({ binaural: next })
    if (next && session.binaural) {
      startBinaural({ carrier: session.binaural.carrier, beat: session.binaural.beat, gain: 0.1 })
    } else if (!next) {
      stopBinaural({ fade: 1.2 })
    }
  }

  const saveJournal = () => {
    hyAddJournalEntry({ sessionId: session.id, mood, note: note.trim() })
    setSaved(true)
  }

  const kindMeta = PHASE_KIND[phase?.kind] || PHASE_KIND.suggestion

  /* ============================ RENDU ============================ */

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* ---------------- En-tête ---------------- */}
      <Panel glow className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full blur-3xl"
          style={{ background: `${session.color}22` }}
        />
        <div className="relative flex items-start justify-between gap-3">
          <SectionTitle
            eyebrow={`Hypnose éricksonienne · ${session.level}`}
            title={session.title}
            subtitle={session.subtitle}
            icon="Waves"
          />
          <button onClick={exit} className="rounded-lg p-1.5 text-ash transition hover:bg-white/8 hover:text-ivory" aria-label="Quitter la séance">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="relative mt-3 flex flex-wrap gap-1.5">
          <Chip tone="gold" icon="Clock">
            {formatMinutes(total / 60)}
          </Chip>
          <Chip tone="slate" icon="Layers">
            {phases.length} phases
          </Chip>
          {session.binaural && (
            <Chip tone="sapphire" icon="AudioLines">
              {session.binaural.carrier} Hz + {session.binaural.beat} Hz
            </Chip>
          )}
          <Chip tone={voice ? 'jade' : 'slate'} icon={voice ? 'Volume2' : 'VolumeX'}>
            {voice ? 'Voix activée' : 'Lecture silencieuse'}
          </Chip>
        </div>
        {notice && (
          <p className="relative mt-3 flex items-start gap-2 text-[12px] text-amber-200">
            <Icon name="AlertTriangle" size={13} className="mt-0.5 shrink-0" /> {notice}
          </p>
        )}
      </Panel>

      {/* ---------------- Scène ---------------- */}
      <Panel className="relative overflow-hidden">
        <div className="flex flex-col items-center gap-5 py-2 sm:flex-row sm:items-center sm:gap-8">
          {/* Orbe */}
          <div className="relative flex h-44 w-44 shrink-0 items-center justify-center">
            <div
              className={cx('absolute inset-0 rounded-full opacity-60 blur-2xl', status === 'running' && 'anim-orb')}
              style={{ background: `radial-gradient(circle, ${session.color}66, transparent 70%)` }}
            />
            <div
              className={cx(
                'absolute h-32 w-32 rounded-full border-2',
                status === 'running' && 'anim-orb',
              )}
              style={{ borderColor: `${kindMeta.color}88`, background: `radial-gradient(circle, ${kindMeta.color}33, transparent 72%)` }}
            />
            <ProgressRing value={overallPct} size={168} stroke={6} label="Séance" tone={session.color} />
          </div>

          {/* Infos de phase */}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Chip tone="slate" icon={kindMeta.icon}>
                {kindMeta.label}
              </Chip>
              <Chip tone="gold" icon="Hourglass">
                {formatClock(Math.max(0, phaseSeconds - elapsed))}
              </Chip>
            </div>
            <h3 className="display mt-2 text-2xl leading-tight text-gold-100">{phase?.title}</h3>
            <p className="mt-1 text-[12.5px] text-ash">
              Phase {pi + 1} / {phases.length} · {Math.round(phaseSeconds)} s · temps restant {formatClock(Math.max(0, total - doneSeconds))}
            </p>
            <ProgressBar className="mt-3" value={(elapsed / phaseSeconds) * 100} tone={kindMeta.color} height={6} />
          </div>
        </div>

        {/* Texte de la phase */}
        <div className="mt-5 rounded-2xl border border-gold-500/12 bg-void/45 p-4">
          {(phase?.lines || []).map((line, i) => (
            <p
              key={i}
              className={cx(
                'mb-2 text-[14px] leading-relaxed transition',
                i < activeLine ? 'text-ivory/45' : i === activeLine && status === 'running' ? 'text-ivory' : 'text-ivory/85',
              )}
            >
              {line}
            </p>
          ))}
        </div>
      </Panel>

      {/* ---------------- Commandes ---------------- */}
      <Panel>
        {status === 'done' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-emerald-500/35 bg-emerald-500/10 p-3">
                <Icon name="CheckCircle2" size={22} className="text-emerald-300" />
              </div>
              <div>
                <p className="display text-lg text-gold-100">Séance terminée</p>
                <p className="text-[12px] text-ash">
                  {formatMinutes(total / 60)} enregistrées. Le calme reste disponible à un souffle.
                </p>
              </div>
            </div>

            {!saved ? (
              <div className="space-y-3">
                <div>
                  <p className="mb-1.5 text-[11.5px] font-semibold text-gold-200/90">Ressenti après la séance</p>
                  <div className="flex flex-wrap gap-1.5">
                    {MOODS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMood(m.id)}
                        className={cx(
                          'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition',
                          mood === m.id ? 'border-gold-500/45 bg-gold-500/15 text-gold-100' : 'border-white/8 bg-white/3 text-ash hover:text-ivory',
                        )}
                      >
                        <Icon name={m.icon} size={12} /> {m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  className="field min-h-20 resize-y leading-relaxed"
                  placeholder="Une image, une sensation, une phrase qui est restée… (optionnel)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <Button variant="gold" icon="Save" onClick={saveJournal}>
                    Enregistrer le ressenti
                  </Button>
                  <Button variant="ghost" icon="RotateCcw" onClick={start}>
                    Refaire la séance
                  </Button>
                  {hasNext && (
                    <Button variant="ghost" icon="ArrowRight" onClick={onNext}>
                      Séance suivante
                    </Button>
                  )}
                  <Button variant="ghost" icon="ChevronLeft" onClick={onExit}>
                    Retour aux séances
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Chip tone="jade" icon="Check">
                  Ressenti enregistré
                </Chip>
                {hasNext && (
                  <Button variant="gold" icon="ArrowRight" onClick={onNext}>
                    Séance suivante
                  </Button>
                )}
                <Button variant="ghost" icon="ChevronLeft" onClick={onExit}>
                  Retour aux séances
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {status === 'idle' && (
                <Button variant="gold" icon="Play" onClick={start}>
                  Démarrer la séance
                </Button>
              )}
              {status === 'running' && (
                <Button variant="gold" icon="Pause" onClick={pause}>
                  Pause
                </Button>
              )}
              {status === 'paused' && (
                <Button variant="gold" icon="Play" onClick={resume}>
                  Reprendre
                </Button>
              )}
              {(status === 'running' || status === 'paused') && (
                <>
                  <Button variant="ghost" icon="ChevronLeft" onClick={() => goToPhase(pi - 1)} disabled={pi === 0}>
                    Précédente
                  </Button>
                  <Button
                    variant="ghost"
                    icon="ChevronRight"
                    onClick={() => (pi + 1 < phases.length ? goToPhase(pi + 1) : finish())}
                  >
                    Suivante
                  </Button>
                  <Button variant="ghost" icon="Square" onClick={stop}>
                    Arrêter
                  </Button>
                </>
              )}
            </div>

            {/* Réglages rapides */}
            <div className="flex flex-wrap items-center gap-2 border-t border-gold-500/12 pt-3">
              <button
                type="button"
                onClick={() => hySetPrefs({ voice: !voice })}
                className={cx(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition',
                  voice ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-100' : 'border-white/8 bg-white/3 text-ash',
                )}
                disabled={!ttsSupported()}
                title={ttsSupported() ? 'Voix du système' : 'Synthèse vocale indisponible sur cet appareil'}
              >
                <Icon name={voice ? 'Volume2' : 'VolumeX'} size={12} /> Voix
              </button>
              <button
                type="button"
                onClick={toggleAmbience}
                className={cx(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition',
                  ambienceOn ? 'border-sky-500/35 bg-sky-500/10 text-sky-100' : 'border-white/8 bg-white/3 text-ash',
                )}
              >
                <Icon name="Waves" size={12} /> Ambiance
              </button>
              {session.binaural && (
                <button
                  type="button"
                  onClick={toggleBinaural}
                  className={cx(
                    'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition',
                    binauralOn ? 'border-gold-500/35 bg-gold-500/10 text-gold-100' : 'border-white/8 bg-white/3 text-ash',
                  )}
                  title="Nécessite un casque"
                >
                  <Icon name="AudioLines" size={12} /> Binaural
                </button>
              )}
              <label className="ml-auto flex items-center gap-2 text-[11.5px] text-ash">
                <Icon name="Volume1" size={13} />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => hySetPrefs({ volume: Number(e.target.value) })}
                  className="h-1 w-28 cursor-pointer accent-gold-400"
                />
              </label>
            </div>

            {!ttsSupported() && (
              <p className="flex items-start gap-2 text-[11.5px] text-ash">
                <Icon name="Info" size={13} className="mt-0.5 shrink-0 text-gold-400" />
                La synthèse vocale n'est pas disponible sur cet appareil : lis le texte à l'écran au rythme des phases. Le repère sonore marque chaque changement.
              </p>
            )}
            {session.binaural && binauralRunning() && (
              <p className="flex items-start gap-2 text-[11.5px] text-ash">
                <Icon name="Headphones" size={13} className="mt-0.5 shrink-0 text-gold-400" />
                Mets un casque pour percevoir le battement binaural.
              </p>
            )}
          </div>
        )}
      </Panel>

      {/* ---------------- Chronologie ---------------- */}
      <Panel flat>
        <SectionTitle eyebrow="Déroulé" title="Chronologie de la séance" icon="ListMusic" />
        <div className="mt-3 space-y-1.5">
          {phases.map((p, i) => {
            const meta = PHASE_KIND[p.kind] || PHASE_KIND.suggestion
            const active = i === pi
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  if (status === 'idle') return
                  goToPhase(i)
                }}
                className={cx(
                  'flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition',
                  active ? 'border-gold-500/40 bg-gold-500/10' : 'border-white/8 bg-white/2 hover:border-gold-500/25',
                )}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border" style={{ borderColor: `${meta.color}66`, color: meta.color }}>
                  <Icon name={meta.icon} size={13} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold text-gold-100">{p.title}</span>
                  <span className="block text-[10.5px] text-ash">
                    {meta.label} · {Math.round(p.seconds)} s · {p.lines.length} phrases
                  </span>
                </span>
                {active && <Chip tone="gold">{status === 'running' ? 'En cours' : status === 'paused' ? 'En pause' : 'Phase'}</Chip>}
              </button>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}

export default SessionPlayer
