/* ------------------------------------------------------------------
   HypnosisOffline.jsx — Onglet « Hors-ligne » du module hypnose
   ------------------------------------------------------------------
   Réutilise le gestionnaire hors-ligne transversal (src/lib/offlineMedia):
   • État de synchronisation par famille (ambiances / repères / scripts)
   • Espace requis, téléchargement en lot, reprise, suppression
   • Adaptation automatique : Cache Storage (Web) ou assets embarqués (APK)
------------------------------------------------------------------- */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../../components/ui/Icon'
import { Button, Chip, Panel, ProgressBar, SectionTitle, Stat } from '../../components/ui/Primitives'
import { useApp } from '../../context/AppContext'
import { AMBIENCE_LIST, CUE_LIST, HY_KIND_META, HY_MEDIA_LIST, SCRIPT_LIST, TOTAL_HY_BYTES } from '../../data/hypnosis'
import {
  STATUS_META,
  bundleStatus,
  downloadBatch,
  estimateQuota,
  hasRoomFor,
  isNative,
  removeMedia,
  storageMode,
} from '../../lib/offlineMedia'
import { cx, formatBytes } from '../../lib/utils'

const GROUPS = [
  { id: 'ambience', label: 'Ambiances', icon: 'Waves', list: AMBIENCE_LIST },
  { id: 'cue', label: 'Repères sonores', icon: 'BellRing', list: CUE_LIST },
  { id: 'script', label: 'Scripts de séance', icon: 'FileText', list: SCRIPT_LIST },
]

const StatusChip = ({ status }) => {
  const meta = STATUS_META[status.state] || STATUS_META.missing
  return (
    <Chip tone={meta.tone} icon={meta.icon}>
      {status.state === 'partial' ? `Incomplet ${status.stored}/${status.total}` : meta.label}
    </Chip>
  )
}

