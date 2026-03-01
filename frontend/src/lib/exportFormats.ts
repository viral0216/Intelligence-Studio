/**
 * Export data in various formats.
 */

export function toJSON(data: unknown): string {
  return JSON.stringify(data, null, 2)
}

export function toCSV(data: unknown): string {
  if (!data || typeof data !== 'object') return ''

  let rows: Record<string, unknown>[] = []
  if (Array.isArray(data)) {
    rows = data
  } else {
    const obj = data as Record<string, unknown>
    for (const key of Object.keys(obj)) {
      if (Array.isArray(obj[key])) {
        rows = obj[key] as Record<string, unknown>[]
        break
      }
    }
  }

  if (rows.length === 0) return ''

  const flatRows = rows.map((row) => deepFlatten(row))
  const columns = [...new Set(flatRows.flatMap(Object.keys))]

  const header = columns.map(escapeCSV).join(',')
  const body = flatRows.map((row) =>
    columns.map((col) => escapeCSV(String(row[col] ?? ''))).join(',')
  )

  return [header, ...body].join('\n')
}

export function toMarkdown(data: unknown): string {
  if (!data || typeof data !== 'object') return `\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``

  let rows: Record<string, unknown>[] = []
  if (Array.isArray(data)) {
    rows = data
  } else {
    const obj = data as Record<string, unknown>
    for (const key of Object.keys(obj)) {
      if (Array.isArray(obj[key])) {
        rows = obj[key] as Record<string, unknown>[]
        break
      }
    }
  }

  if (rows.length === 0) return `\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``

  const flatRows = rows.map((row) => deepFlatten(row))
  const columns = [...new Set(flatRows.flatMap(Object.keys))]

  const header = `| ${columns.join(' | ')} |`
  const separator = `| ${columns.map(() => '---').join(' | ')} |`
  const body = flatRows.map(
    (row) => `| ${columns.map((col) => String(row[col] ?? '')).join(' | ')} |`
  )

  return [header, separator, ...body].join('\n')
}

export function deepFlatten(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, deepFlatten(value as Record<string, unknown>, fullKey))
    } else {
      result[fullKey] = value
    }
  }

  return result
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
