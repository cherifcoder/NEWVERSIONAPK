import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/ui/Icon'
import {
  Button,
  Chip,
  EmptyState,
  Labeled,
  MarkdownLite,
  Panel,
  SectionTitle,
  Stat,
} from '../components/ui/Primitives'
import { useApp } from '../context/AppContext'
import { JOURNAL_QUESTIONS, stateForScore } from '../data/journal'
import { generateReport } from '../lib/aiAgent'
import { cx, dayKey, formatLongDate } from '../lib/utils'

export const ActorJournal = ({ onNavigate }) => {
  const { state, derived, saveJournalEntry, deleteJournalEntry, setLastModule } = useApp()
  const existing = useMemo(() => (state.journal || []).find((j) => j.date === dayKey()), [state.journal])

  const [answers, setAnswers] = useState({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [lastReport, setLastReport] = useState(null)

  useEffect(() => {
    if (existing) setAnswers(existing.answers || {})
  }, [existing])

  const filled = JOURNAL_QUESTIONS.filter((q) => (answers[q.id] || '').trim().length > 0).length
  const requiredFilled = JOURNAL_QUESTIONS.filter(
    (q) => q.required && (answers[q.id] || '').trim().length > 0,
  ).length
  const requiredTotal = JOURNAL_QUESTIONS.filter((q) => q.required).length

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

  const submit = async () => {
    if (requiredFilled < requiredTotal) {
      setError('Réponds à toutes les questions marquées comme obligatoires.')
      return
    }
    setError('')
    setBusy(true)
    try {
      const result = await generateReport({ entry: { answers }, context, settings: state.settings })
      const verdict = stateForScore(result.analysis.score)
      saveJournalEntry({
        answers,
        report: result.text,
        score: result.analysis.score,
        verdict: verdict.label,
        verdictEmoji: verdict.emoji,
        source: result.source,
        provider: result.provider || null,
        aiError: result.error || null,
      })
      setLastReport({ text: result.text, score: result.analysis.score, source: result.source, error: result.error })
      setLastModule('director')
    } catch (err) {
      setError(err?.message || 'Erreur lors de la génération du rapport.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {/* ---------------- En-tête ---------------- */}
      <Panel glow>
        <SectionTitle
          eyebrow="Le Journal de l'Acteur"
          title={formatLongDate()}
          subtitle="Le plateau ferme. Tu débriefes maintenant, à froid, sans complaisance. C'est ici que le personnage se corrige."
          icon="NotebookPen"
          right={
            existing ? (
              <Chip tone="jade" icon="BadgeCheck">Rapport déposé</Chip>
            ) : (
              <Chip tone="blood" icon="Clock">En attente</Chip>
            )
          }
        />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Incarnation" value={`${derived.incarnRate}%`} icon="Percent" />
          <Stat label="Deep Work" value={`${derived.todayMinutes} min`} icon="Timer" tone="jade" />
          <Stat label="Boucles ouvertes" value={derived.openLoops} icon="Swords" tone={derived.openLoops ? 'blood' : 'jade'} />
          <Stat label="Série" value={`${state.streak?.current || 0} j`} icon="Flame" tone="sapphire" />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {derived.brokenPillars.length > 0 ? (
            <Chip tone="blood" icon="AlertTriangle">
              Piliers en défaut : {derived.brokenPillars.join(', ')}
            </Chip>
          ) : (
            <Chip tone="jade" icon="CheckCircle2">Tous les piliers tenus</Chip>
          )}
        </div>
      </Panel>

      {/* ---------------- Formulaire ---------------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <SectionTitle
            eyebrow="Débriefing"
            title="Questions du réalisateur"
            icon="MessageSquare"
            right={<span className="font-mono text-[12px] text-ash">{filled}/{JOURNAL_QUESTIONS.length}</span>}
          />
          <div className="mt-4 space-y-4">
            {JOURNAL_QUESTIONS.map((q) => (
              <Labeled
                key={q.id}
                label={`${q.label}${q.required ? ' *' : ''}`}
              >
                <div className="mb-2 flex items-start gap-2">
                  <Icon name={q.icon} size={14} className="mt-0.5 shrink-0 text-gold-400" />
                  <p className="text-[13px] leading-relaxed text-ivory/92">{q.question}</p>
                </div>
                <textarea
                  className="field min-h-24 resize-y leading-relaxed"
                  placeholder={q.hint}
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                />
                <span className="mt-1 block text-[11px] text-ash/70">
                  {q.hint} · {(answers[q.id] || '').trim().split(/\s+/).filter(Boolean).length} mots
                </span>
              </Labeled>
            ))}
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/35 bg-rose-500/10 p-3">
              <Icon name="AlertTriangle" size={15} className="mt-0.5 shrink-0 text-rose-300" />
              <p className="text-[12.5px] text-rose-100">{error}</p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="gold" size="lg" icon="Sparkles" onClick={submit} disabled={busy}>
              {busy ? 'Le Metteur en Scène analyse…' : existing ? 'Régénérer le compte-rendu' : 'Envoyer au Metteur en Scène'}
            </Button>
            {existing && (
              <Button variant="ghost" icon="Sparkles" onClick={() => onNavigate?.('director')}>
                Voir le rapport
              </Button>
            )}
          </div>
        </Panel>

        {/* ---------------- Historique ---------------- */}
        <div className="space-y-4">
          {lastReport && (
            <Panel className="border-gold-500/30">
              <SectionTitle eyebrow="Dernier verdict" title={`${lastReport.score}/100`} icon="Sparkles" />
              <p className="mt-1 text-[11px] text-ash">
                Moteur : {lastReport.source === 'ia' ? 'IA connectée' : 'moteur local hors-ligne'}
              </p>
              {lastReport.error && (
                <p className="mt-2 text-[11px] text-rose-300">Repli local : {lastReport.error}</p>
              )}
              <div className="mt-3 max-h-64 overflow-y-auto pr-1">
                <MarkdownLite text={lastReport.text} />
              </div>
            </Panel>
          )}

          <Panel>
            <SectionTitle eyebrow="Archive" title="Débrieferings passés" icon="Calendar" />
            <div className="mt-3 max-h-96 space-y-2 overflow-y-auto pr-1">
              {(state.journal || []).length === 0 ? (
                <EmptyState icon="NotebookPen" title="Aucun débrief" text="Ton premier rapport ouvrira l'archive." />
              ) : (
                (state.journal || []).map((j) => {
                  const v = stateForScore(j.score ?? 0)
                  return (
                    <div key={j.id} className="panel-flat p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{j.verdictEmoji || v.emoji}</span>
                          <div>
                            <p className="text-[12px] font-semibold text-gold-100">{j.verdict || v.label}</p>
                            <p className="text-[10.5px] text-ash">
                              {new Date(`${j.date}T00:00:00`).toLocaleDateString('fr-FR', {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'short',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[13px] text-gold-300">{j.score}</span>
                          <button
                            onClick={() => deleteJournalEntry(j.id)}
                            className="rounded-md p-1 text-ash/60 transition hover:text-rose-300"
                          >
                            <Icon name="Trash2" size={13} />
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-3 text-[11.5px] leading-relaxed text-ash">
                        {(j.report || '').replace(/[#*>]/g, '').slice(0, 180)}…
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

export default ActorJournal
