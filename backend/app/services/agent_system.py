import re
import time
import json
from app.services.ai_helper import call_databricks_model_with_metadata
from app.services.databricks_client import databricks_request
from app.models.proxy import ProxyRequest
from app.models.common import HttpMethod


class DefaultHandler:
    def __init__(self, name: str, description: str, pattern: str, endpoint: str, method: str = "GET"):
        self.name = name
        self.description = description
        self.pattern = pattern
        self.endpoint = endpoint
        self.method = method

    def matches(self, message: str) -> bool:
        return bool(re.search(self.pattern, message, re.IGNORECASE))

    async def handle(self, message: str, host: str | None, token: str | None) -> dict:
        if not host or not token:
            return {"response": "Error: Databricks host and token are required", "metadata": {}}

        start = time.time()
        result = await databricks_request(
            ProxyRequest(method=HttpMethod(self.method), path=self.endpoint, host=host, token=token)
        )
        duration_ms = round((time.time() - start) * 1000)

        if result.status == 200:
            data = result.data
            summary = json.dumps(data, indent=2)[:2000] if isinstance(data, (dict, list)) else str(data)[:2000]
            return {
                "response": f"**{self.name}** completed successfully:\n\n```json\n{summary}\n```",
                "metadata": {"toolsUsed": [self.name], "executionTime": duration_ms},
            }
        else:
            return {
                "response": f"Error executing {self.name}: Status {result.status}",
                "metadata": {"toolsUsed": [self.name], "executionTime": duration_ms, "error": True},
            }


class AgentRegistry:
    def __init__(self):
        self.default_handlers: list[DefaultHandler] = [
            DefaultHandler("List Catalogs", "List Unity Catalog catalogs", r"catalog.*list|list.*catalog", "/api/2.1/unity-catalog/catalogs"),
            DefaultHandler("List Users", "List workspace users", r"user.*(list|find|show)|(list|find|show).*user", "/api/2.0/preview/scim/v2/Users"),
            DefaultHandler("List Groups", "List workspace groups", r"group.*(list|find|show)|(list|find|show).*group", "/api/2.0/preview/scim/v2/Groups"),
            DefaultHandler("List Tables", "List tables in a catalog", r"table.*(list|catalog)|list.*table", "/api/2.1/unity-catalog/tables"),
        ]
        self.custom_handlers: list[dict] = []
        self.foundation_model_enabled = True
        self.foundation_model_endpoint = "databricks-meta-llama-3-1-405b-instruct"
        self.foundation_model_system_prompt = "You are a helpful Databricks assistant. Help users manage their workspace, run queries, and understand their data."

    async def handle_message(
        self, message: str, history: list[dict], host: str | None, token: str | None, use_foundation_model: bool = False
    ) -> dict:
        # Check default handlers first
        for handler in self.default_handlers:
            if handler.matches(message):
                return await handler.handle(message, host, token)

        # Check custom handlers
        for custom in self.custom_handlers:
            if custom.get("enabled", True) and re.search(custom.get("pattern", ""), message, re.IGNORECASE):
                return await self._handle_custom(custom, message, host, token)

        # Fall back to Foundation Model
        if use_foundation_model or self.foundation_model_enabled:
            return await self._handle_foundation_model(message, history, host, token)

        return {"response": "I'm not sure how to help with that. Try asking about catalogs, users, groups, or tables.", "metadata": {}}

    async def _handle_custom(self, handler: dict, message: str, host: str | None, token: str | None) -> dict:
        handler_type = handler.get("handler", "api")
        config = handler.get("config", {})

        if handler_type == "api":
            endpoint = config.get("endpoint", "")
            method = config.get("method", "GET")
            result = await databricks_request(
                ProxyRequest(method=HttpMethod(method), path=endpoint, host=host, token=token)
            )
            return {"response": json.dumps(result.data, indent=2)[:2000] if isinstance(result.data, (dict, list)) else str(result.data), "metadata": {}}

        return {"response": f"Custom handler '{handler.get('name')}' executed", "metadata": {}}

    async def _handle_foundation_model(self, message: str, history: list[dict], host: str | None, token: str | None) -> dict:
        start = time.time()
        result = await call_databricks_model_with_metadata(
            prompt=message,
            model=self.foundation_model_endpoint,
            host=host,
            token=token,
            system_prompt=self.foundation_model_system_prompt,
        )
        duration_ms = round((time.time() - start) * 1000)
        metadata = result.get("metadata", {})
        metadata["toolsUsed"] = ["Foundation Model"]
        metadata["executionTime"] = duration_ms
        return {"response": result["content"], "metadata": metadata}

    def list_handlers(self) -> list[dict]:
        handlers = [{"name": h.name, "description": h.description} for h in self.default_handlers]
        handlers.extend([{"name": h["name"], "description": h.get("description", "")} for h in self.custom_handlers])
        return handlers

    def configure_foundation_model(self, endpoint: str | None = None, system_prompt: str | None = None, enabled: bool | None = None):
        if endpoint is not None:
            self.foundation_model_endpoint = endpoint
        if system_prompt is not None:
            self.foundation_model_system_prompt = system_prompt
        if enabled is not None:
            self.foundation_model_enabled = enabled

    def register_custom_handler(self, name: str, description: str, pattern: str, handler: str):
        self.custom_handlers.append({
            "name": name,
            "description": description,
            "pattern": pattern,
            "handler": handler,
            "enabled": True,
        })

    def unregister_handler(self, name: str):
        self.custom_handlers = [h for h in self.custom_handlers if h.get("name") != name]


# Singleton
agent_registry = AgentRegistry()
