from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = Path(__file__).resolve().parent / "data"

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")

    app_name: str = "RentShield AI"
    environment: str = "development"
    debug: bool = True
    
    # Storage
    database_url: str = f"sqlite:///{BASE_DIR}/rentshield.sqlite3"
    upload_dir: Path = BASE_DIR / "uploads"
    max_image_size_mb: int = 5
    hash_similarity_threshold: int = 8  # Hamming distance <= 8 is considered suspicious duplicate
    
    # CORS
    allowed_origins: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Optional external AI
    external_ai_api_key: str = ""
    external_ai_model: str = "gpt-4o-mini"

settings = Settings()
settings.upload_dir.mkdir(parents=True, exist_ok=True)
