import { Cloud } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'

const PROVIDERS = [
  {
    key: 'azure' as const,
    label: 'Microsoft Azure',
    description: 'Azure Databricks workspaces',
    region: 'East US, West Europe, etc.',
  },
  {
    key: 'aws' as const,
    label: 'Amazon Web Services',
    description: 'AWS Databricks workspaces',
    region: 'us-east-1, eu-west-1, etc.',
  },
  {
    key: 'gcp' as const,
    label: 'Google Cloud Platform',
    description: 'GCP Databricks workspaces',
    region: 'us-central1, europe-west1, etc.',
  },
]

export default function CloudProviderSettings() {
  const { cloudProvider, setCloudProvider } = useSettingsStore()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Cloud Provider
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Select the cloud provider for your Databricks workspace. This affects available regions and pricing.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {PROVIDERS.map((provider) => {
          const isSelected = cloudProvider === provider.key
          return (
            <button
              key={provider.key}
              onClick={() => setCloudProvider(provider.key)}
              className="flex items-start gap-4 p-4 rounded-lg text-left transition-colors"
              style={{
                backgroundColor: isSelected ? 'var(--bg-hover)' : 'var(--bg-tertiary)',
                border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = 'var(--text-muted)'
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-primary)'
              }}
            >
              {/* Radio indicator */}
              <div
                className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                style={{
                  borderColor: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)',
                }}
              >
                {isSelected && (
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Cloud
                    className="w-4 h-4"
                    style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}
                  >
                    {provider.label}
                  </span>
                </div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {provider.description}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Regions: {provider.region}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Current selection: <strong style={{ color: 'var(--text-secondary)' }}>{cloudProvider.toUpperCase()}</strong>
      </p>
    </div>
  )
}
