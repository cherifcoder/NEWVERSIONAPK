/* ------------------------------------------------------------------
   NonverbalAcademy.jsx — Module « Communication non verbale »
   ------------------------------------------------------------------
   Trois onglets :
     • Parcours   — chemin de leçons (codes Duolingo) + atelier postures
     • Hors-ligne — téléchargements et espace de stockage
     • Progrès    — niveau, série, révisions espacées
------------------------------------------------------------------- */

import { useMemo, useState } from 'react'
import Icon from '../../components/ui/Icon'
import { Button, Chip, Modal, Panel, ProgressBar, SectionTitle, Tabs } from '../../components/ui/Primitives'
import { Illustration } from '../../components/nonverbal/Visuals'
import { useApp } from '../../context/AppContext'
import { COURSE } from '../../data/nonverbal/curriculum'
import { mediaFor } from '../../data/nonverbal/media'
import { POSE_LIST } from '../../lib/figure'
import {
  allLessons,
  courseProgress,
  isLessonUnlocked,
  isUnitUnlocked,
  learningStreak,
  lessonIsDone,
  lessonMediaIds,
  levelFromXp,
  nextLesson,
  unitProgress,
} from '../../lib/curriculum'
import { bundleStatus } from '../../lib/offlineMedia'
import { cx, formatMinutes } from '../../lib/utils'
import LessonPlayer from './LessonPlayer'
import OfflineManager from './OfflineManager'
import ProgressPanel from './ProgressPanel'

/* ------------------------------ Nœud de leçon ------------------------------ */

const LessonNode = ({ lesson, index, state, onOpen }) => {
  const { done, current, locked, offline } = state
  const meta = { done: { icon: 'Check', cls: 'border-emerald-500/50 bg-emerald-500/16 text-emerald-200' }, current: { icon: 'Play', cls: 'border-gold-400/60 bg-gold-500/22 text-gold-100' }, locked: { icon: 'Lock', cls: 'border-white/10 bg-white/4 text-ash/60' } }
  const m = locked ? meta.locked : done ? meta.done : meta.current

  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => onOpen(lesson)}
      className={cx(
        'group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition',
        locked ? 'cursor-not-allowed border-white/8 bg-white/2 opacity-70' : 'border-gold-500/15 bg-white/3 hover:border-gold-500/35 hover:bg-gold-500/6',
        current && !locked && 'border-gold-400/45 bg-gold-500/8',
      )}
    >
      <span className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-mono text-[12px]', m.cls)}>
        {done ? <Icon name="Check" size={17} /> : locked ? <Icon name="Lock" size={15} /> : index + 1}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="display truncate text-[14.5px] text-gold-100">{lesson.title}</span>
          {current && !done && !locked && <Chip tone="gold">En cours</Chip>}
        </span>
        <span className="mt-0.5 block truncate text-[11.5px] text-ash">{lesson.goal}</span>
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Chip tone="slate" icon="Clock">
            {lesson.minutes} min
          </Chip>
          <Chip tone="slate" icon="Layers">
            {lesson.steps.length} étapes
          </Chip>
          {offline.total > 0 && (
            <Chip tone={offline.state === 'ready' ? 'jade' : 'slate'} icon={offline.state === 'ready' ? 'CheckCircle2' : 'Download'}>
              {offline.state === 'ready' ? 'Hors-ligne' : `${offline.stored}/${offline.total}`}
            </Chip>
          )}
        </span>
      </span>

      {!locked && <Icon name="ChevronRight" size={17} className="shrink-0 text-ash transition group-hover:translate-x-0.5 group-hover:text-gold-200" />}
    </button>
  )
}

/* ------------------------------- Leçon du jour ------------------------------- */

const DailyCard = ({ lesson, onOpen }) => {
  if (!lesson) return null
  return (
    <Panel className="border-gold-400/35 bg-gradient-to-br from-gold-500/12 to-transparent">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow flex items-center gap-1.5">
            <Icon name="Target" size={12} /> Prochaine action
          </p>
          <h3 className="display mt-1 text-lg text-gold-100">{lesson.title}</h3>
          <p className="mt-0.5 text-[12px] text-ash">{lesson.goal}</p>
        </div>
        <Button variant="gold" icon="Play" onClick={() => onOpen(lesson)} className="shrink-0">
          Continuer · {lesson.minutes} min
        </Button>
      </div>
    </Panel>
  )
}

