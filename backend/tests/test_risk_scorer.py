import pytest
from app.services.risk_scorer import RiskScorer
from app.schemas import DetectedFlag, PriceAnalysisDetail, ImageMatchDetail

@pytest.fixture
def scorer():
    return RiskScorer()

def test_critical_risk_composite(scorer):
    flags = [
        DetectedFlag(
            indicator_id="WIRE_TRANSFER_DEMAND",
            category="text",
            name="Wire Transfer",
            severity="critical",
            score_impact=40,
            description="Wire transfer requested"
        ),
        DetectedFlag(
            indicator_id="PRICING_DEEP_DISCOUNT",
            category="price",
            name="Deep Discount",
            severity="critical",
            score_impact=45,
            description="Under median"
        )
    ]
    price = PriceAnalysisDetail(
        monthly_rent=800,
        security_deposit=1600,
        city="New York",
        bedrooms=2,
        is_anomaly=True,
        anomaly_type="suspiciously_cheap",
        explanation="Severely below market rate"
    )
    score, tier, verdict, checklist = scorer.compute_risk(
        text_score=70,
        price_score=45,
        image_score=0,
        contact_score=0,
        detected_flags=flags,
        price_analysis=price,
        image_matches=[]
    )

    assert score >= 80
    assert tier == "CRITICAL"
    assert "CRITICAL RISK" in verdict
    assert len(checklist) >= 2
    assert any(step.step_id == "CHECK_PAYMENT_SAFETY" for step in checklist)

def test_low_risk_composite(scorer):
    price = PriceAnalysisDetail(
        monthly_rent=2400,
        security_deposit=2400,
        city="Chicago",
        bedrooms=2,
        is_anomaly=False,
        explanation="Normal rent"
    )
    score, tier, verdict, checklist = scorer.compute_risk(
        text_score=0,
        price_score=0,
        image_score=0,
        contact_score=0,
        detected_flags=[],
        price_analysis=price,
        image_matches=[]
    )

    assert score <= 20
    assert tier == "LOW"
    assert "LOW RISK" in verdict
