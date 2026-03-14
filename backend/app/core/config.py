from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    SUPABASE_JWT_SECRET: str
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    PROJECT_NAME: str = "Bizora API"
    
    class Config:
        env_file = ".env"

settings = Settings()
