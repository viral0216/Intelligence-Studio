import { useState, useCallback } from 'react'
import { Send, Loader2, Sparkles } from 'lucide-react'
import { useRequestStore } from '@/stores/requestStore'
import { useAuthStore } from '@/stores/authStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useCatalogStore } from '@/stores/catalogStore'
import { sendRequest } from '@/lib/api'
import type { HttpMethod } from '@/types/api'

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'var(--method-get)',
  POST: 'var(--method-post)',
  PUT: 'var(--method-put)',
  PATCH: 'var(--method-patch)',
  DELETE: 'var(--method-delete)',
}

export default function RequestComposer() {
  const { method, path, bodyInput, isLoading, setMethod, setPath, setBodyInput, setLoading, setResponse, setError } = useRequestStore()
  const { host, token } = useAuthStore()
  const { addItem } = useHistoryStore()
  const { setShowPresetDrawer } = useCatalogStore()
  const [showBody, setShowBody] = useState(false)

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

  return (
    <div
      className="p-4 border-b"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
    >
      {/* Method + Path + Send */}
      <div className="flex items-center gap-2">
        {/* Method selector */}
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as HttpMethod)}
          className="px-3 py-2 rounded-lg text-sm font-bold border-0 outline-none cursor-pointer"
          style={{
            backgroundColor: 'var(--bg-input)',
            color: METHOD_COLORS[method],
            minWidth: '100px',
          }}
        >
          {METHODS.map((m) => (
            <option key={m} value={m} style={{ color: METHOD_COLORS[m] }}>
              {m}
            </option>
          ))}
        </select>

        {/* Path input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="/api/2.0/clusters/list"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
            }}
          />
        </div>

        {/* Preset button */}
        <button
          onClick={() => setShowPresetDrawer(true)}
          className="p-2 rounded-lg transition-colors"
          style={{ backgroundColor: 'var(--bg-input)', color: 'var(--accent-secondary)' }}
          title="Browse API Catalog"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send
        </button>
      </div>

      {/* Body toggle */}
      {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
        <div className="mt-2">
          <button
            onClick={() => setShowBody(!showBody)}
            className="text-xs font-medium"
            style={{ color: 'var(--accent-primary)' }}
          >
            {showBody ? 'Hide' : 'Show'} Request Body
          </button>
          {showBody && (
            <textarea
              value={bodyInput}
              onChange={(e) => setBodyInput(e.target.value)}
              placeholder='{"key": "value"}'
              rows={6}
              className="w-full mt-2 px-3 py-2 rounded-lg text-sm font-mono outline-none resize-y"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}
