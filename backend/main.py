from contextlib import asynccontextmanager
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from core.database import engine
from users.api import router as users_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Seeding is a separate step (deploy.sh / `make seed`) so it doesn't run on every reload.
    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(title="CrediSure API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:3000").split(",")
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(users_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "credisure-api"}
