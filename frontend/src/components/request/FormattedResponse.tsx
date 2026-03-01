import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'

interface FormattedResponseProps {
  data: unknown
}

export default function FormattedResponse({ data }: FormattedResponseProps) {
  return (
    <div className="font-mono text-xs">
      <JsonNode value={data} depth={0} />
    </div>
  )
}

function JsonNode({ value, depth, keyName }: { value: unknown; depth: number; keyName?: string }) {
  const [collapsed, setCollapsed] = useState(depth > 2)

  if (value === null) {
    return (
      <span>
        {keyName && <span style={{ color: 'var(--json-key)' }}>"{keyName}"</span>}
        {keyName && ': '}
        <span style={{ color: 'var(--json-null)' }}>null</span>
      </span>
    )
  }

  if (typeof value === 'boolean') {
    return (
      <span>
        {keyName && <span style={{ color: 'var(--json-key)' }}>"{keyName}"</span>}
        {keyName && ': '}
        <span style={{ color: 'var(--json-boolean)' }}>{String(value)}</span>
      </span>
    )
  }

  if (typeof value === 'number') {
    return (
      <span>
        {keyName && <span style={{ color: 'var(--json-key)' }}>"{keyName}"</span>}
        {keyName && ': '}
        <span style={{ color: 'var(--json-number)' }}>{value}</span>
      </span>
    )
  }

  if (typeof value === 'string') {
    return (
      <span>
        {keyName && <span style={{ color: 'var(--json-key)' }}>"{keyName}"</span>}
        {keyName && ': '}
        <span style={{ color: 'var(--json-string)' }}>"{value}"</span>
      </span>
    )
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <span>
          {keyName && <span style={{ color: 'var(--json-key)' }}>"{keyName}"</span>}
          {keyName && ': '}[]
        </span>
      )
    }

    return (
      <div>
        <span
          className="cursor-pointer select-none inline-flex items-center gap-0.5"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />}
          {keyName && <span style={{ color: 'var(--json-key)' }}>"{keyName}"</span>}
          {keyName && ': '}
          [
          {collapsed && <span style={{ color: 'var(--text-muted)' }}>{` ${value.length} items `}</span>}
          {collapsed && ']'}
        </span>
        {!collapsed && (
          <div style={{ paddingLeft: '16px' }}>
            {value.map((item, i) => (
              <div key={i}>
                <JsonNode value={item} depth={depth + 1} />
                {i < value.length - 1 && ','}
              </div>
            ))}
          </div>
        )}
        {!collapsed && ']'}
      </div>
    )
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) {
      return (
        <span>
          {keyName && <span style={{ color: 'var(--json-key)' }}>"{keyName}"</span>}
          {keyName && ': '}
          {'{}'}
        </span>
      )
    }

    return (
      <div>
        <span
          className="cursor-pointer select-none inline-flex items-center gap-0.5"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />}
          {keyName && <span style={{ color: 'var(--json-key)' }}>"{keyName}"</span>}
          {keyName && ': '}
          {'{'}
          {collapsed && <span style={{ color: 'var(--text-muted)' }}>{` ${entries.length} keys `}</span>}
          {collapsed && '}'}
        </span>
        {!collapsed && (
          <div style={{ paddingLeft: '16px' }}>
            {entries.map(([k, v], i) => (
              <div key={k}>
                <JsonNode value={v} depth={depth + 1} keyName={k} />
                {i < entries.length - 1 && ','}
              </div>
            ))}
          </div>
        )}
        {!collapsed && '}'}
      </div>
    )
  }

  return <span>{String(value)}</span>
}
