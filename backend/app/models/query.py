from pydantic import BaseModel


class QueryRequest(BaseModel):
    sql: str
    warehouseId: str
    host: str
    token: str


class QueryResult(BaseModel):
    success: bool
    state: str = ""
    rows: list = []
    columns: list[str] = []
    rowCount: int = 0
    queryId: str | None = None
    hasMore: bool = False
    error: str | None = None
