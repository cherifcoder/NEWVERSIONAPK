/* ------------------------------------------------------------------
   ProgressPanel.jsx — Onglet « Progrès »
   ------------------------------------------------------------------
   Niveau, série, régularité par unité, révisions espacées.
------------------------------------------------------------------- */

import { useMemo, useState } from 'react'
import Icon from '../../components/ui/Icon'
import { Button, Chip, Modal, Panel, ProgressBar, ProgressRing, SectionTitle, Stat } from '../../components/ui/Primitives'
import { useApp } from '../../context/AppContext'
import { COURSE, STEP_MAP } from '../../data/nonverbal/curriculum'
import { mediaFor } from '../../data/nonverbal/media'
import { allLessons, courseMediaIds, courseProgress, dueReviews, learningStreak, levelFromXp, unitProgress } from '../../lib/curriculum'
import { bundleStatus } from '../../lib/offlineMedia'
import { cx, dayKey, addDays, formatBytes, formatMinutes } from '../../lib/utils'

/** Sept derniers jours (clé locale + initiale du jour) — hors du rendu :
 *  l'appel à l'horloge n'est pas une fonction pure, on l'isole. */
const lastSevenDays = () => {
  const today = new Date()
  return Array.from({ length: 7 }, (_, k) => {
    const d = addDays(today, k - 6)
    return { key: dayKey(d), day: d.toLocaleDateString('fr-FR', { weekday: 'narrow' }) }
  })
}

