import { useState, useCallback } from 'react'
import {
  Copy,
  Check,
  BarChart3,
  Code,
  FileJson,
  Table,
  Terminal,
  Globe,
  ChevronDown,
  ChevronUp,
  Download,
  FileSpreadsheet,
  FileText,
  Sparkles,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react'
import { useRequestStore } from '@/stores/requestStore'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { generateCode, type Language } from '@/lib/codeGenerator'
import { toJSON, toCSV, toMarkdown, downloadFile } from '@/lib/exportFormats'
import { aiAnalyzeResponse, sendRequest } from '@/lib/api'
import { usePagination } from '@/hooks/usePagination'
import type { ModelCallMetadata } from '@/types/api'
import FormattedResponse from './FormattedResponse'
import AiAnalysisPanel from './AiAnalysisPanel'
import PaginationControls from './PaginationControls'
import DataVisualization from '@/components/visualization/DataVisualization'

type ViewMode = 'json' | 'formatted' | 'chart'

const COPY_AS_OPTIONS: Array<{ key: Language | 'node'; label: string; icon: React.ReactNode }> = [
  { key: 'curl', label: 'cURL', icon: <Terminal className="w-3 h-3" /> },
  { key: 'python', label: 'Python', icon: <Code className="w-3 h-3" /> },
  { key: 'node', label: 'Node', icon: <Globe className="w-3 h-3" /> },
  { key: 'go', label: 'Go', icon: <Code className="w-3 h-3" /> },
  { key: 'powershell', label: 'PS', icon: <Terminal className="w-3 h-3" /> },
]

const ITEMS_PER_PAGE = 25

export default function ResponsePanel() {
  const { method, path, bodyInput, response, error, isLoading, setResponse, setLoading, setError } = useRequestStore()
  const { host, token } = useAuthStore()
  const { defaultModel, setDefaultModel } = useSettingsStore()
  const pagination = usePagination()

  const [viewMode, setViewMode] = useState<ViewMode>('formatted')
  const [copied, setCopied] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiResult, setAiResult] = useState<string | null>(null)
  const [aiMetadata, setAiMetadata] = useState<ModelCallMetadata | null>(null)
  const [chartExpanded, setChartExpanded] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)

  // Get array data for pagination
  const getArrayData = useCallback((): unknown[] => {
    if (!response?.data) return []
    if (Array.isArray(response.data)) return response.data
    if (typeof response.data === 'object') {
      const obj = response.data as Record<string, unknown>
      for (const key of Object.keys(obj)) {
        if (Array.isArray(obj[key])) return obj[key] as unknown[]
      }
    }
    return []
  }, [response?.data])

  const arrayData = response ? getArrayData() : []
  const totalItems = arrayData.length
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))

  const handleCopyAs = (lang: Language | 'node') => {
    const actualLang: Language = lang === 'node' ? 'javascript' : lang
    let parsedBody: unknown
    try { parsedBody = bodyInput ? JSON.parse(bodyInput) : undefined } catch { /* skip */ }
    const code = generateCode(actualLang, method, path, host, token, parsedBody)
    navigator.clipboard.writeText(code)
    setCopied(lang)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleExport = (format: 'json' | 'excel' | 'md') => {
    if (!response?.data) return
    switch (format) {
      case 'json':
        downloadFile(toJSON(response.data), 'response.json', 'application/json')
        break
      case 'excel':
        downloadFile(toCSV(response.data), 'response.csv', 'text/csv')
        break
      case 'md':
        downloadFile(toMarkdown(response.data), 'response.md', 'text/markdown')
        break
    }
    setCopied(format)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleAnalyze = async () => {
    if (!response?.data || !host || !token) return
    setAnalyzing(true)
    setAiResult(null)
    setAiMetadata(null)
    try {
      const result = await aiAnalyzeResponse(path, method, response.data, host, token, defaultModel)
      setAiResult(result.analysis || JSON.stringify(result))
      setAiMetadata(result.metadata || null)
    } catch (err: unknown) {
      setAiResult(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleRetry = async () => {
    if (!host || !token || !path) return
    setLoading(true)
    setError(null)
    try {
      let parsedBody: unknown
      if (bodyInput.trim()) {
        try { parsedBody = JSON.parse(bodyInput) } catch { /* skip */ }
      }
      const result = await sendRequest(method, path, parsedBody, host, token)
      setResponse(result)
      setCurrentPage(1)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <div className="loading-spinner" />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Sending request...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card animate-fade-in">
        <div className="error-banner">
          <p className="text-sm font-semibold" style={{ color: 'var(--accent-error)' }}>Error</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="card">
        <div className="empty-state" style={{ padding: '32px 24px' }}>
          <FileJson className="w-12 h-12 empty-state-icon" />
          <p className="text-sm font-medium">Send a request to see the response</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>Configure your Databricks host and token in Settings</p>
        </div>
      </div>
    )
  }

  const statusColor = response.status < 300 ? 'var(--accent-success)' : response.status < 400 ? 'var(--accent-warning)' : 'var(--accent-error)'

  return (
    <>
    <div className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header row: Title + Hide + View toggles */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h2 className="card-title" style={{ margin: 0 }}>Response</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '11px' }}
          >
            {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            {collapsed ? 'Show' : 'Hide'}
          </button>

          <ViewToggle label="Formatted" active={viewMode === 'formatted'} onClick={() => setViewMode('formatted')} />
          <ViewToggle label="JSON" active={viewMode === 'json'} onClick={() => setViewMode('json')} />
          <ViewToggle label="Chart" icon={<BarChart3 className="w-3.5 h-3.5" />} active={viewMode === 'chart'} onClick={() => setViewMode('chart')} />
        </div>
      </div>

      {!collapsed && (
        <>
          {/* COPY AS row */}
          <div className="flex items-center gap-2 px-5 py-1.5">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)', minWidth: '55px' }}>COPY AS:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {COPY_AS_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleCopyAs(opt.key)}
                  className="response-action-btn"
                >
                  {copied === opt.key ? <Check className="w-3 h-3" style={{ color: 'var(--accent-success)' }} /> : opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* EXPORT row */}
          <div className="flex items-center gap-2 px-5 py-1.5">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)', minWidth: '55px' }}>EXPORT:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button onClick={() => handleExport('json')} className="response-action-btn">
                {copied === 'json' ? <Check className="w-3 h-3" style={{ color: 'var(--accent-success)' }} /> : <Download className="w-3 h-3" />}
                <span>JSON</span>
              </button>
              <button onClick={() => handleExport('excel')} className="response-action-btn">
                {copied === 'excel' ? <Check className="w-3 h-3" style={{ color: 'var(--accent-success)' }} /> : <FileSpreadsheet className="w-3 h-3" />}
                <span>Excel</span>
              </button>
              <button onClick={() => handleExport('md')} className="response-action-btn">
                {copied === 'md' ? <Check className="w-3 h-3" style={{ color: 'var(--accent-success)' }} /> : <FileText className="w-3 h-3" />}
                <span>MD</span>
              </button>
              <div className="w-px h-4" style={{ background: 'var(--card-border)' }} />
              <button onClick={handleAnalyze} disabled={analyzing} className="response-action-btn" style={{ color: 'var(--accent-secondary)' }}>
                {analyzing ? <Loader2 className="w-3 h-3 spin" /> : <Sparkles className="w-3 h-3" />}
                <span>Analyze</span>
              </button>
              <button onClick={handleRetry} className="response-action-btn" style={{ color: 'var(--accent-primary)' }}>
                <RotateCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          </div>

          {/* AI MODEL row */}
          <div className="flex items-center gap-2 px-5 py-1.5">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)', minWidth: '55px' }}>AI MODEL:</span>
            <select
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              className="text-xs px-2 py-1 rounded-md"
              style={{
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-secondary)',
                maxWidth: '260px',
              }}
            >
              <option value="databricks-claude-haiku-4-5">databricks-claude-haiku-4-5</option>
              <option value="databricks-meta-llama-3-1-405b-instruct">databricks-meta-llama-3-1-405b-instruct</option>
              <option value="databricks-meta-llama-3-1-70b-instruct">databricks-meta-llama-3-1-70b-instruct</option>
              <option value="databricks-dbrx-instruct">databricks-dbrx-instruct</option>
              <option value="databricks-mixtral-8x7b-instruct">databricks-mixtral-8x7b-instruct</option>
            </select>
          </div>

          {/* AI Analysis result - shown as loading indicator when analyzing */}
          {analyzing && (
            <div className="flex items-center gap-2 px-5 py-3" style={{ borderTop: '1px solid var(--card-border)' }}>
              <Loader2 className="w-4 h-4 spin" style={{ color: 'var(--accent-secondary)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Analyzing response with AI...</span>
            </div>
          )}

          {/* Items loaded message */}
          {totalItems > 0 && (
            <div className="flex items-center gap-2 px-5 py-1.5" style={{ borderTop: '1px solid var(--card-border)' }}>
              <Check className="w-3.5 h-3.5" style={{ color: 'var(--accent-success)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                All items loaded ({totalItems} total)
              </span>
            </div>
          )}

          {/* Pagination row */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            isLoading={pagination.isLoading}
            onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
            onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            onFetchAll={async () => {
              let parsedBody: unknown
              try { parsedBody = bodyInput ? JSON.parse(bodyInput) : undefined } catch { /* skip */ }
              const merged = await pagination.fetchAllPages(method, path, parsedBody)
              if (merged) {
                setResponse({ status: response!.status, data: merged, headers: response!.headers, durationMs: response!.durationMs })
                setCurrentPage(1)
              }
            }}
          />

          {/* Status bar */}
          <div className="flex items-center gap-3 px-5 py-2" style={{ borderTop: '1px solid var(--card-border)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Status:</span>
            <span className="text-xs font-bold" style={{ color: statusColor }}>{response.status}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>·</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{response.durationMs} ms</span>
            {response.requestId && (
              <>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>·</span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>req {response.requestId}</span>
              </>
            )}
          </div>

          {/* View mode tabs */}
          <div className="tab-nav" style={{ paddingLeft: '12px' }}>
            <button className={`tab-btn ${viewMode === 'json' ? 'active' : ''}`} onClick={() => setViewMode('json')}>
              <FileJson className="w-3.5 h-3.5 inline mr-1" /> JSON
            </button>
            <button className={`tab-btn ${viewMode === 'formatted' ? 'active' : ''}`} onClick={() => setViewMode('formatted')}>
              <Table className="w-3.5 h-3.5 inline mr-1" /> Formatted
            </button>
            <button className={`tab-btn ${viewMode === 'chart' ? 'active' : ''}`} onClick={() => setViewMode('chart')}>
              <BarChart3 className="w-3.5 h-3.5 inline mr-1" /> Chart
            </button>
          </div>

          {/* Response content */}
          {viewMode === 'chart' ? (
            <div className="p-4" style={{ height: '450px', position: 'relative', overflow: 'visible' }}>
              <button
                onClick={() => setChartExpanded(true)}
                className="toolbar-btn"
                title="Expand chart"
                style={{ position: 'absolute', top: '4px', right: '4px', zIndex: 5 }}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <DataVisualization />
            </div>
          ) : (
            <div className="p-4 overflow-auto" style={{ maxHeight: '500px' }}>
              {viewMode === 'formatted' && <FormattedResponse data={response.data} />}
              {viewMode === 'json' && (
                <pre className="response-pane" style={{ maxHeight: 'none' }}>
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </>
      )}
    </div>

    {/* AI Analysis Panel - shown below response card */}
    {aiResult && !analyzing && (
      <AiAnalysisPanel
        analysis={aiResult}
        metadata={aiMetadata}
        endpoint={path}
        method={method}
        status={response.status}
        durationMs={response.durationMs}
        onClose={() => { setAiResult(null); setAiMetadata(null) }}
      />
    )}

    {/* Fullscreen chart overlay */}
    {chartExpanded && (
      <>
        <div
          className="fixed inset-0 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setChartExpanded(false)}
        />
        <div
          className="fixed z-50 card animate-fade-in"
          style={{ top: '32px', left: '32px', right: '32px', bottom: '32px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Chart View</span>
            </div>
            <button onClick={() => setChartExpanded(false)} className="toolbar-btn" title="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <DataVisualization />
          </div>
        </div>
      </>
    )}
    </>
  )
}

function ViewToggle({ label, icon, active, onClick }: { label: string; icon?: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-full text-xs font-medium transition-all"
      style={{
        background: active ? 'var(--accent-primary)' : 'transparent',
        color: active ? '#fff' : 'var(--text-muted)',
        border: active ? 'none' : '1px solid var(--border-secondary)',
      }}
    >
      {icon && <span className="mr-1 inline-flex">{icon}</span>}
      {label}
    </button>
  )
}
