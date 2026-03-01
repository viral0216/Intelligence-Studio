import { useState } from 'react'
import { RotateCcw, Copy, Check } from 'lucide-react'
import { useSettingsStore, type PromptKey } from '@/stores/settingsStore'

interface PromptDef {
  key: PromptKey
  emoji: string
  label: string
  featureNote: string
  defaultText: string
}

const ALL_PROMPTS: PromptDef[] = [
  {
    key: 'dataQA',
    emoji: '\uD83D\uDCCA',
    label: 'Data Q&A',
    featureNote: 'Applied to Data Q&A conversations.',
    defaultText: 'You are a Databricks SQL expert. Help users write and optimize SQL queries.',
  },
  {
    key: 'naturalLanguage',
    emoji: '\uD83D\uDCF7',
    label: 'NL \u2192 API',
    featureNote: 'Applied to Natural Language to API feature.',
    defaultText: 'Convert natural language requests into precise Databricks API calls.',
  },
  {
    key: 'aiSuggest',
    emoji: '\uD83D\uDCA1',
    label: 'Suggest',
    featureNote: 'Applied to AI Suggest for JSON body.',
    defaultText: 'Suggest the best parameters and configuration for the given API endpoint.',
  },
  {
    key: 'aiFix',
    emoji: '\uD83D\uDD27',
    label: 'Fix',
    featureNote: 'Applied to error analysis and fix suggestions.',
    defaultText: 'Analyze the error response and provide root cause, fix, and prevention tips.',
  },
  {
    key: 'findEndpoint',
    emoji: '\uD83D\uDD0D',
    label: 'Find',
    featureNote: 'Applied to endpoint discovery.',
    defaultText: 'Recommend the best Databricks REST API endpoint(s) for the user\u2019s question.',
  },
  {
    key: 'analyzeResponse',
    emoji: '\uD83D\uDCCA',
    label: 'Analyze',
    featureNote: 'Applied to response analysis.',
    defaultText: 'Analyze this Databricks API response. Provide key insights and recommendations.',
  },
  {
    key: 'workflowBuilder',
    emoji: '\u2699\uFE0F',
    label: 'Workflow',
    featureNote: 'Applied to workflow generation.',
    defaultText: 'Generate a Databricks workflow as a sequence of API calls.',
  },
  {
    key: 'promptGenerator',
    emoji: '\u2728',
    label: 'Prompt Gen',
    featureNote: 'Applied to prompt generation.',
    defaultText: 'Generate an optimized system prompt for an AI assistant based on the user\u2019s goal.',
  },
  {
    key: 'codeGeneration',
    emoji: '\uD83D\uDCBB',
    label: 'Code',
    featureNote: 'Applied to code sample generation.',
    defaultText: 'Generate code samples for calling this Databricks API endpoint.',
  },
  {
    key: 'apiDocs',
    emoji: '\uD83D\uDCD6',
    label: 'Docs',
    featureNote: 'Applied to API documentation generation.',
    defaultText: 'Generate comprehensive API documentation for this Databricks endpoint.',
  },
  {
    key: 'testData',
    emoji: '\uD83E\uDDEA',
    label: 'Test Data',
    featureNote: 'Applied to test case generation.',
    defaultText: 'Generate test cases for the given Databricks API endpoint.',
  },
  {
    key: 'security',
    emoji: '\uD83D\uDD12',
    label: 'Security',
    featureNote: 'Applied to security recommendations.',
    defaultText: 'Provide security recommendations for this Databricks API endpoint.',
  },
  {
    key: 'aiScripting',
    emoji: '\uD83D\uDCDD',
    label: 'Scripting',
    featureNote: 'Applied to automation script generation.',
    defaultText: 'Generate a Python script for Databricks automation.',
  },
  {
    key: 'agent',
    emoji: '\uD83E\uDD16',
    label: 'Agent',
    featureNote: 'Applied to Agent Chat.',
    defaultText: 'You are a helpful Databricks assistant.',
  },
]

const PREVIEW_TABS: { key: PromptKey; label: string; emoji: string }[] = [
  { key: 'aiSuggest', label: 'Suggest', emoji: '\uD83D\uDCA1' },
  { key: 'aiFix', label: 'Fix', emoji: '\uD83D\uDD27' },
  { key: 'dataQA', label: 'Data Q&A', emoji: '\uD83D\uDFE2' },
  { key: 'promptGenerator', label: 'Prompt Gen', emoji: '\u2728' },
  { key: 'naturalLanguage', label: 'NL\u2192API', emoji: '\uD83D\uDCF7' },
]

