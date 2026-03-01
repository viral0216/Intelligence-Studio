import { useSettingsStore, type FeatureKey } from '@/stores/settingsStore'
import {
  MessageSquare,
  Search,
  GitBranch,
  Code,
  FlaskConical,
  Play,
  BarChart3,
} from 'lucide-react'

interface FeatureDefinition {
  key: FeatureKey
  label: string
  description: string
  icon: React.ReactNode
}

const FEATURES: FeatureDefinition[] = [
  {
    key: 'dataQA',
    label: 'Data QA Assistant',
    description: 'Ask natural language questions about your data using a SQL warehouse.',
    icon: <MessageSquare className="w-4 h-4" />,
  },
  {
    key: 'findEndpoint',
    label: 'Find Endpoint',
    description: 'AI-powered endpoint discovery from natural language queries.',
    icon: <Search className="w-4 h-4" />,
  },
  {
    key: 'workflowBuilder',
    label: 'Workflow Builder',
    description: 'Generate multi-step API workflows from goal descriptions.',
    icon: <GitBranch className="w-4 h-4" />,
  },
  {
    key: 'codeGeneration',
    label: 'Code Generation',
    description: 'Generate Python, JavaScript, and cURL code snippets for API calls.',
    icon: <Code className="w-4 h-4" />,
  },
  {
    key: 'testDataGenerator',
    label: 'Test Data Generator',
    description: 'Generate realistic test data and request payloads for endpoints.',
    icon: <FlaskConical className="w-4 h-4" />,
  },
  {
    key: 'queryExecution',
    label: 'Query Execution',
    description: 'Execute SQL queries directly against your Databricks SQL warehouse.',
    icon: <Play className="w-4 h-4" />,
  },
  {
    key: 'charts',
    label: 'Charts & Visualization',
    description: 'Render charts and graphs from query results and API responses.',
    icon: <BarChart3 className="w-4 h-4" />,
  },
]

export default function FeatureToggles() {
  const { features, setFeature } = useSettingsStore()

  const enabledCount = Object.values(features).filter(Boolean).length
  const totalCount = FEATURES.length

  const handleToggleAll = (enabled: boolean) => {
    FEATURES.forEach((f) => setFeature(f.key, enabled))
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Feature Toggles
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Enable or disable individual features. Disabled features are hidden from the interface.
        </p>
      </div>

      {/* Summary + bulk actions */}
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {enabledCount} of {totalCount} features enabled
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleAll(true)}
            className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}
          >
            Enable All
          </button>
          <button
            onClick={() => handleToggleAll(false)}
            className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}
          >
            Disable All
          </button>
        </div>
      </div>

      {/* Feature list */}
      <div className="flex flex-col gap-3">
        {FEATURES.map((feature) => {
          const enabled = features[feature.key]
          return (
            <div
              key={feature.key}
              className="flex items-center gap-4 p-4 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: `1px solid ${enabled ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                opacity: enabled ? 1 : 0.7,
              }}
            >
              {/* Icon */}
              <div
                className="p-2 rounded-md shrink-0"
                style={{
                  backgroundColor: enabled ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  color: enabled ? '#fff' : 'var(--text-muted)',
                }}
              >
                {feature.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {feature.label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {feature.description}
                </div>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => setFeature(feature.key, !enabled)}
                className="relative shrink-0 rounded-full transition-colors"
                style={{
                  width: 44,
                  height: 24,
                  backgroundColor: enabled ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  border: `1px solid ${enabled ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                }}
                role="switch"
                aria-checked={enabled}
                aria-label={`Toggle ${feature.label}`}
              >
                <span
                  className="block rounded-full transition-transform"
                  style={{
                    width: 18,
                    height: 18,
                    backgroundColor: '#fff',
                    transform: enabled ? 'translateX(22px)' : 'translateX(2px)',
                    marginTop: 2,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
