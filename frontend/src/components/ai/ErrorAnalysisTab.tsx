import { useState } from 'react'
import { AlertTriangle, Loader2, Lightbulb, ShieldAlert } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useRequestStore } from '@/stores/requestStore'
import { useAiStore } from '@/stores/aiStore'
import { aiExplainError } from '@/lib/api'

export default function ErrorAnalysisTab() {
  const { host, token } = useAuthStore()
  const { defaultModel } = useSettingsStore()
  const { method, path, bodyInput, response } = useRequestStore()
  const { isLoading, setLoading } = useAiStore()
  const [explanation, setExplanation] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isErrorResponse = response !== null && response.status >= 400

  const handleExplain = async () => {
    if (isLoading) return

    if (!host || !token) {
      setError('Please configure your Databricks host and token in Settings.')
      return
    }

    if (!response) {
      setError('No response to analyze. Send a request first.')
      return
    }

    if (!isErrorResponse) {
      setError('The current response is not an error (status < 400). Switch to Analyze Response tab for successful responses.')
      return
    }

    setError(null)
    setExplanation(null)
    setLoading(true)

    try {
      let parsedBody: unknown = undefined
      if (bodyInput) {
        try {
          parsedBody = JSON.parse(bodyInput)
        } catch {
          parsedBody = bodyInput
        }
      }

      const data = await aiExplainError(
        path,
        method,
        response.data,
        host,
        token,
        defaultModel,
        parsedBody
      )
      setExplanation(data.explanation)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to explain error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Input area */}
      <div
        className="p-4 border-b"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Error Response
          </label>
          {response && (
            <span
              className="text-xs px-2 py-0.5 rounded font-medium"
              style={{
                backgroundColor: isErrorResponse ? 'var(--accent-error)' : 'var(--accent-success)',
                color: '#fff',
              }}
            >
              {response.status}
            </span>
          )}
        </div>

        {isErrorResponse ? (
          <div
            className="rounded-lg p-2.5 text-xs font-mono mb-3 max-h-32 overflow-auto"
            style={{
              backgroundColor: 'rgba(248, 81, 73, 0.05)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--accent-error)',
            }}
          >
            <p className="mb-1 font-sans font-medium" style={{ color: 'var(--accent-error)' }}>
              {method} {path} - {response.status}
            </p>
            {JSON.stringify(response.data, null, 2)}
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
            {response
              ? `Current response has status ${response.status} (not an error). This tab analyzes error responses (4xx/5xx).`
              : 'No response available. Send a request first.'}
          </div>
        )}

        <button
          onClick={handleExplain}
          disabled={!isErrorResponse || isLoading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full justify-center"
          style={{
            backgroundColor: isErrorResponse && !isLoading ? 'var(--accent-error)' : 'var(--bg-tertiary)',
            color: isErrorResponse && !isLoading ? '#fff' : 'var(--text-muted)',
          }}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ShieldAlert className="w-4 h-4" />
          )}
          Explain Error & Suggest Fix
        </button>
      </div>

      {/* Results area */}
      <div className="flex-1 overflow-auto p-4">
        {!explanation && !error && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-muted)' }}>
            <AlertTriangle className="w-10 h-10 opacity-30" />
            <p className="text-sm text-center">
              When you get an error response, use this tab to get
              <br />
              an AI-powered explanation and suggested fix.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-muted)' }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
            <span className="text-sm">Analyzing error...</span>
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

        {explanation && (
          <div className="space-y-3">
            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
            >
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Lightbulb className="w-4 h-4" style={{ color: 'var(--accent-warning)' }} />
                Error Explanation & Fix
              </h3>
              <div className="prose prose-sm max-w-none" style={{ color: 'var(--text-primary)' }}>
                <ReactMarkdown>{explanation}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
