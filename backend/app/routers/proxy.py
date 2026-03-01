from fastapi import APIRouter, HTTPException
from app.models.proxy import ProxyRequest, ProxyResponse
from app.services.databricks_client import databricks_request

router = APIRouter()

ALLOWED_PREFIXES = ("/api/2.0/", "/api/2.1/")


@router.post("/proxy", response_model=ProxyResponse)
async def proxy_databricks(req: ProxyRequest):
    if not any(req.path.startswith(prefix) for prefix in ALLOWED_PREFIXES):
        raise HTTPException(status_code=400, detail="Path must start with /api/2.0/ or /api/2.1/")

    if not req.host or not req.token:
        raise HTTPException(status_code=400, detail="host and token are required")

    result = await databricks_request(req)
    return result
