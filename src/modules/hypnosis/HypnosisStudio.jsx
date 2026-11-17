/* ------------------------------------------------------------------
   HypnosisStudio.jsx — Module « Hypnose éricksonienne » (module 12)
   ------------------------------------------------------------------
   Quatre onglets :
     • Séances    — catalogue des 6 séances + lecteur guidé
     • Hors-ligne — téléchargement des ambiances, repères et scripts
     • Ambiances  — laboratoire binaural / fonds sonores / repères
     • Progression— statistiques, séance conseillée, journal

   Contenu 100 % local : les scripts sont écrits dans le code et les sons
   sont générés par scripts/generate-hypnosis.mjs (aucune API, aucun réseau).
------------------------------------------------------------------- */

import { useMemo, useState } from 'react'
import Icon from '../../components/ui/Icon'
import { Button, Chip, Modal, Panel, ProgressBar, SectionTitle, Tabs } from '../../components/ui/Primitives'
import { useApp } from '../../context/AppContext'
import { HYPNOSIS_SAFETY, SESSION_LEVELS, sessionFor, sessionList, sessionToText } from '../../data/hypnosis'
import { hypnosisSuggestion } from '../../lib/aiAnalysis'
import { cx, formatMinutes, sum } from '../../lib/utils'
import { AmbienceLab } from './AmbienceLab'
import { HypnosisOffline } from './HypnosisOffline'
import { HypnosisProgress } from './HypnosisProgress'
import { SessionPlayer } from './SessionPlayer'

const TABS = [
  { id: 'seances', label: 'Séances', icon: 'ListMusic' },
  { id: 'offline', label: 'Hors-ligne', icon: 'HardDrive' },
  { id: 'ambiances', label: 'Ambiances', icon: 'SlidersHorizontal' },
  { id: 'progress', label: 'Progression', icon: 'TrendingUp' },
]

