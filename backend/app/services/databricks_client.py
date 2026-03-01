import httpx
import time
import re
import uuid
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.models.proxy import ProxyRequest, ProxyResponse


class RateLimitError(Exception):
    def __init__(self, retry_after: float = 1.0):
        self.retry_after = retry_after


def _redact_token(text: str) -> str:
    return re.sub(r"Bearer\s+[A-Za-z0-9\-._~+/]+=*", "Bearer [REDACTED]", text)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type(RateLimitError),
    reraise=True,
)
async def databricks_request(req: ProxyRequest) -> ProxyResponse:
    start = time.time()
    request_id = str(uuid.uuid4())[:8]

    url = f"{req.host.rstrip('/')}{req.path}"
    headers = {"Authorization": f"Bearer {req.token}", "Content-Type": "application/json"}

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            if req.method == "GET":
                resp = await client.get(url, headers=headers)
            elif req.method == "POST":
                resp = await client.post(url, headers=headers, json=req.body)
            elif req.method == "PUT":
                resp = await client.put(url, headers=headers, json=req.body)
            elif req.method == "PATCH":
                resp = await client.patch(url, headers=headers, json=req.body)
            elif req.method == "DELETE":
                resp = await client.delete(url, headers=headers, json=req.body)
            else:
                return ProxyResponse(status=400, data={"error": f"Unsupported method: {req.method}"})

            # Handle rate limiting
            if resp.status_code == 429:
                retry_after = float(resp.headers.get("Retry-After", "1"))
                raise RateLimitError(retry_after)

            duration_ms = round((time.time() - start) * 1000)

            # Parse response
            try:
                data = resp.json()
            except Exception:
                data = resp.text

            resp_headers = dict(resp.headers)

            return ProxyResponse(
                status=resp.status_code,
                data=data,
                headers=resp_headers,
                durationMs=duration_ms,
                requestId=request_id,
            )

        except RateLimitError:
            raise
        except httpx.TimeoutException:
            duration_ms = round((time.time() - start) * 1000)
            return ProxyResponse(
                status=504,
                data={"error": "Request timed out after 30 seconds"},
                durationMs=duration_ms,
                requestId=request_id,
            )
        except Exception as e:
            duration_ms = round((time.time() - start) * 1000)
            return ProxyResponse(
                status=500,
                data={"error": _redact_token(str(e))},
                durationMs=duration_ms,
                requestId=request_id,
            )
