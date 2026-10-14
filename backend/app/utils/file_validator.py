import os
from pathlib import Path
from fastapi import UploadFile, HTTPException
from PIL import Image
import io

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_BYTES = 5 * 1024 * 1024  # 5MB

def validate_and_load_image(file: UploadFile) -> Image.Image:
    """
    Validates uploaded file size, extension, MIME type, and tests PIL readability.
    Returns cleaned PIL Image in RGB format.
    """
    filename = file.filename or "upload.jpg"
    ext = Path(filename).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed extensions: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Check content type if provided
    if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid MIME type '{file.content_type}'. Must be image/jpeg, image/png, or image/webp."
        )

    # Read bytes and check size
    contents = file.file.read()
    if len(contents) > MAX_FILE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {MAX_FILE_BYTES // (1024*1024)}MB."
        )

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        # Load through PIL to verify image headers and decode safely
        image = Image.open(io.BytesIO(contents))
        image.verify()  # verify integrity
        # Re-open for actual processing (verify closes/corrupts internal pointers)
        image = Image.open(io.BytesIO(contents))
        # Convert to RGB to handle PNG RGBA, paletted, or grayscale consistently
        if image.mode != "RGB":
            image = image.convert("RGB")
        return image
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Corrupt or unreadable image file: {str(e)}"
        )
