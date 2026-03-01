export type AiTab =
  | 'data-qa'
  | 'find-endpoint'
  | 'analyze-response'
  | 'error-analysis'
  | 'workflow-builder'
  | 'code-generation'
  | 'test-data'
  | 'api-docs'

export interface AiMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: number
}

export interface AgentMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  metadata?: {
    toolsUsed?: string[]
    executionTime?: number
    model?: string
    tokenUsage?: number
  }
}

export interface CustomAgent {
  id: string
  name: string
  description: string
  pattern: string
  handler: 'api' | 'transform' | 'custom'
  config?: {
    endpoint?: string
    method?: string
    transform?: string
  }
  enabled: boolean
}
