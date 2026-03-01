import { useState, useCallback } from 'react'
import { GitBranch, ZoomIn, ZoomOut, RotateCcw, Database, Loader2 } from 'lucide-react'
import { useDependencyGraph } from '@/hooks/useDependencyGraph'
import { useQueryStore } from '@/stores/queryStore'
import { useAuthStore } from '@/stores/authStore'
import { sendRequest } from '@/lib/api'

interface VisualNode {
  id: string
  label: string
  type: 'table' | 'view' | 'job' | 'notebook' | 'model' | 'catalog' | 'schema'
  x: number
  y: number
}

interface VisualEdge {
  from: string
  to: string
  label?: string
}

const NODE_COLORS: Record<string, string> = {
  table: '#58a6ff',
  view: '#7ee787',
  job: '#f0883e',
  notebook: '#d2a8ff',
  model: '#f778ba',
  catalog: '#14b8a6',
  schema: '#fbbf24',
}

// Sample data for initial demo
const SAMPLE_NODES: VisualNode[] = [
  { id: 'raw_events', label: 'raw_events', type: 'table', x: 50, y: 120 },
  { id: 'raw_users', label: 'raw_users', type: 'table', x: 50, y: 260 },
  { id: 'etl_job', label: 'ETL Pipeline', type: 'job', x: 250, y: 190 },
  { id: 'clean_events', label: 'clean_events', type: 'view', x: 450, y: 120 },
  { id: 'user_profiles', label: 'user_profiles', type: 'view', x: 450, y: 260 },
  { id: 'analytics_notebook', label: 'Analytics', type: 'notebook', x: 650, y: 190 },
  { id: 'ml_model', label: 'Churn Model', type: 'model', x: 850, y: 190 },
]

const SAMPLE_EDGES: VisualEdge[] = [
  { from: 'raw_events', to: 'etl_job', label: 'input' },
  { from: 'raw_users', to: 'etl_job', label: 'input' },
  { from: 'etl_job', to: 'clean_events', label: 'output' },
  { from: 'etl_job', to: 'user_profiles', label: 'output' },
  { from: 'clean_events', to: 'analytics_notebook', label: 'reads' },
  { from: 'user_profiles', to: 'analytics_notebook', label: 'reads' },
  { from: 'analytics_notebook', to: 'ml_model', label: 'trains' },
]

