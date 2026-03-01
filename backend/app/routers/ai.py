from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ai_helper import (
    call_databricks_model_with_metadata,
    recommend_endpoint,
    natural_language_to_api,
    suggest_parameters,
    analyze_response,
    explain_error,
    generate_workflow,
    generate_prompt,
    generate_tests,
    generate_security_recommendations,
    generate_code_samples,
    generate_documentation,
    data_assistant,
    generate_script,
    validate_execution,
)
from app.services.script_executor import execute_python_script
from app.services.pricing import get_pricing_data, refresh_pricing_data

router = APIRouter()


# --- Pydantic request models ---

class GeneratePromptRequest(BaseModel):
    goal: str
    model: str | None = None
    host: str | None = None
    token: str | None = None
    maxTokens: int | None = None
    systemPrompt: str | None = None


class PromptExecutorRequest(BaseModel):
    prompt: str
    model: str | None = None
    host: str | None = None
    token: str | None = None
    maxTokens: int | None = None


class GenerateQueryRequest(BaseModel):
    systemPrompt: str
    userPrompt: str
    model: str | None = None
    host: str | None = None
    token: str | None = None


class GenerateScriptRequest(BaseModel):
    prompt: str
    category: str | None = None
    model: str | None = None
    host: str | None = None
    token: str | None = None
    maxTokens: int | None = None


class ExecuteScriptRequest(BaseModel):
    script: str
    dryRun: bool = False
    host: str | None = None
    token: str | None = None


class ValidateExecutionRequest(BaseModel):
    prompt: str
    logs: list[str] = []
    output: str = ""
    model: str | None = None
    host: str | None = None
    token: str | None = None


class RecommendEndpointRequest(BaseModel):
    query: str
    model: str | None = None
    region: str | None = None
    host: str | None = None
    token: str | None = None


class NaturalLanguageRequest(BaseModel):
    query: str
    model: str | None = None
    host: str | None = None
    token: str | None = None
    systemPrompt: str | None = None


class SuggestParametersRequest(BaseModel):
    endpoint: str
    method: str
    userIntent: str
    model: str | None = None
    host: str | None = None
    token: str | None = None
    customSystemPrompt: str | None = None


class AnalyzeResponseRequest(BaseModel):
    endpoint: str
    method: str
    response: dict | list | str | None = None
    model: str | None = None
    region: str | None = None
    host: str | None = None
    token: str | None = None


class ExplainErrorRequest(BaseModel):
    endpoint: str
    method: str
    errorResponse: dict | list | str | None = None
    requestBody: dict | None = None
    model: str | None = None
    host: str | None = None
    token: str | None = None
    customSystemPrompt: str | None = None


class DataAssistantRequest(BaseModel):
    question: str
    conversationHistory: list[dict] | None = None
    model: str | None = None
    region: str | None = None
    systemPrompt: str | None = None
    enableQueryExecution: bool = False
    warehouseId: str | None = None
    host: str | None = None
    token: str | None = None


class GenerateWorkflowRequest(BaseModel):
    goal: str
    model: str | None = None
    host: str | None = None
    token: str | None = None
    maxTokens: int | None = None


class GenerateTestsRequest(BaseModel):
    endpoint: str
    method: str
    description: str | None = None
    model: str | None = None
    host: str | None = None
    token: str | None = None


class SecurityRecommendationsRequest(BaseModel):
    endpoint: str
    method: str
    lastError: dict | str | None = None
    lastResponse: dict | str | None = None
    model: str | None = None
    host: str | None = None
    token: str | None = None


class GenerateCodeRequest(BaseModel):
    endpoint: str
    method: str
    body: dict | None = None
    model: str | None = None
    host: str | None = None
    token: str | None = None


class GenerateDocumentationRequest(BaseModel):
    endpoint: str
    method: str
    description: str
    sampleRequest: dict | None = None
    sampleResponse: dict | None = None
    model: str | None = None
    host: str | None = None
    token: str | None = None


class ListWarehousesRequest(BaseModel):
    host: str
    token: str


# --- Model endpoints ---

@router.get("/models")
async def list_models(host: str | None = None, token: str | None = None):
    if host and token:
        try:
            import httpx
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{host.rstrip('/')}/api/2.0/serving-endpoints",
                    headers={"Authorization": f"Bearer {token}"},
                )
                if resp.status_code == 200:
                    endpoints = resp.json().get("endpoints", [])
                    models = [ep["name"] for ep in endpoints if ep.get("state", {}).get("ready") == "READY"]
                    return {"models": models}
        except Exception:
            pass

    return {"models": get_fallback_models()}


@router.get("/pricing")
async def get_pricing():
    return get_pricing_data()


@router.get("/pricing/refresh")
async def refresh_pricing():
    return refresh_pricing_data()


# --- AI generation endpoints ---

