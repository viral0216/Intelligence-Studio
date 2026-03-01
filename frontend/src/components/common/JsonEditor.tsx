import { useState, useCallback, useEffect } from 'react'
import { Wand2, AlertCircle, CheckCircle2 } from 'lucide-react'

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  readOnly?: boolean
}

export default function JsonEditor({
  value,
  onChange,
  placeholder = '{\n  "key": "value"\n}',
  rows = 10,
  readOnly = false,
}: JsonEditorProps) {
  const [parseError, setParseError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)

  const validate = useCallback((text: string) => {
    if (!text.trim()) {
      setParseError(null)
      setIsValid(false)
      return
    }
    try {
      JSON.parse(text)
      setParseError(null)
      setIsValid(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid JSON'
      setParseError(message)
      setIsValid(false)
    }
  }, [])

  useEffect(() => {
    validate(value)
  }, [value, validate])

  const handleChange = (text: string) => {
    onChange(text)
  }

  const handleAutoFormat = () => {
    if (!value.trim()) return
    try {
      const parsed = JSON.parse(value)
      const formatted = JSON.stringify(parsed, null, 2)
      onChange(formatted)
    } catch {
      // Cannot format invalid JSON
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      const end = target.selectionEnd
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      onChange(newValue)
      // Set cursor position after the inserted spaces
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2
      })
    }
  }

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-3 py-1.5 rounded-t-lg border border-b-0"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          borderColor: parseError ? 'var(--accent-error)' : isValid ? 'var(--accent-success)' : 'var(--border-primary)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium uppercase" style={{ color: 'var(--text-muted)' }}>
            JSON
          </span>
          {isValid && (
            <CheckCircle2 className="w-3 h-3" style={{ color: 'var(--accent-success)' }} />
          )}
          {parseError && (
            <AlertCircle className="w-3 h-3" style={{ color: 'var(--accent-error)' }} />
          )}
        </div>
        {!readOnly && (
          <button
            onClick={handleAutoFormat}
            disabled={!value.trim() || !!parseError}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors disabled:opacity-30"
            style={{ color: 'var(--accent-primary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            title="Auto-format JSON"
          >
            <Wand2 className="w-3 h-3" />
            Format
          </button>
        )}
      </div>

      {/* Editor textarea */}
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        readOnly={readOnly}
        spellCheck={false}
        className="w-full px-3 py-2 rounded-b-lg text-xs font-mono outline-none resize-y"
        style={{
          backgroundColor: 'var(--bg-input)',
          color: 'var(--text-primary)',
          border: `1px solid ${parseError ? 'var(--accent-error)' : isValid ? 'var(--accent-success)' : 'var(--border-primary)'}`,
          borderTop: 'none',
          lineHeight: '1.6',
          tabSize: 2,
        }}
      />

      {/* Error message */}
      {parseError && (
        <div className="flex items-start gap-1.5 mt-1.5">
          <AlertCircle
            className="w-3 h-3 flex-shrink-0 mt-0.5"
            style={{ color: 'var(--accent-error)' }}
          />
          <span className="text-[10px]" style={{ color: 'var(--accent-error)' }}>
            {parseError}
          </span>
        </div>
      )}
    </div>
  )
}
