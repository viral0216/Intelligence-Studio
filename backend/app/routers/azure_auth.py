from fastapi import APIRouter, HTTPException, Query
from app.services.azure_auth import (
    login,
    logout,
    get_status,
    login_tenant,
    list_tenants,
    list_subscriptions,
    list_databricks_workspaces,
    get_databricks_workspace_access,
)

router = APIRouter()


@router.get("/auth/status")
async def auth_status():
    """Check current Azure auth status."""
    return get_status()


@router.post("/auth/login")
async def auth_login():
    """Sign in to Azure (CLI → Environment → Interactive Browser)."""
    try:
        result = await login()
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=401, detail=str(e)) from e


@router.post("/auth/logout")
async def auth_logout():
    """Clear cached Azure credentials."""
    logout()
    return {"status": "logged_out"}


@router.post("/login-tenant")
async def switch_tenant(tenant_id: str = Query(...)):
    """Switch the active Azure tenant context."""
    try:
        result = await login_tenant(tenant_id)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/tenants")
async def get_tenants():
    """List Azure tenants."""
    tenants = await list_tenants()
    return {"tenants": tenants}


@router.get("/subscriptions")
async def get_subscriptions():
    """List Azure subscriptions."""
    try:
        subs = await list_subscriptions()
        return {"subscriptions": subs}
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/workspaces")
async def get_workspaces(subscriptionId: str = Query(...)):
    """List Databricks workspaces in a subscription."""
    try:
        workspaces = await list_databricks_workspaces(subscriptionId)
        return {"workspaces": workspaces}
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/databricks-workspace-access")
async def workspace_access(req: dict):
    """Get workspace URL + Databricks token for a resource ID."""
    resource_id = req.get("resource_id", "")
    if not resource_id:
        raise HTTPException(status_code=400, detail="resource_id is required")
    try:
        result = await get_databricks_workspace_access(resource_id)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
