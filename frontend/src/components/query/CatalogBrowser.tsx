import { useCallback, useEffect, useState } from 'react'
import {
  Database,
  FolderOpen,
  Table2,
  ChevronRight,
  ChevronDown,
  Columns3,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { useQueryStore } from '@/stores/queryStore'
import { useAuthStore } from '@/stores/authStore'
import { sendRequest } from '@/lib/api'

const TYPE_COLORS: Record<string, string> = {
  STRING: '#58a6ff',
  INT: '#7ee787',
  LONG: '#7ee787',
  DOUBLE: '#f0883e',
  FLOAT: '#f0883e',
  DECIMAL: '#f0883e',
  BOOLEAN: '#d2a8ff',
  TIMESTAMP: '#f778ba',
  DATE: '#f778ba',
  ARRAY: '#79c0ff',
  STRUCT: '#ffa657',
  MAP: '#ffa657',
  BINARY: '#8b949e',
}

function getTypeColor(type: string): string {
  const upperType = type.toUpperCase()
  for (const [key, color] of Object.entries(TYPE_COLORS)) {
    if (upperType.includes(key)) return color
  }
  return '#8b949e'
}

export default function CatalogBrowser() {
  const {
    selectedCatalog,
    selectedSchema,
    selectedTable,
    catalogs,
    schemas,
    tables,
    columns,
    setCatalogs,
    setSchemas,
    setTables,
    setColumns,
    setSelectedCatalog,
    setSelectedSchema,
    setSelectedTable,
    setSql,
  } = useQueryStore()
  const { host, token } = useAuthStore()

  const [expandedCatalogs, setExpandedCatalogs] = useState<Set<string>>(new Set())
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(new Set())
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set())
  const [loadingItem, setLoadingItem] = useState<string | null>(null)

  const fetchCatalogs = useCallback(async () => {
    if (!host || !token) return
    setLoadingItem('catalogs')
    try {
      const result = await sendRequest('GET', '/api/2.1/unity-catalog/catalogs', undefined, host, token)
      const data = result.data as { catalogs?: Array<{ name: string }> }
      const catalogNames = (data.catalogs || []).map((c) => c.name)
      setCatalogs(catalogNames)
    } catch {
      setCatalogs([])
    } finally {
      setLoadingItem(null)
    }
  }, [host, token, setCatalogs])

  useEffect(() => {
    fetchCatalogs()
  }, [fetchCatalogs])

  const fetchSchemas = useCallback(
    async (catalog: string) => {
      if (!host || !token) return
      setLoadingItem(`schemas-${catalog}`)
      try {
        const result = await sendRequest(
          'GET',
          `/api/2.1/unity-catalog/schemas?catalog_name=${encodeURIComponent(catalog)}`,
          undefined,
          host,
          token
        )
        const data = result.data as { schemas?: Array<{ name: string }> }
        const schemaNames = (data.schemas || []).map((s) => s.name)
        setSchemas(schemaNames)
      } catch {
        setSchemas([])
      } finally {
        setLoadingItem(null)
      }
    },
    [host, token, setSchemas]
  )

  const fetchTables = useCallback(
    async (catalog: string, schema: string) => {
      if (!host || !token) return
      setLoadingItem(`tables-${catalog}-${schema}`)
      try {
        const result = await sendRequest(
          'GET',
          `/api/2.1/unity-catalog/tables?catalog_name=${encodeURIComponent(catalog)}&schema_name=${encodeURIComponent(schema)}`,
          undefined,
          host,
          token
        )
        const data = result.data as {
          tables?: Array<{ name: string; table_type?: string }>
        }
        const tableList = (data.tables || []).map((t) => ({
          name: t.name,
          type: t.table_type || 'TABLE',
        }))
        setTables(tableList)
      } catch {
        setTables([])
      } finally {
        setLoadingItem(null)
      }
    },
    [host, token, setTables]
  )

  const fetchColumns = useCallback(
    async (catalog: string, schema: string, table: string) => {
      if (!host || !token) return
      setLoadingItem(`columns-${table}`)
      try {
        const fullName = `${catalog}.${schema}.${table}`
        const result = await sendRequest(
          'GET',
          `/api/2.1/unity-catalog/tables/${encodeURIComponent(fullName)}`,
          undefined,
          host,
          token
        )
        const data = result.data as {
          columns?: Array<{ name: string; type_name?: string; type_text?: string }>
        }
        const colList = (data.columns || []).map((c) => ({
          name: c.name,
          type: c.type_name || c.type_text || 'STRING',
        }))
        setColumns(colList)
      } catch {
        setColumns([])
      } finally {
        setLoadingItem(null)
      }
    },
    [host, token, setColumns]
  )

  const handleCatalogClick = (catalog: string) => {
    const next = new Set(expandedCatalogs)
    if (next.has(catalog)) {
      next.delete(catalog)
    } else {
      next.add(catalog)
      setSelectedCatalog(catalog)
      fetchSchemas(catalog)
    }
    setExpandedCatalogs(next)
  }

  const handleSchemaClick = (catalog: string, schema: string) => {
    const key = `${catalog}.${schema}`
    const next = new Set(expandedSchemas)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
      setSelectedSchema(schema)
      fetchTables(catalog, schema)
    }
    setExpandedSchemas(next)
  }

  const handleTableClick = (catalog: string, schema: string, table: string) => {
    const key = `${catalog}.${schema}.${table}`
    const next = new Set(expandedTables)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
      setSelectedTable(table)
      fetchColumns(catalog, schema, table)
    }
    setExpandedTables(next)

    // Populate SQL when clicking a table
    setSql(`SELECT * FROM ${catalog}.${schema}.${table} LIMIT 100`)
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            Catalog Browser
          </span>
        </div>
        <button
          onClick={fetchCatalogs}
          className="p-1 rounded transition-colors"
          style={{ color: 'var(--text-muted)' }}
          title="Refresh catalogs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2 text-xs">
        {loadingItem === 'catalogs' ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent-primary)' }} />
          </div>
        ) : catalogs.length === 0 ? (
          <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
            No catalogs found. Connect to Databricks first.
          </p>
        ) : (
          catalogs.map((catalog) => (
            <div key={catalog}>
              {/* Catalog level */}
              <button
                onClick={() => handleCatalogClick(catalog)}
                className="flex items-center gap-1.5 w-full px-2 py-1 rounded transition-colors"
                style={{
                  color: selectedCatalog === catalog ? 'var(--accent-primary)' : 'var(--text-primary)',
                  backgroundColor: selectedCatalog === catalog ? 'var(--bg-hover)' : 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    selectedCatalog === catalog ? 'var(--bg-hover)' : 'transparent'
                }}
              >
                {expandedCatalogs.has(catalog) ? (
                  <ChevronDown className="w-3 h-3 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 flex-shrink-0" />
                )}
                <Database className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent-secondary)' }} />
                <span className="truncate">{catalog}</span>
                {loadingItem === `schemas-${catalog}` && (
                  <Loader2 className="w-3 h-3 animate-spin ml-auto" style={{ color: 'var(--accent-primary)' }} />
                )}
              </button>

              {/* Schema level */}
              {expandedCatalogs.has(catalog) &&
                schemas.map((schema) => (
                  <div key={`${catalog}.${schema}`} style={{ paddingLeft: '16px' }}>
                    <button
                      onClick={() => handleSchemaClick(catalog, schema)}
                      className="flex items-center gap-1.5 w-full px-2 py-1 rounded transition-colors"
                      style={{
                        color:
                          selectedSchema === schema ? 'var(--accent-primary)' : 'var(--text-primary)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {expandedSchemas.has(`${catalog}.${schema}`) ? (
                        <ChevronDown className="w-3 h-3 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                      )}
                      <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#f0883e' }} />
                      <span className="truncate">{schema}</span>
                      {loadingItem === `tables-${catalog}-${schema}` && (
                        <Loader2 className="w-3 h-3 animate-spin ml-auto" style={{ color: 'var(--accent-primary)' }} />
                      )}
                    </button>

                    {/* Table level */}
                    {expandedSchemas.has(`${catalog}.${schema}`) &&
                      tables.map((table) => (
                        <div key={`${catalog}.${schema}.${table.name}`} style={{ paddingLeft: '16px' }}>
                          <button
                            onClick={() => handleTableClick(catalog, schema, table.name)}
                            className="flex items-center gap-1.5 w-full px-2 py-1 rounded transition-colors"
                            style={{
                              color:
                                selectedTable === table.name
                                  ? 'var(--accent-primary)'
                                  : 'var(--text-primary)',
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = 'transparent')
                            }
                          >
                            {expandedTables.has(`${catalog}.${schema}.${table.name}`) ? (
                              <ChevronDown className="w-3 h-3 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-3 h-3 flex-shrink-0" />
                            )}
                            <Table2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#58a6ff' }} />
                            <span className="truncate">{table.name}</span>
                            <span
                              className="text-[9px] ml-auto px-1 py-0.5 rounded"
                              style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                color: 'var(--text-muted)',
                              }}
                            >
                              {table.type}
                            </span>
                          </button>

                          {/* Column level */}
                          {expandedTables.has(`${catalog}.${schema}.${table.name}`) && (
                            <div style={{ paddingLeft: '16px' }}>
                              {loadingItem === `columns-${table.name}` ? (
                                <div className="flex items-center gap-2 px-2 py-1">
                                  <Loader2
                                    className="w-3 h-3 animate-spin"
                                    style={{ color: 'var(--accent-primary)' }}
                                  />
                                  <span style={{ color: 'var(--text-muted)' }}>Loading columns...</span>
                                </div>
                              ) : columns.length === 0 ? (
                                <span className="px-2 py-1 block" style={{ color: 'var(--text-muted)' }}>
                                  No columns
                                </span>
                              ) : (
                                columns.map((col) => (
                                  <div
                                    key={col.name}
                                    className="flex items-center gap-1.5 px-2 py-0.5"
                                    style={{ color: 'var(--text-secondary)' }}
                                  >
                                    <Columns3 className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                                    <span className="truncate">{col.name}</span>
                                    <span
                                      className="text-[9px] ml-auto px-1.5 py-0.5 rounded-full font-medium"
                                      style={{
                                        backgroundColor: `${getTypeColor(col.type)}20`,
                                        color: getTypeColor(col.type),
                                      }}
                                    >
                                      {col.type}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
