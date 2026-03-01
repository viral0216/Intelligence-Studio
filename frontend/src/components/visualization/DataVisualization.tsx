import { useMemo, useState } from 'react'
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ScatterChart as ScatterChartIcon,
  Activity,
  Hexagon,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useRequestStore } from '@/stores/requestStore'

type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'radar'

const CHART_TYPES: { type: ChartType; icon: React.ReactNode; label: string }[] = [
  { type: 'bar', icon: <BarChart3 className="w-4 h-4" />, label: 'Bar' },
  { type: 'line', icon: <LineChartIcon className="w-4 h-4" />, label: 'Line' },
  { type: 'pie', icon: <PieChartIcon className="w-4 h-4" />, label: 'Pie' },
  { type: 'scatter', icon: <ScatterChartIcon className="w-4 h-4" />, label: 'Scatter' },
  { type: 'area', icon: <Activity className="w-4 h-4" />, label: 'Area' },
  { type: 'radar', icon: <Hexagon className="w-4 h-4" />, label: 'Radar' },
]

const DARK_COLORS = [
  '#58a6ff',
  '#7ee787',
  '#d2a8ff',
  '#f778ba',
  '#ffa657',
  '#79c0ff',
  '#f0883e',
  '#a5d6ff',
  '#ff7b72',
  '#bb8009',
]

function extractChartData(data: unknown): Record<string, unknown>[] {
  if (!data || typeof data !== 'object') return []
  if (Array.isArray(data)) return data as Record<string, unknown>[]
  const obj = data as Record<string, unknown>
  for (const key of Object.keys(obj)) {
    if (Array.isArray(obj[key])) {
      return obj[key] as Record<string, unknown>[]
    }
  }
  return []
}

function detectBestChartType(rows: Record<string, unknown>[]): ChartType {
  if (rows.length === 0) return 'bar'
  const keys = Object.keys(rows[0])
  const numericKeys = keys.filter((k) =>
    rows.every((r) => typeof r[k] === 'number' || !isNaN(Number(r[k])))
  )

  if (numericKeys.length >= 2 && rows.length > 5) return 'scatter'
  if (rows.length <= 8 && numericKeys.length === 1) return 'pie'
  if (rows.length > 20) return 'line'
  if (numericKeys.length >= 3 && rows.length <= 10) return 'radar'
  return 'bar'
}

function getNumericKeys(rows: Record<string, unknown>[]): string[] {
  if (rows.length === 0) return []
  const keys = Object.keys(rows[0])
  return keys.filter((k) =>
    rows.some((r) => typeof r[k] === 'number' || (!isNaN(Number(r[k])) && r[k] !== null && r[k] !== ''))
  )
}

function getCategoryKey(rows: Record<string, unknown>[], numericKeys: string[]): string {
  if (rows.length === 0) return ''
  const keys = Object.keys(rows[0])
  const nonNumeric = keys.filter((k) => !numericKeys.includes(k))
  return nonNumeric[0] || keys[0] || ''
}