export default function DependencyGraph() {
  const { host, token } = useAuthStore()
  const { selectedCatalog } = useQueryStore()
  const graph = useDependencyGraph()
  const [visualNodes, setVisualNodes] = useState<VisualNode[]>(SAMPLE_NODES)
  const [visualEdges, setVisualEdges] = useState<VisualEdge[]>(SAMPLE_EDGES)
  const [zoom, setZoom] = useState(1)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<'sample' | 'catalog'>('sample')

  const handleZoomIn = () => setZoom((z) => Math.min(2, z + 0.2))
  const handleZoomOut = () => setZoom((z) => Math.max(0.4, z - 0.2))
  const handleReset = () => {
    setZoom(1)
    setSelectedNode(null)
  }

  const handleLoadFromCatalog = useCallback(async () => {
    if (!host || !token) return
    setLoading(true)
    try {
      // Fetch catalogs
      const catalogResult = await sendRequest('GET', '/api/2.1/unity-catalog/catalogs', undefined, host, token)
      const catalogData = catalogResult.data as { catalogs?: Array<{ name: string }> }
      const catalogs = (catalogData.catalogs || []).map((c) => c.name)

      if (catalogs.length === 0) {
        setLoading(false)
        return
      }

      const targetCatalog = selectedCatalog || catalogs[0]

      // Fetch schemas for the catalog
      const schemaResult = await sendRequest('GET', `/api/2.1/unity-catalog/schemas?catalog_name=${targetCatalog}`, undefined, host, token)
      const schemaData = schemaResult.data as { schemas?: Array<{ name: string }> }
      const schemas = (schemaData.schemas || []).map((s) => s.name)

      // Fetch tables for first schema (to keep it manageable)
      const tables: string[] = []
      if (schemas.length > 0) {
        const tableResult = await sendRequest('GET', `/api/2.1/unity-catalog/tables?catalog_name=${targetCatalog}&schema_name=${schemas[0]}`, undefined, host, token)
        const tableData = tableResult.data as { tables?: Array<{ name: string }> }
        tables.push(...(tableData.tables || []).slice(0, 15).map((t) => t.name))
      }

      // Build graph using the hook
      graph.clear()
      graph.buildFromCatalog(targetCatalog, schemas.slice(0, 5), tables)

      // Build visual nodes manually for layout
      const newNodes: VisualNode[] = []
      const newEdges: VisualEdge[] = []

      // Catalog node
      newNodes.push({ id: targetCatalog, label: targetCatalog, type: 'catalog', x: 50, y: 50 + (schemas.length * 35) / 2 })

      // Schema nodes
      const limitedSchemas = schemas.slice(0, 5)
      limitedSchemas.forEach((schema, i) => {
        const schemaId = `${targetCatalog}.${schema}`
        newNodes.push({ id: schemaId, label: schema, type: 'schema', x: 250, y: 50 + i * 70 })
        newEdges.push({ from: targetCatalog, to: schemaId })
      })

      // Table nodes (under first schema)
      if (limitedSchemas.length > 0) {
        const firstSchemaId = `${targetCatalog}.${limitedSchemas[0]}`
        tables.forEach((table, i) => {
          const tableId = `${firstSchemaId}.${table}`
          newNodes.push({ id: tableId, label: table, type: 'table', x: 450, y: 30 + i * 50 })
          newEdges.push({ from: firstSchemaId, to: tableId })
        })
      }

      if (newNodes.length > 0) {
        setVisualNodes(newNodes)
        setVisualEdges(newEdges)
        setDataSource('catalog')
      }
    } catch {
      // Keep current data on error
    } finally {
      setLoading(false)
    }
  }, [host, token, selectedCatalog, graph])

  const handleShowSample = () => {
    setVisualNodes(SAMPLE_NODES)
    setVisualEdges(SAMPLE_EDGES)
    setDataSource('sample')
    setSelectedNode(null)
  }

  const getNodeCenter = (node: VisualNode) => ({
    x: node.x + 60,
    y: node.y + 20,
  })

  const svgWidth = Math.max(1000, ...visualNodes.map((n) => n.x + 200))
  const svgHeight = Math.max(400, ...visualNodes.map((n) => n.y + 100))

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Dependency Graph
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
          >
            {dataSource === 'sample' ? 'Sample' : 'Live'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleLoadFromCatalog}
            disabled={loading || !host || !token}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors disabled:opacity-30"
            style={{ color: 'var(--accent-primary)', backgroundColor: 'var(--bg-tertiary)' }}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Database className="w-3 h-3" />}
            Load from Catalog
          </button>
          {dataSource === 'catalog' && (
            <button
              onClick={handleShowSample}
              className="px-2 py-1 rounded text-xs transition-colors"
              style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)' }}
            >
              Sample
            </button>
          )}
          <div className="w-px h-4 mx-1" style={{ backgroundColor: 'var(--border-primary)' }} />
          <button onClick={handleZoomOut} className="p-1.5 rounded transition-colors" style={{ color: 'var(--text-muted)' }} title="Zoom out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs px-2" style={{ color: 'var(--text-muted)' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={handleZoomIn} className="p-1.5 rounded transition-colors" style={{ color: 'var(--text-muted)' }} title="Zoom in">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleReset} className="p-1.5 rounded transition-colors" style={{ color: 'var(--text-muted)' }} title="Reset">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div
        className="flex items-center gap-4 px-4 py-2 border-b"
        style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-tertiary)' }}
      >
        {Object.entries(NODE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-[10px] capitalize" style={{ color: 'var(--text-muted)' }}>{type}</span>
          </div>
        ))}
      </div>

      {/* Graph canvas */}
      <div className="flex-1 overflow-auto">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{
            minWidth: `${svgWidth * zoom}px`,
            minHeight: `${svgHeight * zoom}px`,
          }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-muted)" />
            </marker>
          </defs>
          {visualEdges.map((edge) => {
            const fromNode = visualNodes.find((n) => n.id === edge.from)
            const toNode = visualNodes.find((n) => n.id === edge.to)
            if (!fromNode || !toNode) return null
            const from = getNodeCenter(fromNode)
            const to = getNodeCenter(toNode)
            const isHighlighted = selectedNode === edge.from || selectedNode === edge.to
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={isHighlighted ? 'var(--accent-primary)' : 'var(--border-primary)'}
                  strokeWidth={isHighlighted ? 2 : 1}
                  markerEnd="url(#arrowhead)"
                  opacity={selectedNode && !isHighlighted ? 0.2 : 1}
                />
                {edge.label && (
                  <text
                    x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6}
                    fill="var(--text-muted)" fontSize="9" textAnchor="middle"
                    opacity={selectedNode && !isHighlighted ? 0.2 : 0.7}
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            )
          })}

          {visualNodes.map((node) => {
            const isSelected = selectedNode === node.id
            const isConnected = selectedNode && visualEdges.some(
              (e) => (e.from === selectedNode && e.to === node.id) || (e.to === selectedNode && e.from === node.id)
            )
            const dimmed = selectedNode && !isSelected && !isConnected
            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                style={{ cursor: 'pointer' }}
                opacity={dimmed ? 0.25 : 1}
              >
                <rect x={node.x} y={node.y} width="120" height="40" rx="8"
                  fill="var(--bg-card)"
                  stroke={isSelected ? 'var(--accent-primary)' : NODE_COLORS[node.type] || '#8b949e'}
                  strokeWidth={isSelected ? 2 : 1}
                />
                <circle cx={node.x + 16} cy={node.y + 20} r="5" fill={NODE_COLORS[node.type] || '#8b949e'} />
                <text x={node.x + 28} y={node.y + 24} fill="var(--text-primary)" fontSize="11" fontFamily="monospace">
                  {node.label.length > 12 ? `${node.label.slice(0, 12)}...` : node.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Selected node details */}
      {selectedNode && (
        <div
          className="px-4 py-2 border-t"
          style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: NODE_COLORS[visualNodes.find((n) => n.id === selectedNode)?.type || 'table'] }} />
            <span className="text-xs font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
              {visualNodes.find((n) => n.id === selectedNode)?.label}
            </span>
            <span className="text-[10px] capitalize px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
              {visualNodes.find((n) => n.id === selectedNode)?.type}
            </span>
            <span className="text-[10px] ml-auto" style={{ color: 'var(--text-muted)' }}>
              {visualEdges.filter((e) => e.to === selectedNode).length} upstream |{' '}
              {visualEdges.filter((e) => e.from === selectedNode).length} downstream
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
