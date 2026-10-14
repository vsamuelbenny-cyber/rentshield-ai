from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from datetime import datetime

class DetectedFlag(BaseModel):
    indicator_id: str
    category: str  # text, price, image, contact
    name: str
    severity: str  # low, medium, high, critical
    score_impact: int
    description: str
    matched_snippet: Optional[str] = None

class PriceAnalysisDetail(BaseModel):
    monthly_rent: float
    security_deposit: float
    benchmark_median: Optional[float] = None
    benchmark_min: Optional[float] = None
    benchmark_max: Optional[float] = None
    benchmark_std: Optional[float] = None
    city: str
    bedrooms: int
    discount_percentage: Optional[float] = None
    z_score: Optional[float] = None
    is_anomaly: bool = False
    anomaly_type: Optional[str] = None  # suspiciously_cheap, excessively_high, normal, insufficient_data
    deposit_to_rent_ratio: Optional[float] = None
    deposit_anomaly: bool = False
    explanation: str

class ImageMatchDetail(BaseModel):
    uploaded_image: str
    perceptual_hash: str
    matched_listing_id: Optional[int] = None
    matched_listing_title: Optional[str] = None
    matched_listing_city: Optional[str] = None
    hamming_distance: int
    similarity_percentage: float
    is_reused_duplicate: bool
    notes: str

class VerificationStep(BaseModel):
    step_id: str
    priority: str  # immediate, recommended, optional
    title: str
    action_text: str
    why_it_matters: str

class ScoreBreakdown(BaseModel):
    text_score: int
    price_score: int
    image_score: int
    contact_score: int
    overall_score: int
    risk_tier: str  # LOW, MEDIUM, HIGH, CRITICAL

class ScanReportResponse(BaseModel):
    report_id: Optional[int] = None
    listing_id: Optional[int] = None
    created_at: datetime
    overall_score: int
    risk_tier: str
    score_breakdown: ScoreBreakdown
    summary_verdict: str
    disclaimer: str = (
        "RentShield AI provides automated heuristic risk indicators based on text patterns, "
        "sample price distributions, and perceptual image hashing. This report is NOT a legal "
        "or definitive declaration of fraud. Always conduct in-person verification and check official public records."
    )
    detected_flags: List[DetectedFlag]
    price_analysis: PriceAnalysisDetail
    image_analysis: List[ImageMatchDetail]
    recommendations: List[VerificationStep]

class ListingCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    monthly_rent: float = Field(..., gt=0)
    security_deposit: float = Field(default=0.0, ge=0)
    city: str = Field(..., min_length=2, max_length=100)
    state: Optional[str] = Field(default="", max_length=100)
    address: Optional[str] = Field(default="", max_length=255)
    bedrooms: int = Field(default=1, ge=0, le=20)
    bathrooms: float = Field(default=1.0, ge=0.0, le=20.0)
    square_feet: Optional[int] = Field(default=None, ge=50, le=50000)
    description: str = Field(..., min_length=10, max_length=10000)
    contact_email: Optional[str] = Field(default=None, max_length=255)
    contact_phone: Optional[str] = Field(default=None, max_length=50)

class ListingItemResponse(BaseModel):
    id: int
    title: str
    monthly_rent: float
    security_deposit: float
    city: str
    state: Optional[str]
    bedrooms: int
    bathrooms: float
    square_feet: Optional[int]
    description: str
    contact_email: Optional[str]
    contact_phone: Optional[str]
    is_sample: bool
    sample_tag: Optional[str]
    created_at: datetime
    latest_report: Optional[ScanReportResponse] = None

    model_config = ConfigDict(from_attributes=True)


class DashboardFlagMetric(BaseModel):
    flag_name: str
    count: int
    category: str

class DashboardStatsResponse(BaseModel):
    total_listings: int
    low_risk_count: int
    medium_risk_count: int
    high_risk_count: int
    critical_risk_count: int
    average_risk_score: float
    common_flags: List[DashboardFlagMetric]
    recent_reports: List[Dict[str, Any]]
