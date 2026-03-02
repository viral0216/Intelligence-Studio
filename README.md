# Intelligence Studio

**AI-powered API explorer for Databricks — browse, test, and analyze 500+ REST APIs in one interface.**

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20macOS%20%7C%20Windows%20%7C%20CLI-lightgrey.svg)

![Intelligence Studio](docs/demo-frames/frame_05_request_composer_export.png)

---

## What is Intelligence Studio?

Intelligence Studio is an open-source platform for exploring, testing, and integrating with Databricks REST APIs. It combines a visual API explorer with AI-powered assistance — natural language search, response analysis, code generation, SQL execution, and interactive data visualization.

No more switching between documentation, curl commands, and Postman.

### Key Features

- **640+ API Endpoints** — Complete Databricks REST API catalog organized by service (Compute, Unity Catalog, Jobs, SQL, ML, Account APIs, and more)
- **13 AI Assistant Features** — Data QA, endpoint discovery, response analysis, error diagnosis, code generation, workflow builder, agent chat, and more
- **SQL Query Editor** — Built-in editor with Unity Catalog browser, syntax highlighting, and auto-visualization
- **Data Visualization** — 12 chart types with auto-detection, dashboards, schema visualizer, and dependency graphs
- **Code Generation** — Export working code in Python, cURL, JavaScript, TypeScript, Go, and PowerShell
- **Azure Multi-Workspace Login** — OAuth-based authentication with multi-tenant, multi-subscription support
- **Full Catalog Export** — Export all 640+ endpoints as Postman Collection, OpenAPI 3.0, or Insomnia with folder structure and request bodies
- **Export Everywhere** — Postman, Insomnia, OpenAPI, GitHub Actions, PDF, Word, Excel, CSV, JSON
- **Request History** — Full replay capability with favorites
- **Cross-Platform** — Web app, macOS desktop, Windows desktop, and Python CLI

---

## Screenshots

| API Explorer | AI Analysis |
|---|---|
| ![Request Composer](docs/demo-frames/frame_06_request_composer_history.png) | ![AI Analysis](docs/demo-frames/frame_08_ai_analysis_report.png) |

| Visualizations | Agent Chat |
|---|---|
| ![Charts](docs/demo-frames/frame_11_ai_visualize_radar.png) | ![Agent](docs/demo-frames/frame_13_agent_chat.png) |

| Settings | Test Data |
|---|---|
| ![Settings](docs/demo-frames/frame_03_settings_azure_login.png) | ![Test Data](docs/demo-frames/frame_14_test_data_generator.png) |

---

## Download

Pre-built binaries are available on the [Releases](https://github.com/viral0216/Intelligence-Studio/releases) page.

| Platform | File | How to run |
|----------|------|------------|
| **macOS** (Apple Silicon) | `Intelligence-Studio-1.0.0-arm64-mac.zip` | Unzip and move to Applications |
| **Windows** (Installer) | `Intelligence-Studio-Setup-1.0.0.exe` | Run the installer |
| **Windows** (Portable) | `Intelligence-Studio-1.0.0.exe` | Double-click to run — no install needed |
| **Web** | — | Clone the repo and run `make dev` |
| **CLI** | — | Clone the repo and run `make cli-install` |

> After launching, open **Settings** and enter your Databricks host URL and personal access token.

---

## Getting Started (from source)

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Python** 3.11+

### Quick Start

```bash
# Clone the repository
git clone https://github.com/viral0216/Intelligence-Studio.git
cd Intelligence-Studio

# Install dependencies
make install

# Start development servers
make dev
```

This starts:
- **Frontend** on http://localhost:5173
- **Backend** on http://localhost:8000

Open [http://localhost:5173](http://localhost:5173) and configure your Databricks host and token in Settings.

### Build Desktop App

```bash
make build-mac    # macOS (.app + .zip)
make build-win    # Windows (.exe installer + portable)
```

### Install CLI

```bash
make cli-install
```

---

## Tech Stack

```
Frontend    React 18 + TypeScript + Vite + Zustand + Tailwind CSS 4
Backend     Python + FastAPI + Uvicorn + httpx + Pydantic v2
Desktop     Electron 28
CLI         Python Click + Rich
AI          Databricks Foundation Models (Llama, Claude, Gemma)
```

---

## Project Structure

```
Intelligence-Studio/
  frontend/      React + TypeScript frontend
  backend/       Python FastAPI backend
  desktop/       Electron desktop app
  cli/           Python CLI tool
  scripts/       Build and utility scripts
  docs/          Documentation and demo assets
```

---

## Documentation

For detailed documentation — full feature walkthrough, architecture, environment variables, export guides, and more — see **[docs/README.md](docs/README.md)**.

---

## By the Numbers

| Metric | Value |
|--------|-------|
| API endpoints cataloged | 640+ |
| AI assistant features | 13 |
| Code generation languages | 6 |
| Export formats | 10+ |
| Chart types | 12 |
| Feature flags | 14 |
| Customizable AI prompts | 14 |

---

## Security

- Databricks tokens are **never stored** server-side — every request carries its own credentials
- AI-generated scripts are **sandboxed** with blocklist validation before execution
- All request payloads are validated with Pydantic v2 schemas

See [SECURITY.md](SECURITY.md) for details on reporting vulnerabilities.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, coding guidelines, and the PR process.

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

### Areas Where Help Is Welcome

- Adding new API endpoint presets to the catalog
- Improving AI prompt templates
- Adding new chart types and visualizations
- Writing tests (frontend and backend)
- Documentation improvements
- Accessibility enhancements
- Performance optimizations
- Multi-cloud authentication (AWS, GCP)

### Contributors

Thanks to everyone who contributes to Intelligence Studio!

<a href="https://github.com/viral0216/Intelligence-Studio/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=viral0216/Intelligence-Studio" />
</a>

---

## License

[MIT](LICENSE)

---

> **Note:** This is the first release of Intelligence Studio. You may encounter bugs or rough edges with some AI features. If you find an issue, please [open it on GitHub](https://github.com/viral0216/Intelligence-Studio/issues) — I maintain this project on weekends, so responses may take a few days. Contributions and feedback are always welcome!
