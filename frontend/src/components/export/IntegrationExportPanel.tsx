import { useState } from 'react'
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
} from 'lucide-react'
import { useRequestStore } from '@/stores/requestStore'
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
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null)
  const [exportedFormat, setExportedFormat] = useState<ExportFormat | null>(null)
  const [modalFormat, setModalFormat] = useState<ExportFormat | null>(null)

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
            const cols = Object.keys(data[0])
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
          // These require additional libraries; open modal for configuration
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
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <Download className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Export & Integrations
        </span>
      </div>

      {/* Current request info */}
      <div
        className="mx-4 mt-3 p-3 rounded-lg"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
        }}
      >
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Current Request
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: method === 'GET' ? 'var(--method-get)' : method === 'POST' ? 'var(--method-post)' : method === 'PUT' ? 'var(--method-put)' : method === 'DELETE' ? 'var(--method-delete)' : 'var(--method-patch)',
            }}
          >
            {method}
          </span>
          <span
            className="text-xs font-mono truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {path || 'No path configured'}
          </span>
        </div>
        {response && (
          <p className="text-[10px] mt-1" style={{ color: 'var(--accent-success)' }}>
            Response available ({response.status})
          </p>
        )}
      </div>

      {/* Export options */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {categories.map((cat) => (
          <div key={cat.key}>
            <h3
              className="text-xs font-medium mb-2 uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              {cat.label}
            </h3>
            <div className="space-y-1">
              {EXPORT_OPTIONS.filter((o) => o.category === cat.key).map((option) => (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  disabled={exportingFormat === option.format}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)'
                  }}
                >
                  <span style={{ color: 'var(--accent-primary)' }}>{option.icon}</span>
                  <span className="flex-1 text-left">{option.label}</span>
                  {exportingFormat === option.format ? (
                    <Loader2 className="w-3 h-3 animate-spin" style={{ color: 'var(--accent-primary)' }} />
                  ) : exportedFormat === option.format ? (
                    <Check className="w-3 h-3" style={{ color: 'var(--accent-success)' }} />
                  ) : (
                    <Download className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
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
