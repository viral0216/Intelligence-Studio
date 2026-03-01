import { useState } from 'react'
import { X, Download, FileText, FileSpreadsheet, FileType } from 'lucide-react'
import { useRequestStore } from '@/stores/requestStore'

type ExportFormat = string

interface ExportModalProps {
  format: ExportFormat
  onClose: () => void
}

const FORMAT_INFO: Record<string, { label: string; icon: React.ReactNode; description: string }> = {
  pdf: {
    label: 'PDF Report',
    icon: <FileText className="w-5 h-5" />,
    description: 'Export the request and response as a formatted PDF document.',
  },
  excel: {
    label: 'Excel Spreadsheet',
    icon: <FileSpreadsheet className="w-5 h-5" />,
    description: 'Export response data as an Excel spreadsheet with formatted columns.',
  },
  word: {
    label: 'Word Document',
    icon: <FileType className="w-5 h-5" />,
    description: 'Export the request documentation as a Word document.',
  },
}

export default function ExportModal({ format, onClose }: ExportModalProps) {
  const { method, path, bodyInput, response } = useRequestStore()
  const [includeRequest, setIncludeRequest] = useState(true)
  const [includeResponse, setIncludeResponse] = useState(true)
  const [includeHeaders, setIncludeHeaders] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const info = FORMAT_INFO[format] || {
    label: format.toUpperCase(),
    icon: <FileText className="w-5 h-5" />,
    description: `Export as ${format}`,
  }

  const handleDownload = async () => {
    setIsExporting(true)

    try {
      // Build export content as formatted text (these formats would ideally use
      // server-side generation or libraries like jsPDF/exceljs in a production app)
      let content = ''
      const timestamp = new Date().toISOString()

      if (format === 'pdf' || format === 'word') {
        content += `Databricks API Export\n`
        content += `Generated: ${timestamp}\n`
        content += `${'='.repeat(50)}\n\n`

        if (includeRequest) {
          content += `REQUEST\n`
          content += `${'-'.repeat(30)}\n`
          content += `Method: ${method}\n`
          content += `Path: ${path}\n`
          if (bodyInput) {
            content += `\nBody:\n${bodyInput}\n`
          }
          content += `\n`
        }

        if (includeResponse && response) {
          content += `RESPONSE\n`
          content += `${'-'.repeat(30)}\n`
          content += `Status: ${response.status}\n`
          content += `Duration: ${response.durationMs}ms\n`
          if (includeHeaders) {
            content += `\nHeaders:\n${JSON.stringify(response.headers, null, 2)}\n`
          }
          content += `\nData:\n${JSON.stringify(response.data, null, 2)}\n`
        }

        const ext = format === 'pdf' ? 'txt' : 'txt'
        const filename = `api-export-${Date.now()}.${ext}`
        downloadFile(content, filename, 'text/plain')
      } else if (format === 'excel') {
        // Export as TSV (can be opened in Excel)
        const data = extractArrayData(response?.data)
        if (data.length > 0) {
          const cols = Object.keys(data[0] as Record<string, unknown>)
          const rows = [cols.join('\t')]
          data.forEach((row) => {
            const record = row as Record<string, unknown>
            rows.push(cols.map((c) => String(record[c] ?? '')).join('\t'))
          })
          content = rows.join('\n')
        } else {
          content = `Method\tPath\tStatus\tDuration\n${method}\t${path}\t${response?.status || ''}\t${response?.durationMs || ''}ms`
        }
        downloadFile(content, `api-export-${Date.now()}.tsv`, 'text/tab-separated-values')
      }
    } finally {
      setIsExporting(false)
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-full max-w-md rounded-xl shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div className="flex items-center gap-3">
            <span style={{ color: 'var(--accent-primary)' }}>{info.icon}</span>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {info.label}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {info.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="px-5 py-4 space-y-3">
          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Export Options
          </p>

          <label
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={includeRequest}
              onChange={(e) => setIncludeRequest(e.target.checked)}
              className="rounded"
              style={{ accentColor: 'var(--accent-primary)' }}
            />
            <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
              Include request details
            </span>
          </label>

          <label
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={includeResponse}
              onChange={(e) => setIncludeResponse(e.target.checked)}
              className="rounded"
              style={{ accentColor: 'var(--accent-primary)' }}
            />
            <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
              Include response data
            </span>
          </label>

          <label
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={includeHeaders}
              onChange={(e) => setIncludeHeaders(e.target.checked)}
              className="rounded"
              style={{ accentColor: 'var(--accent-primary)' }}
            />
            <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
              Include response headers
            </span>
          </label>

          {/* Preview */}
          <div
            className="mt-3 p-3 rounded-lg"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-secondary)',
            }}
          >
            <p className="text-[10px] uppercase font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              Preview
            </p>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              <p>
                <span style={{ color: 'var(--text-muted)' }}>Method: </span>
                {method}
              </p>
              <p>
                <span style={{ color: 'var(--text-muted)' }}>Path: </span>
                {path}
              </p>
              {response && (
                <p>
                  <span style={{ color: 'var(--text-muted)' }}>Status: </span>
                  {response.status}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-5 py-3 border-t"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <Download className="w-3 h-3" />
            {isExporting ? 'Exporting...' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  )
}

function extractArrayData(data: unknown): unknown[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>
    for (const key of Object.keys(obj)) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[]
    }
  }
  return []
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
