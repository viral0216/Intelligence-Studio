import { useState } from 'react'
import { Sun, Moon, Settings, History, Bot, Download, RefreshCw } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'
import { useAuthStore } from '@/stores/authStore'
import { checkHealth } from '@/lib/api'
import appIcon from '@/assets/icon.svg'

export default function HeaderBar() {
  const { theme, toggleTheme, toggleAiAssistant, toggleHistory, toggleIntegrationExport, setSettingsOpen, showAiAssistant, showHistory, showIntegrationExport, uiComponents } = useSettingsStore()
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
    <header className="app-header">
      {/* Left: Title area */}
      <div className="app-header-content">
        <div className="app-header-brand">
          <div className="app-header-logo-wrap">
            <img src={appIcon} alt="Intelligence Studio" className="app-header-logo" style={{ width: 32, height: 32 }} />
          </div>
          <span className="app-header-title">Intelligence Studio</span>
        </div>
        <h2 className="app-header-subtitle">API Explorer & Analytics Studio</h2>
        <p className="app-header-desc">
          Explore and test Databricks APIs with built-in AI analysis powered by foundation models.
        </p>
      </div>

      {/* Right: Status + Toolbar */}
      <div className="app-header-status">
        <div className="flex items-center gap-2">
          <div className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <div className={`connection-dot ${isConnected ? 'connected' : 'disconnected'}`} />
            <span>{isConnected ? 'Connected' : 'Not Connected'}</span>
          </div>
          {host && token && (
            <button onClick={handleCheckConnection} disabled={checking} className="toolbar-btn" style={{ padding: '4px' }}>
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'spin' : ''}`} />
            </button>
          )}
        </div>

        <div className="app-header-actions">
          {uiComponents.aiAssistant && (
            <button className={`header-action-btn ${showAiAssistant ? 'active' : ''}`} onClick={toggleAiAssistant}>
              <Bot className="w-3.5 h-3.5" />
              <span>AI Assistant</span>
            </button>
          )}
          {uiComponents.history && (
            <button className={`header-action-btn ${showHistory ? 'active' : ''}`} onClick={toggleHistory}>
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </button>
          )}
          {uiComponents.export && (
            <button className={`header-action-btn ${showIntegrationExport ? 'active' : ''}`} onClick={toggleIntegrationExport}>
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          )}
          <span className="app-header-divider" />
          <button className="toolbar-btn" onClick={toggleTheme} title={`${theme === 'dark' ? 'Light' : 'Dark'} mode`}>
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button className="toolbar-btn" onClick={() => setSettingsOpen(true)} title="Settings">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
