/* ------------------------------------------------------------------
   OfflineManager.jsx — Onglet « Hors-ligne »
   ------------------------------------------------------------------
   • État de synchronisation du cours, unité par unité
   • Espace requis / disponible avant de lancer un téléchargement
   • Téléchargement en lot (séquentiel, reprise possible)
   • Adaptation automatique : Cache Storage (WebView) ou Filesystem natif
------------------------------------------------------------------- */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../../components/ui/Icon'
import { Button, Chip, EmptyState, Panel, ProgressBar, SectionTitle, Stat } from '../../components/ui/Primitives'
import { MediaRow } from '../../components/nonverbal/Steps'
import { useApp } from '../../context/AppContext'
import { COURSE } from '../../data/nonverbal/curriculum'
import { KIND_META, MEDIA_LIST, mediaFor } from '../../data/nonverbal/media'
import { courseMediaIds, unitMediaIds } from '../../lib/curriculum'
import {
  STATUS_META,
  bundleStatus,
  downloadBatch,
  estimateQuota,
  hasRoomFor,
  isNative,
  loadQueue,
  removeMedia,
  storageMode,
} from '../../lib/offlineMedia'
import { cx, formatBytes } from '../../lib/utils'

const StatusChip = ({ status }) => {
  const meta = STATUS_META[status.state] || STATUS_META.missing
  return (
    <Chip tone={meta.tone} icon={meta.icon}>
      {status.state === 'partial' ? `Incomplet ${status.stored}/${status.total}` : meta.label}
    </Chip>
  )
}

