from enum import Enum
from pydantic import BaseModel


class HttpMethod(str, Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    PATCH = "PATCH"
    DELETE = "DELETE"


class ErrorResponse(BaseModel):
    error: str
    detail: str | None = None
