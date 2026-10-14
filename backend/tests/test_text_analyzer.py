import pytest
from app.services.text_analyzer import TextAnalyzer

@pytest.fixture
def analyzer():
    return TextAnalyzer()

def test_detect_wire_transfer_and_overseas_trope(analyzer):
    title = "Luxury 2BR Apt for Rent"
    desc = (
        "I was recently called on a church missionary assignment to West Africa. "
        "I need someone to take good care of my home. Please wire transfer the first month rent "
        "via Western Union and I will courier the keys via FedEx next day."
    )
    score, flags = analyzer.analyze(title, desc)
    flag_ids = [f.indicator_id for f in flags]

    assert "WIRE_TRANSFER_DEMAND" in flag_ids
    assert "OVERSEAS_MISSIONARY_TROPE" in flag_ids
    assert "KEYS_MAILED_AFTER_PAYMENT" in flag_ids
    assert score >= 70

def test_detect_deposit_before_viewing_zelle(analyzer):
    title = "Cozy Studio in Austin"
    desc = "Due to high demand, lockbox code will only be provided after you send a deposit via Zelle."
    score, flags = analyzer.analyze(title, desc)
    flag_ids = [f.indicator_id for f in flags]

    assert "P2P_DEPOSIT_BEFORE_VIEWING" in flag_ids
    assert score >= 35

def test_legitimate_listing_text(analyzer):
    title = "Updated 2BR/1BA in Lincoln Park"
    desc = (
        "Clean, modern 2 bedroom apartment. Hardwood floors, stainless steel appliances, "
        "in-unit laundry. 12 month lease required. In-person showings available this Saturday. "
        "Standard application fee covers credit check."
    )
    score, flags = analyzer.analyze(title, desc)
    assert score == 0
    assert len(flags) == 0

def test_disposable_email_detection(analyzer):
    title = "1BR Apt"
    desc = "Standard apartment for rent."
    score, flags = analyzer.analyze(title, desc, contact_email="scammer123@throwaway.com")
    flag_ids = [f.indicator_id for f in flags]
    assert "DISPOSABLE_CONTACT_DOMAIN" in flag_ids
