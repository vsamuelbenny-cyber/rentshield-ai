import pytest
from app.services.price_analyzer import PriceAnalyzer

@pytest.fixture
def analyzer():
    return PriceAnalyzer()

def test_suspiciously_cheap_rent_nyc(analyzer):
    # NYC 2BR median is $4,600. Rent of $800 is an extreme discount (>80% below median)
    score, detail, flags = analyzer.analyze(
        city="New York, NY",
        bedrooms=2,
        monthly_rent=800.0,
        security_deposit=1600.0
    )
    assert detail.is_anomaly is True
    assert detail.anomaly_type == "suspiciously_cheap"
    assert detail.discount_percentage > 70.0
    assert detail.z_score < -2.0
    assert score >= 40
    assert any(f.indicator_id == "PRICING_DEEP_DISCOUNT" for f in flags)

def test_normal_rent_chicago(analyzer):
    # Chicago 2BR median is $2,400. Rent of $2,350 is normal
    score, detail, flags = analyzer.analyze(
        city="Chicago",
        bedrooms=2,
        monthly_rent=2350.0,
        security_deposit=2350.0
    )
    assert detail.is_anomaly is False
    assert detail.anomaly_type == "normal"
    assert score == 0
    assert len(flags) == 0

def test_excessive_security_deposit(analyzer):
    score, detail, flags = analyzer.analyze(
        city="Austin",
        bedrooms=1,
        monthly_rent=1500.0,
        security_deposit=6000.0  # 4x rent
    )
    assert detail.deposit_anomaly is True
    assert detail.deposit_to_rent_ratio == 4.0
    assert any(f.indicator_id == "DEPOSIT_EXCESSIVE" for f in flags)
