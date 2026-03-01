import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
}

// Simple keyword-based syntax highlighting for common languages
// CSS variable references for theme-aware syntax colors
const SYN = {
  keyword: 'var(--syntax-keyword)',
  boolean: 'var(--syntax-boolean)',
  fn: 'var(--syntax-function)',
  string: 'var(--syntax-string)',
  comment: 'var(--syntax-comment)',
  number: 'var(--syntax-number)',
}

const KEYWORD_PATTERNS: Record<string, { keywords: string[]; color: string }[]> = {
  python: [
    { keywords: ['def', 'class', 'import', 'from', 'as', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or', 'with', 'try', 'except', 'finally', 'raise', 'pass', 'break', 'continue', 'yield', 'lambda', 'async', 'await'], color: SYN.keyword },
    { keywords: ['True', 'False', 'None', 'self'], color: SYN.boolean },
    { keywords: ['print', 'len', 'range', 'type', 'str', 'int', 'float', 'list', 'dict', 'set', 'tuple', 'isinstance', 'enumerate', 'zip', 'map', 'filter'], color: SYN.fn },
  ],
  javascript: [
    { keywords: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'class', 'extends', 'new', 'this', 'import', 'export', 'default', 'from', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof', 'of', 'in'], color: SYN.keyword },
    { keywords: ['true', 'false', 'null', 'undefined', 'NaN', 'Infinity'], color: SYN.boolean },
    { keywords: ['console', 'Math', 'JSON', 'Array', 'Object', 'String', 'Number', 'Promise', 'setTimeout', 'setInterval', 'fetch', 'require'], color: SYN.fn },
  ],
  typescript: [
    { keywords: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'class', 'extends', 'new', 'this', 'import', 'export', 'default', 'from', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof', 'of', 'in', 'interface', 'type', 'enum', 'implements', 'abstract', 'as', 'keyof', 'readonly'], color: SYN.keyword },
    { keywords: ['true', 'false', 'null', 'undefined', 'NaN', 'Infinity'], color: SYN.boolean },
    { keywords: ['console', 'Math', 'JSON', 'Array', 'Object', 'String', 'Number', 'Promise', 'setTimeout', 'setInterval', 'fetch', 'require'], color: SYN.fn },
  ],
  sql: [
    { keywords: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'VIEW', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'ON', 'AS', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'LIKE', 'BETWEEN', 'EXISTS', 'HAVING', 'GROUP', 'BY', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'WITH', 'VALUES'], color: SYN.keyword },
    { keywords: ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'CAST', 'CONVERT', 'TRIM', 'UPPER', 'LOWER', 'CONCAT', 'SUBSTRING', 'REPLACE', 'DATE', 'NOW', 'CURRENT_TIMESTAMP'], color: SYN.fn },
  ],
  bash: [
    { keywords: ['if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'case', 'esac', 'function', 'return', 'exit', 'export', 'source', 'alias', 'echo', 'read', 'local', 'declare', 'set', 'unset'], color: SYN.keyword },
    { keywords: ['curl', 'grep', 'sed', 'awk', 'cat', 'ls', 'cd', 'mkdir', 'rm', 'cp', 'mv', 'chmod', 'chown', 'find', 'xargs', 'sort', 'uniq', 'wc', 'head', 'tail', 'tee', 'pipe', 'jq'], color: SYN.fn },
  ],
  json: [],
}

function highlightLine(line: string, language: string): React.ReactNode[] {
  const patterns = KEYWORD_PATTERNS[language.toLowerCase()] || []

  if (patterns.length === 0) {
    // For JSON, do basic highlighting
    if (language.toLowerCase() === 'json') {
      return [highlightJson(line)]
    }
    return [<span key="0">{line}</span>]
  }

  // Highlight strings first
  const parts: React.ReactNode[] = []
  let remaining = line
  let keyIdx = 0

  // Match strings
  const stringRegex = /(["'`])(?:(?!\1|\\).|\\.)*\1/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  const segments: { start: number; end: number; type: 'string' | 'comment' | 'text'; text: string }[] = []

  // Detect comments
  const commentIdx = language === 'python' || language === 'bash'
    ? line.indexOf('#')
    : language === 'sql'
      ? line.indexOf('--')
      : line.indexOf('//')

  if (commentIdx >= 0) {
    if (commentIdx > 0) {
      segments.push({ start: 0, end: commentIdx, type: 'text', text: line.slice(0, commentIdx) })
    }
    segments.push({ start: commentIdx, end: line.length, type: 'comment', text: line.slice(commentIdx) })
  } else {
    while ((match = stringRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ start: lastIndex, end: match.index, type: 'text', text: line.slice(lastIndex, match.index) })
      }
      segments.push({ start: match.index, end: match.index + match[0].length, type: 'string', text: match[0] })
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < line.length) {
      segments.push({ start: lastIndex, end: line.length, type: 'text', text: line.slice(lastIndex) })
    }
  }

  if (segments.length === 0) {
    segments.push({ start: 0, end: line.length, type: 'text', text: line })
  }

  for (const seg of segments) {
    if (seg.type === 'string') {
      parts.push(
        <span key={keyIdx++} style={{ color: SYN.string }}>
          {seg.text}
        </span>
      )
    } else if (seg.type === 'comment') {
      parts.push(
        <span key={keyIdx++} style={{ color: SYN.comment, fontStyle: 'italic' }}>
          {seg.text}
        </span>
      )
    } else {
      // Apply keyword highlighting
      remaining = seg.text
      let wordRegex: RegExp

      // Build regex from all keyword groups
      for (const group of patterns) {
        const escapedKeywords = group.keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        const isCaseSensitive = language.toLowerCase() !== 'sql'
        wordRegex = new RegExp(`\\b(${escapedKeywords.join('|')})\\b`, isCaseSensitive ? 'g' : 'gi')

        let wordMatch: RegExpExecArray | null
        let wordLastIdx = 0
        const subParts: React.ReactNode[] = []

        while ((wordMatch = wordRegex.exec(remaining)) !== null) {
          if (wordMatch.index > wordLastIdx) {
            subParts.push(
              <span key={keyIdx++}>{remaining.slice(wordLastIdx, wordMatch.index)}</span>
            )
          }
          subParts.push(
            <span key={keyIdx++} style={{ color: group.color }}>
              {wordMatch[0]}
            </span>
          )
          wordLastIdx = wordMatch.index + wordMatch[0].length
        }

        if (subParts.length > 0) {
          if (wordLastIdx < remaining.length) {
            subParts.push(<span key={keyIdx++}>{remaining.slice(wordLastIdx)}</span>)
          }
          parts.push(...subParts)
          remaining = ''
          break
        }
      }

      if (remaining) {
        // Highlight numbers
        const numParts = remaining.split(/(\b\d+\.?\d*\b)/g)
        numParts.forEach((part, idx) => {
          if (/^\d+\.?\d*$/.test(part)) {
            parts.push(
              <span key={keyIdx++} style={{ color: SYN.number }}>
                {part}
              </span>
            )
          } else {
            parts.push(<span key={keyIdx++}>{part}</span>)
          }
        })
      }
    }
  }

  return parts
}

function highlightJson(line: string): React.ReactNode {
  // Simple JSON coloring using CSS variables for theme support
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: line
          .replace(/("(?:[^"\\]|\\.)*")\s*:/g, '<span style="color:var(--json-key)">$1</span>:')
          .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span style="color:var(--json-string)">$1</span>')
          .replace(/:\s*(true|false)/g, ': <span style="color:var(--json-boolean)">$1</span>')
          .replace(/:\s*(null)/g, ': <span style="color:var(--json-null)">$1</span>')
          .replace(/:\s*(\d+\.?\d*)/g, ': <span style="color:var(--json-number)">$1</span>'),
      }}
    />
  )
}

export default function CodeBlock({ code, language = 'text' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.split('\n')

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-primary)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b"
        style={{ borderColor: 'var(--border-secondary)' }}
      >
        <span className="text-[10px] font-medium uppercase" style={{ color: 'var(--text-muted)' }}>
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" style={{ color: 'var(--accent-success)' }} />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto p-3">
        <pre className="text-xs font-mono leading-5" style={{ color: 'var(--text-primary)' }}>
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span
                className="select-none text-right mr-4 flex-shrink-0"
                style={{ color: 'var(--text-muted)', minWidth: '2ch', opacity: 0.5 }}
              >
                {i + 1}
              </span>
              <span className="flex-1">{highlightLine(line, language)}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
}
