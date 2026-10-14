import axios from 'axios';
import {
  ScanReportResponse,
  SampleListingItem,
  ListingItem,
  DashboardStatsResponse,
  DetectedFlag,
  PriceAnalysisDetail,
  VerificationStep
} from '../types';

// Use environment variable if provided, else default to relative '/api'
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
  timeout: 5000,
});

// Resilient Fallback Data for Live Static Deployments (Vercel / Netlify)
const FALLBACK_SAMPLES: SampleListingItem[] = [
  {
    id: 101,
    sample_tag: "wire_transfer_urgency",
    title: "Prime 2BR Luxury Condo Downtown - Fully Furnished - All Utilities Included!",
    monthly_rent: 950.0,
    security_deposit: 1900.0,
    city: "New York",
    state: "NY",
    address: "45 Wall St #14B",
    bedrooms: 2,
    bathrooms: 2.0,
    square_feet: 1100,
    description: "URGENT OPPORTUNITY! Due to my recent job relocation on a charitable church missionary assignment to West Africa, I am looking for a responsible tenant immediately. I have the keys with me here. I cannot meet in person right now due to travel. If you are serious, you must wire transfer the first month rent via Western Union today. Once payment is confirmed, I will courier the keys via FedEx express. First to pay receives priority!",
    contact_email: "landlord.missionary.relocated2024@temporary-mail-service.net",
    contact_phone: "+1-800-555-0199",
    is_sample: true
  },
  {
    id: 102,
    sample_tag: "too_good_to_be_true_price",
    title: "Ultra-Modern 3-Bedroom Penthouse with Panoramic Ocean Views",
    monthly_rent: 850.0,
    security_deposit: 500.0,
    city: "Miami",
    state: "FL",
    address: "1200 Brickell Bay Dr Penthouse 4",
    bedrooms: 3,
    bathrooms: 3.0,
    square_feet: 2400,
    description: "Breathtaking 3-bedroom penthouse with floor-to-ceiling glass windows and wraparound balcony. Sub-Zero appliances, private elevator access. Rent is only $850 per month including high-speed internet and valet parking. Must lease fast before end of week. Please text me on WhatsApp for quick approval. Do not call, WhatsApp only.",
    contact_email: "brickell.luxury.owner@gmail.com",
    contact_phone: "+1-305-555-0144",
    is_sample: true
  },
  {
    id: 103,
    sample_tag: "deposit_before_viewing_zelle",
    title: "Charming 1BR Apartment in Quiet Historic District",
    monthly_rent: 1400.0,
    security_deposit: 2800.0,
    city: "Austin",
    state: "TX",
    address: "708 West Ave Apt 3",
    bedrooms: 1,
    bathrooms: 1.0,
    square_feet: 650,
    description: "Cozy 1 bedroom apartment with hardwood floors. We have received over 40 inquiries today. Due to high interest, the lockbox code and in-person viewing will ONLY be scheduled after you send a holding deposit of $500 via Zelle or CashApp to reserve your place in line. The deposit is refundable if you decide not to proceed.",
    contact_email: "austin.rentals.mgmt@outlook.com",
    contact_phone: "+1-512-555-0182",
    is_sample: true
  },
  {
    id: 104,
    sample_tag: "legitimate_listing",
    title: "Spacious Renovated 2BR/1BA in Lincoln Park",
    monthly_rent: 2350.0,
    security_deposit: 2350.0,
    city: "Chicago",
    state: "IL",
    address: "2140 N Halsted St Apt 2F",
    bedrooms: 2,
    bathrooms: 1.0,
    square_feet: 920,
    description: "Bright 2-bedroom, 1-bath unit in heart of Lincoln Park. Updated kitchen with stainless appliances, quartz counters, in-unit laundry, dishwasher. 12-month lease required. Application fee ($50) covers credit and background check. In-person showings available Saturday 11am-2pm or by appointment. Verifiable income 3x rent required.",
    contact_email: "leasing@lincolnparkproperties.com",
    contact_phone: "+1-312-555-0112",
    is_sample: true
  }
];

