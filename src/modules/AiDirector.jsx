/* ------------------------------------------------------------------
   AiDirector.jsx — « Studio IA »
   ------------------------------------------------------------------
   Le Metteur en Scène historique (débrief de journal) devient un studio
   à onglets :

     • Débrief   — verdict chirurgical sur le rapport du jour (inchangé)
     • Situation — décoder un rapport de force, une demande, un conflit
     • Projets   — débloquer un projet, plus petit incrément livrable
     • Piliers   — rééquilibrer les 6 piliers à partir des chiffres réels
     • Tendance  — 7 jours vs 7 jours précédents
     • Éloquence — transformer un message confus en demande claire
     • Hypnose   — écrire un script éricksonien personnalisé
     • Coach     — question franche, réponse sans complaisance
     • Analyse   — tableau de bord : métriques, tendances, constats

   Chaque tâche a DEUX moteurs : un moteur local déterministe (toujours
   disponible, hors-ligne) et, si une clé API est configurée, un LLM
   compatible OpenAI. En cas d'échec réseau, on retombe sur le local :
   l'utilisateur ne voit jamais un écran vide.
------------------------------------------------------------------- */

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
  Tabs,
} from '../components/ui/Primitives'
import { useApp } from '../context/AppContext'
import { JOURNAL_QUESTIONS, stateForScore } from '../data/journal'
import { analyseEntry, generateReport, PROVIDERS, typewriter, verdictFor } from '../lib/aiAgent'
import { AI_TASKS, runAiTask, taskById } from '../lib/aiTasks'
import { buildDigest, buildInsights, buildMetrics, detectTrends } from '../lib/aiAnalysis'
import { cx, dayKey, formatMinutes } from '../lib/utils'

/* ------------------------------------------------------------------ */
/*  Barre d'état du moteur                                             */
/* ------------------------------------------------------------------ */

const EngineBar = ({ settings, onNavigate }) => {
  const online = Boolean(settings.aiApiKey) && settings.aiEnabled !== false
  return (
    <Panel flat className="flex flex-wrap items-center gap-2">
      <Chip tone={online ? 'jade' : 'slate'} icon={online ? 'Zap' : 'WifiOff'}>
        {online ? PROVIDERS[settings.aiProvider]?.label || 'API personnalisée' : 'Moteur local hors-ligne'}
      </Chip>
      <Chip tone="gold" icon="Bot">
        9 tâches
      </Chip>
      <p className="min-w-40 flex-1 text-[11.5px] leading-relaxed text-ash">
        {online
          ? "L'IA est connectée : chaque tâche est affinée par le modèle, avec repli local automatique en cas d'échec."
          : 'Tout fonctionne sans réseau : chaque tâche a un moteur local. Ajoute une clé pour des réponses plus affûtées.'}
      </p>
      <Button size="sm" variant="ghost" icon="Settings" onClick={() => onNavigate?.('settings')}>
        Moteur IA
      </Button>
    </Panel>
  )
}

/* ------------------------------------------------------------------ */
/*  Onglet — Débrief (Le Metteur en Scène)                             */
/* ------------------------------------------------------------------ */

