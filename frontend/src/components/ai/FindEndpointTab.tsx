import { useState } from 'react'
import { Search, Loader2, ExternalLink, ArrowRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useRequestStore } from '@/stores/requestStore'
import { useAiStore } from '@/stores/aiStore'
import { aiRecommendEndpoint } from '@/lib/api'

export default function FindEndpointTab() {
  const { host, token } = useAuthStore()
  const { defaultModel } = useSettingsStore()
  const { setMethod, setPath } = useRequestStore()
  const { isLoading, setLoading, setLastMetadata } = useAiStore()
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    const q = query.trim()
    if (!q || isLoading) return

    if (!host || !token) {
      setError('Please configure your Databricks host and token in Settings.')
      return
    }

    setError(null)
    setResult(null)
    setLoading(true)

    try {
      const data = await aiRecommendEndpoint(q, host, token, defaultModel)
      setResult(data.recommendation)
      if (data.metadata) {
        setLastMetadata(data.metadata)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to find endpoint'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const handleUseEndpoint = (endpoint: string) => {
    // Try to extract method and path from recommendation text
    const methodMatch = endpoint.match(/\b(GET|POST|PUT|PATCH|DELETE)\b/i)
    const pathMatch = endpoint.match(/(\/api\/[\w./-]+)/i)

    if (pathMatch) {
      setPath(pathMatch[1])
    }
    if (methodMatch) {
      setMethod(methodMatch[1].toUpperCase() as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Input area */}
      <div
        className="p-4 border-b"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
      >
        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Describe what you want to do
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., List all running clusters, Create a new job..."
            className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
            }}
          />
          <button
            onClick={handleSearch}
            disabled={!query.trim() || isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: query.trim() && !isLoading ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: query.trim() && !isLoading ? '#fff' : 'var(--text-muted)',
            }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search
          </button>
        </div>
      </div>

      {/* Results area */}
      <div className="flex-1 overflow-auto p-4">
        {!result && !error && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-muted)' }}>
            <Search className="w-10 h-10 opacity-30" />
            <p className="text-sm text-center">
              Describe what you want to accomplish and AI will find
              <br />
              the right Databricks API endpoint for you.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-muted)' }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
            <span className="text-sm">Searching for the best endpoint...</span>
          </div>
        )}

        {error && (
          <div
            className="p-3 rounded-lg text-sm"
            style={{ backgroundColor: 'rgba(248, 81, 73, 0.1)', color: 'var(--accent-error)', border: '1px solid var(--accent-error)' }}
          >
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Recommended Endpoint
                </h3>
                <button
                  onClick={() => handleUseEndpoint(result)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors"
                  style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
                  title="Use this endpoint in the request composer"
                >
                  <ArrowRight className="w-3 h-3" />
                  Use Endpoint
                </button>
              </div>

              <div className="prose prose-sm max-w-none" style={{ color: 'var(--text-primary)' }}>
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <a
                href="https://docs.databricks.com/api/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs hover:underline"
                style={{ color: 'var(--accent-primary)' }}
              >
                View Databricks API Reference
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
