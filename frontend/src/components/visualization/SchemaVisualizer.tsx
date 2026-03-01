import { Database, Table2 } from 'lucide-react'
import { useQueryStore } from '@/stores/queryStore'

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  STRING: { bg: 'rgba(88, 166, 255, 0.15)', text: '#58a6ff' },
  VARCHAR: { bg: 'rgba(88, 166, 255, 0.15)', text: '#58a6ff' },
  CHAR: { bg: 'rgba(88, 166, 255, 0.15)', text: '#58a6ff' },
  INT: { bg: 'rgba(126, 231, 135, 0.15)', text: '#7ee787' },
  INTEGER: { bg: 'rgba(126, 231, 135, 0.15)', text: '#7ee787' },
  BIGINT: { bg: 'rgba(126, 231, 135, 0.15)', text: '#7ee787' },
  SMALLINT: { bg: 'rgba(126, 231, 135, 0.15)', text: '#7ee787' },
  TINYINT: { bg: 'rgba(126, 231, 135, 0.15)', text: '#7ee787' },
  LONG: { bg: 'rgba(126, 231, 135, 0.15)', text: '#7ee787' },
  SHORT: { bg: 'rgba(126, 231, 135, 0.15)', text: '#7ee787' },
  DOUBLE: { bg: 'rgba(240, 136, 62, 0.15)', text: '#f0883e' },
  FLOAT: { bg: 'rgba(240, 136, 62, 0.15)', text: '#f0883e' },
  DECIMAL: { bg: 'rgba(240, 136, 62, 0.15)', text: '#f0883e' },
  BOOLEAN: { bg: 'rgba(210, 168, 255, 0.15)', text: '#d2a8ff' },
  BOOL: { bg: 'rgba(210, 168, 255, 0.15)', text: '#d2a8ff' },
  TIMESTAMP: { bg: 'rgba(247, 120, 186, 0.15)', text: '#f778ba' },
  DATETIME: { bg: 'rgba(247, 120, 186, 0.15)', text: '#f778ba' },
  DATE: { bg: 'rgba(247, 120, 186, 0.15)', text: '#f778ba' },
  TIME: { bg: 'rgba(247, 120, 186, 0.15)', text: '#f778ba' },
  ARRAY: { bg: 'rgba(121, 192, 255, 0.15)', text: '#79c0ff' },
  STRUCT: { bg: 'rgba(255, 166, 87, 0.15)', text: '#ffa657' },
  MAP: { bg: 'rgba(255, 166, 87, 0.15)', text: '#ffa657' },
  BINARY: { bg: 'rgba(139, 148, 158, 0.15)', text: '#8b949e' },
  BYTE: { bg: 'rgba(139, 148, 158, 0.15)', text: '#8b949e' },
}

function getTypeStyle(type: string): { bg: string; text: string } {
  const upperType = type.toUpperCase()
  for (const [key, style] of Object.entries(TYPE_COLORS)) {
    if (upperType.includes(key)) return style
  }
  return { bg: 'rgba(139, 148, 158, 0.15)', text: '#8b949e' }
}

export default function SchemaVisualizer() {
  const { selectedCatalog, selectedSchema, selectedTable, columns } = useQueryStore()

  const tableName = selectedTable
    ? `${selectedCatalog}.${selectedSchema}.${selectedTable}`
    : null

  if (!tableName || columns.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-full p-8"
        style={{ color: 'var(--text-muted)' }}
      >
        <div className="text-center">
          <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No table schema to display</p>
          <p className="text-xs mt-1">
            Select a table from the Catalog Browser to view its schema
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <Table2 className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Schema Visualizer
        </span>
      </div>

      {/* Schema card */}
      <div className="flex-1 overflow-y-auto p-4">
        <div
          className="rounded-lg overflow-hidden max-w-lg mx-auto"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
          }}
        >
          {/* Table name header */}
          <div
            className="px-4 py-3 border-b"
            style={{
              borderColor: 'var(--border-secondary)',
              backgroundColor: 'var(--bg-tertiary)',
            }}
          >
            <div className="flex items-center gap-2">
              <Table2 className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              <span
                className="text-sm font-semibold font-mono"
                style={{ color: 'var(--text-primary)' }}
              >
                {tableName}
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {columns.length} column{columns.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Column list */}
          <div className="divide-y" style={{ borderColor: 'var(--border-secondary)' }}>
            {columns.map((col, index) => {
              const typeStyle = getTypeStyle(col.type)
              return (
                <div
                  key={col.name}
                  className="flex items-center justify-between px-4 py-2"
                  style={{
                    borderColor: 'var(--border-secondary)',
                    borderTopWidth: index > 0 ? '1px' : '0',
                    borderTopStyle: 'solid',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-mono w-6 text-right"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {index + 1}
                    </span>
                    <span
                      className="text-sm font-mono"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {col.name}
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: typeStyle.bg,
                      color: typeStyle.text,
                    }}
                  >
                    {col.type}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
