import { useMemo, useState } from 'react'
import Icon from '../components/ui/Icon'
import {
  Button,
  Chip,
  Panel,
  SectionTitle,
  Stat,
  Tabs,
} from '../components/ui/Primitives'
import { useApp } from '../context/AppContext'
import { ARCHETYPES, SELF_ARCHETYPE } from '../data/archetypes'
import { cx, dayKey, pickSeeded } from '../lib/utils'

const TONE_RING = {
  gold: 'border-gold-500/35 bg-gold-500/8',
  sapphire: 'border-sky-500/35 bg-sky-500/8',
  blood: 'border-rose-500/35 bg-rose-500/8',
  jade: 'border-emerald-500/35 bg-emerald-500/8',
}

const SECTIONS = [
  { id: 'identite', label: 'Identité', icon: 'Theater' },
  { id: 'esprit', label: 'Esprit', icon: 'Brain' },
  { id: 'corps', label: 'Corps & Voix', icon: 'Activity' },
  { id: 'lois', label: 'Lois & Sources', icon: 'Scale' },
  { id: 'entrainement', label: 'Entraînement', icon: 'Dumbbell' },
]

export const CharacterBible = () => {
  const { state, setLastModule } = useApp()
  const all = useMemo(() => [SELF_ARCHETYPE, ...ARCHETYPES], [])
  const [activeId, setActiveId] = useState('self')
  const [section, setSection] = useState('identite')
  const [drillIndex, setDrillIndex] = useState(null)

  const model = all.find((a) => a.id === activeId) || SELF_ARCHETYPE
  const dailyDrill = useMemo(() => pickSeeded(model.exercises, `${dayKey()}-${model.id}`), [model])

  const focusOfDay = useMemo(() => pickSeeded(ARCHETYPES, dayKey()), [])

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* ---------------- En-tête ---------------- */}
      <Panel glow>
        <SectionTitle
          eyebrow="Character Bible"
          title="Le Panthéon des Modèles"
          subtitle="Un acteur ne « s'inspire » pas : il étudie, décompose, puis incorpore. Chaque archétype est un rôle que tu peux jouer dès aujourd'hui."
          icon="Theater"
        />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Modèles étudiés" value={ARCHETYPES.length} icon="Users" />
          <Stat label="Toi" value={state.profile.codename || 'Futur Toi'} icon="Star" tone="gold" />
          <Stat label="Focus du jour" value={focusOfDay.name.split(' ')[0]} icon="Target" tone="sapphire" />
          <Stat label="Déclencheur" value="Actif" icon="Zap" tone="jade" />
        </div>
      </Panel>

      {/* ---------------- Sélecteur de modèle ---------------- */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {all.map((a) => (
          <button
            key={a.id}
            onClick={() => {
              setActiveId(a.id)
              setSection('identite')
              setDrillIndex(null)
              setLastModule('pantheon')
            }}
            className={cx(
              'flex min-w-[168px] shrink-0 flex-col items-start gap-1 rounded-2xl border p-3 text-left transition',
              activeId === a.id
                ? TONE_RING[a.avatarTone] || TONE_RING.gold
                : 'border-white/8 bg-white/2 hover:border-gold-500/25',
            )}
          >
            <div className="flex w-full items-center justify-between">
              <Icon name={a.id === 'self' ? 'Star' : 'Theater'} size={16} className="text-gold-300" />
              {a.id === 'self' && <Chip tone="gold">Toi</Chip>}
            </div>
            <span className="display text-[14px] leading-tight text-gold-100">{a.name}</span>
            <span className="text-[10.5px] text-ash">{a.epithet}</span>
          </button>
        ))}
      </div>

      {/* ---------------- Fiche du modèle ---------------- */}
      <Panel className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-gold-500/8 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="eyebrow">{model.era}</p>
              <h2 className="display mt-1 text-2xl text-gold-100 sm:text-3xl">{model.name}</h2>
              <p className="mt-0.5 text-[12.5px] text-ash">{model.epithet}</p>
            </div>
            <Chip tone="gold" icon="Quote">{model.tagline}</Chip>
          </div>

          <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-ivory/88">{model.summary}</p>

          <Tabs
            className="mt-4"
            value={section}
            onChange={setSection}
            tabs={SECTIONS}
          />

          <div className="mt-4">
            {section === 'identite' && (
              <div className="grid gap-2 sm:grid-cols-2">
                {model.traits.map((t) => (
                  <div key={t.label} className="panel-flat p-3">
                    <div className="flex items-center justify-between">
                      <span className="eyebrow text-[9.5px]">{t.label}</span>
                      <span className="text-[12px] font-semibold text-gold-200">{t.value}</span>
                    </div>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-ash">{t.detail}</p>
                  </div>
                ))}
              </div>
            )}

            {section === 'esprit' && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-gold-500/15 bg-void/45 p-4">
                  <p className="eyebrow mb-2">Sa pensée intérieure (à répéter)</p>
                  <ul className="space-y-2">
                    {model.mindset.map((m, i) => (
                      <li key={i} className="flex gap-2.5">
                        <Icon name="Quote" size={13} className="mt-1 shrink-0 text-gold-500/50" />
                        <span className="display text-[14px] leading-relaxed text-gold-100 italic">« {m} »</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/6 p-4">
                  <p className="eyebrow mb-1.5 !text-rose-300/90">Face à l'adversité</p>
                  <p className="text-[12.5px] leading-relaxed text-rose-100/85">{model.adversity}</p>
                </div>
              </div>
            )}

            {section === 'corps' && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-sky-500/20 bg-sky-500/6 p-4">
                  <p className="eyebrow mb-1.5 !text-sky-300/90">Voix</p>
                  <p className="text-[12.5px] leading-relaxed text-sky-100/85">{model.voice}</p>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/6 p-4">
                  <p className="eyebrow mb-1.5 !text-emerald-300/90">Posture</p>
                  <p className="text-[12.5px] leading-relaxed text-emerald-100/85">{model.posture}</p>
                </div>
                <div className="panel-flat p-4 sm:col-span-2">
                  <p className="eyebrow mb-2">Intégration biologique — protocole 7 jours</p>
                  <ol className="space-y-1.5">
                    {[
                      'Jour 1-2 : observe uniquement. Repère ses 3 marqueurs physiques dominants.',
                      'Jour 3-4 : reproduis la posture et la voix à voix haute, seul, 10 min.',
                      'Jour 5 : incarne-le dans une interaction réelle à faible enjeu.',
                      'Jour 6 : incarne-le dans une interaction à enjeu élevé (négociation, prise de parole).',
                      'Jour 7 : débriefe dans le Journal. Compare avec ton état par défaut.',
                    ].map((s, i) => (
                      <li key={i} className="flex gap-2.5 text-[12px] leading-relaxed text-ivory/88">
                        <span className="font-mono text-[11px] text-gold-400">{String(i + 1).padStart(2, '0')}</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {section === 'lois' && (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {model.laws.map((l, i) => (
                  <div key={i} className="rounded-2xl border border-gold-500/15 bg-gold-500/5 p-3.5">
                    <p className="eyebrow text-[9.5px]">{l.ref}</p>
                    <p className="display mt-1.5 text-[13.5px] leading-relaxed text-gold-100">{l.text}</p>
                  </div>
                ))}
              </div>
            )}

            {section === 'entrainement' && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-gold-500/30 bg-gold-500/8 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="eyebrow !text-gold-200">Exercice du jour pour ce rôle</p>
                    <Chip tone="gold" icon="Clock">{dailyDrill?.duration}</Chip>
                  </div>
                  <p className="display mt-2 text-[15px] text-gold-100">{dailyDrill?.title}</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-gold-100/85">{dailyDrill?.how}</p>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {model.exercises.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setDrillIndex(drillIndex === i ? null : i)}
                      className={cx(
                        'rounded-2xl border p-3 text-left transition',
                        drillIndex === i ? 'border-gold-500/40 bg-gold-500/10' : 'border-white/8 bg-white/2 hover:border-gold-500/25',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <Icon name="Dumbbell" size={15} className="text-gold-300" />
                        <span className="text-[10.5px] text-ash">{ex.duration}</span>
                      </div>
                      <p className="mt-2 text-[12.5px] font-semibold text-gold-100">{ex.title}</p>
                      {drillIndex === i && (
                        <p className="mt-1.5 text-[11.5px] leading-relaxed text-ash">{ex.how}</p>
                      )}
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/2 p-4">
                  <p className="eyebrow mb-2">Déclencheur sensoriel (ancre)</p>
                  <p className="text-[12.5px] leading-relaxed text-ivory/88">
                    Choisis un geste minuscule — toucher ton stylo, poser deux doigts sur la table, inspirer en
                    comptant 4. Répète-le systématiquement juste avant d'entrer dans le rôle. En 10 jours, ce geste
                    déclenchera l'état complet sans effort conscient : c'est la programmation neurologique de
                    Dispenza appliquée au théâtre.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Panel>

      {/* ---------------- Guide d'incorporation ---------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <SectionTitle
            eyebrow="Method Acting"
            title="Le protocole d'incorporation"
            subtitle="Comment faire passer un trait de l'étude à la biologie."
            icon="Brain"
          />
          <ol className="mt-4 space-y-2.5">
            {[
              { t: 'Étudier', d: 'Lis la fiche. Écris les 3 traits qui te manquent le plus aujourd\'hui.' },
              { t: 'Isoler', d: 'Choisis UN trait. Un seul. La dispersion tue l\'incarnation.' },
              { t: 'Répéter à froid', d: 'Joue le trait seul, à voix haute, hors situation, 10 minutes.' },
              { t: 'Jouer en scène', d: 'Applique-le dans une interaction réelle. Note l\'heure et le contexte.' },
              { t: 'Débriefer', d: 'Le soir, écris ce qui a tenu et ce qui a craqué. Ajuste demain.' },
              { t: 'Ancrer', d: 'Répète 21 jours. Après, le trait ne se joue plus : il est toi.' },
            ].map((s, i) => (
              <li key={s.t} className="flex gap-3 rounded-xl border border-gold-500/12 bg-white/2 p-3">
                <span className="display flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold-500/30 text-[13px] text-gold-200">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[12.5px] font-semibold text-gold-100">{s.t}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-ash">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel className="border-gold-500/22">
          <SectionTitle
            eyebrow="Neurosciences"
            title="Pourquoi ça fonctionne"
            subtitle="Dispenza : la répétition émotionnelle précède l'expérience réelle."
            icon="Zap"
          />
          <div className="mt-4 space-y-3">
            {[
              { t: 'Myélinisation', d: 'Chaque répétition épaissit la gaine de myéline autour du circuit neuronal : l\'action devient plus rapide et moins coûteuse en énergie.' },
              { t: 'Émotion avant expérience', d: 'Ressentir la fierté du résultat avant de l\'obtenir crée un état interne cohérent avec l\'objectif : le cerveau cherche ensuite à le rendre vrai.' },
              { t: 'Réécriture du déclencheur', d: 'Un même stimulus (notification, fatigue) doit produire une nouvelle réponse. C\'est la rupture d\'habitude.' },
              { t: 'Identité > motivation', d: 'La motivation fluctue. L\'identité, une fois installée, exécute sans négociation.' },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-gold-500/12 bg-white/2 p-3.5">
                <p className="text-[12.5px] font-semibold text-gold-100">{c.t}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-ash">{c.d}</p>
              </div>
            ))}
          </div>
          <Button
            variant="gold"
            full
            className="mt-4"
            icon="NotebookPen"
            onClick={() => setLastModule('journal')}
          >
            Débriefer l'incarnation du jour
          </Button>
        </Panel>
      </div>
    </div>
  )
}

export default CharacterBible
