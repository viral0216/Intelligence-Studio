import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  host: string
  token: string
  isConnected: boolean
  azureSessionId: string | null
  azureAuthenticated: boolean
  azureUsername: string | null

  setCredentials: (host: string, token: string) => void
  setConnected: (connected: boolean) => void
  setAzureSession: (sessionId: string, username: string) => void
  clearAzureSession: () => void
  clearAll: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      host: '',
      token: '',
      isConnected: false,
      azureSessionId: null,
      azureAuthenticated: false,
      azureUsername: null,

      setCredentials: (host, token) => set({ host, token }),
      setConnected: (isConnected) => set({ isConnected }),
      setAzureSession: (sessionId, username) =>
        set({ azureSessionId: sessionId, azureAuthenticated: true, azureUsername: username }),
      clearAzureSession: () =>
        set({ azureSessionId: null, azureAuthenticated: false, azureUsername: null }),
      clearAll: () =>
        set({
          host: '',
          token: '',
          isConnected: false,
          azureSessionId: null,
          azureAuthenticated: false,
          azureUsername: null,
        }),
    }),
    { name: 'intelligencre-auth' }
  )
)
