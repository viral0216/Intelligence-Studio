import { useState, useCallback } from 'react'
import {
  Wand2,
  Play,
  Eye,
  Loader2,
  Terminal,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  ChevronDown,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { aiGenerateScript, aiExecuteScript } from '@/lib/api'
import CodeBlock from '@/components/common/CodeBlock'

type ScriptCategory = 'cluster' | 'job' | 'data' | 'user'

const CATEGORIES: { value: ScriptCategory; label: string; description: string }[] = [
  { value: 'cluster', label: 'Cluster Management', description: 'Create, resize, restart, and manage compute clusters' },
  { value: 'job', label: 'Job Automation', description: 'Schedule, trigger, and monitor workflow jobs' },
  { value: 'data', label: 'Data Management', description: 'Catalog operations, table management, data quality' },
  { value: 'user', label: 'User Management', description: 'Users, groups, permissions, and access control' },
]

interface ExecutionResult {
  success: boolean
  logs: string[]
  output: string
  error?: string
  durationMs: number
}

export default function AIScriptingPanel() {
  const { host, token } = useAuthStore()

  const [prompt, setPrompt] = useState('')
  const [category, setCategory] = useState<ScriptCategory>('cluster')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [generatedScript, setGeneratedScript] = useState('')
  const [scriptLanguage, setScriptLanguage] = useState('python')
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return
    if (!host || !token) {
      setError('Please configure Databricks host and token in Settings')
      return
    }

    setIsGenerating(true)
    setError(null)
    setExecutionResult(null)

    try {
      const result = await aiGenerateScript(prompt, host, token, undefined, category)
      setGeneratedScript(result.script || '')
      setScriptLanguage(result.language || 'python')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate script')
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, host, token, category])

  const handleExecute = useCallback(
    async (dryRun: boolean) => {
      if (!generatedScript.trim()) return
      if (!host || !token) {
        setError('Please configure Databricks host and token in Settings')
        return
      }

      setIsExecuting(true)
      setError(null)

      try {
        const result = await aiExecuteScript(generatedScript, host, token, dryRun)
        setExecutionResult(result)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Script execution failed')
      } finally {
        setIsExecuting(false)
      }
    },
    [generatedScript, host, token]
  )

  const handleCopyScript = () => {
    navigator.clipboard.writeText(generatedScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <Wand2 className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          AI Script Generator
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Prompt input */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            What would you like to automate?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Create a script to resize all running clusters to min workers, then list their status..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-y"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
            }}
          />
        </div>

        {/* Category selector */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Category
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ScriptCategory)}
              className="w-full appearance-none px-3 py-2 pr-8 rounded-lg text-sm outline-none cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
              }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {CATEGORIES.find((c) => c.value === category)?.description}
          </p>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 w-full justify-center"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
          {isGenerating ? 'Generating...' : 'Generate Script'}
        </button>

        {/* Error display */}
        {error && (
          <div
            className="p-3 rounded-lg flex items-start gap-2"
            style={{
              backgroundColor: 'rgba(248, 81, 73, 0.1)',
              border: '1px solid var(--accent-error)',
            }}
          >
            <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-error)' }} />
            <span className="text-xs" style={{ color: 'var(--accent-error)' }}>
              {error}
            </span>
          </div>
        )}

        {/* Generated script */}
        {generatedScript && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Generated Script
              </label>
              <button
                onClick={handleCopyScript}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors"
                style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)' }}
              >
                {copied ? (
                  <Check className="w-3 h-3" style={{ color: 'var(--accent-success)' }} />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <CodeBlock code={generatedScript} language={scriptLanguage} />

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => handleExecute(true)}
                disabled={isExecuting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                {isExecuting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                Dry Run
              </button>
              <button
                onClick={() => handleExecute(false)}
                disabled={isExecuting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent-success)' }}
              >
                {isExecuting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                Execute
              </button>
            </div>
          </div>
        )}

        {/* Execution results */}
        {executionResult && (
          <div
            className="rounded-lg overflow-hidden"
            style={{
              border: `1px solid ${executionResult.success ? 'var(--accent-success)' : 'var(--accent-error)'}`,
            }}
          >
            {/* Result header */}
            <div
              className="flex items-center justify-between px-3 py-2"
              style={{
                backgroundColor: executionResult.success
                  ? 'rgba(126, 231, 135, 0.1)'
                  : 'rgba(248, 81, 73, 0.1)',
              }}
            >
              <div className="flex items-center gap-2">
                {executionResult.success ? (
                  <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--accent-success)' }} />
                ) : (
                  <XCircle className="w-4 h-4" style={{ color: 'var(--accent-error)' }} />
                )}
                <span
                  className="text-xs font-medium"
                  style={{
                    color: executionResult.success ? 'var(--accent-success)' : 'var(--accent-error)',
                  }}
                >
                  {executionResult.success ? 'Execution Successful' : 'Execution Failed'}
                </span>
              </div>
              <span
                className="flex items-center gap-1 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                <Clock className="w-3 h-3" />
                {executionResult.durationMs}ms
              </span>
            </div>

            {/* Logs */}
            {executionResult.logs.length > 0 && (
              <div
                className="px-3 py-2 border-t"
                style={{ borderColor: 'var(--border-secondary)' }}
              >
                <p
                  className="text-[10px] uppercase font-medium mb-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Execution Logs
                </p>
                <div
                  className="rounded p-2 max-h-40 overflow-y-auto font-mono text-xs"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {executionResult.logs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span style={{ color: 'var(--text-muted)' }}>{`[${i + 1}]`}</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Output */}
            {executionResult.output && (
              <div
                className="px-3 py-2 border-t"
                style={{ borderColor: 'var(--border-secondary)' }}
              >
                <p
                  className="text-[10px] uppercase font-medium mb-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Output
                </p>
                <pre
                  className="rounded p-2 text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {executionResult.output}
                </pre>
              </div>
            )}

            {/* Error */}
            {executionResult.error && (
              <div
                className="px-3 py-2 border-t"
                style={{ borderColor: 'var(--border-secondary)' }}
              >
                <p
                  className="text-[10px] uppercase font-medium mb-1"
                  style={{ color: 'var(--accent-error)' }}
                >
                  Error
                </p>
                <pre
                  className="rounded p-2 text-xs font-mono whitespace-pre-wrap"
                  style={{
                    backgroundColor: 'rgba(248, 81, 73, 0.05)',
                    color: 'var(--accent-error)',
                  }}
                >
                  {executionResult.error}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
