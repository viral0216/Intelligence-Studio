import { Star, Trash2, X, Filter, Clock, Play } from 'lucide-react'
import { useHistoryStore } from '@/stores/historyStore'
import { useRequestStore } from '@/stores/requestStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { HttpMethod, HistoryItem } from '@/types/api'

const METHOD_COLORS: Record<HttpMethod, { bg: string; text: string }> = {
  GET: { bg: 'var(--method-get-bg)', text: 'var(--method-get)' },
  POST: { bg: 'var(--method-post-bg)', text: 'var(--method-post)' },
  PUT: { bg: 'var(--method-put-bg)', text: 'var(--method-put)' },
  PATCH: { bg: 'var(--method-patch-bg)', text: 'var(--method-patch)' },
  DELETE: { bg: 'var(--method-delete-bg)', text: 'var(--method-delete)' },
}

function formatTimestamp(ts: number): string {
  const now = Date.now()
  const diff = now - ts
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString()
}

function truncatePath(path: string, maxLen = 40): string {
  if (path.length <= maxLen) return path
  return path.slice(0, maxLen - 3) + '...'
}

export default function HistoryPanel() {
  const {
    items,
    showFavoritesOnly,
    removeItem,
    toggleFavorite,
    clearHistory,
    toggleFavoritesFilter,
  } = useHistoryStore()

  const { setMethod, setPath, setBodyInput } = useRequestStore()
  const { toggleHistory } = useSettingsStore()

  const filteredItems = showFavoritesOnly
    ? items.filter((item) => item.isFavorite)
    : items

  const handleReplay = (item: HistoryItem) => {
    setMethod(item.method)
    setPath(item.path)
    if (item.body) {
      setBodyInput(typeof item.body === 'string' ? item.body : JSON.stringify(item.body, null, 2))
    } else {
      setBodyInput('')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="drawer-header shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Request History
          </h3>
          <span className="badge" style={{ fontSize: '10px', padding: '1px 6px' }}>
            {filteredItems.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleFavoritesFilter}
            title={showFavoritesOnly ? 'Show all' : 'Show favorites only'}
            className={`toolbar-btn ${showFavoritesOnly ? 'active' : ''}`}
          >
            <Filter className="w-4 h-4" />
          </button>

          {items.length > 0 && (
            <button onClick={clearHistory} title="Clear all history" className="toolbar-btn" style={{ color: 'var(--accent-error)' }}>
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button onClick={toggleHistory} title="Close history" className="toolbar-btn">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px 24px' }}>
            <Clock className="w-10 h-10 empty-state-icon" />
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {showFavoritesOnly ? 'No favorites yet' : 'No history yet'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
              {showFavoritesOnly
                ? 'Star a request to add it to favorites.'
                : 'Send a request to start building your history.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredItems.map((item) => (
              <div key={item.id} className="history-item group" style={{ borderBottom: '1px solid var(--card-border)' }}>
                {/* Method badge */}
                <span
                  className="method-badge shrink-0"
                  style={{
                    backgroundColor: METHOD_COLORS[item.method].bg,
                    color: METHOD_COLORS[item.method].text,
                    fontSize: '10px',
                    padding: '2px 6px',
                    minWidth: '44px',
                    textAlign: 'center',
                  }}
                >
                  {item.method}
                </span>

                {/* Path + timestamp */}
                <button onClick={() => handleReplay(item)} className="flex-1 min-w-0 text-left" title={`Replay: ${item.method} ${item.path}`} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <div className="text-xs font-mono truncate" style={{ color: 'var(--text-primary)' }}>
                    {item.name || truncatePath(item.path)}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
                    {formatTimestamp(item.timestamp)}
                  </div>
                </button>

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button onClick={() => handleReplay(item)} title="Replay" className="toolbar-btn opacity-0 group-hover:opacity-100" style={{ padding: '4px' }}>
                    <Play className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    title={item.isFavorite ? 'Remove from favorites' : 'Favorite'}
                    className="toolbar-btn"
                    style={{ padding: '4px', color: item.isFavorite ? '#f59e0b' : undefined }}
                  >
                    <Star className="w-3.5 h-3.5" fill={item.isFavorite ? '#f59e0b' : 'none'} />
                  </button>
                  <button onClick={() => removeItem(item.id)} title="Delete" className="toolbar-btn opacity-0 group-hover:opacity-100" style={{ padding: '4px', color: 'var(--accent-error)' }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="px-4 py-2 shrink-0 text-center" style={{ borderTop: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.08)' }}>
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
            {items.length} total request{items.length !== 1 ? 's' : ''}
            {items.filter((i) => i.isFavorite).length > 0 &&
              ` | ${items.filter((i) => i.isFavorite).length} favorite${items.filter((i) => i.isFavorite).length !== 1 ? 's' : ''}`}
          </span>
        </div>
      )}
    </div>
  )
}
