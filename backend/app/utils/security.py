import re


def redact_token(text: str) -> str:
    """Remove Bearer tokens from error messages."""
    return re.sub(r"Bearer\s+[A-Za-z0-9\-._~+/]+=*", "Bearer [REDACTED]", text)


def validate_path(path: str) -> bool:
    """Validate that the path is a valid Databricks API path."""
    return path.startswith("/api/2.0/") or path.startswith("/api/2.1/")