const DebriefTab = ({ onNavigate }) => {
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
    )
  }

  const verdict = selected ? stateForScore(selected.score ?? 0) : null

  return (
    <div className="space-y-4">
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

/* ------------------------------------------------------------------ */
/*  Onglet — Tâche générique (Situation, Projets, Piliers, …)          */
/* ------------------------------------------------------------------ */

const TaskTab = ({ taskId }) => {
  const { state } = useApp()
  const task = taskById(taskId)
  const [values, setValues] = useState(() => {
    const init = {}
    ;(task?.fields || []).forEach((f) => {
      if (f.type === 'select') init[f.id] = f.options?.[0]?.value || ''
      else init[f.id] = ''
    })
    return init
  })
  const [typed, setTyped] = useState('')
  const [full, setFull] = useState('')
  const [busy, setBusy] = useState(false)
  const [source, setSource] = useState(null)
  const [notice, setNotice] = useState('')
  const abortRef = useRef(null)

  useEffect(() => {
    const init = {}
    ;(task?.fields || []).forEach((f) => {
      if (f.type === 'select') init[f.id] = f.options?.[0]?.value || ''
      else init[f.id] = ''
    })
    setValues(init)
    setTyped('')
    setFull('')
    setSource(null)
    setNotice('')
  }, [task])

  useEffect(() => () => abortRef.current?.abort?.(), [])

  if (!task) return null

  const missing = (task.fields || []).filter((f) => f.required && !String(values[f.id] || '').trim())

  const run = async () => {
    if (busy) return
    if (missing.length) {
      setNotice(`Renseigne : ${missing.map((f) => f.label).join(', ')}.`)
      return
    }
    setBusy(true)
    setNotice('')
    abortRef.current?.abort?.()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    try {
      const res = await runAiTask({ taskId, input: values, state, settings: state.settings, signal: ctrl.signal })
      setSource(res)
      setFull(res.text || '')
      setTyped('')
      await typewriter(res.text || '', setTyped, { speed: 5, signal: ctrl.signal })
      if (res.error) setNotice(`IA indisponible (${res.error}) — réponse produite par le moteur local.`)
    } catch (err) {
      setNotice(err?.message || 'Erreur inattendue.')
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(full || typed)
      setNotice('Texte copié.')
    } catch {
      setNotice('Copie impossible sur cet appareil.')
    }
  }

  const sourceChip =
    source?.source === 'ia'
      ? { tone: 'jade', icon: 'Zap', label: PROVIDERS[state.settings.aiProvider]?.label || 'IA' }
      : { tone: 'slate', icon: 'WifiOff', label: 'Moteur local' }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {/* ---------------- Formulaire ---------------- */}
      <Panel className="lg:col-span-2">
        <SectionTitle eyebrow={task.eyebrow} title={task.title} subtitle={task.subtitle} icon={task.icon} />
        <div className="mt-4 space-y-3">
          {(task.fields || []).map((f) => (
            <label key={f.id} className="block">
              <span className="mb-1.5 block text-[11.5px] font-semibold tracking-wide text-gold-200/90">
                {f.label}
                {f.required && <span className="text-rose-300"> *</span>}
              </span>
              {f.type === 'textarea' ? (
                <textarea
                  className="field min-h-24 resize-y leading-relaxed"
                  placeholder={f.placeholder || ''}
                  value={values[f.id] || ''}
                  onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                />
              ) : f.type === 'select' ? (
                <select
                  className="field"
                  value={values[f.id] || ''}
                  onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                >
                  {(f.options || []).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="field"
                  placeholder={f.placeholder || ''}
                  value={values[f.id] || ''}
                  onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                />
              )}
            </label>
          ))}

          {!(task.fields || []).length && (
            <p className="text-[12px] leading-relaxed text-ash">
              Cette tâche s'appuie directement sur tes données locales : aucun champ à remplir.
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="gold" icon="Sparkles" onClick={run} disabled={busy}>
            {busy ? 'Analyse en cours…' : 'Lancer l\'analyse'}
          </Button>
          {(full || typed) && (
            <>
              <Button variant="ghost" icon="Copy" onClick={copy}>
                Copier
              </Button>
              <Button variant="ghost" icon="RefreshCw" onClick={run} disabled={busy}>
                Refaire
              </Button>
            </>
          )}
        </div>

        {notice && (
          <p className="mt-3 flex items-start gap-2 text-[11.5px] leading-relaxed text-amber-200">
            <Icon name="Info" size={13} className="mt-0.5 shrink-0" /> {notice}
          </p>
        )}
      </Panel>

      {/* ---------------- Résultat ---------------- */}
      <Panel className="lg:col-span-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionTitle eyebrow="Réponse" title={task.short} icon="Theater" />
          {source && (
            <Chip tone={sourceChip.tone} icon={sourceChip.icon}>
              {sourceChip.label}
            </Chip>
          )}
        </div>
        {typed || full ? (
          <div className="mt-4 rounded-2xl border border-gold-500/12 bg-void/45 p-4">
            <MarkdownLite text={typed} className={typed.length < (full || '').length ? 'anim-caret' : ''} />
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              icon={task.icon}
              title="Rien à afficher pour l'instant"
              text={task.fields?.length ? "Renseigne le formulaire puis lance l'analyse." : "Lance l'analyse : elle s'appuie sur tes données locales."}
            />
          </div>
        )}
      </Panel>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Onglet — Analyse (métriques, tendances, constats, revue)           */
/* ------------------------------------------------------------------ */

const ARROW = (d) => (d > 0 ? `▲ +${d}%` : d < 0 ? `▼ ${d}%` : '= stable')
const TREND_TONE = (d) => (d > 0 ? 'jade' : d < 0 ? 'blood' : 'slate')

const AnalysisTab = ({ onNavigate }) => {
  const { state } = useApp()
  const [digest, setDigest] = useState('')
  const [notice, setNotice] = useState('')

  const metrics = useMemo(() => buildMetrics(state), [state])
  const trends = useMemo(() => detectTrends(state), [state])
  const insights = useMemo(() => buildInsights(state), [state])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(digest)
      setNotice('Revue copiée.')
    } catch {
      setNotice('Copie impossible sur cet appareil.')
    }
  }

  return (
    <div className="space-y-4">
      {/* ---------------- Métriques ---------------- */}
      <Panel glow>
        <SectionTitle
          eyebrow="Analyse locale"
          title="Où tu en es, chiffres en main"
          subtitle="Calculé sur ton historique, sans aucun envoi de données."
          icon="Gauge"
        />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Incarnation" value={`${metrics.incarnRate}%`} icon="Percent" />
          <Stat label="Moyenne 7 j" value={`${metrics.avgRate7}%`} icon="TrendingUp" tone="sapphire" />
          <Stat label="Deep Work 7 j" value={formatMinutes(metrics.deepWork7)} icon="Timer" tone="jade" />
          <Stat label="Série" value={metrics.streak?.current || 0} unit="jours" icon="Flame" tone="blood" />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Débriefs" value={metrics.journalCount} icon="NotebookPen" />
          <Stat label="Projets ouverts" value={metrics.openProjectCount} icon="Waypoints" tone={metrics.openProjectCount > 3 ? 'blood' : 'jade'} />
          <Stat label="Tâches ouvertes" value={metrics.openTasks} icon="ListChecks" tone="slate" />
          <Stat label="Séances hypnose" value={metrics.hySessions} icon="Waves" tone="sapphire" />
        </div>
      </Panel>

      {/* ---------------- Piliers ---------------- */}
      <Panel>
        <SectionTitle eyebrow="Le Charbon" title="Piliers du jour" icon="Layers" />
        <div className="mt-3 space-y-2.5">
          {metrics.pillars.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <Icon name={p.icon} size={15} className="shrink-0" style={{ color: p.color }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[12.5px] font-semibold text-gold-100">{p.label}</span>
                  <span className="shrink-0 font-mono text-[11px] text-ash">
                    {p.today}/{p.target} {p.unit}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/6">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${p.pct}%`, background: `linear-gradient(90deg, ${p.color}66, ${p.color})` }}
                  />
                </div>
              </div>
              <span className="w-10 shrink-0 text-right font-mono text-[11.5px]" style={{ color: p.color }}>
                {p.pct}%
              </span>
            </div>
          ))}
        </div>
      </Panel>

      {/* ---------------- Tendances ---------------- */}
      <Panel>
        <SectionTitle
          eyebrow="Comparaison"
          title="Tendance : 7 jours vs 7 précédents"
          subtitle="Ce qui monte, ce qui décroche."
          icon="TrendingUp"
        />
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {trends.map((t) => (
            <div key={t.id} className="rounded-2xl border border-white/8 bg-white/2 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12.5px] font-semibold text-gold-100">{t.label}</span>
                <Chip tone={TREND_TONE(t.delta)} icon="TrendingUp">
                  {ARROW(t.delta)}
                </Chip>
              </div>
              <p className="mt-1 font-mono text-lg text-gold-200">{t.value}</p>
              <p className="mt-0.5 text-[10.5px] text-ash">{t.detail}</p>
            </div>
          ))}
        </div>
      </Panel>

      {/* ---------------- Constats ---------------- */}
      <Panel>
        <SectionTitle
          eyebrow="Diagnostic"
          title="Ce que je vois"
          subtitle="Constats froids + action concrète."
          icon="Lightbulb"
        />
        <div className="mt-3 space-y-2">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/2 p-3">
              <span
                className={cx(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
                  ins.tone === 'blood' && 'border-rose-500/30 bg-rose-500/10 text-rose-300',
                  ins.tone === 'jade' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
                  ins.tone === 'gold' && 'border-gold-500/30 bg-gold-500/10 text-gold-300',
                  ins.tone === 'sapphire' && 'border-sky-500/30 bg-sky-500/10 text-sky-300',
                )}
              >
                <Icon name={ins.icon} size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold text-gold-100">{ins.title}</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-ivory/75">{ins.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* ---------------- Revue de semaine ---------------- */}
      <Panel>
        <SectionTitle
          eyebrow="Revue"
          title="Revue de la semaine"
          subtitle="Un document complet, prêt à copier ou à garder."
          icon="FileText"
          right={
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" icon="Sparkles" onClick={() => setDigest(buildDigest(state))}>
                Générer
              </Button>
              {digest && (
                <Button size="sm" variant="ghost" icon="Copy" onClick={copy}>
                  Copier
                </Button>
              )}
            </div>
          }
        />
        {digest ? (
          <div className="mt-3 rounded-2xl border border-gold-500/15 bg-void/45 p-4">
            <MarkdownLite text={digest} />
          </div>
        ) : (
          <p className="mt-3 text-[12px] leading-relaxed text-ash">
            Clique sur « Générer » pour obtenir la revue : chiffres clés, état des piliers, constats et prochaine action.
          </p>
        )}
        {notice && (
          <p className="mt-2 flex items-center gap-2 text-[11.5px] text-gold-200">
            <Icon name="Info" size={12} /> {notice}
          </p>
        )}
      </Panel>

      <Panel flat className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold text-gold-100">Aller plus loin</p>
          <p className="text-[11px] text-ash">
            Le module Hypnose utilise cette même analyse pour te conseiller la séance la plus utile maintenant.
          </p>
        </div>
        <Button variant="ghost" icon="Waves" onClick={() => onNavigate?.('hypnosis')}>
          Ouvrir l'hypnose
        </Button>
      </Panel>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Racine — Studio IA                                                 */
/* ------------------------------------------------------------------ */

export const AiDirector = ({ onNavigate }) => {
  const { state } = useApp()
  const [tab, setTab] = useState('debrief')

  const tabs = useMemo(
    () => [
      { id: 'debrief', label: 'Débrief', icon: 'Theater' },
      ...AI_TASKS.map((t) => ({ id: t.id, label: t.label, icon: t.icon })),
      { id: 'analysis', label: 'Analyse', icon: 'Gauge' },
    ],
    [],
  )

  const isTask = AI_TASKS.some((t) => t.id === tab)

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <EngineBar settings={state.settings} onNavigate={onNavigate} />
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'debrief' && <DebriefTab onNavigate={onNavigate} />}
      {tab === 'analysis' && <AnalysisTab onNavigate={onNavigate} />}
      {isTask && <TaskTab taskId={tab} />}
    </div>
  )
}

export default AiDirector
