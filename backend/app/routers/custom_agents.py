from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import uuid

router = APIRouter()

# In-memory storage for custom agents
_custom_agents: dict[str, dict] = {}


class CustomAgentCreate(BaseModel):
    name: str
    description: str
    pattern: str
    handler: str  # 'api' | 'transform' | 'custom'
    config: dict | None = None
    enabled: bool = True


class CustomAgentUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    pattern: str | None = None
    handler: str | None = None
    config: dict | None = None
    enabled: bool | None = None


@router.get("/custom-agents")
async def list_custom_agents():
    return list(_custom_agents.values())


@router.post("/custom-agents")
async def create_custom_agent(agent: CustomAgentCreate):
    agent_id = str(uuid.uuid4())
    agent_data = {"id": agent_id, **agent.model_dump()}
    _custom_agents[agent_id] = agent_data
    return agent_data


@router.put("/custom-agents/{agent_id}")
async def update_custom_agent(agent_id: str, update: CustomAgentUpdate):
    if agent_id not in _custom_agents:
        raise HTTPException(status_code=404, detail="Agent not found")
    for key, value in update.model_dump(exclude_none=True).items():
        _custom_agents[agent_id][key] = value
    return _custom_agents[agent_id]


@router.delete("/custom-agents/{agent_id}")
async def delete_custom_agent(agent_id: str):
    if agent_id not in _custom_agents:
        raise HTTPException(status_code=404, detail="Agent not found")
    del _custom_agents[agent_id]
    return {"success": True, "message": "Agent deleted"}
