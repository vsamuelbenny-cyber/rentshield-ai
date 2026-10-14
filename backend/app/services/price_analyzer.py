import json
from pathlib import Path
from typing import Tuple, List, Optional
from app.config import DATA_DIR
from app.schemas import PriceAnalysisDetail, DetectedFlag

class PriceAnalyzer:
    """
    Evaluates rental price against regional market benchmarks and bedroom counts
    to identify statistically anomalous pricing lures.
    """

    def __init__(self, data_path: Optional[Path] = None):
        self.data_path = data_path or (DATA_DIR / "benchmark_rents.json")
        self.benchmarks = self._load_benchmarks()

    def _load_benchmarks(self) -> dict:
        try:
            with open(self.data_path, "r", encoding="utf-8") as f:
                return json.load(f).get("markets", {})
        except Exception:
            return {}

    def _normalize_city(self, city: str) -> str:
        clean = city.lower().strip()
        # Remove common state abbreviations like "Austin, TX" -> "austin"
        clean = clean.split(",")[0].strip()
        return clean

    def analyze(
        self,
        city: str,
        bedrooms: int,
        monthly_rent: float,
        security_deposit: float = 0.0
    ) -> Tuple[int, PriceAnalysisDetail, List[DetectedFlag]]:
        normalized_city = self._normalize_city(city)
        market_data = self.benchmarks.get(normalized_city)
        is_fallback = False

        if not market_data:
            # Try finding if city substring exists
            for key, val in self.benchmarks.items():
                if key in normalized_city or normalized_city in key:
                    market_data = val
                    break

        if not market_data:
            market_data = self.benchmarks.get("default_national", {})
            is_fallback = True

        bed_key = str(min(max(0, bedrooms), 4))
        bed_stats = market_data.get("bedrooms", {}).get(bed_key)

        flags: List[DetectedFlag] = []
        price_score = 0

        if not bed_stats:
            detail = PriceAnalysisDetail(
                monthly_rent=monthly_rent,
                security_deposit=security_deposit,
                city=city,
                bedrooms=bedrooms,
                is_anomaly=False,
                anomaly_type="insufficient_data",
                explanation="No benchmark baseline available for this specific bedroom count."
            )
            return 0, detail, []

        median = float(bed_stats["median"])
        std = float(bed_stats["std"])
        min_exp = float(bed_stats["min_expected"])
        max_exp = float(bed_stats["max_expected"])

        discount_pct = round(((median - monthly_rent) / median) * 100, 1)
        z_score = round((monthly_rent - median) / std, 2)

        deposit_ratio = round(security_deposit / monthly_rent, 2) if monthly_rent > 0 else 0.0
        deposit_anomaly = False

        anomaly_type = "normal"
        explanation = f"Rent (${monthly_rent:,.0f}/mo) is within the expected regional distribution for a {bedrooms}-bedroom (median: ${median:,.0f}/mo)."

        # Check for suspiciously cheap rent (Classic scam bait)
        if discount_pct >= 55 or z_score <= -2.5:
            anomaly_type = "suspiciously_cheap"
            price_score += 45
            explanation = (
                f"HIGH SEVERITY ANOMALY: Advertised rent of ${monthly_rent:,.0f} is {discount_pct}% "
                f"below the median price (${median:,.0f}) for {bedrooms}BR in {city}. "
                f"Scammers frequently advertise luxury properties at steep discounts to attract desperate renters."
            )
            flags.append(DetectedFlag(
                indicator_id="PRICING_DEEP_DISCOUNT",
                category="price",
                name="Severely Below Market Rate (>55% Under Median)",
                severity="critical" if discount_pct >= 65 else "high",
                score_impact=45,
                description=f"Rent is {discount_pct}% lower than the regional median (${median:,.0f}/mo). Extreme discounts are the #1 hook for fake lease scams.",
                matched_snippet=f"Listed: ${monthly_rent:,.0f}/mo vs Expected: ${median:,.0f}/mo (Z-Score: {z_score})"
            ))
        elif discount_pct >= 35 or z_score <= -1.8:
            anomaly_type = "suspiciously_cheap"
            price_score += 25
            explanation = (
                f"MODERATE ANOMALY: Advertised rent of ${monthly_rent:,.0f} is {discount_pct}% "
                f"below the median for {bedrooms}BR in {city} (median: ${median:,.0f}). Requires extra diligence."
            )
            flags.append(DetectedFlag(
                indicator_id="PRICING_MODERATE_DISCOUNT",
                category="price",
                name="Significantly Below Market Rate (35-55% Under Median)",
                severity="medium",
                score_impact=25,
                description=f"Rent is {discount_pct}% below market average. Ensure physical inspection before paying any deposits.",
                matched_snippet=f"Listed: ${monthly_rent:,.0f}/mo vs Expected: ${median:,.0f}/mo"
            ))

        # Check deposit ratio anomalies
        if security_deposit > 0:
            if deposit_ratio > 2.5:
                deposit_anomaly = True
                price_score += 15
                flags.append(DetectedFlag(
                    indicator_id="DEPOSIT_EXCESSIVE",
                    category="price",
                    name="Excessive Security Deposit Ratio",
                    severity="medium",
                    score_impact=15,
                    description=f"Security deposit (${security_deposit:,.0f}) is {deposit_ratio:.1f}x the monthly rent. Standard deposits rarely exceed 1.5x - 2x rent.",
                    matched_snippet=f"Deposit: ${security_deposit:,.0f} ({deposit_ratio:.1f}x rent)"
                ))

        if is_fallback:
            explanation += " (Note: Assessed against national baseline due to lack of municipal submarket data)."

        price_score = min(100, price_score)

        detail = PriceAnalysisDetail(
            monthly_rent=monthly_rent,
            security_deposit=security_deposit,
            benchmark_median=median,
            benchmark_min=min_exp,
            benchmark_max=max_exp,
            benchmark_std=std,
            city=city,
            bedrooms=bedrooms,
            discount_percentage=discount_pct,
            z_score=z_score,
            is_anomaly=(anomaly_type != "normal"),
            anomaly_type=anomaly_type,
            deposit_to_rent_ratio=deposit_ratio,
            deposit_anomaly=deposit_anomaly,
            explanation=explanation
        )

        return price_score, detail, flags

price_analyzer = PriceAnalyzer()
