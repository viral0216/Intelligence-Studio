import httpx

AZURE_MANAGEMENT_URL = "https://management.azure.com"


async def list_tenants(token: str) -> list[dict]:
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(
            f"{AZURE_MANAGEMENT_URL}/tenants?api-version=2020-01-01",
            headers={"Authorization": f"Bearer {token}"},
        )
        if resp.status_code == 200:
            return resp.json().get("value", [])
        return []


async def list_subscriptions(token: str) -> list[dict]:
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(
            f"{AZURE_MANAGEMENT_URL}/subscriptions?api-version=2020-01-01",
            headers={"Authorization": f"Bearer {token}"},
        )
        if resp.status_code == 200:
            return resp.json().get("value", [])
        return []


async def list_databricks_workspaces(token: str, subscription_id: str) -> list[dict]:
    url = f"{AZURE_MANAGEMENT_URL}/subscriptions/{subscription_id}/providers/Microsoft.Databricks/workspaces?api-version=2023-02-01"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, headers={"Authorization": f"Bearer {token}"})
        if resp.status_code == 200:
            workspaces = resp.json().get("value", [])
            return [
                {
                    "id": ws.get("id", ""),
                    "name": ws.get("name", ""),
                    "location": ws.get("location", ""),
                    "workspaceUrl": ws.get("properties", {}).get("workspaceUrl", ""),
                    "properties": ws.get("properties", {}),
                }
                for ws in workspaces
            ]
        return []
