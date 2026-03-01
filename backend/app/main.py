from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.routers import health, proxy, azure_auth, azure_resources, ai, agent, custom_agents, notebooks, query, tools


def create_app() -> FastAPI:
    app = FastAPI(
        title="Intelligencre Studio",
        description="Databricks Intelligence Platform API",
        version="1.0.0",
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register routers
    app.include_router(health.router, prefix="/api", tags=["health"])
    app.include_router(proxy.router, prefix="/api", tags=["proxy"])
    app.include_router(azure_auth.router, prefix="/api/azure", tags=["azure-auth"])
    app.include_router(azure_resources.router, prefix="/api/azure", tags=["azure-resources"])
    app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
    app.include_router(query.router, prefix="/api/ai", tags=["query"])
    app.include_router(agent.router, prefix="/api/agent", tags=["agent"])
    app.include_router(custom_agents.router, prefix="/api", tags=["custom-agents"])
    app.include_router(notebooks.router, prefix="/api/notebooks", tags=["notebooks"])
    app.include_router(tools.router, prefix="/api/tools", tags=["tools"])

    # Serve frontend static files in production
    frontend_dist = Path(__file__).parent.parent.parent / "frontend" / "dist"
    if frontend_dist.exists():
        app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")

    return app


app = create_app()
