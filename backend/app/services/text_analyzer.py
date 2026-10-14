import re
from typing import List, Dict, Any, Tuple
from app.schemas import DetectedFlag

class TextAnalyzer:
    """
    Scans listing text (title, description, and contact info) for established
    rental fraud tropes, urgency coercion, and untraceable payment demands.
    """

    PATTERNS: List[Dict[str, Any]] = [
        # --- Critical Payment Patterns ---
        {
            "id": "WIRE_TRANSFER_DEMAND",
            "name": "Untraceable Wire Transfer Demand",
            "category": "text",
            "severity": "critical",
            "score_impact": 40,
            "description": "Requests payment via Western Union, MoneyGram, or international wire transfer. Legitimate landlords use verified bank portals or escrow agreements.",
            "regex": r"(?i)\b(western\s*union|moneygram|money\s*gram|wire\s*transfer|wire\s*the\s*money|transfer\s*via\s*wire)\b",
            "context_padding": 40
        },
        {
            "id": "GIFT_CARD_OR_CRYPTO_PAYMENT",
            "name": "Prepaid Gift Card or Crypto Payment",
            "category": "text",
            "severity": "critical",
            "score_impact": 45,
            "description": "Demands payment via cryptocurrency (Bitcoin/USDT) or retail gift cards (Apple, eBay, Vanilla Visa). This is an irreversible, high-frequency fraud mechanism.",
            "regex": r"(?i)\b(gift\s*card|apple\s*pay\s*gift|vanilla\s*visa|ebay\s*card|bitcoin|crypto|usdt|btc|prepaid\s*card)\b",
            "context_padding": 40
        },
        {
            "id": "P2P_DEPOSIT_BEFORE_VIEWING",
            "name": "Deposit Demanded Prior to Physical Viewing",
            "category": "text",
            "severity": "critical",
            "score_impact": 35,
            "description": "Insists on a deposit or holding fee via P2P apps (Zelle, CashApp, Venmo) prior to showing the property or providing a lockbox code.",
            "regex": r"(?i)\b(before\s*(viewing|tour|showing|visit|lockbox)|prior\s*to\s*(viewing|showing)|deposit\s*to\s*reserve\s*your\s*place|send\s*(a\s*)?deposit\s*(via|through|on)\s*(zelle|cashapp|venmo))\b",
            "context_padding": 50
        },

        # --- High-Risk Scam Tropes ---
        {
            "id": "OVERSEAS_MISSIONARY_TROPE",
            "name": "Landlord Abroad / Missionary / Deployment Excuse",
            "category": "text",
            "severity": "high",
            "score_impact": 30,
            "description": "Claims the landlord suddenly had to leave the country for missionary work, military deployment, UN assignment, or charity work, making in-person contact impossible.",
            "regex": r"(?i)\b(missionary|church\s*mission|relocat(ed|ion)\s*to\s*(west\s*africa|africa|europe|overseas)|currently\s*out\s*of\s*(the\s*)?country|peace\s*corps|abroad\s*for\s*work)\b",
            "context_padding": 45
        },
        {
            "id": "KEYS_MAILED_AFTER_PAYMENT",
            "name": "Keys Promised by Mail or Courier",
            "category": "text",
            "severity": "high",
            "score_impact": 30,
            "description": "Claims physical keys and paperwork will be couriered (FedEx, DHL, USPS) only after money is sent, rather than handed over in person.",
            "regex": r"(?i)\b(keys?\s*(and\s*lease)?\s*(will\s*be|are)\s*(mailed|courier(ed)?|sent\s*via\s*(fedex|dhl|usps|ups))|mail\s*you\s*the\s*keys|courier\s*the\s*keys)\b",
            "context_padding": 45
        },
        {
            "id": "EXTERIOR_DRIVEBY_ONLY",
            "name": "Exterior Viewing Only / Inability to Show Inside",
            "category": "text",
            "severity": "high",
            "score_impact": 25,
            "description": "Instructs prospective tenant to merely drive by or look through windows because the owner or agent cannot grant physical access.",
            "regex": r"(?i)\b(drive\s*by\s*(to\s*see|the)|look\s*through\s*the\s*window|cannot\s*meet\s*in\s*person|unable\s*to\s*show\s*(the\s*)?(unit|interior|apartment|in\s*person)|no\s*in-person\s*viewing)\b",
            "context_padding": 40
        },

        # --- High Urgency & Psychological Coercion ---
        {
            "id": "HIGH_PRESSURE_URGENCY",
            "name": "Artificial Urgency Tactics",
            "category": "text",
            "severity": "medium",
            "score_impact": 20,
            "description": "Pressures tenant into deciding immediately with claims that multiple competing applicants are paying right now or listing expires in hours.",
            "regex": r"(?i)\b(first\s*to\s*pay|must\s*(pay|wire|send)\s*today|act\s*fast\s*before\s*it('s|\s*is)\s*gone|urgent\s*opportunity|many\s*applicants\s*waiting|over\s*\d+\s*inquiries\s*today)\b",
            "context_padding": 40
        },
        {
            "id": "NOT_AFTER_THE_MONEY",
            "name": "Altruistic 'Not In It For The Money' Pitch",
            "category": "text",
            "severity": "medium",
            "score_impact": 20,
            "description": "Common scam opening where author claims they do not care about money, only seeking a clean/god-fearing tenant to justify ridiculously low rent.",
            "regex": r"(?i)\b(not\s*(after|in\s*it\s*for)\s*the\s*money|god\s*fearing|just\s*want\s*someone\s*to\s*take\s*care\s*of\s*(it|my\s*home)|blessed\s*home)\b",
            "context_padding": 40
        },

        # --- Communication Anomaly ---
        {
            "id": "OFF_PLATFORM_COMMUNICATION",
            "name": "Off-Platform Redirect / Do Not Call",
            "category": "text",
            "severity": "medium",
            "score_impact": 15,
            "description": "Instructs users to avoid standard portal communications, phone calls, or directs exclusively to encrypted messaging apps like WhatsApp or Telegram.",
            "regex": r"(?i)\b(whatsapp\s*only|text\s*me\s*on\s*whatsapp|telegram\s*only|do\s*not\s*call\b.*whatsapp|reach\s*me\s*only\s*on)\b",
            "context_padding": 40
        },
        {
            "id": "DISPOSABLE_CONTACT_DOMAIN",
            "name": "Suspicious Temporary Email Domain",
            "category": "contact",
            "severity": "medium",
            "score_impact": 15,
            "description": "Listing contact utilizes an anonymous, temporary, or suspicious email provider.",
            "regex": r"(?i)@(temporary-mail|throwaway|tempmail|guerrillamail|10minutemail|sharklasers)\b",
            "context_padding": 30
        }
    ]

    def analyze(self, title: str, description: str, contact_email: str = "", contact_phone: str = "") -> Tuple[int, List[DetectedFlag]]:
        full_text = f"{title}\n{description}\n{contact_email} {contact_phone}"
        detected_flags: List[DetectedFlag] = []
        accumulated_score = 0

        for pattern in self.PATTERNS:
            match = re.search(pattern["regex"], full_text)
            if match:
                # Extract surrounding snippet
                start = max(0, match.start() - pattern.get("context_padding", 30))
                end = min(len(full_text), match.end() + pattern.get("context_padding", 30))
                snippet = full_text[start:end].replace("\n", " ").strip()
                if start > 0:
                    snippet = "..." + snippet
                if end < len(full_text):
                    snippet = snippet + "..."

                flag = DetectedFlag(
                    indicator_id=pattern["id"],
                    category=pattern["category"],
                    name=pattern["name"],
                    severity=pattern["severity"],
                    score_impact=pattern["score_impact"],
                    description=pattern["description"],
                    matched_snippet=snippet
                )
                detected_flags.append(flag)
                accumulated_score += pattern["score_impact"]

        # Cap text risk score at 100
        text_score = min(100, accumulated_score)
        return text_score, detected_flags

text_analyzer = TextAnalyzer()
