import os
from dotenv import load_dotenv
load_dotenv()

class Settings:
    SECRET_KEY = os.getenv("JWT_SECRET")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_EXPIRES", 900))         # 15 min
    JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv("JWT_REFRESH_EXPIRES", 604800))   # 7 days
    COOKIE_SECURE = os.getenv("COOKIE_SECURE", "False")  # Must be False for local dev
    COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "Lax")  # Lax works well locally
