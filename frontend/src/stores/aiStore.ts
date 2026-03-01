import { create } from 'zustand'
import type { AiTab, AiMessage, AgentMessage } from '@/types/ai'
import type { ModelCallMetadata } from '@/types/api'

interface AiState {
  activeTab: AiTab
  isLoading: boolean
  lastMetadata: ModelCallMetadata | null

  // Data QA
  qaMessages: AiMessage[]
  qaInput: string

  // Agent
  agentMessages: AgentMessage[]
  agentInput: string

  // Actions
  setActiveTab: (tab: AiTab) => void
  setLoading: (loading: boolean) => void
  setLastMetadata: (metadata: ModelCallMetadata | null) => void

  // Data QA actions
  addQaMessage: (message: AiMessage) => void
  setQaInput: (input: string) => void
  clearQaMessages: () => void

  // Agent actions
  addAgentMessage: (message: AgentMessage) => void
  setAgentInput: (input: string) => void
  clearAgentMessages: () => void
}

export const useAiStore = create<AiState>((set) => ({
  activeTab: 'data-qa',
  isLoading: false,
  lastMetadata: null,

  qaMessages: [],
  qaInput: '',

  agentMessages: [],
  agentInput: '',

  setActiveTab: (activeTab) => set({ activeTab }),
  setLoading: (isLoading) => set({ isLoading }),
  setLastMetadata: (lastMetadata) => set({ lastMetadata }),

  addQaMessage: (message) =>
    set((state) => ({ qaMessages: [...state.qaMessages, message] })),
  setQaInput: (qaInput) => set({ qaInput }),
  clearQaMessages: () => set({ qaMessages: [] }),

  addAgentMessage: (message) =>
    set((state) => ({ agentMessages: [...state.agentMessages, message] })),
  setAgentInput: (agentInput) => set({ agentInput }),
  clearAgentMessages: () => set({ agentMessages: [] }),
}))
