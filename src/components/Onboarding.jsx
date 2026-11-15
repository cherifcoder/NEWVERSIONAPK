import { useState } from 'react'
import Logo from './Logo'
import { PinDots, PinKeypad } from './PinKeypad'
import Icon from './ui/Icon'
import { Button, Labeled } from './ui/Primitives'
import { useApp } from '../context/AppContext'
import { cx } from '../lib/utils'

const STEPS = ['accueil', 'identite', 'code', 'confirmation', 'pret']

export const Onboarding = () => {
  const { setPin, completeOnboarding, updateProfile, state } = useApp()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [codename, setCodename] = useState('Le Futur Toi')
  const [vision, setVision] = useState(state.profile.vision)
  const [pin, setPinValue] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pinLength, setPinLength] = useState(4)
  const [error, setError] = useState('')

  const stage = STEPS[step]

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1))
  const back = () => setStep((s) => Math.max(0, s - 1))

  const finishIdentity = () => {
    updateProfile({ name: name.trim(), codename: codename.trim() || 'Le Futur Toi', vision })
    next()
  }

  const handlePinDigit = (which) => (d) => {
    if (which === 'pin' && pin.length < pinLength) setPinValue((p) => p + d)
    if (which === 'confirm' && confirm.length < pinLength) setConfirm((p) => p + d)
  }

  const validatePin = () => {
    if (pin.length < 4) {
      setError('Le code doit contenir au moins 4 chiffres.')
      return
    }
    setError('')
    next()
  }

  const validateConfirm = async () => {
    if (confirm !== pin) {
      setError('Les deux codes ne correspondent pas.')
      setConfirm('')
      return
    }
    setError('')
    await setPin(pin)
    next()
  }

  return (
    <div className="app-bg safe-top safe-bottom flex min-h-full flex-col px-6 py-8">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {/* Progression */}
        <div className="mb-6 flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={cx(
                'h-1 flex-1 rounded-full transition-all duration-500',
                i <= step ? 'bg-gold-400' : 'bg-white/8',
              )}
            />
          ))}
        </div>

        {stage === 'accueil' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center anim-fade-up">
            <Logo size={104} />
            <h1 className="display text-4xl tracking-[0.14em] text-gold-100">METHOD</h1>
            <p className="display text-lg text-gold-200/90 italic">Incarme ton Futur Toi</p>
            <div className="gold-rule w-24" />
            <p className="max-w-sm text-[13.5px] leading-relaxed text-ash">
              Ce n'est pas une application de suivi d'habitudes. C'est un{' '}
              <span className="text-gold-200">système d'incarnation</span> : tu joues le rôle de ta version
              définitive jusqu'à ce qu'il devienne ta biologie. Zéro abandon. Exécution chirurgicale.
            </p>
            <div className="mt-2 grid w-full grid-cols-3 gap-2">
              {[
                { icon: 'Theater', label: 'Method Acting' },
                { icon: 'Brain', label: 'Neurosciences' },
                { icon: 'Crown', label: 'Stratégie' },
              ].map((f) => (
                <div key={f.label} className="panel-flat flex flex-col items-center gap-1.5 p-3">
                  <Icon name={f.icon} size={18} className="text-gold-300" />
                  <span className="text-[10.5px] font-semibold tracking-wide text-ash">{f.label}</span>
                </div>
              ))}
            </div>
            <Button variant="gold" size="lg" full iconRight="ArrowRight" onClick={next} className="mt-4">
              Commencer l'incarnation
            </Button>
            <p className="flex items-center gap-1.5 text-[10.5px] text-ash/60">
              <Icon name="HardDrive" size={12} /> Données stockées uniquement sur ton appareil
            </p>
          </div>
        )}

        {stage === 'identite' && (
          <div className="flex flex-1 flex-col gap-5 anim-fade-up">
            <div>
              <p className="eyebrow">Étape 1 — Distribution</p>
              <h2 className="display mt-1 text-2xl text-gold-100">Qui joues-tu ?</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ash">
                Un acteur connaît son rôle avant la première scène. Donne un nom au personnage que tu vas
                incarner chaque jour.
              </p>
            </div>

            <Labeled label="Ton prénom (l'acteur)">
              <input
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Cherif"
                autoComplete="off"
              />
            </Labeled>

            <Labeled label="Nom de code du personnage" hint="Ce que tu deviens, pas ce que tu es.">
              <input
                className="field"
                value={codename}
                onChange={(e) => setCodename(e.target.value)}
                placeholder="Le Futur Toi"
                autoComplete="off"
              />
            </Labeled>

            <Labeled label="Ta vision en une phrase" hint="Écris-la au présent, comme si c'était déjà vrai.">
              <textarea
                className="field min-h-28 resize-y leading-relaxed"
                value={vision}
                onChange={(e) => setVision(e.target.value)}
              />
            </Labeled>

            <div className="mt-auto flex gap-2">
              <Button variant="ghost" icon="ChevronLeft" onClick={back}>
                Retour
              </Button>
              <Button variant="gold" full iconRight="ArrowRight" onClick={finishIdentity}>
                Continuer
              </Button>
            </div>
          </div>
        )}

        {(stage === 'code' || stage === 'confirmation') && (
          <div className="flex flex-1 flex-col items-center gap-4 anim-fade-up">
            <div className="text-center">
              <p className="eyebrow">{stage === 'code' ? 'Étape 2 — Le sceau' : 'Étape 3 — Vérification'}</p>
              <h2 className="display mt-1 text-2xl text-gold-100">
                {stage === 'code' ? 'Définis ton code' : 'Confirme ton code'}
              </h2>
              <p className="mx-auto mt-1.5 max-w-xs text-[12.5px] leading-relaxed text-ash">
                {stage === 'code'
                  ? "Ce code protège ton système. Le clavier est mélangé à chaque frappe : personne ne peut le lire par-dessus ton épaule."
                  : 'Saisis-le une seconde fois pour verrouiller le sceau.'}
              </p>
            </div>

            {stage === 'code' && (
              <div className="flex gap-1.5">
                {[4, 5, 6].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setPinLength(n)
                      setPinValue('')
                    }}
                    className={cx(
                      'rounded-full border px-3 py-1 text-[11.5px] font-semibold transition',
                      pinLength === n
                        ? 'border-gold-500/50 bg-gold-500/15 text-gold-100'
                        : 'border-white/10 text-ash',
                    )}
                  >
                    {n} chiffres
                  </button>
                ))}
              </div>
            )}

            <div className="my-1">
              <PinDots
                length={pinLength}
                filled={stage === 'code' ? pin.length : confirm.length}
                error={Boolean(error)}
              />
            </div>

            <div className="h-5 text-center">
              {error && <p className="text-[11.5px] font-medium text-rose-300">{error}</p>}
            </div>

            <PinKeypad
              length={pinLength}
              value={stage === 'code' ? pin : confirm}
              onDigit={handlePinDigit(stage === 'code' ? 'pin' : 'confirm')}
              onDelete={() =>
                stage === 'code' ? setPinValue((p) => p.slice(0, -1)) : setConfirm((p) => p.slice(0, -1))
              }
            />

            <div className="mt-auto flex w-full gap-2 pt-4">
              <Button
                variant="ghost"
                icon="ChevronLeft"
                onClick={() => {
                  setError('')
                  if (stage === 'confirmation') {
                    setConfirm('')
                    back()
                  } else back()
                }}
              >
                Retour
              </Button>
              <Button
                variant="gold"
                full
                iconRight="ArrowRight"
                disabled={stage === 'code' ? pin.length < pinLength : confirm.length < pinLength}
                onClick={stage === 'code' ? validatePin : validateConfirm}
              >
                {stage === 'code' ? 'Valider' : 'Sceller'}
              </Button>
            </div>
          </div>
        )}

        {stage === 'pret' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center anim-fade-up">
            <div className="rounded-full border border-gold-500/30 bg-gold-500/10 p-5">
              <Icon name="BadgeCheck" size={44} className="text-gold-300" />
            </div>
            <h2 className="display text-2xl text-gold-100">Le rôle est attribué</h2>
            <p className="max-w-sm text-[13.5px] leading-relaxed text-ash">
              À partir de maintenant, chaque journée est une scène. Tu entres, tu joues, tu livres. Ce qui est
              commencé est terminé.
            </p>
            <div className="panel w-full max-w-sm p-4 text-left">
              <p className="eyebrow mb-2">Ta règle d'or</p>
              <p className="display text-[15px] leading-relaxed text-gold-200 italic">
                « Tout ce qui est commencé est mené jusqu'au bout, avec une exécution chirurgicale. Zéro
                abandon. »
              </p>
            </div>
            <Button
              variant="gold"
              size="lg"
              full
              icon="Theater"
              onClick={() => completeOnboarding({})}
              className="max-w-sm"
            >
              Entrer sur scène
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Onboarding
