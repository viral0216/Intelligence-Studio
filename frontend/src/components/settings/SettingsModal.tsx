import { useState } from 'react'
import { X } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'
import AuthSettings from './AuthSettings'
import CloudProviderSettings from './CloudProviderSettings'
import AiModelSettings from './AiModelSettings'
import WarehouseSettings from './WarehouseSettings'
import PricingSettings from './PricingSettings'
import FeatureToggles from './FeatureToggles'
import PromptSettings from './PromptSettings'

const TABS = [
  { key: 'auth', label: 'Authentication' },
  { key: 'cloud', label: 'Cloud Provider' },
  { key: 'ai', label: 'AI Models' },
  { key: 'warehouse', label: 'SQL Warehouse' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'features', label: 'Features' },
  { key: 'prompts', label: 'Prompts' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function SettingsModal() {
  const { settingsOpen, setSettingsOpen } = useSettingsStore()
  const [activeTab, setActiveTab] = useState<TabKey>('auth')

  if (!settingsOpen) return null

  const renderContent = () => {
    switch (activeTab) {
      case 'auth':
        return <AuthSettings />
      case 'cloud':
        return <CloudProviderSettings />
      case 'ai':
        return <AiModelSettings />
      case 'warehouse':
        return <WarehouseSettings />
      case 'pricing':
        return <PricingSettings />
      case 'features':
        return <FeatureToggles />
      case 'prompts':
        return <PromptSettings />
      default:
        return null
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setSettingsOpen(false)
      }}
    >
      <div
        className="flex flex-col w-full max-w-3xl max-h-[85vh] rounded-xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Settings
          </h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-1.5 rounded-md transition-colors hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: Tabs + Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Tab sidebar */}
          <nav
            className="flex flex-col w-48 shrink-0 border-r overflow-y-auto py-2"
            style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="text-left px-4 py-2.5 text-sm transition-colors"
                style={{
                  color: activeTab === tab.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  backgroundColor: activeTab === tab.key ? 'var(--bg-hover)' : 'transparent',
                  borderRight: activeTab === tab.key ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  fontWeight: activeTab === tab.key ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
