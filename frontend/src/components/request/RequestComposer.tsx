import { useCallback } from 'react'
import { Send, Loader2, Sparkles } from 'lucide-react'
import { useRequestStore } from '@/stores/requestStore'
import { useAuthStore } from '@/stores/authStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { sendRequest, aiSuggestParameters } from '@/lib/api'
import type { HttpMethod } from '@/types/api'
import JsonEditor from '@/components/common/JsonEditor'

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

export default function RequestComposer() {
  const { method, path, bodyInput, isLoading, setMethod, setPath, setBodyInput, setLoading, setResponse, setError } = useRequestStore()
  const { host, token } = useAuthStore()
  const { addItem } = useHistoryStore()
  const { defaultModel } = useSettingsStore()

  const handleSend = useCallback(async () => {
    if (!host || !token) {
      setError('Please configure Databricks host and token in Settings')
      return
    }
    if (!path) {
      setError('Please enter an API path')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let parsedBody = undefined
      if (bodyInput.trim()) {
        try {
          parsedBody = JSON.parse(bodyInput)
        } catch {
          setError('Invalid JSON body')
          setLoading(false)
          return
        }
      }

      const result = await sendRequest(method, path, parsedBody, host, token)
      setResponse(result)
      addItem(method, path, parsedBody)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Request failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [method, path, bodyInput, host, token, setLoading, setResponse, setError, addItem])

  const handleAiSuggest = async () => {
    if (!host || !token || !path) return
    try {
      const result = await aiSuggestParameters(path, method, '', host, token, defaultModel)
      if (result.suggestion) {
        let suggestion = result.suggestion.trim()
        // Try to parse as JSON first; if invalid, try to extract JSON from markdown
        try {
          const parsed = JSON.parse(suggestion)
          suggestion = JSON.stringify(parsed, null, 2)
        } catch {
          // Try extracting JSON from markdown code fences
          const fenceMatch = suggestion.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
          if (fenceMatch) {
            try {
              const parsed = JSON.parse(fenceMatch[1].trim())
              suggestion = JSON.stringify(parsed, null, 2)
            } catch { /* ignore */ }
          } else {
            // Try extracting first { ... } block
            const braceStart = suggestion.indexOf('{')
            const braceEnd = suggestion.lastIndexOf('}')
            if (braceStart !== -1 && braceEnd > braceStart) {
              try {
                const parsed = JSON.parse(suggestion.slice(braceStart, braceEnd + 1))
                suggestion = JSON.stringify(parsed, null, 2)
              } catch { /* ignore */ }
            }
          }
        }
        setBodyInput(suggestion)
      }
    } catch {
      // silently fail
    }
  }

  return (
    <div className="card">
      <h2 className="card-title">Request composer</h2>

      {/* METHOD + PATH row */}
      <div className="grid grid-cols-[200px_1fr] gap-4 mb-4">
        <div>
          <label className="label">METHOD</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
            className="select-input"
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">PATH</label>
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="/api/2.0/clusters/list"
            className="input"
          />
        </div>
      </div>

      {/* Query Parameters / Body */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="label" style={{ margin: 0 }}>QUERY PARAMETERS (JSON)</label>
          <button onClick={handleAiSuggest} className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-secondary)' }}>
            <Sparkles className="w-3.5 h-3.5" />
            AI Suggest
          </button>
        </div>
        <JsonEditor
          value={bodyInput}
          onChange={setBodyInput}
          placeholder='{"limit": 10}'
          rows={4}
        />
      </div>

      {/* Send button */}
      <button onClick={handleSend} disabled={isLoading} className="btn btn-primary">
        {isLoading ? <Loader2 className="w-4 h-4 spin" /> : <Send className="w-4 h-4" />}
        Send
      </button>
    </div>
  )
}
