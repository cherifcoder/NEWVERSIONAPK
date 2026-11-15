import { useEffect, useState } from 'react'
import Logo from '../Logo'
import Icon from '../ui/Icon'
import { Chip } from '../ui/Primitives'
import { useApp } from '../../context/AppContext'
import { MODULES, MODULE_MAP, NAV_GROUPS } from '../../modules/registry'
import { cx, formatLongDate } from '../../lib/utils'

const PRIMARY = MODULES.filter((m) => m.primary)

export const Shell = ({ active, onNavigate, children }) => {
  const { state, derived, lock, exportData } = useApp()
  const [drawer, setDrawer] = useState(false)
  const mod = MODULE_MAP[active] || MODULES[0]

  useEffect(() => {
    setDrawer(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [active])

  return (
    <div className="app-bg min-h-full">
      {/* ------------------------- Sidebar (desktop) ------------------------- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-gold-500/12 bg-ink-950/80 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <Logo size={38} />
          <div className="min-w-0">
            <p className="display text-lg leading-none tracking-[0.14em] text-gold-100">METHOD</p>
            <p className="mt-1 truncate text-[10px] tracking-widest text-ash/70 uppercase">
              {state.profile.codename || 'Le Futur Toi'}
            </p>
          </div>
        </div>
        <div className="gold-rule mx-5" />

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((g) => (
            <div key={g.id}>
              <p className="eyebrow px-2 pb-1.5 text-[9.5px] opacity-70">{g.label}</p>
              <div className="space-y-0.5">
                {MODULES.filter((m) => m.group === g.id).map((m) => (
                  <button
                    key={m.id}
                    className="nav-item"
                    data-active={active === m.id}
                    onClick={() => onNavigate(m.id)}
                  >
                    <Icon name={m.icon} size={16} />
                    <span className="truncate">{m.label}</span>
                    {m.id === 'dispatcher' && derived.openLoops > 0 && (
                      <span className="ml-auto rounded-full bg-rose-500/20 px-1.5 py-0.5 font-mono text-[10px] text-rose-200">
                        {derived.openLoops}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-gold-500/12 p-3">
          <div className="panel-flat mb-2 p-3">
            <div className="flex items-center justify-between text-[10.5px] text-ash">
              <span className="flex items-center gap-1.5">
                <Icon name="TrendingUp" size={12} className="text-gold-300" /> Série
              </span>
              <span className="font-mono text-gold-200">{state.streak?.current || 0} j</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-ash">
              <span className="flex items-center gap-1.5">
                <Icon name="Percent" size={12} className="text-gold-300" /> Incarnation
              </span>
              <span className="font-mono text-gold-200">{derived.incarnRate}%</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button className="btn btn-ghost flex-1 !px-2 !py-2" onClick={exportData} title="Sauvegarder">
              <Icon name="Save" size={14} />
            </button>
            <button className="btn btn-ghost flex-1 !px-2 !py-2" onClick={lock} title="Verrouiller">
              <Icon name="Lock" size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* --------------------------- Contenu --------------------------- */}
      <div className="lg:pl-64">
        {/* Top bar (mobile) */}
        <header className="safe-top sticky top-0 z-20 border-b border-gold-500/12 bg-void/85 backdrop-blur-xl lg:hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <Logo size={30} />
            <div className="min-w-0 flex-1">
              <p className="display truncate text-[15px] leading-tight text-gold-100">{mod.short}</p>
              <p className="truncate text-[10px] text-ash/70 capitalize">{formatLongDate()}</p>
            </div>
            <Chip tone="gold" icon="Percent">
              {derived.incarnRate}%
            </Chip>
            <button
              onClick={() => setDrawer(true)}
              className="rounded-lg border border-gold-500/18 p-2 text-gold-200"
              aria-label="Menu"
            >
              <Icon name="Menu" size={17} />
            </button>
          </div>
        </header>

        {/* Top bar (desktop) */}
        <header className="sticky top-0 z-20 hidden border-b border-gold-500/12 bg-void/70 backdrop-blur-xl lg:block">
          <div className="flex items-center justify-between gap-4 px-8 py-4">
            <div className="min-w-0">
              <h1 className="display truncate text-xl text-gold-100">{mod.title}</h1>
              <p className="truncate text-[12px] text-ash">{mod.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <Chip tone="jade" icon="Clock">
                {derived.todayMinutes} min profond
              </Chip>
              <Chip tone={derived.openLoops ? 'blood' : 'jade'} icon="Swords">
                {derived.openLoops} boucle{derived.openLoops > 1 ? 's' : ''} ouverte{derived.openLoops > 1 ? 's' : ''}
              </Chip>
              <Chip tone="gold" icon="Calendar">
                {formatLongDate()}
              </Chip>
            </div>
          </div>
        </header>

        <main key={active} className="anim-fade-up px-4 pt-4 pb-28 sm:px-6 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>

      {/* ---------------------- Bottom nav (mobile) ---------------------- */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-gold-500/15 bg-ink-950/92 backdrop-blur-xl lg:hidden">
        <div className="flex items-stretch">
          {PRIMARY.map((m) => (
            <button
              key={m.id}
              onClick={() => onNavigate(m.id)}
              className={cx(
                'relative flex flex-1 flex-col items-center gap-1 py-2.5 transition',
                active === m.id ? 'text-gold-200' : 'text-ash/75',
              )}
            >
              {active === m.id && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-gold-400 shadow-[0_0_10px_rgba(207,168,81,0.8)]" />
              )}
              <Icon name={m.icon} size={19} />
              <span className="text-[9.5px] font-semibold tracking-wide">{m.short}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* --------------------------- Drawer --------------------------- */}
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm anim-fade-in" onClick={() => setDrawer(false)} />
          <div className="safe-top absolute inset-y-0 right-0 w-[85%] max-w-sm overflow-y-auto border-l border-gold-500/15 bg-ink-950 p-4 anim-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Logo size={32} />
                <p className="display tracking-[0.12em] text-gold-100">METHOD</p>
              </div>
              <button onClick={() => setDrawer(false)} className="rounded-lg p-2 text-ash">
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="panel-flat mb-4 grid grid-cols-3 gap-2 p-3 text-center">
              <div>
                <p className="font-mono text-lg text-gold-200">{derived.incarnRate}%</p>
                <p className="text-[9.5px] tracking-wide text-ash uppercase">Incarné</p>
              </div>
              <div>
                <p className="font-mono text-lg text-gold-200">{state.streak?.current || 0}</p>
                <p className="text-[9.5px] tracking-wide text-ash uppercase">Série</p>
              </div>
              <div>
                <p className="font-mono text-lg text-rose-200">{derived.openLoops}</p>
                <p className="text-[9.5px] tracking-wide text-ash uppercase">Ouvertes</p>
              </div>
            </div>

            {NAV_GROUPS.map((g) => (
              <div key={g.id} className="mb-4">
                <p className="eyebrow px-1 pb-1.5 text-[9.5px] opacity-70">{g.label}</p>
                <div className="space-y-0.5">
                  {MODULES.filter((m) => m.group === g.id).map((m) => (
                    <button
                      key={m.id}
                      className="nav-item"
                      data-active={active === m.id}
                      onClick={() => onNavigate(m.id)}
                    >
                      <Icon name={m.icon} size={16} />
                      <span className="truncate">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-4 flex gap-2">
              <button className="btn btn-ghost flex-1" onClick={exportData}>
                <Icon name="Download" size={14} /> Sauvegarder
              </button>
              <button className="btn btn-ghost flex-1" onClick={lock}>
                <Icon name="Lock" size={14} /> Verrouiller
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Shell
