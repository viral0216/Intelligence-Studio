import pytest


@pytest.mark.asyncio
async def test_list_handlers(client):
    response = await client.get("/api/agent/handlers")
    assert response.status_code == 200
    data = response.json()
    assert "handlers" in data
    assert len(data["handlers"]) > 0


@pytest.mark.asyncio
async def test_custom_agents_crud(client):
    # Create
    response = await client.post(
        "/api/custom-agents",
        json={
            "name": "Test Agent",
            "description": "Test",
            "pattern": "test.*",
            "handler": "api",
        },
    )
    assert response.status_code == 200
    agent = response.json()
    agent_id = agent["id"]

    # List
    response = await client.get("/api/custom-agents")
    assert response.status_code == 200
    agents = response.json()
    assert len(agents) >= 1

    # Update
    response = await client.put(
        f"/api/custom-agents/{agent_id}",
        json={"name": "Updated Agent"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Agent"

    # Delete
    response = await client.delete(f"/api/custom-agents/{agent_id}")
    assert response.status_code == 200
