# API Reference

Intelligence Studio Backend — 48 REST endpoints across 10 routers.

**Base URL:** `http://localhost:8000`

---

## Table of Contents

- [Health](#health)
- [Proxy](#proxy)
- [AI Features](#ai-features)
- [SQL Query Execution](#sql-query-execution)
- [Agent System](#agent-system)
- [Custom Agents](#custom-agents)
- [Azure Authentication](#azure-authentication)
- [Notebooks](#notebooks)
- [Tools](#tools)

---

## Health

### `GET /api/health`

Basic server health check.

**Response:**
```json
{
  "ok": true,
  "message": "Intelligence Studio backend is running",
  "durationMs": 0
}
```

---

### `POST /api/health/check`

Test Databricks workspace connectivity.

**Request Body:**
```json
{
  "host": "https://your-workspace.cloud.databricks.com",
  "token": "dapi..."
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Connected to Databricks workspace",
  "durationMs": 234
}
```

---

## Proxy

### `POST /api/proxy`

Proxy requests to Databricks REST APIs. Validates paths start with `/api/2.0/` or `/api/2.1/`.

**Request Body:**
```json
{
  "method": "GET",
  "path": "/api/2.0/clusters/list",
  "body": null,
  "token": "dapi...",
  "host": "https://your-workspace.cloud.databricks.com"
}
```

**Response:**
```json
{
  "status": 200,
  "data": { "clusters": [...] },
  "headers": { "content-type": "application/json" },
  "durationMs": 456,
  "requestId": "abc-123"
}
```

**Notes:**
- Supports GET, POST, PUT, PATCH, DELETE methods
- 30-second timeout per request
- Automatic retry with exponential backoff (max 3 attempts)
- Handles 429 rate limiting

---

## AI Features

All AI endpoints are mounted at `/api/ai/`.

### `GET /api/ai/models`

List available foundation models from the Databricks workspace.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `host` | string | Databricks host (optional) |
| `token` | string | PAT (optional) |

**Response:**
```json
{
  "models": [
    "databricks-meta-llama-3-1-405b-instruct",
    "databricks-meta-llama-3-1-70b-instruct",
    "databricks-claude-3-5-sonnet",
    ...
  ]
}
```

---

### `GET /api/ai/pricing`

Get model pricing data.

**Response:**
```json
{
  "databricks-meta-llama-3-1-405b-instruct": {
    "inputPer1M": 5.0,
    "outputPer1M": 15.0,
    "dbuPerToken": 0.0001
  },
  ...
}
```

---

### `GET /api/ai/pricing/refresh`

Refresh pricing data from source.

---

### `POST /api/ai/recommend-endpoint`

Find the best Databricks API endpoint for a natural language query.

**Request Body:**
```json
{
  "query": "How do I list all clusters?",
  "host": "https://...",
  "token": "dapi...",
  "model": "databricks-meta-llama-3-1-405b-instruct",
  "customSystemPrompt": null
}
```

**Response:**
```json
{
  "recommendation": "**GET /api/2.0/clusters/list**\n\nThis endpoint returns...",
  "metadata": {
    "model": "databricks-meta-llama-3-1-405b-instruct",
    "promptTokens": 150,
    "completionTokens": 200,
    "totalTokens": 350,
    "durationMs": 1234
  }
}
```

---

### `POST /api/ai/natural-language-to-api`

Convert natural language to a structured API call specification.

**Request Body:**
```json
{
  "query": "list all running clusters",
  "host": "https://...",
  "token": "dapi...",
  "model": "databricks-meta-llama-3-1-405b-instruct",
  "systemPrompt": null
}
```

**Response:**
```json
{
  "apiCall": {
    "method": "GET",
    "path": "/api/2.0/clusters/list",
    "body": null,
    "explanation": "Lists all clusters in the workspace",
    "confidence": 0.95
  },
  "metadata": { ... }
}
```

---

### `POST /api/ai/suggest-parameters`

Suggest request body parameters for an API endpoint.

**Request Body:**
```json
{
  "endpoint": "/api/2.0/clusters/create",
  "method": "POST",
  "userIntent": "Create a small cluster for testing",
  "host": "https://...",
  "token": "dapi...",
  "model": "...",
  "customSystemPrompt": null
}
```

**Response:**
```json
{
  "suggestion": "{\"cluster_name\": \"test-cluster\", \"spark_version\": \"14.3.x-scala2.12\", ...}",
  "metadata": { ... }
}
```

---

### `POST /api/ai/analyze-response`

Analyze an API response and provide insights.

**Request Body:**
```json
{
  "endpoint": "/api/2.0/clusters/list",
  "method": "GET",
  "response": { "clusters": [...] },
  "host": "https://...",
  "token": "dapi...",
  "model": "...",
  "customSystemPrompt": null
}
```

**Response:**
```json
{
  "analysis": "## Response Analysis\n\nThe response contains 5 clusters...",
  "metadata": { ... }
}
```

---

### `POST /api/ai/explain-error`

Explain an API error and suggest fixes.

**Request Body:**
```json
{
  "endpoint": "/api/2.0/clusters/create",
  "method": "POST",
  "errorResponse": { "error_code": "INVALID_PARAMETER_VALUE", ... },
  "requestBody": { ... },
  "host": "https://...",
  "token": "dapi...",
  "model": "...",
  "customSystemPrompt": null
}
```

**Response:**
```json
{
  "explanation": "## Error Explanation\n\n**Root Cause:** ...\n\n**Fix:** ...",
  "metadata": { ... }
}
```

---

### `POST /api/ai/data-assistant`

Conversational data assistant for SQL generation and data Q&A.

**Request Body:**
```json
{
  "question": "Show me all tables in the main catalog",
  "host": "https://...",
  "token": "dapi...",
  "model": "...",
  "conversationHistory": [
    { "role": "user", "content": "previous question" },
    { "role": "assistant", "content": "previous answer" }
  ],
  "systemPrompt": null,
  "warehouseId": "abc123"
}
```

**Response:**
```json
{
  "answer": "Here are the tables in your main catalog:\n\n```sql\nSHOW TABLES IN main\n```\n...",
  "metadata": { ... }
}
```

---

### `POST /api/ai/generate-workflow`

Generate a multi-step API workflow from a goal description.

**Request Body:**
```json
{
  "goal": "Create a cluster, run a job, and delete the cluster",
  "host": "https://...",
  "token": "dapi...",
  "model": "...",
  "customSystemPrompt": null
}
```

**Response:**
```json
{
  "workflow": "## Workflow: Ephemeral Cluster Job Run\n\n### Step 1: Create Cluster\n...",
  "metadata": { ... }
}
```

---

### `POST /api/ai/generate-script`

Generate a Python automation script.

**Request Body:**
```json
{
  "prompt": "Script to list all clusters and their states",
  "category": "Cluster Management",
  "host": "https://...",
  "token": "dapi...",
  "model": "...",
  "customSystemPrompt": null
}
```

**Response:**
```json
{
  "script": "import requests\n\nhost = ...",
  "language": "python",
  "estimatedImpact": "Read-only operation, lists cluster states",
  "metadata": { ... }
}
```

---

### `POST /api/ai/execute-script`

Execute a Python script in a sandboxed environment.

**Request Body:**
```json
{
  "script": "import requests\n...",
  "dryRun": false,
  "host": "https://...",
  "token": "dapi..."
}
```

**Response:**
```json
{
  "success": true,
  "logs": "Fetching clusters...\nFound 5 clusters",
  "output": "[{\"cluster_id\": \"...\"}]",
  "data": [...],
  "error": null,
  "durationMs": 2345
}
```

**Security:** Blocked patterns include `os.system`, `subprocess`, `exec`, `eval`, `__import__`, `shutil.rmtree`, etc.

---

### `POST /api/ai/validate-execution`

Validate script execution results.

**Request Body:**
```json
{
  "prompt": "Original prompt",
  "logs": "execution logs",
  "output": "script output"
}
```

---

### `POST /api/ai/generate-prompt`

Generate an optimized system prompt for a specific goal.

**Request Body:**
```json
{
  "goal": "Create a prompt for SQL query optimization",
  "host": "https://...",
  "token": "dapi...",
  "model": "...",
  "systemPrompt": null
}
```

---

### `POST /api/ai/prompt-executor`

Execute a custom prompt against a foundation model.

**Request Body:**
```json
{
  "prompt": "Your custom prompt here",
  "host": "https://...",
  "token": "dapi...",
  "model": "..."
}
```

---

### `POST /api/ai/generate-query`

Generate SQL queries from natural language.

**Request Body:**
```json
{
  "systemPrompt": "You are a SQL expert...",
  "userPrompt": "Show top 10 customers by revenue",
  "host": "https://...",
  "token": "dapi...",
  "model": "..."
}
```

---

### `POST /api/ai/generate-tests`

Generate test cases for an API endpoint.

**Request Body:**
```json
{
  "endpoint": "/api/2.0/clusters/create",
  "method": "POST",
  "description": "Creates a new cluster",
  "host": "https://...",
  "token": "dapi...",
  "model": "...",
  "customSystemPrompt": null
}
```

---

### `POST /api/ai/security-recommendations`

Get security recommendations for an API endpoint.

**Request Body:**
```json
{
  "endpoint": "/api/2.0/secrets/put",
  "method": "POST",
  "host": "https://...",
  "token": "dapi...",
  "model": "...",
  "customSystemPrompt": null
}
```

---

### `POST /api/ai/generate-code`

Generate code samples in multiple languages.

**Request Body:**
```json
{
  "endpoint": "/api/2.0/clusters/list",
  "method": "GET",
  "body": null,
  "host": "https://...",
  "token": "dapi...",
  "model": "...",
  "customSystemPrompt": null
}
```

---

### `POST /api/ai/generate-documentation`

Generate API documentation for an endpoint.

**Request Body:**
```json
{
  "endpoint": "/api/2.0/clusters/create",
  "method": "POST",
  "description": "Creates a new Databricks cluster",
  "host": "https://...",
  "token": "dapi...",
  "model": "...",
  "customSystemPrompt": null
}
```

---

### `POST /api/ai/list-warehouses`

List available SQL warehouses.

**Request Body:**
```json
{
  "host": "https://...",
  "token": "dapi..."
}
```

**Response:**
```json
{
  "warehouses": [
    { "id": "abc123", "name": "Demo Warehouse", "state": "RUNNING" },
    { "id": "def456", "name": "Production", "state": "STOPPED" }
  ]
}
```

---

## SQL Query Execution

### `POST /api/ai/execute-query`

Execute a SQL query on a Databricks SQL Warehouse.

**Request Body:**
```json
{
  "sql": "SELECT * FROM catalog.schema.table LIMIT 100",
  "warehouseId": "abc123",
  "host": "https://...",
  "token": "dapi..."
}
```

**Response (success):**
```json
{
  "success": true,
  "state": "SUCCEEDED",
  "rows": [["val1", "val2"], ...],
  "columns": ["col1", "col2"],
  "rowCount": 100,
  "queryId": "q-abc123def",
  "hasMore": false
}
```

**Response (failure):**
```json
{
  "success": false,
  "state": "FAILED",
  "error": "Table not found"
}
```

**Execution Strategy:**
1. Tries `INLINE` disposition first (fast path, up to 25MB)
2. If inline byte limit exceeded, falls back to `EXTERNAL_LINKS` disposition
3. Polls for completion if query is PENDING/RUNNING (up to 60s)
4. Fetches first data chunk from external links for large results
5. Stores results in memory for pagination (1hr TTL)

---

### `POST /api/ai/test-query-endpoint`

Quick test of SQL warehouse connectivity.

**Request Body:**
```json
{
  "endpoint": "sql/statements",
  "query": "SELECT 1",
  "warehouseId": "abc123",
  "host": "https://...",
  "token": "dapi..."
}
```

---

### `GET /api/ai/query-results/{query_id}`

Retrieve paginated query results from cache.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `pageSize` | int | 100 | Rows per page |

**Response:**
```json
{
  "rows": [...],
  "columns": ["col1", "col2"],
  "totalRows": 500,
  "page": 1,
  "pageSize": 100,
  "totalPages": 5
}
```

---

### `GET /api/ai/query-export/{query_id}`

Export full query results.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `format` | string | `csv` | Export format: `csv` or `json` |

**Response:** CSV file download or JSON object.

---

## Agent System

### `POST /api/agent/chat`

Send a message to the AI agent system.

**Request Body:**
```json
{
  "message": "List all my catalogs",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ],
  "host": "https://...",
  "token": "dapi...",
  "useFoundationModel": true
}
```

**Response:**
```json
{
  "response": "Here are your Unity Catalog catalogs:\n\n| Name | Owner | ...",
  "metadata": {
    "handler": "foundation_model",
    "model": "databricks-meta-llama-3-1-405b-instruct",
    "durationMs": 3456
  }
}
```

**Routing Order:**
1. Default handlers (regex pattern matching)
2. Custom handlers (user-defined patterns)
3. Foundation model (fallback)

**Built-in Handlers:**
| Handler | Pattern | API Called |
|---------|---------|-----------|
| List Catalogs | `catalog` | `GET /api/2.1/unity-catalog/catalogs` |
| List Users | `user` | `GET /api/2.0/preview/scim/v2/Users` |
| List Groups | `group` | `GET /api/2.0/preview/scim/v2/Groups` |
| List Tables | `table` | `GET /api/2.1/unity-catalog/tables` |

---

### `GET /api/agent/handlers`

List all available agent handlers.

---

### `POST /api/agent/configure-foundation-model`

Configure the foundation model for agent chat.

**Request Body:**
```json
{
  "endpoint": "databricks-meta-llama-3-1-405b-instruct",
  "systemPrompt": "You are a helpful Databricks assistant...",
  "enabled": true
}
```

---

### `POST /api/agent/register-custom`

Register a new custom agent handler.

**Request Body:**
```json
{
  "name": "Cluster Monitor",
  "description": "Checks cluster health",
  "pattern": "cluster.*health|monitor.*cluster",
  "handler": "api"
}
```

---

### `DELETE /api/agent/unregister/{name}`

Remove a registered handler.

---

## Custom Agents

### `GET /api/custom-agents`

List all custom agents.

**Response:**
```json
[
  {
    "id": "uuid-123",
    "name": "My Agent",
    "description": "Does something useful",
    "pattern": "regex_pattern",
    "handler": "api",
    "config": {},
    "enabled": true
  }
]
```

---

### `POST /api/custom-agents`

Create a new custom agent.

---

### `PUT /api/custom-agents/{agent_id}`

Update an existing custom agent.

---

### `DELETE /api/custom-agents/{agent_id}`

Delete a custom agent.

---

## Azure Authentication

### `GET /api/azure/auth/status`

Check if user is authenticated with Azure.

**Response:**
```json
{
  "authenticated": true,
  "user_name": "user@company.com"
}
```

---

### `POST /api/azure/auth/login`

Initiate Azure login (CLI → Environment → Interactive Browser).

**Response:**
```json
{
  "access_token": "eyJ...",
  "user_name": "user@company.com",
  "user_email": "user@company.com",
  "method": "AzureCliCredential",
  "expires_on": 1709312400
}
```

---

### `POST /api/azure/auth/logout`

Clear Azure session.

---

### `POST /api/azure/login-tenant?tenant_id={id}`

Switch to a specific Azure tenant.

---

### `GET /api/azure/tenants`

List available Azure AD tenants.

**Response:**
```json
{
  "tenants": [
    { "tenantId": "uuid-1", "displayName": "My Company" }
  ]
}
```

---

### `GET /api/azure/subscriptions`

List Azure subscriptions.

**Response:**
```json
{
  "subscriptions": [
    {
      "subscriptionId": "uuid-1",
      "displayName": "Production",
      "state": "Enabled"
    }
  ]
}
```

---

### `GET /api/azure/workspaces?subscriptionId={id}`

List Databricks workspaces in a subscription.

**Response:**
```json
{
  "workspaces": [
    {
      "id": "/subscriptions/.../resourceGroups/.../providers/Microsoft.Databricks/workspaces/my-workspace",
      "name": "my-workspace",
      "location": "eastus",
      "workspaceUrl": "adb-1234567890.12.azuredatabricks.net"
    }
  ]
}
```

---

### `POST /api/azure/databricks-workspace-access`

Get workspace URL and Databricks token for a specific workspace.

**Request Body:**
```json
{
  "resource_id": "/subscriptions/.../resourceGroups/.../providers/Microsoft.Databricks/workspaces/my-workspace"
}
```

**Response:**
```json
{
  "workspace_url": "https://adb-1234567890.12.azuredatabricks.net",
  "token": "dapi...",
  "name": "my-workspace"
}
```

---

## Notebooks

### `POST /api/notebooks/upload`

Upload a notebook or script to Databricks workspace.

**Request Body:**
```json
{
  "path": "/Users/user@company.com/my_notebook",
  "notebook": "base64-encoded-content",
  "script": "plain text script content",
  "overwrite": true,
  "host": "https://...",
  "token": "dapi..."
}
```

---

## Tools

### `GET /api/tools/generate-openapi-catalog`

Generate OpenAPI 3.1.0 specification from the built-in API catalog.

**Response:**
```json
{
  "openapi": "3.1.0",
  "info": { "title": "Databricks REST API", "version": "2.0" },
  "paths": { ... },
  "source": "built-in catalog",
  "endpointCount": 13,
  "message": "Generated from built-in API catalog"
}
```

---

### `POST /api/tools/generate-test-data`

Generate realistic test data for an API endpoint.

**Request Body:**
```json
{
  "method": "POST",
  "path": "/api/2.0/clusters/create",
  "schema": { ... },
  "example": { ... },
  "count": 3,
  "model": "...",
  "host": "https://...",
  "token": "dapi..."
}
```

**Response:**
```json
{
  "json": [{ "cluster_name": "test-1", ... }],
  "raw": "...",
  "metadata": { ... }
}
```

---

### `GET /api/tools/generate-openapi`

Alternative endpoint for OpenAPI generation (same as `/generate-openapi-catalog`).

---

## Common Response Models

### ModelCallMetadata

Included in all AI endpoint responses:

```json
{
  "model": "databricks-meta-llama-3-1-405b-instruct",
  "temperature": 0.1,
  "maxTokens": 4096,
  "promptTokens": 150,
  "completionTokens": 200,
  "totalTokens": 350,
  "durationMs": 1234,
  "region": "us-east-1"
}
```

### Error Responses

```json
{
  "detail": "Error description"
}
```

HTTP status codes: 400 (bad request), 404 (not found), 500 (internal error).
