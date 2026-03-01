import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { ChevronDown, ChevronRight, ChevronLeft, Compass, BookOpen } from 'lucide-react'
import { useCatalogStore } from '@/stores/catalogStore'
import { useRequestStore } from '@/stores/requestStore'
import { API_CATALOG } from '@/lib/apiCatalog'
import { CategoryIcon } from '@/lib/categoryIcons'
import type { ApiEndpoint } from '@/types/catalog'
import type { HttpMethod } from '@/types/api'

type AudienceFilter = 'workspace' | 'account'

export default function PresetSidebar() {
  const {
    expandedCategories,
    toggleCategory,
    setSelectedEndpoint,
  } = useCatalogStore()
  const { setMethod, setPath, setBodyInput } = useRequestStore()
  const [collapsed, setCollapsed] = useState(false)
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>('workspace')
  const [width, setWidth] = useState(260)
  const isResizing = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(260)

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
      const newWidth = startWidth.current + (e.clientX - startX.current)
      setWidth(Math.max(200, Math.min(500, newWidth)))
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

  const filteredCatalog = useMemo(() => {
    return API_CATALOG.filter((cat) => {
      const audience = cat.audience || 'workspace'
      return audience === audienceFilter
    })
  }, [audienceFilter])

  const getCategoryEndpointCount = (cat: typeof API_CATALOG[0]): number => {
    let count = 0
    if (cat.endpoints) count += cat.endpoints.length
    if (cat.subcategories) {
      cat.subcategories.forEach(sub => { count += sub.endpoints.length })
    }
    return count
  }

  const handleEndpointClick = (endpoint: ApiEndpoint) => {
    setMethod(endpoint.method as HttpMethod)
    setPath(endpoint.path)
    if (endpoint.body) {
      setBodyInput(JSON.stringify(endpoint.body, null, 2))
    } else {
      setBodyInput('')
    }
    setSelectedEndpoint(endpoint)
  }

  if (collapsed) {
    return (
      <div className="preset-sidebar collapsed" onClick={() => setCollapsed(false)} title="Expand Preset Calls">
        <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
      </div>
    )
  }

  return (
    <div className="preset-sidebar card" style={{ width }}>
      {/* Resize handle */}
      <div className="resize-handle" onMouseDown={handleMouseDown} />

      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>API Explorer</span>
        </div>
        <button onClick={() => setCollapsed(true)} className="toolbar-btn" style={{ padding: '4px' }} title="Collapse">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-1.5 mb-3" style={{ paddingLeft: '2px' }}>
        <BookOpen className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Preset Calls</span>
      </div>

      {/* Audience filter toggle */}
      <div className="auth-toggle mb-3">
        <button
          className={audienceFilter === 'workspace' ? 'active' : ''}
          onClick={() => setAudienceFilter('workspace')}
          style={audienceFilter === 'workspace' ? { background: 'var(--accent-subtle)', color: 'var(--accent-primary)', fontWeight: 700 } : undefined}
        >
          WORKSPACE APIS
        </button>
        <button
          className={audienceFilter === 'account' ? 'active' : ''}
          onClick={() => setAudienceFilter('account')}
          style={audienceFilter === 'account' ? { background: 'var(--accent-subtle)', color: 'var(--accent-primary)', fontWeight: 700 } : undefined}
        >
          ACCOUNT APIS
        </button>
      </div>

      {/* Category list */}
      <div className="preset-sidebar-list">
        {filteredCatalog.map((category) => {
          const isExpanded = expandedCategories.includes(category.name)
          const count = getCategoryEndpointCount(category)

          return (
            <div key={category.name}>
              <button
                onClick={() => toggleCategory(category.name)}
                className="preset-category-btn"
              >
                <CategoryIcon name={category.icon} className="w-4 h-4 shrink-0" />
                <span className="preset-category-name">
                  {category.name} ({count})
                </span>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-primary)' }} />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                )}
              </button>

              {isExpanded && (
                <div className="preset-endpoints animate-fade-in">
                  {category.subcategories?.map((sub) => (
                    <div key={sub.name}>
                      <div className="section-header" style={{ fontSize: '10px', padding: '4px 12px 4px 24px' }}>
                        {sub.name}
                      </div>
                      {sub.endpoints.map((ep, i) => (
                        <SidebarEndpoint key={`${ep.method}-${ep.path}-${i}`} endpoint={ep} onClick={() => handleEndpointClick(ep)} />
                      ))}
                    </div>
                  ))}
                  {category.endpoints?.map((ep, i) => (
                    <SidebarEndpoint key={`${ep.method}-${ep.path}-${i}`} endpoint={ep} onClick={() => handleEndpointClick(ep)} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SidebarEndpoint({ endpoint, onClick }: { endpoint: ApiEndpoint; onClick: () => void }) {
  return (
    <button onClick={onClick} className="preset-endpoint-btn">
      <span className={`method-badge ${endpoint.method.toLowerCase()}`} style={{ fontSize: '8px', padding: '2px 5px', minWidth: '34px', textAlign: 'center', lineHeight: 1 }}>
        {endpoint.method}
      </span>
      <span className="text-xs truncate" style={{ color: 'var(--text-secondary)', lineHeight: '16px' }}>
        {endpoint.label}
      </span>
    </button>
  )
}
