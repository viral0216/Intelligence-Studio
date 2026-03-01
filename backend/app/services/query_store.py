import uuid
import time
import csv
import io
import json

TTL_SECONDS = 3600  # 1 hour


class QueryStore:
    def __init__(self):
        self._results: dict[str, dict] = {}

    def store(self, sql: str, rows: list, columns: list[str]) -> str:
        query_id = str(uuid.uuid4())[:12]
        self._results[query_id] = {
            "sql": sql,
            "rows": rows,
            "columns": columns,
            "timestamp": time.time(),
        }
        self._cleanup()
        return query_id

    def get(self, query_id: str, page: int = 1, page_size: int = 100) -> dict | None:
        entry = self._results.get(query_id)
        if not entry:
            return None

        if time.time() - entry["timestamp"] > TTL_SECONDS:
            del self._results[query_id]
            return None

        rows = entry["rows"]
        start = (page - 1) * page_size
        end = start + page_size
        page_rows = rows[start:end]

        return {
            "rows": page_rows,
            "columns": entry["columns"],
            "totalRows": len(rows),
            "page": page,
            "pageSize": page_size,
            "totalPages": max(1, (len(rows) + page_size - 1) // page_size),
        }

    def export(self, query_id: str, fmt: str = "csv") -> str | dict | None:
        entry = self._results.get(query_id)
        if not entry:
            return None

        if fmt == "csv":
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(entry["columns"])
            for row in entry["rows"]:
                writer.writerow(row)
            return output.getvalue()

        elif fmt == "json":
            return {
                "columns": entry["columns"],
                "rows": [dict(zip(entry["columns"], row)) for row in entry["rows"]],
            }

        return None

    def _cleanup(self):
        now = time.time()
        expired = [qid for qid, entry in self._results.items() if now - entry["timestamp"] > TTL_SECONDS]
        for qid in expired:
            del self._results[qid]


# Singleton
query_store = QueryStore()
