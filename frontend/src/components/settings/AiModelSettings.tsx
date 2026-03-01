import { useState } from 'react'
import { RefreshCw, Loader2, ChevronDown, Cpu } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'
import { useAuthStore } from '@/stores/authStore'
import { listModels } from '@/lib/api'

export default function AiModelSettings() {
  const { defaultModel, setDefaultModel, maxTokens, setMaxTokens } = useSettingsStore()
  const { host, token } = useAuthStore()
  const [models, setModels] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRefreshModels = async () => {
    if (!host || !token) {
      setError('Please configure Databricks credentials first.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await listModels(host, token)
      setModels(result.models || [])
      if (result.models.length === 0) {
        setError('No models found. Check your workspace configuration.')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load models.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          AI Model Configuration
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Select the default foundation model and configure token limits for AI-powered features.
        </p>
      </div>

      {/* Default Model */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Default Model
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            {models.length > 0 ? (
              <div className="relative">
                <select
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 rounded-lg text-sm outline-none appearance-none cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  {!models.includes(defaultModel) && (
                    <option value={defaultModel}>{defaultModel} (current)</option>
                  )}
                  {models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--text-muted)' }}
                />
              </div>
            ) : (
              <input
                type="text"
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                placeholder="databricks-meta-llama-3-1-405b-instruct"
                className="w-full pl-10 pr-3 py-2 rounded-lg text-sm outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-primary)')}
              />
            )}
          </div>
          <button
            onClick={handleRefreshModels}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50 shrink-0"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {loading ? 'Loading...' : 'Refresh Models'}
          </button>
        </div>
        {models.length > 0 && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {models.length} model{models.length !== 1 ? 's' : ''} available in your workspace
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <p
          className="text-sm px-3 py-2 rounded-lg"
          style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--accent-danger)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          {error}
        </p>
      )}

      {/* Max Tokens */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Max Tokens
        </label>
        <input
          type="number"
          value={maxTokens}
          onChange={(e) => setMaxTokens(Math.max(1, parseInt(e.target.value) || 1))}
          min={1}
          max={128000}
          step={256}
          className="w-48 px-3 py-2 rounded-lg text-sm outline-none transition-colors"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-primary)')}
        />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Maximum number of tokens the model can generate per response (1 - 128,000)
        </span>
      </div>

      {/* Token presets */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Quick Presets
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {[1024, 2048, 4096, 8192, 16384].map((val) => (
            <button
              key={val}
              onClick={() => setMaxTokens(val)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{
                backgroundColor: maxTokens === val ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: maxTokens === val ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${maxTokens === val ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
              }}
            >
              {val.toLocaleString()}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
