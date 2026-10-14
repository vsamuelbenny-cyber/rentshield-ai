import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import Listing, ScanReport, ListingImage
from app.schemas import (
    ListingItemResponse,
    ScanReportResponse,
    ScoreBreakdown,
    DetectedFlag,
    PriceAnalysisDetail,
    ImageMatchDetail,
    VerificationStep
)

router = APIRouter(prefix="/api/listings", tags=["Listings"])

def _format_scan_report(report: ScanReport) -> ScanReportResponse:
    flags_data = json.loads(report.flags_json) if report.flags_json else []
    price_data = json.loads(report.price_analysis_json) if report.price_analysis_json else {}
    img_data = json.loads(report.image_matches_json) if report.image_matches_json else []
    rec_data = json.loads(report.recommendations_json) if report.recommendations_json else []

    detected_flags = [DetectedFlag(**f) for f in flags_data]
    price_analysis = PriceAnalysisDetail(**price_data) if price_data else PriceAnalysisDetail(
        monthly_rent=0, security_deposit=0, city="Unknown", bedrooms=1, explanation="No data"
    )
    image_analysis = [ImageMatchDetail(**m) for m in img_data]
    recommendations = [VerificationStep(**r) for r in rec_data]

    return ScanReportResponse(
        report_id=report.id,
        listing_id=report.listing_id,
        created_at=report.created_at,
        overall_score=report.overall_score,
        risk_tier=report.risk_tier,
        score_breakdown=ScoreBreakdown(
            text_score=report.text_score,
            price_score=report.price_score,
            image_score=report.image_score,
            contact_score=report.contact_score,
            overall_score=report.overall_score,
            risk_tier=report.risk_tier
        ),
        summary_verdict=f"Risk Score {report.overall_score}/100 ({report.risk_tier})",
        detected_flags=detected_flags,
        price_analysis=price_analysis,
        image_analysis=image_analysis,
        recommendations=recommendations
    )

@router.get("", response_model=List[ListingItemResponse])
def get_listings(
    limit: int = Query(50, ge=1, le=100),
    risk_filter: Optional[str] = None,
    city_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieves saved listings with optional risk tier and city filtering."""
    query = db.query(Listing).order_by(desc(Listing.created_at))

    if city_filter:
        query = query.filter(Listing.city.ilike(f"%{city_filter}%"))

    listings = query.limit(limit).all()
    results = []

    for item in listings:
        latest_report = (
            db.query(ScanReport)
            .filter(ScanReport.listing_id == item.id)
            .order_by(desc(ScanReport.created_at))
            .first()
        )
        formatted_report = _format_scan_report(latest_report) if latest_report else None

        if risk_filter and formatted_report:
            if formatted_report.risk_tier.lower() != risk_filter.lower():
                continue

        results.append(ListingItemResponse(
            id=item.id,
            title=item.title,
            monthly_rent=item.monthly_rent,
            security_deposit=item.security_deposit,
            city=item.city,
            state=item.state,
            bedrooms=item.bedrooms,
            bathrooms=item.bathrooms,
            square_feet=item.square_feet,
            description=item.description,
            contact_email=item.contact_email,
            contact_phone=item.contact_phone,
            is_sample=item.is_sample,
            sample_tag=item.sample_tag,
            created_at=item.created_at,
            latest_report=formatted_report
        ))

    return results

@router.get("/{listing_id}", response_model=ListingItemResponse)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    """Retrieves a single listing and its scan report."""
    item = db.query(Listing).filter(Listing.id == listing_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Listing not found.")

    latest_report = (
        db.query(ScanReport)
        .filter(ScanReport.listing_id == item.id)
        .order_by(desc(ScanReport.created_at))
        .first()
    )

    return ListingItemResponse(
        id=item.id,
        title=item.title,
        monthly_rent=item.monthly_rent,
        security_deposit=item.security_deposit,
        city=item.city,
        state=item.state,
        bedrooms=item.bedrooms,
        bathrooms=item.bathrooms,
        square_feet=item.square_feet,
        description=item.description,
        contact_email=item.contact_email,
        contact_phone=item.contact_phone,
        is_sample=item.is_sample,
        sample_tag=item.sample_tag,
        created_at=item.created_at,
        latest_report=_format_scan_report(latest_report) if latest_report else None
    )

@router.delete("/{listing_id}")
def delete_listing(listing_id: int, db: Session = Depends(get_db)):
    """Deletes a listing and associated scan records."""
    item = db.query(Listing).filter(Listing.id == listing_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Listing not found.")
    db.delete(item)
    db.commit()
    return {"status": "success", "message": f"Listing #{listing_id} deleted."}
