import json
from typing import Optional, List
from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models import Listing, ListingImage, ScanReport
from app.schemas import (
    ScanReportResponse,
    ScoreBreakdown,
    DetectedFlag,
    PriceAnalysisDetail,
    ImageMatchDetail,
    VerificationStep
)
from app.services.text_analyzer import text_analyzer
from app.services.price_analyzer import price_analyzer
from app.services.image_analyzer import image_analyzer
from app.services.risk_scorer import risk_scorer
from app.utils.file_validator import validate_and_load_image

router = APIRouter(prefix="/api", tags=["Analysis"])

@router.post("/scan", response_model=ScanReportResponse)
async def scan_listing(
    title: str = Form(...),
    monthly_rent: float = Form(...),
    security_deposit: float = Form(0.0),
    city: str = Form(...),
    state: Optional[str] = Form(""),
    address: Optional[str] = Form(""),
    bedrooms: int = Form(1),
    bathrooms: float = Form(1.0),
    square_feet: Optional[int] = Form(None),
    description: str = Form(...),
    contact_email: Optional[str] = Form(None),
    contact_phone: Optional[str] = Form(None),
    is_sample: bool = Form(False),
    sample_tag: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Submits a rental listing for multi-vector scam analysis:
    - Text heuristics & scam tropes
    - Price anomaly vs regional benchmark
    - Perceptual image hashing for duplicate reuse
    - Explainable composite risk report
    """
    if monthly_rent <= 0:
        raise HTTPException(status_code=420, detail="Monthly rent must be greater than 0.")
    if len(description.strip()) < 10:
        raise HTTPException(status_code=400, detail="Description is too short to analyze.")

    # 1. Text Analysis
    text_score, text_flags = text_analyzer.analyze(
        title=title,
        description=description,
        contact_email=contact_email or "",
        contact_phone=contact_phone or ""
    )

    # 2. Price Analysis
    price_score, price_detail, price_flags = price_analyzer.analyze(
        city=city,
        bedrooms=bedrooms,
        monthly_rent=monthly_rent,
        security_deposit=security_deposit
    )

    # 3. Image Analysis (if uploaded)
    image_matches: List[ImageMatchDetail] = []
    image_flags: List[DetectedFlag] = []
    saved_filename = None
    image_phash = None
    image_score = 0

    if image and image.filename:
        pil_image = validate_and_load_image(image)
        saved_filename, image_phash = image_analyzer.save_and_hash_image(pil_image, image.filename)
        image_matches, image_flags = image_analyzer.check_for_duplicates(
            db=db,
            phash_str=image_phash,
            image_label=image.filename
        )
        if any(f.severity == "critical" for f in image_flags):
            image_score = 45
        elif any(f.severity == "high" for f in image_flags):
            image_score = 30
        elif image_flags:
            image_score = 20

    # Combine flags
    all_flags = text_flags + price_flags + image_flags
    contact_score = 15 if any(f.category == "contact" for f in all_flags) else 0

    # 4. Composite Risk Scoring & Explainability
    final_score, risk_tier, verdict, checklist = risk_scorer.compute_risk(
        text_score=text_score,
        price_score=price_score,
        image_score=image_score,
        contact_score=contact_score,
        detected_flags=all_flags,
        price_analysis=price_detail,
        image_matches=image_matches
    )

    # 5. Persist Listing & Scan
    db_listing = Listing(
        title=title,
        monthly_rent=monthly_rent,
        security_deposit=security_deposit,
        city=city,
        state=state or "",
        address=address or "",
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        square_feet=square_feet,
        description=description,
        contact_email=contact_email,
        contact_phone=contact_phone,
        is_sample=is_sample,
        sample_tag=sample_tag
    )
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)

    if saved_filename and image_phash:
        db_image = ListingImage(
            listing_id=db_listing.id,
            file_name=saved_filename,
            file_path=str(saved_filename),
            perceptual_hash=image_phash,
            original_name=image.filename
        )
        db.add(db_image)
        db.commit()

    db_report = ScanReport(
        listing_id=db_listing.id,
        overall_score=final_score,
        risk_tier=risk_tier,
        text_score=text_score,
        price_score=price_score,
        image_score=image_score,
        contact_score=contact_score,
        flags_json=json.dumps([f.model_dump() for f in all_flags]),
        evidence_json=json.dumps([f.matched_snippet for f in all_flags if f.matched_snippet]),
        price_analysis_json=json.dumps(price_detail.model_dump()),
        image_matches_json=json.dumps([m.model_dump() for m in image_matches]),
        recommendations_json=json.dumps([s.model_dump() for s in checklist])
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    return ScanReportResponse(
        report_id=db_report.id,
        listing_id=db_listing.id,
        created_at=db_report.created_at,
        overall_score=final_score,
        risk_tier=risk_tier,
        score_breakdown=ScoreBreakdown(
            text_score=text_score,
            price_score=price_score,
            image_score=image_score,
            contact_score=contact_score,
            overall_score=final_score,
            risk_tier=risk_tier
        ),
        summary_verdict=verdict,
        detected_flags=all_flags,
        price_analysis=price_detail,
        image_analysis=image_matches,
        recommendations=checklist
    )

@router.get("/samples")
def get_sample_listings():
    """Returns curated demo scenarios for one-click testing."""
    from app.config import DATA_DIR
    samples_path = DATA_DIR / "sample_listings.json"
    if samples_path.exists():
        with open(samples_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

@router.get("/benchmarks")
def get_benchmarks():
    """Returns rental benchmark database for client transparency."""
    from app.config import DATA_DIR
    bench_path = DATA_DIR / "benchmark_rents.json"
    if bench_path.exists():
        with open(bench_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"markets": {}}
