import { useEffect, useState } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'
import HeaderBar from '@/components/layout/HeaderBar'
import MainLayout from '@/components/layout/MainLayout'
import SettingsModal from '@/components/settings/SettingsModal'
import { pingBackend } from '@/lib/api'
import appIcon from '@/assets/icon.svg'

export default function App() {
  const theme = useSettingsStore((s) => s.theme)
  const settingsOpen = useSettingsStore((s) => s.settingsOpen)
  const [backendUp, setBackendUp] = useState<boolean | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Check backend on startup and periodically
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    const check = async () => {
      const up = await pingBackend()
      setBackendUp(up)
    }
    check()
    interval = setInterval(check, 15000) // re-check every 15s
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="app-shell">
      <HeaderBar />
      {backendUp === false && (
        <div
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: 'var(--accent-error)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <img src={appIcon} alt="" style={{ width: 16, height: 16 }} />
          <span>
            Backend server is not running. Start it with: <code style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', fontFamily: 'monospace' }}>cd backend && uvicorn app.main:app --port 8000</code>
          </span>
          <button
            onClick={async () => { setBackendUp(await pingBackend()) }}
            className="px-2 py-0.5 rounded text-xs"
            style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', cursor: 'pointer', color: 'var(--text-primary)' }}
          >
            Retry
          </button>
        </div>
      )}
      <MainLayout />
      {settingsOpen && <SettingsModal />}
    </div>
  )
}
