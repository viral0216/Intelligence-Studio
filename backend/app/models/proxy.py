from pydantic import BaseModel
from app.models.common import HttpMethod


class ProxyRequest(BaseModel):
    method: HttpMethod
    path: str
    body: dict | list | None = None
    token: str | None = None
    host: str | None = None


class ProxyResponse(BaseModel):
    status: int
    data: dict | list | str | None = None
    headers: dict[str, str] = {}
    durationMs: int = 0
    requestId: str | None = None
