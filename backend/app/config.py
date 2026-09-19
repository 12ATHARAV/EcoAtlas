from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "EcoAtlas API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "ecoatlas_super_secret_jwt_key_development_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # DATABASE_URL: default fallback to SQLite for immediate zero-config testing & deployment if PostgreSQL URL is not set
    DATABASE_URL: str = ""
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "*"]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
