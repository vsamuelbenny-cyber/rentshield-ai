import uuid
from pathlib import Path
from typing import List, Tuple, Optional
from PIL import Image
import imagehash
from sqlalchemy.orm import Session

from app.config import settings
from app.models import ListingImage, Listing
from app.schemas import ImageMatchDetail, DetectedFlag

class ImageAnalyzer:
    """
    Computes perceptual hashes (pHash) on listing photos and scans the database
    for identical or visually similar images across different listings.
    """

    def compute_phash(self, image: Image.Image) -> str:
        """Computes 64-bit perceptual hash represented as 16-hex char string."""
        h = imagehash.phash(image)
        return str(h)

    def save_and_hash_image(
        self,
        image: Image.Image,
        original_filename: str
    ) -> Tuple[str, str]:
        """
        Saves image to uploads folder and returns (saved_filename, perceptual_hash).
        """
        file_id = uuid.uuid4().hex
        ext = Path(original_filename).suffix.lower() or ".jpg"
        saved_filename = f"{file_id}{ext}"
        save_path = settings.upload_dir / saved_filename

        # Save sanitized RGB image
        image.save(save_path, "JPEG", quality=85, optimize=True)
        phash_str = self.compute_phash(image)
        return saved_filename, phash_str

    def check_for_duplicates(
        self,
        db: Session,
        phash_str: str,
        current_listing_id: Optional[int] = None,
        image_label: str = "upload"
    ) -> Tuple[List[ImageMatchDetail], List[DetectedFlag]]:
        """
        Compares hash against all known listing images in database using Hamming distance.
        """
        matches: List[ImageMatchDetail] = []
        flags: List[DetectedFlag] = []

        try:
            target_hash = imagehash.hex_to_hash(phash_str)
        except Exception:
            return matches, flags

        # Query all existing images
        query = db.query(ListingImage)
        if current_listing_id:
            query = query.filter(ListingImage.listing_id != current_listing_id)
        existing_images = query.all()

        best_match = None
        min_distance = 64

        for img in existing_images:
            try:
                candidate_hash = imagehash.hex_to_hash(img.perceptual_hash)
                distance = target_hash - candidate_hash  # Hamming distance
                if distance < min_distance:
                    min_distance = distance
                    best_match = img
            except Exception:
                continue

        if best_match and min_distance <= settings.hash_similarity_threshold:
            similarity_pct = round(((64 - min_distance) / 64) * 100, 1)
            matched_listing = db.query(Listing).filter(Listing.id == best_match.listing_id).first()
            matched_title = matched_listing.title if matched_listing else f"Listing #{best_match.listing_id}"
            matched_city = matched_listing.city if matched_listing else "Unknown"

            match_detail = ImageMatchDetail(
                uploaded_image=image_label,
                perceptual_hash=phash_str,
                matched_listing_id=best_match.listing_id,
                matched_listing_title=matched_title,
                matched_listing_city=matched_city,
                hamming_distance=min_distance,
                similarity_percentage=similarity_pct,
                is_reused_duplicate=True,
                notes=(
                    f"Photo matches listing #{best_match.listing_id} ('{matched_title}' in {matched_city}) "
                    f"with {similarity_pct}% visual similarity (Hamming distance {min_distance})."
                )
            )
            matches.append(match_detail)

            flags.append(DetectedFlag(
                indicator_id="IMAGE_REUSED_ACROSS_LISTINGS",
                category="image",
                name="Duplicate / Reused Listing Photo Detected",
                severity="critical" if similarity_pct >= 95 else "high",
                score_impact=40,
                description=(
                    f"Listing image appears visually identical or near-duplicate ({similarity_pct}% match) "
                    f"to a photo from Listing #{best_match.listing_id} in {matched_city}. "
                    f"Scammers frequently steal photos from active properties to create phantom listings elsewhere."
                ),
                matched_snippet=f"Hash: {phash_str} (matches Listing #{best_match.listing_id})"
            ))
        else:
            matches.append(ImageMatchDetail(
                uploaded_image=image_label,
                perceptual_hash=phash_str,
                matched_listing_id=None,
                matched_listing_title=None,
                matched_listing_city=None,
                hamming_distance=min_distance,
                similarity_percentage=0.0,
                is_reused_duplicate=False,
                notes="No duplicate photo matches found in current verified database."
            ))

        return matches, flags

image_analyzer = ImageAnalyzer()
