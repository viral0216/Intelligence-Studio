import { useState } from 'react'
import { Code, Loader2, Copy, Check, Terminal } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useRequestStore } from '@/stores/requestStore'
import { useAiStore } from '@/stores/aiStore'
import { aiGenerateCode } from '@/lib/api'

export default function CodeGenerationTab() {
  const { host, token } = useAuthStore()
  const { defaultModel } = useSettingsStore()
  const { method, path, bodyInput } = useRequestStore()
  const { isLoading, setLoading, setLastMetadata } = useAiStore()
  const [code, setCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [language, setLanguage] = useState<'python' | 'curl' | 'javascript' | 'go'>('python')

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
    setCode(null)
    setLoading(true)

    try {
      let parsedBody: unknown = undefined
      if (bodyInput) {
        try {
          parsedBody = JSON.parse(bodyInput)
        } catch {
          parsedBody = undefined
        }
      }

      const data = await aiGenerateCode(path, method, host, token, parsedBody, defaultModel)
      setCode(data.code)
      if (data.metadata) {
        setLastMetadata(data.metadata)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate code'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const languageOptions = [
    { value: 'python', label: 'Python' },
    { value: 'curl', label: 'cURL' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'go', label: 'Go' },
  ] as const

  return (
    <div className="flex flex-col h-full">
      {/* Input area */}
      <div
        className="p-4 border-b"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
      >
        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Current Request
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

        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Language
        </label>
        <div className="flex items-center gap-1 mb-3">
          {languageOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setLanguage(opt.value)}
              className="px-2.5 py-1.5 rounded text-xs font-medium transition-colors"
              style={{
                backgroundColor: language === opt.value ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: language === opt.value ? '#fff' : 'var(--text-muted)',
              }}
            >
              {opt.label}
            </button>
          ))}
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
            <Terminal className="w-4 h-4" />
          )}
          Generate {languageOptions.find((o) => o.value === language)?.label} Code
        </button>
      </div>

      {/* Results area */}
      <div className="flex-1 overflow-auto p-4">
        {!code && !error && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-muted)' }}>
            <Code className="w-10 h-10 opacity-30" />
            <p className="text-sm text-center">
              Generate code snippets for the current API request
              <br />
              in Python, cURL, JavaScript, or Go.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-muted)' }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
            <span className="text-sm">Generating code...</span>
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

        {code && (
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: '1px solid var(--border-primary)' }}
          >
            {/* Code header */}
            <div
              className="flex items-center justify-between px-3 py-2"
              style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)' }}
            >
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {languageOptions.find((o) => o.value === language)?.label}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
                style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-hover)' }}
                title="Copy code"
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

            {/* Code content */}
            <pre
              className="p-4 text-xs font-mono overflow-auto"
              style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                maxHeight: '400px',
              }}
            >
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
