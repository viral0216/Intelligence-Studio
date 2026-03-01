import { Star, Trash2, X, Filter, Clock, Play } from 'lucide-react'
import { useHistoryStore } from '@/stores/historyStore'
import { useRequestStore } from '@/stores/requestStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { HttpMethod, HistoryItem } from '@/types/api'

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: '#22c55e',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  PATCH: '#a855f7',
  DELETE: '#ef4444',
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
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Request History
          </h3>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
          >
            {filteredItems.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Favorites filter */}
          <button
            onClick={toggleFavoritesFilter}
            title={showFavoritesOnly ? 'Show all' : 'Show favorites only'}
            className="p-1.5 rounded-md transition-colors"
            style={{
              color: showFavoritesOnly ? 'var(--accent-primary)' : 'var(--text-muted)',
              backgroundColor: showFavoritesOnly ? 'var(--bg-hover)' : 'transparent',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = showFavoritesOnly ? 'var(--bg-hover)' : 'transparent'
            }}
          >
            <Filter className="w-4 h-4" />
          </button>

          {/* Clear all */}
          {items.length > 0 && (
            <button
              onClick={clearHistory}
              title="Clear all history"
              className="p-1.5 rounded-md transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                e.currentTarget.style.color = 'var(--accent-danger)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'var(--text-muted)'
              }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Close panel */}
          <button
            onClick={toggleHistory}
            title="Close history"
            className="p-1.5 rounded-md transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Clock className="w-8 h-8 mb-3" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              {showFavoritesOnly ? 'No favorites yet' : 'No history yet'}
            </p>
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              {showFavoritesOnly
                ? 'Star a request to add it to favorites.'
                : 'Send a request to start building your history.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 px-4 py-2.5 border-b transition-colors group"
                style={{ borderColor: 'var(--border-primary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Method badge */}
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded shrink-0 font-mono"
                  style={{
                    backgroundColor: `${METHOD_COLORS[item.method]}20`,
                    color: METHOD_COLORS[item.method],
                    minWidth: 48,
                    textAlign: 'center',
                  }}
                >
                  {item.method}
                </span>

                {/* Path + timestamp (clickable to replay) */}
                <button
                  onClick={() => handleReplay(item)}
                  className="flex-1 min-w-0 text-left"
                  title={`Replay: ${item.method} ${item.path}`}
                >
                  <div
                    className="text-xs font-mono truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item.name || truncatePath(item.path)}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {formatTimestamp(item.timestamp)}
                  </div>
                </button>

                {/* Action buttons */}
                <div className="flex items-center gap-0.5 shrink-0">
                  {/* Replay */}
                  <button
                    onClick={() => handleReplay(item)}
                    title="Replay request"
                    className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>

                  {/* Favorite toggle */}
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    className="p-1 rounded transition-colors"
                    style={{
                      color: item.isFavorite ? '#f59e0b' : 'var(--text-muted)',
                      opacity: item.isFavorite ? 1 : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (!item.isFavorite) e.currentTarget.style.color = '#f59e0b'
                    }}
                    onMouseLeave={(e) => {
                      if (!item.isFavorite) e.currentTarget.style.color = 'var(--text-muted)'
                    }}
                  >
                    <Star
                      className="w-3.5 h-3.5"
                      fill={item.isFavorite ? '#f59e0b' : 'none'}
                    />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => removeItem(item.id)}
                    title="Delete from history"
                    className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-danger)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
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
        <div
          className="px-4 py-2 border-t text-center shrink-0"
          style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {items.length} total request{items.length !== 1 ? 's' : ''}
            {items.filter((i) => i.isFavorite).length > 0 &&
              ` | ${items.filter((i) => i.isFavorite).length} favorite${items.filter((i) => i.isFavorite).length !== 1 ? 's' : ''}`}
          </span>
        </div>
      )}
    </div>
  )
}
