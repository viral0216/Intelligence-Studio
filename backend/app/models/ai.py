from pydantic import BaseModel


class ModelCallMetadata(BaseModel):
    model: str = ""
    temperature: float = 0.0
    maxTokens: int = 0
    promptTokens: int = 0
    completionTokens: int = 0
    totalTokens: int = 0
    durationMs: int = 0
    region: str | None = None


class AiResponse(BaseModel):
    content: str
    metadata: ModelCallMetadata


class ApiCallSpec(BaseModel):
    method: str
    path: str
    body: dict | None = None
    explanation: str = ""
    confidence: float = 0.0
