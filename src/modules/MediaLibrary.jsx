import { useEffect, useMemo, useState } from 'react'
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
  Tabs,
} from '../components/ui/Primitives'
import { useApp } from '../context/AppContext'
import { RESOURCES, RESOURCE_CATEGORIES, RESOURCE_TYPES } from '../data/resources'
import {
  cacheAvailable,
  cacheMedia,
  clearMediaCache,
  estimateStorage,
  listCachedUrls,
  removeCachedMedia,
  resolveMediaUrl,
} from '../lib/storage'
import { cx, formatBytes } from '../lib/utils'

const CUSTOM_KEY = 'method.customResources'

export const MediaLibrary = () => {
  const { state, markMedia, unmarkMedia } = useApp()
  const [category, setCategory] = useState('all')
  const [busyId, setBusyId] = useState(null)
  const [progress, setProgress] = useState({})
  const [viewer, setViewer] = useState(null)
  const [storage, setStorage] = useState(null)
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  const [toast, setToast] = useState('')
  const [custom, setCustom] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', url: '', type: 'video', category: 'mind' })
  const [cachedUrls, setCachedUrls] = useState([])

  const all = useMemo(() => [...RESOURCES, ...custom], [custom])

  /* ------------------ Cycle de vie ------------------ */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_KEY)
      if (raw) setCustom(JSON.parse(raw))
    } catch {
      /* ignore */
    }
    estimateStorage().then(setStorage)
    listCachedUrls().then(setCachedUrls)
  }, [])

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

  const persistCustom = (list) => {
    setCustom(list)
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(list))
    } catch {
      /* ignore */
    }
  }

  const filtered = category === 'all' ? all : all.filter((r) => r.category === category)
  const downloadedCount = Object.keys(state.media || {}).length

  /* ------------------ Téléchargement ------------------ */
  const download = async (res) => {
    if (busyId) return
    setBusyId(res.id)
    setProgress((p) => ({ ...p, [res.id]: 0 }))
    try {
      const { size } = await cacheMedia(res.url, (pct) => setProgress((p) => ({ ...p, [res.id]: pct })))
      markMedia(res.id, { url: res.url, size, downloadedAt: new Date().toISOString() })
      setToast(`« ${res.title} » disponible hors-ligne.`)
      estimateStorage().then(setStorage)
      listCachedUrls().then(setCachedUrls)
    } catch (err) {
      setToast(err?.message || 'Téléchargement impossible.')
    } finally {
      setBusyId(null)
      setTimeout(() => setProgress((p) => ({ ...p, [res.id]: undefined })), 900)
      setTimeout(() => setToast(''), 2600)
    }
  }

  const remove = async (res) => {
    await removeCachedMedia(res.url)
    unmarkMedia(res.id)
    setToast('Ressource retirée du stockage hors-ligne.')
    estimateStorage().then(setStorage)
    listCachedUrls().then(setCachedUrls)
    setTimeout(() => setToast(''), 2400)
  }

  const downloadAll = async () => {
    for (const r of filtered) {
      if (!state.media?.[r.id]) {
        // eslint-disable-next-line no-await-in-loop
        await download(r)
      }
    }
  }

  const openViewer = async (res) => {
    setViewer({ res, resolved: res.url, text: null, loading: true })
    const resolved = await resolveMediaUrl(res.url)
    let text = null
    if (res.type === 'text') {
      try {
        const res2 = await fetch(res.url)
        text = await res2.text()
      } catch {
        text = 'Contenu indisponible hors-ligne. Télécharge d\'abord la ressource.'
      }
    }
    setViewer({ res, resolved, text, loading: false })
  }

  const addCustom = () => {
    if (!form.title.trim() || !form.url.trim()) return
    const item = {
      id: `custom_${Date.now().toString(36)}`,
      title: form.title.trim(),
      subtitle: 'Ressource personnelle',
      category: form.category,
      type: form.type,
      url: form.url.trim(),
      duration: 'Perso',
      description: 'Ressource ajoutée manuellement. Téléchargeable pour consultation hors-ligne.',
      tags: ['perso'],
      custom: true,
    }
    persistCustom([...custom, item])
    setShowAdd(false)
    setForm({ title: '', url: '', type: 'video', category: 'mind' })
    setToast('Ressource ajoutée.')
    setTimeout(() => setToast(''), 2200)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* ---------------- En-tête ---------------- */}
      <Panel glow>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionTitle
            eyebrow="Bibliothèque hors-ligne"
            title="Télécharge, révise partout"
            subtitle="Comme avec Busuu : les ressources sont stockées dans la mémoire de l'appareil et consultables sans connexion."
            icon="Library"
          />
          <div className="flex flex-wrap gap-2">
            <Chip tone={online ? 'jade' : 'blood'} icon={online ? 'Wifi' : 'WifiOff'}>
              {online ? 'En ligne' : 'Hors-ligne'}
            </Chip>
            <Button size="sm" variant="gold" icon="Download" onClick={downloadAll}>
              Tout télécharger
            </Button>
            <Button size="sm" variant="ghost" icon="Plus" onClick={() => setShowAdd(true)}>
              Ajouter
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Ressources" value={all.length} icon="Library" />
          <Stat label="Hors-ligne" value={downloadedCount} icon="HardDrive" tone="jade" />
          <Stat
            label="Espace utilisé"
            value={storage ? formatBytes(storage.usage) : '—'}
            icon="BarChart3"
            tone="sapphire"
          />
          <Stat
            label="Espace disponible"
            value={storage ? formatBytes(Math.max(0, storage.quota - storage.usage)) : '—'}
            icon="HardDrive"
            tone="slate"
          />
        </div>

        {!cacheAvailable() && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/35 bg-amber-500/10 p-3">
            <Icon name="AlertTriangle" size={15} className="mt-0.5 shrink-0 text-amber-300" />
            <p className="text-[12px] leading-relaxed text-amber-100">
              Le stockage hors-ligne n'est pas disponible dans ce contexte. Ouvre l'application depuis l'APK ou en
              HTTPS pour activer le téléchargement.
            </p>
          </div>
        )}

        {downloadedCount > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              variant="danger"
              icon="Trash2"
              onClick={async () => {
                await clearMediaCache()
                setCachedUrls([])
                Object.keys(state.media || {}).forEach(unmarkMedia)
                estimateStorage().then(setStorage)
                setToast('Stockage hors-ligne vidé.')
                setTimeout(() => setToast(''), 2200)
              }}
            >
              Vider le stockage hors-ligne
            </Button>
            <span className="text-[11px] text-ash">{cachedUrls.length} fichiers en cache</span>
          </div>
        )}
      </Panel>

      <Tabs
        value={category}
        onChange={setCategory}
        tabs={[{ id: 'all', label: 'Tout', icon: 'Layers' }, ...RESOURCE_CATEGORIES.filter((c) => c.id !== 'all')]}
      />

      {/* ---------------- Grille ---------------- */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((res) => {
          const meta = RESOURCE_TYPES[res.type] || RESOURCE_TYPES.image
          const isDownloaded = Boolean(state.media?.[res.id])
          const pct = progress[res.id]
          const isBusy = busyId === res.id
          return (
            <Panel key={res.id} className={cx('flex flex-col', isDownloaded && 'border-emerald-500/30')}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="rounded-xl border p-2"
                    style={{ borderColor: `${meta.color}44`, background: `${meta.color}14` }}
                  >
                    <Icon name={meta.icon} size={17} style={{ color: meta.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="eyebrow text-[9px]">{meta.label}</p>
                    <h3 className="display text-[14.5px] leading-tight text-gold-100">{res.title}</h3>
                  </div>
                </div>
                {isDownloaded && <Icon name="CheckCircle2" size={16} className="shrink-0 text-emerald-400" />}
              </div>

              <p className="mt-1.5 text-[11.5px] text-ash">{res.subtitle}</p>
              <p className="mt-2 line-clamp-3 flex-1 text-[12px] leading-relaxed text-ash/90">{res.description}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <Chip tone="slate" icon="Clock">{res.duration}</Chip>
                {res.tags?.slice(0, 2).map((t) => (
                  <Chip key={t} tone="gold">{t}</Chip>
                ))}
              </div>

              {typeof pct === 'number' && (
                <div className="mt-3">
                  <ProgressBar value={pct} tone="#4a7fd4" />
                  <p className="mt-1 text-center text-[10.5px] text-sky-200">Téléchargement… {pct}%</p>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2 border-t border-gold-500/10 pt-3">
                <Button size="sm" variant="ghost" icon="Play" onClick={() => openViewer(res)}>
                  Ouvrir
                </Button>
                {isDownloaded ? (
                  <Button size="sm" variant="danger" icon="Trash2" onClick={() => remove(res)}>
                    Retirer
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="gold"
                    icon="Download"
                    onClick={() => download(res)}
                    disabled={isBusy}
                  >
                    {isBusy ? '…' : 'Hors-ligne'}
                  </Button>
                )}
              </div>
            </Panel>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <EmptyState icon="Library" title="Aucune ressource" text="Change de catégorie ou ajoute ta propre ressource." />
      )}

      {/* ---------------- Viewer ---------------- */}
      <Modal
        open={Boolean(viewer)}
        onClose={() => setViewer(null)}
        title={viewer?.res.title}
        subtitle={viewer?.res.subtitle}
        wide
        footer={
          viewer ? (
            <>
              {!state.media?.[viewer.res.id] ? (
                <Button variant="gold" icon="Download" onClick={() => download(viewer.res)}>
                  Télécharger hors-ligne
                </Button>
              ) : (
                <Chip tone="jade" icon="CheckCircle2">Disponible hors-ligne</Chip>
              )}
              <Button variant="ghost" icon="ExternalLink" onClick={() => window.open(viewer.res.url, '_blank')}>
                Ouvrir à part
              </Button>
            </>
          ) : null
        }
      >
        {viewer && (
          <div className="space-y-3">
            {viewer.loading ? (
              <p className="py-10 text-center text-[12.5px] text-ash">Chargement…</p>
            ) : (
              <>
                {viewer.res.type === 'image' && (
                  <img
                    src={viewer.resolved}
                    alt={viewer.res.title}
                    className="w-full rounded-2xl border border-gold-500/15 bg-void/50"
                  />
                )}
                {viewer.res.type === 'audio' && (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/6 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Icon name="Headphones" size={18} className="text-emerald-300" />
                      <p className="text-[12.5px] text-emerald-100">
                        Piste audio — {state.media?.[viewer.res.id] ? 'lecture hors-ligne' : 'lecture en ligne'}
                      </p>
                    </div>
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <audio controls src={viewer.resolved} className="w-full" />
                  </div>
                )}
                {viewer.res.type === 'video' && (
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/6 p-3">
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video controls src={viewer.resolved} className="w-full rounded-xl" />
                  </div>
                )}
                {viewer.res.type === 'text' && (
                  <pre className="max-h-[60vh] overflow-auto rounded-2xl border border-gold-500/15 bg-void/50 p-4 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-ivory/88">
                    {viewer.text}
                  </pre>
                )}
                <p className="text-[12px] leading-relaxed text-ash">{viewer.res.description}</p>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* ---------------- Ajout personnalisé ---------------- */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Ajouter une ressource"
        subtitle="Colle l'URL d'une vidéo, d'un audio, d'une image ou d'un texte. Elle sera téléchargeable hors-ligne."
        footer={
          <>
            <Button variant="gold" icon="Plus" onClick={addCustom} disabled={!form.title.trim() || !form.url.trim()}>
              Ajouter
            </Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Annuler</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Labeled label="Titre">
            <input className="field" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ex. Discours de Steve Jobs — Stanford" />
          </Labeled>
          <Labeled label="URL du fichier" hint="Lien direct (.mp4, .mp3, .jpg, .txt…). Un lien YouTube ne fonctionne pas pour le hors-ligne.">
            <input className="field" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://…" />
          </Labeled>
          <Labeled label="Type">
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(RESOURCE_TYPES).map(([k, v]) => (
                <button key={k} onClick={() => setForm((f) => ({ ...f, type: k }))} className={cx('chip transition', form.type === k && 'border-gold-500/50 bg-gold-500/15')}>
                  <Icon name={v.icon} size={11} /> {v.label}
                </button>
              ))}
            </div>
          </Labeled>
          <Labeled label="Catégorie">
            <div className="flex flex-wrap gap-1.5">
              {RESOURCE_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                <button key={c.id} onClick={() => setForm((f) => ({ ...f, category: c.id }))} className={cx('chip transition', form.category === c.id && 'border-gold-500/50 bg-gold-500/15')}>
                  <Icon name={c.icon} size={11} /> {c.label}
                </button>
              ))}
            </div>
          </Labeled>
        </div>
      </Modal>

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

export default MediaLibrary
