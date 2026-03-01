from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str  # 'user' | 'assistant' | 'system'
    content: str


class AgentConfig(BaseModel):
    name: str
    description: str
    pattern: str
    handler: str  # 'api' | 'transform' | 'custom'
    config: dict | None = None
    enabled: bool = True


class AgentResponse(BaseModel):
    response: str
    metadata: dict | None = None
