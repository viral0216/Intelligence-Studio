import { useState, useMemo } from 'react'
import {
  Download,
  FileJson,
  Table2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { useQueryStore } from '@/stores/queryStore'

const PAGE_SIZE = 50

export default function QueryResults() {
  const { results, error } = useQueryStore()
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = useMemo(() => {
    if (!results) return 0
    return Math.max(1, Math.ceil(results.rows.length / PAGE_SIZE))
  }, [results])

  const paginatedRows = useMemo(() => {
    if (!results) return []
    const start = (currentPage - 1) * PAGE_SIZE
    return results.rows.slice(start, start + PAGE_SIZE)
  }, [results, currentPage])

  const handleExportCsv = () => {
    if (!results || results.rows.length === 0) return
    const header = results.columns.join(',')
    const rows = results.rows.map((row) => {
      const record = row as Record<string, unknown>
      return results.columns
        .map((col) => {
          const val = record[col]
          if (val === null || val === undefined) return ''
          const str = String(val)
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str
        })
        .join(',')
    })
    const csv = [header, ...rows].join('\n')
    downloadFile(csv, 'query-results.csv', 'text/csv')
  }

  const handleExportJson = () => {
    if (!results) return
    const json = JSON.stringify(results.rows, null, 2)
    downloadFile(json, 'query-results.json', 'application/json')
  }

  if (error) {
    return (
      <div className="p-4">
        <div
          className="p-4 rounded-lg flex items-start gap-2"
          style={{
            backgroundColor: 'rgba(248, 81, 73, 0.1)',
            border: '1px solid var(--accent-error)',
          }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-error)' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--accent-error)' }}>
              Query Error
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {error}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center p-8" style={{ color: 'var(--text-muted)' }}>
        <div className="text-center">
          <Table2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Execute a query to see results</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {results.rowCount} row{results.rowCount !== 1 ? 's' : ''} returned
          {results.columns.length > 0 && ` | ${results.columns.length} columns`}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            title="Export CSV"
          >
            <Download className="w-3 h-3" />
            CSV
          </button>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            title="Export JSON"
          >
            <FileJson className="w-3 h-3" />
            JSON
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th
                className="text-left px-3 py-2 font-medium border-b sticky top-0"
                style={{
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--bg-tertiary)',
                  width: '40px',
                }}
              >
                #
              </th>
              {results.columns.map((col) => (
                <th
                  key={col}
                  className="text-left px-3 py-2 font-medium border-b sticky top-0"
                  style={{
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-tertiary)',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, i) => {
              const record = row as Record<string, unknown>
              const rowIndex = (currentPage - 1) * PAGE_SIZE + i + 1
              return (
                <tr key={i}>
                  <td
                    className="px-3 py-1.5 border-b"
                    style={{
                      borderColor: 'var(--border-secondary)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {rowIndex}
                  </td>
                  {results.columns.map((col) => (
                    <td
                      key={col}
                      className="px-3 py-1.5 border-b"
                      style={{
                        borderColor: 'var(--border-secondary)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {typeof record[col] === 'object'
                        ? JSON.stringify(record[col])
                        : String(record[col] ?? '')}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between px-4 py-2 border-t"
          style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-tertiary)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded transition-colors disabled:opacity-30"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded transition-colors disabled:opacity-30"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
