from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from app.services.ai_helper import call_databricks_model_with_metadata

router = APIRouter()


class GenerateTestDataRequest(BaseModel):
    method: str
    path: str
    data_schema: dict | None = Field(None, alias="schema")
    example: dict | None = None
    count: int = 1
    model: str | None = None
    host: str | None = None
    token: str | None = None


@router.get("/generate-openapi-catalog")
async def generate_openapi_catalog():
    """Generate OpenAPI spec from the API catalog."""
    from app.services.tools_service import generate_catalog_openapi
    result = generate_catalog_openapi()
    return result


@router.post("/generate-test-data")
async def generate_test_data(req: GenerateTestDataRequest):
    prompt = f"""Generate {req.count} sample test data payload(s) for:
- Method: {req.method}
- Endpoint: {req.path}
- Schema: {req.data_schema or 'infer from endpoint'}
- Example: {req.example or 'none'}

Return valid JSON that can be used as a request body."""

    result = await call_databricks_model_with_metadata(
        prompt=prompt, model=req.model, host=req.host, token=req.token
    )
    return {"json": result["content"], "raw": result["content"], "metadata": result["metadata"]}


@router.get("/generate-openapi")
async def generate_openapi(host: str | None = Query(None), token: str | None = Query(None)):
    from app.services.tools_service import generate_catalog_openapi
    result = generate_catalog_openapi()
    return result
