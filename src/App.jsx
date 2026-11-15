import { useEffect, useState } from 'react'
import LockScreen from './components/LockScreen'
import Onboarding from './components/Onboarding'
import Shell from './components/layout/Shell'
import { AppProvider, useApp } from './context/AppContext'
import { MODULES, MODULE_MAP } from './modules/registry'

const Root = () => {
  const { state, locked, setLastModule } = useApp()
  const [active, setActive] = useState(() => state.ui?.lastModule || 'dashboard')

  useEffect(() => {
    const stored = state.ui?.lastModule
    if (stored && MODULE_MAP[stored] && stored !== active) setActive(stored)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ui?.lastModule])

  const navigate = (id) => {
    if (!MODULE_MAP[id]) return
    setActive(id)
    setLastModule(id)
  }

  if (!state.ui?.seenOnboarding) return <Onboarding />
  if (locked) return <LockScreen />

  const mod = MODULE_MAP[active] || MODULES[0]
  const Component = mod.Component

  return (
    <Shell active={mod.id} onNavigate={navigate}>
      <Component onNavigate={navigate} />
    </Shell>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  )
}
