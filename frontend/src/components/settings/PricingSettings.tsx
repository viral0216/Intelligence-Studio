import { useState, useEffect } from 'react'
import { DollarSign, Loader2, RefreshCw } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'
import { getPricing } from '@/lib/api'

interface ModelPricing {
  model: string
  inputCostPer1kTokens?: number
  outputCostPer1kTokens?: number
  dbuPerToken?: number
  [key: string]: unknown
}

export default function PricingSettings() {
  const { dbuRate, setDbuRate } = useSettingsStore()
  const [pricingData, setPricingData] = useState<ModelPricing[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPricing = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getPricing()
      const data = Array.isArray(result) ? result : result?.models || result?.pricing || []
      setPricingData(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load pricing.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPricing()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Pricing Configuration
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Configure the DBU rate and view model pricing to estimate costs for AI operations.
        </p>
      </div>

      {/* DBU Rate */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          DBU Rate ($ per DBU)
        </label>
        <div className="relative w-48">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="number"
            value={dbuRate}
            onChange={(e) => setDbuRate(Math.max(0, parseFloat(e.target.value) || 0))}
            min={0}
            step={0.01}
            className="w-full pl-10 pr-3 py-2 rounded-lg text-sm outline-none transition-colors"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-primary)')}
          />
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Your organization's Databricks Unit rate. Default is $0.07 per DBU.
        </span>
      </div>

      {/* DBU Rate presets */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Common Rates
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: '$0.07 (Standard)', value: 0.07 },
            { label: '$0.10 (Premium)', value: 0.1 },
            { label: '$0.15 (Enterprise)', value: 0.15 },
            { label: '$0.22 (Serverless)', value: 0.22 },
          ].map((preset) => (
            <button
              key={preset.value}
              onClick={() => setDbuRate(preset.value)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{
                backgroundColor: dbuRate === preset.value ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: dbuRate === preset.value ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${dbuRate === preset.value ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Model Pricing Table */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Model Pricing Table
          </label>
          <button
            onClick={fetchPricing}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Refresh
          </button>
        </div>

        {error && (
          <p
            className="text-sm px-3 py-2 rounded-lg"
            style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--accent-danger)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            {error}
          </p>
        )}

        {loading && pricingData.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-muted)' }} />
          </div>
        ) : pricingData.length > 0 ? (
          <div
            className="rounded-lg overflow-hidden border"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Model
                  </th>
                  <th className="text-right px-3 py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Input (per 1K tokens)
                  </th>
                  <th className="text-right px-3 py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Output (per 1K tokens)
                  </th>
                </tr>
              </thead>
              <tbody>
                {pricingData.map((item, idx) => (
                  <tr
                    key={item.model || idx}
                    style={{
                      backgroundColor: idx % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-tertiary)',
                      borderTop: '1px solid var(--border-primary)',
                    }}
                  >
                    <td className="px-3 py-2 font-mono text-xs" style={{ color: 'var(--text-primary)' }}>
                      {item.model || `Model ${idx + 1}`}
                    </td>
                    <td className="px-3 py-2 text-right text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {item.inputCostPer1kTokens != null
                        ? `$${item.inputCostPer1kTokens.toFixed(4)}`
                        : '--'}
                    </td>
                    <td className="px-3 py-2 text-right text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {item.outputCostPer1kTokens != null
                        ? `$${item.outputCostPer1kTokens.toFixed(4)}`
                        : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className="text-center py-8 rounded-lg"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
          >
            <p className="text-sm">No pricing data available.</p>
            <p className="text-xs mt-1">Click Refresh to load pricing information.</p>
          </div>
        )}
      </div>
    </div>
  )
}
