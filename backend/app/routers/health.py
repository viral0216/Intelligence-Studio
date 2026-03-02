from fastapi import APIRouter
from pydantic import BaseModel
import httpx
import time

router = APIRouter()


class HealthCheckRequest(BaseModel):
    host: str
    token: str


@router.get("/health")
async def health():
    """Basic server health check — no credentials needed."""
    return {"ok": True, "message": "Server is running", "durationMs": 0}


@router.get("/health/ping")
async def ping():
    """Quick ping endpoint — no auth needed. Used by frontend to check if backend is running."""
    return {"ok": True}


@router.post("/health/check")
async def health_check(req: HealthCheckRequest):
    """Test Databricks workspace connectivity. Token sent in body, not URL."""
    start = time.time()
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{req.host.rstrip('/')}/api/2.0/clusters/list",
                headers={"Authorization": f"Bearer {req.token}"},
                params={"max_results": 1},
            )
            duration_ms = round((time.time() - start) * 1000)
            if resp.status_code == 200:
                return {"ok": True, "message": "Connected to Databricks", "durationMs": duration_ms}
            else:
                return {"ok": False, "message": f"Databricks returned {resp.status_code}", "durationMs": duration_ms}
    except Exception as e:
        duration_ms = round((time.time() - start) * 1000)
        return {"ok": False, "message": str(e), "durationMs": duration_ms}
