import { useState } from 'react'
import { X, Bot, FileText, FileType, File, Clipboard, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ModelCallMetadata } from '@/types/api'
import { useSettingsStore } from '@/stores/settingsStore'
import { downloadFile } from '@/lib/exportFormats'

interface AiAnalysisPanelProps {
  analysis: string
  metadata: ModelCallMetadata | null
  endpoint: string
  method: string
  status: number
  durationMs: number
  onClose: () => void
}

type ViewMode = 'formatted' | 'raw'

// Approximate cost per token (can be refined per model)
const COST_PER_1K_INPUT = 0.00059
const COST_PER_1K_OUTPUT = 0.00295

export default function AiAnalysisPanel({
  analysis,
  metadata,
  endpoint,
  method,
  status,
  durationMs,
  onClose,
}: AiAnalysisPanelProps) {
  const { dbuRate } = useSettingsStore()
  const [viewMode, setViewMode] = useState<ViewMode>('formatted')
  const [copied, setCopied] = useState(false)

  const promptCost = metadata ? (metadata.promptTokens / 1000) * COST_PER_1K_INPUT : 0
  const completionCost = metadata ? (metadata.completionTokens / 1000) * COST_PER_1K_OUTPUT : 0
  const totalCost = promptCost + completionCost

  const handleExport = (format: 'md' | 'word' | 'pdf') => {
    const content = analysis
    switch (format) {
      case 'md':
        downloadFile(content, 'ai-analysis.md', 'text/markdown')
        break
      case 'word': {
        // Export as HTML that Word can open
        const html = `<html><head><meta charset="utf-8"><title>AI Analysis</title></head><body><h1>AI Analysis</h1><h2>${method} ${endpoint}</h2><p>Status: ${status} | Duration: ${durationMs}ms</p><hr/>${analysis.replace(/\n/g, '<br/>')}</body></html>`
        downloadFile(html, 'ai-analysis.doc', 'application/msword')
        break
      }
      case 'pdf': {
        // Export as printable HTML
        const pdfHtml = `<html><head><meta charset="utf-8"><title>AI Analysis</title><style>body{font-family:system-ui;max-width:800px;margin:40px auto;padding:0 20px;color:#333}h1,h2,h3{color:#0d9488}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}code{background:#f0f0f0;padding:2px 4px;border-radius:3px}</style></head><body><h1>AI Analysis</h1><h2>${method} ${endpoint}</h2><p>Status: ${status} | Duration: ${durationMs}ms</p>${metadata ? `<p>Model: ${metadata.model} | Tokens: ${metadata.totalTokens} | Cost: $${totalCost.toFixed(6)}</p>` : ''}<hr/><pre>${analysis}</pre></body></html>`
        const blob = new Blob([pdfHtml], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const win = window.open(url, '_blank')
        if (win) {
          win.onload = () => {
            win.print()
          }
        }
        URL.revokeObjectURL(url)
        break
      }
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(analysis)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" style={{ color: 'var(--accent-secondary)' }} />
          <h3 className="text-base font-semibold" style={{ color: 'var(--accent-secondary)' }}>AI Analysis</h3>
        </div>
        <button onClick={onClose} className="toolbar-btn" style={{ padding: '4px' }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Endpoint info */}
      <div className="px-5 py-2.5" style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--card-border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--text-muted)' }}>Endpoint: </span>
          <span className="font-mono">{method} {endpoint}</span>
        </p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--text-muted)' }}>Status: </span>
          <span className="font-semibold">{status}</span>
          <span style={{ color: 'var(--text-muted)' }}> | Duration: </span>
          <span className="font-semibold">{durationMs}ms</span>
        </p>
      </div>

      {/* AI Model Details */}
      {metadata && (
        <div className="mx-5 mt-3 p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--card-border)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Bot className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--accent-primary)' }}>AI Model Details</span>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1">
            <MetaRow label="Model" value={metadata.model} />
            <MetaRow label="Temperature" value={String(metadata.temperature)} />
            <MetaRow label="Max Tokens" value={String(metadata.maxTokens)} />
            <MetaRow label="Duration" value={`${metadata.durationMs}ms`} />
            <MetaRow label="Prompt Tokens" value={String(metadata.promptTokens)} />
            <MetaRow label="Completion Tokens" value={String(metadata.completionTokens)} />
            <MetaRow label="Total Tokens" value={String(metadata.totalTokens)} />
            <MetaRow label="" value="" />
            <MetaRow label="Prompt Cost" value={`$${promptCost.toFixed(6)}`} highlight />
            <MetaRow label="Completion Cost" value={`$${completionCost.toFixed(6)}`} highlight />
            <MetaRow label="Total Cost" value={`$${totalCost.toFixed(6)}`} highlight />
          </div>
        </div>
      )}

      {/* View toggle + Export */}
      <div className="flex items-center gap-2 px-5 py-2.5 flex-wrap" style={{ borderBottom: '1px solid var(--card-border)', marginTop: '8px' }}>
        <button
          onClick={() => setViewMode('formatted')}
          className="response-action-btn"
          style={viewMode === 'formatted' ? { background: 'var(--accent-subtle)', color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' } : undefined}
        >
          <FileText className="w-3 h-3" /> Formatted
        </button>
        <button
          onClick={() => setViewMode('raw')}
          className="response-action-btn"
          style={viewMode === 'raw' ? { background: 'var(--accent-subtle)', color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' } : undefined}
        >
          <File className="w-3 h-3" /> Raw MD
        </button>

        <span className="text-xs font-semibold ml-2" style={{ color: 'var(--text-muted)' }}>EXPORT:</span>

        <button onClick={() => handleExport('md')} className="response-action-btn" style={{ color: 'var(--accent-success)' }}>
          <FileText className="w-3 h-3" /> MD
        </button>
        <button onClick={() => handleExport('word')} className="response-action-btn" style={{ color: 'var(--accent-blue)' }}>
          <FileType className="w-3 h-3" /> Word
        </button>
        <button onClick={() => handleExport('pdf')} className="response-action-btn" style={{ color: 'var(--accent-error)' }}>
          <File className="w-3 h-3" /> PDF
        </button>

        <button onClick={handleCopy} className="response-action-btn ml-auto">
          {copied ? <Check className="w-3 h-3" style={{ color: 'var(--accent-success)' }} /> : <Clipboard className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Content */}
      <div className="px-5 py-4 overflow-auto" style={{ maxHeight: '500px' }}>
        {viewMode === 'formatted' ? (
          <div className="markdown-content text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis}</ReactMarkdown>
          </div>
        ) : (
          <pre className="response-pane" style={{ maxHeight: 'none', fontSize: '12px' }}>
            {analysis}
          </pre>
        )}
      </div>
    </div>
  )
}

function MetaRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  if (!label && !value) return <div />
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span style={{ color: 'var(--text-muted)', minWidth: '120px' }}>{label}:</span>
      <span className="font-medium" style={{ color: highlight ? 'var(--accent-warning)' : 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}
