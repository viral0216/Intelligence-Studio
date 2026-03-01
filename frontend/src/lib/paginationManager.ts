/**
 * Pagination management for Databricks API endpoints.
 */

const PAGINATED_ENDPOINTS: Record<string, { tokenParam: string; limitParam: string }> = {
  '/api/2.0/clusters/list': { tokenParam: 'page_token', limitParam: 'max_results' },
  '/api/2.1/jobs/list': { tokenParam: 'page_token', limitParam: 'limit' },
  '/api/2.0/preview/scim/v2/Users': { tokenParam: 'startIndex', limitParam: 'count' },
  '/api/2.0/preview/scim/v2/Groups': { tokenParam: 'startIndex', limitParam: 'count' },
  '/api/2.1/unity-catalog/catalogs': { tokenParam: 'page_token', limitParam: 'max_results' },
  '/api/2.1/unity-catalog/schemas': { tokenParam: 'page_token', limitParam: 'max_results' },
  '/api/2.1/unity-catalog/tables': { tokenParam: 'page_token', limitParam: 'max_results' },
  '/api/2.1/unity-catalog/volumes': { tokenParam: 'page_token', limitParam: 'max_results' },
  '/api/2.0/sql/warehouses': { tokenParam: 'page_token', limitParam: 'max_results' },
  '/api/2.0/workspace/list': { tokenParam: 'page_token', limitParam: 'max_results' },
}

export function isPaginatedEndpoint(path: string): boolean {
  const basePath = path.split('?')[0]
  return basePath in PAGINATED_ENDPOINTS
}

export function getPaginationConfig(path: string) {
  const basePath = path.split('?')[0]
  return PAGINATED_ENDPOINTS[basePath] || null
}

export function extractPaginationToken(response: unknown): string | null {
  if (!response || typeof response !== 'object') return null
  const data = response as Record<string, unknown>

  // Common Databricks pagination token fields
  for (const key of ['next_page_token', 'nextPageToken', 'has_more']) {
    if (key === 'has_more') {
      if (data[key] === true && data['next_page_token']) {
        return String(data['next_page_token'])
      }
    } else if (data[key]) {
      return String(data[key])
    }
  }

  return null
}

export function mergeResponses(responses: unknown[]): unknown {
  if (responses.length === 0) return {}
  if (responses.length === 1) return responses[0]

  const merged: Record<string, unknown> = {}
  const arrayKeys: Set<string> = new Set()

  // Find array keys in first response
  const first = responses[0] as Record<string, unknown>
  for (const [key, value] of Object.entries(first)) {
    if (Array.isArray(value)) {
      arrayKeys.add(key)
      merged[key] = [...value]
    } else {
      merged[key] = value
    }
  }

  // Merge subsequent responses
  for (let i = 1; i < responses.length; i++) {
    const resp = responses[i] as Record<string, unknown>
    for (const key of arrayKeys) {
      if (Array.isArray(resp[key])) {
        (merged[key] as unknown[]).push(...(resp[key] as unknown[]))
      }
    }
  }

  // Remove pagination tokens from merged result
  delete merged['next_page_token']
  delete merged['nextPageToken']
  delete merged['has_more']

  return merged
}
