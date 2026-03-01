import { useMemo } from 'react'
import { X, Search, ChevronDown, ChevronRight } from 'lucide-react'
import { useCatalogStore } from '@/stores/catalogStore'
import { useRequestStore } from '@/stores/requestStore'
import { API_CATALOG } from '@/lib/apiCatalog'
import type { ApiEndpoint } from '@/types/catalog'
import type { HttpMethod } from '@/types/api'

const METHOD_COLORS: Record<string, string> = {
  GET: '#7ee787',
  POST: '#58a6ff',
  PUT: '#f0883e',
  PATCH: '#d2a8ff',
  DELETE: '#f85149',
}

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
      // Check subcategories
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

      // Check direct endpoints
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
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        onClick={() => setShowPresetDrawer(false)}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 w-96 flex flex-col shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderLeft: '1px solid var(--border-primary)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            API Catalog
          </span>
          <button
            onClick={() => setShowPresetDrawer(false)}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b flex-shrink-0" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="relative">
            <Search
              className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search endpoints..."
              className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
              }}
            />
          </div>
        </div>

        {/* Catalog list */}
        <div className="flex-1 overflow-y-auto">
          {filteredCatalog.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No endpoints match your search
              </p>
            </div>
          ) : (
            filteredCatalog.map((category) => {
              const isExpanded = expandedCategories.includes(category.name) || searchQuery.trim().length > 0

              return (
                <div key={category.name}>
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-left border-b transition-colors"
                    style={{
                      borderColor: 'var(--border-secondary)',
                      backgroundColor: 'var(--bg-secondary)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    )}
                    <span className="text-sm mr-1">{category.icon}</span>
                    <span
                      className="text-xs font-semibold flex-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {category.name}
                    </span>
                    {category.audience && (
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {category.audience}
                      </span>
                    )}
                  </button>

                  {/* Endpoints */}
                  {isExpanded && (
                    <div>
                      {/* Subcategories */}
                      {category.subcategories?.map((sub) => (
                        <div key={sub.name}>
                          <div
                            className="px-4 py-1.5"
                            style={{ backgroundColor: 'var(--bg-tertiary)' }}
                          >
                            <span
                              className="text-[10px] font-medium uppercase tracking-wider"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {sub.name}
                            </span>
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

                      {/* Direct endpoints */}
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
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full px-4 py-2 text-left transition-colors border-b"
      style={{ borderColor: 'var(--border-secondary)' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <span
        className="text-[10px] font-bold px-1.5 py-0.5 rounded w-12 text-center flex-shrink-0"
        style={{
          backgroundColor: `${METHOD_COLORS[endpoint.method] || '#8b949e'}20`,
          color: METHOD_COLORS[endpoint.method] || '#8b949e',
        }}
      >
        {endpoint.method}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          {endpoint.label}
        </p>
        <p
          className="text-[10px] font-mono truncate"
          style={{ color: 'var(--text-muted)' }}
        >
          {endpoint.path}
        </p>
      </div>
    </button>
  )
}
