import { create } from 'zustand'
import type { ApiEndpoint } from '@/types/catalog'

interface CatalogState {
  selectedEndpoint: ApiEndpoint | null
  searchQuery: string
  expandedCategories: string[]
  showPresetDrawer: boolean

  setSelectedEndpoint: (endpoint: ApiEndpoint | null) => void
  setSearchQuery: (query: string) => void
  toggleCategory: (category: string) => void
  setShowPresetDrawer: (show: boolean) => void
}

export const useCatalogStore = create<CatalogState>((set) => ({
  selectedEndpoint: null,
  searchQuery: '',
  expandedCategories: [],
  showPresetDrawer: false,

  setSelectedEndpoint: (selectedEndpoint) => set({ selectedEndpoint }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  toggleCategory: (category) =>
    set((state) => ({
      expandedCategories: state.expandedCategories.includes(category)
        ? state.expandedCategories.filter((c) => c !== category)
        : [...state.expandedCategories, category],
    })),
  setShowPresetDrawer: (showPresetDrawer) => set({ showPresetDrawer }),
}))
