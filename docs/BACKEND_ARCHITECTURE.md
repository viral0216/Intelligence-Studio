# Backend Architecture

FastAPI application with async HTTP client, service layer pattern, and Pydantic validation.

---

## Table of Contents

- [Technology Stack](#technology-stack)
- [Application Setup](#application-setup)
- [Router Layer](#router-layer)
- [Service Layer](#service-layer)
- [Data Models](#data-models)
- [Data Flow](#data-flow)
- [Security](#security)

---

## Technology Stack

| Category | Library | Version | Purpose |
|----------|---------|---------|---------|
| Framework | FastAPI | 0.115+ | Async web framework |
| Server | Uvicorn | 0.30+ | ASGI server |
| HTTP Client | httpx | 0.27+ | Async Databricks API calls |
| Validation | Pydantic | 2.9+ | Request/response models |
| Settings | pydantic-settings | 2.5+ | Environment config |
| Azure | azure-identity | 1.17+ | Azure AD authentication |
| Retry | tenacity | 9.0+ | Retry with backoff |
| Env | python-dotenv | 1.0+ | .env file loading |
| Testing | pytest | 8.0+ | Test framework |
| Linting | ruff | 0.6+ | Python linter/formatter |

---

## Application Setup

### Entry Point: `backend/app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Intelligence Studio API", version="1.0.0")

# CORS: Allow all origins for development
app.add_middleware(CORSMiddleware, allow_origins=["*"], ...)

# Router registration
app.include_router(health.router,        prefix="/api",           tags=["health"])
app.include_router(proxy.router,         prefix="/api",           tags=["proxy"])
app.include_router(ai.router,            prefix="/api/ai",        tags=["ai"])
app.include_router(query.router,         prefix="/api/ai",        tags=["query"])
app.include_router(agent.router,         prefix="/api/agent",     tags=["agent"])
app.include_router(custom_agents.router, prefix="/api",           tags=["custom-agents"])
app.include_router(azure_auth.router,    prefix="/api/azure",     tags=["azure"])
app.include_router(notebooks.router,     prefix="/api/notebooks", tags=["notebooks"])
app.include_router(tools.router,         prefix="/api/tools",     tags=["tools"])
```

### Configuration: `backend/app/config.py`

Environment variables loaded from `.env`:

```python
class Settings(BaseSettings):
    DATABRICKS_HOST: str = ""
    DATABRICKS_TOKEN: str = ""
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    AZURE_CLIENT_ID: str = ""
    AZURE_TENANT_ID: str = "common"
    AZURE_REDIRECT_URI: str = "http://localhost:8000/api/azure/auth/callback"
```

---

## Router Layer

### Router Summary

| Router | Prefix | Endpoints | Primary Service |
|--------|--------|-----------|----------------|
| `health.py` | `/api` | 2 | Inline (httpx) |
| `proxy.py` | `/api` | 1 | `databricks_client` |
| `ai.py` | `/api/ai` | 20 | `ai_helper` |
| `query.py` | `/api/ai` | 4 | `query_store` + Databricks SQL API |
| `agent.py` | `/api/agent` | 5 | `agent_system` |
| `custom_agents.py` | `/api` | 4 | In-memory list |
| `azure_auth.py` | `/api/azure` | 8 | `azure_auth` |
| `notebooks.py` | `/api/notebooks` | 1 | Databricks Workspace API |
| `tools.py` | `/api/tools` | 3 | `tools_service` + `ai_helper` |
| **Total** | | **48** | |

### Request Flow

```
Client Request
    │
    ▼
FastAPI Router (Pydantic validation)
    │
    ▼
Service Layer (business logic)
    │
    ▼
httpx AsyncClient → Databricks REST API
    │
    ▼
Response Processing
    │
    ▼
Pydantic Response Model → JSON Response
```

---

## Service Layer

### 1. `ai_helper.py` — AI Foundation Model Service

The largest service — handles all AI-powered features by calling Databricks Foundation Model serving endpoints.

**Configuration:**
```python
DEFAULT_MODEL = "databricks-meta-llama-3-1-405b-instruct"
DEFAULT_TEMPERATURE = 0.1
DEFAULT_MAX_TOKENS = 4096
```

**Core Functions:**

#### `call_databricks_model(prompt, model, host, token, max_tokens, system_prompt) → str`
Low-level function that calls a Databricks serving endpoint.

```
POST {host}/serving-endpoints/{model}/invocations
{
  "messages": [
    {"role": "system", "content": system_prompt},
    {"role": "user", "content": prompt}
  ],
  "temperature": 0.1,
  "max_tokens": 4096
}
```

Returns: Content string from the model response.

#### `call_databricks_model_with_metadata(prompt, ...) → dict`
Extended version that tracks token usage and duration.

Returns:
```python
{
    "content": "model response text",
    "metadata": {
        "model": "databricks-meta-llama-3-1-405b-instruct",
        "temperature": 0.1,
        "maxTokens": 4096,
        "promptTokens": 150,
        "completionTokens": 200,
        "totalTokens": 350,
        "durationMs": 1234
    }
}
```

Handles multiple response formats: `choices[0].message.content`, `predictions[0]`, `output`

#### AI Feature Functions

All follow the same pattern:
1. Build a specialized system prompt
2. Format the user prompt with context
3. Call `call_databricks_model_with_metadata()`
4. Parse and return structured response

| Function | Purpose | Returns |
|----------|---------|---------|
| `recommend_endpoint()` | Find API endpoint from NL | Markdown recommendation |
| `natural_language_to_api()` | NL → API call spec | JSON with method, path, body |
| `suggest_parameters()` | Generate request body | JSON parameters |
| `analyze_response()` | Explain response data | Markdown analysis |
| `explain_error()` | Error diagnosis | Root cause + fix |
| `data_assistant()` | SQL Q&A | SQL + explanation |
| `generate_workflow()` | Multi-step workflow | Markdown workflow |
| `generate_script()` | Python automation | Script + metadata |
| `generate_prompt()` | Optimized prompt | Prompt text |
| `generate_tests()` | Test cases | Test descriptions |
| `generate_security_recommendations()` | Security analysis | Recommendations |
| `generate_code_samples()` | Multi-language code | Code snippets |
| `generate_documentation()` | API docs | Markdown docs |
| `validate_execution()` | Validate script output | Validation report |

---

### 2. `databricks_client.py` — API Proxy Service

Proxies HTTP requests to Databricks REST APIs with retry logic.

#### `databricks_request(req: ProxyRequest) → ProxyResponse`

```python
# Retry configuration
max_retries = 3
backoff_factor = 1  # exponential backoff

# Timeout
timeout = 30.0  # seconds

# Rate limiting
# Handles HTTP 429 with Retry-After header
```

**Error Handling:**
- `RateLimitError` for HTTP 429 responses
- Token redaction in error logs via `_redact_token()`
- Retry with exponential backoff: 1s, 2s, 4s

**Response:**
```python
ProxyResponse(
    status=200,
    data={"clusters": [...]},
    headers={"content-type": "application/json"},
    durationMs=456,
    requestId="abc-123"
)
```

---

### 3. `azure_auth.py` — Azure Authentication Service

Manages Azure AD authentication with credential caching.

**Login Flow:**
```
1. Try AzureCliCredential (az login)
    ↓ (if fails)
2. Try EnvironmentCredential (env vars)
    ↓ (if fails)
3. Try InteractiveBrowserCredential (browser popup)
```

**Key Functions:**

| Function | Description |
|----------|-------------|
| `login()` | Authenticate and return token + user info |
| `logout()` | Clear cached credentials |
| `get_status()` | Check if authenticated |
| `login_tenant(tenant_id)` | Switch Azure tenant |
| `list_tenants()` | List AD tenants via `az account list` |
| `list_subscriptions()` | List subscriptions via `az account list` |
| `list_databricks_workspaces(sub_id)` | Query Azure Management API for workspaces |
| `get_databricks_workspace_access(resource_id)` | Get Databricks token for workspace |

**Workspace Access Flow:**
```
1. Get ARM management token
2. Get Databricks-scoped token (audience: 2ff814a6-3304-4ab8-85cb-cd0e6f879c1d)
3. Extract workspace URL from resource metadata
4. Return { workspace_url, token, name }
```

---

### 4. `query_store.py` — Query Result Cache

In-memory cache for SQL query results with TTL.

```python
TTL_SECONDS = 3600  # 1 hour

class QueryStore:
    _store: dict[str, {
        "sql": str,
        "rows": list,
        "columns": list[str],
        "timestamp": float
    }]
```

**Functions:**

| Function | Description |
|----------|-------------|
| `store(sql, rows, columns)` | Cache results, return 12-char UUID |
| `get(query_id, page, page_size)` | Paginated retrieval (checks TTL) |
| `export(query_id, format)` | Export as CSV string or JSON dict |
| `_cleanup()` | Remove expired entries |

**Singleton:** `query_store = QueryStore()`

---

### 5. `agent_system.py` — Agent Registry

Routes messages to appropriate handlers.

**Handler Priority:**
```
1. Default Handlers (pattern-matched)
    ↓ (no match)
2. Custom Handlers (user-defined)
    ↓ (no match)
3. Foundation Model (fallback)
```

**Default Handlers:**

| Name | Pattern | API Endpoint |
|------|---------|-------------|
| List Catalogs | `catalog` | `GET /api/2.1/unity-catalog/catalogs` |
| List Users | `user` | `GET /api/2.0/preview/scim/v2/Users` |
| List Groups | `group` | `GET /api/2.0/preview/scim/v2/Groups` |
| List Tables | `table` | `GET /api/2.1/unity-catalog/tables` |

**Custom Handler Execution:**
```python
handler_types = {
    "api": calls Databricks API endpoint,
    "transform": data transformation,
    "custom": custom logic
}
```

**Singleton:** `agent_registry = AgentRegistry()`

---

### 6. `script_executor.py` — Python Script Sandbox

Executes user-generated Python scripts in a subprocess.

**Safety Validation:**
Blocked patterns (regex):
```python
BLOCKED_PATTERNS = [
    r"os\.system",
    r"subprocess\.",
    r"__import__",
    r"\bexec\s*\(",
    r"\beval\s*\(",
    r"shutil\.rmtree",
    r"open\s*\(.*['\"]w['\"]",  # file write
]
```

**Execution Flow:**
```
1. validate_script_safety(script)
    ↓ (if safe)
2. Wrap script with error handling + credential injection
3. Run via asyncio.create_subprocess_exec("python", "-c", wrapped_script)
4. Capture stdout + stderr
5. Parse JSON output from script
6. Return { success, logs, output, data, error, durationMs }
```

**Timeout:** 300 seconds (5 minutes)

**Credential Injection:**
```python
# The wrapper injects these as environment variables:
os.environ["DATABRICKS_HOST"] = host
os.environ["DATABRICKS_TOKEN"] = token
```

---

### 7. `pricing.py` — Model Pricing

Static pricing data for foundation models.

```python
PRICING_DATA = {
    "databricks-meta-llama-3-1-405b-instruct": {
        "inputPer1M": 5.0,
        "outputPer1M": 15.0,
        "dbuPerToken": 0.0001
    },
    "databricks-meta-llama-3-1-70b-instruct": {
        "inputPer1M": 1.0,
        "outputPer1M": 3.0,
        "dbuPerToken": 0.00005
    },
    # ... more models
}
```

---

### 8. `tools_service.py` — OpenAPI Generation

Generates OpenAPI 3.1.0 specification from built-in catalog.

```python
def generate_catalog_openapi():
    return {
        "openapi": "3.1.0",
        "info": {"title": "Databricks REST API", "version": "2.0"},
        "paths": { ... },  # 13 common endpoints
        "components": {
            "securitySchemes": {
                "bearerAuth": {"type": "http", "scheme": "bearer"}
            }
        },
        "source": "built-in catalog",
        "endpointCount": 13
    }
```

---

## Data Models

### Common (`models/common.py`)

```python
class HttpMethod(str, Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    PATCH = "PATCH"
    DELETE = "DELETE"

class ErrorResponse(BaseModel):
    error: str
    detail: str | None = None
```

### Proxy (`models/proxy.py`)

```python
class ProxyRequest(BaseModel):
    method: HttpMethod
    path: str
    body: dict | list | None = None
    token: str | None = None
    host: str | None = None

class ProxyResponse(BaseModel):
    status: int
    data: dict | list | str | None = None
    headers: dict = {}
    durationMs: int = 0
    requestId: str | None = None
```

### AI (`models/ai.py`)

```python
class ModelCallMetadata(BaseModel):
    model: str
    temperature: float
    maxTokens: int
    promptTokens: int
    completionTokens: int
    totalTokens: int
    durationMs: int
    region: str | None = None

class AiResponse(BaseModel):
    content: str
    metadata: ModelCallMetadata

class ApiCallSpec(BaseModel):
    method: str
    path: str
    body: dict | None = None
    explanation: str
    confidence: float
```

### Agent (`models/agent.py`)

```python
class ChatMessage(BaseModel):
    role: str
    content: str

class AgentConfig(BaseModel):
    name: str
    description: str
    pattern: str
    handler: str
    config: dict | None = None
    enabled: bool = True

class AgentResponse(BaseModel):
    response: str
    metadata: dict | None = None
```

### Query (`models/query.py`)

```python
class QueryRequest(BaseModel):
    sql: str
    warehouseId: str
    host: str
    token: str

class QueryResult(BaseModel):
    success: bool
    state: str
    rows: list = []
    columns: list[str] = []
    rowCount: int = 0
    queryId: str | None = None
    hasMore: bool = False
    error: str | None = None
```

### Azure (`models/azure.py`)

```python
class AzureTenant(BaseModel):
    tenantId: str
    displayName: str | None = None

class AzureSubscription(BaseModel):
    subscriptionId: str
    displayName: str
    state: str | None = None

class DatabricksWorkspace(BaseModel):
    id: str
    name: str
    location: str
    workspaceUrl: str | None = None
    properties: dict | None = None
```

---

## Data Flow

### API Request Proxy Flow

```
Frontend                     Backend                          Databricks
   │                            │                                │
   │ POST /api/proxy            │                                │
   │ {method, path, body,       │                                │
   │  host, token}              │                                │
   │ ──────────────────────────>│                                │
   │                            │ httpx.AsyncClient              │
   │                            │ {method} {host}{path}          │
   │                            │ Authorization: Bearer {token}  │
   │                            │ ──────────────────────────────>│
   │                            │                                │
   │                            │ JSON Response                  │
   │                            │ <──────────────────────────────│
   │                            │                                │
   │ ProxyResponse              │                                │
   │ {status, data, headers,    │                                │
   │  durationMs, requestId}    │                                │
   │ <──────────────────────────│                                │
```

### SQL Query Execution Flow

```
Frontend                     Backend                          Databricks SQL API
   │                            │                                │
   │ POST /api/ai/execute-query │                                │
   │ {sql, warehouseId,         │                                │
   │  host, token}              │                                │
   │ ──────────────────────────>│                                │
   │                            │ 1. Try INLINE disposition      │
   │                            │ POST /api/2.0/sql/statements   │
   │                            │ ──────────────────────────────>│
   │                            │                                │
   │                            │ Result < 25MB?                 │
   │                            │ YES: Return inline data ───────│
   │                            │ NO: "Inline byte limit" error  │
   │                            │                                │
   │                            │ 2. Fallback: EXTERNAL_LINKS    │
   │                            │ POST /api/2.0/sql/statements   │
   │                            │ ──────────────────────────────>│
   │                            │                                │
   │                            │ 3. Poll until SUCCEEDED        │
   │                            │ GET /api/2.0/sql/statements/id │
   │                            │ ──────────────────────────────>│
   │                            │                                │
   │                            │ 4. Fetch from external link    │
   │                            │ GET {external_link_url}        │
   │                            │ ──────────────────────────────>│
   │                            │                                │
   │                            │ 5. Store in QueryStore (1hr)   │
   │                            │                                │
   │ {success, rows, columns,   │                                │
   │  rowCount, queryId,        │                                │
   │  hasMore}                  │                                │
   │ <──────────────────────────│                                │
```

### AI Feature Flow

```
Frontend                     Backend                    Databricks Serving
   │                            │                            │
   │ POST /api/ai/{feature}     │                            │
   │ {input, host, token,       │                            │
   │  model, systemPrompt}      │                            │
   │ ──────────────────────────>│                            │
   │                            │ Build system prompt        │
   │                            │ Format user prompt         │
   │                            │                            │
   │                            │ POST /serving-endpoints/   │
   │                            │   {model}/invocations      │
   │                            │ {messages, temperature,    │
   │                            │  max_tokens}               │
   │                            │ ──────────────────────────>│
   │                            │                            │
   │                            │ {choices, usage}           │
   │                            │ <──────────────────────────│
   │                            │                            │
   │                            │ Parse response             │
   │                            │ Track token usage          │
   │                            │                            │
   │ {content, metadata}        │                            │
   │ <──────────────────────────│                            │
```

### Azure Login Flow

```
Frontend                     Backend                    Azure AD
   │                            │                          │
   │ POST /api/azure/auth/login │                          │
   │ ──────────────────────────>│                          │
   │                            │ 1. AzureCliCredential    │
   │                            │ ──────────────────────> │ (az login)
   │                            │    OR                    │
   │                            │ 2. EnvironmentCredential │
   │                            │    OR                    │
   │                            │ 3. InteractiveBrowser    │
   │                            │ ──────────────────────> │ (browser popup)
   │                            │                          │
   │                            │ access_token             │
   │                            │ <────────────────────── │
   │                            │                          │
   │ {access_token, user_name,  │                          │
   │  user_email, method}       │                          │
   │ <──────────────────────────│                          │
   │                            │                          │
   │ GET /api/azure/tenants     │                          │
   │ ──────────────────────────>│ az account list          │
   │ tenants[]                  │ <────────────────────── │
   │ <──────────────────────────│                          │
   │                            │                          │
   │ GET /api/azure/workspaces  │                          │
   │ ?subscriptionId=...        │ Azure Management API     │
   │ ──────────────────────────>│ ──────────────────────> │
   │ workspaces[]               │ <────────────────────── │
   │ <──────────────────────────│                          │
   │                            │                          │
   │ POST /api/azure/           │                          │
   │   databricks-workspace-    │ 1. Get ARM token         │
   │   access                   │ 2. Get DB-scoped token   │
   │ ──────────────────────────>│ ──────────────────────> │
   │ {workspace_url, token}     │ <────────────────────── │
   │ <──────────────────────────│                          │
```

---

## Security

### API Proxy Validation
- Path must start with `/api/2.0/` or `/api/2.1/`
- Token passed per-request (not stored server-side)
- Token redaction in error logs

### Script Execution Sandbox
- Regex-based pattern blocking (os.system, subprocess, exec, eval, etc.)
- File write operations blocked
- 5-minute execution timeout
- Subprocess isolation
- Credentials injected via environment variables (not embedded in script)

### CORS
- Development: All origins allowed (`*`)
- Production: Should be restricted to frontend domain

### Azure Authentication
- MSAL-based OAuth 2.0
- Token caching with expiration
- Supports multi-tenant scenarios
- Databricks-scoped token acquisition (audience: `2ff814a6-3304-4ab8-85cb-cd0e6f879c1d`)
