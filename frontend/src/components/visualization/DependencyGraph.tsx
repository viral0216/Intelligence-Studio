import { useState } from 'react'
import { GitBranch, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface GraphNode {
  id: string
  label: string
  type: 'table' | 'view' | 'job' | 'notebook' | 'model'
  x: number
  y: number
}

interface GraphEdge {
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
}

// Sample data structure for demonstration
const SAMPLE_NODES: GraphNode[] = [
  { id: 'raw_events', label: 'raw_events', type: 'table', x: 50, y: 120 },
  { id: 'raw_users', label: 'raw_users', type: 'table', x: 50, y: 260 },
  { id: 'etl_job', label: 'ETL Pipeline', type: 'job', x: 250, y: 190 },
  { id: 'clean_events', label: 'clean_events', type: 'view', x: 450, y: 120 },
  { id: 'user_profiles', label: 'user_profiles', type: 'view', x: 450, y: 260 },
  { id: 'analytics_notebook', label: 'Analytics', type: 'notebook', x: 650, y: 190 },
  { id: 'ml_model', label: 'Churn Model', type: 'model', x: 850, y: 190 },
]

const SAMPLE_EDGES: GraphEdge[] = [
  { from: 'raw_events', to: 'etl_job', label: 'input' },
  { from: 'raw_users', to: 'etl_job', label: 'input' },
  { from: 'etl_job', to: 'clean_events', label: 'output' },
  { from: 'etl_job', to: 'user_profiles', label: 'output' },
  { from: 'clean_events', to: 'analytics_notebook', label: 'reads' },
  { from: 'user_profiles', to: 'analytics_notebook', label: 'reads' },
  { from: 'analytics_notebook', to: 'ml_model', label: 'trains' },
]

export default function DependencyGraph() {
  const [nodes] = useState<GraphNode[]>(SAMPLE_NODES)
  const [edges] = useState<GraphEdge[]>(SAMPLE_EDGES)
  const [zoom, setZoom] = useState(1)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const handleZoomIn = () => setZoom((z) => Math.min(2, z + 0.2))
  const handleZoomOut = () => setZoom((z) => Math.max(0.4, z - 0.2))
  const handleReset = () => {
    setZoom(1)
    setSelectedNode(null)
  }

  const getNodeCenter = (node: GraphNode) => ({
    x: node.x + 60,
    y: node.y + 20,
  })

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
            Preview
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs px-2" style={{ color: 'var(--text-muted)' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="Reset"
          >
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
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: color }}
            />
            <span className="text-[10px] capitalize" style={{ color: 'var(--text-muted)' }}>
              {type}
            </span>
          </div>
        ))}
      </div>

      {/* Graph canvas */}
      <div className="flex-1 overflow-auto">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 400"
          style={{
            minWidth: `${1000 * zoom}px`,
            minHeight: `${400 * zoom}px`,
          }}
        >
          {/* Edges */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="var(--text-muted)"
              />
            </marker>
          </defs>
          {edges.map((edge) => {
            const fromNode = nodes.find((n) => n.id === edge.from)
            const toNode = nodes.find((n) => n.id === edge.to)
            if (!fromNode || !toNode) return null
            const from = getNodeCenter(fromNode)
            const to = getNodeCenter(toNode)
            const isHighlighted =
              selectedNode === edge.from || selectedNode === edge.to
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isHighlighted ? 'var(--accent-primary)' : 'var(--border-primary)'}
                  strokeWidth={isHighlighted ? 2 : 1}
                  markerEnd="url(#arrowhead)"
                  opacity={selectedNode && !isHighlighted ? 0.2 : 1}
                />
                {edge.label && (
                  <text
                    x={(from.x + to.x) / 2}
                    y={(from.y + to.y) / 2 - 6}
                    fill="var(--text-muted)"
                    fontSize="9"
                    textAnchor="middle"
                    opacity={selectedNode && !isHighlighted ? 0.2 : 0.7}
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            )
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNode === node.id
            const isConnected =
              selectedNode &&
              edges.some(
                (e) =>
                  (e.from === selectedNode && e.to === node.id) ||
                  (e.to === selectedNode && e.from === node.id)
              )
            const dimmed = selectedNode && !isSelected && !isConnected
            return (
              <g
                key={node.id}
                onClick={() =>
                  setSelectedNode(selectedNode === node.id ? null : node.id)
                }
                style={{ cursor: 'pointer' }}
                opacity={dimmed ? 0.25 : 1}
              >
                <rect
                  x={node.x}
                  y={node.y}
                  width="120"
                  height="40"
                  rx="8"
                  fill="var(--bg-card)"
                  stroke={isSelected ? 'var(--accent-primary)' : NODE_COLORS[node.type]}
                  strokeWidth={isSelected ? 2 : 1}
                />
                <circle
                  cx={node.x + 16}
                  cy={node.y + 20}
                  r="5"
                  fill={NODE_COLORS[node.type]}
                />
                <text
                  x={node.x + 28}
                  y={node.y + 24}
                  fill="var(--text-primary)"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  {node.label.length > 12
                    ? `${node.label.slice(0, 12)}...`
                    : node.label}
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
            <div
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor:
                  NODE_COLORS[nodes.find((n) => n.id === selectedNode)?.type || 'table'],
              }}
            />
            <span className="text-xs font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
              {nodes.find((n) => n.id === selectedNode)?.label}
            </span>
            <span
              className="text-[10px] capitalize px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
            >
              {nodes.find((n) => n.id === selectedNode)?.type}
            </span>
            <span className="text-[10px] ml-auto" style={{ color: 'var(--text-muted)' }}>
              {edges.filter((e) => e.to === selectedNode).length} upstream |{' '}
              {edges.filter((e) => e.from === selectedNode).length} downstream
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
