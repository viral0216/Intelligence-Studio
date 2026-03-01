import { useState, useCallback, useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { sendRequest } from '@/lib/api'
import type { HttpMethod, PlaygroundResponse } from '@/types/api'

interface ChainStep {
  id: string
  method: HttpMethod
  path: string
  body?: unknown
  dependsOn?: string
  extractFrom?: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  response?: PlaygroundResponse
  error?: string
}

export function useRequestChain() {
  const { host, token } = useAuthStore()
  const [steps, setSteps] = useState<ChainStep[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const abortRef = useRef(false)

  const addStep = useCallback((step: Omit<ChainStep, 'id' | 'status'>) => {
    setSteps((prev) => [
      ...prev,
      { ...step, id: `step-${Date.now()}`, status: 'pending' },
    ])
  }, [])

  const removeStep = useCallback((id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const executeChain = useCallback(async () => {
    setIsRunning(true)
    abortRef.current = false

    const results: Record<string, PlaygroundResponse> = {}

    for (const step of steps) {
      if (abortRef.current) break

      setSteps((prev) => prev.map((s) => (s.id === step.id ? { ...s, status: 'running' } : s)))

      try {
        // Resolve dependencies
        let resolvedPath = step.path
        let resolvedBody = step.body

        if (step.dependsOn && step.extractFrom && results[step.dependsOn]) {
          const depData = results[step.dependsOn].data as Record<string, unknown>
          const extractedValue = step.extractFrom.split('.').reduce<unknown>((obj, key) => {
            if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[key]
            return undefined
          }, depData)

          if (extractedValue) {
            resolvedPath = resolvedPath.replace('{{value}}', String(extractedValue))
          }
        }

        const response = await sendRequest(step.method, resolvedPath, resolvedBody, host, token)
        results[step.id] = response

        setSteps((prev) =>
          prev.map((s) => (s.id === step.id ? { ...s, status: 'completed', response } : s))
        )
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed'
        setSteps((prev) =>
          prev.map((s) => (s.id === step.id ? { ...s, status: 'failed', error: message } : s))
        )
      }
    }

    setIsRunning(false)
  }, [steps, host, token])

  const abort = useCallback(() => {
    abortRef.current = true
  }, [])

  const reset = useCallback(() => {
    setSteps((prev) => prev.map((s) => ({ ...s, status: 'pending' as const, response: undefined, error: undefined })))
  }, [])

  return { steps, isRunning, addStep, removeStep, executeChain, abort, reset }
}
