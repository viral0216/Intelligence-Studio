<p align="center">
  <img src="../desktop/build/icon.svg" alt="Intelligence Studio" width="200" />
</p>

<h1 align="center">Intelligence Studio</h1>

<p align="center"><strong>API Explorer & Analytics Studio for Databricks</strong></p>

Intelligence Studio is a full-stack platform for exploring, testing, and analyzing Databricks APIs with built-in AI assistance powered by foundation models. It provides a web interface, desktop application, and CLI tool.

---

## Table of Contents

- [Overview](#overview)
- [Benefits](#benefits)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Features](#features)
- [How to Build](#how-to-build)
- [Documentation Index](#documentation-index)

---

## Overview

Intelligence Studio enables:

- **API Exploration** — Browse 500+ Databricks REST API endpoints organized by category
- **Request Playground** — Build, test, and debug HTTP requests with auto-generated bodies
- **SQL Query Editor** — Execute SQL against Databricks SQL Warehouses with a catalog browser
- **AI Assistant** — Data Q&A, error analysis, code generation, workflow building, and more
- **Agent System** — Chat with AI agents that can call Databricks APIs
- **Data Visualization** — Auto-detect chart types and render interactive graphs
- **Code Generation** — Export requests as Python, cURL, JavaScript, TypeScript, Go, PowerShell
- **Integration Export** — Export to Postman, Insomnia, GitHub Actions, OpenAPI
- **Azure Login** — OAuth-based Azure authentication with workspace selection
- **Desktop App** — Electron-based native application for macOS and Windows

---

## Benefits

### For Platform Engineers & Admins

| Benefit | How |
|---------|-----|
| **Faster API Discovery** | Browse 500+ Databricks endpoints in a searchable catalog instead of digging through docs. Find the right API in seconds with natural language search. |
| **Instant Testing Without Code** | Test any Databricks REST API directly from the browser — no Postman setup, no curl commands, no scripts needed. |
| **Reduced Onboarding Time** | New team members can explore workspace resources, run queries, and understand APIs through the built-in documentation and AI explanations. |
| **Centralized Workspace Management** | Monitor clusters, warehouses, jobs, users, and Unity Catalog objects from a single interface across multiple workspaces. |
| **Multi-Workspace Azure Login** | Switch between Databricks workspaces across tenants and subscriptions without managing tokens manually. |

### For Data Engineers & Analysts

| Benefit | How |
|---------|-----|
| **AI-Powered SQL Assistant** | Ask questions in plain English and get SQL queries generated automatically. No need to memorize catalog/schema/table structures. |
| **Interactive Query Editor** | Write and execute SQL against any warehouse with a built-in catalog browser showing catalogs, schemas, tables, and column types. |
| **Large Result Handling** | Query results exceeding 25MB are automatically fetched via external links — no manual pagination or disposition switching needed. |
| **Data Visualization** | Auto-detect the best chart type for your data and render interactive bar, line, pie, scatter, area, and radar charts. |
| **Data Lineage Graphs** | Visualize dependencies between tables, views, jobs, and notebooks to understand data flow. |

### For Developers & DevOps

| Benefit | How |
|---------|-----|
| **Code Generation in 6 Languages** | Export any API request as production-ready Python, cURL, JavaScript, TypeScript, Go, or PowerShell code with one click. |
| **CI/CD Integration Export** | Generate GitHub Actions workflows, Postman collections, Insomnia workspaces, and OpenAPI specs directly from tested requests. |
| **AI Script Automation** | Describe an automation task in plain English, get a Python script generated, review it, and execute it in a sandboxed environment. |
| **Multi-Step Workflow Builder** | Chain API calls together where outputs from one step feed into the next — test complex orchestration without writing code. |
| **Request History & Favorites** | Never lose a working API call. All requests are saved with replay capability and can be favorited for quick access. |

### For Security & Governance Teams

| Benefit | How |
|---------|-----|
| **Security Recommendations** | Get AI-powered security analysis for any API endpoint — identifies risks, suggests best practices, and flags common vulnerabilities. |
| **Error Diagnosis** | Paste any API error and get root cause analysis with step-by-step fix suggestions powered by foundation models. |
| **Token-Per-Request Model** | Credentials are never stored server-side. Each request carries its own token, reducing the blast radius of any compromise. |
| **Script Safety Validation** | Generated scripts are validated against a blocklist of dangerous patterns (os.system, subprocess, exec, eval) before execution. |
| **Audit-Ready Exports** | Export API interactions as PDF, Word, or Markdown documents with full request/response details for compliance records. |

### For Organizations

| Benefit | How |
|---------|-----|
| **Reduced Databricks Learning Curve** | AI assistant explains responses, suggests parameters, generates documentation — accelerates team productivity on the Databricks platform. |
| **Cost Visibility** | Track token usage and estimated costs for every AI model call with detailed metadata (prompt tokens, completion tokens, model, duration). |
| **Customizable AI Behavior** | 14 system prompts can be tailored to your organization's terminology, conventions, and use cases. |
| **Feature Flag Control** | Enable or disable any feature (SQL editor, AI assistant, agents, charts, export, etc.) to match team needs and security policies. |
| **Multi-Cloud Ready** | Built with Azure as primary cloud but architected for AWS and GCP support. |
| **Cross-Platform** | Available as a web app, native desktop app (macOS/Windows), and CLI tool — teams can use whichever interface fits their workflow. |

### Key Metrics

| Metric | Value |
|--------|-------|
| API endpoints cataloged | 500+ |
| AI assistant features | 13 |
| Code generation languages | 6 |
| Export formats | 10+ (JSON, CSV, Excel, PDF, Word, Markdown, Postman, Insomnia, GitHub Actions, OpenAPI) |
| Backend API endpoints | 48 |
| Feature flags | 14 |
| Customizable prompts | 14 |
| Chart types supported | 12 |
| Account API categories | 6 |
| Workspace API categories | 12+ |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Intelligence Studio                        │
├─────────────┬──────────────────────┬─────────────┬───────────────┤
│  Frontend   │      Backend         │   Desktop   │     CLI       │
│  React/TS   │      FastAPI         │  Electron   │   Click/Rich  │
│  Vite       │      Uvicorn         │             │               │
│  Zustand    │      httpx           │             │               │
│  Tailwind   │      Pydantic        │             │               │
│  Recharts   │      azure-identity  │             │               │
├─────────────┴──────────────────────┴─────────────┴───────────────┤
│                     Databricks Platform                           │
│  REST APIs  │  SQL Warehouses  │  Foundation Models  │  Unity Cat │
└──────────────────────────────────────────────────────────────────┘
```

| Layer    | Technology Stack                                      |
|----------|------------------------------------------------------|
| Frontend | React 18, TypeScript 5, Vite 6, Zustand, Tailwind 4 |
| Backend  | FastAPI, Uvicorn, httpx, Pydantic v2                 |
| Desktop  | Electron 28, electron-builder                         |
| CLI      | Click, Rich, httpx                                   |
| AI       | Databricks Foundation Models (Llama, Claude, etc.)   |
| Cloud    | Azure (primary), AWS/GCP (ready)                     |

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Databricks workspace with a Personal Access Token (PAT)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd Intelligence-Studio

# Install all dependencies
make install

# Or install individually:
make install-frontend   # npm install in frontend/
make install-backend    # pip install -e ".[dev]" in backend/
```

### Configuration

Create environment files from the examples:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Edit `.env` with your Databricks credentials:

```env
DATABRICKS_HOST=https://your-workspace.cloud.databricks.com
DATABRICKS_TOKEN=dapi...
```

### Running

```bash
# Start both frontend and backend in parallel
make dev

# Or start individually:
make dev-frontend       # React dev server on http://localhost:5173
make dev-backend        # FastAPI server on http://localhost:8000
```

### Building

```bash
make build              # Build frontend for production
make desktop-build      # Build Electron desktop app
```

### Testing

```bash
make test               # Run all tests
make test-frontend      # Vitest (frontend)
make test-backend       # pytest (backend)
```

---

## Project Structure

```
Intelligence-Studio/
├── backend/                          # FastAPI Python backend
│   ├── app/
│   │   ├── main.py                   # App entry, CORS, router registration
│   │   ├── config.py                 # Environment configuration
│   │   ├── models/                   # Pydantic request/response models
│   │   │   ├── common.py             # HttpMethod enum, ErrorResponse
│   │   │   ├── proxy.py              # ProxyRequest, ProxyResponse
│   │   │   ├── ai.py                 # ModelCallMetadata, AiResponse, ApiCallSpec
│   │   │   ├── agent.py              # ChatMessage, AgentConfig, AgentResponse
│   │   │   ├── query.py              # QueryRequest, QueryResult
│   │   │   └── azure.py              # AzureTenant, AzureSubscription, DatabricksWorkspace
│   │   ├── routers/                  # API route handlers
│   │   │   ├── health.py             # /api/health — connectivity checks
│   │   │   ├── proxy.py              # /api/proxy — Databricks API proxy
│   │   │   ├── ai.py                 # /api/ai/* — AI features (20 endpoints)
│   │   │   ├── query.py              # /api/ai/* — SQL execution (4 endpoints)
│   │   │   ├── agent.py              # /api/agent/* — Agent chat (5 endpoints)
│   │   │   ├── custom_agents.py      # /api/custom-agents — CRUD (4 endpoints)
│   │   │   ├── azure_auth.py         # /api/azure/* — Azure OAuth (8 endpoints)
│   │   │   ├── notebooks.py          # /api/notebooks/* — Upload (1 endpoint)
│   │   │   └── tools.py              # /api/tools/* — OpenAPI, test data (3 endpoints)
│   │   ├── services/                 # Business logic layer
│   │   │   ├── ai_helper.py          # Foundation model calls, all AI features
│   │   │   ├── agent_system.py       # Agent registry, handler routing
│   │   │   ├── azure_auth.py         # MSAL auth, tenant/subscription management
│   │   │   ├── azure_management.py   # Azure Management API queries
│   │   │   ├── databricks_client.py  # HTTP proxy with retry/rate limiting
│   │   │   ├── pricing.py            # Model pricing data
│   │   │   ├── query_store.py        # In-memory query result cache (1hr TTL)
│   │   │   ├── script_executor.py    # Sandboxed Python script execution
│   │   │   └── tools_service.py      # OpenAPI spec generation
│   │   └── utils/
│   │       └── security.py           # Security utilities
│   ├── tests/                        # pytest test suite
│   └── pyproject.toml                # Python project config
│
├── frontend/                         # React TypeScript frontend
│   ├── src/
│   │   ├── main.tsx                  # React entry point
│   │   ├── App.tsx                   # Root component with theme + routing
│   │   ├── index.css                 # Global styles, CSS variables, theme
│   │   ├── components/
│   │   │   ├── layout/               # Page structure
│   │   │   │   ├── MainLayout.tsx    # Master layout orchestrator
│   │   │   │   ├── HeaderBar.tsx     # App header with status/actions
│   │   │   │   ├── Sidebar.tsx       # Icon navigation sidebar
│   │   │   │   └── NavTabs.tsx       # View tab navigation
│   │   │   ├── request/              # HTTP request building
│   │   │   │   ├── RequestComposer.tsx     # Method/path/body editor
│   │   │   │   ├── ResponsePanel.tsx       # Response viewer with charts
│   │   │   │   ├── FormattedResponse.tsx   # Collapsible JSON tree
│   │   │   │   ├── PaginationControls.tsx  # Page navigation
│   │   │   │   └── AiAnalysisPanel.tsx     # AI response analysis
│   │   │   ├── ai/                   # AI assistant features
│   │   │   │   ├── AiAssistant.tsx         # Tab container
│   │   │   │   ├── DataQATab.tsx           # Conversational SQL assistant
│   │   │   │   ├── FindEndpointTab.tsx     # NL endpoint discovery
│   │   │   │   ├── AnalyzeResponseTab.tsx  # Response analysis
│   │   │   │   ├── ErrorAnalysisTab.tsx    # Error explanation
│   │   │   │   ├── CodeGenerationTab.tsx   # Multi-language code gen
│   │   │   │   ├── TestDataTab.tsx         # Test payload generation
│   │   │   │   ├── ApiDocsTab.tsx          # Browsable API docs
│   │   │   │   └── WorkflowBuilderTab.tsx  # Multi-step workflows
│   │   │   ├── agent/                # Agent system
│   │   │   │   ├── AgentChat.tsx           # Agent chat interface
│   │   │   │   └── CustomAgentBuilder.tsx  # Custom agent CRUD
│   │   │   ├── query/                # SQL workspace
│   │   │   │   ├── QueryBuilder.tsx        # SQL editor + execution
│   │   │   │   ├── QueryResults.tsx        # Paginated result table
│   │   │   │   └── CatalogBrowser.tsx      # Unity Catalog tree browser
│   │   │   ├── visualization/        # Charts and graphs
│   │   │   │   ├── DataVisualization.tsx    # Auto-detecting charts
│   │   │   │   ├── DependencyGraph.tsx     # Data lineage graph
│   │   │   │   ├── SchemaVisualizer.tsx    # Table schema display
│   │   │   │   └── DashboardBuilder.tsx    # Dashboard creator
│   │   │   ├── catalog/              # API catalog browsing
│   │   │   │   ├── PresetSidebar.tsx       # Resizable endpoint sidebar
│   │   │   │   ├── PresetDrawer.tsx        # Endpoint selection drawer
│   │   │   │   └── ApiDocPanel.tsx         # Endpoint documentation
│   │   │   ├── settings/             # Configuration
│   │   │   │   ├── SettingsModal.tsx       # Master settings dialog
│   │   │   │   ├── AuthSettings.tsx        # Auth configuration
│   │   │   │   ├── AiModelSettings.tsx     # AI model selection
│   │   │   │   ├── CloudProviderSettings.tsx
│   │   │   │   ├── FeatureToggles.tsx      # Feature flags UI
│   │   │   │   ├── PromptSettings.tsx      # Custom prompts editor
│   │   │   │   ├── PricingSettings.tsx     # Cost configuration
│   │   │   │   └── WarehouseSettings.tsx   # SQL warehouse config
│   │   │   ├── export/               # Data export
│   │   │   │   ├── ExportModal.tsx         # Format selection modal
│   │   │   │   └── IntegrationExportPanel.tsx  # Tool export panel
│   │   │   ├── history/              # Request history
│   │   │   │   └── HistoryPanel.tsx        # History with favorites
│   │   │   ├── scripting/            # Script automation
│   │   │   │   └── AIScriptingPanel.tsx    # AI script gen + execution
│   │   │   └── common/               # Shared components
│   │   │       ├── CodeBlock.tsx           # Syntax-highlighted code
│   │   │       ├── JsonEditor.tsx          # JSON editor with validation
│   │   │       └── NaturalLanguageInput.tsx # NL-to-API input
│   │   ├── stores/                   # Zustand state management
│   │   │   ├── authStore.ts          # Host, token, Azure session
│   │   │   ├── requestStore.ts       # HTTP request state
│   │   │   ├── queryStore.ts         # SQL query state
│   │   │   ├── aiStore.ts            # AI assistant state
│   │   │   ├── catalogStore.ts       # API catalog browser state
│   │   │   ├── historyStore.ts       # Request history
│   │   │   └── settingsStore.ts      # App settings + feature flags
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── usePagination.ts      # Auto-pagination
│   │   │   ├── useRequestChain.ts    # Chained API requests
│   │   │   └── useDependencyGraph.ts # Dependency graph state
│   │   ├── lib/                      # Utility libraries
│   │   │   ├── api.ts                # Backend API client (50+ functions)
│   │   │   ├── apiCatalog.ts         # 500+ endpoint definitions
│   │   │   ├── azureApi.ts           # Azure API re-exports
│   │   │   ├── codeGenerator.ts      # Multi-language code generation
│   │   │   ├── dataVisualization.ts  # Chart data processing
│   │   │   ├── exportFormats.ts      # JSON/CSV/Markdown export
│   │   │   ├── integrationExport.ts  # Postman/Insomnia/GH Actions
│   │   │   ├── intelligentSearch.ts  # Fuzzy endpoint search
│   │   │   ├── paginationManager.ts  # Pagination token management
│   │   │   └── categoryIcons.tsx     # Lucide icon mapping
│   │   └── types/                    # TypeScript type definitions
│   │       ├── api.ts                # HttpMethod, PlaygroundRequest/Response
│   │       ├── ai.ts                 # AiTab, AiMessage, AgentMessage
│   │       ├── azure.ts              # Azure resource types
│   │       └── catalog.ts            # ApiEndpoint, ApiCategory types
│   ├── index.html                    # HTML entry point
│   ├── package.json                  # Node dependencies
│   ├── vite.config.ts                # Vite build config
│   └── tsconfig.json                 # TypeScript config
│
├── desktop/                          # Electron desktop app
│   ├── main.js                       # Electron main process
│   ├── preload.js                    # IPC bridge
│   └── package.json                  # Electron + builder config
│
├── cli/                              # Python CLI tool
│   ├── cli/
│   │   ├── __init__.py
│   │   └── main.py                   # Click-based CLI commands
│   └── pyproject.toml                # CLI config (entry: dbx-cli)
│
├── Makefile                          # Development commands
├── .env.example                      # Root env template
├── .gitignore
└── start.sh                          # Quick start script
```

---

## Configuration

### Environment Variables

| Variable               | Description                          | Required |
|------------------------|--------------------------------------|----------|
| `DATABRICKS_HOST`      | Workspace URL (e.g., `https://xxx.cloud.databricks.com`) | Yes |
| `DATABRICKS_TOKEN`     | Personal Access Token (`dapi...`)    | Yes |
| `PORT`                 | Backend port (default: `8000`)       | No  |
| `HOST`                 | Backend bind address (default: `0.0.0.0`) | No  |
| `AZURE_CLIENT_ID`      | Azure AD app client ID               | For Azure Login |
| `AZURE_TENANT_ID`      | Azure AD tenant (default: `common`)  | For Azure Login |
| `AZURE_REDIRECT_URI`   | OAuth callback URL                   | For Azure Login |

### Feature Flags

All features can be toggled in Settings > Features:

| Feature            | Description                              | Default |
|--------------------|------------------------------------------|---------|
| `dataQA`           | Conversational SQL Q&A                   | On  |
| `findEndpoint`     | NL endpoint discovery                    | On  |
| `workflowBuilder`  | Multi-step workflow generation            | On  |
| `codeGeneration`   | Multi-language code export                | On  |
| `testDataGenerator` | Test payload generation                  | On  |
| `queryExecution`   | SQL query editor                         | On  |
| `charts`           | Data visualization                       | On  |
| `security`         | Security recommendations                 | On  |
| `promptGenerator`  | Custom prompt builder                    | On  |
| `aiScripting`      | AI script generation + execution         | On  |
| `agentChat`        | Agent chat interface                     | On  |
| `queryBuilder`     | SQL query builder tab                    | On  |
| `testData`         | Test data generation                     | On  |
| `apiDocs`          | Browsable API documentation              | On  |

---

## Features

### 1. API Explorer
Browse 500+ Databricks REST API endpoints organized into categories:
- **Workspace APIs**: Clusters, Jobs, SQL, Notebooks, Repos, Secrets, MLflow, Unity Catalog, Serving, Security, Admin, Delta Sharing
- **Account APIs**: Identity & Access, Workspaces, Unity Catalog, Networking, Security, Billing

### 2. Request Playground
- Method selector (GET, POST, PUT, PATCH, DELETE)
- Path auto-complete from API catalog
- JSON body editor with validation
- AI-powered parameter suggestion
- Response viewer with JSON tree, charts, and pagination

### 3. SQL Query Editor
- Full SQL editor with syntax highlighting
- Unity Catalog browser (Catalog → Schema → Table → Columns)
- SQL Warehouse selector with live status indicators
- Paginated results with CSV/JSON export
- Handles large results via EXTERNAL_LINKS fallback

### 4. AI Assistant (13 Features)
- **Data Q&A** — Conversational SQL generation and data analysis
- **Find Endpoint** — Natural language to API endpoint mapping
- **Analyze Response** — AI explanation of API response data
- **Error Analysis** — Root cause and fix suggestions for errors
- **Workflow Builder** — Multi-step API workflow generation
- **Code Generation** — Export in 6 languages
- **Test Data** — Generate realistic request payloads
- **API Docs** — Searchable endpoint documentation
- **Agent Chat** — Conversational AI with tool calling
- **Query Builder** — NL to SQL conversion
- **Visualization** — Auto-detecting data charts
- **AI Scripting** — Python script generation and sandboxed execution
- **Prompt Manager** — Customize all 14 system prompts

### 5. Agent System
- Pre-built handlers (List Catalogs, Users, Groups, Tables)
- Custom agent builder with regex patterns
- Foundation model integration
- Conversation history support

### 6. Integrations & Export
- **Postman** — Export as Postman collection
- **Insomnia** — Export as Insomnia workspace
- **GitHub Actions** — Generate CI/CD workflow YAML
- **OpenAPI** — Generate OpenAPI 3.1.0 spec
- **Documents** — PDF, Word, Markdown export
- **Data** — Excel, CSV, JSON export

### 7. Azure Authentication
- OAuth login with Azure AD
- Progressive workspace selection (Tenant → Subscription → Workspace)
- Auto-populated Databricks credentials after workspace selection

---

## How to Build

### Build Scripts

All build scripts are in the `scripts/` directory with full cross-platform support:

| Script | Platform | Description |
|--------|----------|-------------|
| `scripts/build-all.sh` | macOS / Linux | Full build with options |
| `scripts/build-all.ps1` | Windows | Full build with options |
| `scripts/install.sh` | macOS / Linux | Prerequisites check + install |
| `scripts/install.ps1` | Windows | Prerequisites check + install |

### First-Time Setup

```bash
# macOS / Linux — checks prerequisites, installs all dependencies, creates .env files
./scripts/install.sh

# Windows PowerShell
.\scripts\install.ps1
```

### Build Everything

```bash
# macOS / Linux
./scripts/build-all.sh

# Windows PowerShell
.\scripts\build-all.ps1

# Or use Make shortcuts:
make build-all                 # Build all apps
make build-all-clean           # Clean + build all
make build-all-skip-tests      # Build all, skip tests
```

### Build Desktop App (macOS)

Produces a `.app` bundle and `.zip` for distribution (arm64).

```bash
# Full build (frontend + desktop)
make build-mac

# Or with the script directly:
./scripts/build-all.sh --desktop-mac --skip-tests
```

**Output:**
```
dist/desktop/mac/
├── Intelligence Studio.app      # Run directly
└── Intelligence Studio-1.0.0-arm64-mac.zip   # Distributable
```

**Requirements:**
- Must be run on macOS
- No Apple Developer certificate needed (unsigned build)

### Build Desktop App (Windows)

Produces an NSIS installer (`.exe`) and portable executable.

**Option A — Build on Windows natively (recommended):**
```powershell
.\scripts\build-all.ps1 -DesktopWin -SkipTests
```

**Option B — Cross-compile from macOS (requires Wine):**
```bash
# Install Wine first
brew install --cask wine-stable

# Then build
./scripts/build-all.sh --desktop-win --skip-tests

# Or use Make:
make build-win
```

**Output:**
```
dist/desktop/win/
├── Intelligence Studio Setup 1.0.0.exe    # NSIS installer
└── Intelligence Studio 1.0.0.exe          # Portable
```

### Build Individual Components

```bash
# Desktop only (macOS)
./scripts/build-all.sh --desktop-mac

# Desktop only (Windows, requires Wine on macOS)
./scripts/build-all.sh --desktop-win

# CLI only (packaged with install script)
./scripts/build-all.sh --cli

# Windows equivalents:
.\scripts\build-all.ps1 -DesktopWin
.\scripts\build-all.ps1 -Cli
```

### Build Options Reference

**macOS / Linux (`build-all.sh`):**

| Flag | Description |
|------|-------------|
| `--desktop` | Build desktop for all platforms |
| `--desktop-mac` | Build desktop for macOS only |
| `--desktop-win` | Build desktop for Windows only (requires Wine) |
| `--cli` | Package CLI only |
| `--skip-tests` | Skip Vitest + pytest before building |
| `--clean` | Remove previous build artifacts first |

**Windows (`build-all.ps1`):**

| Flag | Description |
|------|-------------|
| `-Desktop` | Build desktop for all platforms |
| `-DesktopWin` | Build desktop for Windows only |
| `-DesktopMac` | Build desktop for macOS only |
| `-Cli` | Package CLI only |
| `-SkipTests` | Skip tests before building |
| `-Clean` | Remove previous build artifacts first |

> **Note:** The frontend is automatically built and bundled into the desktop app via Electron's `extraResources`. There is no separate frontend or backend in `dist/` — the desktop app is self-contained.

### Build Output Structure

```
dist/
├── desktop/
│   ├── mac/               # macOS artifacts
│   │   ├── *.app          # Application bundle (run directly)
│   │   └── *.zip          # Distributable archive
│   └── win/               # Windows artifacts
│       └── *.exe          # NSIS installer + Portable
│
└── cli/                   # CLI tool
    ├── cli/               # Python source
    ├── pyproject.toml     # Package config
    ├── install.sh         # Linux/macOS install
    └── install.bat        # Windows install
```

### Make Commands Reference

| Command | Description |
|---------|-------------|
| `make setup` | Full setup (prerequisites check + install all) |
| `make setup-dev` | Setup with dev/test dependencies |
| `make dev` | Start frontend + backend dev servers |
| `make dev-frontend` | Start Vite dev server only |
| `make dev-backend` | Start FastAPI server only |
| `make install` | Install all dependencies |
| `make test` | Run all tests |
| `make build-all` | Full build (desktop + CLI) |
| `make build-all-clean` | Clean + full build |
| `make build-all-skip-tests` | Full build without tests |
| `make build-mac` | Build macOS desktop app |
| `make build-win` | Build Windows desktop app |
| `make build-cli` | Package CLI only |
| `make desktop-dev` | Start Electron in dev mode |
| `make cli-install` | Install CLI tool |
| `make clean` | Remove all build artifacts |

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [API Reference](./API_REFERENCE.md) | All 48 backend endpoints with request/response schemas |
| [Frontend Architecture](./FRONTEND_ARCHITECTURE.md) | Components, stores, hooks, and libraries |
| [Backend Architecture](./BACKEND_ARCHITECTURE.md) | Services, models, and data flow |
| [Development Guide](./DEVELOPMENT_GUIDE.md) | Setup, testing, building, and contributing |

---

## Tech Stack Summary

| Category | Technologies |
|----------|-------------|
| Frontend | React 18, TypeScript 5, Vite 6, Zustand 5, Tailwind CSS 4, Recharts, Lucide React, Axios |
| Backend  | FastAPI, Uvicorn, httpx, Pydantic v2, azure-identity |
| Desktop  | Electron 28, electron-builder |
| CLI      | Click, Rich, httpx |
| Testing  | Vitest, Testing Library, pytest, pytest-asyncio |
| Linting  | ruff (Python), TypeScript strict mode |
| Export   | jsPDF, ExcelJS, docx |