export default function DataVisualization() {
  const { response } = useRequestStore()
  const [chartType, setChartType] = useState<ChartType | null>(null)

  const rows = useMemo(() => extractChartData(response?.data), [response])

  const numericKeys = useMemo(() => getNumericKeys(rows), [rows])
  const categoryKey = useMemo(() => getCategoryKey(rows, numericKeys), [rows, numericKeys])

  const activeChart = chartType || detectBestChartType(rows)

  const chartData = useMemo(() => {
    return rows.map((row) => {
      const entry: Record<string, unknown> = {}
      entry[categoryKey] = row[categoryKey]
      numericKeys.forEach((k) => {
        entry[k] = typeof row[k] === 'number' ? row[k] : Number(row[k]) || 0
      })
      return entry
    })
  }, [rows, categoryKey, numericKeys])

  if (!response || rows.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-full p-8"
        style={{ color: 'var(--text-muted)' }}
      >
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No data available for visualization</p>
          <p className="text-xs mt-1">Send an API request that returns array data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Chart type selector */}
      <div
        className="flex items-center gap-1 px-4 py-2 border-b"
        style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <span className="text-xs mr-2" style={{ color: 'var(--text-muted)' }}>
          Chart Type:
        </span>
        {CHART_TYPES.map((ct) => (
          <button
            key={ct.type}
            onClick={() => setChartType(ct.type)}
            title={ct.label}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
            style={{
              backgroundColor: activeChart === ct.type ? 'var(--bg-hover)' : 'transparent',
              color: activeChart === ct.type ? 'var(--accent-primary)' : 'var(--text-muted)',
            }}
          >
            {ct.icon}
            {ct.label}
          </button>
        ))}
        <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
          {rows.length} data points
        </span>
      </div>

      {/* Chart area */}
      <div className="flex-1 p-4">
        <ResponsiveContainer width="100%" height="100%">
          {activeChart === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
              <XAxis
                dataKey={categoryKey}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                stroke="var(--border-primary)"
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                stroke="var(--border-primary)"
              />
              <Tooltip
                wrapperStyle={{ zIndex: 1000 }}
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg)',
                  border: '1px solid var(--tooltip-border)',
                  borderRadius: '8px',
                  color: 'var(--tooltip-text)',
                  fontSize: 12,
                  boxShadow: '0 4px 12px var(--tooltip-shadow)',
                }}
                itemStyle={{ color: 'var(--tooltip-text)' }}
                labelStyle={{ color: 'var(--tooltip-label)', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {numericKeys.slice(0, 5).map((key, i) => (
                <Bar key={key} dataKey={key} fill={DARK_COLORS[i % DARK_COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          ) : activeChart === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
              <XAxis
                dataKey={categoryKey}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                stroke="var(--border-primary)"
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                stroke="var(--border-primary)"
              />
              <Tooltip
                wrapperStyle={{ zIndex: 1000 }}
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg)',
                  border: '1px solid var(--tooltip-border)',
                  borderRadius: '8px',
                  color: 'var(--tooltip-text)',
                  fontSize: 12,
                  boxShadow: '0 4px 12px var(--tooltip-shadow)',
                }}
                itemStyle={{ color: 'var(--tooltip-text)' }}
                labelStyle={{ color: 'var(--tooltip-label)', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {numericKeys.slice(0, 5).map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={DARK_COLORS[i % DARK_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          ) : activeChart === 'pie' ? (
            <PieChart>
              <Pie
                data={chartData}
                dataKey={numericKeys[0] || ''}
                nameKey={categoryKey}
                cx="50%"
                cy="50%"
                outerRadius="80%"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: 'var(--text-muted)' }}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={DARK_COLORS[i % DARK_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                wrapperStyle={{ zIndex: 1000 }}
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg)',
                  border: '1px solid var(--tooltip-border)',
                  borderRadius: '8px',
                  color: 'var(--tooltip-text)',
                  fontSize: 12,
                  boxShadow: '0 4px 12px var(--tooltip-shadow)',
                }}
                itemStyle={{ color: 'var(--tooltip-text)' }}
                labelStyle={{ color: 'var(--tooltip-label)', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          ) : activeChart === 'scatter' ? (
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
              <XAxis
                dataKey={numericKeys[0] || ''}
                name={numericKeys[0] || ''}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                stroke="var(--border-primary)"
              />
              <YAxis
                dataKey={numericKeys[1] || numericKeys[0] || ''}
                name={numericKeys[1] || numericKeys[0] || ''}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                stroke="var(--border-primary)"
              />
              <Tooltip
                wrapperStyle={{ zIndex: 1000 }}
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg)',
                  border: '1px solid var(--tooltip-border)',
                  borderRadius: '8px',
                  color: 'var(--tooltip-text)',
                  fontSize: 12,
                  boxShadow: '0 4px 12px var(--tooltip-shadow)',
                }}
                itemStyle={{ color: 'var(--tooltip-text)' }}
                labelStyle={{ color: 'var(--tooltip-label)', fontWeight: 600 }}
              />
              <Scatter data={chartData} fill={DARK_COLORS[0]} />
            </ScatterChart>
          ) : activeChart === 'area' ? (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
              <XAxis
                dataKey={categoryKey}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                stroke="var(--border-primary)"
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                stroke="var(--border-primary)"
              />
              <Tooltip
                wrapperStyle={{ zIndex: 1000 }}
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg)',
                  border: '1px solid var(--tooltip-border)',
                  borderRadius: '8px',
                  color: 'var(--tooltip-text)',
                  fontSize: 12,
                  boxShadow: '0 4px 12px var(--tooltip-shadow)',
                }}
                itemStyle={{ color: 'var(--tooltip-text)' }}
                labelStyle={{ color: 'var(--tooltip-label)', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {numericKeys.slice(0, 5).map((key, i) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={DARK_COLORS[i % DARK_COLORS.length]}
                  fill={DARK_COLORS[i % DARK_COLORS.length]}
                  fillOpacity={0.2}
                />
              ))}
            </AreaChart>
          ) : (
            <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="80%">
              <PolarGrid stroke="var(--border-secondary)" />
              <PolarAngleAxis
                dataKey={categoryKey}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              />
              <PolarRadiusAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              {numericKeys.slice(0, 3).map((key, i) => (
                <Radar
                  key={key}
                  name={key}
                  dataKey={key}
                  stroke={DARK_COLORS[i % DARK_COLORS.length]}
                  fill={DARK_COLORS[i % DARK_COLORS.length]}
                  fillOpacity={0.2}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip
                wrapperStyle={{ zIndex: 1000 }}
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg)',
                  border: '1px solid var(--tooltip-border)',
                  borderRadius: '8px',
                  color: 'var(--tooltip-text)',
                  fontSize: 12,
                  boxShadow: '0 4px 12px var(--tooltip-shadow)',
                }}
                itemStyle={{ color: 'var(--tooltip-text)' }}
                labelStyle={{ color: 'var(--tooltip-label)', fontWeight: 600 }}
              />
            </RadarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
