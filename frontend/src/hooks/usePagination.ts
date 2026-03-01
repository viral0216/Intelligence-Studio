import { useState, useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { sendRequest } from '@/lib/api'
import { extractPaginationToken, mergeResponses, getPaginationConfig } from '@/lib/paginationManager'
import type { HttpMethod } from '@/types/api'

interface PaginationState {
  currentPage: number
  totalPages: number
  totalItems: number
  isLoading: boolean
  allData: unknown[]
}

export function usePagination() {
  const { host, token } = useAuthStore()
  const [state, setState] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    isLoading: false,
    allData: [],
  })

  const fetchAllPages = useCallback(
    async (method: HttpMethod, path: string, body?: unknown) => {
      const config = getPaginationConfig(path)
      if (!config) return null

      setState((s) => ({ ...s, isLoading: true }))
      const responses: unknown[] = []
      let nextToken: string | null = null
      let page = 0

      do {
        let currentPath = path
        if (nextToken) {
          const separator = currentPath.includes('?') ? '&' : '?'
          currentPath += `${separator}${config.tokenParam}=${nextToken}`
        }

        const result = await sendRequest(method, currentPath, body, host, token)
        responses.push(result.data)
        nextToken = extractPaginationToken(result.data)
        page++
      } while (nextToken && page < 50)

      const merged = mergeResponses(responses)
      setState({
        currentPage: 1,
        totalPages: page,
        totalItems: responses.length,
        isLoading: false,
        allData: responses,
      })

      return merged
    },
    [host, token]
  )

  return { ...state, fetchAllPages }
}