export const OfflineManager = () => {
  const { state, nvMarkDownload, nvUnmarkDownload } = useApp()
  const downloads = state.nonverbal?.downloads || {}

  const [quota, setQuota] = useState(null)
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  const [progressMap, setProgressMap] = useState({})
  const [batchPct, setBatchPct] = useState(null)
  const [busy, setBusy] = useState(false)
  const stopRef = useRef(false)
  const [stopping, setStopping] = useState(false)
  const [toast, setToast] = useState('')
  const [lastError, setLastError] = useState('')
  const [queue, setQueue] = useState(() => loadQueue())
  const [openUnit, setOpenUnit] = useState(null)

  const mode = storageMode()
  const native = isNative()
  const courseIds = useMemo(() => courseMediaIds(COURSE), [])
  const courseStatus = useMemo(
    () => bundleStatus(courseIds, state.nonverbal?.downloads || {}, mediaFor),
    [courseIds, state.nonverbal?.downloads],
  )

  const refresh = useCallback(() => {
    // Sur l'APK, le quota du WebView n'a pas de sens : l'espace est géré par
    // le système de fichiers natif. On n'affiche donc pas de chiffre trompeur.
    if (isNative()) setQuota(null)
    else estimateQuota().then(setQuota)
    setQueue(loadQueue())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const flash = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  /* ---------------------- Téléchargement d'un lot ---------------------- */

  const runBatch = async (mediaIds, label) => {
    if (busy) return
    setLastError('')
    try {
      const list = mediaIds.map(mediaFor).filter(Boolean)
      const remaining = list.filter((m) => !downloads[m.id])
      if (!remaining.length) {
        flash('Tout est déjà disponible hors-ligne.')
        return
      }

      const required = remaining.reduce((t, m) => t + (m.bytes || 0), 0)
      const room = await hasRoomFor(required)
      if (!room.ok) {
        setLastError(room.reason || 'Espace insuffisant.')
        flash(room.reason || 'Espace insuffisant.')
        return
      }

      setBusy(true)
      stopRef.current = false
      setStopping(false)
      setBatchPct(0)
      try {
        const res = await downloadBatch(
          remaining,
          {
            onItem: (media, st, pct) => setProgressMap((p) => ({ ...p, [media.id]: st === 'done' ? undefined : pct })),
            onDone: (media, info) => nvMarkDownload(media.id, { ...info, downloadedAt: new Date().toISOString() }),
            onBatch: (pct) => setBatchPct(pct),
          },
          { shouldStop: () => stopRef.current },
        )
        refresh()
        if (res.failed.length) {
          const first = res.failed[0]?.error || 'erreur inconnue'
          const msg = `${res.ok.length} média(s) prêt(s), ${res.failed.length} échec(s) — ${first}`
          setLastError(msg)
          flash(msg)
        } else {
          flash(`${label} disponible hors-ligne (${formatBytes(required)}).`)
        }
      } finally {
        setBusy(false)
        setTimeout(() => {
          setBatchPct(null)
          setProgressMap({})
        }, 900)
      }
    } catch (err) {
      // Filet de sécurité : sans ce catch, une erreur inattendue laisserait
      // l'écran muet (le fameux « il ne se passe rien »).
      setBusy(false)
      const msg = `Téléchargement impossible : ${err?.message || 'erreur inconnue'}`
      setLastError(msg)
      flash(msg)
      console.error('[offline] téléchargement', err)
    }
  }

  const removeUnit = async (mediaIds) => {
    for (const id of mediaIds) {
      const m = mediaFor(id)
      if (m && downloads[id]) {
        // eslint-disable-next-line no-await-in-loop
        await removeMedia(m)
        nvUnmarkDownload(id)
      }
    }
    refresh()
    flash('Contenu retiré de l\'appareil.')
  }

  const storageChip =
    mode === 'filesystem'
      ? { tone: 'jade', icon: 'Smartphone', label: 'Stockage natif (Filesystem)' }
      : mode === 'cache'
        ? { tone: 'sapphire', icon: 'HardDrive', label: 'Cache de l\'application' }
        : { tone: 'blood', icon: 'WifiOff', label: 'Stockage indisponible' }

  return (
    <div className="space-y-4">
      {/* ---------------- En-tête ---------------- */}
      <Panel glow>
        <SectionTitle
          eyebrow="Mode hors-ligne"
          title="Télécharger le cours"
          subtitle={
            native
              ? "Le vectoriel, l'audio et les fiches sont embarqués dans l'application : ils se lisent déjà sans réseau. Ce bouton les marque comme disponibles hors-ligne."
              : "Le vectoriel (illustrations, mini-vidéos) est déjà embarqué. Seuls l'audio et les fiches se téléchargent : quelques mégaoctets pour tout le parcours."
          }
          icon="HardDrive"
          right={
            <div className="flex flex-wrap justify-end gap-2">
              <Chip tone={online ? 'jade' : 'blood'} icon={online ? 'Wifi' : 'WifiOff'}>
                {online ? 'En ligne' : 'Hors-ligne'}
              </Chip>
              <Chip tone={storageChip.tone} icon={storageChip.icon}>
                {storageChip.label}
              </Chip>
            </div>
          }
        />

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Médias du cours" value={courseStatus.total} icon="Layers" />
          <Stat label="Sur l'appareil" value={`${courseStatus.stored}/${courseStatus.total}`} icon="CheckCircle2" tone="jade" />
          <Stat label="Poids du cours" value={formatBytes(courseStatus.bytes)} icon="Download" tone="sapphire" />
          <Stat
            label="Espace libre"
            value={quota ? formatBytes(quota.free) : '—'}
            icon="HardDrive"
            tone="slate"
            hint={quota ? `sur ${formatBytes(quota.quota)}` : native ? 'géré par Android' : undefined}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="gold" icon="Download" disabled={busy} onClick={() => runBatch(courseIds, 'Le cours complet')}>
            {busy ? 'Téléchargement…' : 'Tout télécharger'}
          </Button>
          {busy && (
            <Button variant="danger" icon="Ban" onClick={() => { stopRef.current = true; setStopping(true) }}>
              Arrêter
            </Button>
          )}
          {courseStatus.stored > 0 && !busy && (
            <Button variant="ghost" icon="Trash2" onClick={() => removeUnit(courseIds)}>
              Libérer l'espace
            </Button>
          )}
          <StatusChip status={courseStatus} />
          {queue.pending?.length > 0 && (
            <Chip tone="sapphire" icon="RefreshCw">
              {queue.pending.length} en file d'attente
            </Chip>
          )}
        </div>

        {typeof batchPct === 'number' && (
          <div className="mt-3">
            <ProgressBar value={batchPct} tone="#4a7fd4" />
            <p className="mt-1 text-center text-[10.5px] text-sky-200">
              Lot en cours… {batchPct}%{stopping ? ' — arrêt demandé' : ''}
            </p>
          </div>
        )}

        {lastError && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-500/35 bg-rose-500/10 p-3">
            <Icon name="AlertTriangle" size={15} className="mt-0.5 shrink-0 text-rose-300" />
            <p className="text-[12px] leading-relaxed text-rose-100">{lastError}</p>
            <button
              type="button"
              onClick={() => setLastError('')}
              aria-label="Masquer le message"
              className="ml-auto shrink-0 rounded-lg p-1 text-rose-200/70 transition hover:text-rose-100"
            >
              <Icon name="X" size={14} />
            </button>
          </div>
        )}

        {mode === 'unavailable' && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/35 bg-amber-500/10 p-3">
            <Icon name="AlertTriangle" size={15} className="mt-0.5 shrink-0 text-amber-300" />
            <p className="text-[12px] leading-relaxed text-amber-100">
              Le stockage hors-ligne n'est pas disponible dans ce contexte. Ouvre l'application depuis l'APK (ou en HTTPS)
              pour activer le téléchargement. Le contenu vectoriel reste accessible dans tous les cas.
            </p>
          </div>
        )}

        {native && (
          <p className="mt-3 text-[11.5px] leading-relaxed text-ash">
            Sur l'APK, l'audio et les fiches sont embarqués dans l'application : ils se lisent sans réseau même sans
            téléchargement. « Tout télécharger » les marque comme disponibles pour que l'état hors-ligne soit explicite.
          </p>
        )}
      </Panel>

      {/* ---------------- Unités ---------------- */}
      {COURSE.units.map((unit) => {
        const ids = unitMediaIds(unit)
        const status = bundleStatus(ids, downloads, mediaFor)
        const isOpen = openUnit === unit.id
        return (
          <Panel key={unit.id}>
            <button type="button" className="flex w-full items-center gap-3 text-left" onClick={() => setOpenUnit(isOpen ? null : unit.id)}>
              <span className="h-8 w-1.5 shrink-0 rounded-full" style={{ background: unit.color }} />
              <div className="min-w-0 flex-1">
                <p className="eyebrow text-[9px]">{unit.lessons.length} leçons</p>
                <p className="display truncate text-[15px] text-gold-100">{unit.title}</p>
              </div>
              <StatusChip status={status} />
              <Icon name={isOpen ? 'ChevronUp' : 'ChevronDown'} size={16} className="shrink-0 text-ash" />
            </button>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Chip tone="slate" icon="HardDrive">
                {formatBytes(status.bytes)}
              </Chip>
              <Button size="sm" variant="ghost" icon="Download" disabled={busy || status.state === 'ready'} onClick={() => runBatch(ids, unit.title)}>
                Télécharger l'unité
              </Button>
              {status.stored > 0 && (
                <Button size="sm" variant="ghost" icon="Trash2" disabled={busy} onClick={() => removeUnit(ids)}>
                  Retirer
                </Button>
              )}
            </div>

            {isOpen && (
              <div className="mt-3 space-y-2 border-t border-gold-500/12 pt-3">
                {ids.length === 0 && <EmptyState icon="CheckCircle2" title="Aucun média lourd" text="Cette unité n'utilise que du vectoriel embarqué : elle est déjà 100 % hors-ligne." />}
                {ids.map((id) => {
                  const m = mediaFor(id)
                  if (!m) return null
                  return (
                    <MediaRow
                      key={id}
                      media={m}
                      stored={Boolean(downloads[id])}
                      busy={busy}
                      pct={progressMap[id]}
                      onDownload={(media) => runBatch([media.id], media.title)}
                      onRemove={async (media) => {
                        await removeMedia(media)
                        nvUnmarkDownload(media.id)
                        refresh()
                      }}
                    />
                  )
                })}
              </div>
            )}
          </Panel>
        )
      })}

      {/* ---------------- Inventaire complet ---------------- */}
      <Panel flat>
        <SectionTitle eyebrow="Inventaire" title="Tous les médias" icon="Layers" />
        <div className="mt-3 space-y-1.5">
          {MEDIA_LIST.map((m) => {
            const meta = KIND_META[m.kind] || KIND_META.text
            const stored = Boolean(downloads[m.id])
            return (
              <div key={m.id} className="flex items-center gap-3 text-[12px]">
                <Icon name={meta.icon} size={13} style={{ color: meta.color }} />
                <span className="min-w-0 flex-1 truncate text-ivory/85">{m.title}</span>
                <span className="shrink-0 font-mono text-[11px] text-ash">{formatBytes(downloads[m.id]?.bytes || m.bytes)}</span>
                <span className={cx('shrink-0 font-mono text-[10px]', stored ? 'text-emerald-300' : 'text-ash/60')}>
                  {stored ? 'local' : 'distant'}
                </span>
              </div>
            )
          })}
        </div>
      </Panel>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 lg:bottom-8">
          <div className="rounded-xl border border-gold-500/40 bg-gold-500/12 px-4 py-2.5 text-[12.5px] font-medium text-gold-100 backdrop-blur-md">
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}

export default OfflineManager
