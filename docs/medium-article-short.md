# Intelligence Studio: AI-Powered API Explorer for Databricks

*Browse, test, and analyze 500+ Databricks REST APIs — with AI assistance, SQL execution, data visualization, and multi-workspace Azure login.*

---

If you work with Databricks, you know the pain: hunting through documentation, crafting curl commands, decoding cryptic errors, and juggling multiple tools — all before writing any production code.

**Intelligence Studio** is an open-source workbench that puts the entire Databricks API surface in one place, with AI built in.

![Intelligence Studio — Main View](demo-frames/frame_05_request_composer_export.png)

---

## What It Does

### API Explorer
500+ endpoints organized by category. Click any endpoint, auto-populate the request, hit **Send**, and see formatted results instantly.

![Request Composer](demo-frames/frame_06_request_composer_history.png)

### Natural Language to API
Don't know which endpoint you need? Just type what you want:

> *"list all clusters"* | *"show me running jobs"* | *"get tables in catalog main"*

### 13 AI Assistant Tabs

Toggle the AI Assistant for a full workbench of intelligent tools:

![AI Analysis](demo-frames/frame_08_ai_analysis_report.png)

- **Data QA** — Natural language to SQL with auto-execution
- **Find** — Discover the right endpoint by describing your intent
- **Analyze** — Pattern detection and insights from any API response
- **Errors** — Root cause analysis with step-by-step fixes
- **Code** — Generate code in Python, cURL, JavaScript, TypeScript, Go, PowerShell
- **Agent** — AI agent that executes Databricks APIs on your behalf
- **Workflow** — Chain multi-step API calls with output piping
- **Query** — SQL editor with warehouse selection and catalog browser
- **Visualize** — 12 chart types with auto-detection, dashboards, and data lineage
- **Script** — AI-generated Python scripts with sandboxed execution
- **Test Data** — Schema-aware test payload generation
- **Docs** — Auto-generated API documentation
- **Prompts** — 14 customizable system prompts

### SQL Query Editor

Built-in SQL editor with Unity Catalog browser, syntax highlighting, and auto-visualization. Handles large result sets (25MB+) automatically.

![SQL & Visualization](demo-frames/frame_07_response_chart_radar.png)

### Azure Multi-Workspace Login

OAuth-based authentication with multi-tenant, multi-subscription workspace switching. Tokens are never stored server-side.

![Azure Login](demo-frames/frame_03_settings_azure_login.png)

### Export Everywhere

Code (6 languages) | Postman | Insomnia | OpenAPI | GitHub Actions | PDF | Word | Excel | CSV | JSON

---

## Why Intelligence Studio?

| Pain Point | Solution |
|---|---|
| Switching between docs, terminal, and Postman | One interface for 500+ APIs |
| Memorizing endpoint paths | Natural language search |
| Writing API client code manually | Auto-generate code in 6 languages |
| Debugging cryptic errors | AI root cause analysis |
| Building test payloads | AI-generated schema-aware test data |
| Managing tokens across workspaces | Azure OAuth multi-workspace switching |
| No visibility into API responses | Auto-detected charts and dashboards |

---

## Key Highlights

- **Cross-Platform** — Web, macOS, Windows, CLI
- **Secure by Design** — Per-request credentials, never stored
- **Sandboxed Scripting** — Blocklist-validated Python execution
- **Enterprise-Ready** — 14 feature flags, custom prompts, cost tracking
- **Extensible** — Custom AI agents, chart types, export formats
- **Open Source** — Inspect, extend, and self-host

### By the Numbers

| Metric | Value |
|--------|-------|
| API endpoints | 500+ |
| AI features | 13 |
| Code gen languages | 6 |
| Export formats | 10+ |
| Chart types | 12 |
| Feature flags | 14 |
| Custom prompts | 14 |

---

## Getting Started

```bash
git clone <repo-url>
cd Intelligence-Studio
make install && make dev
```

Or build the desktop app:

```bash
make build-mac    # macOS
make build-win    # Windows
```

---

## Who Is This For?

**Platform Engineers** — Browse and test APIs without curl. Manage clusters, warehouses, and Unity Catalog.

**Data Engineers** — Ask questions in English, get SQL. Execute queries, visualize results.

**Developers & DevOps** — Generate code, export to Postman/GitHub Actions, build AI scripts.

**Security Teams** — AI-powered security analysis. Export audit-ready documentation.

---

Intelligence Studio is open source and ready to use. Give it a spin.

*Intelligence Studio is an independent open-source project. Databricks is a trademark of Databricks, Inc.*
