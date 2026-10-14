import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # Ensure models are loaded into Base metadata
from app.main import app
from app.database import Base, get_db

# Use StaticPool so in-memory SQLite persists across requests within the test session
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    return TestClient(app)

def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["app"] == "RentShield AI"

def test_get_samples(client):
    res = client.get("/api/samples")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 3

def test_get_benchmarks(client):
    res = client.get("/api/benchmarks")
    assert res.status_code == 200
    data = res.json()
    assert "markets" in data
    assert "new york" in data["markets"]

def test_scan_listing_endpoint(client):
    form_data = {
        "title": "Downtown 2BR Condo Test",
        "monthly_rent": "600.0",
        "security_deposit": "600.0",
        "city": "Miami",
        "state": "FL",
        "bedrooms": "2",
        "bathrooms": "2.0",
        "description": "Please wire the money via Western Union immediately as I am currently on missionary work abroad. Keys will be mailed via FedEx."
    }
    res = client.post("/api/scan", data=form_data)
    assert res.status_code == 200
    data = res.json()
    assert "overall_score" in data
    assert data["overall_score"] >= 70
    assert data["risk_tier"] in ("HIGH", "CRITICAL")
    assert len(data["detected_flags"]) >= 2
    assert "price_analysis" in data
    assert data["price_analysis"]["is_anomaly"] is True

def test_scan_short_description_validation(client):
    form_data = {
        "title": "Too short",
        "monthly_rent": "1000",
        "city": "Austin",
        "description": "tiny"
    }
    res = client.post("/api/scan", data=form_data)
    assert res.status_code == 400

def test_dashboard_stats(client):
    res = client.get("/api/dashboard/stats")
    assert res.status_code == 200
    data = res.json()
    assert "total_listings" in data
    assert "average_risk_score" in data
    assert isinstance(data["common_flags"], list)
