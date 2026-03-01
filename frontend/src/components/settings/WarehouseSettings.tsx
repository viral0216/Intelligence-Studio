import { useState } from 'react'
import { Database, RefreshCw, Loader2, ChevronDown, CircleDot } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'
import { useAuthStore } from '@/stores/authStore'
import { listWarehouses } from '@/lib/api'

interface Warehouse {
  id: string
  name: string
  state: string
}

export default function WarehouseSettings() {
  const { warehouseId, setWarehouseId } = useSettingsStore()
  const { host, token } = useAuthStore()
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const handleLoadWarehouses = async () => {
    if (!host || !token) {
      setError('Please configure Databricks credentials first.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await listWarehouses(host, token)
      setWarehouses(result.warehouses || [])
      setLoaded(true)
      if ((result.warehouses || []).length === 0) {
        setError('No SQL warehouses found in this workspace.')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load warehouses.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const getStateColor = (state: string): string => {
    switch (state.toUpperCase()) {
      case 'RUNNING':
        return 'var(--accent-success)'
      case 'STOPPED':
      case 'DELETED':
        return 'var(--accent-danger)'
      case 'STARTING':
      case 'STOPPING':
        return 'var(--text-warning, orange)'
      default:
        return 'var(--text-muted)'
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          SQL Warehouse
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Select a SQL warehouse for executing queries. The warehouse must be running to execute queries.
        </p>
      </div>

      {/* Load button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleLoadWarehouses}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {loading ? 'Loading...' : 'Load Warehouses'}
        </button>
        {loaded && !error && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {warehouses.length} warehouse{warehouses.length !== 1 ? 's' : ''} found
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <p
          className="text-sm px-3 py-2 rounded-lg"
          style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--accent-danger)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          {error}
        </p>
      )}

      {/* Warehouse selector (dropdown if loaded, text input otherwise) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Warehouse ID
        </label>
        {warehouses.length > 0 ? (
          <div className="relative">
            <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full pl-10 pr-8 py-2 rounded-lg text-sm outline-none appearance-none cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <option value="">Select a warehouse...</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name} ({wh.id}) - {wh.state}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
            />
          </div>
        ) : (
          <div className="relative">
            <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              placeholder="Enter warehouse ID or load from workspace"
              className="w-full pl-10 pr-3 py-2 rounded-lg text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-primary)')}
            />
          </div>
        )}
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Used for Data QA and SQL query execution features
        </span>
      </div>

      {/* Warehouse list cards */}
      {warehouses.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Available Warehouses
          </label>
          {warehouses.map((wh) => {
            const isSelected = warehouseId === wh.id
            return (
              <button
                key={wh.id}
                onClick={() => setWarehouseId(wh.id)}
                className="flex items-center gap-3 p-3 rounded-lg text-left transition-colors"
                style={{
                  backgroundColor: isSelected ? 'var(--bg-hover)' : 'var(--bg-tertiary)',
                  border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = 'var(--text-muted)'
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-primary)'
                }}
              >
                <CircleDot className="w-4 h-4 shrink-0" style={{ color: getStateColor(wh.state) }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {wh.name}
                  </div>
                  <div className="text-xs font-mono truncate" style={{ color: 'var(--text-muted)' }}>
                    {wh.id}
                  </div>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                  style={{
                    backgroundColor: `${getStateColor(wh.state)}20`,
                    color: getStateColor(wh.state),
                  }}
                >
                  {wh.state}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
