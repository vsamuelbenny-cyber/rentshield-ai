import pytest
from PIL import Image, ImageDraw
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import Listing, ListingImage
from app.services.image_analyzer import ImageAnalyzer

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()

@pytest.fixture
def analyzer():
    return ImageAnalyzer()

def test_phash_generation_and_exact_match(analyzer):
    # Create a synthetic image
    img = Image.new("RGB", (200, 200), color=(50, 100, 150))
    draw = ImageDraw.Draw(img)
    draw.rectangle([20, 20, 180, 180], outline=(255, 0, 0), width=5)

    hash1 = analyzer.compute_phash(img)
    hash2 = analyzer.compute_phash(img)

    assert len(hash1) == 16
    assert hash1 == hash2

def test_duplicate_image_flagging(analyzer, test_db):
    img = Image.new("RGB", (200, 200), color=(20, 40, 60))
    draw = ImageDraw.Draw(img)
    draw.line([(0, 0), (200, 200)], fill=(255, 255, 255), width=3)
    phash = analyzer.compute_phash(img)

    # Insert existing listing with this hash
    listing1 = Listing(
        id=1,
        title="Existing Miami Condo",
        monthly_rent=3000,
        city="Miami",
        description="Nice condo"
    )
    test_db.add(listing1)
    test_db.commit()

    db_img = ListingImage(
        listing_id=1,
        file_name="img1.jpg",
        file_path="/tmp/img1.jpg",
        perceptual_hash=phash,
        original_name="img1.jpg"
    )
    test_db.add(db_img)
    test_db.commit()

    # Now check duplicate on a new listing
    matches, flags = analyzer.check_for_duplicates(
        db=test_db,
        phash_str=phash,
        current_listing_id=2,
        image_label="new_upload.jpg"
    )

    assert len(matches) == 1
    assert matches[0].is_reused_duplicate is True
    assert matches[0].matched_listing_id == 1
    assert matches[0].similarity_percentage == 100.0
    assert any(f.indicator_id == "IMAGE_REUSED_ACROSS_LISTINGS" for f in flags)
