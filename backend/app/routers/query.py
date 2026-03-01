from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import httpx
import time
from app.services.query_store import query_store

router = APIRouter()


class ExecuteQueryRequest(BaseModel):
    sql: str
    warehouseId: str
    host: str
    token: str


class TestQueryEndpointRequest(BaseModel):
    endpoint: str
    query: str
    warehouseId: str | None = None
    host: str | None = None
    token: str | None = None


@router.post("/execute-query")
async def execute_query(req: ExecuteQueryRequest):
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            f"{req.host.rstrip('/')}/api/2.0/sql/statements",
            headers={"Authorization": f"Bearer {req.token}"},
            json={
                "warehouse_id": req.warehouseId,
                "statement": req.sql,
                "wait_timeout": "30s",
                "disposition": "INLINE",
                "format": "JSON_ARRAY",
            },
        )

        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)

        data = resp.json()
        state = data.get("status", {}).get("state", "UNKNOWN")

        if state == "SUCCEEDED":
            columns = [col["name"] for col in data.get("manifest", {}).get("schema", {}).get("columns", [])]
            rows = data.get("result", {}).get("data_array", [])
            query_id = query_store.store(req.sql, rows, columns)

            return {
                "success": True,
                "state": state,
                "rows": rows[:100],
                "columns": columns,
                "rowCount": len(rows),
                "queryId": query_id,
                "hasMore": len(rows) > 100,
            }

        return {"success": False, "state": state, "error": data.get("status", {}).get("error", {}).get("message", "")}


@router.post("/test-query-endpoint")
async def test_query_endpoint(req: TestQueryEndpointRequest):
    if not req.host or not req.token or not req.warehouseId:
        raise HTTPException(status_code=400, detail="host, token, and warehouseId are required")

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            f"{req.host.rstrip('/')}/api/2.0/sql/statements",
            headers={"Authorization": f"Bearer {req.token}"},
            json={
                "warehouse_id": req.warehouseId,
                "statement": req.query,
                "wait_timeout": "30s",
                "disposition": "INLINE",
                "format": "JSON_ARRAY",
            },
        )

        if resp.status_code != 200:
            return {"success": False, "message": f"HTTP {resp.status_code}", "error": resp.text}

        data = resp.json()
        state = data.get("status", {}).get("state", "UNKNOWN")

        if state == "SUCCEEDED":
            rows = data.get("result", {}).get("data_array", [])
            return {
                "success": True,
                "message": f"Query returned {len(rows)} rows",
                "rowsAffected": len(rows),
                "statementId": data.get("statement_id"),
            }

        return {"success": False, "message": state, "error": data.get("status", {}).get("error", {}).get("message", "")}


@router.get("/query-results/{query_id}")
async def get_query_results(query_id: str, page: int = Query(1), pageSize: int = Query(100)):
    result = query_store.get(query_id, page, pageSize)
    if not result:
        raise HTTPException(status_code=404, detail="Query results not found or expired")
    return result


@router.get("/query-export/{query_id}")
async def export_query_results(query_id: str, format: str = Query("csv")):
    result = query_store.export(query_id, format)
    if not result:
        raise HTTPException(status_code=404, detail="Query results not found or expired")

    if format == "csv":
        return StreamingResponse(
            iter([result]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=query_{query_id}.csv"},
        )
    else:
        return result
