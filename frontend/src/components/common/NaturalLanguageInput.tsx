import { useState, useCallback } from 'react'
import {
  Sparkles,
  Loader2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Send,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useRequestStore } from '@/stores/requestStore'
import { aiNaturalLanguageToApi } from '@/lib/api'
import type { HttpMethod } from '@/types/api'

interface ParsedApiCall {
  method: HttpMethod
  path: string
  body?: string
}

export default function NaturalLanguageInput() {
  const { host, token } = useAuthStore()
  const { setMethod, setPath, setBodyInput } = useRequestStore()

  const [query, setQuery] = useState('')
  const [isConverting, setIsConverting] = useState(false)
  const [parsedCall, setParsedCall] = useState<ParsedApiCall | null>(null)
  const [error, setError] = useState<string | null>(null)

  const METHOD_COLORS: Record<string, string> = {
    GET: '#7ee787',
    POST: '#58a6ff',
    PUT: '#f0883e',
    PATCH: '#d2a8ff',
    DELETE: '#f85149',
  }

  const handleConvert = useCallback(async () => {
    if (!query.trim()) return
    if (!host || !token) {
      setError('Please configure Databricks host and token in Settings')
      return
    }

    setIsConverting(true)
    setError(null)
    setParsedCall(null)

    try {
      const result = await aiNaturalLanguageToApi(query, host, token)
      const apiCallStr = result.apiCall || ''

      // Parse the response - it might be in different formats
      let method: HttpMethod = 'GET'
      let path = ''
      let body: string | undefined

      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(apiCallStr)
        method = (parsed.method || 'GET').toUpperCase() as HttpMethod
        path = parsed.path || parsed.endpoint || ''
        body = parsed.body ? JSON.stringify(parsed.body, null, 2) : undefined
      } catch {
        // Try to parse as text: "METHOD /path\n{body}"
        const lines = apiCallStr.split('\n')
        const firstLine = lines[0]?.trim() || ''
        const methodMatch = firstLine.match(/^(GET|POST|PUT|PATCH|DELETE)\s+(.+)/i)
        if (methodMatch) {
          method = methodMatch[1].toUpperCase() as HttpMethod
          path = methodMatch[2]
          if (lines.length > 1) {
            const bodyStr = lines.slice(1).join('\n').trim()
            if (bodyStr) {
              body = bodyStr
            }
          }
        } else {
          // Just use the entire string as a path
          path = apiCallStr.trim()
        }
      }

      setParsedCall({ method, path, body })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to convert natural language')
    } finally {
      setIsConverting(false)
    }
  }, [query, host, token])

  const handleApply = () => {
    if (!parsedCall) return
    setMethod(parsedCall.method)
    setPath(parsedCall.path)
    setBodyInput(parsedCall.body || '')
    setParsedCall(null)
    setQuery('')
  }

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: 'var(--border-secondary)' }}
      >
        <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
          Natural Language to API
        </span>
      </div>

      {/* Input */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
            placeholder="e.g., List all running clusters, Create a job that runs every hour..."
            disabled={isConverting}
            className="flex-1 px-3 py-2 rounded-lg text-xs outline-none disabled:opacity-50"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
            }}
          />
          <button
            onClick={handleConvert}
            disabled={isConverting || !query.trim()}
            className="p-2 rounded-lg transition-colors disabled:opacity-30"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#ffffff' }}
            title="Convert to API call"
          >
            {isConverting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-1.5 mt-2">
            <XCircle
              className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
              style={{ color: 'var(--accent-error)' }}
            />
            <span className="text-xs" style={{ color: 'var(--accent-error)' }}>
              {error}
            </span>
          </div>
        )}

        {/* Parsed result */}
        {parsedCall && (
          <div
            className="mt-3 p-3 rounded-lg"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-secondary)',
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-success)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--accent-success)' }}>
                Converted API Call
              </span>
            </div>

            {/* Method + Path */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${METHOD_COLORS[parsedCall.method] || '#8b949e'}20`,
                  color: METHOD_COLORS[parsedCall.method] || '#8b949e',
                }}
              >
                {parsedCall.method}
              </span>
              <span
                className="text-xs font-mono truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {parsedCall.path}
              </span>
            </div>

            {/* Body */}
            {parsedCall.body && (
              <div className="mb-2">
                <p className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
                  Request Body:
                </p>
                <pre
                  className="text-[10px] font-mono p-2 rounded max-h-24 overflow-y-auto"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {parsedCall.body}
                </pre>
              </div>
            )}

            {/* Apply button */}
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors w-full justify-center"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <ArrowRight className="w-3.5 h-3.5" />
              Apply to Request Composer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
