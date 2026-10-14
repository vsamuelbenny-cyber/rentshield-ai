import json
from collections import Counter
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import Listing, ScanReport, ListingImage
from app.schemas import DashboardStatsResponse, DashboardFlagMetric

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Computes aggregated statistics, risk distributions, and frequent fraud flags."""
    reports = db.query(ScanReport).order_by(desc(ScanReport.created_at)).all()
    total_listings = db.query(Listing).count()

    if not reports:
        return DashboardStatsResponse(
            total_listings=total_listings,
            low_risk_count=0,
            medium_risk_count=0,
            high_risk_count=0,
            critical_risk_count=0,
            average_risk_score=0.0,
            common_flags=[],
            recent_reports=[]
        )

    low_count = sum(1 for r in reports if r.risk_tier == "LOW")
    med_count = sum(1 for r in reports if r.risk_tier == "MEDIUM")
    high_count = sum(1 for r in reports if r.risk_tier == "HIGH")
    crit_count = sum(1 for r in reports if r.risk_tier == "CRITICAL")
    avg_score = round(sum(r.overall_score for r in reports) / len(reports), 1)

    # Flag frequency counter
    flag_counter: Counter = Counter()
    flag_categories: Dict[str, str] = {}

    for r in reports:
        if r.flags_json:
            try:
                flags = json.loads(r.flags_json)
                for f in flags:
                    fname = f.get("name", "Unknown Flag")
                    flag_counter[fname] += 1
                    flag_categories[fname] = f.get("category", "text")
            except Exception:
                continue

    top_flags: List[DashboardFlagMetric] = [
        DashboardFlagMetric(
            flag_name=name,
            count=count,
            category=flag_categories.get(name, "text")
        )
        for name, count in flag_counter.most_common(8)
    ]

    # Recent reports preview
    recent_previews = []
    for r in reports[:10]:
        listing = db.query(Listing).filter(Listing.id == r.listing_id).first()
        recent_previews.append({
            "report_id": r.id,
            "listing_id": r.listing_id,
            "title": listing.title if listing else f"Listing #{r.listing_id}",
            "city": listing.city if listing else "Unknown",
            "monthly_rent": listing.monthly_rent if listing else 0,
            "overall_score": r.overall_score,
            "risk_tier": r.risk_tier,
            "text_score": r.text_score,
            "price_score": r.price_score,
            "image_score": r.image_score,
            "is_sample": listing.is_sample if listing else False,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })

    return DashboardStatsResponse(
        total_listings=total_listings,
        low_risk_count=low_count,
        medium_risk_count=med_count,
        high_risk_count=high_count,
        critical_risk_count=crit_count,
        average_risk_score=avg_score,
        common_flags=top_flags,
        recent_reports=recent_previews
    )
