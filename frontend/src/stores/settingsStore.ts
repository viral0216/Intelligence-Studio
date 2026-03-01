import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CloudProvider = 'azure' | 'aws' | 'gcp'
export type AuthMethod = 'pat' | 'azure-workspace'
export type ActiveView = 'explorer'

interface SettingsState {
  // Theme
  theme: 'dark' | 'light'

  // Active view
  activeView: ActiveView

  // Auth
  authMethod: AuthMethod

  // Cloud provider
  cloudProvider: CloudProvider

  // AI
  defaultModel: string
  maxTokens: number
  showAiMetadata: boolean
  showInlineSystemPrompt: boolean
  enableAiSuggest: boolean

  // Warehouse
  warehouseId: string

  // Pagination
  paginationLimit: number
  paginationAutoFetch: boolean
  paginationMaxPages: number

  // Feature toggles (AI tabs)
  features: {
    dataQA: boolean
    findEndpoint: boolean
    workflowBuilder: boolean
    codeGeneration: boolean
    testDataGenerator: boolean
    queryExecution: boolean
    charts: boolean
    security: boolean
    promptGenerator: boolean
    aiScripting: boolean
    agentChat: boolean
    queryBuilder: boolean
    testData: boolean
    apiDocs: boolean
  }

  // UI component toggles
  uiComponents: {
    aiAssistant: boolean
    agents: boolean
    history: boolean
    export: boolean
    naturalLanguageToApi: boolean
  }

  // Chart type toggles
  chartTypes: {
    bar: boolean
    line: boolean
    area: boolean
    pie: boolean
    scatter: boolean
    radar: boolean
    boxplot: boolean
    heatmap: boolean
    histogram: boolean
    waterfall: boolean
    funnel: boolean
    sankey: boolean
  }

  // Custom prompts
  prompts: {
    dataQA: string
    naturalLanguage: string
    aiSuggest: string
    aiFix: string
    promptGenerator: string
    findEndpoint: string
    analyzeResponse: string
    workflowBuilder: string
    codeGeneration: string
    apiDocs: string
    testData: string
    security: string
    aiScripting: string
    agent: string
  }

  // Data Q&A
  dataQaFallbackSuggestions: string[]

  // Pricing
  dbuRate: number

  // UI
  showHistory: boolean
  showAiAssistant: boolean
  showIntegrationExport: boolean
  settingsOpen: boolean
  allowDelete: boolean

  // Actions
  setActiveView: (view: ActiveView) => void
  setTheme: (theme: 'dark' | 'light') => void
  toggleTheme: () => void
  setAuthMethod: (method: AuthMethod) => void
  setCloudProvider: (provider: CloudProvider) => void
  setDefaultModel: (model: string) => void
  setMaxTokens: (tokens: number) => void
  setWarehouseId: (id: string) => void
  setFeature: (key: keyof SettingsState['features'], value: boolean) => void
  setUiComponent: (key: keyof SettingsState['uiComponents'], value: boolean) => void
  setChartType: (key: keyof SettingsState['chartTypes'], value: boolean) => void
  setPrompt: (key: keyof SettingsState['prompts'], value: string) => void
  setDbuRate: (rate: number) => void
  toggleHistory: () => void
  toggleAiAssistant: () => void
  toggleIntegrationExport: () => void
  setSettingsOpen: (open: boolean) => void
  setShowAiMetadata: (show: boolean) => void
  setShowInlineSystemPrompt: (show: boolean) => void
  setEnableAiSuggest: (enable: boolean) => void
  setAllowDelete: (allow: boolean) => void
  setPaginationLimit: (limit: number) => void
  setPaginationAutoFetch: (auto: boolean) => void
  setPaginationMaxPages: (max: number) => void
  setDataQaFallbackSuggestions: (suggestions: string[]) => void
}

