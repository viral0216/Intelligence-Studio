import httpx
import time
import json
from app.models.ai import ModelCallMetadata

DEFAULT_MODEL = "databricks-meta-llama-3-1-405b-instruct"
DEFAULT_TEMPERATURE = 0.1
DEFAULT_MAX_TOKENS = 4096


async def call_databricks_model(
    prompt: str,
    model: str | None = None,
    host: str | None = None,
    token: str | None = None,
    max_tokens: int | None = None,
    system_prompt: str | None = None,
) -> str:
    result = await call_databricks_model_with_metadata(prompt, model, host, token, max_tokens, system_prompt)
    return result["content"]


async def call_databricks_model_with_metadata(
    prompt: str,
    model: str | None = None,
    host: str | None = None,
    token: str | None = None,
    max_tokens: int | None = None,
    system_prompt: str | None = None,
    temperature: float = DEFAULT_TEMPERATURE,
) -> dict:
    if not host or not token:
        return {
            "content": "Error: Databricks host and token are required",
            "metadata": ModelCallMetadata().model_dump(),
        }

    model = model or DEFAULT_MODEL
    max_tokens = max_tokens or DEFAULT_MAX_TOKENS
    start = time.time()

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    url = f"{host.rstrip('/')}/serving-endpoints/{model}/invocations"

    payload = {
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            resp = await client.post(
                url,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )

            duration_ms = round((time.time() - start) * 1000)

            if resp.status_code != 200:
                return {
                    "content": f"Error: Model returned status {resp.status_code}: {resp.text}",
                    "metadata": ModelCallMetadata(model=model, durationMs=duration_ms).model_dump(),
                }

            data = resp.json()
            content = ""
            usage = data.get("usage", {})

            # Handle different response formats
            if "choices" in data and data["choices"]:
                content = data["choices"][0].get("message", {}).get("content", "")
            elif "predictions" in data:
                preds = data["predictions"]
                content = preds[0] if isinstance(preds, list) and preds else str(preds)
            elif "output" in data:
                content = data["output"] if isinstance(data["output"], str) else json.dumps(data["output"])

            metadata = ModelCallMetadata(
                model=model,
                temperature=temperature,
                maxTokens=max_tokens,
                promptTokens=usage.get("prompt_tokens", 0),
                completionTokens=usage.get("completion_tokens", 0),
                totalTokens=usage.get("total_tokens", 0),
                durationMs=duration_ms,
            )

            return {"content": content, "metadata": metadata.model_dump()}

        except Exception as e:
            duration_ms = round((time.time() - start) * 1000)
            return {
                "content": f"Error calling model: {str(e)}",
                "metadata": ModelCallMetadata(model=model, durationMs=duration_ms).model_dump(),
            }


async def recommend_endpoint(
    query: str, model: str | None = None, region: str | None = None,
    host: str | None = None, token: str | None = None,
    custom_system_prompt: str | None = None,
) -> dict:
    system_prompt = custom_system_prompt or """You are a Databricks API expert. Given a user's question, recommend the best Databricks REST API endpoint(s) to use.
Include the HTTP method, full path, required parameters, and a brief explanation."""
    result = await call_databricks_model_with_metadata(query, model, host, token, system_prompt=system_prompt)
    return {"recommendation": result["content"], "metadata": result["metadata"]}


async def natural_language_to_api(
    query: str, model: str | None = None,
    host: str | None = None, token: str | None = None,
    custom_system_prompt: str | None = None,
) -> dict:
    system_prompt = custom_system_prompt or """Convert the user's natural language request into a Databricks REST API call.
Return a JSON object with: method, path, body (if needed), explanation, and confidence (0-1).
Example: {"method": "GET", "path": "/api/2.0/clusters/list", "body": null, "explanation": "Lists all clusters", "confidence": 0.95}"""
    result = await call_databricks_model_with_metadata(query, model, host, token, system_prompt=system_prompt)
    return {"apiCall": result["content"], "metadata": result["metadata"]}


async def suggest_parameters(
    endpoint: str, method: str, user_intent: str,
    model: str | None = None, host: str | None = None, token: str | None = None,
    custom_system_prompt: str | None = None,
) -> dict:
    system_prompt = custom_system_prompt or (
        "You are a Databricks API expert. Suggest the best parameters for the given API endpoint. "
        "Return ONLY a valid JSON object with the suggested parameters. "
        "Do NOT include any markdown, code fences, explanation, or commentary — just the raw JSON object."
    )
    prompt = f"Endpoint: {method} {endpoint}\nUser intent: {user_intent}\nReturn the optimal request parameters as a JSON object."
    result = await call_databricks_model_with_metadata(prompt, model, host, token, system_prompt=system_prompt)
    content = result["content"]
    # Extract JSON from response if wrapped in markdown code fences
    content = _extract_json(content)
    return {"suggestion": content}


def _extract_json(text: str) -> str:
    """Try to extract a valid JSON object from text that may contain markdown."""
    text = text.strip()
    # If it's already valid JSON, return as-is
    try:
        json.loads(text)
        return text
    except (json.JSONDecodeError, ValueError):
        pass
    # Strip markdown code fences (```json ... ``` or ``` ... ```)
    import re
    match = re.search(r'```(?:json)?\s*\n?([\s\S]*?)\n?```', text)
    if match:
        candidate = match.group(1).strip()
        try:
            parsed = json.loads(candidate)
            return json.dumps(parsed, indent=2)
        except (json.JSONDecodeError, ValueError):
            pass
    # Try to find the first { ... } block
    brace_start = text.find('{')
    brace_end = text.rfind('}')
    if brace_start != -1 and brace_end > brace_start:
        candidate = text[brace_start:brace_end + 1]
        try:
            parsed = json.loads(candidate)
            return json.dumps(parsed, indent=2)
        except (json.JSONDecodeError, ValueError):
            pass
    # Return original text if nothing worked
    return text


async def analyze_response(
    endpoint: str, method: str, response: dict | list | str | None,
    model: str | None = None, region: str | None = None,
    host: str | None = None, token: str | None = None,
    custom_system_prompt: str | None = None,
) -> dict:
    system_prompt = custom_system_prompt or "Analyze this Databricks API response. Provide key insights, notable patterns, potential issues, and recommendations."
    prompt = f"Endpoint: {method} {endpoint}\nResponse:\n{json.dumps(response, indent=2) if isinstance(response, (dict, list)) else response}"
    result = await call_databricks_model_with_metadata(prompt, model, host, token, system_prompt=system_prompt)
    return {"analysis": result["content"], "metadata": result["metadata"]}


async def explain_error(
    endpoint: str, method: str, error_response: dict | list | str | None,
    request_body: dict | None = None,
    model: str | None = None, host: str | None = None, token: str | None = None,
    custom_system_prompt: str | None = None,
) -> dict:
    system_prompt = custom_system_prompt or "Explain this Databricks API error. Include the root cause, how to fix it, and the corrected request if applicable."
    prompt = f"Endpoint: {method} {endpoint}\nError:\n{json.dumps(error_response, indent=2) if isinstance(error_response, (dict, list)) else error_response}"
    if request_body:
        prompt += f"\nRequest body:\n{json.dumps(request_body, indent=2)}"
    result = await call_databricks_model_with_metadata(prompt, model, host, token, system_prompt=system_prompt)
    return {"explanation": result["content"]}


async def data_assistant(
    question: str, conversation_history: list[dict] | None = None,
    model: str | None = None, region: str | None = None,
    system_prompt: str | None = None,
    enable_query_execution: bool = False, warehouse_id: str | None = None,
    host: str | None = None, token: str | None = None,
) -> dict:
    sys_prompt = system_prompt or """You are a data assistant for Databricks. Help users with:
- Writing SQL queries for Unity Catalog tables
- Understanding data schemas
- Data analysis and insights
- Databricks best practices
If the user asks for a query, provide the SQL and explain it."""

    context = ""
    if conversation_history:
        for msg in conversation_history[-10:]:
            context += f"{msg.get('role', 'user')}: {msg.get('content', '')}\n"
        context += f"user: {question}"
    else:
        context = question

    result = await call_databricks_model_with_metadata(context, model, host, token, system_prompt=sys_prompt)
    return {"answer": result["content"], "metadata": result["metadata"]}


async def generate_workflow(
    goal: str, model: str | None = None,
    host: str | None = None, token: str | None = None,
    max_tokens: int | None = None,
    custom_system_prompt: str | None = None,
) -> dict:
    system_prompt = custom_system_prompt or """Generate a Databricks workflow as a sequence of API calls. For each step include:
- Step number and description
- HTTP method and endpoint
- Request body
- Expected response
- Dependencies on previous steps"""
    result = await call_databricks_model_with_metadata(goal, model, host, token, max_tokens, system_prompt)
    return {"workflow": result["content"], "metadata": result["metadata"]}


async def generate_prompt(
    goal: str, model: str | None = None,
    host: str | None = None, token: str | None = None,
    max_tokens: int | None = None, system_prompt: str | None = None,
) -> dict:
    sys_prompt = system_prompt or "Generate an optimized system prompt for an AI assistant based on the user's goal."
    result = await call_databricks_model_with_metadata(goal, model, host, token, max_tokens, sys_prompt)
    return {"prompt": result["content"], "metadata": result["metadata"]}


async def generate_tests(
    endpoint: str, method: str, description: str | None = None,
    model: str | None = None, host: str | None = None, token: str | None = None,
    custom_system_prompt: str | None = None,
) -> dict:
    system_prompt = custom_system_prompt or "Generate test cases for the given Databricks API endpoint. Include positive tests, negative tests, edge cases, and expected responses."
    prompt = f"Endpoint: {method} {endpoint}" + (f"\nDescription: {description}" if description else "")
    result = await call_databricks_model_with_metadata(prompt, model, host, token, system_prompt=system_prompt)
    return {"tests": result["content"], "metadata": result["metadata"]}


async def generate_security_recommendations(
    endpoint: str, method: str,
    last_error: dict | str | None = None, last_response: dict | str | None = None,
    model: str | None = None, host: str | None = None, token: str | None = None,
    custom_system_prompt: str | None = None,
) -> dict:
    system_prompt = custom_system_prompt or "Provide security recommendations for this Databricks API endpoint. Cover authentication, authorization, data protection, and best practices."
    prompt = f"Endpoint: {method} {endpoint}"
    if last_error:
        prompt += f"\nRecent error: {json.dumps(last_error) if isinstance(last_error, dict) else last_error}"
    if last_response:
        prompt += f"\nRecent response: {json.dumps(last_response) if isinstance(last_response, dict) else last_response}"
    result = await call_databricks_model_with_metadata(prompt, model, host, token, system_prompt=system_prompt)
    return {"recommendations": result["content"], "metadata": result["metadata"]}


async def generate_code_samples(
    endpoint: str, method: str, body: dict | None = None,
    model: str | None = None, host: str | None = None, token: str | None = None,
    custom_system_prompt: str | None = None,
) -> dict:
    system_prompt = custom_system_prompt or "Generate code samples for calling this Databricks API endpoint in Python, JavaScript, cURL, and Go."
    prompt = f"Endpoint: {method} {endpoint}"
    if body:
        prompt += f"\nRequest body: {json.dumps(body, indent=2)}"
    result = await call_databricks_model_with_metadata(prompt, model, host, token, system_prompt=system_prompt)
    return {"code": result["content"], "metadata": result["metadata"]}


async def generate_documentation(
    endpoint: str, method: str, description: str,
    sample_request: dict | None = None, sample_response: dict | None = None,
    model: str | None = None, host: str | None = None, token: str | None = None,
    custom_system_prompt: str | None = None,
) -> dict:
    system_prompt = custom_system_prompt or "Generate comprehensive API documentation for this Databricks endpoint in Markdown format."
    prompt = f"Endpoint: {method} {endpoint}\nDescription: {description}"
    if sample_request:
        prompt += f"\nSample request: {json.dumps(sample_request, indent=2)}"
    if sample_response:
        prompt += f"\nSample response: {json.dumps(sample_response, indent=2)}"
    result = await call_databricks_model_with_metadata(prompt, model, host, token, system_prompt=system_prompt)
    return {"documentation": result["content"]}


async def generate_script(
    prompt: str, category: str | None = None,
    model: str | None = None, host: str | None = None, token: str | None = None,
    max_tokens: int | None = None,
    custom_system_prompt: str | None = None,
) -> dict:
    system_prompt = custom_system_prompt or f"""Generate a Python script for Databricks automation{f' (category: {category})' if category else ''}.
The script should use the databricks-sdk or REST API calls.
Include error handling and logging. Return ONLY the Python code."""
    result = await call_databricks_model_with_metadata(prompt, model, host, token, max_tokens, system_prompt)
    return {
        "script": result["content"],
        "language": "python",
        "estimatedImpact": "medium",
        "metadata": result["metadata"],
    }


async def validate_execution(
    prompt: str, logs: list[str], output: str,
    model: str | None = None, host: str | None = None, token: str | None = None,
) -> dict:
    system_prompt = "Validate the execution results of a Databricks script. Determine if it was successful and provide a summary."
    validation_prompt = f"Original prompt: {prompt}\nLogs:\n{''.join(logs)}\nOutput:\n{output}"
    result = await call_databricks_model_with_metadata(validation_prompt, model, host, token, system_prompt=system_prompt)
    return {
        "report": result["content"],
        "successful": "error" not in result["content"].lower(),
        "summary": result["content"][:200],
        "timestamp": str(time.time()),
    }


# Need time import at module level
import time  # noqa: E402
