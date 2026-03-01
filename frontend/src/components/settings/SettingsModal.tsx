import { useState, useEffect } from 'react'
import { X, RefreshCw, Loader2, Eye, EyeOff, ChevronDown, ChevronRight, RotateCcw, Shield, Link2, Trash2, Save } from 'lucide-react'
import { useSettingsStore, type PromptKey } from '@/stores/settingsStore'
import { useAuthStore } from '@/stores/authStore'
import { checkHealth, listModels, listWarehouses, azureLogin, azureLogout, azureLoginTenant, listAzureTenants, listAzureSubscriptions, listAzureWorkspaces, databricksWorkspaceAccess } from '@/lib/api'

type SettingsTab = 'general' | 'connection' | 'ai' | 'prompts' | 'charts'

const TABS: { key: SettingsTab; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'connection', label: 'Connection' },
  { key: 'ai', label: 'AI & Pricing' },
  { key: 'prompts', label: 'Prompts' },
  { key: 'charts', label: 'Charts' },
]

export default function SettingsModal() {
  const settings = useSettingsStore()
  const auth = useAuthStore()
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [isExpanded, setIsExpanded] = useState(true)

  // Connection state
  const [showToken, setShowToken] = useState(false)
  const [testing, setTesting] = useState(false)
  const [connectionMsg, setConnectionMsg] = useState<string | null>(null)

  // Model loading
  const [models, setModels] = useState<string[]>([])
  const [loadingModels, setLoadingModels] = useState(false)

  // Warehouse loading
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([])
  const [loadingWarehouses, setLoadingWarehouses] = useState(false)

  if (!settings.settingsOpen) return null

  const handleTestConnection = async () => {
    if (!auth.host?.trim() || !auth.token?.trim()) {
      setConnectionMsg('Please enter both host and token.')
      return
    }
    setTesting(true)
    setConnectionMsg(null)
    try {
      const result = await checkHealth(auth.host, auth.token)
      auth.setConnected(result.ok)
      setConnectionMsg(result.ok ? 'Connected successfully!' : result.message || 'Connection failed.')
    } catch {
      auth.setConnected(false)
      setConnectionMsg('Connection failed.')
    } finally {
      setTesting(false)
    }
  }

  const handleRefreshModels = async () => {
    if (!auth.host || !auth.token) return
    setLoadingModels(true)
    try {
      const result = await listModels(auth.host, auth.token)
      setModels(result.models || [])
    } catch {
      /* keep current */
    } finally {
      setLoadingModels(false)
    }
  }

  const handleRefreshWarehouses = async () => {
    if (!auth.host || !auth.token) return
    setLoadingWarehouses(true)
    try {
      const result = await listWarehouses(auth.host, auth.token)
      setWarehouses(result.warehouses || [])
    } catch {
      /* keep current */
    } finally {
      setLoadingWarehouses(false)
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) settings.setSettingsOpen(false)
      }}
    >
      <div className="modal-content" style={{ maxWidth: 920, maxHeight: '90vh' }}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
        >
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-base font-semibold"
            style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Configuration
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <button onClick={() => settings.setSettingsOpen(false)} className="toolbar-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isExpanded && (
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 60px)' }}>
            {/* Tab Navigation */}
            <div
              className="flex border-b px-5"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className="px-4 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === tab.key ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    color: activeTab === tab.key ? 'var(--accent-primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-5">
              {/* ═══════════ GENERAL TAB ═══════════ */}
              {activeTab === 'general' && (
                <>
                  {/* Default AI Model */}
                  <Section title="Default AI Model">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {models.length > 0
                          ? `${models.length} models available from your workspace`
                          : 'Configure host & token to load available models.'}
                      </span>
                      <button
                        onClick={handleRefreshModels}
                        disabled={loadingModels}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                        style={{ color: 'var(--text-muted)', border: '1px solid var(--border-primary)', background: 'none', cursor: 'pointer' }}
                      >
                        {loadingModels ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        {loadingModels ? 'Loading...' : 'Refresh Models'}
                      </button>
                    </div>
                    <div className="relative">
                      {models.length > 0 ? (
                        <select
                          value={settings.defaultModel}
                          onChange={(e) => settings.setDefaultModel(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-sm outline-none appearance-none"
                          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}
                        >
                          {!models.includes(settings.defaultModel) && (
                            <option value={settings.defaultModel}>{settings.defaultModel} (saved)</option>
                          )}
                          {models.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={settings.defaultModel}
                          onChange={(e) => settings.setDefaultModel(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}
                        />
                      )}
                    </div>
                  </Section>

                  {/* Display Options */}
                  <Section title="Display Options">
                    <Checkbox
                      checked={settings.showInlineSystemPrompt}
                      onChange={(v) => settings.setShowInlineSystemPrompt(v)}
                      label="Show Inline System Prompt"
                      hint="Display the per-chat system prompt editor in Data Q&A."
                    />
                    <Checkbox
                      checked={settings.showAiMetadata}
                      onChange={(v) => settings.setShowAiMetadata(v)}
                      label="Show AI Metadata"
                      hint="Display model, tokens, duration, and cost info in AI responses."
                    />
                    <Checkbox
                      checked={settings.enableAiSuggest}
                      onChange={(v) => settings.setEnableAiSuggest(v)}
                      label="Enable AI Suggest for JSON Body"
                      hint="Show AI-powered parameter suggestions in Request Composer."
                    />
                  </Section>

                  {/* Pagination Defaults */}
                  <Section title="Pagination Defaults">
                    <div
                      className="p-3 rounded-lg text-xs mb-3"
                      style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-muted)', lineHeight: 1.6 }}
                    >
                      <strong style={{ color: 'var(--text-primary)' }}>Pagination Support</strong>
                      <br />
                      Endpoints marked with <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Paginated</span> badge support fetching large result sets.
                      Set defaults below. Use Previous/Next to navigate pages.
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>Items per page:</label>
                        <input
                          type="number"
                          value={settings.paginationLimit}
                          onChange={(e) => settings.setPaginationLimit(Math.max(1, parseInt(e.target.value) || 25))}
                          min={1}
                          max={1000}
                          className="w-20 px-2 py-1 rounded text-xs outline-none"
                          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}
                        />
                      </div>
                      <Checkbox
                        checked={settings.paginationAutoFetch}
                        onChange={(v) => settings.setPaginationAutoFetch(v)}
                        label="Auto-fetch all pages"
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>Max pages:</label>
                        <input
                          type="number"
                          value={settings.paginationMaxPages}
                          onChange={(e) => settings.setPaginationMaxPages(Math.max(1, parseInt(e.target.value) || 10))}
                          min={1}
                          max={100}
                          className="w-20 px-2 py-1 rounded text-xs outline-none"
                          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}
                        />
                      </div>
                    </div>
                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                      These defaults apply when paginating API responses. You can override per request via query params.
                    </p>
                  </Section>

                  {/* Safety Options */}
                  <Section title="Safety Options">
                    <Checkbox
                      checked={settings.allowDelete}
                      onChange={(v) => settings.setAllowDelete(v)}
                      label="Allow DELETE Requests"
                      hint="Protects against accidental destructive API calls."
                    />
                  </Section>

                  {/* AI Features (12 toggles, 2-col grid) */}
                  <Section title="AI Features">
                    <div className="grid grid-cols-2 gap-3">
                      <FeatureCheckbox checked={settings.features.dataQA} onChange={(v) => settings.setFeature('dataQA', v)} label="Data Q&A" />
                      <FeatureCheckbox checked={settings.features.findEndpoint} onChange={(v) => settings.setFeature('findEndpoint', v)} label="Find Endpoint" />
                      <FeatureCheckbox checked={settings.features.workflowBuilder} onChange={(v) => settings.setFeature('workflowBuilder', v)} label="Workflow" />
                      <FeatureCheckbox checked={settings.features.codeGeneration} onChange={(v) => settings.setFeature('codeGeneration', v)} label="Code Gen" />
                      <FeatureCheckbox checked={settings.features.testDataGenerator} onChange={(v) => settings.setFeature('testDataGenerator', v)} label="Generate Test" />
                      <FeatureCheckbox checked={settings.features.security} onChange={(v) => settings.setFeature('security', v)} label="Security" />
                      <FeatureCheckbox checked={settings.features.promptGenerator} onChange={(v) => settings.setFeature('promptGenerator', v)} label="Prompt Generator" />
                      <FeatureCheckbox checked={settings.features.aiScripting} onChange={(v) => settings.setFeature('aiScripting', v)} label="AI Scripting" />
                      <FeatureCheckbox checked={settings.features.agentChat} onChange={(v) => settings.setFeature('agentChat', v)} label="Agent Chat" />
                      <FeatureCheckbox checked={settings.features.queryBuilder} onChange={(v) => settings.setFeature('queryBuilder', v)} label="Query Builder" />
                      <FeatureCheckbox checked={settings.features.testData} onChange={(v) => settings.setFeature('testData', v)} label="Test Data" />
                      <FeatureCheckbox checked={settings.features.apiDocs} onChange={(v) => settings.setFeature('apiDocs', v)} label="API Docs" />
                    </div>
                  </Section>

                  {/* UI Components (5 toggles, 2-col grid) */}
                  <Section title="UI Components">
                    <div className="grid grid-cols-2 gap-3">
                      <FeatureCheckbox checked={settings.uiComponents.aiAssistant} onChange={(v) => settings.setUiComponent('aiAssistant', v)} label="AI Assistant" />
                      <FeatureCheckbox checked={settings.uiComponents.agents} onChange={(v) => settings.setUiComponent('agents', v)} label="Agents" />
                      <FeatureCheckbox checked={settings.uiComponents.history} onChange={(v) => settings.setUiComponent('history', v)} label="History" />
                      <FeatureCheckbox checked={settings.uiComponents.export} onChange={(v) => settings.setUiComponent('export', v)} label="Export" />
                      <FeatureCheckbox checked={settings.uiComponents.naturalLanguageToApi} onChange={(v) => settings.setUiComponent('naturalLanguageToApi', v)} label="Natural Language to API" />
                    </div>
                  </Section>

                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    These settings are stored locally in your browser.
                  </p>
                </>
              )}

              {/* ═══════════ CONNECTION TAB ═══════════ */}
              {activeTab === 'connection' && (
                <ConnectionTab
                  testing={testing}
                  connectionMsg={connectionMsg}
                  showToken={showToken}
                  setShowToken={setShowToken}
                  onTestConnection={handleTestConnection}
                  warehouses={warehouses}
                  loadingWarehouses={loadingWarehouses}
                  onRefreshWarehouses={handleRefreshWarehouses}
                />
              )}

              {/* ═══════════ AI & PRICING TAB ═══════════ */}
              {activeTab === 'ai' && (
                <>
                  {/* Max Tokens */}
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Max Completion Tokens</span>
                      <input
                        type="number"
                        min={200}
                        max={8000}
                        step={50}
                        value={settings.maxTokens}
                        onChange={(e) => {
                          const next = parseInt(e.target.value, 10)
                          if (Number.isFinite(next) && next > 0) settings.setMaxTokens(next)
                        }}
                        className="w-28 px-2 py-1 rounded text-xs outline-none"
                        style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}
                      />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Used for AI workflow and scripting generations.
                      </span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)' }}
                  >
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Token Pricing</span>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Configure the DBU rate to estimate costs for AI operations.
                    </p>

                    <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                      <div className="flex items-center gap-3 mb-2">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Cloud Provider:</label>
                        <select
                          value={settings.cloudProvider}
                          onChange={(e) => settings.setCloudProvider(e.target.value as 'azure' | 'aws' | 'gcp')}
                          className="px-2 py-1 rounded text-xs outline-none"
                          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}
                        >
                          <option value="azure">Azure</option>
                          <option value="aws">AWS</option>
                          <option value="gcp">GCP</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>DBU Rate ($/DBU):</label>
                        <input
                          type="number"
                          value={settings.dbuRate}
                          onChange={(e) => settings.setDbuRate(Math.max(0, parseFloat(e.target.value) || 0))}
                          min={0}
                          step={0.01}
                          className="w-24 px-2 py-1 rounded text-xs outline-none"
                          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}
                        />
                        <div className="flex items-center gap-1 flex-wrap">
                          {[0.07, 0.10, 0.15, 0.22].map((rate) => (
                            <button
                              key={rate}
                              onClick={() => settings.setDbuRate(rate)}
                              className="px-2 py-0.5 rounded text-[10px]"
                              style={{
                                backgroundColor: settings.dbuRate === rate ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                color: settings.dbuRate === rate ? '#fff' : 'var(--text-muted)',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              ${rate.toFixed(2)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Token Presets */}
                  <Section title="Quick Token Presets">
                    <div className="flex items-center gap-2 flex-wrap">
                      {[1024, 2048, 4096, 8192, 16384].map((val) => (
                        <button
                          key={val}
                          onClick={() => settings.setMaxTokens(val)}
                          className="px-3 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: settings.maxTokens === val ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                            color: settings.maxTokens === val ? '#fff' : 'var(--text-secondary)',
                            border: `1px solid ${settings.maxTokens === val ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                            cursor: 'pointer',
                          }}
                        >
                          {val.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </Section>
                </>
              )}

              {/* ═══════════ PROMPTS TAB ═══════════ */}
              {activeTab === 'prompts' && (
                <PromptsTab />
              )}

              {/* ═══════════ CHARTS TAB ═══════════ */}
              {activeTab === 'charts' && (
                <>
                  <Section title="Chart Types">
                    <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                      Enable or disable specific chart types for data visualization. Disabled charts won't appear in the chart type selector.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <ChartToggle checked={settings.chartTypes.bar} onChange={(v) => settings.setChartType('bar', v)} label="Bar Chart" />
                      <ChartToggle checked={settings.chartTypes.line} onChange={(v) => settings.setChartType('line', v)} label="Line Chart" />
                      <ChartToggle checked={settings.chartTypes.area} onChange={(v) => settings.setChartType('area', v)} label="Area Chart" />
                      <ChartToggle checked={settings.chartTypes.pie} onChange={(v) => settings.setChartType('pie', v)} label="Pie Chart" />
                      <ChartToggle checked={settings.chartTypes.scatter} onChange={(v) => settings.setChartType('scatter', v)} label="Scatter Plot" />
                      <ChartToggle checked={settings.chartTypes.radar} onChange={(v) => settings.setChartType('radar', v)} label="Radar Chart" />
                      <ChartToggle checked={settings.chartTypes.boxplot} onChange={(v) => settings.setChartType('boxplot', v)} label="Boxplot Chart" />
                      <ChartToggle checked={settings.chartTypes.heatmap} onChange={(v) => settings.setChartType('heatmap', v)} label="Heatmap" />
                      <ChartToggle checked={settings.chartTypes.histogram} onChange={(v) => settings.setChartType('histogram', v)} label="Histogram" />
                      <ChartToggle checked={settings.chartTypes.waterfall} onChange={(v) => settings.setChartType('waterfall', v)} label="Waterfall" />
                      <ChartToggle checked={settings.chartTypes.funnel} onChange={(v) => settings.setChartType('funnel', v)} label="Funnel" />
                      <ChartToggle checked={settings.chartTypes.sankey} onChange={(v) => settings.setChartType('sankey', v)} label="Sankey" />
                    </div>
                  </Section>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Connection Tab ─── */

interface ConnectionTabProps {
  testing: boolean
  connectionMsg: string | null
  showToken: boolean
  setShowToken: (v: boolean) => void
  onTestConnection: () => void
  warehouses: { id: string; name: string }[]
  loadingWarehouses: boolean
  onRefreshWarehouses: () => void
}

function ConnectionTab({ testing, connectionMsg, showToken, setShowToken, onTestConnection, warehouses, loadingWarehouses, onRefreshWarehouses }: ConnectionTabProps) {
  const settings = useSettingsStore()
  const auth = useAuthStore()

  // Azure login state
  const [azureLoggedIn, setAzureLoggedIn] = useState(false)
  const [azureLoginLoading, setAzureLoginLoading] = useState(false)
  const [azureLoginInfo, setAzureLoginInfo] = useState<{ user_name: string; method: string } | null>(null)
  const [tenants, setTenants] = useState<Array<{ tenantId: string; displayName: string }>>([])
  const [selectedTenant, setSelectedTenant] = useState('')
  const [allSubscriptions, setAllSubscriptions] = useState<Array<{ subscriptionId: string; displayName: string; tenantId: string }>>([])
  const [subscriptions, setSubscriptions] = useState<Array<{ subscriptionId: string; displayName: string; tenantId: string }>>([])
  const [selectedSubscription, setSelectedSubscription] = useState('')
  const [azureWorkspaces, setAzureWorkspaces] = useState<Array<{ id: string; name: string; resourceGroup: string; location: string }>>([])
  const [workspacesLoading, setWorkspacesLoading] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState('')
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Check azure status on mount
  useEffect(() => {
    if (auth.azureAuthenticated && auth.azureUsername) {
      setAzureLoggedIn(true)
      setAzureLoginInfo({ user_name: auth.azureUsername, method: '' })
    }
  }, [auth.azureAuthenticated, auth.azureUsername])

  const handleAzureLogin = async () => {
    setAzureLoginLoading(true)
    setAzureLoggedIn(false)
    setAzureLoginInfo(null)
    setTenants([])
    setAllSubscriptions([])
    setSubscriptions([])
    setAzureWorkspaces([])
    setSelectedTenant('')
    setSelectedSubscription('')
    setSelectedWorkspace('')
    setStatusMsg(null)
    try {
      // This call may open a system browser for interactive login
      const resp = await azureLogin()
      setAzureLoginInfo({ user_name: resp.user_name, method: resp.method })
      setAzureLoggedIn(true)
      auth.setAzureSession('active', resp.user_name)
      // Load tenants and subscriptions
      const [tenantsResult, subsResult] = await Promise.all([listAzureTenants(), listAzureSubscriptions()])
      setTenants((tenantsResult.tenants || []).map((t: Record<string, string>) => ({ tenantId: t.tenantId || '', displayName: t.displayName || t.tenantId || '' })))
      const allSubs = (subsResult.subscriptions || []).map((s: Record<string, string>) => ({ subscriptionId: s.subscriptionId || '', displayName: s.displayName || s.subscriptionId || '', tenantId: s.tenantId || '' }))
      setAllSubscriptions(allSubs)
      setSubscriptions(allSubs)
      setStatusMsg({ type: 'success', text: `Azure login successful via ${resp.method.replace(/_/g, ' ')}` })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Azure login failed'
      setStatusMsg({ type: 'error', text: msg })
    } finally {
      setAzureLoginLoading(false)
    }
  }

  const handleTenantChange = async (tenantId: string) => {
    setSelectedTenant(tenantId)
    setAzureWorkspaces([])
    setSelectedSubscription('')
    setSelectedWorkspace('')
    if (!tenantId) {
      setSubscriptions(allSubscriptions)
      return
    }
    // Filter subscriptions to only show ones belonging to the selected tenant
    setSubscriptions(allSubscriptions.filter((s) => s.tenantId === tenantId))
    try {
      await azureLoginTenant(tenantId)
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to switch tenant context' })
    }
  }

  const handleSubscriptionChange = async (subId: string) => {
    setSelectedSubscription(subId)
    setAzureWorkspaces([])
    setSelectedWorkspace('')
    if (!subId) return
    setWorkspacesLoading(true)
    try {
      const result = await listAzureWorkspaces(subId)
      setAzureWorkspaces((result.workspaces || []).map((w: Record<string, string>) => ({
        id: w.id || '',
        name: w.name || '',
        resourceGroup: w.resourceGroup || '',
        location: w.location || '',
      })))
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to load workspaces' })
    } finally {
      setWorkspacesLoading(false)
    }
  }

  const handleWorkspaceSelect = async (resourceId: string) => {
    setSelectedWorkspace(resourceId)
    if (!resourceId) return
    try {
      const result = await databricksWorkspaceAccess(resourceId)
      if (result.workspace_url && result.token) {
        auth.setCredentials(result.workspace_url, result.token)
        auth.setConnected(false)
        setStatusMsg({ type: 'success', text: `Connected to ${result.name || 'workspace'} — click Save Settings.` })
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to get workspace access token' })
    }
  }

  const handleClearAll = async () => {
    try { await azureLogout() } catch { /* ignore */ }
    auth.clearAll()
    setAzureLoggedIn(false)
    setAzureLoginInfo(null)
    setTenants([])
    setAllSubscriptions([])
    setSubscriptions([])
    setAzureWorkspaces([])
    setSelectedTenant('')
    setSelectedSubscription('')
    setSelectedWorkspace('')
    setStatusMsg(null)
  }

  const handleSave = () => {
    setStatusMsg({ type: 'success', text: 'Settings saved.' })
  }

  const inputStyle = { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }

  return (
    <>
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Databricks Workspace Connection
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Configure your Databricks workspace connection. Choose an authentication method below.
        </p>
      </div>

      {/* Authentication Method */}
      <Section title="Authentication Method">
        <select
          value={settings.authMethod}
          onChange={(e) => settings.setAuthMethod(e.target.value as 'pat' | 'azure-workspace')}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={inputStyle}
        >
          <option value="pat">Personal Access Token (PAT)</option>
          <option value="azure-workspace">Azure Login (Select Workspace)</option>
        </select>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {settings.authMethod === 'pat'
            ? 'Enter your workspace host URL and a personal access token.'
            : 'Login via Azure CLI or browser, pick a tenant & subscription, then select a Databricks workspace.'}
        </p>
      </Section>

      {/* PAT Mode */}
      {settings.authMethod === 'pat' && (
        <>
          <Section title="Workspace Host URL">
            <input
              type="text"
              value={auth.host}
              onChange={(e) => auth.setCredentials(e.target.value, auth.token)}
              placeholder="https://adb-xxxxx.azuredatabricks.net"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={inputStyle}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Falls back to server env if empty.</p>
          </Section>

          <Section title="Personal Access Token">
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={auth.token}
                onChange={(e) => auth.setCredentials(auth.host, e.target.value)}
                placeholder="dapi..."
                className="w-full px-3 py-2 pr-10 rounded-lg text-sm outline-none font-mono"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Falls back to server env if empty.</p>
          </Section>
        </>
      )}

      {/* Azure Login Mode */}
      {settings.authMethod === 'azure-workspace' && (
        <div className="space-y-4">
          {/* Login Button */}
          <button
            onClick={handleAzureLogin}
            disabled={azureLoginLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-opacity"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              color: '#fff',
              border: 'none',
              cursor: azureLoginLoading ? 'wait' : 'pointer',
              opacity: azureLoginLoading ? 0.7 : 1,
            }}
          >
            {azureLoginLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Connecting to Azure...</>
            ) : (
              <><Shield className="w-4 h-4" /> Login with Azure</>
            )}
          </button>

          {/* Logged-in badge */}
          {azureLoggedIn && azureLoginInfo && (
            <p className="text-xs flex items-center gap-1" style={{ color: 'var(--accent-success)' }}>
              <span>&#10003;</span> Signed in as <strong>{azureLoginInfo.user_name || 'Azure User'}</strong>
              {azureLoginInfo.method && <> via {azureLoginInfo.method.replace(/_/g, ' ')}</>}
            </p>
          )}

          {/* Tenant dropdown */}
          {azureLoggedIn && tenants.length > 0 && (
            <Section title="Tenant">
              <select
                value={selectedTenant}
                onChange={(e) => handleTenantChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={inputStyle}
              >
                <option value="">-- Select tenant --</option>
                {tenants.map((t) => (
                  <option key={t.tenantId} value={t.tenantId}>{t.displayName || t.tenantId}</option>
                ))}
              </select>
            </Section>
          )}

          {/* Subscription dropdown */}
          {azureLoggedIn && subscriptions.length > 0 && (
            <Section title="Subscription">
              <select
                value={selectedSubscription}
                onChange={(e) => handleSubscriptionChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={inputStyle}
              >
                <option value="">-- Select subscription --</option>
                {subscriptions.map((s) => (
                  <option key={s.subscriptionId} value={s.subscriptionId}>{s.displayName || s.subscriptionId}</option>
                ))}
              </select>
            </Section>
          )}

          {/* Workspace dropdown */}
          {selectedSubscription && (
            <Section title="Databricks Workspace">
              {workspacesLoading ? (
                <div className="flex items-center gap-2 text-xs py-2" style={{ color: 'var(--text-muted)' }}>
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading workspaces...
                </div>
              ) : (
                <select
                  value={selectedWorkspace}
                  onChange={(e) => handleWorkspaceSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={inputStyle}
                >
                  <option value="">-- Select workspace --</option>
                  {azureWorkspaces.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                  ))}
                </select>
              )}
            </Section>
          )}

          {/* Auto-filled confirmation */}
          {auth.host && selectedWorkspace && (
            <p className="text-xs" style={{ color: 'var(--accent-success)' }}>
              Workspace URL and Azure AD token populated — click Save Settings.
            </p>
          )}
        </div>
      )}

      {/* SQL Warehouse */}
      <Section title="SQL Warehouse">
        <div className="flex items-center gap-2 mb-2">
          {warehouses.length > 0 ? (
            <div className="relative flex-1">
              <select
                value={settings.warehouseId}
                onChange={(e) => settings.setWarehouseId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none appearance-none"
                style={inputStyle}
              >
                <option value="">Select a warehouse...</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>{wh.name} ({wh.id})</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            </div>
          ) : (
            <input
              type="text"
              value={settings.warehouseId}
              onChange={(e) => settings.setWarehouseId(e.target.value)}
              placeholder="Enter warehouse ID or load from workspace"
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
              style={inputStyle}
            />
          )}
          <button
            onClick={onRefreshWarehouses}
            disabled={loadingWarehouses}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium shrink-0"
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {loadingWarehouses ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Load
          </button>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Used for Data QA and SQL query execution features.</p>
      </Section>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleClearAll}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: 'var(--danger-bg-light)', color: 'var(--accent-error)', border: 'none', cursor: 'pointer' }}
        >
          <Trash2 className="w-4 h-4" /> Clear All
        </button>
        <button
          onClick={onTestConnection}
          disabled={testing || !auth.host}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)', cursor: 'pointer' }}
        >
          {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
          Test Connection
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: 'var(--accent-error)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </div>

      {/* Status messages */}
      {(connectionMsg || statusMsg) && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
          style={{
            backgroundColor: (statusMsg?.type === 'success' || (connectionMsg && auth.isConnected)) ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: (statusMsg?.type === 'success' || (connectionMsg && auth.isConnected)) ? 'var(--accent-success)' : 'var(--accent-error)',
            border: `1px solid ${(statusMsg?.type === 'success' || (connectionMsg && auth.isConnected)) ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          }}
        >
          {statusMsg?.text || connectionMsg}
        </div>
      )}

      {/* Info Box */}
      <div
        className="flex items-start gap-2 p-3 rounded-lg"
        style={{ backgroundColor: 'var(--info-bg)', border: '1px solid var(--info-border)' }}
      >
        <span style={{ color: 'var(--info-text)' }}>i</span>
        <p className="text-sm" style={{ color: 'var(--info-text)' }}>
          {settings.authMethod === 'pat'
            ? 'Enter your Databricks workspace host URL and personal access token. Generate a token from Databricks Settings > Developer > Access tokens.'
            : 'Logs in via Azure CLI or interactive browser, then lets you browse your tenants, subscriptions, and Databricks workspaces. The workspace URL and an Azure AD token scoped to Databricks are auto-populated on selection.'}
        </p>
      </div>
    </>
  )
}

/* ─── Prompts Tab ─── */

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
    label: 'DATA Q&A SYSTEM PROMPT',
    featureNote: 'Stored locally and applied to Data & Platform Q&A.',
    defaultText: `You are a Databricks SQL expert. Generate ONLY valid, executable SQL.

## CRITICAL SQL RULES FOR UNITY CATALOG:

### NEVER DO THESE (will cause errors):
- NEVER use placeholder variables like {schema}, {table}, {catalog_name} \u2013 SQL doesn\u2019t support this
- NEVER write \`system.information_schema.tables WHERE catalog_name = 'X'\` \u2013 use \`X.information_schema.tables\` instead
- NEVER use dynamic correlated subqueries with table names as variables
- NEVER suggest the user "replace X with Y" \u2013 generate the actual query

### CORRECT PATTERNS:

**List schemas in a catalog:**
\`\`\`sql
SHOW SCHEMAS IN catalog_name;
\`\`\`

**List tables in a catalog:**
\`\`\`sql
SHOW TABLES IN catalog_name;
-- OR
SELECT table_schema, table_name, table_type
FROM catalog_name.information_schema.tables;
\`\`\`

**List tables in a specific schema:**
\`\`\`sql
SHOW TABLES IN catalog_name.schema_name;
-- OR
SELECT table_name, table_type
FROM catalog_name.information_schema.tables
WHERE table_schema = 'schema_name';
\`\`\`

**Row counts:**
\`\`\`sql
SELECT COUNT(*) as row_count FROM catalog_name.schema_name.table_name;
\`\`\`

**Column info:**
\`\`\`sql
DESCRIBE TABLE catalog_name.schema_name.table_name;
-- OR
SELECT column_name, data_type, is_nullable
FROM catalog_name.information_schema.columns
WHERE table_schema = 'schema_name' AND table_name = 'table_name';
\`\`\`

**Sample data:**
\`\`\`sql
SELECT * FROM catalog_name.schema_name.table_name LIMIT 10;
\`\`\`

## RESPONSE FORMAT:
- Return SQL in a markdown code block
- Always use fully qualified names: catalog.schema.table
- Explain what the query does after the code block`,
  },
  {
    key: 'naturalLanguage',
    emoji: '\uD83D\uDCF7',
    label: 'NATURAL LANGUAGE TO API PROMPT',
    featureNote: 'Stored locally and applied to Natural Language to API feature.',
    defaultText: `You are an expert Databricks REST API translator. Convert the user's natural language request into a precise Databricks API call.

Return a JSON object with these fields:
- "method": HTTP method (GET, POST, PUT, PATCH, DELETE)
- "path": Full API path starting with /api/
- "body": Request body object (or {} if none needed)
- "explanation": Brief description of what the API call does
- "confidence": "high", "medium", or "low"

Examples:

Query: "list all tables in the main catalog"
Response:
{
  "method": "GET",
  "path": "/api/2.1/unity-catalog/tables?catalog_name=main",
  "body": {},
  "explanation": "Lists all tables in the 'main' catalog across all schemas",
  "confidence": "high"
}

Query: "show users in workspace"
Response:
{
  "method": "GET",
  "path": "/api/2.0/preview/scim/v2/Users",
  "body": {},
  "explanation": "Lists all users in the Databricks workspace using SCIM API",
  "confidence": "high"
}

IMPORTANT: Return ONLY the JSON object, no markdown code blocks, no explanations outside the JSON.`,
  },
  {
    key: 'aiSuggest',
    emoji: '\uD83D\uDCA1',
    label: 'AI SUGGEST SYSTEM PROMPT',
    featureNote: 'Stored locally and applied to AI Suggest for JSON body.',
    defaultText: `You are a Databricks API expert. Suggest the best parameters and configuration for the given API endpoint based on user intent.

When suggesting parameters:
- Provide a valid JSON request body
- Include only relevant fields
- Add brief comments explaining each parameter
- Consider best practices and common patterns
- Suggest safe defaults where applicable`,
  },
  {
    key: 'aiFix',
    emoji: '\uD83D\uDD27',
    label: 'AI FIX / ERROR EXPLANATION PROMPT',
    featureNote: 'Stored locally and applied to error analysis and fix suggestions.',
    defaultText: `You are a Databricks troubleshooting expert. Analyze the error response and provide:

1. **Root Cause**: What went wrong and why
2. **Fix**: Step-by-step instructions to resolve the issue
3. **Corrected Request**: If applicable, show the fixed API request
4. **Prevention**: How to avoid this error in the future

Be concise but thorough. If the error is auth-related, suggest checking token permissions.`,
  },
  {
    key: 'findEndpoint',
    emoji: '\uD83D\uDD0D',
    label: 'FIND ENDPOINT PROMPT',
    featureNote: 'Stored locally and applied to endpoint discovery.',
    defaultText: `You are a Databricks API expert. Given a user's question, recommend the best Databricks REST API endpoint(s) to use.
Include the HTTP method, full path, required parameters, and a brief explanation.`,
  },
  {
    key: 'analyzeResponse',
    emoji: '\uD83D\uDCCA',
    label: 'ANALYZE RESPONSE PROMPT',
    featureNote: 'Stored locally and applied to response analysis.',
    defaultText: `Analyze this Databricks API response. Provide key insights, notable patterns, potential issues, and recommendations.`,
  },
  {
    key: 'workflowBuilder',
    emoji: '\u2699\uFE0F',
    label: 'WORKFLOW BUILDER PROMPT',
    featureNote: 'Stored locally and applied to workflow generation.',
    defaultText: `Generate a Databricks workflow as a sequence of API calls. For each step include:
- Step number and description
- HTTP method and endpoint
- Request body
- Expected response
- Dependencies on previous steps`,
  },
  {
    key: 'promptGenerator',
    emoji: '\u2728',
    label: 'PROMPT GENERATOR PROMPT',
    featureNote: 'Stored locally and applied to prompt generation.',
    defaultText: `Generate an optimized system prompt for an AI assistant based on the user's goal. The prompt should be clear, specific, and include relevant constraints and output format requirements.`,
  },
  {
    key: 'codeGeneration',
    emoji: '\uD83D\uDCBB',
    label: 'CODE GENERATION PROMPT',
    featureNote: 'Stored locally and applied to code sample generation.',
    defaultText: `Generate code samples for calling this Databricks API endpoint in Python, JavaScript, cURL, and Go. Include proper error handling and authentication headers.`,
  },
  {
    key: 'apiDocs',
    emoji: '\uD83D\uDCD6',
    label: 'API DOCUMENTATION PROMPT',
    featureNote: 'Stored locally and applied to API documentation generation.',
    defaultText: `Generate comprehensive API documentation for this Databricks endpoint in Markdown format. Include parameters, request/response examples, and common use cases.`,
  },
  {
    key: 'testData',
    emoji: '\uD83E\uDDEA',
    label: 'TEST DATA GENERATOR PROMPT',
    featureNote: 'Stored locally and applied to test case generation.',
    defaultText: `Generate test cases for the given Databricks API endpoint. Include positive tests, negative tests, edge cases, and expected responses.`,
  },
  {
    key: 'security',
    emoji: '\uD83D\uDD12',
    label: 'SECURITY ANALYSIS PROMPT',
    featureNote: 'Stored locally and applied to security recommendations.',
    defaultText: `Provide security recommendations for this Databricks API endpoint. Cover authentication, authorization, data protection, and best practices.`,
  },
  {
    key: 'aiScripting',
    emoji: '\uD83D\uDCDD',
    label: 'AI SCRIPTING PROMPT',
    featureNote: 'Stored locally and applied to automation script generation.',
    defaultText: `Generate a Python script for Databricks automation.
The script should use the databricks-sdk or REST API calls.
Include error handling and logging. Return ONLY the Python code.`,
  },
  {
    key: 'agent',
    emoji: '\uD83E\uDD16',
    label: 'AGENT CHAT PROMPT',
    featureNote: 'Stored locally and applied to Agent Chat.',
    defaultText: `You are a helpful Databricks assistant. Help users manage their workspace, run queries, and understand their data.`,
  },
]

const PREVIEW_TABS: { key: PromptKey; label: string; emoji: string }[] = [
  { key: 'aiSuggest', label: 'Suggest', emoji: '\uD83D\uDCA1' },
  { key: 'aiFix', label: 'Fix', emoji: '\uD83D\uDD27' },
  { key: 'dataQA', label: 'Data Q&A', emoji: '\uD83D\uDFE2' },
  { key: 'promptGenerator', label: 'Prompt Gen', emoji: '\u2728' },
  { key: 'naturalLanguage', label: 'NL\u2192API', emoji: '\uD83D\uDCF7' },
]

function PromptsTab() {
  const settings = useSettingsStore()
  const [previewTab, setPreviewTab] = useState<PromptKey>('aiSuggest')

  const customCount = ALL_PROMPTS.filter((p) => (settings.prompts[p.key] ?? '').trim() !== '').length
  const hasAnyCustom = customCount > 0

  const handleResetAll = () => {
    ALL_PROMPTS.forEach((p) => settings.setPrompt(p.key, ''))
  }

  const handleGeneratePreview = () => {
    const def = ALL_PROMPTS.find((p) => p.key === previewTab)
    if (!def) return
    const currentValue = (settings.prompts[previewTab] ?? '').trim()
    if (!currentValue) {
      settings.setPrompt(previewTab, def.defaultText)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Customize the system prompts used by each AI feature. Leave empty to use built-in defaults.
            {hasAnyCustom && (
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}>
                {customCount} custom
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleResetAll}
          disabled={!hasAnyCustom}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-40 shrink-0"
          style={{ backgroundColor: 'var(--accent-danger)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All
        </button>
      </div>

      {/* Individual Prompt Sections */}
      {ALL_PROMPTS.map((prompt) => {
        const value = (settings.prompts[prompt.key] ?? '').trim()
        const displayValue = value || prompt.defaultText
        const isCustom = value !== '' && value !== prompt.defaultText
        return (
          <div
            key={prompt.key}
            className="rounded-lg p-4 space-y-2"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{prompt.emoji}</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{prompt.label}</span>
                {isCustom && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}>
                    Custom
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isCustom && (
                  <button
                    onClick={() => settings.setPrompt(prompt.key, '')}
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ color: 'var(--text-muted)', background: 'var(--bg-tertiary)', border: 'none', cursor: 'pointer' }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={displayValue}
              onChange={(e) => settings.setPrompt(prompt.key, e.target.value)}
              rows={Math.min(Math.max(displayValue.split('\n').length + 1, 3), 12)}
              className="w-full px-3 py-2 rounded-lg text-xs outline-none font-mono resize-y"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: `1px solid ${isCustom ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                minHeight: 60,
                lineHeight: 1.5,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = isCustom ? 'var(--accent-primary)' : 'var(--border-primary)')}
            />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {isCustom ? `\u2728 Custom prompt \u00B7 ${value.length} characters` : `\u2728 ${prompt.featureNote}`}
            </p>
          </div>
        )
      })}

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
    </>
  )
}

/* ─── Helper Components ─── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</div>
      {children}
    </div>
  )
}

function Checkbox({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <div className="flex items-center gap-2.5 mt-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-[var(--accent-primary)]"
      />
      <label className="text-sm" style={{ color: 'var(--text-primary)', margin: 0 }}>{label}</label>
      {hint && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</span>}
    </div>
  )
}

function FeatureCheckbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-[var(--accent-primary)]"
      />
      <label className="text-sm" style={{ color: 'var(--text-primary)', margin: 0 }}>{label}</label>
    </div>
  )
}

function ChartToggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div
      className="flex items-center gap-2.5 p-3 rounded-lg"
      style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-[var(--accent-primary)]"
      />
      <label className="text-sm" style={{ color: 'var(--text-primary)', margin: 0, flex: 1 }}>{label}</label>
    </div>
  )
}
