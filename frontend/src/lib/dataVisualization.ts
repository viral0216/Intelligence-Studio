/**
 * Data visualization utilities for chart preparation.
 */

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'radar' | 'composed'

export interface ChartConfig {
  type: ChartType
  data: Record<string, unknown>[]
  xKey: string
  yKeys: string[]
  colors: string[]
}

const DEFAULT_COLORS = [
  '#58a6ff', '#a371f7', '#3fb950', '#d29922', '#f85149',
  '#79c0ff', '#d2a8ff', '#56d364', '#e3b341', '#ff7b72',
]

/**
 * Auto-detect the best chart type for the given data.
 */
export function detectChartType(data: Record<string, unknown>[]): ChartType {
  if (data.length === 0) return 'bar'

  const keys = Object.keys(data[0])
  const numericKeys = keys.filter((k) => typeof data[0][k] === 'number')
  const stringKeys = keys.filter((k) => typeof data[0][k] === 'string')

  // Pie chart: one string key + one numeric key
  if (stringKeys.length === 1 && numericKeys.length === 1 && data.length <= 10) {
    return 'pie'
  }

  // Scatter: two or more numeric keys, no clear category
  if (numericKeys.length >= 2 && stringKeys.length === 0) {
    return 'scatter'
  }

  // Line: time-series data (has date/time in keys)
  if (keys.some((k) => /date|time|timestamp|created|updated/i.test(k))) {
    return 'line'
  }

  // Default to bar
  return 'bar'
}

/**
 * Prepare data for chart rendering.
 */
export function prepareChartData(rawData: unknown): ChartConfig | null {
  let rows: Record<string, unknown>[] = []

  if (Array.isArray(rawData)) {
    rows = rawData.filter((r) => r && typeof r === 'object') as Record<string, unknown>[]
  } else if (rawData && typeof rawData === 'object') {
    const obj = rawData as Record<string, unknown>
    for (const key of Object.keys(obj)) {
      if (Array.isArray(obj[key])) {
        rows = (obj[key] as unknown[]).filter((r) => r && typeof r === 'object') as Record<string, unknown>[]
        break
      }
    }
  }

  if (rows.length === 0) return null

  const keys = Object.keys(rows[0])
  const stringKeys = keys.filter((k) => typeof rows[0][k] === 'string')
  const numericKeys = keys.filter((k) => typeof rows[0][k] === 'number')

  if (numericKeys.length === 0) return null

  const xKey = stringKeys[0] || keys[0]
  const yKeys = numericKeys.slice(0, 5)
  const type = detectChartType(rows)

  return {
    type,
    data: rows,
    xKey,
    yKeys,
    colors: DEFAULT_COLORS.slice(0, yKeys.length),
  }
}

/**
 * Summarize data for quick stats.
 */
export function summarizeData(data: Record<string, unknown>[]): Record<string, { min: number; max: number; avg: number; count: number }> {
  const summary: Record<string, { min: number; max: number; sum: number; count: number }> = {}

  for (const row of data) {
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === 'number') {
        if (!summary[key]) {
          summary[key] = { min: value, max: value, sum: value, count: 1 }
        } else {
          summary[key].min = Math.min(summary[key].min, value)
          summary[key].max = Math.max(summary[key].max, value)
          summary[key].sum += value
          summary[key].count++
        }
      }
    }
  }

  const result: Record<string, { min: number; max: number; avg: number; count: number }> = {}
  for (const [key, stats] of Object.entries(summary)) {
    result[key] = {
      min: stats.min,
      max: stats.max,
      avg: Math.round((stats.sum / stats.count) * 100) / 100,
      count: stats.count,
    }
  }

  return result
}
