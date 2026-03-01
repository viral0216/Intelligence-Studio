from fastapi import APIRouter, Query, Request
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from app.services.azure_auth import azure_auth_manager

router = APIRouter()


class TokenExchangeRequest(BaseModel):
    code: str
    state: str
    sessionId: str


class LogoutRequest(BaseModel):
    sessionId: str


class SelectWorkspaceRequest(BaseModel):
    sessionId: str
    workspaceUrl: str


@router.get("/auth/status")
async def auth_status(request: Request):
    session_id = request.headers.get("x-azure-session", "")
    return azure_auth_manager.get_status(session_id)


@router.post("/auth/start")
async def auth_start():
    result = azure_auth_manager.start_auth()
    return result


@router.get("/auth/callback", response_class=HTMLResponse)
async def auth_callback(
    code: str | None = Query(None),
    state: str | None = Query(None),
    error: str | None = Query(None),
    error_description: str | None = Query(None),
):
    if error:
        html = f"""<html><body><script>
            window.opener.postMessage({{ type: 'azure-auth-error', error: '{error}', description: '{error_description or ""}' }}, '*');
            window.close();
        </script></body></html>"""
        return HTMLResponse(content=html)

    html = f"""<html><body><script>
        window.opener.postMessage({{ type: 'azure-auth-callback', code: '{code}', state: '{state}' }}, '*');
        window.close();
    </script></body></html>"""
    return HTMLResponse(content=html)


@router.post("/auth/token")
async def exchange_token(req: TokenExchangeRequest):
    result = await azure_auth_manager.exchange_token(req.code, req.state, req.sessionId)
    return result


@router.post("/auth/logout")
async def logout(req: LogoutRequest):
    azure_auth_manager.logout(req.sessionId)
    return {"success": True}
