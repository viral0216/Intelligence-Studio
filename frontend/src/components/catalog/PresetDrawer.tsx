import { useMemo } from 'react'
import { X, Search, ChevronDown, ChevronRight } from 'lucide-react'
import { useCatalogStore } from '@/stores/catalogStore'
import { useRequestStore } from '@/stores/requestStore'
import { API_CATALOG } from '@/lib/apiCatalog'
import { CategoryIcon } from '@/lib/categoryIcons'
import type { ApiEndpoint } from '@/types/catalog'
import type { HttpMethod } from '@/types/api'

export default function PresetDrawer() {
  const {
    showPresetDrawer,
    setShowPresetDrawer,
    searchQuery,
    setSearchQuery,
    expandedCategories,
    toggleCategory,
    setSelectedEndpoint,
  } = useCatalogStore()
  const { setMethod, setPath, setBodyInput } = useRequestStore()

  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return API_CATALOG

    const query = searchQuery.toLowerCase()
    return API_CATALOG.map((category) => {
      if (category.subcategories) {
        const filteredSubs = category.subcategories
          .map((sub) => ({
            ...sub,
            endpoints: sub.endpoints.filter(
              (ep) =>
                ep.label.toLowerCase().includes(query) ||
                ep.path.toLowerCase().includes(query) ||
                ep.description?.toLowerCase().includes(query)
            ),
          }))
          .filter((sub) => sub.endpoints.length > 0)

        if (filteredSubs.length > 0) {
          return { ...category, subcategories: filteredSubs, endpoints: undefined }
        }
      }

      if (category.endpoints) {
        const filteredEndpoints = category.endpoints.filter(
          (ep) =>
            ep.label.toLowerCase().includes(query) ||
            ep.path.toLowerCase().includes(query) ||
            ep.description?.toLowerCase().includes(query)
        )
        if (filteredEndpoints.length > 0) {
          return { ...category, endpoints: filteredEndpoints, subcategories: undefined }
        }
      }

      return null
    }).filter(Boolean) as typeof API_CATALOG
  }, [searchQuery])

  const handleEndpointClick = (endpoint: ApiEndpoint) => {
    setMethod(endpoint.method as HttpMethod)
    setPath(endpoint.path)
    if (endpoint.body) {
      setBodyInput(JSON.stringify(endpoint.body, null, 2))
    } else {
      setBodyInput('')
    }
    setSelectedEndpoint(endpoint)
    setShowPresetDrawer(false)
  }

  if (!showPresetDrawer) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 animate-fade-in"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}
        onClick={() => setShowPresetDrawer(false)}
      />

      {/* Drawer */}
      <div className="drawer" style={{ width: '400px' }}>
        {/* Header */}
        <div className="drawer-header">
          <span className="text-sm font-semibold gradient-text-teal">API Catalog</span>
          <button onClick={() => setShowPresetDrawer(false)} className="toolbar-btn">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 300+ endpoints..."
              className="input"
              style={{ paddingLeft: '36px', fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Catalog list */}
        <div className="flex-1 overflow-y-auto">
          {filteredCatalog.length === 0 ? (
            <div className="empty-state" style={{ padding: '48px 24px' }}>
              <Search className="w-10 h-10 empty-state-icon" />
              <p className="text-sm">No endpoints match your search</p>
            </div>
          ) : (
            filteredCatalog.map((category) => {
              const isExpanded = expandedCategories.includes(category.name) || searchQuery.trim().length > 0

              return (
                <div key={category.name}>
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-left hoverable"
                    style={{ borderBottom: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.05)' }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    )}
                    <CategoryIcon name={category.icon} className="w-3.5 h-3.5 shrink-0 mr-1" />
                    <span className="text-xs font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>
                      {category.name}
                    </span>
                    {category.audience && (
                      <span className="badge" style={{ fontSize: '9px', padding: '1px 6px' }}>
                        {category.audience}
                      </span>
                    )}
                  </button>

                  {/* Endpoints */}
                  {isExpanded && (
                    <div>
                      {category.subcategories?.map((sub) => (
                        <div key={sub.name}>
                          <div className="section-header" style={{ background: 'var(--code-bg)' }}>
                            {sub.name}
                          </div>
                          {sub.endpoints.map((endpoint) => (
                            <EndpointItem
                              key={`${endpoint.method}-${endpoint.path}`}
                              endpoint={endpoint}
                              onClick={() => handleEndpointClick(endpoint)}
                            />
                          ))}
                        </div>
                      ))}

                      {category.endpoints?.map((endpoint) => (
                        <EndpointItem
                          key={`${endpoint.method}-${endpoint.path}`}
                          endpoint={endpoint}
                          onClick={() => handleEndpointClick(endpoint)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}

function EndpointItem({
  endpoint,
  onClick,
}: {
  endpoint: ApiEndpoint
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="endpoint-item w-full" style={{ borderBottom: '1px solid var(--card-border)', borderRadius: 0 }}>
      <span className={`method-badge ${endpoint.method.toLowerCase()}`} style={{ fontSize: '9px', padding: '2px 6px', minWidth: '44px', textAlign: 'center' }}>
        {endpoint.method}
      </span>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          {endpoint.label}
        </p>
        <p className="text-[10px] font-mono truncate" style={{ color: 'var(--text-dim)' }}>
          {endpoint.path}
        </p>
      </div>
    </button>
  )
}
