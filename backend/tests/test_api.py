import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_login_admin():
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@ecoatlas.earth", "password": "Admin123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@ecoatlas.earth"

def test_get_projects():
    response = client.get("/api/projects")
    assert response.status_code == 200
    projects = response.json()
    assert len(projects) >= 4
    assert any("Amazon" in p["name"] for p in projects)

def test_sites_geojson():
    response = client.get("/api/sites/geojson")
    assert response.status_code == 200
    fc = response.json()
    assert fc["type"] == "FeatureCollection"
    assert len(fc["features"]) > 0
    assert "properties" in fc["features"][0]

def test_site_analytics():
    response = client.get("/api/sites/geojson")
    first_site_id = response.json()["features"][0]["properties"]["id"]
    analytics_resp = client.get(f"/api/sites/{first_site_id}/analytics")
    assert analytics_resp.status_code == 200
    records = analytics_resp.json()
    assert len(records) >= 12
    assert "ndvi" in records[0]
    assert "carbon_stock_tonnes" in records[0]
