import type { ApiEndpoint, ApiCategory } from '@/types/catalog'

/**
 * Fuzzy search through API endpoints.
 */
export function intelligentSearch(query: string, categories: ApiCategory[]): ApiEndpoint[] {
  if (!query.trim()) return []

  const terms = query.toLowerCase().split(/\s+/)
  const results: Array<{ endpoint: ApiEndpoint; score: number }> = []

  for (const category of categories) {
    const endpoints = getAllEndpoints(category)
    for (const endpoint of endpoints) {
      const score = calculateScore(endpoint, terms)
      if (score > 0) {
        results.push({ endpoint, score })
      }
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((r) => r.endpoint)
}

function getAllEndpoints(category: ApiCategory): ApiEndpoint[] {
  const endpoints: ApiEndpoint[] = [...(category.endpoints || [])]
  for (const sub of category.subcategories || []) {
    endpoints.push(...sub.endpoints)
  }
  return endpoints
}

function calculateScore(endpoint: ApiEndpoint, terms: string[]): number {
  let score = 0
  const label = endpoint.label.toLowerCase()
  const path = endpoint.path.toLowerCase()
  const desc = (endpoint.description || '').toLowerCase()
  const method = endpoint.method.toLowerCase()

  for (const term of terms) {
    // Exact match in label
    if (label.includes(term)) score += 10
    // Match in path
    if (path.includes(term)) score += 5
    // Match in description
    if (desc.includes(term)) score += 3
    // Match method
    if (method === term) score += 2
  }

  return score
}

/**
 * Search endpoints by category name.
 */
export function categorySearch(categoryName: string, categories: ApiCategory[]): ApiEndpoint[] {
  const cat = categories.find((c) => c.name.toLowerCase().includes(categoryName.toLowerCase()))
  if (!cat) return []
  return getAllEndpoints(cat)
}