export type FeatureKey = keyof SettingsState['features']
export type UiComponentKey = keyof SettingsState['uiComponents']
export type ChartTypeKey = keyof SettingsState['chartTypes']
export type PromptKey = keyof SettingsState['prompts']

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      activeView: 'explorer',
      authMethod: 'pat',
      cloudProvider: 'azure',
      defaultModel: 'databricks-meta-llama-3-1-405b-instruct',
      maxTokens: 4096,
      showAiMetadata: true,
      showInlineSystemPrompt: true,
      enableAiSuggest: true,
      warehouseId: '',
      paginationLimit: 25,
      paginationAutoFetch: false,
      paginationMaxPages: 10,
      features: {
        dataQA: true,
        findEndpoint: true,
        workflowBuilder: true,
        codeGeneration: true,
        testDataGenerator: true,
        queryExecution: true,
        charts: true,
        security: true,
        promptGenerator: true,
        aiScripting: true,
        agentChat: true,
        queryBuilder: true,
        testData: true,
        apiDocs: true,
      },
      uiComponents: {
        aiAssistant: true,
        agents: true,
        history: true,
        export: true,
        naturalLanguageToApi: true,
      },
      chartTypes: {
        bar: true,
        line: true,
        area: true,
        pie: true,
        scatter: false,
        radar: false,
        boxplot: false,
        heatmap: false,
        histogram: false,
        waterfall: false,
        funnel: false,
        sankey: false,
      },
      prompts: {
        dataQA: '',
        naturalLanguage: '',
        aiSuggest: '',
        aiFix: '',
        promptGenerator: '',
        findEndpoint: '',
        analyzeResponse: '',
        workflowBuilder: '',
        codeGeneration: '',
        apiDocs: '',
        testData: '',
        security: '',
        aiScripting: '',
        agent: '',
      },
      dataQaFallbackSuggestions: [
        'Show me row counts for these tables',
        'What columns are in this table?',
        'Run a sample query on this data',
        'How can I join these tables?',
      ],
      dbuRate: 0.07,
      showHistory: false,
      showAiAssistant: false,
      showIntegrationExport: false,
      settingsOpen: false,
      allowDelete: false,

      setActiveView: (activeView) => set({ activeView }),
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme)
        set({ theme })
      },
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark'
          document.documentElement.setAttribute('data-theme', newTheme)
          return { theme: newTheme }
        }),
      setAuthMethod: (authMethod) => set({ authMethod }),
      setCloudProvider: (cloudProvider) => set({ cloudProvider }),
      setDefaultModel: (defaultModel) => set({ defaultModel }),
      setMaxTokens: (maxTokens) => set({ maxTokens }),
      setWarehouseId: (warehouseId) => set({ warehouseId }),
      setFeature: (key, value) =>
        set((state) => ({ features: { ...state.features, [key]: value } })),
      setUiComponent: (key, value) =>
        set((state) => ({ uiComponents: { ...state.uiComponents, [key]: value } })),
      setChartType: (key, value) =>
        set((state) => ({ chartTypes: { ...state.chartTypes, [key]: value } })),
      setPrompt: (key, value) =>
        set((state) => ({ prompts: { ...state.prompts, [key]: value } })),
      setDbuRate: (dbuRate) => set({ dbuRate }),
      toggleHistory: () => set((state) => ({ showHistory: !state.showHistory })),
      toggleAiAssistant: () => set((state) => ({ showAiAssistant: !state.showAiAssistant })),
      toggleIntegrationExport: () => set((state) => ({ showIntegrationExport: !state.showIntegrationExport })),
      setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
      setShowAiMetadata: (showAiMetadata) => set({ showAiMetadata }),
      setShowInlineSystemPrompt: (showInlineSystemPrompt) => set({ showInlineSystemPrompt }),
      setEnableAiSuggest: (enableAiSuggest) => set({ enableAiSuggest }),
      setAllowDelete: (allowDelete) => set({ allowDelete }),
      setPaginationLimit: (paginationLimit) => set({ paginationLimit }),
      setPaginationAutoFetch: (paginationAutoFetch) => set({ paginationAutoFetch }),
      setPaginationMaxPages: (paginationMaxPages) => set({ paginationMaxPages }),
      setDataQaFallbackSuggestions: (dataQaFallbackSuggestions) => set({ dataQaFallbackSuggestions }),
    }),
    {
      name: 'intelligence-settings',
      merge: (persisted, current) => {
        const p = persisted as Partial<SettingsState> | undefined
        if (!p) return current
        return {
          ...current,
          ...p,
          features: { ...current.features, ...(p.features ?? {}) },
          uiComponents: { ...current.uiComponents, ...(p.uiComponents ?? {}) },
          chartTypes: { ...current.chartTypes, ...(p.chartTypes ?? {}) },
          prompts: { ...current.prompts, ...(p.prompts ?? {}) },
        }
      },
    }
  )
)
