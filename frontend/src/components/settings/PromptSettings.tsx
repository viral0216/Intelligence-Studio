import { RotateCcw } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'

interface PromptDefinition {
  key: keyof ReturnType<typeof useSettingsStore>['prompts']
  label: string
  description: string
  placeholder: string
}

const PROMPTS: PromptDefinition[] = [
  {
    key: 'dataQA',
    label: 'Data QA System Prompt',
    description: 'System prompt for the Data QA assistant that answers questions about your data.',
    placeholder:
      'You are a helpful data analyst assistant. When asked about data, generate accurate SQL queries and provide clear explanations of the results...',
  },
  {
    key: 'naturalLanguage',
    label: 'Natural Language to API Prompt',
    description: 'System prompt for converting natural language queries into Databricks API calls.',
    placeholder:
      'You are an expert at translating natural language into Databricks REST API calls. Given a user request, determine the correct endpoint, method, and parameters...',
  },
  {
    key: 'aiSuggest',
    label: 'AI Suggest Prompt',
    description: 'System prompt for parameter suggestions and endpoint recommendations.',
    placeholder:
      'You are a Databricks API expert. Suggest the best parameters and configuration for the given API endpoint based on user intent...',
  },
  {
    key: 'aiFix',
    label: 'AI Fix / Error Explanation Prompt',
    description: 'System prompt for analyzing API errors and suggesting fixes.',
    placeholder:
      'You are a Databricks troubleshooting expert. Analyze the error response and provide a clear explanation of what went wrong and how to fix it...',
  },
]

export default function PromptSettings() {
  const { prompts, setPrompt } = useSettingsStore()

  const handleResetToDefaults = () => {
    PROMPTS.forEach((p) => setPrompt(p.key, ''))
  }

  const handleResetSingle = (key: keyof typeof prompts) => {
    setPrompt(key, '')
  }

  const hasCustomPrompts = Object.values(prompts).some((v) => v.trim() !== '')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Custom Prompts
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Override the default system prompts used by AI features. Leave empty to use built-in defaults.
          </p>
        </div>
        <button
          onClick={handleResetToDefaults}
          disabled={!hasCustomPrompts}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-40 shrink-0"
          style={{
            backgroundColor: 'var(--accent-danger)',
            color: '#fff',
          }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to Defaults
        </button>
      </div>

      {/* Prompt fields */}
      <div className="flex flex-col gap-5">
        {PROMPTS.map((prompt) => {
          const value = prompts[prompt.key]
          const hasValue = value.trim() !== ''
          return (
            <div key={prompt.key} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {prompt.label}
                  {hasValue && (
                    <span
                      className="ml-2 text-xs px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
                    >
                      Custom
                    </span>
                  )}
                </label>
                {hasValue && (
                  <button
                    onClick={() => handleResetSingle(prompt.key)}
                    className="text-xs px-2 py-0.5 rounded transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = 'var(--text-muted)'
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {prompt.description}
              </p>
              <textarea
                value={value}
                onChange={(e) => setPrompt(prompt.key, e.target.value)}
                placeholder={prompt.placeholder}
                rows={4}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors resize-y font-mono"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: `1px solid ${hasValue ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                  minHeight: 80,
                  maxHeight: 300,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = hasValue ? 'var(--accent-primary)' : 'var(--border-primary)')}
              />
              {hasValue && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {value.length} characters
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
