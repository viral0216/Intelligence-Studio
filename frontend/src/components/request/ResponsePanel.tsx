import { useState } from 'react'
import { Copy, Check, BarChart3, Code, Table, FileJson } from 'lucide-react'
import { useRequestStore } from '@/stores/requestStore'
import FormattedResponse from './FormattedResponse'

type ViewMode = 'formatted' | 'raw' | 'table' | 'chart'

export default function ResponsePanel() {
  const { response, error, isLoading } = useRequestStore()
  const [viewMode, setViewMode] = useState<ViewMode>('formatted')
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!response) return
    navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
          <span className="text-sm">Sending request...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(248, 81, 73, 0.1)', border: '1px solid var(--accent-error)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--accent-error)' }}>Error</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="flex-1 flex items-center justify-center p-8" style={{ color: 'var(--text-muted)' }}>
        <div className="text-center">
          <FileJson className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Send a request to see the response</p>
          <p className="text-xs mt-1">Configure your Databricks host and token in Settings</p>
        </div>
      </div>
    )
  }

  const statusColor = response.status < 300 ? 'var(--accent-success)' : response.status < 400 ? 'var(--accent-warning)' : 'var(--accent-error)'

  return (
    <div className="flex flex-col h-full">
      {/* Status bar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold" style={{ color: statusColor }}>
            {response.status}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {response.durationMs}ms
          </span>
          {response.requestId && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              ID: {response.requestId}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* View mode buttons */}
          <ViewButton icon={<Code className="w-3.5 h-3.5" />} label="Formatted" active={viewMode === 'formatted'} onClick={() => setViewMode('formatted')} />
          <ViewButton icon={<FileJson className="w-3.5 h-3.5" />} label="Raw" active={viewMode === 'raw'} onClick={() => setViewMode('raw')} />
          <ViewButton icon={<Table className="w-3.5 h-3.5" />} label="Table" active={viewMode === 'table'} onClick={() => setViewMode('table')} />
          <ViewButton icon={<BarChart3 className="w-3.5 h-3.5" />} label="Chart" active={viewMode === 'chart'} onClick={() => setViewMode('chart')} />

          <div className="w-px h-4 mx-1" style={{ backgroundColor: 'var(--border-primary)' }} />

          <button onClick={handleCopy} className="p-1.5 rounded transition-colors" style={{ color: 'var(--text-muted)' }} title="Copy">
            {copied ? <Check className="w-3.5 h-3.5" style={{ color: 'var(--accent-success)' }} /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Response content */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'formatted' && <FormattedResponse data={response.data} />}
        {viewMode === 'raw' && (
          <pre className="text-xs font-mono whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
            {JSON.stringify(response.data, null, 2)}
          </pre>
        )}
        {viewMode === 'table' && <TableView data={response.data} />}
        {viewMode === 'chart' && (
          <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
            <p className="text-sm">Chart visualization - Coming with Phase 10</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ViewButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="p-1.5 rounded text-xs transition-colors"
      style={{
        backgroundColor: active ? 'var(--bg-hover)' : 'transparent',
        color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
      }}
    >
      {icon}
    </button>
  )
}

function TableView({ data }: { data: unknown }) {
  if (!data || typeof data !== 'object') return <p style={{ color: 'var(--text-muted)' }}>No tabular data</p>

  // Try to find an array in the response
  let rows: Record<string, unknown>[] = []
  if (Array.isArray(data)) {
    rows = data
  } else {
    const obj = data as Record<string, unknown>
    for (const key of Object.keys(obj)) {
      if (Array.isArray(obj[key])) {
        rows = obj[key] as Record<string, unknown>[]
        break
      }
    }
  }

  if (rows.length === 0) return <p style={{ color: 'var(--text-muted)' }}>No tabular data found</p>

  const columns = Object.keys(rows[0] || {})

  return (
    <div className="overflow-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} className="text-left px-3 py-2 font-medium border-b" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 100).map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col} className="px-3 py-1.5 border-b" style={{ borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}>
                  {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 100 && (
        <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
          Showing 100 of {rows.length} rows
        </p>
      )}
    </div>
  )
}