export const HypnosisStudio = () => {
  const { state } = useApp()
  const [tab, setTab] = useState('seances')
  const [activeId, setActiveId] = useState(null)
  const [scriptOpen, setScriptOpen] = useState(null)
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState('all')

  const sessions = useMemo(() => sessionList(), [])
  const active = activeId ? sessionFor(activeId) : null

  const progress = state.hypnosis?.progress || {}
  const totalSessions = sum(Object.values(progress), (p) => p.sessions || 0)
  const suggestion = useMemo(() => hypnosisSuggestion(state), [state])

  /* --------------------------- Lecteur --------------------------- */
  if (active) {
    const idx = sessions.findIndex((s) => s.id === active.id)
    const next = sessions[idx + 1] || null
    return (
      <SessionPlayer
        session={active}
        onExit={() => setActiveId(null)}
        hasNext={Boolean(next)}
        onNext={() => setActiveId(next ? next.id : null)}
      />
    )
  }

  const filtered = sessions.filter((s) => {
    if (level !== 'all' && s.level !== level) return false
    if (!query.trim()) return true
    const hay = `${s.title} ${s.subtitle} ${s.goal} ${(s.tags || []).join(' ')}`.toLowerCase()
    return hay.includes(query.trim().toLowerCase())
  })

  const scriptText = scriptOpen ? sessionToText(sessionFor(scriptOpen)) : ''

  return (
    <div className="space-y-4">
      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'seances' && (
        <div className="space-y-4">
          {/* ---------------------- Hero ---------------------- */}
          <Panel glow className="relative overflow-hidden">
            <div className="pointer-events-none absolute -top-20 -right-10 h-52 w-52 rounded-full bg-sky-500/10 blur-3xl" />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SectionTitle
                eyebrow="Hypnose éricksonienne"
                title="Des séances guidées, écrites et sonorisées sur l'appareil"
                subtitle="Induction, approfondissement, suggestion, ancrage, émergence : le langage éricksonien appliqué à la scène, au focus, au sommeil et à ton Futur Toi."
                icon="Waves"
              />
              <div className="flex shrink-0 flex-wrap gap-2">
                <Chip tone="sapphire" icon="ListMusic">
                  {sessions.length} séances
                </Chip>
                <Chip tone="jade" icon="Play">
                  {totalSessions} faites
                </Chip>
              </div>
            </div>
            <p className="relative mt-3 flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/8 p-2.5 text-[11.5px] leading-relaxed text-amber-100">
              <Icon name="AlertTriangle" size={14} className="mt-0.5 shrink-0 text-amber-300" />
              {HYPNOSIS_SAFETY}
            </p>
          </Panel>

          {/* ------------------- Séance conseillée ------------------- */}
          {suggestion?.session && (
            <Panel>
              <SectionTitle
                eyebrow="Recommandation locale"
                title="Par où commencer aujourd'hui"
                subtitle={suggestion.reason}
                icon="Lightbulb"
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: `${suggestion.session.color}22`, color: suggestion.session.color }}>
                  <Icon name="Waves" size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="display text-[15px] text-gold-100">{suggestion.session.title}</p>
                  <p className="text-[11px] text-ash">{suggestion.session.subtitle} · {formatMinutes(suggestion.session.minutes)}</p>
                </div>
                <Button variant="gold" icon="Play" onClick={() => setActiveId(suggestion.session.id)}>
                  Démarrer
                </Button>
              </div>
            </Panel>
          )}

          {/* ---------------------- Filtres ---------------------- */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex min-w-52 flex-1 items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-3 py-2">
              <Icon name="Search" size={14} className="shrink-0 text-ash" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une séance, un besoin (stress, focus, sommeil…)"
                className="w-full bg-transparent text-[12.5px] text-ivory outline-none placeholder:text-ash/60"
              />
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setLevel('all')}
                className={cx(
                  'rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition',
                  level === 'all' ? 'border-gold-500/45 bg-gold-500/15 text-gold-100' : 'border-white/8 bg-white/3 text-ash hover:text-ivory',
                )}
              >
                Tous
              </button>
              {SESSION_LEVELS.map((lv) => (
                <button
                  key={lv}
                  type="button"
                  onClick={() => setLevel(lv)}
                  className={cx(
                    'rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition',
                    level === lv ? 'border-gold-500/45 bg-gold-500/15 text-gold-100' : 'border-white/8 bg-white/3 text-ash hover:text-ivory',
                  )}
                >
                  {lv}
                </button>
              ))}
            </div>
          </div>

          {/* ---------------------- Cartes ---------------------- */}
          {filtered.length === 0 ? (
            <Panel flat>
              <p className="text-center text-[12.5px] text-ash">Aucune séance ne correspond à cette recherche.</p>
            </Panel>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map((s) => {
                const p = progress[s.id] || {}
                const done = p.sessions || 0
                return (
                  <Panel key={s.id} className="flex flex-col">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border" style={{ borderColor: `${s.color}55`, color: s.color, background: `${s.color}14` }}>
                        <Icon name="Waves" size={17} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="display text-[15px] leading-tight text-gold-100">{s.title}</p>
                        <p className="text-[11px] text-ash">{s.subtitle}</p>
                      </div>
                      <Chip tone={s.level === 'Avancé' ? 'blood' : s.level === 'Intermédiaire' ? 'gold' : 'jade'}>{s.level}</Chip>
                    </div>

                    <p className="mt-2.5 text-[12px] leading-relaxed text-ivory/75">{s.goal}</p>

                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      <Chip tone="slate" icon="Clock">
                        {formatMinutes(s.minutes)}
                      </Chip>
                      <Chip tone="slate" icon="Layers">
                        {s.phases.length} phases
                      </Chip>
                      {s.binaural && (
                        <Chip tone="sapphire" icon="AudioLines">
                          {s.binaural.beat} Hz
                        </Chip>
                      )}
                    </div>

                    {(s.tags || []).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {s.tags.map((t) => (
                          <span key={t} className="rounded-full bg-white/4 px-2 py-0.5 text-[10px] text-ash">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {done > 0 && (
                      <div className="mt-2.5">
                        <ProgressBar value={Math.min(100, done * 25)} tone={s.color} height={4} />
                        <p className="mt-1 text-[10px] text-ash">{done} séance(s) · {formatMinutes(p.minutes || 0)}</p>
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2 border-t border-gold-500/12 pt-3">
                      <Button variant="gold" icon="Play" size="sm" onClick={() => setActiveId(s.id)}>
                        Démarrer
                      </Button>
                      <Button variant="ghost" icon="FileText" size="sm" onClick={() => setScriptOpen(s.id)}>
                        Lire le script
                      </Button>
                    </div>
                  </Panel>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'offline' && <HypnosisOffline />}
      {tab === 'ambiances' && <AmbienceLab onGoOffline={() => setTab('offline')} />}
      {tab === 'progress' && (
        <HypnosisProgress onStartSession={(id) => setActiveId(id)} onGoSessions={() => setTab('seances')} />
      )}

      {/* ---------------------- Script (modal) ---------------------- */}
      <Modal open={Boolean(scriptOpen)} onClose={() => setScriptOpen(null)} title={scriptOpen ? `Script — ${sessionFor(scriptOpen)?.title}` : ''} subtitle="Texte intégral, à lire ou à prêter" wide>
        <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-xl border border-white/8 bg-void/50 p-4 font-mono text-[11.5px] leading-relaxed text-ivory/85">
          {scriptText}
        </pre>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="gold"
            icon="Copy"
            onClick={() => {
              try {
                navigator.clipboard?.writeText(scriptText)
              } catch {
                /* presse-papiers indisponible */
              }
            }}
          >
            Copier le script
          </Button>
          <Button variant="ghost" icon="Play" onClick={() => { const id = scriptOpen; setScriptOpen(null); setActiveId(id) }}>
            Lancer la séance
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default HypnosisStudio
