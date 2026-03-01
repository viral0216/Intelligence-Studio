import { useState, useCallback } from 'react'
import {
  Sparkles,
  Loader2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useRequestStore } from '@/stores/requestStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { aiNaturalLanguageToApi } from '@/lib/api'
import type { HttpMethod } from '@/types/api'

interface ParsedApiCall {
  method: HttpMethod
  path: string
  body?: string
}

const SUGGESTIONS = [
  'list all clusters',
  'show me running jobs',
  'get tables in catalog main',
  'list users in workspace',
  'show all warehouses',
]

export default function NaturalLanguageInput() {
  const { host, token } = useAuthStore()
  const { setMethod, setPath, setBodyInput } = useRequestStore()
  const { defaultModel } = useSettingsStore()

  const [query, setQuery] = useState('')
  const [isConverting, setIsConverting] = useState(false)
  const [parsedCall, setParsedCall] = useState<ParsedApiCall | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleConvert = useCallback(async (text?: string) => {
    const q = (text || query).trim()
    if (!q) return
    if (!host || !token) {
      setError('Please configure Databricks host and token in Settings')
      return
    }

    setIsConverting(true)
    setError(null)
    setParsedCall(null)
    if (text) setQuery(text)

    try {
      const result = await aiNaturalLanguageToApi(q, host, token, defaultModel)
      let apiCallStr = (result.apiCall || '').trim()

      // Strip markdown code fences (```json ... ``` or ``` ... ```)
      apiCallStr = apiCallStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

      let method: HttpMethod = 'GET'
      let path = ''
      let body: string | undefined

      try {
        const parsed = JSON.parse(apiCallStr)
        method = (parsed.method || 'GET').toUpperCase() as HttpMethod
        path = parsed.path || parsed.endpoint || ''
        body = parsed.body ? JSON.stringify(parsed.body, null, 2) : undefined
      } catch {
        const lines = apiCallStr.split('\n')
        const firstLine = lines[0]?.trim() || ''
        const methodMatch = firstLine.match(/^(GET|POST|PUT|PATCH|DELETE)\s+(.+)/i)
        if (methodMatch) {
          method = methodMatch[1].toUpperCase() as HttpMethod
          path = methodMatch[2]
          if (lines.length > 1) {
            const bodyStr = lines.slice(1).join('\n').trim()
            if (bodyStr) body = bodyStr
          }
        } else {
          path = apiCallStr.trim()
        }
      }

      setParsedCall({ method, path, body })
      // Auto-apply
      setMethod(method)
      setPath(path)
      setBodyInput(body || '')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to convert natural language')
    } finally {
      setIsConverting(false)
    }
  }, [query, host, token, defaultModel, setMethod, setPath, setBodyInput])

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} />
        <h2 className="card-title" style={{ margin: 0 }}>Natural Language to API</h2>
      </div>
      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
        Describe what you want to do in plain English, and we'll generate the API call for you.
      </p>

      {/* Model selector */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Model:</span>
        <span className="badge" style={{ fontSize: '11px' }}>{defaultModel || 'databricks-claude-haiku-4-5'}</span>
      </div>

      {/* Input + Convert */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
          placeholder='e.g., "list all clusters" or "show tables in catalog main"'
          disabled={isConverting}
          className="input flex-1"
          style={{ fontSize: '13px' }}
        />
        <button
          onClick={() => handleConvert()}
          disabled={isConverting || !query.trim()}
          className="btn btn-primary btn-sm"
          style={{ whiteSpace: 'nowrap' }}
        >
          {isConverting ? <Loader2 className="w-4 h-4 spin" /> : <>Convert <ArrowRight className="w-3.5 h-3.5" /></>}
        </button>
      </div>

      {/* Suggestion chips */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Try these:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleConvert(s)}
            className="suggestion-chip"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Status messages */}
      {!host || !token ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--accent-subtle)', border: '1px solid var(--card-border)' }}>
          <Info className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-primary)' }} />
          <span className="text-xs" style={{ color: 'var(--accent-primary)' }}>
            Configure Databricks host and token in Settings to use this feature.
          </span>
        </div>
      ) : null}

      {error && (
        <div className="flex items-center gap-2 mt-2">
          <XCircle className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-error)' }} />
          <span className="text-xs" style={{ color: 'var(--accent-error)' }}>{error}</span>
        </div>
      )}

      {parsedCall && (
        <div className="flex items-center gap-2 mt-2">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-success)' }} />
          <span className="text-xs" style={{ color: 'var(--accent-success)' }}>
            Applied: {parsedCall.method} {parsedCall.path}
          </span>
        </div>
      )}
    </div>
  )
}
