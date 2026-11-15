import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../components/ui/Icon'
import {
  Button,
  Chip,
  EmptyState,
  MarkdownLite,
  Panel,
  ProgressRing,
  SectionTitle,
  Stat,
} from '../components/ui/Primitives'
import { useApp } from '../context/AppContext'
import { JOURNAL_QUESTIONS, stateForScore } from '../data/journal'
import { analyseEntry, generateReport, PROVIDERS, typewriter, verdictFor } from '../lib/aiAgent'
import { cx, dayKey } from '../lib/utils'

export const AiDirector = ({ onNavigate }) => {
  const { state, derived, saveJournalEntry } = useApp()
  const journal = state.journal || []
  const [selectedId, setSelectedId] = useState(journal[0]?.id || null)
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const abortRef = useRef(null)

  const selected = useMemo(
    () => journal.find((j) => j.id === selectedId) || journal[0] || null,
    [journal, selectedId],
  )

  const context = useMemo(
    () => ({
      openLoops: derived.openLoops,
      todayMinutes: derived.todayMinutes,
      incarnRate: derived.incarnRate,
      streak: state.streak?.current || 0,
      brokenPillars: derived.brokenPillars,
      daySeed: dayKey(),
    }),
    [derived, state.streak],
  )

  // Effet machine à écrire à la sélection d'un rapport
  useEffect(() => {
    if (!selected) {
      setTyped('')
      return undefined
    }
    abortRef.current?.abort?.()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    typewriter(selected.report || '', setTyped, { speed: 4, signal: ctrl.signal })
    return () => ctrl.abort()
  }, [selected])

  const analysis = useMemo(() => {
    if (!selected) return null
    return analyseEntry({ answers: selected.answers }, context)
  }, [selected, context])

  const providerLabel = state.settings.aiApiKey
    ? PROVIDERS[state.settings.aiProvider]?.label || 'API personnalisée'
    : 'Moteur local hors-ligne'

  const regenerate = async () => {
    if (!selected) return
    setBusy(true)
    setNotice('')
    try {
      const result = await generateReport({
        entry: { answers: selected.answers },
        context,
        settings: state.settings,
      })
      const v = stateForScore(result.analysis.score)
      saveJournalEntry({
        ...selected,
        answers: selected.answers,
        report: result.text,
        score: result.analysis.score,
        verdict: v.label,
        verdictEmoji: v.emoji,
        source: result.source,
        provider: result.provider || null,
        aiError: result.error || null,
      })
      setNotice(result.source === 'ia' ? 'Rapport régénéré par l\'IA.' : 'Rapport régénéré par le moteur local.')
    } finally {
      setBusy(false)
    }
  }

  const copyReport = async () => {
    if (!selected) return
    try {
      await navigator.clipboard.writeText(selected.report || '')
      setNotice('Compte-rendu copié.')
    } catch {
      setNotice('Copie impossible sur cet appareil.')
    }
  }

  if (!journal.length) {
    return (
      <div className="mx-auto max-w-3xl">
        <Panel>
          <SectionTitle
            eyebrow="Le Metteur en Scène"
            title="Aucun rapport à évaluer"
            subtitle="Le réalisateur ne travaille que sur des faits. Dépose d'abord ton débriefing du jour."
            icon="Sparkles"
          />
          <div className="mt-5">
            <EmptyState
              icon="NotebookPen"
              title="Le plateau est vide"
              text="Un acteur sans débrief ne progresse pas : il répète. Ouvre le Journal de l'Acteur et livre ton rapport."
              action={
                <Button variant="gold" icon="NotebookPen" onClick={() => onNavigate?.('journal')} className="mt-2">
                  Ouvrir le Journal
                </Button>
              }
            />
          </div>
        </Panel>
      </div>
    )
  }

  const verdict = selected ? stateForScore(selected.score ?? 0) : null

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* ---------------- En-tête ---------------- */}
      <Panel glow className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-10 h-52 w-52 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <ProgressRing
            value={selected?.score ?? 0}
            size={124}
            stroke={8}
            label="Discipline"
            sublabel={verdict?.label}
            tone={(selected?.score ?? 0) >= 75 ? '#e0c07c' : (selected?.score ?? 0) >= 50 ? '#cfa851' : '#b4323c'}
          />
          <div className="min-w-0 flex-1">
            <SectionTitle
              eyebrow="Le Metteur en Scène & Coach Stratège"
              title={verdict ? `${verdict.emoji} ${verdict.label}` : 'Évaluation'}
              subtitle="Un réalisateur exigeant, un mentor machiavélique, un stratège impitoyable. Il ne flatte pas : il corrige."
              icon="Sparkles"
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Chip tone={state.settings.aiApiKey ? 'jade' : 'slate'} icon={state.settings.aiApiKey ? 'Zap' : 'WifiOff'}>
                {providerLabel}
              </Chip>
              <Chip tone="gold" icon="Calendar">
                {selected ? new Date(`${selected.date}T00:00:00`).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' }) : '—'}
              </Chip>
              {selected?.aiError && <Chip tone="blood" icon="AlertTriangle">Repli local</Chip>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="gold" icon="RefreshCw" onClick={regenerate} disabled={busy}>
                {busy ? 'Analyse en cours…' : 'Relancer l\'analyse'}
              </Button>
              <Button variant="ghost" icon="Copy" onClick={copyReport}>Copier</Button>
              <Button variant="ghost" icon="NotebookPen" onClick={() => onNavigate?.('journal')}>
                Modifier le débrief
              </Button>
            </div>
          </div>
        </div>
        {notice && (
          <p className="relative mt-3 flex items-center gap-2 text-[12px] text-gold-200">
            <Icon name="Info" size={13} /> {notice}
          </p>
        )}
      </Panel>

      {/* ---------------- Corps ---------------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Rapport */}
        <Panel className="lg:col-span-2">
          <SectionTitle eyebrow="Compte-rendu chirurgical" title="Verdict du réalisateur" icon="Theater" />
          <div className="mt-4 rounded-2xl border border-gold-500/12 bg-void/45 p-4">
            <MarkdownLite text={typed} className={typed.length < (selected?.report || '').length ? 'anim-caret' : ''} />
          </div>
        </Panel>

        {/* Colonne droite */}
        <div className="space-y-4">
          <Panel>
            <SectionTitle eyebrow="Diagnostic" title="Signaux détectés" icon="Gauge" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Stat label="Incarnation" value={`${context.incarnRate}%`} icon="Percent" />
              <Stat label="Deep Work" value={`${context.todayMinutes} min`} icon="Timer" tone="jade" />
              <Stat label="Boucles" value={context.openLoops} icon="Swords" tone={context.openLoops ? 'blood' : 'jade'} />
              <Stat label="Série" value={`${context.streak} j`} icon="Flame" tone="sapphire" />
            </div>

            {analysis && (
              <div className="mt-4 space-y-3">
                <div>
                  <p className="eyebrow mb-1.5 !text-emerald-300/90">Ce qui a tenu</p>
                  <ul className="space-y-1.5">
                    {analysis.forces.map((f, i) => (
                      <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-ivory/88">
                        <Icon name="Check" size={13} className="mt-0.5 shrink-0 text-emerald-400" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="eyebrow mb-1.5 !text-rose-300/90">Failles</p>
                  {analysis.failles.length === 0 ? (
                    <p className="text-[12px] text-ash">Aucune faille structurelle détectée. Vérifie que tu n'es pas complaisant.</p>
                  ) : (
                    <ul className="space-y-2">
                      {analysis.failles.map((f, i) => (
                        <li key={i} className="rounded-xl border border-rose-500/20 bg-rose-500/6 p-2.5">
                          <p className="text-[12px] font-semibold text-rose-100">{f.titre}</p>
                          <p className="mt-0.5 text-[11.5px] leading-relaxed text-rose-100/70">{f.loi}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </Panel>

          <Panel>
            <SectionTitle eyebrow="Questions évaluées" title="Matière du débrief" icon="ListChecks" />
            <div className="mt-3 space-y-2">
              {JOURNAL_QUESTIONS.map((q) => {
                const answer = selected?.answers?.[q.id]
                return (
                  <div key={q.id} className="panel-flat p-2.5">
                    <p className="flex items-center gap-2 text-[11.5px] font-semibold text-gold-200">
                      <Icon name={q.icon} size={12} /> {q.label}
                    </p>
                    <p className={cx('mt-1 text-[11.5px] leading-relaxed', answer ? 'text-ivory/85' : 'text-ash/60 italic')}>
                      {answer || 'Non renseigné'}
                    </p>
                  </div>
                )
              })}
            </div>
          </Panel>

          {journal.length > 1 && (
            <Panel>
              <SectionTitle eyebrow="Historique" title="Verdicts précédents" icon="Calendar" />
              <div className="mt-3 space-y-1.5">
                {journal.map((j) => {
                  const v = stateForScore(j.score ?? 0)
                  return (
                    <button
                      key={j.id}
                      onClick={() => setSelectedId(j.id)}
                      className={cx(
                        'flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition',
                        selected?.id === j.id
                          ? 'border-gold-500/40 bg-gold-500/12'
                          : 'border-white/8 bg-white/2 hover:border-gold-500/25',
                      )}
                    >
                      <span className="text-base">{j.verdictEmoji || v.emoji}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-semibold text-gold-100">{j.verdict || v.label}</span>
                        <span className="block text-[10.5px] text-ash">
                          {new Date(`${j.date}T00:00:00`).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </span>
                      </span>
                      <span className="font-mono text-[13px] text-gold-300">{j.score}</span>
                    </button>
                  )
                })}
              </div>
            </Panel>
          )}

          <Panel className="border-gold-500/22">
            <SectionTitle eyebrow="Moteur d'analyse" title="Connecter une IA réelle" icon="Zap" />
            <p className="mt-2 text-[12px] leading-relaxed text-ash">
              Par défaut, le Metteur en Scène analyse en local — gratuit, instantané, hors-ligne. Ajoute une clé
              API (Groq ou Gemini, gratuites) pour des verdicts encore plus affûtés.
            </p>
            <p className="mt-2 text-[11.5px] text-gold-300">
              Verdict actuel : {selected ? verdictFor(selected.score ?? 0).label : '—'} ({selected?.score ?? 0}/100)
            </p>
            <Button variant="ghost" full className="mt-3" icon="Settings" onClick={() => onNavigate?.('settings')}>
              Configurer le moteur IA
            </Button>
          </Panel>
        </div>
      </div>
    </div>
  )
}

export default AiDirector
