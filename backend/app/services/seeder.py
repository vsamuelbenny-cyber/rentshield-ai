import json
from PIL import Image, ImageDraw, ImageFont
from sqlalchemy.orm import Session
from app.config import DATA_DIR, settings
from app.models import Listing, ListingImage, ScanReport
from app.services.text_analyzer import text_analyzer
from app.services.price_analyzer import price_analyzer
from app.services.image_analyzer import image_analyzer
from app.services.risk_scorer import risk_scorer

def seed_database_if_empty(db: Session):
    """
    Seeds initial demo listings and sample images on startup if the database is empty.
    Allows immediate out-of-the-box exploration in the UI dashboard.
    """
    if db.query(Listing).count() > 0:
        return

    samples_path = DATA_DIR / "sample_listings.json"
    if not samples_path.exists():
        return

    with open(samples_path, "r", encoding="utf-8") as f:
        samples = json.load(f)

    # Create a baseline sample image to demonstrate duplicate photo reuse
    sample_img_path = settings.upload_dir / "sample_luxury_penthouse.jpg"
    if not sample_img_path.exists():
        img = Image.new("RGB", (600, 400), color=(18, 30, 49))
        draw = ImageDraw.Draw(img)
        draw.rectangle([50, 50, 550, 350], outline=(0, 245, 212), width=3)
        draw.text((70, 180), "SAMPLE LUXURY CONDO PHOTO", fill=(255, 255, 255))
        draw.text((70, 220), "RentShield AI Demo Asset", fill=(72, 202, 228))
        img.save(sample_img_path, "JPEG")

    # Hash the sample image
    sample_pil = Image.open(sample_img_path)
    sample_phash = image_analyzer.compute_phash(sample_pil)

    for item in samples:
        listing = Listing(
            title=item["title"],
            monthly_rent=item["monthly_rent"],
            security_deposit=item["security_deposit"],
            city=item["city"],
            state=item.get("state", ""),
            address=item.get("address", ""),
            bedrooms=item.get("bedrooms", 1),
            bathrooms=item.get("bathrooms", 1.0),
            square_feet=item.get("square_feet"),
            description=item["description"],
            contact_email=item.get("contact_email"),
            contact_phone=item.get("contact_phone"),
            is_sample=True,
            sample_tag=item.get("sample_tag")
        )
        db.add(listing)
        db.commit()
        db.refresh(listing)

        # Attach image to the first sample listing (ID 101 or 102) to simulate stored listing photo
        if item.get("sample_tag") == "too_good_to_be_true_price":
            db_img = ListingImage(
                listing_id=listing.id,
                file_name="sample_luxury_penthouse.jpg",
                file_path=str(sample_img_path),
                perceptual_hash=sample_phash,
                original_name="penthouse_oceanview.jpg"
            )
            db.add(db_img)
            db.commit()

        # Run full analysis
        text_score, text_flags = text_analyzer.analyze(
            title=listing.title,
            description=listing.description,
            contact_email=listing.contact_email or "",
            contact_phone=listing.contact_phone or ""
        )
        price_score, price_detail, price_flags = price_analyzer.analyze(
            city=listing.city,
            bedrooms=listing.bedrooms,
            monthly_rent=listing.monthly_rent,
            security_deposit=listing.security_deposit
        )

        all_flags = text_flags + price_flags
        contact_score = 15 if any(f.category == "contact" for f in all_flags) else 0

        final_score, risk_tier, verdict, checklist = risk_scorer.compute_risk(
            text_score=text_score,
            price_score=price_score,
            image_score=0,
            contact_score=contact_score,
            detected_flags=all_flags,
            price_analysis=price_detail,
            image_matches=[]
        )

        report = ScanReport(
            listing_id=listing.id,
            overall_score=final_score,
            risk_tier=risk_tier,
            text_score=text_score,
            price_score=price_score,
            image_score=0,
            contact_score=contact_score,
            flags_json=json.dumps([f.model_dump() for f in all_flags]),
            evidence_json=json.dumps([f.matched_snippet for f in all_flags if f.matched_snippet]),
            price_analysis_json=json.dumps(price_detail.model_dump()),
            image_matches_json=json.dumps([]),
            recommendations_json=json.dumps([s.model_dump() for s in checklist])
        )
        db.add(report)
        db.commit()
