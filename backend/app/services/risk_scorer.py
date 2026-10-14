from typing import List, Dict, Any, Tuple
from app.schemas import (
    DetectedFlag,
    PriceAnalysisDetail,
    ImageMatchDetail,
    ScoreBreakdown,
    VerificationStep,
    ScanReportResponse
)

class RiskScorer:
    """
    Synthesizes signals from text analysis, pricing anomalies, image hashing,
    and contact vectors into an explainable composite risk score.
    """

    def compute_risk(
        self,
        text_score: int,
        price_score: int,
        image_score: int,
        contact_score: int,
        detected_flags: List[DetectedFlag],
        price_analysis: PriceAnalysisDetail,
        image_matches: List[ImageMatchDetail]
    ) -> Tuple[int, str, str, List[VerificationStep]]:
        """
        Calculates composite score (0-100), risk tier, human summary verdict,
        and targeted verification checklist.
        """
        # Weighted composite base score
        weighted_score = (
            (text_score * 0.40) +
            (price_score * 0.35) +
            (image_score * 0.20) +
            (contact_score * 0.05)
        )

        has_critical_flag = any(f.severity == "critical" for f in detected_flags)
        has_high_flag = any(f.severity == "high" for f in detected_flags)
        critical_count = sum(1 for f in detected_flags if f.severity == "critical")
        high_count = sum(1 for f in detected_flags if f.severity == "high")

        final_score = int(round(weighted_score))

        # Escalation rules for classic scam signatures
        if critical_count >= 2:
            final_score = max(final_score, 88)
        elif has_critical_flag and (price_analysis.is_anomaly or image_score > 0):
            final_score = max(final_score, 82)
        elif has_critical_flag:
            final_score = max(final_score, 68)
        elif high_count >= 2:
            final_score = max(final_score, 58)

        final_score = max(0, min(100, final_score))

        # Determine Tier
        if final_score >= 75:
            risk_tier = "CRITICAL"
        elif final_score >= 50:
            risk_tier = "HIGH"
        elif final_score >= 25:
            risk_tier = "MEDIUM"
        else:
            risk_tier = "LOW"

        # Generate human-readable explainable verdict
        verdict = self._generate_verdict(
            final_score,
            risk_tier,
            detected_flags,
            price_analysis,
            image_matches
        )

        # Generate targeted verification checklist
        checklist = self._generate_checklist(
            risk_tier,
            detected_flags,
            price_analysis,
            image_matches
        )

        return final_score, risk_tier, verdict, checklist

    def _generate_verdict(
        self,
        score: int,
        tier: str,
        flags: List[DetectedFlag],
        price: PriceAnalysisDetail,
        images: List[ImageMatchDetail]
    ) -> str:
        if tier == "CRITICAL":
            reasons = [f.name for f in flags if f.severity in ("critical", "high")]
            return (
                f"CRITICAL RISK (Score {score}/100): High likelihood of a rental scam. "
                f"Primary triggers include: {', '.join(reasons[:3])}. "
                "Do NOT transfer any money, deposit, or personal financial details."
            )
        elif tier == "HIGH":
            return (
                f"HIGH RISK (Score {score}/100): Significant scam indicators identified. "
                f"{len(flags)} risk factors were detected, particularly around payment or pricing anomalies. "
                "Strict physical verification of landlord identity is required before proceeding."
            )
        elif tier == "MEDIUM":
            return (
                f"ELEVATED RISK (Score {score}/100): Some suspicious attributes were flagged, "
                "such as unusual contact methods or below-average rent. Proceed with standard caution."
            )
        else:
            return (
                f"LOW RISK (Score {score}/100): No prominent scam tropes or extreme anomalies detected. "
                "Listing appears consistent with normal market patterns. Standard leasing precautions still apply."
            )

    def _generate_checklist(
        self,
        tier: str,
        flags: List[DetectedFlag],
        price: PriceAnalysisDetail,
        images: List[ImageMatchDetail]
    ) -> List[VerificationStep]:
        steps: List[VerificationStep] = []

        # Check for payment flags
        has_wire_or_deposit_flag = any("WIRE" in f.indicator_id or "DEPOSIT" in f.indicator_id for f in flags)
        if has_wire_or_deposit_flag or tier in ("HIGH", "CRITICAL"):
            steps.append(VerificationStep(
                step_id="CHECK_PAYMENT_SAFETY",
                priority="immediate",
                title="Never Send Funds Sight-Unseen",
                action_text="Refuse wire transfers, Zelle, CashApp, or gift card deposits before touring the physical property and meeting the verified manager.",
                why_it_matters="Once sent via wire or P2P apps, stolen funds are essentially non-recoverable."
            ))

        # Check for price anomalies
        if price.is_anomaly:
            steps.append(VerificationStep(
                step_id="CHECK_COUNTY_ASSESSOR",
                priority="immediate",
                title="Check County Property Assessor Records",
                action_text=f"Visit the official {price.city} / County Property Appraiser website and verify that the contact person's name matches the registered deed owner.",
                why_it_matters="Scammers hijack real addresses and pretend to be owners or remote property managers."
            ))

        # Check for duplicate image matches
        has_duplicate_images = any(img.is_reused_duplicate for img in images)
        if has_duplicate_images or tier in ("HIGH", "CRITICAL"):
            steps.append(VerificationStep(
                step_id="CHECK_REVERSE_IMAGE",
                priority="recommended",
                title="Perform Reverse Image Search",
                action_text="Upload listing photos to Google Lens or TinEye to check if they belong to an active Airbnb, MLS sale listing, or hotel.",
                why_it_matters="Fraudsters frequently download photos from luxury home sales or vacation rentals to create fake discount leases."
            ))

        # Check in-person walkthrough
        steps.append(VerificationStep(
            step_id="CHECK_IN_PERSON_TOUR",
            priority="recommended",
            title="Insist on Inside Walkthrough with Key Demo",
            action_text="Never accept lockbox codes from strangers or drive-by exterior viewings. Require the landlord or licensed broker to unlock the front door in person.",
            why_it_matters="Scammers cannot grant interior physical access unless using fraudulent short-term codes."
        ))

        # Verify lease agreement
        steps.append(VerificationStep(
            step_id="CHECK_WRITTEN_LEASE",
            priority="optional",
            title="Inspect Written Lease & Identification",
            action_text="Ask for government-issued photo ID and confirm utility or tax statements corresponding to the rental address before signing.",
            why_it_matters="Ensures the individual executing the contract has legal authority to lease the property."
        ))

        return steps

risk_scorer = RiskScorer()
