import { useState } from 'react'
import { Link, ShieldCheck, ShieldX, Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { checkHealth } from '@/lib/api'

export default function AuthSettings() {
  const { host, token, isConnected, setCredentials, setConnected } = useAuthStore()
  const [localHost, setLocalHost] = useState(host)
  const [localToken, setLocalToken] = useState(token)
  const [showToken, setShowToken] = useState(false)
  const [testing, setTesting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handleSave = () => {
    setCredentials(localHost.trim(), localToken.trim())
    setStatusMessage('Credentials saved.')
  }

  const handleTestConnection = async () => {
    if (!localHost.trim() || !localToken.trim()) {
      setStatusMessage('Please enter both host URL and token.')
      return
    }
    setTesting(true)
    setStatusMessage(null)
    try {
      const result = await checkHealth(localHost.trim(), localToken.trim())
      setConnected(result.ok)
      setCredentials(localHost.trim(), localToken.trim())
      setStatusMessage(result.ok ? `Connected successfully (${result.durationMs}ms)` : result.message || 'Connection failed.')
    } catch (err: unknown) {
      setConnected(false)
      const message = err instanceof Error ? err.message : 'Connection failed.'
      setStatusMessage(message)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Databricks Authentication
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Configure your Databricks workspace host URL and personal access token.
        </p>
      </div>

      {/* Connection Status Badge */}
      <div className={`badge ${isConnected ? 'badge-success' : 'badge-error'}`} style={{ padding: '8px 14px', borderRadius: '8px', gap: '8px' }}>
        {isConnected ? (
          <ShieldCheck className="w-4 h-4" />
        ) : (
          <ShieldX className="w-4 h-4" />
        )}
        <span className="text-sm font-semibold">
          {isConnected ? 'Connected' : 'Not Connected'}
        </span>
      </div>

      {/* Host URL */}
      <div className="flex flex-col gap-1.5">
        <label className="label">Workspace Host URL</label>
        <div className="relative">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="url"
            value={localHost}
            onChange={(e) => setLocalHost(e.target.value)}
            placeholder="https://your-workspace.cloud.databricks.com"
            className="input"
            style={{ paddingLeft: '36px' }}
          />
        </div>
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
          The full URL of your Databricks workspace, e.g. https://adb-1234567890.1.azuredatabricks.net
        </span>
      </div>

      {/* Token */}
      <div className="flex flex-col gap-1.5">
        <label className="label">Personal Access Token</label>
        <div className="relative">
          <input
            type={showToken ? 'text' : 'password'}
            value={localToken}
            onChange={(e) => setLocalToken(e.target.value)}
            placeholder="dapi..."
            className="input font-mono"
            style={{ paddingRight: '40px' }}
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="toolbar-btn absolute right-1 top-1/2 -translate-y-1/2"
            style={{ padding: '4px' }}
          >
            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
          Generate a token from Databricks Settings &gt; Developer &gt; Access tokens
        </span>
      </div>

      {/* Status message */}
      {statusMessage && (
        <div className={`${isConnected ? 'badge-success' : 'error-banner'}`} style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '13px' }}>
          {statusMessage}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button onClick={handleSave} className="btn btn-secondary">
          Save Credentials
        </button>
        <button onClick={handleTestConnection} disabled={testing} className="btn btn-primary">
          {testing && <Loader2 className="w-4 h-4 spin" />}
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
      </div>
    </div>
  )
}
