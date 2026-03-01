from fastapi import APIRouter, Query
from app.services.azure_auth import azure_auth_manager
from app.services.azure_management import list_tenants, list_subscriptions, list_databricks_workspaces

router = APIRouter()


@router.get("/tenants")
async def get_tenants(sessionId: str = Query(...)):
    token = await azure_auth_manager.get_management_token(sessionId)
    tenants = await list_tenants(token)
    return {"tenants": tenants}


@router.get("/subscriptions")
async def get_subscriptions(sessionId: str = Query(...), tenantId: str | None = Query(None)):
    token = await azure_auth_manager.get_management_token(sessionId)
    subs = await list_subscriptions(token)
    return {"subscriptions": subs}


@router.get("/workspaces")
async def get_workspaces(sessionId: str = Query(...), subscriptionId: str = Query(...)):
    token = await azure_auth_manager.get_management_token(sessionId)
    workspaces = await list_databricks_workspaces(token, subscriptionId)
    return {"workspaces": workspaces}


@router.post("/select-workspace")
async def select_workspace(req: dict):
    session_id = req.get("sessionId", "")
    workspace_url = req.get("workspaceUrl", "")
    result = await azure_auth_manager.acquire_databricks_token(session_id, workspace_url)
    return result
