from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import base64
import json

router = APIRouter()


class NotebookUploadRequest(BaseModel):
    path: str
    notebook: dict | None = None
    script: str | None = None
    overwrite: bool = False
    host: str | None = None
    token: str | None = None


@router.post("/upload")
async def upload_notebook(req: NotebookUploadRequest):
    if not req.host or not req.token:
        raise HTTPException(status_code=400, detail="host and token are required")

    if req.notebook:
        content = base64.b64encode(json.dumps(req.notebook).encode()).decode()
        language = "PYTHON"
        fmt = "JUPYTER"
    elif req.script:
        content = base64.b64encode(req.script.encode()).decode()
        language = "PYTHON"
        fmt = "SOURCE"
    else:
        raise HTTPException(status_code=400, detail="Either notebook or script is required")

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"{req.host.rstrip('/')}/api/2.0/workspace/import",
            headers={"Authorization": f"Bearer {req.token}"},
            json={
                "path": req.path,
                "content": content,
                "language": language,
                "format": fmt,
                "overwrite": req.overwrite,
            },
        )

        if resp.status_code == 200:
            return {"success": True, "path": req.path}
        else:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
