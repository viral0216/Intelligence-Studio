from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import httpx
import asyncio
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


def _extract_error(data: dict) -> str:
    return data.get("status", {}).get("error", {}).get("message", "")


def _is_inline_limit_error(text: str) -> bool:
    return "Inline byte limit exceeded" in text or "inline" in text.lower() and "limit" in text.lower()


async def _poll_statement(client: httpx.AsyncClient, host: str, headers: dict, statement_id: str, max_wait: int = 60) -> dict:
    """Poll a statement until it reaches a terminal state."""
    url = f"{host}/api/2.0/sql/statements/{statement_id}"
    elapsed = 0
    while elapsed < max_wait:
        resp = await client.get(url, headers=headers)
        if resp.status_code != 200:
            return {"status": {"state": "FAILED", "error": {"message": f"Poll failed: HTTP {resp.status_code}"}}}
        data = resp.json()
        state = data.get("status", {}).get("state", "")
        if state in ("SUCCEEDED", "FAILED", "CANCELED", "CLOSED"):
            return data
        await asyncio.sleep(2)
        elapsed += 2
    return {"status": {"state": "FAILED", "error": {"message": "Query timed out waiting for results"}}}


async def _fetch_external_links_data(client: httpx.AsyncClient, headers: dict, data: dict) -> list:
    """Fetch rows from external_links in the result."""
    links = data.get("result", {}).get("external_links", [])
    if not links:
        return []
    # Fetch only the first chunk to keep response fast
    link_url = links[0].get("external_link", "")
    if not link_url:
        return []
    resp = await client.get(link_url)
    if resp.status_code != 200:
        return []
    return resp.json()


@router.post("/execute-query")
async def execute_query(req: ExecuteQueryRequest):
    host = req.host.rstrip("/")
    headers = {"Authorization": f"Bearer {req.token}"}

    async with httpx.AsyncClient(timeout=120.0) as client:
        # Try INLINE first (fast path for smaller results)
        resp = await client.post(
            f"{host}/api/2.0/sql/statements",
            headers=headers,
            json={
                "warehouse_id": req.warehouseId,
                "statement": req.sql,
                "wait_timeout": "30s",
                "disposition": "INLINE",
                "format": "JSON_ARRAY",
            },
        )

        data = resp.json() if resp.status_code == 200 else {}
        error_text = resp.text if resp.status_code != 200 else _extract_error(data)

        # If inline limit exceeded, fall back to EXTERNAL_LINKS
        if _is_inline_limit_error(error_text):
            return await _execute_with_external_links(client, host, headers, req)

        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)

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

        if state in ("PENDING", "RUNNING"):
            statement_id = data.get("statement_id", "")
            if statement_id:
                data = await _poll_statement(client, host, headers, statement_id)
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

        return {"success": False, "state": state, "error": _extract_error(data)}


async def _execute_with_external_links(client: httpx.AsyncClient, host: str, headers: dict, req: ExecuteQueryRequest):
    """Execute query with EXTERNAL_LINKS disposition for large results."""
    resp = await client.post(
        f"{host}/api/2.0/sql/statements",
        headers=headers,
        json={
            "warehouse_id": req.warehouseId,
            "statement": req.sql,
            "wait_timeout": "30s",
            "disposition": "EXTERNAL_LINKS",
            "format": "JSON_ARRAY",
        },
    )

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    data = resp.json()
    state = data.get("status", {}).get("state", "UNKNOWN")
    statement_id = data.get("statement_id", "")

    # Poll if still running
    if state in ("PENDING", "RUNNING") and statement_id:
        data = await _poll_statement(client, host, headers, statement_id)
        state = data.get("status", {}).get("state", "UNKNOWN")

    if state != "SUCCEEDED":
        return {"success": False, "state": state, "error": _extract_error(data)}

    columns = [col["name"] for col in data.get("manifest", {}).get("schema", {}).get("columns", [])]
    total_rows = data.get("manifest", {}).get("total_row_count", 0)

    # Fetch first chunk of data from external link
    rows = await _fetch_external_links_data(client, headers, data)
    query_id = query_store.store(req.sql, rows, columns)

    return {
        "success": True,
        "state": state,
        "rows": rows[:100],
        "columns": columns,
        "rowCount": total_rows or len(rows),
        "queryId": query_id,
        "hasMore": total_rows > 100 if total_rows else len(rows) > 100,
    }


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
