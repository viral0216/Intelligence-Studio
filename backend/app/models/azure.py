from pydantic import BaseModel


class AzureTenant(BaseModel):
    tenantId: str
    displayName: str | None = None


class AzureSubscription(BaseModel):
    subscriptionId: str
    displayName: str
    state: str | None = None


class DatabricksWorkspace(BaseModel):
    id: str
    name: str
    location: str
    workspaceUrl: str | None = None
    properties: dict | None = None
