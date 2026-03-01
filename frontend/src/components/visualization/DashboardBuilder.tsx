import { useState, useCallback } from 'react'
import {
  Plus,
  X,
  GripVertical,
  BarChart3,
  Table2,
  Hash,
  LayoutGrid,
  Settings,
} from 'lucide-react'

type WidgetType = 'chart' | 'table' | 'stats'

interface DashboardWidget {
  id: string
  type: WidgetType
  title: string
  width: 1 | 2
  config: Record<string, unknown>
}

const WIDGET_TYPES: { type: WidgetType; icon: React.ReactNode; label: string }[] = [
  { type: 'chart', icon: <BarChart3 className="w-4 h-4" />, label: 'Chart' },
  { type: 'table', icon: <Table2 className="w-4 h-4" />, label: 'Table' },
  { type: 'stats', icon: <Hash className="w-4 h-4" />, label: 'Stats Card' },
]

export default function DashboardBuilder() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [showAddMenu, setShowAddMenu] = useState(false)

  const addWidget = useCallback(
    (type: WidgetType) => {
      const widget: DashboardWidget = {
        id: `widget-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Widget`,
        width: type === 'stats' ? 1 : 2,
        config: {},
      }
      setWidgets((prev) => [...prev, widget])
      setShowAddMenu(false)
    },
    []
  )

  const removeWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id))
  }, [])

  const updateWidgetTitle = useCallback((id: string, title: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, title } : w))
    )
  }, [])

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Dashboard Builder
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
          >
            {widgets.length} widgets
          </span>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <Plus className="w-3 h-3" />
            Add Widget
          </button>
          {showAddMenu && (
            <div
              className="absolute right-0 top-full mt-1 rounded-lg shadow-lg py-1 z-10"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                minWidth: '160px',
              }}
            >
              {WIDGET_TYPES.map((wt) => (
                <button
                  key={wt.type}
                  onClick={() => addWidget(wt.type)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                >
                  <span style={{ color: 'var(--accent-primary)' }}>{wt.icon}</span>
                  {wt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dashboard grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <LayoutGrid
              className="w-12 h-12 mb-3"
              style={{ color: 'var(--text-muted)', opacity: 0.3 }}
            />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No widgets yet
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Click &quot;Add Widget&quot; to get started
            </p>
          </div>
        ) : (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: 'repeat(2, 1fr)',
            }}
          >
            {widgets.map((widget) => (
              <div
                key={widget.id}
                className="rounded-lg overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  gridColumn: widget.width === 2 ? 'span 2' : 'span 1',
                }}
              >
                {/* Widget header */}
                <div
                  className="flex items-center justify-between px-3 py-2 border-b"
                  style={{ borderColor: 'var(--border-secondary)' }}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical
                      className="w-3.5 h-3.5 cursor-grab"
                      style={{ color: 'var(--text-muted)' }}
                    />
                    <input
                      type="text"
                      value={widget.title}
                      onChange={(e) => updateWidgetTitle(widget.id, e.target.value)}
                      className="text-xs font-medium bg-transparent outline-none"
                      style={{ color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="p-1 rounded transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      title="Configure"
                    >
                      <Settings className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeWidget(widget.id)}
                      className="p-1 rounded transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      title="Remove"
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-error)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Widget body */}
                <div className="p-4" style={{ minHeight: '180px' }}>
                  {widget.type === 'chart' && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <BarChart3
                        className="w-10 h-10 mb-2"
                        style={{ color: 'var(--accent-primary)', opacity: 0.3 }}
                      />
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Configure chart data source
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                        Connect to a query or API response
                      </p>
                    </div>
                  )}
                  {widget.type === 'table' && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Table2
                        className="w-10 h-10 mb-2"
                        style={{ color: 'var(--accent-secondary)', opacity: 0.3 }}
                      />
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Configure table data source
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                        Select columns and sorting
                      </p>
                    </div>
                  )}
                  {widget.type === 'stats' && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="text-center">
                        <p
                          className="text-3xl font-bold"
                          style={{ color: 'var(--accent-primary)' }}
                        >
                          --
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                          Configure metric source
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
