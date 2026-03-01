import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CloudProvider = 'azure' | 'aws' | 'gcp'

interface SettingsState {
  // Theme
  theme: 'dark' | 'light'

  // Cloud provider
  cloudProvider: CloudProvider

  // AI
  defaultModel: string
  maxTokens: number
  showAiMetadata: boolean

  // Warehouse
  warehouseId: string

  // Feature toggles
  features: {
    dataQA: boolean
    findEndpoint: boolean
    workflowBuilder: boolean
    codeGeneration: boolean
    testDataGenerator: boolean
    queryExecution: boolean
    charts: boolean
  }

  // Custom prompts
  prompts: {
    dataQA: string
    naturalLanguage: string
    aiSuggest: string
    aiFix: string
  }

  // Pricing
  dbuRate: number

  // UI
  showHistory: boolean
  showAiAssistant: boolean
  showIntegrationExport: boolean
  settingsOpen: boolean
  allowDelete: boolean

  // Actions
  setTheme: (theme: 'dark' | 'light') => void
  toggleTheme: () => void
  setCloudProvider: (provider: CloudProvider) => void
  setDefaultModel: (model: string) => void
  setMaxTokens: (tokens: number) => void
  setWarehouseId: (id: string) => void
  setFeature: (key: keyof SettingsState['features'], value: boolean) => void
  setPrompt: (key: keyof SettingsState['prompts'], value: string) => void
  setDbuRate: (rate: number) => void
  toggleHistory: () => void
  toggleAiAssistant: () => void
  toggleIntegrationExport: () => void
  setSettingsOpen: (open: boolean) => void
  setShowAiMetadata: (show: boolean) => void
  setAllowDelete: (allow: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      cloudProvider: 'azure',
      defaultModel: 'databricks-meta-llama-3-1-405b-instruct',
      maxTokens: 4096,
      showAiMetadata: true,
      warehouseId: '',
      features: {
        dataQA: true,
        findEndpoint: true,
        workflowBuilder: true,
        codeGeneration: true,
        testDataGenerator: true,
        queryExecution: true,
        charts: true,
      },
      prompts: {
        dataQA: '',
        naturalLanguage: '',
        aiSuggest: '',
        aiFix: '',
      },
      dbuRate: 0.07,
      showHistory: false,
      showAiAssistant: false,
      showIntegrationExport: false,
      settingsOpen: false,
      allowDelete: false,

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
      setCloudProvider: (cloudProvider) => set({ cloudProvider }),
      setDefaultModel: (defaultModel) => set({ defaultModel }),
      setMaxTokens: (maxTokens) => set({ maxTokens }),
      setWarehouseId: (warehouseId) => set({ warehouseId }),
      setFeature: (key, value) =>
        set((state) => ({ features: { ...state.features, [key]: value } })),
      setPrompt: (key, value) =>
        set((state) => ({ prompts: { ...state.prompts, [key]: value } })),
      setDbuRate: (dbuRate) => set({ dbuRate }),
      toggleHistory: () => set((state) => ({ showHistory: !state.showHistory })),
      toggleAiAssistant: () => set((state) => ({ showAiAssistant: !state.showAiAssistant })),
      toggleIntegrationExport: () => set((state) => ({ showIntegrationExport: !state.showIntegrationExport })),
      setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
      setShowAiMetadata: (showAiMetadata) => set({ showAiMetadata }),
      setAllowDelete: (allowDelete) => set({ allowDelete }),
    }),
    { name: 'intelligencre-settings' }
  )
)
