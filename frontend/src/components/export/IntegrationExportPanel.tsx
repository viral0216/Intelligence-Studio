import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Download,
  FileJson,
  FileText,
  FileCode,
  Terminal,
  Github,
  Globe,
  FileSpreadsheet,
  FileType,
  Loader2,
  Check,
  Library,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useRequestStore } from '@/stores/requestStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { exportCatalogToPostman, exportCatalogToOpenAPI, exportCatalogToInsomnia, getCatalogEndpointCount } from '@/lib/catalogExport'
import { downloadFile } from '@/lib/exportFormats'
import ExportModal from './ExportModal'

type ExportFormat =
  | 'postman'
  | 'insomnia'
  | 'github-actions'
  | 'curl'
  | 'pdf'
  | 'excel'
  | 'word'
  | 'csv'
  | 'json'
  | 'markdown'
  | 'openapi'

interface ExportOption {
  format: ExportFormat
  label: string
  icon: React.ReactNode
  category: 'integration' | 'document' | 'data'
}

const EXPORT_OPTIONS: ExportOption[] = [
  { format: 'postman', label: 'Postman Collection', icon: <Globe className="w-4 h-4" />, category: 'integration' },
  { format: 'insomnia', label: 'Insomnia', icon: <Globe className="w-4 h-4" />, category: 'integration' },
  { format: 'github-actions', label: 'GitHub Actions', icon: <Github className="w-4 h-4" />, category: 'integration' },
  { format: 'curl', label: 'cURL Script', icon: <Terminal className="w-4 h-4" />, category: 'integration' },
  { format: 'openapi', label: 'OpenAPI Spec', icon: <FileCode className="w-4 h-4" />, category: 'integration' },
  { format: 'pdf', label: 'PDF Report', icon: <FileText className="w-4 h-4" />, category: 'document' },
  { format: 'word', label: 'Word Document', icon: <FileType className="w-4 h-4" />, category: 'document' },
  { format: 'markdown', label: 'Markdown', icon: <FileCode className="w-4 h-4" />, category: 'document' },
  { format: 'excel', label: 'Excel Spreadsheet', icon: <FileSpreadsheet className="w-4 h-4" />, category: 'data' },
  { format: 'csv', label: 'CSV File', icon: <FileSpreadsheet className="w-4 h-4" />, category: 'data' },
  { format: 'json', label: 'JSON File', icon: <FileJson className="w-4 h-4" />, category: 'data' },
]

function generateCurl(method: string, path: string, body: string): string {
  let curl = `curl -X ${method} \\\n  "\${DATABRICKS_HOST}${path}" \\\n  -H "Authorization: Bearer \${DATABRICKS_TOKEN}" \\\n  -H "Content-Type: application/json"`
  if (body && body.trim()) {
    curl += ` \\\n  -d '${body}'`
  }
  return curl
}

