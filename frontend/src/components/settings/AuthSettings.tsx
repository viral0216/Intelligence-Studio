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
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Databricks Authentication
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Configure your Databricks workspace host URL and personal access token.
        </p>
      </div>

      {/* Connection Status Badge */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{
          backgroundColor: isConnected ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${isConnected ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
        }}
      >
        {isConnected ? (
          <ShieldCheck className="w-4 h-4" style={{ color: 'var(--accent-success)' }} />
        ) : (
          <ShieldX className="w-4 h-4" style={{ color: 'var(--accent-danger)' }} />
        )}
        <span
          className="text-sm font-medium"
          style={{ color: isConnected ? 'var(--accent-success)' : 'var(--accent-danger)' }}
        >
          {isConnected ? 'Connected' : 'Not Connected'}
        </span>
      </div>

      {/* Host URL */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Workspace Host URL
        </label>
        <div className="relative">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="url"
            value={localHost}
            onChange={(e) => setLocalHost(e.target.value)}
            placeholder="https://your-workspace.cloud.databricks.com"
            className="w-full pl-10 pr-3 py-2 rounded-lg text-sm outline-none transition-colors"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-primary)')}
          />
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          The full URL of your Databricks workspace, e.g. https://adb-1234567890.1.azuredatabricks.net
        </span>
      </div>

      {/* Token */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Personal Access Token
        </label>
        <div className="relative">
          <input
            type={showToken ? 'text' : 'password'}
            value={localToken}
            onChange={(e) => setLocalToken(e.target.value)}
            placeholder="dapi..."
            className="w-full pl-3 pr-10 py-2 rounded-lg text-sm outline-none transition-colors font-mono"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-primary)')}
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded"
            style={{ color: 'var(--text-muted)' }}
          >
            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Generate a token from Databricks Settings &gt; Developer &gt; Access tokens
        </span>
      </div>

      {/* Status message */}
      {statusMessage && (
        <p
          className="text-sm px-3 py-2 rounded-lg"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: isConnected ? 'var(--accent-success)' : 'var(--text-warning, var(--accent-danger))',
          }}
        >
          {statusMessage}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}
        >
          Save Credentials
        </button>
        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
        >
          {testing && <Loader2 className="w-4 h-4 animate-spin" />}
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
      </div>
    </div>
  )
}
