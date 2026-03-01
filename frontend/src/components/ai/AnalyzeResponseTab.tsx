import { useState } from 'react'
import { BarChart3, Loader2, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useRequestStore } from '@/stores/requestStore'
import { useAiStore } from '@/stores/aiStore'
import { aiAnalyzeResponse } from '@/lib/api'

export default function AnalyzeResponseTab() {
  const { host, token } = useAuthStore()
  const { defaultModel } = useSettingsStore()
  const { method, path, response } = useRequestStore()
  const { isLoading, setLoading, setLastMetadata } = useAiStore()
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (isLoading) return

    if (!host || !token) {
      setError('Please configure your Databricks host and token in Settings.')
      return
    }

    if (!response) {
      setError('No response to analyze. Send a request first.')
      return
    }

    setError(null)
    setAnalysis(null)
    setLoading(true)

    try {
      const data = await aiAnalyzeResponse(path, method, response.data, host, token, defaultModel)
      setAnalysis(data.analysis)
      if (data.metadata) {
        setLastMetadata(data.metadata)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to analyze response'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const hasResponse = response !== null
  const responsePreview = hasResponse
    ? JSON.stringify(response.data, null, 2).slice(0, 300)
    : null

  return (
    <div className="flex flex-col h-full">
      {/* Input area */}
      <div
        className="p-4 border-b"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Current Response
          </label>
          {hasResponse && (
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--accent-success)', color: '#fff' }}>
              {response.status}
            </span>
          )}
        </div>

        {hasResponse ? (
          <div
            className="rounded-lg p-2.5 text-xs font-mono mb-3 max-h-24 overflow-auto"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <p style={{ color: 'var(--text-muted)' }} className="mb-1">
              {method} {path} - {response.status} ({response.durationMs}ms)
            </p>
            {responsePreview}
            {JSON.stringify(response.data, null, 2).length > 300 && '...'}
          </div>
        ) : (
          <div
            className="rounded-lg p-3 text-xs mb-3"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-muted)',
              border: '1px dashed var(--border-primary)',
            }}
          >
            No response available. Send a request first.
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={!hasResponse || isLoading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full justify-center"
          style={{
            backgroundColor: hasResponse && !isLoading ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
            color: hasResponse && !isLoading ? '#fff' : 'var(--text-muted)',
          }}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Analyze Response
        </button>
      </div>

      {/* Results area */}
      <div className="flex-1 overflow-auto p-4">
        {!analysis && !error && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-muted)' }}>
            <BarChart3 className="w-10 h-10 opacity-30" />
            <p className="text-sm text-center">
              Analyze your API response with AI to understand
              <br />
              the data structure, patterns, and insights.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-muted)' }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
            <span className="text-sm">Analyzing response...</span>
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

        {analysis && (
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
          >
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              Response Analysis
            </h3>
            <div className="prose prose-sm max-w-none" style={{ color: 'var(--text-primary)' }}>
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
