/* ------------------------------------------------------------------
   HypnosisProgress.jsx — Onglet « Progression » du module hypnose
   ------------------------------------------------------------------
   • Statistiques de pratique (séances, minutes, série)
   • Séance conseillée (moteur d'analyse local, sans réseau)
   • Historique par séance + journal des ressentis
   • Lecture d'ensemble générée localement
------------------------------------------------------------------- */

import { useMemo, useState } from 'react'
import Icon from '../../components/ui/Icon'
import { Button, Chip, EmptyState, MarkdownLite, Panel, ProgressBar, SectionTitle, Stat } from '../../components/ui/Primitives'
import { useApp } from '../../context/AppContext'
import { sessionList } from '../../data/hypnosis'
import { hypnosisDigest, hypnosisSuggestion } from '../../lib/aiAnalysis'
import { dayKey, daysBetween, formatMinutes, sum } from '../../lib/utils'

const MOOD_META = {
  calme: { label: 'Calme', icon: 'Waves', tone: 'jade' },
  leger: { label: 'Léger', icon: 'Feather', tone: 'gold' },
  neutre: { label: 'Neutre', icon: 'CircleDot', tone: 'slate' },
  agite: { label: 'Agité', icon: 'Activity', tone: 'blood' },
}

/** Série de jours consécutifs avec au moins une séance (finissant aujourd'hui ou hier). */
const practiceStreak = (log = {}) => {
  const today = dayKey()
  const start = log[today] ? today : null
  if (!start) {
    // tolère une journée « en retard » : hier compte encore
    const yesterday = dayKey(new Date(Date.now() - 86400000))
    if (!log[yesterday]) return 0
    let s = 0
    let cursor = yesterday
    while (log[cursor]) {
      s += 1
      cursor = dayKey(new Date(new Date(`${cursor}T00:00:00`).getTime() - 86400000))
    }
    return s
  }
  let s = 0
  let cursor = start
  while (log[cursor]) {
    s += 1
    cursor = dayKey(new Date(new Date(`${cursor}T00:00:00`).getTime() - 86400000))
  }
  return s
}