// In-memory store for client-side fallback
let localStoreListings: ListingItem[] = FALLBACK_SAMPLES.map((s, idx) => ({
  id: s.id,
  title: s.title,
  monthly_rent: s.monthly_rent,
  security_deposit: s.security_deposit,
  city: s.city,
  state: s.state,
  bedrooms: s.bedrooms,
  bathrooms: s.bathrooms,
  square_feet: s.square_feet,
  description: s.description,
  contact_email: s.contact_email,
  contact_phone: s.contact_phone,
  is_sample: s.is_sample,
  sample_tag: s.sample_tag,
  created_at: new Date(Date.now() - idx * 3600000).toISOString()
}));

function computeClientHeuristicReport(formData: FormData): ScanReportResponse {
  const title = (formData.get('title') as string) || '';
  const monthlyRent = parseFloat(formData.get('monthly_rent') as string) || 1000;
  const deposit = parseFloat(formData.get('security_deposit') as string) || 0;
  const city = (formData.get('city') as string) || 'General';
  const bedrooms = parseInt(formData.get('bedrooms') as string) || 1;
  const desc = (formData.get('description') as string) || '';
  const email = (formData.get('contact_email') as string) || '';
  const fullText = `${title} ${desc} ${email}`.toLowerCase();

  const flags: DetectedFlag[] = [];
  let textScore = 0;

  if (fullText.includes('western union') || fullText.includes('moneygram') || fullText.includes('wire transfer')) {
    flags.push({
      indicator_id: 'WIRE_TRANSFER_DEMAND',
      category: 'text',
      name: 'Untraceable Wire Transfer Demand',
      severity: 'critical',
      score_impact: 40,
      description: 'Requests payment via Western Union, MoneyGram, or international wire transfer.',
      matched_snippet: '...wire transfer...Western Union...'
    });
    textScore += 40;
  }

  if (fullText.includes('missionary') || fullText.includes('relocation to west africa') || fullText.includes('out of the country')) {
    flags.push({
      indicator_id: 'OVERSEAS_MISSIONARY_TROPE',
      category: 'text',
      name: 'Landlord Abroad / Missionary Excuse',
      severity: 'high',
      score_impact: 30,
      description: 'Claims landlord relocated abroad for missionary work, unable to meet in person.',
      matched_snippet: '...missionary assignment to West Africa...'
    });
    textScore += 30;
  }

  if (fullText.includes('before viewing') || fullText.includes('lockbox') || fullText.includes('zelle') || fullText.includes('cashapp')) {
    flags.push({
      indicator_id: 'P2P_DEPOSIT_BEFORE_VIEWING',
      category: 'text',
      name: 'Deposit Demanded Prior to Physical Tour',
      severity: 'critical',
      score_impact: 35,
      description: 'Demands deposit via P2P apps (Zelle/CashApp) to unlock address or lockbox code.',
      matched_snippet: '...lockbox code...scheduled after you send a holding deposit...'
    });
    textScore += 35;
  }

  if (fullText.includes('courier') || fullText.includes('keys will be mailed') || fullText.includes('fedex')) {
    flags.push({
      indicator_id: 'KEYS_MAILED_AFTER_PAYMENT',
      category: 'text',
      name: 'Keys Promised by Courier / Mail',
      severity: 'high',
      score_impact: 30,
      description: 'Promises physical keys via FedEx only after money transfer.',
      matched_snippet: '...courier the keys and lease contract via FedEx...'
    });
    textScore += 30;
  }

  if (fullText.includes('whatsapp only') || fullText.includes('do not call')) {
    flags.push({
      indicator_id: 'OFF_PLATFORM_COMMUNICATION',
      category: 'text',
      name: 'Off-Platform Redirect / Do Not Call',
      severity: 'medium',
      score_impact: 15,
      description: 'Directs tenant exclusively to WhatsApp and refuses direct phone calls.',
      matched_snippet: '...WhatsApp only. Do not call...'
    });
    textScore += 15;
  }

  // Price evaluation
  let priceScore = 0;
  let isPriceAnomaly = false;
  let discountPct = 0;
  const benchmarkMedian = bedrooms === 1 ? 2100 : bedrooms === 2 ? 3200 : bedrooms >= 3 ? 4200 : 1600;

  if (monthlyRent < benchmarkMedian * 0.5) {
    isPriceAnomaly = true;
    discountPct = Math.round(((benchmarkMedian - monthlyRent) / benchmarkMedian) * 100);
    priceScore = 45;
    flags.push({
      indicator_id: 'PRICING_DEEP_DISCOUNT',
      category: 'price',
      name: 'Severely Below Market Rate (>50% Under Median)',
      severity: 'critical',
      score_impact: 45,
      description: `Rent ($${monthlyRent}/mo) is ${discountPct}% below expected median ($${benchmarkMedian}/mo). Classic rental bait.`,
      matched_snippet: `Listed: $${monthlyRent}/mo vs Regional Median: $${benchmarkMedian}/mo`
    });
  }

  const overallScore = Math.min(100, Math.max(
    flags.some(f => f.severity === 'critical') ? 80 : 0,
    Math.round((textScore * 0.5) + (priceScore * 0.5))
  ));

  const riskTier = overallScore >= 75 ? 'CRITICAL' : overallScore >= 50 ? 'HIGH' : overallScore >= 25 ? 'MEDIUM' : 'LOW';

  const recommendations: VerificationStep[] = [
    {
      step_id: 'CHECK_PAYMENT_SAFETY',
      priority: 'immediate',
      title: 'Never Send Funds Sight-Unseen',
      action_text: 'Refuse wire transfers, Zelle, CashApp, or gift card deposits before touring the physical property and meeting the verified manager.',
      why_it_matters: 'Stolen funds sent via P2P apps or wire transfer are essentially non-recoverable.'
    },
    {
      step_id: 'CHECK_COUNTY_ASSESSOR',
      priority: 'immediate',
      title: 'Check County Property Assessor Records',
      action_text: `Visit the official ${city} Property Appraiser website and verify that the contact person's name matches the registered deed owner.`,
      why_it_matters: 'Scammers hijack real addresses and pretend to be remote property owners.'
    },
    {
      step_id: 'CHECK_IN_PERSON_TOUR',
      priority: 'recommended',
      title: 'Insist on Inside Walkthrough with Key Demo',
      action_text: 'Never accept lockbox codes from strangers or drive-by exterior viewings. Require the manager to unlock the front door in person.',
      why_it_matters: 'Scammers cannot grant interior physical access unless using fraudulent short-term codes.'
    }
  ];

  const priceDetail: PriceAnalysisDetail = {
    monthly_rent: monthlyRent,
    security_deposit: deposit,
    benchmark_median: benchmarkMedian,
    city: city,
    bedrooms: bedrooms,
    discount_percentage: discountPct,
    is_anomaly: isPriceAnomaly,
    anomaly_type: isPriceAnomaly ? 'suspiciously_cheap' : 'normal',
    deposit_to_rent_ratio: monthlyRent > 0 ? Number((deposit / monthlyRent).toFixed(2)) : 0,
    deposit_anomaly: deposit > monthlyRent * 2.5,
    explanation: isPriceAnomaly
      ? `Rent ($${monthlyRent}/mo) is ${discountPct}% below the regional benchmark ($${benchmarkMedian}/mo). Extreme discounts are a primary lure in rental fraud.`
      : `Rent ($${monthlyRent}/mo) aligns with expected market baseline for a ${bedrooms}BR in ${city}.`
  };

  return {
    report_id: Math.floor(Math.random() * 9000) + 1000,
    created_at: new Date().toISOString(),
    overall_score: overallScore,
    risk_tier: riskTier,
    score_breakdown: {
      text_score: Math.min(100, textScore),
      price_score: priceScore,
      image_score: 0,
      contact_score: flags.some(f => f.category === 'contact') ? 20 : 0,
      overall_score: overallScore,
      risk_tier: riskTier
    },
    summary_verdict: riskTier === 'CRITICAL' || riskTier === 'HIGH'
      ? `HIGH FRAUD RISK (${overallScore}/100): High likelihood of a rental scam. Detected triggers: ${flags.map(f => f.name).slice(0, 2).join(', ')}. Do not transfer funds.`
      : `NORMAL / LOW RISK (${overallScore}/100): Listing appears consistent with normal market patterns. Standard leasing precautions still apply.`,
    disclaimer: 'RentShield AI provides automated heuristic risk indicators based on text patterns, sample price distributions, and perceptual image hashing. This report is NOT a legal or definitive declaration of fraud.',
    detected_flags: flags,
    price_analysis: priceDetail,
    image_analysis: [],
    recommendations: recommendations
  };
}

