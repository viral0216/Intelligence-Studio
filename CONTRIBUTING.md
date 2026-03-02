# Contributing to Intelligence Studio

Thank you for your interest in contributing to Intelligence Studio! This guide will help you get started.

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Python** 3.11+
- **pip** and **venv** (or your preferred Python environment manager)
- **Git**

### Local Setup

```bash
# Clone the repository
git clone <repo-url>
cd Intelligence-Studio

# Install all dependencies (frontend + backend)
make install

# Start development servers
make dev
```

This starts:
- **Frontend** (Vite) on http://localhost:5173
- **Backend** (FastAPI) on http://localhost:8000

### Project Structure

```
Intelligence-Studio/
  backend/       # Python FastAPI backend
  frontend/      # React + TypeScript frontend
  desktop/       # Electron desktop app
  cli/           # Python CLI tool
  scripts/       # Build and utility scripts
  docs/          # Documentation and demo assets
```

## How to Contribute

### Reporting Bugs

1. Search [existing issues](../../issues) to avoid duplicates
2. Open a new issue using the **Bug Report** template
3. Include steps to reproduce, expected behavior, and screenshots if applicable

### Suggesting Features

1. Open a new issue using the **Feature Request** template
2. Describe the use case and expected behavior
3. Explain why this would be useful to other users

### Submitting Code

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** — follow the coding guidelines below
4. **Run tests** to make sure nothing is broken:
   ```bash
   make test
   ```
5. **Commit** your changes with a clear message:
   ```bash
   git commit -m "feat: add your feature description"
   ```
6. **Push** to your fork and open a **Pull Request** against `main`

## Coding Guidelines

### Frontend (TypeScript / React)

- Use functional components with hooks
- Use TypeScript types — avoid `any`
- Follow existing component patterns in `frontend/src/components/`
- State management via Zustand stores in `frontend/src/stores/`
- Styling with Tailwind CSS 4

### Backend (Python / FastAPI)

- Follow PEP 8 — enforced via Ruff (`ruff check`)
- Use Pydantic v2 models for request/response schemas
- Add routes in `backend/app/routers/`
- Keep endpoints focused — one concern per route

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Usage |
|--------|-------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `refactor:` | Code restructuring (no behavior change) |
| `test:` | Adding or updating tests |
| `chore:` | Build, CI, or tooling changes |

### Pull Request Guidelines

- Keep PRs focused on a single change
- Include a clear description of what changed and why
- Reference any related issues (e.g., `Closes #42`)
- Ensure all tests pass before requesting review
- Add screenshots for UI changes

## Running Tests

```bash
# Run all tests
make test

# Frontend tests only
make test-frontend

# Backend tests only
make test-backend
```

## Building

```bash
# Desktop app (macOS)
make build-mac

# Desktop app (Windows)
make build-win

# CLI tool
make build-cli

# Everything
make build-all
```

## Areas Where Help Is Welcome

- Adding new API endpoint presets to the catalog
- Improving AI prompt templates
- Adding new chart types and visualizations
- Writing tests (frontend and backend)
- Documentation improvements
- Accessibility enhancements
- Performance optimizations
- Multi-cloud authentication (AWS, GCP)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this standard.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

## Questions?

Open a [Discussion](../../discussions) or reach out via Issues. We're happy to help you get started!
