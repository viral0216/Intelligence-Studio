import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HistoryItem, HttpMethod } from '@/types/api'

interface HistoryState {
  items: HistoryItem[]
  showFavoritesOnly: boolean

  addItem: (method: HttpMethod, path: string, body?: unknown) => void
  removeItem: (id: string) => void
  toggleFavorite: (id: string) => void
  renameItem: (id: string, name: string) => void
  clearHistory: () => void
  toggleFavoritesFilter: () => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      items: [],
      showFavoritesOnly: false,

      addItem: (method, path, body) =>
        set((state) => {
          const newItem: HistoryItem = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            method,
            path,
            body,
            timestamp: Date.now(),
            source: 'recent',
          }
          return { items: [newItem, ...state.items].slice(0, 200) }
        }),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== id) })),

      toggleFavorite: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
          ),
        })),

      renameItem: (id, name) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, name } : item
          ),
        })),

      clearHistory: () => set({ items: [] }),

      toggleFavoritesFilter: () =>
        set((state) => ({ showFavoritesOnly: !state.showFavoritesOnly })),
    }),
    { name: 'intelligence-history' }
  )
)