export const ProgressPanel = ({ onOpenLesson }) => {
  const { state, nvResetProgress } = useApp()
  const nv = state.nonverbal || {}
  const progress = nv.progress || {}
  const [confirm, setConfirm] = useState(false)

  const overall = useMemo(() => courseProgress(COURSE, nv.progress || {}), [nv.progress])
  const lvl = useMemo(() => levelFromXp(nv.xp || 0), [nv.xp])
  const streak = useMemo(() => learningStreak(nv.log || {}), [nv.log])
  const due = useMemo(() => dueReviews(nv.reviews || {}, 12), [nv.reviews])
  const lessons = useMemo(() => allLessons(COURSE), [])

  const offline = useMemo(() => bundleStatus(courseMediaIds(COURSE), nv.downloads || {}, mediaFor), [nv.downloads])

  const last7 = useMemo(
    () => lastSevenDays().map((d) => ({ ...d, count: nv.log?.[d.key]?.lessons || 0 })),
    [nv.log],
  )
  const maxDay = Math.max(1, ...last7.map((d) => d.count))

  return (
    <div className="space-y-4">
      {/* ---------------- Niveau ---------------- */}
      <Panel glow>
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <ProgressRing value={overall.pct} label="Parcours" sublabel={`${overall.done}/${overall.total} leçons`} />
          <div className="min-w-0 flex-1">
            <p className="eyebrow">Niveau {lvl.level}</p>
            <h2 className="display text-2xl text-gold-100">{lvl.title}</h2>
            <p className="mt-1 text-[12.5px] text-ash">
              {lvl.nextTitle ? (
                <>
                  Encore <strong className="text-gold-200">{lvl.toNext} XP</strong> pour atteindre « {lvl.nextTitle} ».
                </>
              ) : (
                'Niveau maximal atteint.'
              )}
            </p>
            <ProgressBar className="mt-3" value={lvl.pct} />
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip tone="gold" icon="Zap">
                {nv.xp || 0} XP
              </Chip>
              <Chip tone="jade" icon="Flame">
                Série {streak.current} j
              </Chip>
              <Chip tone="slate" icon="Award">
                Record {streak.best} j
              </Chip>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Leçons finies" value={overall.done} icon="GraduationCap" tone="jade" />
          <Stat label="Temps cumulé" value={formatMinutes(overall.minutes)} icon="Clock" tone="gold" />
          <Stat label="Hors-ligne" value={`${offline.stored}/${offline.total}`} icon="HardDrive" tone="sapphire" />
          <Stat label="À réviser" value={due.length} icon="RefreshCw" tone={due.length ? 'blood' : 'slate'} />
        </div>
      </Panel>

      {/* ---------------- Régularité ---------------- */}
      <Panel>
        <SectionTitle eyebrow="Régularité" title="7 derniers jours" subtitle="Une leçon par jour suffit : la compétence est motrice, elle a besoin de répétition espacée." icon="BarChart3" />
        <div className="mt-4 flex items-end justify-between gap-2">
          {last7.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-24 w-full items-end">
                <div
                  className={cx('w-full rounded-t-lg transition-all', d.count ? 'bg-gradient-to-t from-gold-600/60 to-gold-300' : 'bg-white/6')}
                  style={{ height: `${d.count ? Math.max(14, (d.count / maxDay) * 100) : 8}%` }}
                  title={`${d.count} leçon(s)`}
                />
              </div>
              <span className={cx('text-[10px] font-semibold uppercase', d.count ? 'text-gold-200' : 'text-ash/60')}>{d.day}</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* ---------------- Par unité ---------------- */}
      <Panel>
        <SectionTitle eyebrow="Détail" title="Progression par unité" icon="Layers" />
        <div className="mt-4 space-y-4">
          {COURSE.units.map((unit) => {
            const up = unitProgress(unit, progress)
            return (
              <div key={unit.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-[13px] font-medium text-ivory/90">{unit.title}</p>
                  <span className="shrink-0 font-mono text-[11px] text-ash">
                    {up.done}/{up.total}
                  </span>
                </div>
                <ProgressBar className="mt-1.5" value={up.pct} tone={unit.color} />
              </div>
            )
          })}
        </div>
      </Panel>

      {/* ---------------- Révisions ---------------- */}
      <Panel>
        <SectionTitle
          eyebrow="Mémoire"
          title="À réviser aujourd'hui"
          subtitle="Les questions ratées reviennent plus vite ; les questions maîtrisées s'espacent (1 → 3 → 7 → 21 → 60 jours)."
          icon="RefreshCw"
        />
        {due.length === 0 ? (
          <p className="mt-3 text-[12.5px] text-ash">Aucune révision en attente. Continue le parcours : les échéances se remplissent au fil des questions.</p>
        ) : (
          <div className="mt-3 space-y-1.5">
            {due.map((itemId) => {
              const [lessonId] = itemId.split(':')
              const step = STEP_MAP[itemId]
              const lesson = lessons.find((l) => l.id === lessonId)
              return (
                <button
                  key={itemId}
                  type="button"
                  onClick={() => lesson && onOpenLesson?.(lesson)}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-3 py-2 text-left transition hover:border-gold-500/25"
                >
                  <Icon name="ListChecks" size={14} className="shrink-0 text-gold-300" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] text-ivory/90">{step?.question || step?.title || itemId}</span>
                    <span className="block truncate text-[10.5px] text-ash">{lesson?.title}</span>
                  </span>
                  <Icon name="ChevronRight" size={14} className="shrink-0 text-ash" />
                </button>
              )
            })}
          </div>
        )}
      </Panel>

      {/* ---------------- Données ---------------- */}
      <Panel flat>
        <SectionTitle eyebrow="Données locales" title="Tout reste sur ton téléphone" icon="ShieldCheck" />
        <p className="mt-2 text-[12.5px] leading-relaxed text-ash">
          Progression, XP et état des téléchargements sont stockés dans la mémoire de l'appareil. L'export de sauvegarde
          (Réglages → Sauvegarde) inclut le module non verbal : tu peux transférer ton parcours sur un autre téléphone.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="danger" icon="Trash2" onClick={() => setConfirm(true)}>
            Réinitialiser le parcours
          </Button>
          <span className="self-center text-[11px] text-ash">
            Médias hors-ligne : {formatBytes(offline.storedBytes)}
          </span>
        </div>
      </Panel>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Réinitialiser le parcours non verbal ?"
        subtitle="XP, série, progression et révisions seront effacés. Les fichiers déjà téléchargés resteront sur l'appareil (onglet Hors-ligne)."
        footer={
          <>
            <Button
              variant="danger"
              icon="Trash2"
              onClick={() => {
                nvResetProgress()
                setConfirm(false)
              }}
            >
              Réinitialiser
            </Button>
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              Annuler
            </Button>
          </>
        }
      >
        <p className="text-[12.5px] leading-relaxed text-ash">
          Cette action ne touche ni ton profil METHOD, ni tes piliers, ni ton journal. Seul le module de communication non
          verbale est concerné.
        </p>
      </Modal>
    </div>
  )
}

export default ProgressPanel
