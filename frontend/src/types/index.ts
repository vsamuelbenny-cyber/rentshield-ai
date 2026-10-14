export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DetectedFlag {
  indicator_id: string;
  category: 'text' | 'price' | 'image' | 'contact';
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  score_impact: number;
  description: string;
  matched_snippet?: string;
}

export interface PriceAnalysisDetail {
  monthly_rent: number;
  security_deposit: number;
  benchmark_median?: number;
  benchmark_min?: number;
  benchmark_max?: number;
  benchmark_std?: number;
  city: string;
  bedrooms: number;
  discount_percentage?: number;
  z_score?: number;
  is_anomaly: boolean;
  anomaly_type?: 'suspiciously_cheap' | 'excessively_high' | 'normal' | 'insufficient_data';
  deposit_to_rent_ratio?: number;
  deposit_anomaly: boolean;
  explanation: string;
}

export interface ImageMatchDetail {
  uploaded_image: string;
  perceptual_hash: string;
  matched_listing_id?: number;
  matched_listing_title?: string;
  matched_listing_city?: string;
  hamming_distance: number;
  similarity_percentage: number;
  is_reused_duplicate: boolean;
  notes: string;
}

export interface VerificationStep {
  step_id: string;
  priority: 'immediate' | 'recommended' | 'optional';
  title: string;
  action_text: string;
  why_it_matters: string;
}

export interface ScoreBreakdown {
  text_score: number;
  price_score: number;
  image_score: number;
  contact_score: number;
  overall_score: number;
  risk_tier: RiskTier;
}

export interface ScanReportResponse {
  report_id?: number;
  listing_id?: number;
  created_at: string;
  overall_score: number;
  risk_tier: RiskTier;
  score_breakdown: ScoreBreakdown;
  summary_verdict: string;
  disclaimer: string;
  detected_flags: DetectedFlag[];
  price_analysis: PriceAnalysisDetail;
  image_analysis: ImageMatchDetail[];
  recommendations: VerificationStep[];
}

export interface ListingItem {
  id: number;
  title: string;
  monthly_rent: number;
  security_deposit: number;
  city: string;
  state?: string;
  bedrooms: number;
  bathrooms: number;
  square_feet?: number;
  description: string;
  contact_email?: string;
  contact_phone?: string;
  is_sample: boolean;
  sample_tag?: string;
  created_at: string;
  latest_report?: ScanReportResponse;
}

export interface SampleListingItem {
  id: number;
  sample_tag: string;
  title: string;
  monthly_rent: number;
  security_deposit: number;
  city: string;
  state?: string;
  address?: string;
  bedrooms: number;
  bathrooms: number;
  square_feet?: number;
  description: string;
  contact_email?: string;
  contact_phone?: string;
  is_sample: boolean;
}

export interface DashboardFlagMetric {
  flag_name: string;
  count: number;
  category: string;
}

export interface RecentReportSummary {
  report_id: number;
  listing_id: number;
  title: string;
  city: string;
  monthly_rent: number;
  overall_score: number;
  risk_tier: RiskTier;
  text_score: number;
  price_score: number;
  image_score: number;
  is_sample: boolean;
  created_at: string;
}

export interface DashboardStatsResponse {
  total_listings: number;
  low_risk_count: number;
  medium_risk_count: number;
  high_risk_count: number;
  critical_risk_count: number;
  average_risk_score: number;
  common_flags: DashboardFlagMetric[];
  recent_reports: RecentReportSummary[];
}
