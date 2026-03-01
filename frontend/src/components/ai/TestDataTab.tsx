import { useState } from 'react'
import { FlaskConical, Loader2, Copy, Check, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useRequestStore } from '@/stores/requestStore'
import { useAiStore } from '@/stores/aiStore'
import { generateTestData } from '@/lib/api'

export default function TestDataTab() {
  const { host, token } = useAuthStore()
  const { defaultModel } = useSettingsStore()
  const { method, path, setBodyInput } = useRequestStore()
  const { isLoading, setLoading } = useAiStore()
  const [testData, setTestData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (isLoading) return

    if (!host || !token) {
      setError('Please configure your Databricks host and token in Settings.')
      return
    }

    if (!path) {
      setError('Please enter an API endpoint path in the request composer.')
      return
    }

    setError(null)
    setTestData(null)
    setLoading(true)

    try {
      const data = await generateTestData(method, path, host, token, defaultModel)
      const formatted = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
      setTestData(formatted)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate test data'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!testData) return
    navigator.clipboard.writeText(testData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUseAsBody = () => {
    if (!testData) return
    setBodyInput(testData)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Input area */}
      <div
        className="p-4 border-b"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
      >
        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Generate Test Data For
        </label>
        <div
          className="rounded-lg p-2.5 text-xs font-mono mb-3"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <span
            className="font-semibold mr-2"
            style={{
              color: method === 'GET' ? 'var(--accent-success)' :
                method === 'POST' ? 'var(--accent-primary)' :
                method === 'PUT' ? 'var(--accent-warning)' :
                method === 'DELETE' ? 'var(--accent-error)' : 'var(--text-primary)',
            }}
          >
            {method}
          </span>
          {path || '/api/2.0/...'}
        </div>

        <button
          onClick={handleGenerate}
          disabled={!path || isLoading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full justify-center"
          style={{
            backgroundColor: path && !isLoading ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
            color: path && !isLoading ? '#fff' : 'var(--text-muted)',
          }}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FlaskConical className="w-4 h-4" />
          )}
          Generate Test Data
        </button>
      </div>

      {/* Results area */}
      <div className="flex-1 overflow-auto p-4">
        {!testData && !error && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-muted)' }}>
            <FlaskConical className="w-10 h-10 opacity-30" />
            <p className="text-sm text-center">
              Generate realistic test data for the current endpoint.
              <br />
              The AI will create a valid request body based on the API schema.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-muted)' }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
            <span className="text-sm">Generating test data...</span>
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

        {testData && (
          <div className="space-y-3">
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--border-primary)' }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-3 py-2"
                style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)' }}
              >
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Generated JSON
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleGenerate}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
                    style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-hover)' }}
                    title="Regenerate"
                    disabled={isLoading}
                  >
                    <RefreshCw className="w-3 h-3" />
                    Regen
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
                    style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-hover)' }}
                    title="Copy JSON"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3" style={{ color: 'var(--accent-success)' }} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* JSON content */}
              <pre
                className="p-4 text-xs font-mono overflow-auto"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  maxHeight: '400px',
                }}
              >
                <code>{testData}</code>
              </pre>
            </div>

            {/* Use as body button */}
            <button
              onClick={handleUseAsBody}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors w-full justify-center"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--accent-primary)',
              }}
            >
              Use as Request Body
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
