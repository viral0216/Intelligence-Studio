import { ExternalLink, Link2, FileText, Tag } from 'lucide-react'
import { useCatalogStore } from '@/stores/catalogStore'
import appIcon from '@/assets/icon.svg'

const METHOD_COLORS: Record<string, string> = {
  GET: 'var(--method-get)',
  POST: 'var(--method-post)',
  PUT: 'var(--method-put)',
  PATCH: 'var(--method-patch)',
  DELETE: 'var(--method-delete)',
}

export default function ApiDocPanel() {
  const { selectedEndpoint } = useCatalogStore()

  if (!selectedEndpoint) {
    return (
      <div
        className="flex items-center justify-center h-full p-8"
        style={{ color: 'var(--text-muted)' }}
      >
        <div className="text-center">
          <img src={appIcon} alt="" className="mx-auto mb-3 opacity-30" style={{ width: 48, height: 48 }} />
          <p className="text-sm">No endpoint selected</p>
          <p className="text-xs mt-1">
            Select an endpoint from the API Catalog to view its documentation
          </p>
        </div>
      </div>
    )
  }

  const { label, method, path, description, docs, queryParams, body } = selectedEndpoint
  const methodColor = METHOD_COLORS[method] || '#8b949e'

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            API Documentation
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded"
            style={{
              backgroundColor: `${methodColor}20`,
              color: methodColor,
            }}
          >
            {method}
          </span>
          <span
            className="text-xs font-mono truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {path}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title & Description */}
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {label}
          </h3>
          {description && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {description}
            </p>
          )}
          {!!docs?.summary && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {docs.summary}
            </p>
          )}
        </div>

        {/* Documentation link */}
        {!!docs?.docUrl && (
          <a
            href={docs.docUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors"
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--accent-primary)',
              border: '1px solid var(--border-primary)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-primary)')}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View official documentation</span>
          </a>
        )}

        {/* Parameters */}
        {!!docs?.parameters && docs.parameters.length > 0 && (
          <div>
            <h4
              className="flex items-center gap-1.5 text-xs font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Tag className="w-3.5 h-3.5" />
              Parameters
            </h4>
            <div
              className="rounded-lg overflow-hidden"
              style={{
                border: '1px solid var(--border-primary)',
              }}
            >
              {docs.parameters.map((param, i) => (
                <div
                  key={param.name}
                  className="flex items-start gap-2 px-3 py-2"
                  style={{
                    borderTopWidth: i > 0 ? '1px' : '0',
                    borderTopStyle: 'solid',
                    borderTopColor: 'var(--border-secondary)',
                    backgroundColor: 'var(--bg-card)',
                  }}
                >
                  <span
                    className="text-xs font-mono font-medium"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    {param.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                    {param.type}
                  </span>
                  {param.required && (
                    <span className="text-[10px]" style={{ color: 'var(--accent-error)' }}>required</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Query Parameters */}
        {!!queryParams && queryParams.length > 0 && (
          <div>
            <h4
              className="flex items-center gap-1.5 text-xs font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              <FileText className="w-3.5 h-3.5" />
              Query Parameters
            </h4>
            <div
              className="rounded-lg overflow-hidden"
              style={{
                border: '1px solid var(--border-primary)',
              }}
            >
              {queryParams.map((param, i) => (
                <div
                  key={param.name}
                  className="px-3 py-2"
                  style={{
                    borderTopWidth: i > 0 ? '1px' : '0',
                    borderTopStyle: 'solid',
                    borderTopColor: 'var(--border-secondary)',
                    backgroundColor: 'var(--bg-card)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-mono font-medium"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {param.name}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {param.type}
                    </span>
                    {param.required && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: 'rgba(248, 81, 73, 0.15)',
                          color: 'var(--accent-error)',
                        }}
                      >
                        required
                      </span>
                    )}
                  </div>
                  {param.description && (
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {param.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request body */}
        {!!body && (
          <div>
            <h4
              className="flex items-center gap-1.5 text-xs font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              <FileText className="w-3.5 h-3.5" />
              Request Body Example
            </h4>
            <pre
              className="px-3 py-2 rounded-lg text-xs font-mono overflow-x-auto"
              style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
              }}
            >
              {JSON.stringify(body, null, 2)}
            </pre>
          </div>
        )}

        {/* Related endpoints */}
        {!!docs?.relatedEndpoints && docs.relatedEndpoints.length > 0 && (
          <div>
            <h4
              className="flex items-center gap-1.5 text-xs font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Link2 className="w-3.5 h-3.5" />
              Related Endpoints
            </h4>
            <div className="space-y-1">
              {docs.relatedEndpoints.map((related) => (
                <div
                  key={related}
                  className="px-3 py-2 rounded-lg text-xs font-mono"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  {related}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
