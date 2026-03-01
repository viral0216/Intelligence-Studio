from fastapi import APIRouter
from pydantic import BaseModel
from app.services.agent_system import agent_registry

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    history: list[dict] | None = None
    host: str | None = None
    token: str | None = None
    useFoundationModel: bool = False


class ConfigureFoundationModelRequest(BaseModel):
    endpoint: str | None = None
    systemPrompt: str | None = None
    enabled: bool | None = None


class RegisterCustomRequest(BaseModel):
    name: str
    description: str
    pattern: str
    handler: str


@router.post("/chat")
async def agent_chat(req: ChatRequest):
    result = await agent_registry.handle_message(
        req.message, req.history or [], req.host, req.token, req.useFoundationModel
    )
    return result


@router.get("/handlers")
async def list_handlers():
    handlers = agent_registry.list_handlers()
    return {"handlers": handlers}


@router.post("/configure-foundation-model")
async def configure_foundation_model(req: ConfigureFoundationModelRequest):
    agent_registry.configure_foundation_model(
        endpoint=req.endpoint, system_prompt=req.systemPrompt, enabled=req.enabled
    )
    return {"success": True, "message": "Foundation model configured"}


@router.post("/register-custom")
async def register_custom(req: RegisterCustomRequest):
    agent_registry.register_custom_handler(req.name, req.description, req.pattern, req.handler)
    return {"success": True, "message": f"Agent '{req.name}' registered"}


@router.delete("/unregister/{name}")
async def unregister_custom(name: str):
    agent_registry.unregister_handler(name)
    return {"success": True, "message": f"Agent '{name}' unregistered"}
