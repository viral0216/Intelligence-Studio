# Frontend Architecture

React + TypeScript application with Zustand state management and Vite build system.

---

## Table of Contents

- [Technology Stack](#technology-stack)
- [State Management (Stores)](#state-management-stores)
- [Component Hierarchy](#component-hierarchy)
- [Components Reference](#components-reference)
- [Custom Hooks](#custom-hooks)
- [Utility Libraries](#utility-libraries)
- [Type Definitions](#type-definitions)
- [Theming](#theming)

---

## Technology Stack

| Category | Library | Version | Purpose |
|----------|---------|---------|---------|
| Framework | React | 18.3 | UI component framework |
| Language | TypeScript | 5.6 | Type safety |
| Build | Vite | 6.0 | Dev server + bundler |
| State | Zustand | 5.0 | Lightweight state management |
| Styling | Tailwind CSS | 4.0 | Utility-first CSS |
| Charts | Recharts | 2.15 | Data visualization |
| Icons | Lucide React | 0.460 | Icon library |
| HTTP | Axios | 1.7 | HTTP client |
| Markdown | react-markdown | 10.1 | Markdown rendering |
| Validation | Zod | 3.23 | Schema validation |
| PDF | jsPDF | 2.5 | PDF generation |
| Excel | ExcelJS | 4.4 | Excel export |
| Word | docx | 9.0 | Word document export |

---

## State Management (Stores)

All stores use Zustand with `persist` middleware for localStorage persistence.

### authStore (`stores/authStore.ts`)

Authentication credentials and connection state.

| Field | Type | Default | Persisted |
|-------|------|---------|-----------|
| `host` | `string` | `""` | Yes |
| `token` | `string` | `""` | Yes |
| `isConnected` | `boolean` | `false` | Yes |
| `azureSessionId` | `string \| null` | `null` | Yes |
| `azureAuthenticated` | `boolean` | `false` | Yes |
| `azureUsername` | `string \| null` | `null` | Yes |

**Actions:**
- `setCredentials(host, token)` — Set workspace credentials
- `setConnected(connected)` — Update connection status
- `setAzureSession(sessionId, username)` — Store Azure OAuth session
- `clearAzureSession()` — Clear Azure auth state
- `clearAll()` — Reset all fields

**localStorage key:** `intelligence-auth`

---

### requestStore (`stores/requestStore.ts`)

HTTP request playground state.

| Field | Type | Default |
|-------|------|---------|
| `method` | `HttpMethod` | `"GET"` |
| `path` | `string` | `""` |
| `bodyInput` | `string` | `""` |
| `isLoading` | `boolean` | `false` |
| `response` | `PlaygroundResponse \| null` | `null` |
| `error` | `string \| null` | `null` |

**Actions:**
- `setMethod(method)` — Set HTTP method
- `setPath(path)` — Set request path
- `setBodyInput(body)` — Set JSON body
- `setLoading(loading)` — Toggle loading state
- `setResponse(response)` — Store API response
- `setError(error)` — Store error message
- `reset()` — Clear all fields

---

### queryStore (`stores/queryStore.ts`)

SQL query editor and catalog browser state.

| Field | Type | Default |
|-------|------|---------|
| `sql` | `string` | `""` |
| `isExecuting` | `boolean` | `false` |
| `results` | `QueryResults \| null` | `null` |
| `error` | `string \| null` | `null` |
| `selectedCatalog` | `string` | `""` |
| `selectedSchema` | `string` | `""` |
| `selectedTable` | `string` | `""` |
| `catalogs` | `string[]` | `[]` |
| `schemas` | `string[]` | `[]` |
| `tables` | `string[]` | `[]` |
| `columns` | `ColumnInfo[]` | `[]` |

**QueryResults shape:**
```typescript
{
  rows: Record<string, unknown>[]
  columns: string[]
  rowCount: number
  queryId?: string
  hasMore: boolean
}
```

---

### aiStore (`stores/aiStore.ts`)

AI assistant tabs and conversation state.

| Field | Type | Default |
|-------|------|---------|
| `activeTab` | `AiTab` | `"data-qa"` |
| `isLoading` | `boolean` | `false` |
| `lastMetadata` | `ModelCallMetadata \| null` | `null` |
| `qaMessages` | `AiMessage[]` | `[]` |
| `qaInput` | `string` | `""` |
| `agentMessages` | `AgentMessage[]` | `[]` |
| `agentInput` | `string` | `""` |

**AiTab values:** `data-qa`, `find-endpoint`, `analyze-response`, `error-analysis`, `workflow-builder`, `code-generation`, `test-data`, `api-docs`, `agent-chat`, `query-builder`, `visualization`, `scripting`, `prompts`

---

### catalogStore (`stores/catalogStore.ts`)

API catalog browser state.

| Field | Type | Default |
|-------|------|---------|
| `selectedEndpoint` | `ApiEndpoint \| null` | `null` |
| `searchQuery` | `string` | `""` |
| `expandedCategories` | `string[]` | `[]` |
| `showPresetDrawer` | `boolean` | `false` |

---

### historyStore (`stores/historyStore.ts`)

Request history with favorites.

| Field | Type | Default | Persisted |
|-------|------|---------|-----------|
| `items` | `HistoryItem[]` | `[]` | Yes |
| `showFavoritesOnly` | `boolean` | `false` | No |

**localStorage key:** `intelligence-history`

---

### settingsStore (`stores/settingsStore.ts`)

Application settings, feature flags, and UI state.

**Theme & UI:**
| Field | Type | Default |
|-------|------|---------|
| `theme` | `'dark' \| 'light'` | `'dark'` |
| `activeView` | `ActiveView` | `'explorer'` |
| `settingsOpen` | `boolean` | `false` |
| `showHistory` | `boolean` | `false` |
| `showAiAssistant` | `boolean` | `false` |
| `showIntegrationExport` | `boolean` | `false` |

**Auth & Cloud:**
| Field | Type | Default |
|-------|------|---------|
| `authMethod` | `'pat' \| 'azure-workspace'` | `'pat'` |
| `cloudProvider` | `'azure' \| 'aws' \| 'gcp'` | `'azure'` |

**AI Settings:**
| Field | Type | Default |
|-------|------|---------|
| `defaultModel` | `string` | `'databricks-meta-llama-3-1-405b-instruct'` |
| `maxTokens` | `number` | `4096` |
| `showAiMetadata` | `boolean` | `true` |
| `showInlineSystemPrompt` | `boolean` | `false` |
| `enableAiSuggest` | `boolean` | `true` |

**Warehouse:**
| Field | Type | Default |
|-------|------|---------|
| `warehouseId` | `string` | `""` |

**Feature Flags (`features`):**
All boolean, all default `true`:
`dataQA`, `findEndpoint`, `workflowBuilder`, `codeGeneration`, `testDataGenerator`, `queryExecution`, `charts`, `security`, `promptGenerator`, `aiScripting`, `agentChat`, `queryBuilder`, `testData`, `apiDocs`

**UI Component Toggles (`uiComponents`):**
All boolean, all default `true`:
`aiAssistant`, `agents`, `history`, `export`, `naturalLanguageToApi`

**Chart Type Toggles (`chartTypes`):**
All boolean, all default `true`:
`bar`, `line`, `area`, `pie`, `scatter`, `radar`, `boxplot`, `heatmap`, `histogram`, `waterfall`, `funnel`, `sankey`

**Custom Prompts (`prompts`):**
14 customizable system prompts:
`dataQA`, `naturalLanguage`, `aiSuggest`, `aiFix`, `promptGenerator`, `findEndpoint`, `analyzeResponse`, `workflowBuilder`, `codeGeneration`, `apiDocs`, `testData`, `security`, `aiScripting`, `agent`

**localStorage key:** `intelligence-settings`

---

## Component Hierarchy

```
App.tsx
└── MainLayout.tsx
    ├── HeaderBar.tsx
    │   ├── Connection indicator
    │   ├── AI Assistant toggle
    │   ├── History toggle
    │   ├── Export toggle
    │   ├── Theme toggle
    │   └── Settings button → SettingsModal.tsx
    │       ├── AuthSettings.tsx
    │       ├── AiModelSettings.tsx
    │       ├── CloudProviderSettings.tsx
    │       ├── WarehouseSettings.tsx
    │       ├── PricingSettings.tsx
    │       ├── FeatureToggles.tsx
    │       └── PromptSettings.tsx
    ├── NavTabs.tsx
    ├── PresetSidebar.tsx (left panel)
    │   └── API catalog tree
    ├── Center Content (based on activeView)
    │   ├── Explorer View
    │   │   ├── NaturalLanguageInput.tsx
    │   │   ├── RequestComposer.tsx
    │   │   │   └── JsonEditor.tsx
    │   │   └── ResponsePanel.tsx
    │   │       ├── FormattedResponse.tsx
    │   │       ├── DataVisualization.tsx
    │   │       ├── PaginationControls.tsx
    │   │       ├── AiAnalysisPanel.tsx
    │   │       └── CodeBlock.tsx
    │   ├── Query View
    │   │   ├── QueryBuilder.tsx
    │   │   │   ├── CatalogBrowser.tsx
    │   │   │   └── QueryResults.tsx
    │   ├── Agent View
    │   │   ├── AgentChat.tsx
    │   │   └── CustomAgentBuilder.tsx
    │   ├── Scripting View
    │   │   └── AIScriptingPanel.tsx
    │   └── Visualization View
    │       ├── DataVisualization.tsx
    │       ├── DependencyGraph.tsx
    │       ├── SchemaVisualizer.tsx
    │       └── DashboardBuilder.tsx
    └── Right Panels (toggleable)
        ├── AiAssistant.tsx
        │   ├── DataQATab.tsx
        │   ├── FindEndpointTab.tsx
        │   ├── AnalyzeResponseTab.tsx
        │   ├── ErrorAnalysisTab.tsx
        │   ├── WorkflowBuilderTab.tsx
        │   ├── CodeGenerationTab.tsx
        │   ├── TestDataTab.tsx
        │   ├── ApiDocsTab.tsx
        │   └── (other tabs)
        ├── HistoryPanel.tsx
        ├── IntegrationExportPanel.tsx
        └── ApiDocPanel.tsx
```

---

## Components Reference

### Layout Components

| Component | File | Description |
|-----------|------|-------------|
| `MainLayout` | `layout/MainLayout.tsx` | Master page orchestrator — sidebar, center content, right panels |
| `HeaderBar` | `layout/HeaderBar.tsx` | App header with branding, connection status, toolbar actions |
| `Sidebar` | `layout/Sidebar.tsx` | Icon-only navigation (10 items) |
| `NavTabs` | `layout/NavTabs.tsx` | View tab navigation (Explorer, Query, Agent, etc.) |

### Request/Response Components

| Component | File | Description |
|-----------|------|-------------|
| `RequestComposer` | `request/RequestComposer.tsx` | HTTP method/path/body editor with AI suggest |
| `ResponsePanel` | `request/ResponsePanel.tsx` | Response viewer: JSON, formatted tree, charts, export |
| `FormattedResponse` | `request/FormattedResponse.tsx` | Recursive collapsible JSON tree renderer |
| `PaginationControls` | `request/PaginationControls.tsx` | Page navigation for paginated API responses |
| `AiAnalysisPanel` | `request/AiAnalysisPanel.tsx` | AI response analysis with model metadata and cost |

### AI Components

| Component | File | Description |
|-----------|------|-------------|
| `AiAssistant` | `ai/AiAssistant.tsx` | Tab container for 13 AI features |
| `DataQATab` | `ai/DataQATab.tsx` | Conversational SQL assistant with history |
| `FindEndpointTab` | `ai/FindEndpointTab.tsx` | Natural language → API endpoint |
| `AnalyzeResponseTab` | `ai/AnalyzeResponseTab.tsx` | AI explanation of response data |
| `ErrorAnalysisTab` | `ai/ErrorAnalysisTab.tsx` | Error root cause + fix suggestions |
| `CodeGenerationTab` | `ai/CodeGenerationTab.tsx` | Multi-language code generation |
| `TestDataTab` | `ai/TestDataTab.tsx` | Realistic test payload generation |
| `ApiDocsTab` | `ai/ApiDocsTab.tsx` | Searchable API documentation browser |
| `WorkflowBuilderTab` | `ai/WorkflowBuilderTab.tsx` | Multi-step workflow + request chaining |

### Query Components

| Component | File | Description |
|-----------|------|-------------|
| `QueryBuilder` | `query/QueryBuilder.tsx` | SQL editor with warehouse selector and catalog toggle |
| `QueryResults` | `query/QueryResults.tsx` | Paginated result table with CSV/JSON export |
| `CatalogBrowser` | `query/CatalogBrowser.tsx` | Unity Catalog tree (Catalog → Schema → Table → Columns) |

### Agent Components

| Component | File | Description |
|-----------|------|-------------|
| `AgentChat` | `agent/AgentChat.tsx` | Chat interface with suggested commands, metadata display |
| `CustomAgentBuilder` | `agent/CustomAgentBuilder.tsx` | CRUD for custom agents with regex patterns |

### Visualization Components

| Component | File | Description |
|-----------|------|-------------|
| `DataVisualization` | `visualization/DataVisualization.tsx` | Auto-detecting charts (bar, line, pie, scatter, area, radar) |
| `DependencyGraph` | `visualization/DependencyGraph.tsx` | SVG-based data lineage graph with zoom/pan |
| `SchemaVisualizer` | `visualization/SchemaVisualizer.tsx` | Table schema display with type coloring |
| `DashboardBuilder` | `visualization/DashboardBuilder.tsx` | Dashboard widget creator |

### Catalog Components

| Component | File | Description |
|-----------|------|-------------|
| `PresetSidebar` | `catalog/PresetSidebar.tsx` | Resizable sidebar with API category tree |
| `PresetDrawer` | `catalog/PresetDrawer.tsx` | Endpoint selection drawer/modal |
| `ApiDocPanel` | `catalog/ApiDocPanel.tsx` | Endpoint documentation panel |

### Settings Components

| Component | File | Description |
|-----------|------|-------------|
| `SettingsModal` | `settings/SettingsModal.tsx` | Master settings dialog (5 tabs) |
| `AuthSettings` | `settings/AuthSettings.tsx` | Databricks host + token config |
| `AiModelSettings` | `settings/AiModelSettings.tsx` | Foundation model selection |
| `CloudProviderSettings` | `settings/CloudProviderSettings.tsx` | Cloud provider (Azure/AWS/GCP) |
| `FeatureToggles` | `settings/FeatureToggles.tsx` | Feature flag toggles |
| `PromptSettings` | `settings/PromptSettings.tsx` | Custom system prompt editor |
| `PricingSettings` | `settings/PricingSettings.tsx` | DBU rate configuration |
| `WarehouseSettings` | `settings/WarehouseSettings.tsx` | SQL warehouse selector |

### Common Components

| Component | File | Description |
|-----------|------|-------------|
| `CodeBlock` | `common/CodeBlock.tsx` | Syntax-highlighted code with line numbers and copy |
| `JsonEditor` | `common/JsonEditor.tsx` | JSON textarea with real-time validation |
| `NaturalLanguageInput` | `common/NaturalLanguageInput.tsx` | NL → API conversion input with suggestions |

### Other Components

| Component | File | Description |
|-----------|------|-------------|
| `AIScriptingPanel` | `scripting/AIScriptingPanel.tsx` | Script generation + sandboxed execution |
| `HistoryPanel` | `history/HistoryPanel.tsx` | Request history with favorites and replay |
| `ExportModal` | `export/ExportModal.tsx` | Format selection for export |
| `IntegrationExportPanel` | `export/IntegrationExportPanel.tsx` | Export to Postman, Insomnia, GH Actions, etc. |

---

## Custom Hooks

### `usePagination` (`hooks/usePagination.ts`)

Auto-fetches all pages of paginated Databricks API responses.

```typescript
const { currentPage, totalPages, totalItems, isLoading, allData, fetchAllPages } = usePagination()
```

- Max 50 pages
- Handles pagination tokens and response merging
- Uses authStore for host/token

### `useRequestChain` (`hooks/useRequestChain.ts`)

Manages chained API requests where outputs feed inputs.

```typescript
const { steps, isRunning, addStep, removeStep, executeChain, abort, reset } = useRequestChain()
```

- Variable substitution with dot notation (`{{step1.data.cluster_id}}`)
- Sequential execution with abort capability
- Supports extracting values from previous step responses

### `useDependencyGraph` (`hooks/useDependencyGraph.ts`)

Maintains graph state for dependency visualization.

```typescript
const { nodes, edges, addNode, addEdge, clear, buildFromCatalog } = useDependencyGraph()
```

- Node types: table, view, job, notebook, model, catalog, schema
- Prevents duplicate nodes/edges
- Can auto-build from Unity Catalog hierarchy

---

## Utility Libraries

### `api.ts` — Backend API Client

50+ exported functions wrapping all backend endpoints. All functions use Axios with `http://localhost:8000` base URL.

**Key patterns:**
- Functions accept host/token from authStore
- AI functions accept optional `model` and `customSystemPrompt`
- Returns parsed response data (not raw Axios response)

### `apiCatalog.ts` — API Endpoint Catalog

Defines 500+ Databricks REST API endpoints organized into categories.

```typescript
export const API_CATALOG: ApiCategory[] = [
  {
    name: "Workspace",
    icon: "Building2",
    subcategories: [
      {
        name: "Clusters",
        endpoints: [
          {
            label: "List Clusters",
            method: "GET",
            path: "/api/2.0/clusters/list",
            description: "Lists all clusters in the workspace",
            queryParams: [...],
            body: null
          }
        ]
      }
    ]
  },
  // ... 25+ categories
]
```

**Categories (Workspace):** Workspace, Compute, SQL, Jobs & Pipelines, MLflow & Models, Admin & Settings, Security & Governance, Unity Catalog, Model Serving, Delta Sharing, Repos & Git, Secrets

**Categories (Account):** Account Identity & Access, Account Workspaces, Account Unity Catalog, Account Networking, Account Security, Account Billing

### `codeGenerator.ts` — Code Generation

Generates request code in 6 languages:

```typescript
type Language = 'curl' | 'python' | 'javascript' | 'typescript' | 'go' | 'powershell'
generateCode(language, method, path, body, host, token): string
```

### `dataVisualization.ts` — Chart Processing

```typescript
detectChartType(data): 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'radar'
prepareChartData(data, chartType): ChartData
summarizeData(data): { field, min, max, avg, count }[]
```

### `exportFormats.ts` — Data Export

```typescript
toJSON(data): string
toCSV(data): string
toMarkdown(data): string
deepFlatten(obj): Record<string, unknown>
downloadFile(content, filename, mimeType): void
```

### `integrationExport.ts` — Tool Export

```typescript
exportToPostman(method, path, body, host, token): void    // Downloads .json
exportToInsomnia(method, path, body, host, token): void    // Downloads .json
generateGitHubActionsWorkflow(method, path, body): void    // Downloads .yml
exportAsCurlScript(method, path, body, host, token): void  // Downloads .sh
```

### `intelligentSearch.ts` — Fuzzy Search

```typescript
intelligentSearch(query, catalog): SearchResult[]
// Scoring: exact label (10), path (5), description (3), method (2)
```

### `paginationManager.ts` — Pagination

```typescript
isPaginatedEndpoint(path): boolean
getPaginationConfig(path): { tokenParam, limitParam, responseTokenField }
extractPaginationToken(response, path): string | null
mergeResponses(responses, path): MergedResponse
```

20+ configured paginated endpoints.

### `categoryIcons.tsx` — Icon Mapping

Maps string icon names from API catalog to Lucide React components:

```typescript
const ICON_MAP: Record<string, LucideIcon> = {
  Building2, AppWindow, Zap, Waves, FolderOpen, Library, BarChart3,
  Brain, ShieldCheck, Settings, TrendingUp, Users, Search, Share2,
  Sparkles, KeyRound, Store, Lock, Activity, Tag, Radio, Wallet,
  Landmark, Database, Network, Server, Receipt
}
```

---

## Type Definitions

### `types/api.ts`

```typescript
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface PlaygroundRequest {
  method: HttpMethod
  path: string
  body?: unknown
  token: string
  host: string
}

interface PlaygroundResponse {
  status: number
  data: unknown
  headers: Record<string, string>
  durationMs: number
  requestId?: string
}

interface HistoryItem {
  id: string
  method: HttpMethod
  path: string
  body?: string
  timestamp: number
  name?: string
  isFavorite: boolean
  source?: string
}

interface ModelCallMetadata {
  model: string
  temperature: number
  maxTokens: number
  promptTokens: number
  completionTokens: number
  totalTokens: number
  durationMs: number
  region?: string
}
```

### `types/ai.ts`

```typescript
type AiTab = 'data-qa' | 'find-endpoint' | 'analyze-response' | 'error-analysis'
  | 'workflow-builder' | 'code-generation' | 'test-data' | 'api-docs'
  | 'agent-chat' | 'query-builder' | 'visualization' | 'scripting' | 'prompts'

interface AiMessage { role: string; content: string; timestamp: number }
interface AgentMessage { id: string; role: string; content: string; timestamp: number; metadata?: unknown }
interface CustomAgent { id: string; name: string; description: string; pattern: string; handler: string; config?: unknown; enabled: boolean }
```

### `types/azure.ts`

```typescript
interface AzureTenant { tenantId: string; displayName: string }
interface AzureSubscription { subscriptionId: string; displayName: string; state: string }
interface DatabricksWorkspace { id: string; name: string; location: string; workspaceUrl?: string; properties?: unknown }
```

### `types/catalog.ts`

```typescript
interface QueryParamSpec { name: string; type: string; required: boolean; description: string }
interface ApiEndpoint { label: string; method: string; path: string; body?: unknown; requestBodySchema?: unknown; queryParams?: QueryParamSpec[]; description?: string; docs?: string }
interface ApiSubcategory { name: string; endpoints: ApiEndpoint[] }
interface ApiCategory { name: string; icon: string; audience?: string; rateLimitNote?: string; subcategories?: ApiSubcategory[]; endpoints?: ApiEndpoint[] }
```

---

## Theming

CSS variables defined in `index.css` with `[data-theme="dark"]` and `[data-theme="light"]` selectors.

**Key CSS Variables:**

| Variable | Dark | Light | Usage |
|----------|------|-------|-------|
| `--bg-primary` | `#0d1117` | `#ffffff` | Main background |
| `--bg-secondary` | `#161b22` | `#f6f8fa` | Secondary surfaces |
| `--bg-tertiary` | `#21262d` | `#f0f2f5` | Tertiary surfaces |
| `--bg-input` | `#0d1117` | `#ffffff` | Input fields |
| `--text-primary` | `#e6edf3` | `#1f2937` | Primary text |
| `--text-secondary` | `#8b949e` | `#6b7280` | Secondary text |
| `--text-muted` | `#484f58` | `#9ca3af` | Muted text |
| `--border-primary` | `#30363d` | `#d1d5db` | Primary borders |
| `--border-secondary` | `#21262d` | `#e5e7eb` | Secondary borders |
| `--accent-primary` | `#0ea5e9` | `#0284c7` | Primary accent (blue) |
| `--accent-success` | `#34d399` | `#059669` | Success (green) |
| `--accent-warning` | `#fbbf24` | `#d97706` | Warning (yellow) |
| `--accent-danger` | `#f85149` | `#dc2626` | Danger (red) |
| `--accent-error` | `#f85149` | `#dc2626` | Error (red) |

**Theme Toggle:** `settingsStore.toggleTheme()` updates `document.documentElement.setAttribute('data-theme', theme)`