@router.post("/generate-prompt")
async def api_generate_prompt(req: GeneratePromptRequest):
    result = await generate_prompt(
        req.goal, req.model, req.host, req.token, req.maxTokens, req.systemPrompt
    )
    return result


@router.post("/prompt-executor")
async def api_prompt_executor(req: PromptExecutorRequest):
    result = await call_databricks_model_with_metadata(
        prompt=req.prompt, model=req.model, host=req.host, token=req.token, max_tokens=req.maxTokens
    )
    return {"result": result["content"], "content": result["content"], "metadata": result["metadata"]}


@router.post("/generate-query")
async def api_generate_query(req: GenerateQueryRequest):
    result = await call_databricks_model_with_metadata(
        prompt=req.userPrompt, model=req.model, host=req.host, token=req.token, system_prompt=req.systemPrompt
    )
    return {"suggestions": [{"query": result["content"]}], "tokensUsed": result["metadata"]}


@router.post("/generate-script")
async def api_generate_script(req: GenerateScriptRequest):
    result = await generate_script(req.prompt, req.category, req.model, req.host, req.token, req.maxTokens)
    return result


@router.post("/execute-script")
async def api_execute_script(req: ExecuteScriptRequest):
    result = await execute_python_script(req.script, dry_run=req.dryRun, host=req.host, token=req.token)
    return result


@router.post("/validate-execution")
async def api_validate_execution(req: ValidateExecutionRequest):
    result = await validate_execution(req.prompt, req.logs, req.output, req.model, req.host, req.token)
    return result


@router.post("/recommend-endpoint")
async def api_recommend_endpoint(req: RecommendEndpointRequest):
    result = await recommend_endpoint(req.query, req.model, req.region, req.host, req.token)
    return result


@router.post("/natural-language-to-api")
async def api_natural_language(req: NaturalLanguageRequest):
    result = await natural_language_to_api(req.query, req.model, req.host, req.token, req.systemPrompt)
    return result


@router.post("/suggest-parameters")
async def api_suggest_parameters(req: SuggestParametersRequest):
    result = await suggest_parameters(
        req.endpoint, req.method, req.userIntent, req.model, req.host, req.token, req.customSystemPrompt
    )
    return result


@router.post("/analyze-response")
async def api_analyze_response(req: AnalyzeResponseRequest):
    result = await analyze_response(req.endpoint, req.method, req.response, req.model, req.region, req.host, req.token)
    return result


@router.post("/explain-error")
async def api_explain_error(req: ExplainErrorRequest):
    result = await explain_error(
        req.endpoint, req.method, req.errorResponse, req.requestBody, req.model, req.host, req.token, req.customSystemPrompt
    )
    return result


@router.post("/data-assistant")
async def api_data_assistant(req: DataAssistantRequest):
    result = await data_assistant(
        req.question, req.conversationHistory, req.model, req.region, req.systemPrompt,
        req.enableQueryExecution, req.warehouseId, req.host, req.token
    )
    return result


@router.post("/generate-workflow")
async def api_generate_workflow(req: GenerateWorkflowRequest):
    result = await generate_workflow(req.goal, req.model, req.host, req.token, req.maxTokens)
    return result


@router.post("/generate-tests")
async def api_generate_tests(req: GenerateTestsRequest):
    result = await generate_tests(req.endpoint, req.method, req.description, req.model, req.host, req.token)
    return result


@router.post("/security-recommendations")
async def api_security_recommendations(req: SecurityRecommendationsRequest):
    result = await generate_security_recommendations(
        req.endpoint, req.method, req.lastError, req.lastResponse, req.model, req.host, req.token
    )
    return result


@router.post("/generate-code")
async def api_generate_code(req: GenerateCodeRequest):
    result = await generate_code_samples(req.endpoint, req.method, req.body, req.model, req.host, req.token)
    return result


@router.post("/generate-documentation")
async def api_generate_documentation(req: GenerateDocumentationRequest):
    result = await generate_documentation(
        req.endpoint, req.method, req.description, req.sampleRequest, req.sampleResponse, req.model, req.host, req.token
    )
    return result


@router.post("/list-warehouses")
async def api_list_warehouses(req: ListWarehousesRequest):
    import httpx
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(
            f"{req.host.rstrip('/')}/api/2.0/sql/warehouses",
            headers={"Authorization": f"Bearer {req.token}"},
        )
        if resp.status_code == 200:
            warehouses = resp.json().get("warehouses", [])
            return {"warehouses": [{"id": w["id"], "name": w["name"], "state": w.get("state", "UNKNOWN")} for w in warehouses]}
        return {"warehouses": []}


def get_fallback_models() -> list[str]:
    return [
        "databricks-meta-llama-3-1-405b-instruct",
        "databricks-meta-llama-3-1-70b-instruct",
        "databricks-meta-llama-3-3-70b-instruct",
        "databricks-claude-3-5-sonnet",
        "databricks-gemma-2-27b-it",
    ]
