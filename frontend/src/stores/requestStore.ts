import { create } from 'zustand'
import type { HttpMethod, PlaygroundResponse } from '@/types/api'

interface RequestState {
  method: HttpMethod
  path: string
  bodyInput: string
  isLoading: boolean
  response: PlaygroundResponse | null
  error: string | null

  setMethod: (method: HttpMethod) => void
  setPath: (path: string) => void
  setBodyInput: (body: string) => void
  setLoading: (loading: boolean) => void
  setResponse: (response: PlaygroundResponse | null) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useRequestStore = create<RequestState>((set) => ({
  method: 'GET',
  path: '/api/2.0/clusters/list',
  bodyInput: '',
  isLoading: false,
  response: null,
  error: null,

  setMethod: (method) => set({ method }),
  setPath: (path) => set({ path }),
  setBodyInput: (bodyInput) => set({ bodyInput }),
  setLoading: (isLoading) => set({ isLoading }),
  setResponse: (response) => set({ response, error: null }),
  setError: (error) => set({ error, response: null }),
  reset: () => set({ method: 'GET', path: '/api/2.0/clusters/list', bodyInput: '', response: null, error: null }),
}))