export default function PromptManagerTab() {
  const settings = useSettingsStore()
  const [previewTab, setPreviewTab] = useState<PromptKey>('aiSuggest')
  const [expandedPrompt, setExpandedPrompt] = useState<PromptKey | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const customCount = ALL_PROMPTS.filter((p) => (settings.prompts[p.key] ?? '').trim() !== '').length

  const handleGeneratePreview = () => {
    const def = ALL_PROMPTS.find((p) => p.key === previewTab)
    if (!def) return
    const currentValue = (settings.prompts[previewTab] ?? '').trim()
    if (!currentValue) {
      settings.setPrompt(previewTab, def.defaultText)
    }
    setExpandedPrompt(previewTab)
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  const inputStyle = { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }

  return (
    <div className="p-4 space-y-4">
      {/* Generate & Preview Prompt */}
      <div
        className="rounded-lg p-4 space-y-3"
        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
      >
        <div className="flex items-center gap-2">
          <span>{'\uD83D\uDCCB'}</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>GENERATE & PREVIEW PROMPT</span>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Select a prompt type and generate its formatted output. Great for testing, debugging, or exporting prompts.
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {PREVIEW_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPreviewTab(tab.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                backgroundColor: previewTab === tab.key ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: previewTab === tab.key ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleGeneratePreview}
          className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-success))',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {'\uD83D\uDCCB'} Generate Prompt
        </button>
      </div>

      {/* All Prompts - Compact list */}
      <div
        className="rounded-lg p-4 space-y-2"
        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>ALL SYSTEM PROMPTS</span>
            {customCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}>
                {customCount} custom
              </span>
            )}
          </div>
          <button
            onClick={() => ALL_PROMPTS.forEach((p) => settings.setPrompt(p.key, ''))}
            disabled={customCount === 0}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium disabled:opacity-40"
            style={{ backgroundColor: 'var(--accent-danger)', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            <RotateCcw className="w-3 h-3" /> Reset All
          </button>
        </div>

        {ALL_PROMPTS.map((prompt) => {
          const value = (settings.prompts[prompt.key] ?? '').trim()
          const displayValue = value || prompt.defaultText
          const isCustom = value !== '' && value !== prompt.defaultText
          const isExpanded = expandedPrompt === prompt.key

          return (
            <div key={prompt.key}>
              {/* Prompt row */}
              <button
                onClick={() => setExpandedPrompt(isExpanded ? null : prompt.key)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors"
                style={{
                  backgroundColor: isExpanded ? 'var(--bg-tertiary)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{prompt.emoji}</span>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{prompt.label}</span>
                  {isCustom && (
                    <span className="text-[9px] px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}>
                      Custom
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {isCustom ? `${value.length} chars` : 'default'}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(displayValue, prompt.key) }}
                    className="p-1 rounded"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    title="Copy prompt"
                  >
                    {copiedKey === prompt.key ? <Check className="w-3 h-3" style={{ color: 'var(--accent-success)' }} /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </button>

              {/* Expanded editor */}
              {isExpanded && (
                <div className="px-3 pb-2 pt-1 space-y-2">
                  <textarea
                    value={displayValue}
                    onChange={(e) => settings.setPrompt(prompt.key, e.target.value)}
                    rows={Math.min(Math.max(displayValue.split('\n').length + 1, 3), 10)}
                    className="w-full px-3 py-2 rounded-lg text-xs outline-none font-mono resize-y"
                    style={{ ...inputStyle, borderColor: isCustom ? 'var(--accent-primary)' : 'var(--border-primary)', minHeight: 60, lineHeight: 1.5 }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = isCustom ? 'var(--accent-primary)' : 'var(--border-primary)')}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{prompt.featureNote}</p>
                    {isCustom && (
                      <button
                        onClick={() => settings.setPrompt(prompt.key, '')}
                        className="text-[10px] px-2 py-0.5 rounded"
                        style={{ color: 'var(--text-muted)', background: 'var(--bg-tertiary)', border: 'none', cursor: 'pointer' }}
                      >
                        Reset to default
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Enable Query Execution */}
      <div
        className="rounded-lg p-4"
        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
      >
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.features.queryExecution}
            onChange={(e) => settings.setFeature('queryExecution', e.target.checked)}
            className="accent-[var(--accent-primary)] w-4 h-4"
          />
          <div>
            <div className="flex items-center gap-2">
              <span>{'\uD83D\uDFE2'}</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>ENABLE QUERY EXECUTION IN DATA Q&A</span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              When enabled, AI will execute SQL queries against your Databricks warehouse and return results.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
