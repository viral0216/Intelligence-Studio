import { Compass } from 'lucide-react'
import { useSettingsStore, type ActiveView } from '@/stores/settingsStore'

const TABS: { key: ActiveView; label: string; icon: React.ReactNode }[] = [
  { key: 'explorer', label: 'API Explorer', icon: <Compass className="w-4 h-4" /> },
]

export default function NavTabs() {
  const { activeView, setActiveView } = useSettingsStore()

  return (
    <nav className="nav-tabs-bar">
      <div className="nav-tabs-inner">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveView(tab.key)}
            className={`nav-tab ${activeView === tab.key ? 'active' : ''}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
