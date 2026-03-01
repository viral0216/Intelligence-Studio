import pytest


@pytest.mark.asyncio
async def test_list_models_fallback(client):
    response = await client.get("/api/ai/models")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert len(data["models"]) > 0


@pytest.mark.asyncio
async def test_get_pricing(client):
    response = await client.get("/api/ai/pricing")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data


@pytest.mark.asyncio
async def test_refresh_pricing(client):
    response = await client.get("/api/ai/pricing/refresh")
    assert response.status_code == 200