export const HypnosisOffline = () => {
  const { state, hyMarkDownload, hyUnmarkDownload } = useApp()
  const downloads = state.hypnosis?.downloads || {}

  const [quota, setQuota] = useState(null)
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  const [progressMap, setProgressMap] = useState({})
  const [batchPct, setBatchPct] = useState(null)
  const [busy, setBusy] = useState(false)
  const [stopping, setStopping] = useState(false)
  const stopRef = useRef(false)
  const [lastError, setLastError] = useState('')
  const [toast, setToast] = useState('')

  const mode = storageMode()
  const native = isNative()
  const allIds = useMemo(() => HY_MEDIA_LIST.map((m) => m.id), [])
  const total = useMemo(() => bundleStatus(allIds, downloads, Object.fromEntries(HY_MEDIA_LIST.map((m) => [m.id, m]))), [allIds, downloads])

  const refresh = useCallback(() => {
    if (isNative()) setQuota(null)
    else estimateQuota().then(setQuota)
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
    setTimeout(() => setToast(''), 2800)
  }

  const runBatch = async (list, label) => {
    if (busy) return
    setLastError('')
    try {
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
            onDone: (media, info) => hyMarkDownload(media.id, { ...info, downloadedAt: new Date().toISOString() }),
            onBatch: (pct) => setBatchPct(pct),
          },
          { shouldStop: () => stopRef.current },
        )
        refresh()
        if (res.failed.length) {
          const first = res.failed[0]?.error || 'erreur inconnue'
          const msg = `${res.ok.length} fichier(s) prêt(s), ${res.failed.length} échec(s) — ${first}`
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
      setBusy(false)
      const msg = `Téléchargement impossible : ${err?.message || 'erreur inconnue'}`
      setLastError(msg)
      flash(msg)
      console.error('[hypnose] téléchargement', err)
    }
  }

  const removeAll = async (list) => {
    for (const m of list) {
      if (!downloads[m.id]) continue
      // eslint-disable-next-line no-await-in-loop
      await removeMedia(m)
      hyUnmarkDownload(m.id)
    }
    refresh()
    flash("Contenu retiré de l'appareil.")
  }

  const storageChip =
    mode === 'filesystem'
      ? { tone: 'jade', icon: 'Smartphone', label: 'Stockage natif (APK)' }
      : mode === 'cache'
        ? { tone: 'sapphire', icon: 'HardDrive', label: "Cache de l'application" }
        : { tone: 'blood', icon: 'WifiOff', label: 'Stockage indisponible' }

  return (
    <div className="space-y-4">
      <Panel glow>
        <SectionTitle
          eyebrow="Mode hors-ligne"
          title="Emporter les séances partout"
          subtitle={
            native
              ? "Les ambiances, les repères et les scripts sont déjà embarqués dans l'APK : ils se lisent sans réseau. Ce bouton les marque comme disponibles hors-ligne."
              : "Les ambiances, les repères et les scripts sont générés localement. Télécharge-les une fois pour les avoir sans réseau, à vie."
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
          <Stat label="Fichiers" value={total.total} icon="Layers" />
          <Stat label="Sur l'appareil" value={`${total.stored}/${total.total}`} icon="CheckCircle2" tone="jade" />
          <Stat label="Poids total" value={formatBytes(TOTAL_HY_BYTES)} icon="Download" tone="sapphire" />
          <Stat
            label="Espace libre"
            value={quota ? formatBytes(quota.free) : '—'}
            icon="HardDrive"
            tone="slate"
            hint={quota ? `sur ${formatBytes(quota.quota)}` : native ? 'géré par Android' : undefined}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="gold" icon="Download" disabled={busy} onClick={() => runBatch(HY_MEDIA_LIST, 'Le module hypnose')}>
            {busy ? 'Téléchargement…' : 'Tout télécharger'}
          </Button>
          {busy && (
            <Button
              variant="danger"
              icon="Ban"
              onClick={() => {
                stopRef.current = true
                setStopping(true)
              }}
            >
              Arrêter
            </Button>
          )}
          {total.stored > 0 && !busy && (
            <Button variant="ghost" icon="Trash2" onClick={() => removeAll(HY_MEDIA_LIST)}>
              Libérer l'espace
            </Button>
          )}
          <StatusChip status={total} />
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
              pour activer le téléchargement.
            </p>
          </div>
        )}
      </Panel>

      {GROUPS.map((group) => {
        const status = bundleStatus(
          group.list.map((m) => m.id),
          downloads,
          Object.fromEntries(group.list.map((m) => [m.id, m])),
        )
        const meta = HY_KIND_META[group.id]
        return (
          <Panel key={group.id}>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border" style={{ borderColor: `${meta.color}55`, color: meta.color, background: `${meta.color}14` }}>
                <Icon name={group.icon} size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="display truncate text-[15px] text-gold-100">{group.label}</p>
                <p className="text-[10.5px] text-ash">
                  {status.stored}/{status.total} · {formatBytes(status.bytes)}
                </p>
              </div>
              <StatusChip status={status} />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="ghost" icon="Download" disabled={busy || status.state === 'ready'} onClick={() => runBatch(group.list, group.label)}>
                Télécharger
              </Button>
              {status.stored > 0 && (
                <Button size="sm" variant="ghost" icon="Trash2" disabled={busy} onClick={() => removeAll(group.list)}>
                  Retirer
                </Button>
              )}
            </div>

            <div className="mt-3 space-y-1.5 border-t border-gold-500/12 pt-3">
              {group.list.map((m) => {
                const stored = Boolean(downloads[m.id])
                const pct = progressMap[m.id]
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <Icon name={HY_KIND_META[m.kind]?.icon || 'FileText'} size={13} className="shrink-0" style={{ color: HY_KIND_META[m.kind]?.color }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] text-ivory/88">{m.title}</p>
                      {typeof pct === 'number' && <ProgressBar value={pct} tone="#4a7fd4" height={3} className="mt-1" />}
                    </div>
                    <span className="shrink-0 font-mono text-[10.5px] text-ash">{formatBytes(downloads[m.id]?.bytes || m.bytes)}</span>
                    {stored ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          await removeMedia(m)
                          hyUnmarkDownload(m.id)
                          refresh()
                        }}
                        className={cx('shrink-0 rounded-lg p-1 transition', busy ? 'text-ash/40' : 'text-emerald-300 hover:text-rose-300')}
                        title="Retirer de l'appareil"
                      >
                        <Icon name={busy ? 'Download' : 'CheckCircle2'} size={14} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => runBatch([m], m.title)}
                        className={cx('shrink-0 rounded-lg p-1 transition', busy ? 'text-ash/40' : 'text-ash hover:text-gold-200')}
                        title="Télécharger"
                      >
                        <Icon name="Download" size={14} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </Panel>
        )
      })}

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

export default HypnosisOffline
