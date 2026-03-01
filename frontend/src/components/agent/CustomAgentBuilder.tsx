import { useCallback, useEffect, useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Bot,
  AlertCircle,
} from 'lucide-react'
import {
  listCustomAgents,
  createCustomAgent,
  updateCustomAgent,
  deleteCustomAgent,
} from '@/lib/api'
import type { CustomAgent } from '@/types/ai'

type HandlerType = 'api' | 'transform' | 'custom'

interface AgentFormData {
  name: string
  description: string
  pattern: string
  handler: HandlerType
  endpoint: string
  method: string
}

const EMPTY_FORM: AgentFormData = {
  name: '',
  description: '',
  pattern: '',
  handler: 'api',
  endpoint: '',
  method: 'GET',
}

const HANDLER_OPTIONS: { value: HandlerType; label: string }[] = [
  { value: 'api', label: 'API Call' },
  { value: 'transform', label: 'Data Transform' },
  { value: 'custom', label: 'Custom Logic' },
]

const METHOD_OPTIONS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

export default function CustomAgentBuilder() {
  const [agents, setAgents] = useState<CustomAgent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AgentFormData>(EMPTY_FORM)

  const fetchAgents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await listCustomAgents()
      const agentsList = Array.isArray(result) ? result : (result as { agents?: CustomAgent[] }).agents || []
      setAgents(agentsList)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load custom agents')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (agent: CustomAgent) => {
    setForm({
      name: agent.name,
      description: agent.description,
      pattern: agent.pattern,
      handler: agent.handler,
      endpoint: agent.config?.endpoint || '',
      method: agent.config?.method || 'GET',
    })
    setEditingId(agent.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.pattern.trim()) {
      setError('Name and pattern are required')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        pattern: form.pattern.trim(),
        handler: form.handler,
        config: {
          endpoint: form.endpoint.trim(),
          method: form.method,
        },
        enabled: true,
      }

      if (editingId) {
        await updateCustomAgent(editingId, payload)
      } else {
        await createCustomAgent(payload)
      }
      resetForm()
      await fetchAgents()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save agent')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await deleteCustomAgent(id)
      await fetchAgents()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete agent')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleEnabled = async (agent: CustomAgent) => {
    try {
      await updateCustomAgent(agent.id, { enabled: !agent.enabled })
      await fetchAgents()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to toggle agent')
    }
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Custom Agent Builder
          </span>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setForm(EMPTY_FORM)
              setEditingId(null)
              setShowForm(true)
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <Plus className="w-3 h-3" />
            New Agent
          </button>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div
          className="mx-4 mt-3 p-3 rounded-lg flex items-start gap-2"
          style={{
            backgroundColor: 'rgba(248, 81, 73, 0.1)',
            border: '1px solid var(--accent-error)',
          }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-error)' }} />
          <span className="text-xs" style={{ color: 'var(--accent-error)' }}>
            {error}
          </span>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div
          className="mx-4 mt-3 p-4 rounded-lg"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            {editingId ? 'Edit Agent' : 'Create New Agent'}
          </h3>

          <div className="space-y-3">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="My Custom Agent"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What does this agent do?"
                rows={2}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-y"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                }}
              />
            </div>

            {/* Pattern (regex) */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Pattern (regex) *
              </label>
              <input
                type="text"
                value={form.pattern}
                onChange={(e) => setForm({ ...form, pattern: e.target.value })}
                placeholder="^(list|show)\s+clusters.*"
                className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                }}
              />
            </div>

            {/* Handler Type */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Handler Type
              </label>
              <select
                value={form.handler}
                onChange={(e) => setForm({ ...form, handler: e.target.value as HandlerType })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                {HANDLER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Endpoint */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Endpoint
              </label>
              <input
                type="text"
                value={form.endpoint}
                onChange={(e) => setForm({ ...form, endpoint: e.target.value })}
                placeholder="/api/2.0/clusters/list"
                className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                }}
              />
            </div>

            {/* Method */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                HTTP Method
              </label>
              <select
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                {METHOD_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                onClick={resetForm}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                }}
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading && agents.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--accent-primary)' }} />
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-10 h-10 mx-auto mb-2 opacity-30" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No custom agents yet
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Create one to extend the agent capabilities
            </p>
          </div>
        ) : (
          agents.map((agent) => (
            <div
              key={agent.id}
              className="p-3 rounded-lg"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                opacity: agent.enabled ? 1 : 0.6,
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {agent.name}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {agent.handler}
                    </span>
                  </div>
                  {agent.description && (
                    <p
                      className="text-xs mt-0.5 truncate"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {agent.description}
                    </p>
                  )}
                  <p
                    className="text-[10px] mt-1 font-mono"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Pattern: {agent.pattern}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => handleToggleEnabled(agent)}
                    className="p-1 rounded transition-colors"
                    title={agent.enabled ? 'Disable' : 'Enable'}
                    style={{
                      color: agent.enabled ? 'var(--accent-success)' : 'var(--text-muted)',
                    }}
                  >
                    {agent.enabled ? (
                      <ToggleRight className="w-5 h-5" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(agent)}
                    className="p-1 rounded transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    title="Edit"
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(agent.id)}
                    className="p-1 rounded transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    title="Delete"
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-error)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
