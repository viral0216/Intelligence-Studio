# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Intelligence Studio, please report it responsibly.

**Do not open a public issue.** Instead, please email the project maintainers directly or use [GitHub's private vulnerability reporting](../../security/advisories/new).

We will acknowledge your report within 48 hours and provide a timeline for a fix.

## Security Design

Intelligence Studio is designed with security in mind:

- **No server-side token storage** — Databricks credentials are passed per-request and never persisted on the backend
- **Sandboxed script execution** — AI-generated Python scripts are validated against a blocklist of dangerous patterns (`os.system`, `subprocess`, `exec`, `eval`, `shutil.rmtree`) before execution
- **Proxy architecture** — The backend acts as a secure proxy; all Databricks API calls are routed through authenticated endpoints
- **Input validation** — All request payloads are validated with Pydantic v2 schemas

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | Yes       |

## Best Practices for Users

- Use Personal Access Tokens with the minimum required permissions
- Rotate tokens regularly
- When using Azure OAuth login, review the scopes granted
- Do not expose the backend API to the public internet without authentication
- Review AI-generated scripts before executing them in production
