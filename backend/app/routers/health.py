from fastapi import APIRouter, Query
import httpx
import time

router = APIRouter()


@router.get("/health")
async def health_check(host: str | None = Query(None), token: str | None = Query(None)):
    start = time.time()

    if host and token:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{host.rstrip('/')}/api/2.0/clusters/list",
                    headers={"Authorization": f"Bearer {token}"},
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

    duration_ms = round((time.time() - start) * 1000)
    return {"ok": True, "message": "Server is running", "durationMs": duration_ms}
