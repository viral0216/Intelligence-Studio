import { useState } from 'react'
import { GitBranch, Loader2, Play, Copy, Check, Plus, Trash2, StopCircle, RotateCcw, CheckCircle2, XCircle, Clock } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useAiStore } from '@/stores/aiStore'
import { aiGenerateWorkflow } from '@/lib/api'
import { useRequestChain } from '@/hooks/useRequestChain'
import type { HttpMethod } from '@/types/api'

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

export default function WorkflowBuilderTab() {
  const { host, token } = useAuthStore()
  const { defaultModel } = useSettingsStore()
  const { isLoading, setLoading, setLastMetadata } = useAiStore()
  const [goal, setGoal] = useState('')
  const [workflow, setWorkflow] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Request chain
  const chain = useRequestChain()
  const [newMethod, setNewMethod] = useState<HttpMethod>('GET')
  const [newPath, setNewPath] = useState('')

  const handleGenerate = async () => {
    const g = goal.trim()
    if (!g || isLoading) return

    if (!host || !token) {
      setError('Please configure your Databricks host and token in Settings.')
      return
    }

    setError(null)
    setWorkflow(null)
    setLoading(true)

    try {
      const data = await aiGenerateWorkflow(g, host, token, defaultModel)
      setWorkflow(data.workflow)
      if (data.metadata) {
        setLastMetadata(data.metadata)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate workflow'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  const handleCopy = () => {
    if (!workflow) return
    navigator.clipboard.writeText(workflow)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddStep = () => {
    if (!newPath.trim()) return
    chain.addStep({ method: newMethod, path: newPath.trim() })
    setNewPath('')
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-success)' }} />
      case 'failed': return <XCircle className="w-3.5 h-3.5" style={{ color: 'var(--accent-error)' }} />
      case 'running': return <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--accent-primary)' }} />
      default: return <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
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
          Describe your workflow goal
        </label>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Set up a data pipeline that reads from S3, transforms with Delta Live Tables, and loads into Unity Catalog..."
          rows={3}
          className="w-full resize-none rounded-lg px-3 py-2 text-sm outline-none mb-3"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
          }}
        />
        <button
          onClick={handleGenerate}
          disabled={!goal.trim() || isLoading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full justify-center"
          style={{
            backgroundColor: goal.trim() && !isLoading ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
            color: goal.trim() && !isLoading ? '#fff' : 'var(--text-muted)',
          }}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          Generate Workflow
        </button>
      </div>

      {/* Results area */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {!workflow && !error && !isLoading && chain.steps.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-muted)' }}>
            <GitBranch className="w-10 h-10 opacity-30" />
            <p className="text-sm text-center">
              Describe your goal and AI will generate a multi-step
              <br />
              workflow with the right API calls and configurations.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-32 gap-3" style={{ color: 'var(--text-muted)' }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
            <span className="text-sm">Building workflow...</span>
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

        {workflow && (
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <GitBranch className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                Generated Workflow
              </h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
                style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)' }}
                title="Copy workflow"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" style={{ color: 'var(--accent-success)' }} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="prose prose-sm max-w-none" style={{ color: 'var(--text-primary)' }}>
              <ReactMarkdown>{workflow}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Request Chain Builder */}
        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
        >
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3" style={{ color: 'var(--text-primary)' }}>
            <GitBranch className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />
            Request Chain
          </h3>
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            Build a sequence of API calls that execute in order. Later steps can reference values from earlier responses.
          </p>

          {/* Add step form */}
          <div className="flex items-center gap-2 mb-3">
            <select
              value={newMethod}
              onChange={(e) => setNewMethod(e.target.value as HttpMethod)}
              className="px-2 py-1.5 rounded-lg text-xs outline-none"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)', width: '80px' }}
            >
              {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <input
              type="text"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
              placeholder="/api/2.0/..."
              className="flex-1 px-2 py-1.5 rounded-lg text-xs font-mono outline-none"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}
            />
            <button
              onClick={handleAddStep}
              disabled={!newPath.trim()}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-30"
              style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>

          {/* Steps list */}
          {chain.steps.length > 0 && (
            <div className="space-y-2 mb-3">
              {chain.steps.map((step, idx) => (
                <div
                  key={step.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)' }}
                >
                  <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)', minWidth: '16px' }}>{idx + 1}</span>
                  {statusIcon(step.status)}
                  <span className="text-xs font-bold font-mono" style={{ color: 'var(--accent-primary)' }}>{step.method}</span>
                  <span className="text-xs font-mono flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{step.path}</span>
                  {step.response && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-success)' }}>
                      {step.response.status}
                    </span>
                  )}
                  {step.error && (
                    <span className="text-[10px] truncate max-w-[100px]" style={{ color: 'var(--accent-error)' }}>{step.error}</span>
                  )}
                  <button
                    onClick={() => chain.removeStep(step.id)}
                    disabled={chain.isRunning}
                    className="p-1 rounded transition-colors disabled:opacity-30"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Chain actions */}
          {chain.steps.length > 0 && (
            <div className="flex items-center gap-2">
              {!chain.isRunning ? (
                <button
                  onClick={chain.executeChain}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
                >
                  <Play className="w-3 h-3" /> Run Chain
                </button>
              ) : (
                <button
                  onClick={chain.abort}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{ backgroundColor: 'var(--accent-error)', color: '#fff' }}
                >
                  <StopCircle className="w-3 h-3" /> Stop
                </button>
              )}
              <button
                onClick={chain.reset}
                disabled={chain.isRunning}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-30"
                style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)' }}
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
