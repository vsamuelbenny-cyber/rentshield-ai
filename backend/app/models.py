import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    monthly_rent = Column(Float, nullable=False)
    security_deposit = Column(Float, default=0.0)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=True)
    address = Column(String(255), nullable=True)
    bedrooms = Column(Integer, default=1)
    bathrooms = Column(Float, default=1.0)
    square_feet = Column(Integer, nullable=True)
    description = Column(Text, nullable=False)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    is_sample = Column(Boolean, default=False)
    sample_tag = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan")
    scan_reports = relationship("ScanReport", back_populates="listing", cascade="all, delete-orphan")


class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    perceptual_hash = Column(String(64), nullable=False, index=True)
    original_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    listing = relationship("Listing", back_populates="images")


class ScanReport(Base):
    __tablename__ = "scan_reports"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    overall_score = Column(Integer, nullable=False)  # 0 to 100
    risk_tier = Column(String(20), nullable=False)   # LOW, MEDIUM, HIGH, CRITICAL
    text_score = Column(Integer, default=0)
    price_score = Column(Integer, default=0)
    image_score = Column(Integer, default=0)
    contact_score = Column(Integer, default=0)
    
    # Serialized JSON structures
    flags_json = Column(Text, default="[]")
    evidence_json = Column(Text, default="[]")
    price_analysis_json = Column(Text, default="{}")
    image_matches_json = Column(Text, default="[]")
    recommendations_json = Column(Text, default="[]")
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    listing = relationship("Listing", back_populates="scan_reports")
