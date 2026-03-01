"""Azure authentication service using azure.identity.

Tries credentials in order:
1. Azure CLI (if user ran `az login`) — instant, no browser
2. Environment variables (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID)
3. Interactive browser login — opens a system browser window
"""

from __future__ import annotations

import asyncio
import json
import logging
import subprocess
from typing import Any

logger = logging.getLogger(__name__)

# Module-level credential cache
_cached_credential: Any = None
_cached_token: str = ""


async def login() -> dict:
    """Sign in to Azure. Tries CLI → Environment → Interactive Browser."""
    global _cached_credential, _cached_token

    scope = "https://management.azure.com/.default"

    # 1) Try Azure CLI first (fastest — no browser needed)
    try:
        from azure.identity import AzureCliCredential

        cred = AzureCliCredential()
        token = await asyncio.to_thread(cred.get_token, scope)
        _cached_credential = cred
        _cached_token = token.token

        user_name, user_email = _get_az_user_info()

        logger.info("Azure login via CLI successful")
        return {
            "access_token": token.token,
            "user_name": user_name or "Azure CLI User",
            "user_email": user_email,
            "method": "azure_cli",
            "expires_on": str(token.expires_on) if hasattr(token, "expires_on") else "",
        }
    except Exception as e:
        logger.debug("Azure CLI credential failed: %s", e)

    # 2) Try environment-based credentials
    try:
        from azure.identity import EnvironmentCredential

        cred = EnvironmentCredential()
        token = await asyncio.to_thread(cred.get_token, scope)
        _cached_credential = cred
        _cached_token = token.token

        logger.info("Azure login via environment credentials successful")
        return {
            "access_token": token.token,
            "user_name": "Service Principal",
            "user_email": "environment",
            "method": "environment",
            "expires_on": str(token.expires_on) if hasattr(token, "expires_on") else "",
        }
    except Exception as e:
        logger.debug("Environment credential failed: %s", e)

    # 3) Fall back to interactive browser login
    try:
        from azure.identity import InteractiveBrowserCredential

        cred = InteractiveBrowserCredential()
        token = await asyncio.to_thread(cred.get_token, scope)
        _cached_credential = cred
        _cached_token = token.token

        logger.info("Azure login via interactive browser successful")
        return {
            "access_token": token.token,
            "user_name": "Azure User",
            "user_email": "",
            "method": "interactive_browser",
            "expires_on": str(token.expires_on) if hasattr(token, "expires_on") else "",
        }
    except Exception as e:
        logger.error("All Azure login methods failed: %s", e)
        raise RuntimeError(
            f"Azure login failed. Options:\n"
            f"1. Run 'az login' in your terminal first\n"
            f"2. Set AZURE_CLIENT_ID + AZURE_CLIENT_SECRET + AZURE_TENANT_ID env vars\n"
            f"Error: {e}"
        ) from e


def logout():
    """Clear cached Azure credentials."""
    global _cached_credential, _cached_token
    _cached_credential = None
    _cached_token = ""


def get_status() -> dict:
    """Check if the user is currently authenticated."""
    if _cached_credential is not None or _cached_token:
        user_name, _ = _get_az_user_info()
        return {"authenticated": True, "user_name": user_name or "Azure User"}
    return {"authenticated": False, "user_name": ""}


async def login_tenant(tenant_id: str) -> dict:
    """Switch active Azure tenant context."""
    global _cached_credential, _cached_token
    try:
        from azure.identity import AzureCliCredential

        scope = "https://management.azure.com/.default"
        cred = AzureCliCredential(tenant_id=tenant_id)
        token = await asyncio.to_thread(cred.get_token, scope)
        _cached_credential = cred
        _cached_token = token.token
        logger.info("Switched tenant context to %s", tenant_id)
        return {"status": "ok", "tenant_id": tenant_id}
    except Exception as exc:
        logger.exception("Failed to switch tenant %s", tenant_id)
        raise RuntimeError(f"Failed to switch tenant: {exc}") from exc


async def list_tenants() -> list[dict]:
    """List Azure tenants via az CLI."""
    tenants: list[dict] = []

    try:
        result = await asyncio.to_thread(
            subprocess.run,
            ["az", "account", "tenant", "list", "--output", "json"],
            capture_output=True, text=True, timeout=30,
        )
        if result.returncode == 0:
            for t in json.loads(result.stdout):
                tenants.append({
                    "tenantId": t.get("tenantId", ""),
                    "displayName": t.get("displayName", "") or t.get("tenantId", ""),
                })
    except Exception as exc:
        logger.warning("Failed to list tenants via az CLI: %s", exc)

    # Enrich with subscription data
    try:
        result = await asyncio.to_thread(
            subprocess.run,
            ["az", "account", "list", "--all", "--output", "json"],
            capture_output=True, text=True, timeout=30,
        )
        if result.returncode == 0:
            accounts = json.loads(result.stdout)
            active_tenants = {acc.get("tenantId") for acc in accounts if acc.get("state") == "Enabled"}
            if not tenants:
                seen: set[str] = set()
                for acc in accounts:
                    tid = acc.get("tenantId", "")
                    if tid and tid not in seen:
                        seen.add(tid)
                        tenants.append({
                            "tenantId": tid,
                            "displayName": acc.get("tenantDisplayName", "") or tid,
                            "isActive": tid in active_tenants,
                        })
    except Exception as exc:
        logger.warning("Failed to enrich tenant list: %s", exc)

    return tenants


