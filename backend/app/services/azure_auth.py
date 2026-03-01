import uuid
import httpx
from msal import PublicClientApplication
from app.config import settings

MANAGEMENT_SCOPES = ["https://management.azure.com/.default", "offline_access"]
DATABRICKS_SCOPES = ["2ff814a6-3304-4ab8-85cb-cd0e6f879c1d/.default", "offline_access"]


class AzureAuthManager:
    def __init__(self):
        self._sessions: dict[str, dict] = {}
        self._msal_apps: dict[str, PublicClientApplication] = {}

    def _get_msal_app(self, session_id: str) -> PublicClientApplication | None:
        if not settings.azure_client_id:
            return None

        if session_id not in self._msal_apps:
            self._msal_apps[session_id] = PublicClientApplication(
                settings.azure_client_id,
                authority=f"https://login.microsoftonline.com/{settings.azure_tenant_id}",
            )
        return self._msal_apps[session_id]

    def get_status(self, session_id: str) -> dict:
        available = bool(settings.azure_client_id)
        session = self._sessions.get(session_id)
        authenticated = bool(session and session.get("account"))

        result = {"available": available, "authenticated": authenticated}
        if authenticated:
            result["account"] = {
                "tenantId": session.get("tenant_id", ""),
                "username": session.get("username", ""),
            }
        return result

    def start_auth(self) -> dict:
        session_id = str(uuid.uuid4())
        app = self._get_msal_app(session_id)
        if not app:
            return {"error": "Azure AD not configured"}

        flow = app.initiate_auth_code_flow(
            scopes=MANAGEMENT_SCOPES,
            redirect_uri=settings.azure_redirect_uri,
        )

        self._sessions[session_id] = {"flow": flow, "account": None}

        return {
            "authUrl": flow.get("auth_uri", ""),
            "state": flow.get("state", ""),
            "sessionId": session_id,
        }

    async def exchange_token(self, code: str, state: str, session_id: str) -> dict:
        session = self._sessions.get(session_id)
        if not session or not session.get("flow"):
            return {"success": False, "error": "Invalid session"}

        app = self._get_msal_app(session_id)
        if not app:
            return {"success": False, "error": "Azure AD not configured"}

        result = app.acquire_token_by_auth_code_flow(
            session["flow"],
            {"code": code, "state": state},
        )

        if "access_token" in result:
            account = result.get("id_token_claims", {})
            session["account"] = account
            session["management_token"] = result["access_token"]
            session["tenant_id"] = account.get("tid", "")
            session["username"] = account.get("preferred_username", "")

            return {
                "success": True,
                "sessionId": session_id,
                "account": {
                    "tenantId": session["tenant_id"],
                    "username": session["username"],
                },
            }

        return {"success": False, "error": result.get("error_description", "Token exchange failed")}

    async def get_management_token(self, session_id: str) -> str:
        session = self._sessions.get(session_id, {})
        return session.get("management_token", "")

    async def acquire_databricks_token(self, session_id: str, workspace_url: str) -> dict:
        app = self._get_msal_app(session_id)
        if not app:
            return {"error": "Azure AD not configured"}

        session = self._sessions.get(session_id)
        if not session:
            return {"error": "Invalid session"}

        accounts = app.get_accounts()
        if not accounts:
            return {"error": "No authenticated accounts"}

        result = app.acquire_token_silent(DATABRICKS_SCOPES, account=accounts[0])
        if not result:
            result = app.acquire_token_by_refresh_token(
                session.get("refresh_token", ""), DATABRICKS_SCOPES
            )

        if result and "access_token" in result:
            host = workspace_url if workspace_url.startswith("https://") else f"https://{workspace_url}"
            return {"host": host, "token": result["access_token"]}

        return {"error": "Failed to acquire Databricks token"}

    def logout(self, session_id: str):
        self._sessions.pop(session_id, None)
        self._msal_apps.pop(session_id, None)


# Singleton
azure_auth_manager = AzureAuthManager()