/* ================================== Module ================================== */

export const NonverbalAcademy = () => {
  const { state } = useApp()
  const nv = state.nonverbal || {}
  const progress = nv.progress || {}
  const [tab, setTab] = useState('parcours')
  const [openLessonId, setOpenLessonId] = useState(null)
  const [poseModal, setPoseModal] = useState(null)
  const [query, setQuery] = useState('')

  const lessons = useMemo(() => allLessons(COURSE), [])
  const overall = useMemo(() => courseProgress(COURSE, nv.progress || {}), [nv.progress])
  const lvl = useMemo(() => levelFromXp(nv.xp || 0), [nv.xp])
  const streak = useMemo(() => learningStreak(nv.log || {}), [nv.log])
  const upcoming = useMemo(() => nextLesson(COURSE, nv.progress || {}), [nv.progress])

  const openLesson = (lesson) => {
    setOpenLessonId(lesson.id)
    window.scrollTo({ top: 0 })
  }

  /* --------------------------- Lecteur de leçon --------------------------- */
  if (openLessonId) {
    const lesson = lessons.find((l) => l.id === openLessonId)
    const unit = COURSE.units[lesson.unitIndex]
    const idx = lessons.findIndex((l) => l.id === lesson.id)
    const candidate = lessons[idx + 1]
    const hasNext = Boolean(candidate && isLessonUnlocked(COURSE, candidate, progress))

    return (
      <div className="mx-auto max-w-3xl">
        <LessonPlayer
          lesson={lesson}
          unit={unit}
          onExit={() => setOpenLessonId(null)}
          onNext={() => candidate && setOpenLessonId(candidate.id)}
          hasNext={hasNext}
        />
      </div>
    )
  }

  const filtered = query.trim()
    ? lessons.filter((l) => [l.title, l.goal, l.unitTitle, ...(l.tags || [])].join(' ').toLowerCase().includes(query.trim().toLowerCase()))
    : null

  /* ------------------------------- Onglets ------------------------------- */
  return (
    <div className="space-y-4">
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'parcours', label: 'Parcours', icon: 'Footprints' },
          { id: 'offline', label: 'Hors-ligne', icon: 'HardDrive' },
          { id: 'progres', label: 'Progrès', icon: 'BarChart3' },
        ]}
      />

      {tab === 'offline' && <OfflineManager />}
      {tab === 'progres' && <ProgressPanel onOpenLesson={openLesson} />}

      {tab === 'parcours' && (
        <>
          {/* ---------------- En-tête ---------------- */}
          <Panel glow>
            <SectionTitle
              eyebrow={`${COURSE.level} · ${formatMinutes(COURSE.minutes)}`}
              title={COURSE.title}
              subtitle={COURSE.subtitle}
              icon="PersonStanding"
              right={
                <div className="flex flex-wrap justify-end gap-2">
                  <Chip tone="gold" icon="Zap">
                    Niv. {lvl.level} · {lvl.title}
                  </Chip>
                  <Chip tone="jade" icon="Flame">
                    {streak.current} j
                  </Chip>
                </div>
              }
            />
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] text-ash">
                <span>
                  {overall.done}/{overall.total} leçons terminées
                </span>
                <span className="font-mono">{overall.pct}%</span>
              </div>
              <ProgressBar className="mt-1.5" value={overall.pct} height={8} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="panel-flat p-2.5">
                <p className="font-mono text-lg text-gold-200">{nv.xp || 0}</p>
                <p className="text-[9.5px] tracking-wide text-ash uppercase">XP</p>
              </div>
              <div className="panel-flat p-2.5">
                <p className="font-mono text-lg text-emerald-300">{overall.done}</p>
                <p className="text-[9.5px] tracking-wide text-ash uppercase">Leçons</p>
              </div>
              <div className="panel-flat p-2.5">
                <p className="font-mono text-lg text-sky-300">{formatMinutes(overall.minutes)}</p>
                <p className="text-[9.5px] tracking-wide text-ash uppercase">Pratiqué</p>
              </div>
            </div>
          </Panel>

          <DailyCard lesson={upcoming} onOpen={openLesson} />

          {/* ---------------- Recherche ---------------- */}
          <div className="relative">
            <Icon name="Search" size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-ash" />
            <input
              className="field pl-9"
              placeholder="Chercher une leçon, un thème (« saluer », « assise », « élocution »…)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* ---------------- Chemin ---------------- */}
          {filtered ? (
            <Panel>
              <SectionTitle eyebrow="Recherche" title={`${filtered.length} leçon(s)`} icon="Search" />
              <div className="mt-3 space-y-2">
                {filtered.map((l) => (
                  <LessonNode
                    key={l.id}
                    lesson={l}
                    index={lessons.findIndex((x) => x.id === l.id)}
                    state={{
                      done: lessonIsDone(progress, l.id),
                      current: upcoming?.id === l.id,
                      locked: !isLessonUnlocked(COURSE, l, progress),
                      offline: bundleStatus(lessonMediaIds(l), nv.downloads || {}, mediaFor),
                    }}
                    onOpen={openLesson}
                  />
                ))}
              </div>
            </Panel>
          ) : (
            COURSE.units.map((unit, ui) => {
              const unlocked = isUnitUnlocked(COURSE, ui, progress)
              const up = unitProgress(unit, progress)
              return (
                <Panel key={unit.id} className={cx(!unlocked && 'opacity-80')}>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-10 w-1.5 shrink-0 rounded-full" style={{ background: unit.color }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="eyebrow text-[9px]">Unité {ui + 1}</p>
                        {!unlocked && (
                          <Chip tone="slate" icon="Lock">
                            À débloquer
                          </Chip>
                        )}
                        {unlocked && up.pct === 100 && (
                          <Chip tone="jade" icon="CheckCircle2">
                            Maîtrisée
                          </Chip>
                        )}
                      </div>
                      <h3 className="display mt-0.5 text-lg text-gold-100">{unit.title}</h3>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-ash">{unit.subtitle}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <ProgressBar value={up.pct} tone={unit.color} height={5} className="max-w-[220px]" />
                        <span className="font-mono text-[10.5px] text-ash">
                          {up.done}/{up.total}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!unlocked ? (
                    <p className="mt-3 rounded-xl border border-dashed border-gold-500/20 bg-white/2 p-3 text-[12px] text-ash">
                      Termine 60 % de l'unité {ui} pour ouvrir celle-ci. La progression est volontairement séquentielle : chaque geste s'appuie sur le précédent.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {unit.lessons.map((l, li) => (
                        <LessonNode
                          key={l.id}
                          lesson={{ ...l, unitTitle: unit.title }}
                          index={li}
                          state={{
                            done: lessonIsDone(progress, l.id),
                            current: upcoming?.id === l.id,
                            locked: !isLessonUnlocked(COURSE, { ...l, unitIndex: ui, lessonIndex: li }, progress),
                            offline: bundleStatus(lessonMediaIds(l), nv.downloads || {}, mediaFor),
                          }}
                          onOpen={openLesson}
                        />
                      ))}
                    </div>
                  )}
                </Panel>
              )
            })
          )}

          {/* ---------------- Atelier des postures ---------------- */}
          <Panel>
            <SectionTitle
              eyebrow="Atelier"
              title="Bibliothèque des postures"
              subtitle="12 postures vectorielles, générées par l'application. Touche une planche pour la voir en grand — aucun téléchargement, aucune connexion."
              icon="PersonStanding"
            />
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {POSE_LIST.map((p) => (
                <button key={p.id} type="button" onClick={() => setPoseModal(p.id)} className="text-left transition hover:opacity-90">
                  <Illustration poseId={p.id} ratio="aspect-square" />
                </button>
              ))}
            </div>
          </Panel>
        </>
      )}

      {/* ---------------- Modale posture ---------------- */}
      <Modal open={Boolean(poseModal)} onClose={() => setPoseModal(null)} wide>
        {poseModal && (
          <div className="space-y-3">
            <Illustration poseId={poseModal} showAxis={POSE_LIST.find((p) => p.id === poseModal)?.showAxis} ratio="aspect-[4/3]" />
            <div>
              <h3 className="display text-xl text-gold-100">{POSE_LIST.find((p) => p.id === poseModal)?.label}</h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ash">{POSE_LIST.find((p) => p.id === poseModal)?.intent}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip tone="sapphire" icon="Layers">
                Vectoriel embarqué
              </Chip>
              {(POSE_LIST.find((p) => p.id === poseModal)?.props || []).map((pr) => (
                <Chip key={pr} tone="slate">
                  {pr}
                </Chip>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default NonverbalAcademy
