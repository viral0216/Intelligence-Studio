import { useState } from 'react'
import { GitBranch, Loader2, Play, Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useAiStore } from '@/stores/aiStore'
import { aiGenerateWorkflow } from '@/lib/api'

export default function WorkflowBuilderTab() {
  const { host, token } = useAuthStore()
  const { defaultModel } = useSettingsStore()
  const { isLoading, setLoading, setLastMetadata } = useAiStore()
  const [goal, setGoal] = useState('')
  const [workflow, setWorkflow] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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
      <div className="flex-1 overflow-auto p-4">
        {!workflow && !error && !isLoading && (
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
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-muted)' }}>
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
      </div>
    </div>
  )
}