async def list_subscriptions() -> list[dict]:
    """List Azure subscriptions via az CLI."""
    result = await asyncio.to_thread(
        subprocess.run,
        ["az", "account", "list", "--all", "--output", "json"],
        capture_output=True, text=True, timeout=30,
    )
    if result.returncode != 0:
        raise RuntimeError(f"az account list failed: {result.stderr.strip()}")

    accounts = json.loads(result.stdout)
    subs: list[dict] = []
    seen: set[str] = set()
    for acc in accounts:
        sub_id = acc.get("id", "")
        if sub_id and sub_id not in seen:
            seen.add(sub_id)
            subs.append({
                "subscriptionId": sub_id,
                "displayName": acc.get("name", sub_id),
                "tenantId": acc.get("tenantId", ""),
                "state": acc.get("state", ""),
            })
    subs.sort(key=lambda s: (s["state"] != "Enabled", s["displayName"].lower()))
    return subs


async def list_databricks_workspaces(subscription_id: str) -> list[dict]:
    """List Databricks workspaces in a subscription via az CLI."""
    result = await asyncio.to_thread(
        subprocess.run,
        [
            "az", "resource", "list",
            "--resource-type", "Microsoft.Databricks/workspaces",
            "--subscription", subscription_id,
            "--output", "json",
        ],
        capture_output=True, text=True, timeout=30,
    )
    if result.returncode != 0:
        raise RuntimeError(f"Failed to list Databricks workspaces: {result.stderr.strip()}")

    workspaces = []
    for w in json.loads(result.stdout):
        workspaces.append({
            "id": w.get("id", ""),
            "name": w.get("name", ""),
            "resourceGroup": w.get("resourceGroup", ""),
            "location": w.get("location", ""),
        })
    workspaces.sort(key=lambda w: w["name"].lower())
    return workspaces


async def get_databricks_workspace_access(resource_id: str) -> dict:
    """Given an Azure resource ID, return workspace URL + Databricks-scoped token."""
    import httpx

    # Detect tenant for the subscription
    tenant_id = ""
    try:
        parts = resource_id.strip("/").split("/")
        if len(parts) >= 2 and parts[0].lower() == "subscriptions":
            sub_id = parts[1]
            acct_result = await asyncio.to_thread(
                subprocess.run,
                ["az", "account", "show", "--subscription", sub_id, "--query", "tenantId", "--output", "tsv"],
                capture_output=True, text=True, timeout=15,
            )
            if acct_result.returncode == 0:
                tid = acct_result.stdout.strip()
                if tid:
                    tenant_id = tid
    except Exception as exc:
        logger.warning("Could not auto-detect tenant: %s", exc)

    tenant_flag: list[str] = ["--tenant", tenant_id] if tenant_id else []

    # 1. Get ARM management token and resolve workspace URL
    mgmt_result = await asyncio.to_thread(
        subprocess.run,
        ["az", "account", "get-access-token", "--resource", "https://management.azure.com/", "--output", "json"] + tenant_flag,
        capture_output=True, text=True, timeout=30,
    )
    if mgmt_result.returncode != 0:
        raise RuntimeError(f"Failed to get ARM token: {mgmt_result.stderr.strip()}")

    mgmt_token = json.loads(mgmt_result.stdout).get("accessToken", "")
    if not mgmt_token:
        raise RuntimeError("No ARM accessToken returned")

    arm_url = f"https://management.azure.com{resource_id}?api-version=2023-02-01"
    async with httpx.AsyncClient(timeout=30.0) as client:
        arm_resp = await client.get(arm_url, headers={"Authorization": f"Bearer {mgmt_token}"})

    if arm_resp.status_code != 200:
        raise RuntimeError(f"Failed to get workspace details: {arm_resp.text[:500]}")

    ws_data = arm_resp.json()
    ws_url_raw = ws_data.get("properties", {}).get("workspaceUrl", "")
    ws_name = ws_data.get("name", "")
    if not ws_url_raw:
        raise RuntimeError("workspaceUrl not found in ARM response")
    workspace_url = f"https://{ws_url_raw}" if not ws_url_raw.startswith("https://") else ws_url_raw

    # 2. Get Databricks-scoped Azure AD token
    token_result = await asyncio.to_thread(
        subprocess.run,
        ["az", "account", "get-access-token", "--resource", "2ff814a6-3304-4ab8-85cb-cd0e6f879c1d", "--output", "json"] + tenant_flag,
        capture_output=True, text=True, timeout=30,
    )
    if token_result.returncode != 0:
        raise RuntimeError(f"Failed to get Databricks token: {token_result.stderr.strip()}")

    token_data = json.loads(token_result.stdout)
    dbx_token = token_data.get("accessToken", "")
    if not dbx_token:
        raise RuntimeError("No accessToken in token response")

    return {"workspace_url": workspace_url, "token": dbx_token, "name": ws_name}


def _get_az_user_info() -> tuple[str, str]:
    """Get user info from az CLI."""
    try:
        result = subprocess.run(
            ["az", "account", "show", "--output", "json"],
            capture_output=True, text=True, timeout=5,
        )
        if result.returncode == 0:
            info = json.loads(result.stdout)
            name = info.get("user", {}).get("name", "")
            return name, name
    except Exception:
        pass
    return "", ""