function generatePostmanCollection(method: string, path: string, body: string): string {
  const collection = {
    info: {
      name: 'Databricks API Export',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: [
      {
        name: `${method} ${path}`,
        request: {
          method,
          header: [
            { key: 'Authorization', value: 'Bearer {{token}}' },
            { key: 'Content-Type', value: 'application/json' },
          ],
          url: {
            raw: `{{host}}${path}`,
            host: ['{{host}}'],
            path: path.split('/').filter(Boolean),
          },
          ...(body && body.trim() ? { body: { mode: 'raw', raw: body } } : {}),
        },
      },
    ],
    variable: [
      { key: 'host', value: 'https://your-workspace.databricks.com' },
      { key: 'token', value: '' },
    ],
  }
  return JSON.stringify(collection, null, 2)
}

function generateInsomniaExport(method: string, path: string, body: string): string {
  const resource = {
    _type: 'export',
    __export_format: 4,
    resources: [
      {
        _id: 'req_1',
        _type: 'request',
        name: `${method} ${path}`,
        method,
        url: `{{ base_url }}${path}`,
        headers: [
          { name: 'Authorization', value: 'Bearer {{ token }}' },
          { name: 'Content-Type', value: 'application/json' },
        ],
        body: body && body.trim() ? { mimeType: 'application/json', text: body } : {},
      },
    ],
  }
  return JSON.stringify(resource, null, 2)
}

function generateGitHubActions(method: string, path: string, body: string): string {
  let yaml = `name: Databricks API Call
on:
  workflow_dispatch:

jobs:
  api-call:
    runs-on: ubuntu-latest
    steps:
      - name: Call Databricks API
        run: |
          curl -X ${method} \\
            "\${{ secrets.DATABRICKS_HOST }}${path}" \\
            -H "Authorization: Bearer \${{ secrets.DATABRICKS_TOKEN }}" \\
            -H "Content-Type: application/json"`
  if (body && body.trim()) {
    yaml += ` \\
            -d '${body.replace(/\n/g, '')}'`
  }
  return yaml
}

function generateMarkdown(method: string, path: string, body: string, responseData: unknown): string {
  let md = `# API Request\n\n`
  md += `**Method:** \`${method}\`\n\n`
  md += `**Path:** \`${path}\`\n\n`
  if (body && body.trim()) {
    md += `## Request Body\n\n\`\`\`json\n${body}\n\`\`\`\n\n`
  }
  if (responseData) {
    md += `## Response\n\n\`\`\`json\n${JSON.stringify(responseData, null, 2)}\n\`\`\`\n`
  }
  return md
}

function generateOpenApiSpec(method: string, path: string, body: string): string {
  const spec = {
    openapi: '3.0.0',
    info: { title: 'Databricks API', version: '1.0.0' },
    paths: {
      [path]: {
        [method.toLowerCase()]: {
          summary: `${method} ${path}`,
          security: [{ BearerAuth: [] }],
          ...(body && body.trim()
            ? {
                requestBody: {
                  content: {
                    'application/json': {
                      schema: { type: 'object' },
                      example: JSON.parse(body || '{}'),
                    },
                  },
                },
              }
            : {}),
          responses: {
            '200': { description: 'Successful response' },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        BearerAuth: { type: 'http', scheme: 'bearer' },
      },
    },
  }
  return JSON.stringify(spec, null, 2)
}

export default function IntegrationExportPanel() {
  const { method, path, bodyInput, response } = useRequestStore()
  const { showIntegrationExport, toggleIntegrationExport } = useSettingsStore()
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null)
  const [exportedFormat, setExportedFormat] = useState<ExportFormat | null>(null)
  const [modalFormat, setModalFormat] = useState<ExportFormat | null>(null)
  const [width, setWidth] = useState(320)
  const isResizing = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(320)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isResizing.current = true
    startX.current = e.clientX
    startWidth.current = width
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [width])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      // dragging left increases width, right decreases
      const newWidth = startWidth.current - (e.clientX - startX.current)
      setWidth(Math.max(240, Math.min(600, newWidth)))
    }
    const handleMouseUp = () => {
      if (!isResizing.current) return
      isResizing.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  if (!showIntegrationExport) {
    return (
      <div className="export-panel collapsed" onClick={toggleIntegrationExport} title="Expand Export Panel">
        <ChevronLeft className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
      </div>
    )
  }

  const handleExport = (format: ExportFormat) => {
    setExportingFormat(format)

    let content = ''
    let filename = ''
    let mimeType = 'text/plain'

    try {
      switch (format) {
        case 'curl':
          content = generateCurl(method, path, bodyInput)
          filename = 'request.sh'
          break
        case 'postman':
          content = generatePostmanCollection(method, path, bodyInput)
          filename = 'postman-collection.json'
          mimeType = 'application/json'
          break
        case 'insomnia':
          content = generateInsomniaExport(method, path, bodyInput)
          filename = 'insomnia-export.json'
          mimeType = 'application/json'
          break
        case 'github-actions':
          content = generateGitHubActions(method, path, bodyInput)
          filename = 'databricks-api.yml'
          mimeType = 'text/yaml'
          break
        case 'openapi':
          content = generateOpenApiSpec(method, path, bodyInput)
          filename = 'openapi-spec.json'
          mimeType = 'application/json'
          break
        case 'markdown':
          content = generateMarkdown(method, path, bodyInput, response?.data)
          filename = 'api-request.md'
          break
        case 'json':
          content = JSON.stringify(
            {
              request: { method, path, body: bodyInput ? JSON.parse(bodyInput) : undefined },
              response: response?.data || null,
            },
            null,
            2
          )
          filename = 'api-export.json'
          mimeType = 'application/json'
          break
        case 'csv': {
          const data = extractArrayData(response?.data)
          if (data.length > 0) {
            const cols = Object.keys(data[0] as Record<string, unknown>)
            const csvRows = [cols.join(',')]
            data.forEach((row) => {
              csvRows.push(
                cols.map((c) => {
                  const v = String((row as Record<string, unknown>)[c] ?? '')
                  return v.includes(',') ? `"${v}"` : v
                }).join(',')
              )
            })
            content = csvRows.join('\n')
          } else {
            content = 'No tabular data available'
          }
          filename = 'response-data.csv'
          mimeType = 'text/csv'
          break
        }
        case 'pdf':
        case 'excel':
        case 'word':
          setExportingFormat(null)
          setModalFormat(format)
          return
      }

      if (content) {
        downloadFile(content, filename, mimeType)
        setExportedFormat(format)
        setTimeout(() => setExportedFormat(null), 2000)
      }
    } catch {
      // Silently fail for now
    } finally {
      setExportingFormat(null)
    }
  }

  const categories = [
    { key: 'integration', label: 'Integrations' },
    { key: 'document', label: 'Documents' },
    { key: 'data', label: 'Data Export' },
  ]

  return (
    <div className="export-panel animate-slide-in-right" style={{ width }}>
      {/* Resize handle */}
      <div className="export-panel-resize-handle" onMouseDown={handleMouseDown} />
      {/* Header */}
      <div className="drawer-header">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Export & Integrations
          </span>
        </div>
        <button onClick={toggleIntegrationExport} className="toolbar-btn" style={{ padding: '4px' }} title="Collapse">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Current request info */}
      <div className="card mx-3 mt-3" style={{ borderRadius: '8px', padding: '12px' }}>
        <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Current Request</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`method-badge ${method.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
            {method}
          </span>
          <span className="text-xs font-mono truncate" style={{ color: 'var(--text-primary)' }}>
            {path || 'No path configured'}
          </span>
        </div>
        {response && (
          <p className="text-[10px] mt-1.5" style={{ color: 'var(--accent-success)' }}>
            Response available ({response.status})
          </p>
        )}
      </div>

      {/* Export options */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {categories.map((cat) => (
          <div key={cat.key}>
            <h3 className="section-header">{cat.label}</h3>
            <div className="space-y-1">
              {EXPORT_OPTIONS.filter((o) => o.category === cat.key).map((option) => (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  disabled={exportingFormat === option.format}
                  className="endpoint-item w-full"
                  style={{ padding: '8px 12px' }}
                >
                  <span style={{ color: 'var(--accent-primary)' }}>{option.icon}</span>
                  <span className="flex-1 text-left text-xs" style={{ color: 'var(--text-primary)' }}>{option.label}</span>
                  {exportingFormat === option.format ? (
                    <Loader2 className="w-3 h-3 spin" style={{ color: 'var(--accent-primary)' }} />
                  ) : exportedFormat === option.format ? (
                    <Check className="w-3 h-3" style={{ color: 'var(--accent-success)' }} />
                  ) : (
                    <Download className="w-3 h-3" style={{ color: 'var(--text-dim)' }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Full Catalog Export */}
        <FullCatalogExport />
      </div>

      {/* Export Modal */}
      {modalFormat && (
        <ExportModal
          format={modalFormat}
          onClose={() => setModalFormat(null)}
        />
      )}
    </div>
  )
}

type CatalogExportFormat = 'catalog-postman' | 'catalog-postman-workspace' | 'catalog-postman-account' | 'catalog-openapi' | 'catalog-openapi-workspace' | 'catalog-openapi-account' | 'catalog-insomnia' | 'catalog-insomnia-workspace' | 'catalog-insomnia-account'

type CatalogFilter = 'workspace' | 'account' | undefined

const CATALOG_EXPORT_OPTIONS: { format: CatalogExportFormat; label: string; icon: React.ReactNode; group: string; filter: CatalogFilter }[] = [
  { format: 'catalog-postman', label: 'Postman — All APIs', icon: <Globe className="w-4 h-4" />, group: 'Postman Collection', filter: undefined },
  { format: 'catalog-postman-workspace', label: 'Postman — Workspace APIs', icon: <Globe className="w-4 h-4" />, group: 'Postman Collection', filter: 'workspace' },
  { format: 'catalog-postman-account', label: 'Postman — Account APIs', icon: <Globe className="w-4 h-4" />, group: 'Postman Collection', filter: 'account' },
  { format: 'catalog-openapi', label: 'OpenAPI 3.0 — All APIs', icon: <FileCode className="w-4 h-4" />, group: 'OpenAPI Spec', filter: undefined },
  { format: 'catalog-openapi-workspace', label: 'OpenAPI 3.0 — Workspace', icon: <FileCode className="w-4 h-4" />, group: 'OpenAPI Spec', filter: 'workspace' },
  { format: 'catalog-openapi-account', label: 'OpenAPI 3.0 — Account', icon: <FileCode className="w-4 h-4" />, group: 'OpenAPI Spec', filter: 'account' },
  { format: 'catalog-insomnia', label: 'Insomnia — All APIs', icon: <Globe className="w-4 h-4" />, group: 'Insomnia', filter: undefined },
  { format: 'catalog-insomnia-workspace', label: 'Insomnia — Workspace', icon: <Globe className="w-4 h-4" />, group: 'Insomnia', filter: 'workspace' },
  { format: 'catalog-insomnia-account', label: 'Insomnia — Account', icon: <Globe className="w-4 h-4" />, group: 'Insomnia', filter: 'account' },
]

function useCountsByFilter() {
  return useMemo(() => ({
    all: getCatalogEndpointCount(),
    workspace: getCatalogEndpointCount('workspace'),
    account: getCatalogEndpointCount('account'),
  }), [])
}

function FullCatalogExport() {
  const [exporting, setExporting] = useState<CatalogExportFormat | null>(null)
  const [exported, setExported] = useState<CatalogExportFormat | null>(null)
  const counts = useCountsByFilter()

  const handleCatalogExport = (format: CatalogExportFormat) => {
    setExporting(format)
    try {
      switch (format) {
        case 'catalog-postman': exportCatalogToPostman(); break
        case 'catalog-postman-workspace': exportCatalogToPostman('workspace'); break
        case 'catalog-postman-account': exportCatalogToPostman('account'); break
        case 'catalog-openapi': exportCatalogToOpenAPI(); break
        case 'catalog-openapi-workspace': exportCatalogToOpenAPI('workspace'); break
        case 'catalog-openapi-account': exportCatalogToOpenAPI('account'); break
        case 'catalog-insomnia': exportCatalogToInsomnia(); break
        case 'catalog-insomnia-workspace': exportCatalogToInsomnia('workspace'); break
        case 'catalog-insomnia-account': exportCatalogToInsomnia('account'); break
      }
      setExported(format)
      setTimeout(() => setExported(null), 2000)
    } catch {
      // silently fail
    } finally {
      setExporting(null)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Library className="w-3.5 h-3.5" style={{ color: 'var(--accent-secondary)' }} />
        <h3 className="section-header" style={{ margin: 0 }}>Full API Catalog</h3>
      </div>
      <p className="text-[10px] mb-3" style={{ color: 'var(--text-muted)', paddingLeft: '2px' }}>
        Export all preset endpoints with folders, request bodies, and docs
      </p>
      <div className="space-y-1">
        {CATALOG_EXPORT_OPTIONS.map((option) => {
          const count = option.filter === 'workspace' ? counts.workspace : option.filter === 'account' ? counts.account : counts.all
          return (
            <button
              key={option.format}
              onClick={() => handleCatalogExport(option.format)}
              disabled={exporting === option.format}
              className="endpoint-item w-full"
              style={{ padding: '8px 12px' }}
            >
              <span style={{ color: 'var(--accent-secondary)' }}>{option.icon}</span>
              <span className="flex-1 text-left text-xs" style={{ color: 'var(--text-primary)' }}>{option.label}</span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontWeight: 600, minWidth: '28px', textAlign: 'center' }}
              >
                {count}
              </span>
              {exporting === option.format ? (
                <Loader2 className="w-3 h-3 spin" style={{ color: 'var(--accent-secondary)' }} />
              ) : exported === option.format ? (
                <Check className="w-3 h-3" style={{ color: 'var(--accent-success)' }} />
              ) : (
                <Download className="w-3 h-3" style={{ color: 'var(--text-dim)' }} />
              )}
            </button>
          )
        })}
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

