import { create } from 'zustand'

interface QueryState {
  sql: string
  isExecuting: boolean
  results: {
    rows: unknown[]
    columns: string[]
    rowCount: number
    queryId?: string
    hasMore: boolean
  } | null
  error: string | null

  // Catalog browser
  selectedCatalog: string
  selectedSchema: string
  selectedTable: string
  catalogs: string[]
  schemas: string[]
  tables: Array<{ name: string; type: string }>
  columns: Array<{ name: string; type: string }>

  // Actions
  setSql: (sql: string) => void
  setExecuting: (executing: boolean) => void
  setResults: (results: QueryState['results']) => void
  setError: (error: string | null) => void
  setSelectedCatalog: (catalog: string) => void
  setSelectedSchema: (schema: string) => void
  setSelectedTable: (table: string) => void
  setCatalogs: (catalogs: string[]) => void
  setSchemas: (schemas: string[]) => void
  setTables: (tables: Array<{ name: string; type: string }>) => void
  setColumns: (columns: Array<{ name: string; type: string }>) => void
  reset: () => void
}

export const useQueryStore = create<QueryState>((set) => ({
  sql: '',
  isExecuting: false,
  results: null,
  error: null,
  selectedCatalog: '',
  selectedSchema: '',
  selectedTable: '',
  catalogs: [],
  schemas: [],
  tables: [],
  columns: [],

  setSql: (sql) => set({ sql }),
  setExecuting: (isExecuting) => set({ isExecuting }),
  setResults: (results) => set({ results, error: null }),
  setError: (error) => set({ error }),
  setSelectedCatalog: (selectedCatalog) => set({ selectedCatalog, selectedSchema: '', selectedTable: '', schemas: [], tables: [], columns: [] }),
  setSelectedSchema: (selectedSchema) => set({ selectedSchema, selectedTable: '', tables: [], columns: [] }),
  setSelectedTable: (selectedTable) => set({ selectedTable, columns: [] }),
  setCatalogs: (catalogs) => set({ catalogs }),
  setSchemas: (schemas) => set({ schemas }),
  setTables: (tables) => set({ tables }),
  setColumns: (columns) => set({ columns }),
  reset: () => set({ sql: '', results: null, error: null }),
}))
