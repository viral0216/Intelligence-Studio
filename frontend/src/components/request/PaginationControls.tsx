import { ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  totalItems: number
  isLoading: boolean
  onPrevious: () => void
  onNext: () => void
  onFetchAll?: () => void
}

export default function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  isLoading,
  onPrevious,
  onNext,
  onFetchAll,
}: PaginationControlsProps) {
  return (
    <div
      className="flex items-center justify-between px-4 py-2 border-t"
      style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-tertiary)' }}
    >
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {totalItems} items | Page {currentPage} of {totalPages}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={onPrevious}
          disabled={currentPage <= 1 || isLoading}
          className="p-1 rounded transition-colors disabled:opacity-30"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={onNext}
          disabled={currentPage >= totalPages || isLoading}
          className="p-1 rounded transition-colors disabled:opacity-30"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {onFetchAll && totalPages > 1 && (
          <button
            onClick={onFetchAll}
            disabled={isLoading}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors disabled:opacity-30"
            style={{ color: 'var(--accent-primary)', backgroundColor: 'var(--bg-input)' }}
          >
            <ChevronsRight className="w-3 h-3" />
            Fetch All
          </button>
        )}
      </div>
    </div>
  )
}