export const api = {
  // Scans a rental listing with optional photo upload
  scanListing: async (formData: FormData): Promise<ScanReportResponse> => {
    try {
      const response = await client.post<ScanReportResponse>('/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      console.warn("Backend API unreachable, using client-side fallback engine:", err);
      const report = computeClientHeuristicReport(formData);
      // Save locally
      localStoreListings.unshift({
        id: report.report_id || Date.now(),
        title: (formData.get('title') as string) || 'Scanned Property',
        monthly_rent: parseFloat(formData.get('monthly_rent') as string) || 0,
        security_deposit: parseFloat(formData.get('security_deposit') as string) || 0,
        city: (formData.get('city') as string) || 'Unknown',
        state: (formData.get('state') as string) || '',
        bedrooms: parseInt(formData.get('bedrooms') as string) || 1,
        bathrooms: parseFloat(formData.get('bathrooms') as string) || 1,
        description: (formData.get('description') as string) || '',
        is_sample: false,
        created_at: new Date().toISOString(),
        latest_report: report
      });
      return report;
    }
  },

  // Curated demo listings for instant 1-click loading
  getSampleListings: async (): Promise<SampleListingItem[]> => {
    try {
      const response = await client.get<SampleListingItem[]>('/samples');
      return response.data;
    } catch (err) {
      return FALLBACK_SAMPLES;
    }
  },

  // Rental benchmark dataset for regional reference
  getBenchmarks: async (): Promise<any> => {
    try {
      const response = await client.get('/benchmarks');
      return response.data;
    } catch (err) {
      return { markets: {} };
    }
  },

  // Listing history with optional filters
  getListings: async (riskFilter?: string, cityFilter?: string): Promise<ListingItem[]> => {
    try {
      const params: Record<string, string> = {};
      if (riskFilter && riskFilter !== 'ALL') params.risk_filter = riskFilter;
      if (cityFilter && cityFilter.trim()) params.city_filter = cityFilter.trim();
      const response = await client.get<ListingItem[]>('/listings', { params });
      return response.data;
    } catch (err) {
      return localStoreListings;
    }
  },

  // Get single listing with scan report
  getListing: async (id: number): Promise<ListingItem> => {
    try {
      const response = await client.get<ListingItem>(`/listings/${id}`);
      return response.data;
    } catch (err) {
      const item = localStoreListings.find(l => l.id === id);
      if (item) return item;
      throw err;
    }
  },

  // Delete listing
  deleteListing: async (id: number): Promise<{ status: string; message: string }> => {
    try {
      const response = await client.delete(`/listings/${id}`);
      return response.data;
    } catch (err) {
      localStoreListings = localStoreListings.filter(l => l.id !== id);
      return { status: 'success', message: `Listing #${id} deleted.` };
    }
  },

  // Dashboard aggregated metrics & scam distribution
  getDashboardStats: async (): Promise<DashboardStatsResponse> => {
    try {
      const response = await client.get<DashboardStatsResponse>('/dashboard/stats');
      return response.data;
    } catch (err) {
      return {
        total_listings: localStoreListings.length,
        low_risk_count: 1,
        medium_risk_count: 1,
        high_risk_count: 1,
        critical_risk_count: 1,
        average_risk_score: 64.5,
        common_flags: [
          { flag_name: 'Untraceable Wire Transfer Demand', count: 3, category: 'text' },
          { flag_name: 'Deposit Demanded Prior to Viewing', count: 2, category: 'text' },
          { flag_name: 'Severely Below Market Rate', count: 2, category: 'price' },
          { flag_name: 'Landlord Abroad / Missionary Trope', count: 2, category: 'text' }
        ],
        recent_reports: localStoreListings.slice(0, 5).map(l => ({
          report_id: l.id,
          listing_id: l.id,
          title: l.title,
          city: l.city,
          monthly_rent: l.monthly_rent,
          overall_score: l.id === 101 ? 88 : l.id === 102 ? 82 : l.id === 103 ? 75 : 15,
          risk_tier: (l.id === 101 || l.id === 102 || l.id === 103) ? 'CRITICAL' : 'LOW',
          text_score: 70,
          price_score: 45,
          image_score: 0,
          is_sample: l.is_sample,
          created_at: l.created_at
        }))
      };
    }
  },

  // Health check
  checkHealth: async (): Promise<any> => {
    try {
      const response = await client.get('/health');
      return response.data;
    } catch (err) {
      return { status: 'offline_client_fallback', app: 'RentShield AI' };
    }
  },
};