export const HypnosisProgress = ({ onStartSession, onGoSessions }) => {
  const { state, hyResetProgress } = useApp()
  const hy = state.hypnosis || {}
  const log = hy.log || {}
  const progress = hy.progress || {}
  const journal = hy.journal || []
  const [digest, setDigest] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  const sessions = useMemo(() => sessionList(), [])
  const totalSessions = sum(Object.values(progress), (p) => p.sessions || 0)
  const totalMinutes = sum(Object.values(progress), (p) => p.minutes || 0)
  const streak = practiceStreak(log)
  const weekMinutes = useMemo(() => {
    let m = 0
    for (let i = 0; i < 7; i += 1) {
      const k = dayKey(new Date(Date.now() - i * 86400000))
      m += log[k]?.minutes || 0
    }
    return m
  }, [log])

  const suggestion = useMemo(() => hypnosisSuggestion(state), [state])
  const lastJournal = useMemo(() => [...journal].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 8), [journal])

  return (
    <div className="space-y-4">
      <Panel glow>
        <SectionTitle eyebrow="Pratique" title="Ta progression" subtitle="La régularité compte plus que la durée." icon="TrendingUp" />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Séances" value={totalSessions} icon="Play" />
          <Stat label="Minutes" value={formatMinutes(totalMinutes)} icon="Clock" tone="sapphire" />
          <Stat label="Cette semaine" value={formatMinutes(weekMinutes)} icon="Calendar" tone="jade" />
          <Stat label="Série" value={streak} unit={streak > 1 ? 'jours' : 'jour'} icon="Flame" tone="blood" />
        </div>
      </Panel>

      {/* ---------------------- Séance conseillée ---------------------- */}
      {suggestion?.session && (
        <Panel>
          <SectionTitle
            eyebrow="Analyse locale"
            title="Séance conseillée maintenant"
            subtitle={suggestion.reason}
            icon="Lightbulb"
            right={<Chip tone="gold" icon="Waves">{suggestion.session.level}</Chip>}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-gold-500/20 bg-gold-500/6 p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: `${suggestion.session.color}22`, color: suggestion.session.color }}>
              <Icon name="Waves" size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="display text-[15px] text-gold-100">{suggestion.session.title}</p>
              <p className="text-[11px] text-ash">{suggestion.session.subtitle} · {formatMinutes(suggestion.session.minutes)}</p>
            </div>
            <Button variant="gold" icon="Play" onClick={() => onStartSession(suggestion.session.id)}>
              Démarrer
            </Button>
          </div>
        </Panel>
      )}

      {/* ---------------------- Par séance ---------------------- */}
      <Panel>
        <SectionTitle eyebrow="Détail" title="Par séance" icon="ListMusic" right={<Button size="sm" variant="ghost" icon="ListMusic" onClick={onGoSessions}>Catalogue</Button>} />
        <div className="mt-3 space-y-2">
          {sessions.map((s) => {
            const p = progress[s.id] || {}
            const done = p.sessions || 0
            return (
              <div key={s.id} className="flex items-center gap-3">
                <span className="h-8 w-1.5 shrink-0 rounded-full" style={{ background: s.color }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-gold-100">{s.title}</p>
                  <p className="text-[10.5px] text-ash">
                    {done > 0 ? `${done} séance(s) · ${formatMinutes(p.minutes || 0)}` : 'Jamais faite'}
                    {p.lastAt ? ` · dernière fois il y a ${Math.max(0, daysBetween(dayKey(new Date(p.lastAt)), dayKey()))} j` : ''}
                  </p>
                  <ProgressBar className="mt-1.5" value={Math.min(100, done * 25)} tone={s.color} height={4} />
                </div>
                <Button size="sm" variant="ghost" icon="Play" onClick={() => onStartSession(s.id)}>
                  Lancer
                </Button>
              </div>
            )
          })}
        </div>
      </Panel>

      {/* ---------------------- Lecture d'ensemble ---------------------- */}
      <Panel>
        <SectionTitle
          eyebrow="Synthèse"
          title="Lecture de ta pratique"
          subtitle="Générée localement à partir de ton historique — aucun envoi de données."
          icon="Compass"
          right={
            <Button size="sm" variant="ghost" icon="Sparkles" onClick={() => setDigest(hypnosisDigest(state))}>
              Générer
            </Button>
          }
        />
        {digest ? (
          <div className="mt-3 rounded-2xl border border-gold-500/15 bg-void/40 p-4">
            <MarkdownLite text={digest} />
          </div>
        ) : (
          <p className="mt-3 text-[12px] text-ash">
            Clique sur « Générer » pour obtenir une lecture de ta pratique : régularité, effets probables, prochaine
            étape concrète.
          </p>
        )}
      </Panel>

      {/* ---------------------- Journal ---------------------- */}
      <Panel flat>
        <SectionTitle eyebrow="Journal" title="Ressentis" icon="NotebookPen" />
        {lastJournal.length === 0 ? (
          <EmptyState
            icon="Feather"
            title="Aucun ressenti enregistré"
            text="À la fin d'une séance, tu peux noter ton ressenti : cela aide à voir ce qui fonctionne pour toi."
          />
        ) : (
          <div className="mt-3 space-y-2">
            {lastJournal.map((e) => {
              const meta = MOOD_META[e.mood] || MOOD_META.neutre
              const s = sessions.find((x) => x.id === e.sessionId)
              return (
                <div key={e.id} className="rounded-xl border border-white/8 bg-white/2 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip tone={meta.tone} icon={meta.icon}>
                      {meta.label}
                    </Chip>
                    <span className="text-[11.5px] font-semibold text-gold-100">{s?.title || 'Séance'}</span>
                    <span className="ml-auto text-[10.5px] text-ash">{new Date(e.createdAt || Date.now()).toLocaleDateString('fr-FR')}</span>
                  </div>
                  {e.note && <p className="mt-2 text-[12px] leading-relaxed text-ivory/80">{e.note}</p>}
                </div>
              )
            })}
          </div>
        )}
      </Panel>

      {/* ---------------------- Réinitialiser ---------------------- */}
      <Panel flat>
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-semibold text-gold-100">Réinitialiser la progression</p>
            <p className="text-[11px] text-ash">Efface les statistiques et le journal du module hypnose. Les médias téléchargés restent sur l'appareil.</p>
          </div>
          {!confirmReset ? (
            <Button variant="ghost" icon="RotateCcw" onClick={() => setConfirmReset(true)}>
              Réinitialiser
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="danger"
                icon="Trash2"
                onClick={() => {
                  hyResetProgress()
                  setConfirmReset(false)
                }}
              >
                Confirmer
              </Button>
              <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                Annuler
              </Button>
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}

export default HypnosisProgress
