import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert "message" in data


@pytest.mark.asyncio
async def test_proxy_requires_credentials(client):
    response = await client.post(
        "/api/proxy",
        json={"method": "GET", "path": "/api/2.0/clusters/list"},
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_proxy_validates_path(client):
    response = await client.post(
        "/api/proxy",
        json={
            "method": "GET",
            "path": "/invalid/path",
            "host": "https://test.databricks.com",
            "token": "test-token",
        },
    )
    assert response.status_code == 400
