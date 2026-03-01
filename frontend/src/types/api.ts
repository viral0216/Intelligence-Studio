export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface PlaygroundRequest {
  method: HttpMethod
  path: string
  body?: unknown
  token?: string
  host?: string
}

export interface PlaygroundResponse {
  status: number
  data: unknown
  headers: Record<string, string>
  durationMs: number
  requestId?: string
}

export interface HistoryItem {
  id: string
  method: HttpMethod
  path: string
  body?: unknown
  timestamp: number
  name?: string
  isFavorite?: boolean
  source?: 'bookmark' | 'recent'
}

export interface ModelCallMetadata {
  model: string
  temperature: number
  maxTokens: number
  promptTokens: number
  completionTokens: number
  totalTokens: number
  durationMs: number
  region?: string
}
