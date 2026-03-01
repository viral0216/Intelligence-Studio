import { useState } from 'react'
import { Sun, Moon, Settings, History, Bot, Download, Zap, BookOpen, Search } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'
import { useAuthStore } from '@/stores/authStore'
import { checkHealth } from '@/lib/api'

export default function HeaderBar() {
  const { theme, toggleTheme, toggleHistory, toggleAiAssistant, toggleIntegrationExport, setSettingsOpen } = useSettingsStore()
  const { host, token, isConnected, setConnected } = useAuthStore()
  const [checking, setChecking] = useState(false)

  const handleCheckConnection = async () => {
    if (!host || !token) return
    setChecking(true)
    try {
      const result = await checkHealth(host, token)
      setConnected(result.ok)
    } catch {
      setConnected(false)
    } finally {
      setChecking(false)
    }
  }

  return (
    <header
      className="flex items-center justify-between px-4 py-2 border-b"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
    >
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-3">
        <Zap className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
        <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Intelligencre Studio
        </h1>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}>
          Pro
        </span>
      </div>

      {/* Center: Connection Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: isConnected ? 'var(--accent-success)' : 'var(--text-muted)' }}
          />
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        {host && token && (
          <button
            onClick={handleCheckConnection}
            disabled={checking}
            className="text-xs px-2 py-1 rounded transition-colors"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
          >
            {checking ? 'Checking...' : 'Test'}
          </button>
        )}
      </div>

      {/* Right: Toolbar */}
      <div className="flex items-center gap-1">
        <ToolbarButton icon={<Search className="w-4 h-4" />} label="Presets" onClick={() => {}} />
        <ToolbarButton icon={<History className="w-4 h-4" />} label="History" onClick={toggleHistory} />
        <ToolbarButton icon={<Bot className="w-4 h-4" />} label="AI" onClick={toggleAiAssistant} />
        <ToolbarButton icon={<Download className="w-4 h-4" />} label="Export" onClick={toggleIntegrationExport} />
        <ToolbarButton icon={<BookOpen className="w-4 h-4" />} label="Docs" onClick={() => {}} />
        <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--border-primary)' }} />
        <ToolbarButton
          icon={theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          label="Theme"
          onClick={toggleTheme}
        />
        <ToolbarButton icon={<Settings className="w-4 h-4" />} label="Settings" onClick={() => setSettingsOpen(true)} />
      </div>
    </header>
  )
}

function ToolbarButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="p-2 rounded-md transition-colors hover:opacity-80"
      style={{ color: 'var(--text-secondary)' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {icon}
    </button>
  )
}
