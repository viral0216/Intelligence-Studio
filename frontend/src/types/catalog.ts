import type { HttpMethod } from './api'

export interface QueryParamSpec {
  name: string
  type: string
  required?: boolean
  description?: string
}

export interface ApiEndpoint {
  label: string
  method: HttpMethod
  path: string
  body?: unknown
  requestBodySchema?: Record<string, unknown>
  queryParams?: QueryParamSpec[]
  description?: string
  docs?: {
    summary?: string
    docUrl?: string
    parameters?: string[]
    relatedEndpoints?: string[]
  }
}

export interface ApiSubcategory {
  name: string
  endpoints: ApiEndpoint[]
}

export interface ApiCategory {
  name: string
  icon: string
  audience?: 'workspace' | 'account'
  rateLimitNote?: string
  subcategories?: ApiSubcategory[]
  endpoints?: ApiEndpoint[]
}
