import { useState } from 'react'
import Icon from '../../components/ui/Icon'
import { Button, Chip, Panel, SectionTitle } from '../../components/ui/Primitives'
import { GUARD_REQUIREMENTS } from '../../data/deepwork'
import {
  guardOpenSettings,
  guardRequestDeviceAdmin,
  guardRequestNotifications,
  guardSupported,
} from '../../lib/focusGuard'
import { cx } from '../../lib/utils'

const ACTION_LABEL = {
  accessibility: 'Activer',
  overlay: 'Autoriser',
  deviceAdmin: 'Activer',
  notifications: 'Autoriser',
  battery: 'Régler',
}

/**
 * GuardSetup — la liste de contrôle des autorisations système dont dépend le
 * verrouillage strict. Chaque ligne donne un retour visible (vert = prêt) et un
 * bouton qui ouvre le bon écran de réglages Android.
 */
export const GuardSetup = ({ perms, onRefresh, compact = false }) => {
  const [busy, setBusy] = useState('')
  const supported = guardSupported()

  const ready = (id) => Boolean(perms?.[id])

  const run = async (id) => {
    setBusy(id)
    try {
      if (id === 'deviceAdmin') await guardRequestDeviceAdmin()
      else if (id === 'notifications') await guardRequestNotifications()
      else await guardOpenSettings(id)
    } finally {
      setBusy('')
      // Les réglages système sont des activités séparées : on re-vérifie un
      // peu plus tard, quand l'utilisateur revient dans METHOD.
      setTimeout(() => onRefresh?.(), 700)
    }
  }

  const requiredReady = GUARD_REQUIREMENTS.filter((r) => r.required).every((r) => ready(r.id))
  const allReady = GUARD_REQUIREMENTS.every((r) => ready(r.id))

  if (!supported) {
    return (
      <Panel>
        <SectionTitle
          eyebrow="Verrouillage strict"
          title="Disponible sur l'APK Android"
          subtitle="Le blocage du téléphone s'appuie sur le service d'accessibilité Android. Dans le navigateur, seul le minuteur fonctionne."
          icon="ShieldAlert"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip tone="slate" icon="Info">
            Web : minuteur seul
          </Chip>
          <Chip tone="slate" icon="HardDrive">
            APK : verrouillage complet
          </Chip>
        </div>
      </Panel>
    )
  }

  return (
    <Panel>
      <SectionTitle
        eyebrow="Verrouillage strict"
        title="Autorisations système"
        subtitle="Ces autorisations donnent à METHOD les moyens de bloquer le téléphone pendant un bloc. Elles se règlent une seule fois."
        icon="ShieldAlert"
        right={
          <Button size="sm" variant="ghost" icon="RefreshCw" onClick={() => onRefresh?.()}>
            Vérifier
          </Button>
        }
      />

      <div className="mt-4 space-y-2">
        {GUARD_REQUIREMENTS.map((req) => {
          const ok = ready(req.id)
          return (
            <div
              key={req.id}
              className={cx(
                'flex items-start gap-3 rounded-xl border p-3 transition',
                ok ? 'border-emerald-500/25 bg-emerald-500/6' : 'border-white/8 bg-white/3',
              )}
            >
              <span
                className={cx(
                  'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border',
                  ok ? 'border-emerald-500/35 bg-emerald-500/12 text-emerald-300' : 'border-white/10 bg-white/5 text-ash',
                )}
              >
                <Icon name={ok ? 'Check' : req.icon} size={14} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cx('text-[13px] font-semibold', ok ? 'text-emerald-100' : 'text-ivory')}>{req.label}</span>
                  {req.required ? (
                    <Chip tone={ok ? 'jade' : 'blood'}>{ok ? 'Prêt' : 'Requis'}</Chip>
                  ) : (
                    <Chip tone={ok ? 'jade' : 'slate'}>{ok ? 'Prêt' : 'Recommandé'}</Chip>
                  )}
                </div>
                {!compact && <p className="mt-1 text-[11.5px] leading-relaxed text-ash">{req.why}</p>}
              </div>

              {!ok && (
                <Button
                  size="sm"
                  variant="gold"
                  className="shrink-0"
                  disabled={busy === req.id}
                  icon={busy === req.id ? 'LoaderCircle' : 'ArrowRight'}
                  onClick={() => run(req.id)}
                >
                  {ACTION_LABEL[req.id] || 'Ouvrir'}
                </Button>
              )}
            </div>
          )
        })}
      </div>

      <div
        className={cx(
          'mt-4 flex items-start gap-2.5 rounded-xl border p-3 text-[12px] leading-relaxed',
          allReady
            ? 'border-emerald-500/25 bg-emerald-500/8 text-emerald-100'
            : requiredReady
              ? 'border-gold-500/25 bg-gold-500/8 text-gold-100'
              : 'border-rose-500/25 bg-rose-500/8 text-rose-100',
        )}
      >
        <Icon name={allReady ? 'ShieldCheck' : requiredReady ? 'ShieldAlert' : 'ShieldOff'} size={15} className="mt-0.5 shrink-0" />
        <span>
          {allReady
            ? 'Verrouillage complet armé : applications bloquées, surimpression, anti-désinstallation et notification persistante.'
            : requiredReady
              ? 'Le blocage des applications est armé. Ajoute les autorisations « recommandées » pour la surimpression et l\u2019anti-désinstallation.'
              : 'Le service d\u2019accessibilité est indispensable : sans lui, METHOD ne peut pas empêcher l\u2019ouverture d\u2019autres applications.'}
        </span>
      </div>

      {!compact && (
        <div className="mt-3 rounded-xl border border-white/8 bg-white/3 p-3">
          <div className="flex items-center gap-2 text-[11.5px] font-semibold tracking-wide text-gold-200/90">
            <Icon name="Crown" size={13} />
            Mode absolu — propriétaire de l'appareil
          </div>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-ash">
            {perms?.deviceOwner
              ? 'METHOD est propriétaire de cet appareil : la désinstallation est réellement impossible pendant un bloc, et le mode kiosque s\u2019active automatiquement.'
              : 'Pour rendre la désinstallation mathématiquement impossible, METHOD doit être « propriétaire de l\u2019appareil ». Cela exige un provisionnement ADB (et souvent une réinitialisation). Tant que ce n\u2019est pas fait, la protection reste fortement dissuasive : Android refuse de désinstaller METHOD tant que l\u2019administrateur est actif, et les Paramètres sont bloqués pendant les blocs.'}
          </p>
          {perms?.deviceOwner && (
            <div className="mt-2">
              <Chip tone="jade" icon="BadgeCheck">
                Verrouillage absolu actif
              </Chip>
            </div>
          )}
        </div>
      )}
    </Panel>
  )
}

export default GuardSetup
