import { useState, useMemo } from 'react'
import { BookOpen, Search, ExternalLink, ChevronDown, ChevronRight, FileText } from 'lucide-react'
import { useCatalogStore } from '@/stores/catalogStore'
import { useRequestStore } from '@/stores/requestStore'
import type { ApiEndpoint } from '@/types/catalog'

// Import the catalog data
import { API_CATALOG } from '@/lib/apiCatalog'

interface CatalogCategory {
  name: string
  icon?: string
  subcategories?: Array<{ name: string; endpoints: ApiEndpoint[] }>
  endpoints?: ApiEndpoint[]
}

export default function ApiDocsTab() {
  const { setSelectedEndpoint } = useCatalogStore()
  const { setMethod, setPath, setBodyInput } = useRequestStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [selectedDoc, setSelectedDoc] = useState<ApiEndpoint | null>(null)

  // Access catalog data - handle both array and object-with-categories shapes
  const categories: CatalogCategory[] = useMemo(() => {
    if (Array.isArray(API_CATALOG)) {
      return API_CATALOG as CatalogCategory[]
    }
    if (API_CATALOG && typeof API_CATALOG === 'object' && 'categories' in API_CATALOG) {
      return (API_CATALOG as { categories: CatalogCategory[] }).categories
    }
    return []
  }, [])

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  // Collect all endpoints for search
  const allEndpoints = useMemo(() => {
    const endpoints: Array<{ endpoint: ApiEndpoint; category: string }> = []
    for (const cat of categories) {
      if (cat.endpoints) {
        for (const ep of cat.endpoints) {
          endpoints.push({ endpoint: ep, category: cat.name })
        }
      }
      if (cat.subcategories) {
        for (const sub of cat.subcategories) {
          for (const ep of sub.endpoints) {
            endpoints.push({ endpoint: ep, category: `${cat.name} > ${sub.name}` })
          }
        }
      }
    }
    return endpoints
  }, [categories])

  const filteredEndpoints = useMemo(() => {
    if (!searchTerm.trim()) return null
    const term = searchTerm.toLowerCase()
    return allEndpoints.filter(
      ({ endpoint }) =>
        endpoint.label.toLowerCase().includes(term) ||
        endpoint.path.toLowerCase().includes(term) ||
        (endpoint.description && endpoint.description.toLowerCase().includes(term))
    )
  }, [searchTerm, allEndpoints])

  const handleSelectEndpoint = (ep: ApiEndpoint) => {
    setSelectedDoc(ep)
  }

  const handleUseEndpoint = (ep: ApiEndpoint) => {
    setSelectedEndpoint(ep)
    setMethod(ep.method)
    setPath(ep.path)
    if (ep.body) {
      setBodyInput(JSON.stringify(ep.body, null, 2))
    }
  }

  const methodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'var(--accent-success)'
      case 'POST': return 'var(--accent-primary)'
      case 'PUT': return 'var(--accent-warning)'
      case 'PATCH': return 'var(--accent-warning)'
      case 'DELETE': return 'var(--accent-error)'
      default: return 'var(--text-muted)'
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div
        className="p-3 border-b"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
      >
        <div className="relative">
          <Search className="absolute left-2.5 top-2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search endpoints..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
            }}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Endpoint list */}
        <div
          className="w-64 flex-shrink-0 overflow-auto border-r"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          {filteredEndpoints !== null ? (
            // Search results
            <div className="p-2">
              <p className="text-xs mb-2 px-2" style={{ color: 'var(--text-muted)' }}>
                {filteredEndpoints.length} result{filteredEndpoints.length !== 1 ? 's' : ''}
              </p>
              {filteredEndpoints.map(({ endpoint, category }, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectEndpoint(endpoint)}
                  className="w-full text-left px-2 py-1.5 rounded text-xs transition-colors mb-0.5"
                  style={{
                    backgroundColor: selectedDoc?.path === endpoint.path && selectedDoc?.method === endpoint.method
                      ? 'var(--bg-hover)'
                      : 'transparent',
                    color: 'var(--text-primary)',
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[10px]" style={{ color: methodColor(endpoint.method) }}>
                      {endpoint.method}
                    </span>
                    <span className="truncate">{endpoint.label}</span>
                  </div>
                  <p className="text-[10px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {category}
                  </p>
                </button>
              ))}
              {filteredEndpoints.length === 0 && (
                <p className="text-xs px-2" style={{ color: 'var(--text-muted)' }}>No endpoints match your search.</p>
              )}
            </div>
          ) : (
            // Category tree
            <div className="p-2">
              {categories.map((cat) => (
                <div key={cat.name} className="mb-1">
                  <button
                    onClick={() => toggleCategory(cat.name)}
                    className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {expandedCategories.has(cat.name) ? (
                      <ChevronDown className="w-3 h-3 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    )}
                    <span className="truncate">{cat.name}</span>
                  </button>

                  {expandedCategories.has(cat.name) && (
                    <div className="ml-4">
                      {cat.subcategories?.map((sub) => (
                        <div key={sub.name} className="mb-1">
                          <p className="text-[10px] font-medium px-2 py-1" style={{ color: 'var(--text-muted)' }}>
                            {sub.name}
                          </p>
                          {sub.endpoints.map((ep, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSelectEndpoint(ep)}
                              className="w-full text-left px-2 py-1 rounded text-xs transition-colors"
                              style={{
                                backgroundColor: selectedDoc?.path === ep.path && selectedDoc?.method === ep.method
                                  ? 'var(--bg-hover)'
                                  : 'transparent',
                                color: 'var(--text-primary)',
                              }}
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-[10px]" style={{ color: methodColor(ep.method) }}>
                                  {ep.method}
                                </span>
                                <span className="truncate">{ep.label}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ))}
                      {cat.endpoints?.map((ep, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectEndpoint(ep)}
                          className="w-full text-left px-2 py-1 rounded text-xs transition-colors"
                          style={{
                            backgroundColor: selectedDoc?.path === ep.path && selectedDoc?.method === ep.method
                              ? 'var(--bg-hover)'
                              : 'transparent',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[10px]" style={{ color: methodColor(ep.method) }}>
                              {ep.method}
                            </span>
                            <span className="truncate">{ep.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {categories.length === 0 && (
                <p className="text-xs px-2" style={{ color: 'var(--text-muted)' }}>
                  No catalog data loaded.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Documentation detail */}
        <div className="flex-1 overflow-auto p-4">
          {selectedDoc ? (
            <div className="space-y-4">
              {/* Endpoint header */}
              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-1.5 py-0.5 rounded text-xs font-bold font-mono"
                      style={{ backgroundColor: methodColor(selectedDoc.method), color: '#fff' }}
                    >
                      {selectedDoc.method}
                    </span>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {selectedDoc.label}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleUseEndpoint(selectedDoc)}
                    className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                    style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
                  >
                    Try It
                  </button>
                </div>

                <p
                  className="text-xs font-mono px-2 py-1 rounded"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                >
                  {selectedDoc.path}
                </p>

                {selectedDoc.description && (
                  <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
                    {selectedDoc.description}
                  </p>
                )}
              </div>

              {/* Documentation details */}
              {!!selectedDoc.docs && (
                <div
                  className="rounded-lg p-4"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
                >
                  <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Documentation
                  </h4>

                  {selectedDoc.docs.summary && (
                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                      {selectedDoc.docs.summary}
                    </p>
                  )}

                  {!!selectedDoc.docs.parameters && selectedDoc.docs.parameters.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Parameters</p>
                      <ul className="space-y-1">
                        {selectedDoc.docs.parameters.map((param, idx) => (
                          <li key={idx} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            <code
                              className="px-1 py-0.5 rounded"
                              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-primary)' }}
                            >
                              {param.name}
                            </code>
                            <span className="ml-1" style={{ color: 'var(--text-muted)' }}>({param.type})</span>
                            {param.required && <span className="ml-1" style={{ color: 'var(--accent-error)' }}>*</span>}
                            {param.description && <span className="ml-1">{param.description}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!!selectedDoc.docs.relatedEndpoints && selectedDoc.docs.relatedEndpoints.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Related Endpoints</p>
                      <ul className="space-y-0.5">
                        {selectedDoc.docs.relatedEndpoints.map((rel, idx) => (
                          <li key={idx} className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                            {rel}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedDoc.docs.docUrl && (
                    <a
                      href={selectedDoc.docs.docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs hover:underline"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      <ExternalLink className="w-3 h-3" />
                      View full documentation
                    </a>
                  )}
                </div>
              )}

              {/* Query parameters */}
              {!!selectedDoc.queryParams && selectedDoc.queryParams.length > 0 && (
                <div
                  className="rounded-lg p-4"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
                >
                  <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Query Parameters
                  </h4>
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-left pb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>Name</th>
                        <th className="text-left pb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>Type</th>
                        <th className="text-left pb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>Required</th>
                        <th className="text-left pb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDoc.queryParams.map((param, idx) => (
                        <tr key={idx}>
                          <td className="py-1 font-mono" style={{ color: 'var(--accent-primary)' }}>{param.name}</td>
                          <td className="py-1" style={{ color: 'var(--text-secondary)' }}>{param.type}</td>
                          <td className="py-1">
                            {param.required ? (
                              <span style={{ color: 'var(--accent-error)' }}>yes</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>no</span>
                            )}
                          </td>
                          <td className="py-1" style={{ color: 'var(--text-secondary)' }}>{param.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Request body schema */}
              {!!selectedDoc.body && (
                <div
                  className="rounded-lg p-4"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
                >
                  <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Example Request Body
                  </h4>
                  <pre
                    className="text-xs font-mono p-3 rounded overflow-auto"
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', maxHeight: '200px' }}
                  >
                    {JSON.stringify(selectedDoc.body, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-muted)' }}>
              <BookOpen className="w-10 h-10 opacity-30" />
              <p className="text-sm text-center">
                Browse and search API documentation.
                <br />
                Select an endpoint to view details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
