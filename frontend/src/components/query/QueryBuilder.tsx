import { useCallback, useEffect, useState } from 'react'
import { Play, Loader2, Database, ChevronDown, CircleDot } from 'lucide-react'
import { useQueryStore } from '@/stores/queryStore'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { executeQuery, listWarehouses } from '@/lib/api'
import CatalogBrowser from './CatalogBrowser'
import QueryResults from './QueryResults'

interface Warehouse {
  id: string
  name: string
  state: string
}

export default function QueryBuilder() {
  const { sql, isExecuting, setSql, setExecuting, setResults, setError } = useQueryStore()
  const { host, token } = useAuthStore()
  const { warehouseId, setWarehouseId } = useSettingsStore()
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loadingWarehouses, setLoadingWarehouses] = useState(false)
  const [showBrowser, setShowBrowser] = useState(true)
  const selectedWarehouse = warehouses.find((w) => w.id === warehouseId) || null

  const fetchWarehouses = useCallback(async () => {
    if (!host || !token) return
    setLoadingWarehouses(true)
    try {
      const result = await listWarehouses(host, token)
      setWarehouses(result.warehouses || [])
      if (!warehouseId && result.warehouses.length > 0) {
        setWarehouseId(result.warehouses[0].id)
      }
    } catch {
      setWarehouses([])
    } finally {
      setLoadingWarehouses(false)
    }
  }, [host, token, warehouseId, setWarehouseId])

  useEffect(() => {
    fetchWarehouses()
  }, [fetchWarehouses])

  const handleExecute = useCallback(async () => {
    if (!sql.trim() || isExecuting) return
    if (!host || !token) {
      setError('Please configure Databricks host and token in Settings')
      return
    }
    if (!warehouseId) {
      setError('Please select a SQL warehouse')
      return
    }

    setExecuting(true)
    setError(null)
    try {
      const result = await executeQuery(sql, warehouseId, host, token)
      const data = result as {
        success?: boolean
        state?: string
        error?: string
        rows?: unknown[]
        columns?: string[]
        row_count?: number
        rowCount?: number
        queryId?: string
        hasMore?: boolean
        manifest?: { schema?: { columns?: Array<{ name: string }> } }
        result?: { data_array?: unknown[][]; row_count?: number }
        statement_id?: string
      }

      // Handle backend error responses (200 status but success: false)
      if (data.success === false) {
        setError(data.error || `Query failed with state: ${data.state || 'UNKNOWN'}`)
        return
      }

      let columns: string[] = data.columns || []
      let rows: Record<string, unknown>[] = []
      let rowCount = data.rowCount || data.row_count || 0

      // Backend returns raw arrays from data_array — convert to objects
      if (data.rows && data.rows.length > 0 && columns.length > 0) {
        if (Array.isArray(data.rows[0])) {
          // Rows are arrays: convert to keyed objects
          rows = (data.rows as unknown[][]).map((arr) => {
            const obj: Record<string, unknown> = {}
            columns.forEach((col, i) => { obj[col] = arr[i] })
            return obj
          })
        } else {
          // Rows are already objects
          rows = data.rows as Record<string, unknown>[]
        }
      }

      // Fallback: raw Databricks response with manifest
      if (rows.length === 0 && data.manifest?.schema?.columns && data.result?.data_array) {
        columns = data.manifest.schema.columns.map((c) => c.name)
        rows = data.result.data_array.map((arr) => {
          const obj: Record<string, unknown> = {}
          columns.forEach((col, i) => { obj[col] = arr[i] })
          return obj
        })
        rowCount = data.result.row_count || rows.length
      }

      setResults({
        rows,
        columns,
        rowCount: rowCount || rows.length,
        queryId: data.queryId || data.statement_id,
        hasMore: data.hasMore || false,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Query execution failed'
      setError(message)
    } finally {
      setExecuting(false)
    }
  }, [sql, isExecuting, host, token, warehouseId, setExecuting, setResults, setError])

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            SQL Query Editor
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Warehouse selector with status */}
          {selectedWarehouse && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide"
              style={{
                backgroundColor: selectedWarehouse.state === 'RUNNING'
                  ? 'rgba(52, 211, 153, 0.12)'
                  : selectedWarehouse.state === 'STARTING' || selectedWarehouse.state === 'STOPPING'
                  ? 'rgba(251, 191, 36, 0.12)'
                  : 'rgba(248, 81, 73, 0.12)',
                color: selectedWarehouse.state === 'RUNNING'
                  ? 'var(--accent-success)'
                  : selectedWarehouse.state === 'STARTING' || selectedWarehouse.state === 'STOPPING'
                  ? 'var(--accent-warning, #fbbf24)'
                  : 'var(--accent-danger, #f85149)',
              }}
            >
              <CircleDot className="w-3 h-3" />
              {selectedWarehouse.state}
            </div>
          )}
          <div className="relative">
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              disabled={loadingWarehouses}
              className="appearance-none px-3 py-1.5 pr-7 rounded-lg text-xs outline-none cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <option value="">Select warehouse...</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.state})
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
            />
          </div>

          {/* Toggle catalog browser */}
          <button
            onClick={() => setShowBrowser(!showBrowser)}
            className="px-2 py-1.5 rounded-lg text-xs transition-colors"
            style={{
              backgroundColor: showBrowser ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: showBrowser ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            Catalog
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Catalog browser sidebar */}
        {showBrowser && (
          <div
            className="w-64 border-r overflow-hidden flex-shrink-0"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <CatalogBrowser />
          </div>
        )}

        {/* Editor + Results */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* SQL Editor */}
          <div
            className="flex-shrink-0 p-4 border-b"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault()
                  handleExecute()
                }
              }}
              placeholder="SELECT * FROM catalog.schema.table LIMIT 100"
              rows={6}
              className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none resize-y"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
              }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Press Ctrl+Enter to execute
              </span>
              <button
                onClick={handleExecute}
                disabled={isExecuting || !sql.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent-primary)' }}
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

          {/* Results */}
          <div className="flex-1 overflow-auto">
            <QueryResults />
          </div>
        </div>
      </div>
    </div>
  )
}
