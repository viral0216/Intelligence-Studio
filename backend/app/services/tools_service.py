"""OpenAPI catalog generation from API endpoint definitions."""


def generate_catalog_openapi() -> dict:
    """Generate an OpenAPI 3.1.0 spec from the built-in API catalog."""
    openapi = {
        "openapi": "3.1.0",
        "info": {
            "title": "Databricks REST API",
            "description": "Auto-generated OpenAPI specification from Intelligence Studio API catalog",
            "version": "2.0",
        },
        "servers": [{"url": "https://{host}", "variables": {"host": {"default": "your-workspace.cloud.databricks.com"}}}],
        "paths": {},
        "components": {
            "securitySchemes": {
                "bearerAuth": {"type": "http", "scheme": "bearer", "bearerFormat": "PAT"},
            }
        },
        "security": [{"bearerAuth": []}],
    }

    # Add common Databricks API paths
    common_endpoints = [
        ("GET", "/api/2.0/clusters/list", "List all clusters"),
        ("POST", "/api/2.0/clusters/create", "Create a new cluster"),
        ("GET", "/api/2.0/clusters/get", "Get cluster details"),
        ("POST", "/api/2.0/clusters/start", "Start a cluster"),
        ("POST", "/api/2.0/clusters/delete", "Delete a cluster"),
        ("GET", "/api/2.1/jobs/list", "List all jobs"),
        ("POST", "/api/2.1/jobs/create", "Create a new job"),
        ("GET", "/api/2.1/jobs/get", "Get job details"),
        ("POST", "/api/2.1/jobs/run-now", "Run a job"),
        ("GET", "/api/2.0/sql/warehouses", "List SQL warehouses"),
        ("GET", "/api/2.1/unity-catalog/catalogs", "List Unity Catalog catalogs"),
        ("GET", "/api/2.1/unity-catalog/schemas", "List schemas"),
        ("GET", "/api/2.1/unity-catalog/tables", "List tables"),
    ]

    for method, path, description in common_endpoints:
        if path not in openapi["paths"]:
            openapi["paths"][path] = {}
        openapi["paths"][path][method.lower()] = {
            "summary": description,
            "responses": {"200": {"description": "Successful response"}},
        }

    return {
        "openapi": openapi,
        "source": "catalog",
        "endpointCount": len(common_endpoints),
        "message": f"Generated OpenAPI spec with {len(common_endpoints)} endpoints",
    }
