import { useMemo, useState } from 'react'
import Icon from '../components/ui/Icon'
import {
  Button,
  Chip,
  EmptyState,
  Labeled,
  Modal,
  Panel,
  ProgressBar,
  SectionTitle,
  Stat,
} from '../components/ui/Primitives'
import { useApp } from '../context/AppContext'
import { EXERCISES } from '../data/exercises'
import { PILLARS, PILLAR_MAP } from '../data/tracks'
import { cx, dayKey, daysBetween, pickSeeded } from '../lib/utils'

const PROJECT_TYPES = ['Code', 'Mobile', 'Livre', 'Business', 'Compétence', 'Corps', 'Autre']

export const ZeroAbandon = () => {
  const {
    state,
    derived,
    addProject,
    updateProject,
    finishProject,
    reopenProject,
    removeProject,
    addTask,
    toggleTask,
    removeTask,
  } = useApp()

  const [showNew, setShowNew] = useState(false)
  const [finishing, setFinishing] = useState(null)
  const [proof, setProof] = useState('')
  const [taskInput, setTaskInput] = useState('')
  const [taskPillar, setTaskPillar] = useState('code')
  const [toast, setToast] = useState('')

  const open = useMemo(
    () => [...(derived.openProjects || [])].sort((a, b) => (a.priority || 2) - (b.priority || 2)),
    [derived.openProjects],
  )
  const finished = state.finishedProjects || []
  const tasks = state.tasks || []
  const pendingTasks = tasks.filter((t) => !t.done)
  const doneTasks = tasks.filter((t) => t.done)

  const oldest = useMemo(
    () =>
      [...open].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0] || null,
    [open],
  )

  const willpower = useMemo(
    () => [pickSeeded(EXERCISES.filter((e) => e.category === 'courage'), dayKey()), pickSeeded(EXERCISES.filter((e) => e.category === 'focus'), `${dayKey()}-f`)],
    [],
  )

  const violation = open.length > 1

  const handleAdd = (form) => {
    addProject(form)
    setShowNew(false)
    setToast('Boucle enregistrée. Une seule à la fois — finis-la.')
    setTimeout(() => setToast(''), 2800)
  }

  const handleFinish = () => {
    finishProject(finishing.id, proof)
    setFinishing(null)
    setProof('')
    setToast('Boucle fermée. C\'est ça, la preuve.')
    setTimeout(() => setToast(''), 2800)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* ---------------- Règle absolue ---------------- */}
      <Panel className={cx('relative overflow-hidden', violation ? 'border-rose-500/45' : 'border-gold-500/30')} glow>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className={cx('rounded-2xl border p-3', violation ? 'border-rose-500/40 bg-rose-500/12' : 'border-gold-500/30 bg-gold-500/10')}>
            <Icon name={violation ? 'AlertTriangle' : 'ShieldCheck'} size={26} className={violation ? 'text-rose-300' : 'text-gold-300'} />
          </div>
          <div className="min-w-0 flex-1">
            <SectionTitle
              eyebrow="Dispatcher Zéro Abandon"
              title="Finir ce qu'on commence"
              subtitle={
                violation
                  ? `Violation détectée : ${open.length} projets ouverts. Ta parole est en train de se dévaluer.`
                  : 'Une boucle ouverte à la fois. Interdiction absolue de commencer tant que la précédente n\'est pas livrée et déployée.'
              }
              icon="Swords"
            />
          </div>
          <Button variant="gold" icon="Plus" onClick={() => setShowNew(true)}>
            Nouveau projet
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Boucles ouvertes" value={open.length} icon="Swords" tone={violation ? 'blood' : 'gold'} />
          <Stat label="Livrées" value={finished.length} icon="BadgeCheck" tone="jade" />
          <Stat label="Tâches en attente" value={pendingTasks.length} icon="ListChecks" tone="sapphire" />
          <Stat
            label="Plus ancienne"
            value={oldest ? `${daysBetween(dayKey(oldest.createdAt), dayKey())} j` : '—'}
            icon="Clock"
            tone="slate"
          />
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* ---------------- Projets ouverts ---------------- */}
        <div className="space-y-4 lg:col-span-2">
          <Panel>
            <SectionTitle
              eyebrow="Boucles ouvertes"
              title="Ce qui n'est pas fini te possède"
              icon="Swords"
              right={<Chip tone={violation ? 'blood' : 'jade'}>{open.length} en cours</Chip>}
            />
            <div className="mt-4 space-y-3">
              {open.length === 0 ? (
                <EmptyState
                  icon="Rocket"
                  title="Aucune boucle ouverte"
                  text="Table rase. C'est le moment idéal pour lancer un projet ambitieux — un seul."
                  action={
                    <Button variant="gold" icon="Plus" onClick={() => setShowNew(true)} className="mt-2">
                      Lancer un projet
                    </Button>
                  }
                />
              ) : (
                open.map((p) => {
                  const age = daysBetween(dayKey(p.createdAt), dayKey())
                  const stale = age > 21
                  return (
                    <div key={p.id} className="rounded-2xl border border-gold-500/15 bg-white/2 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[14px] font-semibold text-gold-100">{p.title}</h3>
                            <Chip tone="slate">{p.type}</Chip>
                            {p.priority === 1 && <Chip tone="blood" icon="Flame">Priorité 1</Chip>}
                            {stale && <Chip tone="blood" icon="AlertTriangle">{age} jours</Chip>}
                          </div>
                          {p.note && <p className="mt-1.5 text-[12px] leading-relaxed text-ash">{p.note}</p>}
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setFinishing(p)}
                            className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 p-1.5 text-emerald-300 transition hover:bg-emerald-500/20"
                            title="Terminer et livrer"
                          >
                            <Icon name="BadgeCheck" size={15} />
                          </button>
                          <button
                            onClick={() => removeProject(p.id)}
                            className="rounded-lg border border-white/10 p-1.5 text-ash transition hover:border-rose-500/40 hover:text-rose-300"
                            title="Supprimer"
                          >
                            <Icon name="Trash2" size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="mb-1.5 flex items-center justify-between text-[11px] text-ash">
                          <span>Avancement réel</span>
                          <span className="font-mono text-gold-300">{p.progress}%</span>
                        </div>
                        <ProgressBar value={p.progress} tone={p.progress >= 80 ? '#2f9e78' : '#cfa851'} />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={p.progress}
                          onChange={(e) => updateProject(p.id, { progress: Number(e.target.value) })}
                          className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#cfa851]"
                        />
                      </div>

                      <div className="mt-3 flex items-center gap-2 rounded-xl border border-gold-500/15 bg-void/45 p-2.5">
                        <Icon name="Target" size={14} className="shrink-0 text-gold-400" />
                        <input
                          className="min-w-0 flex-1 bg-transparent text-[12.5px] text-ivory/90 outline-none placeholder:text-ash/50"
                          value={p.nextStep || ''}
                          placeholder="Prochain pas concret (obligatoire pour avancer)"
                          onChange={(e) => updateProject(p.id, { nextStep: e.target.value })}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Panel>

          {/* ---------------- Livrés ---------------- */}
          <Panel>
            <SectionTitle eyebrow="Preuves" title="Projets livrés & déployés" icon="BadgeCheck" />
            <div className="mt-4 space-y-2">
              {finished.length === 0 ? (
                <p className="text-[12.5px] text-ash">Aucune livraison encore. La première fermeture changera ton rapport à toi-même.</p>
              ) : (
                finished.map((p) => (
                  <div key={p.id} className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                    <Icon name="BadgeCheck" size={18} className="mt-0.5 shrink-0 text-emerald-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-emerald-100">{p.title}</p>
                      <p className="mt-0.5 text-[11px] text-ash">
                        Livré le {new Date(p.finishedAt).toLocaleDateString('fr-FR')} · {p.type}
                      </p>
                      {p.proof && (
                        <p className="mt-1.5 text-[12px] leading-relaxed text-emerald-100/80">Preuve : {p.proof}</p>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => reopenProject(p.id)}
                        className="rounded-lg border border-white/10 p-1.5 text-ash transition hover:text-gold-200"
                        title="Rouvrir"
                      >
                        <Icon name="RotateCcw" size={14} />
                      </button>
                      <button
                        onClick={() => removeProject(p.id)}
                        className="rounded-lg border border-white/10 p-1.5 text-ash transition hover:text-rose-300"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>

        {/* ---------------- Colonne droite ---------------- */}
        <div className="space-y-4">
          {/* Tâches */}
          <Panel>
            <SectionTitle eyebrow="Journal d'exécution" title="Tâches du jour" icon="ListChecks" />
            <div className="mt-3 flex gap-2">
              <input
                className="field !py-2"
                placeholder="Ajouter une tâche…"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && taskInput.trim()) {
                    addTask(taskInput, taskPillar)
                    setTaskInput('')
                  }
                }}
              />
              <Button
                variant="gold"
                icon="Plus"
                onClick={() => {
                  addTask(taskInput, taskPillar)
                  setTaskInput('')
                }}
                disabled={!taskInput.trim()}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PILLARS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setTaskPillar(p.id)}
                  className={cx('chip transition', taskPillar === p.id && 'border-gold-500/50 bg-gold-500/15')}
                >
                  {p.short}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              {pendingTasks.length === 0 && doneTasks.length === 0 && (
                <p className="text-[12px] text-ash">Aucune tâche. Une journée sans tâche écrite est une journée livrée au hasard.</p>
              )}
              {pendingTasks.map((t) => (
                <TaskRow key={t.id} task={t} onToggle={toggleTask} onRemove={removeTask} />
              ))}
              {doneTasks.length > 0 && (
                <p className="pt-2 text-[10.5px] tracking-widest text-ash/60 uppercase">
                  Terminées — {doneTasks.length}
                </p>
              )}
              {doneTasks.slice(0, 8).map((t) => (
                <TaskRow key={t.id} task={t} onToggle={toggleTask} onRemove={removeTask} />
              ))}
            </div>
          </Panel>

          {/* Force de volonté */}
          <Panel>
            <SectionTitle eyebrow="Renforcement" title="Exercices de volonté" icon="Flame" />
            <div className="mt-3 space-y-2">
              {willpower.filter(Boolean).map((ex) => (
                <div key={ex.id} className="rounded-2xl border border-gold-500/12 bg-white/2 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12.5px] font-semibold text-gold-100">{ex.title}</p>
                    <Chip tone="slate" icon="Clock">{ex.duration}</Chip>
                  </div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-ash">{ex.brief}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="border-gold-500/25">
            <SectionTitle eyebrow="Rappel" title="Loi du dispatcher" icon="Ban" />
            <ul className="mt-3 space-y-2">
              {[
                'Aucun nouveau projet tant que le précédent n\'est pas livré.',
                'Un projet sans « prochain pas » écrit est un projet mort.',
                '« Presque fini » = pas fini.',
                'Chaque abandon enseigne à ton cerveau que ta parole est négociable.',
              ].map((r, i) => (
                <li key={i} className="flex gap-2.5 text-[12px] leading-relaxed text-ivory/88">
                  <Icon name="ChevronRight" size={13} className="mt-0.5 shrink-0 text-gold-400" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      {/* ---------------- Modals ---------------- */}
      <NewProjectModal
        open={showNew}
        onClose={() => setShowNew(false)}
        onSubmit={handleAdd}
        warning={open.length > 0 ? open[0].title : null}
      />

      <Modal
        open={Boolean(finishing)}
        onClose={() => setFinishing(null)}
        title="Fermer la boucle"
        subtitle={finishing?.title}
        footer={
          <>
            <Button variant="gold" icon="BadgeCheck" onClick={handleFinish}>
              Marquer comme livré
            </Button>
            <Button variant="ghost" onClick={() => setFinishing(null)}>Annuler</Button>
          </>
        }
      >
        <p className="text-[12.5px] leading-relaxed text-ash">
          Une livraison sans preuve est une illusion. Écris ce qui existe maintenant et qui n'existait pas avant
          (lien déployé, commit, fichier, chapitre terminé…).
        </p>
        <Labeled label="Preuve de livraison" className="mt-3">
          <textarea
            className="field min-h-24 resize-y"
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            placeholder="Ex. Déployé sur Vercel — https://… · commit a1b2c3 · 3 modules livrés"
          />
        </Labeled>
      </Modal>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-8">
          <div className="rounded-xl border border-gold-500/40 bg-gold-500/12 px-4 py-2.5 text-[12.5px] font-medium text-gold-100 backdrop-blur-md">
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}

const TaskRow = ({ task, onToggle, onRemove }) => {
  const pillar = PILLAR_MAP[task.pillar]
  return (
    <div className={cx('flex items-start gap-3 rounded-xl border p-2.5', task.done ? 'border-white/6 bg-white/1' : 'border-gold-500/12 bg-white/2')}>
      <button
        onClick={() => onToggle(task.id)}
        className={cx(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition',
          task.done ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300' : 'border-gold-500/30 text-transparent hover:bg-gold-500/10',
        )}
      >
        <Icon name="Check" size={12} />
      </button>
      <div className="min-w-0 flex-1">
        <p className={cx('text-[12.5px] leading-snug', task.done ? 'text-ash line-through' : 'text-ivory/90')}>
          {task.title}
        </p>
        {pillar && (
          <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-ash/70">
            <Icon name={pillar.icon} size={10} /> {pillar.short}
          </span>
        )}
      </div>
      <button onClick={() => onRemove(task.id)} className="rounded p-1 text-ash/50 transition hover:text-rose-300">
        <Icon name="X" size={13} />
      </button>
    </div>
  )
}

const NewProjectModal = ({ open, onClose, onSubmit, warning }) => {
  const [form, setForm] = useState({ title: '', type: 'Code', note: '', nextStep: '', priority: 2, progress: 0 })

  const submit = () => {
    if (!form.title.trim()) return
    onSubmit(form)
    setForm({ title: '', type: 'Code', note: '', nextStep: '', priority: 2, progress: 0 })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ouvrir une nouvelle boucle"
      subtitle="Chaque projet ouvert consomme de la bande passante mentale jusqu'à sa livraison."
      wide
      footer={
        <>
          <Button variant="gold" icon="Rocket" onClick={submit} disabled={!form.title.trim()}>
            Enregistrer la boucle
          </Button>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
        </>
      }
    >
      {warning && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-500/35 bg-rose-500/10 p-3">
          <Icon name="AlertTriangle" size={15} className="mt-0.5 shrink-0 text-rose-300" />
          <p className="text-[12px] leading-relaxed text-rose-100">
            Tu as déjà une boucle ouverte : <span className="font-semibold">« {warning} »</span>. Le dispatcher
            t'autorise à ouvrir celle-ci, mais il l'inscrira comme violation de la règle d'or. Ferme l'ancienne
            d'abord.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <Labeled label="Titre du projet">
          <input
            className="field"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Ex. Terminer l'application METHOD et la déployer"
          />
        </Labeled>

        <Labeled label="Catégorie">
          <div className="flex flex-wrap gap-1.5">
            {PROJECT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={cx('chip transition', form.type === t && 'border-gold-500/50 bg-gold-500/15')}
              >
                {t}
              </button>
            ))}
          </div>
        </Labeled>

        <Labeled label="Prochain pas concret" hint="Une action physique, exécutable en moins d'une heure.">
          <input
            className="field"
            value={form.nextStep}
            onChange={(e) => setForm((f) => ({ ...f, nextStep: e.target.value }))}
            placeholder="Ex. Écrire le module de paiement et le tester"
          />
        </Labeled>

        <Labeled label="Note / enjeu">
          <textarea
            className="field min-h-20 resize-y"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="Pourquoi ce projet compte, et ce qu'il t'apporte."
          />
        </Labeled>

        <div className="grid grid-cols-2 gap-3">
          <Labeled label="Avancement actuel">
            <input
              type="number"
              min="0"
              max="100"
              className="field text-center font-mono"
              value={form.progress}
              onChange={(e) => setForm((f) => ({ ...f, progress: Number(e.target.value) }))}
            />
          </Labeled>
          <Labeled label="Priorité">
            <select
              className="field"
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) }))}
            >
              <option value={1}>1 — Critique</option>
              <option value={2}>2 — Normale</option>
              <option value={3}>3 — Secondaire</option>
            </select>
          </Labeled>
        </div>
      </div>
    </Modal>
  )
}

export default ZeroAbandon
