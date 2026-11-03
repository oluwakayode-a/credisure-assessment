import os

from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-change-this-key-before-deploying")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./credisure.db")
ACCESS_TOKEN_MINUTES = 60
JWT_ALGORITHM = "HS256"
