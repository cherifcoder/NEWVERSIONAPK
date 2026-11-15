import { useMemo, useState } from 'react'
import Icon from '../components/ui/Icon'
import {
  Button,
  Chip,
  Panel,
  ProgressBar,
  SectionTitle,
  Stat,
  Tabs,
} from '../components/ui/Primitives'
import { useApp } from '../context/AppContext'
import {
  BODY_LANGUAGE,
  NEGOTIATION_STEPS,
  PERSUASION_TOOLS,
  RHETORIC_DRILLS,
  SOCIAL_PLAYBOOK,
} from '../data/eloquence'
import {
  ENGLISH_BUSINESS_PHRASES,
  ENGLISH_IDIOMS,
  ENGLISH_LEVELS,
  ENGLISH_MODULES,
  ENGLISH_STREET,
} from '../data/english'
import { cx, dayKey, pickSeeded, shuffle } from '../lib/utils'

const TABS = [
  { id: 'rhetorique', label: 'Rhétorique', icon: 'Mic' },
  { id: 'anglais', label: 'Anglais', icon: 'Languages' },
  { id: 'entregent', label: 'Entregent', icon: 'Handshake' },
  { id: 'negociation', label: 'Négociation', icon: 'Scale' },
]

export const EloquenceHub = () => {
  const { state, addPillarValue, toggleIdiomLearned, setEnglishLevel, isExerciseDone, toggleExercise } = useApp()
  const [tab, setTab] = useState('rhetorique')

  const dailyDrill = useMemo(() => pickSeeded(RHETORIC_DRILLS, dayKey()), [])
  const dailyTool = useMemo(() => pickSeeded(PERSUASION_TOOLS, `${dayKey()}-tool`), [])
  const dailySocial = useMemo(() => pickSeeded(SOCIAL_PLAYBOOK, `${dayKey()}-social`), [])
  const [idiomBatch, setIdiomBatch] = useState(() => shuffle(ENGLISH_IDIOMS).slice(0, 5))

  const learned = new Set(state.english?.idiomsLearned || [])
  const levelIndex = ENGLISH_LEVELS.findIndex((l) => l.id === (state.english?.level || 'b1'))
  const englishMinutes = state.today?.pillars?.english || 0

  const rotateIdioms = () => setIdiomBatch(shuffle(ENGLISH_IDIOMS).slice(0, 5))

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* ---------------- En-tête ---------------- */}
      <Panel glow>
        <SectionTitle
          eyebrow="Hub Éloquence, Négociation & Anglais"
          title="La parole est une arme de construction massive"
          subtitle="Celui qui maîtrise le verbe n'a plus besoin de crier. Chaque jour : diction, persuasion, entregent, anglais."
          icon="Mic"
        />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Éloquence du jour" value={`${state.today?.pillars?.eloquence || 0} min`} icon="Mic" />
          <Stat label="Anglais du jour" value={`${englishMinutes} min`} icon="Languages" tone="sapphire" />
          <Stat label="Idiomes acquis" value={learned.size} unit={`/${ENGLISH_IDIOMS.length}`} icon="GraduationCap" tone="jade" />
          <Stat label="Niveau" value={ENGLISH_LEVELS[levelIndex]?.id?.toUpperCase() || 'B1'} icon="TrendingUp" />
        </div>
      </Panel>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {/* ============================= RHÉTORIQUE ============================= */}
      {tab === 'rhetorique' && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel className="lg:col-span-2 border-gold-500/30">
            <SectionTitle
              eyebrow="Exercice du jour"
              title={dailyDrill.title}
              subtitle={dailyDrill.goal}
              icon="Mic"
              right={<Chip tone="gold" icon="Clock">{dailyDrill.duration}</Chip>}
            />
            <ol className="mt-4 space-y-2">
              {dailyDrill.steps.map((s, i) => (
                <li key={i} className="flex gap-3 rounded-xl border border-gold-500/12 bg-white/2 p-3">
                  <span className="display flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold-500/30 text-[12px] text-gold-200">
                    {i + 1}
                  </span>
                  <span className="text-[12.5px] leading-relaxed text-ivory/88">{s}</span>
                </li>
              ))}
            </ol>
            <div className="mt-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-3">
              <p className="eyebrow mb-1 !text-emerald-300/90">Critère de réussite</p>
              <p className="text-[12.5px] text-emerald-100/90">{dailyDrill.metric}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="gold" icon="Plus" onClick={() => addPillarValue('eloquence', 15)}>
                Créditer 15 min d'éloquence
              </Button>
              <Button
                variant={isExerciseDone(`rhet-${dailyDrill.id}`) ? 'ghost' : 'ghost'}
                icon={isExerciseDone(`rhet-${dailyDrill.id}`) ? 'CheckCircle2' : 'Check'}
                onClick={() => toggleExercise(`rhet-${dailyDrill.id}`)}
              >
                {isExerciseDone(`rhet-${dailyDrill.id}`) ? 'Exercice validé' : 'Marquer comme fait'}
              </Button>
            </div>
          </Panel>

          <div className="space-y-4">
            <Panel>
              <SectionTitle eyebrow="Arme du jour" title={dailyTool.name} icon="Zap" />
              <p className="mt-2 text-[11px] text-gold-400/80 italic">{dailyTool.source}</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ash">{dailyTool.how}</p>
              <div className="mt-3 rounded-xl border border-gold-500/20 bg-void/50 p-3">
                <p className="eyebrow mb-1 text-[9.5px]">À dire tel quel</p>
                <p className="display text-[13.5px] leading-relaxed text-gold-100 italic">{dailyTool.phrase}</p>
              </div>
              <p className="mt-3 text-[11.5px] text-ash">
                <span className="font-semibold text-gold-300">Quand :</span> {dailyTool.when}
              </p>
            </Panel>

            <Panel>
              <SectionTitle eyebrow="Toutes les armes" title="Boîte à outils de persuasion" icon="Layers" />
              <div className="mt-3 space-y-2">
                {PERSUASION_TOOLS.map((p) => (
                  <details key={p.id} className="group rounded-xl border border-gold-500/12 bg-white/2 p-3">
                    <summary className="flex cursor-pointer items-center justify-between gap-2 text-[12.5px] font-semibold text-gold-100">
                      {p.name}
                      <Icon name="ChevronDown" size={14} className="shrink-0 text-ash transition group-open:rotate-180" />
                    </summary>
                    <p className="mt-2 text-[12px] leading-relaxed text-ash">{p.how}</p>
                    <p className="mt-2 text-[12px] leading-relaxed text-gold-200 italic">{p.phrase}</p>
                  </details>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* ============================= ANGLAIS ============================= */}
      {tab === 'anglais' && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Panel>
              <SectionTitle
                eyebrow="Immersion quotidienne"
                title="Modules d'apprentissage"
                subtitle="La langue s'attrape par l'oreille et la bouche, jamais par la grammaire seule."
                icon="Languages"
              />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {ENGLISH_MODULES.map((m) => (
                  <div key={m.id} className="rounded-2xl border border-gold-500/12 bg-white/2 p-3.5">
                    <p className="text-[13px] font-semibold text-gold-100">{m.title}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-ash">{m.goal}</p>
                    <ol className="mt-2.5 space-y-1.5">
                      {m.steps.map((s, i) => (
                        <li key={i} className="flex gap-2 text-[11.5px] leading-relaxed text-ivory/85">
                          <span className="font-mono text-[10px] text-gold-400">{i + 1}.</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="gold" icon="Plus" onClick={() => addPillarValue('english', 15)}>
                  Créditer 15 min d'anglais
                </Button>
                <Button variant="ghost" icon="Plus" onClick={() => addPillarValue('english', 45)}>
                  +45 min
                </Button>
              </div>
            </Panel>

            <Panel>
              <SectionTitle
                eyebrow="Business & Street"
                title="Les expressions des élites anglophones"
                icon="MessageSquare"
                right={<Button size="sm" variant="ghost" icon="Shuffle" onClick={rotateIdioms}>Autres</Button>}
              />
              <div className="mt-4 space-y-2">
                {idiomBatch.map((i) => {
                  const isLearned = learned.has(i.en)
                  return (
                    <div
                      key={i.en}
                      className={cx(
                        'flex items-start gap-3 rounded-2xl border p-3 transition',
                        isLearned ? 'border-emerald-500/30 bg-emerald-500/6' : 'border-gold-500/12 bg-white/2',
                      )}
                    >
                      <button
                        onClick={() => toggleIdiomLearned(i.en)}
                        className={cx(
                          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition',
                          isLearned
                            ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                            : 'border-gold-500/30 text-transparent hover:bg-gold-500/10',
                        )}
                      >
                        <Icon name="Check" size={13} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-gold-100">{i.en}</p>
                        <p className="mt-0.5 text-[12px] text-ash">{i.fr}</p>
                        <p className="mt-1.5 text-[11.5px] leading-relaxed text-sky-200/85 italic">{i.use}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Panel>

            <Panel>
              <SectionTitle eyebrow="Phrases de réunion" title="Business English prêt à l'emploi" icon="Handshake" />
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {ENGLISH_BUSINESS_PHRASES.map((p) => (
                  <div key={p.en} className="rounded-xl border border-sky-500/15 bg-sky-500/5 p-3">
                    <p className="text-[12.5px] font-medium text-sky-100">{p.en}</p>
                    <p className="mt-1 text-[11.5px] text-ash">{p.fr}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="space-y-4">
            <Panel>
              <SectionTitle eyebrow="Progression" title="Ton niveau d'anglais" icon="TrendingUp" />
              <div className="mt-3 space-y-2">
                {ENGLISH_LEVELS.map((l, i) => (
                  <button
                    key={l.id}
                    onClick={() => setEnglishLevel(l.id)}
                    className={cx(
                      'flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition',
                      state.english?.level === l.id
                        ? 'border-gold-500/45 bg-gold-500/12'
                        : 'border-white/8 bg-white/2 hover:border-gold-500/25',
                    )}
                  >
                    <span
                      className={cx(
                        'display flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[12px]',
                        i <= levelIndex ? 'border-gold-500/40 bg-gold-500/15 text-gold-100' : 'border-white/10 text-ash',
                      )}
                    >
                      {l.id.toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12px] font-semibold text-gold-100">{l.label}</span>
                      <span className="block text-[11px] text-ash">{l.target}</span>
                    </span>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel>
              <SectionTitle eyebrow="Argot & rue" title="Street English" icon="Users" />
              <div className="mt-3 space-y-1.5">
                {ENGLISH_STREET.map((s) => (
                  <div key={s.en} className="flex items-start justify-between gap-3 rounded-xl border border-white/8 bg-white/2 p-2.5">
                    <div>
                      <p className="text-[12.5px] font-medium text-ivory/92">{s.en}</p>
                      <p className="text-[11px] text-ash">{s.fr}</p>
                    </div>
                    <Chip tone={s.register === 'Rue' ? 'blood' : 'slate'}>{s.register}</Chip>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel>
              <SectionTitle eyebrow="Objectif" title="Temps d'anglais du jour" icon="Clock" />
              <p className="mt-2 display text-3xl text-gold-100 tabular-nums">
                {englishMinutes}
                <span className="ml-1 text-sm text-ash">/ {state.pillars?.english || 45} min</span>
              </p>
              <ProgressBar className="mt-2" value={((englishMinutes / (state.pillars?.english || 45)) * 100)} tone="#4a7fd4" />
              <p className="mt-3 text-[12px] leading-relaxed text-ash">
                15 min de shadowing + 10 expressions + 1 mini-pitch parlé. Tous les jours, même mal, même court.
              </p>
            </Panel>
          </div>
        </div>
      )}

      {/* ============================= ENTREGENT ============================= */}
      {tab === 'entregent' && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel className="lg:col-span-2 border-gold-500/30">
            <SectionTitle
              eyebrow="Playbook du jour"
              title={dailySocial.title}
              subtitle="L'entregent est un script répété jusqu'à devenir naturel."
              icon="Handshake"
            />
            <p className="mt-3 text-[12.5px] leading-relaxed text-ivory/88">{dailySocial.detail}</p>
            <div className="mt-3 rounded-2xl border border-gold-500/20 bg-void/50 p-3.5">
              <p className="eyebrow mb-1.5">Exemple concret</p>
              <p className="display text-[14px] leading-relaxed text-gold-100 italic">« {dailySocial.example} »</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="gold" icon="Plus" onClick={() => addPillarValue('eloquence', 20)}>
                Créditer 20 min d'entregent
              </Button>
            </div>
          </Panel>

          <Panel>
            <SectionTitle eyebrow="Lecture à froid" title="Décoder le langage corporel" icon="Eye" />
            <div className="mt-3 space-y-2">
              {BODY_LANGUAGE.map((b) => (
                <details key={b.cue} className="group rounded-xl border border-gold-500/12 bg-white/2 p-2.5">
                  <summary className="flex cursor-pointer items-center justify-between gap-2 text-[12px] font-medium text-gold-100">
                    <span className="flex items-center gap-2">
                      <Icon name="Eye" size={12} className="shrink-0 text-gold-400" />
                      {b.cue}
                    </span>
                    <Icon name="ChevronDown" size={13} className="shrink-0 text-ash transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-ash">
                    <span className="font-semibold text-gold-300">Lecture :</span> {b.read}
                  </p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-emerald-200/85">
                    <span className="font-semibold">Usage :</span> {b.use}
                  </p>
                </details>
              ))}
            </div>
          </Panel>

          <Panel className="lg:col-span-3">
            <SectionTitle eyebrow="Bibliothèque" title="Toutes les techniques d'entregent" icon="Layers" />
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SOCIAL_PLAYBOOK.map((s) => (
                <div key={s.id} className="rounded-2xl border border-gold-500/12 bg-white/2 p-3.5">
                  <p className="text-[12.5px] font-semibold text-gold-100">{s.title}</p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-ash">{s.detail}</p>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-gold-200/85 italic">« {s.example} »</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* ============================= NÉGOCIATION ============================= */}
      {tab === 'negociation' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <SectionTitle
              eyebrow="Protocole"
              title="Les 6 mouvements d'une négociation"
              subtitle="Une négociation se gagne avant la réunion. Le reste n'est qu'exécution."
              icon="Scale"
            />
            <ol className="mt-4 space-y-2.5">
              {NEGOTIATION_STEPS.map((s) => (
                <li key={s.n} className="flex gap-3 rounded-2xl border border-gold-500/12 bg-white/2 p-3.5">
                  <span className="display flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold-500/30 text-[14px] text-gold-200">
                    {s.n}
                  </span>
                  <div>
                    <p className="text-[12.5px] font-semibold text-gold-100">{s.title}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-ash">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>

          <div className="space-y-4">
            <Panel className="border-rose-500/25">
              <SectionTitle eyebrow="Erreurs fatales" title="Ce qui te fait perdre" icon="Ban" />
              <ul className="mt-3 space-y-2">
                {[
                  'Parler plus de 40 % du temps.',
                  'Donner un prix sans contrepartie.',
                  'Négocier sans BATNA — tu supplies, tu ne négocies pas.',
                  'Répondre à une attaque par une défense émotionnelle.',
                  'Annoncer ta limite réelle dès le départ.',
                  'Remplir chaque silence par du bavardage.',
                ].map((e, i) => (
                  <li key={i} className="flex gap-2.5 text-[12.5px] leading-relaxed text-rose-100/85">
                    <Icon name="X" size={13} className="mt-0.5 shrink-0 text-rose-400" />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel>
              <SectionTitle eyebrow="Simulation" title="Répétition à froid" icon="Theater" />
              <p className="mt-2 text-[12.5px] leading-relaxed text-ash">
                Écris la négociation de demain. Répète-la trois fois à voix haute, en variant le ton : calme
                d'autorité, chaleureux, glacial. Ton cerveau ne distingue pas la répétition de la réalité —
                il câble les deux de la même façon.
              </p>
              <div className="mt-3 grid gap-2">
                {['Ouverture', 'Ancrage', 'Objection probable', 'Concession conditionnelle', 'Clôture'].map((s, i) => (
                  <div key={s} className="flex items-center gap-3 rounded-xl border border-gold-500/12 bg-white/2 p-2.5">
                    <span className="font-mono text-[11px] text-gold-400">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-[12px] text-ivory/88">{s}</span>
                    <span className="ml-auto text-[10.5px] text-ash/60">à écrire</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  )
}

export default EloquenceHub
