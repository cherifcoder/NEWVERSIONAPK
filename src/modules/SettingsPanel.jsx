import { useEffect, useRef, useState } from 'react'
import Logo from '../components/Logo'
import Icon from '../components/ui/Icon'
import { PinDots, PinKeypad } from '../components/PinKeypad'
import {
  Button,
  Chip,
  Labeled,
  Modal,
  Panel,
  SectionTitle,
  Stat,
} from '../components/ui/Primitives'
import { useApp } from '../context/AppContext'
import { PROVIDERS } from '../lib/aiAgent'
import { verifyPin } from '../lib/crypto'
import { estimateStorage, readJsonFile } from '../lib/storage'
import { formatBytes, formatLongDate } from '../lib/utils'

export const SettingsPanel = () => {
  const {
    state,
    updateProfile,
    updateSettings,
    updateSecurity,
    disablePin,
    setPin,
    exportData,
    importData,
    resetAll,
    lock,
  } = useApp()

  const [profile, setProfile] = useState(state.profile)
  const [storage, setStorage] = useState(null)
  const [toast, setToast] = useState('')
  const [toastTone, setToastTone] = useState('gold')
  const [pinModal, setPinModal] = useState(null) // 'change' | 'disable' | 'create'
  const [step, setStep] = useState('current')
  const [pin1, setPin1] = useState('')
  const [pin2, setPin2] = useState('')
  const [currentPin, setCurrentPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    estimateStorage().then(setStorage)
  }, [])

  useEffect(() => {
    setProfile(state.profile)
  }, [state.profile])

  const notify = (msg, tone = 'gold') => {
    setToast(msg)
    setToastTone(tone)
    setTimeout(() => setToast(''), 2600)
  }

  const saveProfile = () => {
    updateProfile(profile)
    notify('Profil mis à jour.')
  }

  /* ---------------- PIN ---------------- */
  const length = state.security.pinLength || 4

  const resetPinFlow = () => {
    setStep(state.security.pinEnabled ? 'current' : 'new')
    setPin1('')
    setPin2('')
    setCurrentPin('')
    setPinError('')
  }

  const openPinModal = (mode) => {
    setPinModal(mode)
    resetPinFlow()
  }

  const submitPinFlow = async () => {
    setPinError('')
    setBusy(true)
    try {
      if (pinModal === 'disable') {
        const ok = await disablePin(currentPin)
        if (!ok) {
          setPinError('Code incorrect.')
          setCurrentPin('')
          return
        }
        setPinModal(null)
        notify('Code PIN désactivé.', 'blood')
        return
      }

      if (step === 'current') {
        const ok = await verifyPin(currentPin, {
          salt: state.security.pinSalt,
          hash: state.security.pinHash,
        })
        if (!ok) {
          setPinError('Code actuel incorrect.')
          setCurrentPin('')
          return
        }
        setStep('new')
        return
      }

      if (step === 'new') {
        if (pin1.length < 4) {
          setPinError('Le code doit contenir au moins 4 chiffres.')
          return
        }
        setStep('confirm')
        return
      }

      if (step === 'confirm') {
        if (pin1 !== pin2) {
          setPinError('Les deux codes ne correspondent pas.')
          setPin2('')
          return
        }
        await setPin(pin1)
        setPinModal(null)
        notify('Code PIN enregistré.')
      }
    } finally {
      setBusy(false)
    }
  }

  /* ---------------- Import / Export ---------------- */
  const handleImport = async (file) => {
    if (!file) return
    try {
      const raw = await readJsonFile(file)
      importData(raw)
      notify('Données restaurées avec succès.', 'jade')
    } catch (err) {
      notify(`Import impossible : ${err.message}`, 'blood')
    }
  }

  const aiKeySet = Boolean(state.settings.aiApiKey)

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {/* ---------------- Identité ---------------- */}
      <Panel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Logo size={64} />
          <div className="min-w-0 flex-1">
            <SectionTitle
              eyebrow="Profil de l'acteur"
              title={profile.codename || 'Le Futur Toi'}
              subtitle={`Distribution ouverte le ${new Date(`${state.profile.startDate}T00:00:00`).toLocaleDateString('fr-FR')}`}
              icon="Theater"
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Chip tone={state.security.pinEnabled ? 'jade' : 'blood'} icon={state.security.pinEnabled ? 'Lock' : 'Unlock'}>
                PIN {state.security.pinEnabled ? `activé (${state.security.pinLength} chiffres)` : 'désactivé'}
              </Chip>
              <Chip tone={aiKeySet ? 'jade' : 'slate'} icon="Zap">
                IA {aiKeySet ? 'connectée' : 'moteur local'}
              </Chip>
              <Chip tone="gold" icon="HardDrive">{state.journal?.length || 0} rapports</Chip>
            </div>
          </div>
          <Button variant="ghost" icon="Lock" onClick={lock} disabled={!state.security.pinEnabled}>
            Verrouiller
          </Button>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ---------------- Profil ---------------- */}
        <Panel>
          <SectionTitle eyebrow="Identité" title="Ton personnage" icon="Star" />
          <div className="mt-4 space-y-3">
            <Labeled label="Prénom de l'acteur">
              <input className="field" value={profile.name || ''} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
            </Labeled>
            <Labeled label="Nom de code du personnage">
              <input className="field" value={profile.codename || ''} onChange={(e) => setProfile((p) => ({ ...p, codename: e.target.value }))} />
            </Labeled>
            <Labeled label="Vision" hint="Écrite au présent, comme si c'était déjà vrai.">
              <textarea className="field min-h-24 resize-y leading-relaxed" value={profile.vision || ''} onChange={(e) => setProfile((p) => ({ ...p, vision: e.target.value }))} />
            </Labeled>
            <Button variant="gold" icon="Save" onClick={saveProfile}>Enregistrer le profil</Button>
          </div>
        </Panel>

        {/* ---------------- Sécurité ---------------- */}
        <Panel>
          <SectionTitle
            eyebrow="Sécurité"
            title="Code PIN & verrouillage"
            subtitle="Le code est haché (SHA-256 salé, 12 000 itérations) et reste uniquement sur l'appareil."
            icon="ShieldCheck"
          />
          <div className="mt-4 space-y-2">
            <div className="panel-flat flex items-center justify-between gap-3 p-3">
              <div>
                <p className="text-[12.5px] font-semibold text-gold-100">Verrouillage automatique</p>
                <p className="text-[11px] text-ash">Se reverrouille après inactivité</p>
              </div>
              <select
                className="field !w-auto !py-1.5 !text-[12px]"
                value={state.security.autoLockMinutes}
                onChange={(e) =>
                  updateSecurity({ autoLockMinutes: Number(e.target.value) })
                }
              >
                {[1, 5, 10, 30].map((m) => (
                  <option key={m} value={m}>{m} min</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              {state.security.pinEnabled ? (
                <>
                  <Button variant="ghost" icon="KeyRound" onClick={() => openPinModal('change')}>
                    Changer le code
                  </Button>
                  <Button variant="danger" icon="Unlock" onClick={() => openPinModal('disable')}>
                    Désactiver
                  </Button>
                </>
              ) : (
                <Button variant="gold" icon="Lock" onClick={() => openPinModal('create')}>
                  Définir un code PIN
                </Button>
              )}
            </div>

            <div className="rounded-xl border border-gold-500/12 bg-white/2 p-3">
              <p className="flex items-center gap-2 text-[11.5px] text-ash">
                <Icon name="Info" size={13} className="text-gold-400" />
                Le pavé numérique est mélangé aléatoirement à chaque frappe : impossible à lire par-dessus ton épaule.
              </p>
            </div>
          </div>
        </Panel>

        {/* ---------------- Agent IA ---------------- */}
        <Panel className="lg:col-span-2">
          <SectionTitle
            eyebrow="Le Metteur en Scène"
            title="Moteur d'analyse IA"
            subtitle="Par défaut : moteur local hors-ligne (gratuit, instantané). Optionnel : connecte une API LLM gratuite pour des verdicts encore plus affûtés."
            icon="Sparkles"
            right={<Chip tone={aiKeySet ? 'jade' : 'slate'} icon={aiKeySet ? 'Zap' : 'WifiOff'}>{aiKeySet ? 'Connectée' : 'Locale'}</Chip>}
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Labeled label="Fournisseur">
              <select
                className="field"
                value={state.settings.aiProvider}
                onChange={(e) => updateSettings({ aiProvider: e.target.value, aiModel: '' })}
              >
                {Object.entries(PROVIDERS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </Labeled>
            <Labeled label="Modèle" hint={PROVIDERS[state.settings.aiProvider]?.model ? `Par défaut : ${PROVIDERS[state.settings.aiProvider].model}` : 'Renseigne le nom du modèle'}>
              <input
                className="field"
                value={state.settings.aiModel}
                onChange={(e) => updateSettings({ aiModel: e.target.value })}
                placeholder={PROVIDERS[state.settings.aiProvider]?.model || 'nom-du-modele'}
              />
            </Labeled>
            <Labeled label="Clé API" hint="Stockée localement, jamais transmise ailleurs qu'au fournisseur choisi.">
              <input
                className="field font-mono !text-[12px]"
                type="password"
                value={state.settings.aiApiKey}
                onChange={(e) => updateSettings({ aiApiKey: e.target.value })}
                placeholder="gsk_… / AIza…"
                autoComplete="off"
              />
            </Labeled>
            {state.settings.aiProvider === 'custom' && (
              <Labeled label="Endpoint personnalisé">
                <input
                  className="field font-mono !text-[12px]"
                  value={state.settings.aiEndpoint}
                  onChange={(e) => updateSettings({ aiEndpoint: e.target.value })}
                  placeholder="https://…/v1/chat/completions"
                />
              </Labeled>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              variant={state.settings.aiEnabled ? 'gold' : 'ghost'}
              icon={state.settings.aiEnabled ? 'Zap' : 'Ban'}
              onClick={() => updateSettings({ aiEnabled: !state.settings.aiEnabled })}
            >
              {state.settings.aiEnabled ? 'IA prioritaire activée' : 'IA prioritaire désactivée'}
            </Button>
            {PROVIDERS[state.settings.aiProvider]?.docs && (
              <Button variant="ghost" icon="ExternalLink" onClick={() => window.open(PROVIDERS[state.settings.aiProvider].docs, '_blank')}>
                Obtenir une clé gratuite
              </Button>
            )}
          </div>

          <p className="mt-3 text-[11.5px] leading-relaxed text-ash">
            Si la clé est absente ou si l'appel échoue (hors-ligne, quota), l'application bascule automatiquement
            sur le moteur local : le verdict est toujours rendu.
          </p>
        </Panel>

        {/* ---------------- Sauvegarde ---------------- */}
        <Panel className="lg:col-span-2 border-gold-500/25">
          <SectionTitle
            eyebrow="Données locales"
            title="Sauvegarde, restauration, réinitialisation"
            subtitle="Toutes tes données vivent dans la mémoire de l'appareil. Exporte régulièrement pour ne rien perdre."
            icon="HardDrive"
          />
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Espace utilisé" value={storage ? formatBytes(storage.usage) : '—'} icon="BarChart3" />
            <Stat label="Quota" value={storage ? formatBytes(storage.quota) : '—'} icon="HardDrive" tone="sapphire" />
            <Stat label="Débrieferings" value={state.journal?.length || 0} icon="NotebookPen" tone="jade" />
            <Stat label="Projets livrés" value={state.finishedProjects?.length || 0} icon="BadgeCheck" tone="gold" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="gold" icon="Download" onClick={() => { exportData(); notify('Sauvegarde exportée.') }}>
              Exporter mes données (.json)
            </Button>
            <Button variant="ghost" icon="Upload" onClick={() => fileRef.current?.click()}>
              Importer une sauvegarde
            </Button>
            <Button variant="danger" icon="Trash2" onClick={() => setConfirmReset(true)}>
              Tout réinitialiser
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                handleImport(e.target.files?.[0])
                e.target.value = ''
              }}
            />
          </div>

          <div className="mt-3 rounded-xl border border-gold-500/12 bg-white/2 p-3">
            <p className="text-[11.5px] leading-relaxed text-ash">
              Le fichier exporté contient l'intégralité de ton système : profil, piliers, projets, journal,
              réglages et code PIN (haché). Conserve-le hors de l'appareil. À l'import, tu peux reprendre ta
              progression sur n'importe quel téléphone.
            </p>
          </div>
        </Panel>

        {/* ---------------- À propos ---------------- */}
        <Panel className="lg:col-span-2">
          <SectionTitle eyebrow="À propos" title="METHOD — Incarne ton Futur Toi" icon="Theater" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="panel-flat p-3.5">
              <p className="text-[12.5px] font-semibold text-gold-100">Le concept</p>
              <p className="mt-1 text-[12px] leading-relaxed text-ash">
                Method Acting + neurosciences de Joe Dispenza + stratégie des plus grands livres de développement
                personnel. On ne suit pas des habitudes : on incarne une nouvelle identité, de façon irréversible.
              </p>
            </div>
            <div className="panel-flat p-3.5">
              <p className="text-[12.5px] font-semibold text-gold-100">Règle d'or</p>
              <p className="mt-1 text-[12px] leading-relaxed text-ash">
                Tout ce qui est commencé est mené jusqu'au bout, avec une exécution chirurgicale. Zéro abandon.
              </p>
            </div>
            <div className="panel-flat p-3.5">
              <p className="text-[12.5px] font-semibold text-gold-100">Vie privée</p>
              <p className="mt-1 text-[12px] leading-relaxed text-ash">
                Aucun serveur, aucun compte, aucun traqueur. Tout est local, y compris le code PIN (haché).
              </p>
            </div>
            <div className="panel-flat p-3.5">
              <p className="text-[12.5px] font-semibold text-gold-100">Version</p>
              <p className="mt-1 text-[12px] leading-relaxed text-ash">
                METHOD v1.0 · schéma de données {state.schema} · {formatLongDate()}
              </p>
            </div>
          </div>
        </Panel>
      </div>

      {/* ---------------- Modal PIN ---------------- */}
      <Modal
        open={Boolean(pinModal)}
        onClose={() => setPinModal(null)}
        title={
          pinModal === 'disable'
            ? 'Désactiver le code PIN'
            : pinModal === 'create'
              ? 'Définir un code PIN'
              : step === 'current'
                ? 'Code actuel'
                : step === 'new'
                  ? 'Nouveau code'
                  : 'Confirmation'
        }
        subtitle="Pavé numérique mélangé aléatoirement pour brouiller toute observation."
        footer={
          <>
            <Button variant="gold" icon="Check" onClick={submitPinFlow} disabled={busy}>
              Valider
            </Button>
            <Button variant="ghost" onClick={() => setPinModal(null)}>Annuler</Button>
          </>
        }
      >
        <div className="flex flex-col items-center gap-3">
          <PinDots
            length={length}
            filled={pinModal === 'disable' || step === 'current' ? currentPin.length : step === 'confirm' ? pin2.length : pin1.length}
            error={Boolean(pinError)}
          />
          <div className="h-5 text-center">
            {pinError && <p className="text-[11.5px] font-medium text-rose-300">{pinError}</p>}
          </div>
          <PinKeypad
            length={length}
            value={pinModal === 'disable' || step === 'current' ? currentPin : step === 'confirm' ? pin2 : pin1}
            onDigit={(d) => {
              if (pinModal === 'disable' || step === 'current') {
                if (currentPin.length < length) setCurrentPin((p) => p + d)
              } else if (step === 'confirm') {
                if (pin2.length < length) setPin2((p) => p + d)
              } else if (pin1.length < length) setPin1((p) => p + d)
            }}
            onDelete={() => {
              if (pinModal === 'disable' || step === 'current') setCurrentPin((p) => p.slice(0, -1))
              else if (step === 'confirm') setPin2((p) => p.slice(0, -1))
              else setPin1((p) => p.slice(0, -1))
            }}
          />
        </div>
      </Modal>

      {/* ---------------- Confirm reset ---------------- */}
      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Réinitialiser toute l'application"
        subtitle="Cette action est définitive et efface l'intégralité de ta progression."
        footer={
          <>
            <Button
              variant="danger"
              icon="Trash2"
              onClick={() => {
                resetAll()
                setConfirmReset(false)
              }}
            >
              Effacer définitivement
            </Button>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>Annuler</Button>
          </>
        }
      >
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/35 bg-rose-500/10 p-3">
          <Icon name="AlertTriangle" size={16} className="mt-0.5 shrink-0 text-rose-300" />
          <p className="text-[12.5px] leading-relaxed text-rose-100">
            Pense à exporter ta sauvegarde avant. Tout sera perdu : piliers, projets, journal, rapports, réglages
            et code PIN.
          </p>
        </div>
      </Modal>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 lg:bottom-8">
          <div
            className={
              toastTone === 'blood'
                ? 'rounded-xl border border-rose-500/40 bg-rose-500/12 px-4 py-2.5 text-[12.5px] font-medium text-rose-100 backdrop-blur-md'
                : toastTone === 'jade'
                  ? 'rounded-xl border border-emerald-500/40 bg-emerald-500/12 px-4 py-2.5 text-[12.5px] font-medium text-emerald-100 backdrop-blur-md'
                  : 'rounded-xl border border-gold-500/40 bg-gold-500/12 px-4 py-2.5 text-[12.5px] font-medium text-gold-100 backdrop-blur-md'
            }
          >
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPanel
