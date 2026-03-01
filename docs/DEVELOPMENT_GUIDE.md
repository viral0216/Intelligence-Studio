# Development Guide

Setup, development workflow, testing, building, and deployment.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Workflow](#development-workflow)
- [Make Commands](#make-commands)
- [Project Configuration](#project-configuration)
- [Testing](#testing)
- [Building for Production](#building-for-production)
- [Desktop Application](#desktop-application)
- [CLI Tool](#cli-tool)
- [Adding New Features](#adding-new-features)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.11+ | Backend runtime |
| Node.js | 18+ | Frontend runtime |
| npm | 9+ | Frontend package manager |
| pip | Latest | Python package manager |
| Git | Latest | Version control |
| Azure CLI | Latest | Azure login (optional) |

---

## Initial Setup

### 1. Clone and Install

```bash
git clone <repo-url>
cd Intelligence-Studio

# Install everything
make install
```

Or install individually:

```bash
# Frontend
cd frontend && npm install && cd ..

# Backend
cd backend && pip install -e ".[dev]" && cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Edit both files:

```env
# Required
DATABRICKS_HOST=https://your-workspace.cloud.databricks.com
DATABRICKS_TOKEN=dapi...

# Optional: Server config
PORT=8000
HOST=0.0.0.0

# Optional: Azure OAuth
AZURE_CLIENT_ID=your-app-registration-client-id
AZURE_TENANT_ID=common
AZURE_REDIRECT_URI=http://localhost:8000/api/azure/auth/callback
```

### 3. Start Development Servers

```bash
make dev
```

This starts:
- **Frontend:** `http://localhost:5173` (Vite dev server with HMR)
- **Backend:** `http://localhost:8000` (Uvicorn with auto-reload)

### 4. First Run Checklist

1. Open `http://localhost:5173`
2. Click the Settings icon (gear) in the header
3. Enter your Databricks Host URL and Token
4. Click "Test Connection" — should show green "Connected"
5. Close settings and start exploring APIs

---

## Development Workflow

### Frontend Development

```bash
make dev-frontend
# Runs: cd frontend && npm run dev
# Vite dev server at http://localhost:5173 with Hot Module Replacement
```

**Key conventions:**
- Components in `frontend/src/components/{category}/`
- State in `frontend/src/stores/{name}Store.ts`
- API calls in `frontend/src/lib/api.ts`
- Types in `frontend/src/types/`
- Hooks in `frontend/src/hooks/`
- Styling: Tailwind CSS utilities + CSS variables in `index.css`

### Backend Development

```bash
make dev-backend
# Runs: cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Key conventions:**
- Routes in `backend/app/routers/{name}.py`
- Business logic in `backend/app/services/{name}.py`
- Request/response models in `backend/app/models/{name}.py`
- Register new routers in `backend/app/main.py`

### File Watching

- **Frontend:** Vite watches all files in `frontend/src/` — changes trigger instant HMR
- **Backend:** Uvicorn `--reload` watches all `.py` files in `backend/` — changes trigger server restart

---

## Make Commands

### Development

| Command | Description |
|---------|-------------|
| `make dev` | Start frontend + backend in parallel |
| `make dev-frontend` | Start React dev server only |
| `make dev-backend` | Start FastAPI server only |

### Installation

| Command | Description |
|---------|-------------|
| `make install` | Install all dependencies (frontend + backend) |
| `make install-frontend` | `npm install` in frontend/ |
| `make install-backend` | `pip install -e ".[dev]"` in backend/ |

### Testing

| Command | Description |
|---------|-------------|
| `make test` | Run all tests (frontend + backend) |
| `make test-frontend` | `npm test` (Vitest) |
| `make test-backend` | `pytest` in backend/ |

### Building

| Command | Description |
|---------|-------------|
| `make build` | Build frontend for production |
| `make build-frontend` | `npm run build` (Vite) |
| `make desktop-dev` | Start Electron in development mode |
| `make desktop-build` | Build Electron app for distribution |

### CLI

| Command | Description |
|---------|-------------|
| `make cli-install` | `pip install -e .` in cli/ |

### Cleanup

| Command | Description |
|---------|-------------|
| `make clean` | Remove dist/, node_modules/, __pycache__/, .pytest_cache/ |

---

## Project Configuration

### Frontend (`frontend/vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': '/src' }  // @/ maps to src/
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000'  // Proxy API calls to backend
    }
  }
})
```

### Frontend (`frontend/tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "jsx": "react-jsx",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### Backend (`backend/pyproject.toml`)

```toml
[project]
name = "intelligence-studio-backend"
version = "1.0.0"
requires-python = ">=3.11"

[project.optional-dependencies]
dev = ["pytest>=8.0.0", "pytest-asyncio>=0.24.0", "ruff>=0.6.0"]
```

---

## Testing

### Frontend Tests (Vitest)

```bash
cd frontend
npm test              # Run once
npm run test:watch    # Watch mode
```

Test files: `frontend/src/**/*.test.{ts,tsx}`

Technologies:
- **Vitest** — Test runner (Jest-compatible)
- **Testing Library** — Component testing
- **jsdom** — DOM environment

### Backend Tests (pytest)

```bash
cd backend
pytest                # Run all tests
pytest -v             # Verbose output
pytest tests/test_ai.py  # Run specific test file
```

Test files: `backend/tests/test_*.py`

Technologies:
- **pytest** — Test framework
- **pytest-asyncio** — Async test support
- **httpx** — Test client

### Test Structure

```
backend/tests/
├── conftest.py        # Fixtures (FastAPI test client)
├── test_agent.py      # Agent system tests
├── test_ai.py         # AI feature tests
└── test_proxy.py      # Proxy endpoint tests
```

---

## Building for Production

### Frontend Build

```bash
make build-frontend
# Output: frontend/dist/
```

The built files can be served by any static file server or bundled into the Electron app.

### Backend Deployment

The backend is a standard FastAPI application:

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

For production, use with a process manager:

```bash
# With gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

## Desktop Application

### Development

```bash
make desktop-dev
# Starts Electron loading the Vite dev server
```

### Building

```bash
make desktop-build
```

**Build targets (configured in `desktop/package.json`):**

| Platform | Format | Architecture |
|----------|--------|-------------|
| macOS | DMG, ZIP | x64, arm64 |
| Windows | NSIS, Portable | x64 |

**App metadata:**
- App ID: `com.intelligence.studio`
- Name: Intelligence Studio
- Category: Developer Tools

### Desktop Architecture

```
desktop/
├── main.js      # Electron main process
│                # Creates BrowserWindow
│                # Loads frontend URL or built files
├── preload.js   # IPC bridge between main and renderer
│                # Exposes safe APIs to frontend
└── package.json # Electron config + builder config
```

---

## CLI Tool

### Installation

```bash
make cli-install
# Or: cd cli && pip install -e .
```

### Usage

```bash
dbx-cli --help
```

### Architecture

```
cli/
├── cli/
│   ├── __init__.py
│   └── main.py      # Click-based commands
└── pyproject.toml    # Entry point: dbx-cli → cli.main:cli
```

---

## Adding New Features

### Adding a New Backend Endpoint

1. **Create model** (if needed) in `backend/app/models/`:
```python
# backend/app/models/my_feature.py
from pydantic import BaseModel

class MyRequest(BaseModel):
    param: str

class MyResponse(BaseModel):
    result: str
```

2. **Create service** in `backend/app/services/`:
```python
# backend/app/services/my_service.py
async def do_something(param: str) -> dict:
    # Business logic here
    return {"result": "done"}
```

3. **Create router** in `backend/app/routers/`:
```python
# backend/app/routers/my_feature.py
from fastapi import APIRouter
from app.models.my_feature import MyRequest

router = APIRouter()

@router.post("/my-endpoint")
async def my_endpoint(req: MyRequest):
    from app.services.my_service import do_something
    return await do_something(req.param)
```

4. **Register router** in `backend/app/main.py`:
```python
from app.routers import my_feature
app.include_router(my_feature.router, prefix="/api", tags=["my-feature"])
```

### Adding a New Frontend Component

1. **Create component** in appropriate directory:
```tsx
// frontend/src/components/my-feature/MyComponent.tsx
import { useMyStore } from '@/stores/myStore'

export default function MyComponent() {
  const { data } = useMyStore()
  return <div>{data}</div>
}
```

2. **Add API function** in `frontend/src/lib/api.ts`:
```typescript
export async function myApiCall(param: string) {
  const res = await axios.post(`${BASE_URL}/api/my-endpoint`, { param })
  return res.data
}
```

3. **Add store** (if needed) in `frontend/src/stores/`:
```typescript
// frontend/src/stores/myStore.ts
import { create } from 'zustand'

interface MyStore {
  data: string
  setData: (data: string) => void
}

export const useMyStore = create<MyStore>((set) => ({
  data: '',
  setData: (data) => set({ data }),
}))
```

4. **Add to layout** in `MainLayout.tsx` or relevant parent component.

### Adding a New AI Feature

1. Add system prompt in `backend/app/services/ai_helper.py`:
```python
async def my_ai_feature(input: str, model=None, host=None, token=None):
    system_prompt = "You are an expert at..."
    user_prompt = f"Please analyze: {input}"
    return await call_databricks_model_with_metadata(
        prompt=user_prompt,
        model=model or DEFAULT_MODEL,
        host=host,
        token=token,
        system_prompt=system_prompt,
    )
```

2. Add router endpoint in `backend/app/routers/ai.py`
3. Add API client function in `frontend/src/lib/api.ts`
4. Add tab component in `frontend/src/components/ai/`
5. Add tab to `AiAssistant.tsx`
6. Add feature flag in `settingsStore.ts` → `features`
7. Add custom prompt slot in `settingsStore.ts` → `prompts`

### Adding an API Catalog Category

Edit `frontend/src/lib/apiCatalog.ts`:

```typescript
{
  name: "My Category",
  icon: "IconName",         // Must exist in categoryIcons.tsx
  audience: "workspace",    // or "account" for account-level APIs
  subcategories: [
    {
      name: "Subcategory",
      endpoints: [
        {
          label: "List Items",
          method: "GET",
          path: "/api/2.0/my-service/items",
          description: "Lists all items",
          queryParams: [
            { name: "limit", type: "number", required: false, description: "Max results" }
          ]
        },
        {
          label: "Create Item",
          method: "POST",
          path: "/api/2.0/my-service/items",
          description: "Creates a new item",
          body: { name: "example-item" }
        }
      ]
    }
  ]
}
```

If using a new icon, add it to `frontend/src/lib/categoryIcons.tsx`:
```tsx
import { MyIcon } from 'lucide-react'
const ICON_MAP = { ..., MyIcon }
```

---

## Troubleshooting

### Common Issues

**"Cannot connect to Databricks"**
- Verify host URL includes `https://` and no trailing slash
- Check token starts with `dapi`
- Test with: `curl -H "Authorization: Bearer dapi..." https://host/api/2.0/clusters/list`

**"CORS error in browser"**
- Ensure backend is running on port 8000
- Vite proxy should handle `/api` → `http://localhost:8000`
- Check backend CORS middleware allows frontend origin

**"Inline byte limit exceeded"**
- This is handled automatically — backend falls back to EXTERNAL_LINKS disposition
- If still failing, check backend logs for httpx errors
- Ensure warehouse is in RUNNING state

**"Module not found" in frontend**
- Run `npm install` in `frontend/`
- Check `@/` paths resolve (configured in `vite.config.ts` and `tsconfig.json`)

**"Import error" in backend**
- Run `pip install -e ".[dev]"` in `backend/`
- Ensure Python 3.11+

**Azure login not working**
- Install Azure CLI: `az login` must work first
- Set `AZURE_CLIENT_ID` in `.env` for OAuth flow
- Check `AZURE_REDIRECT_URI` matches your app registration

**Warehouse showing as STOPPED**
- Warehouses auto-stop after inactivity
- Start from Databricks UI or use: `POST /api/2.0/sql/warehouses/{id}/start`
- Queries will fail until warehouse is RUNNING

### Log Locations

| Component | Logs |
|-----------|------|
| Frontend | Browser DevTools console |
| Backend | Terminal running `make dev-backend` |
| Electron | DevTools (Ctrl+Shift+I) + main process stdout |
