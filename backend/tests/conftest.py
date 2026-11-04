import os
import tempfile

os.environ["DATABASE_URL"] = f"sqlite:///{tempfile.mkdtemp()}/test.db"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlmodel import Session  # noqa: E402

from core.database import engine  # noqa: E402

from main import app  # noqa: E402
from users.seed import seed_demo_users  # noqa: E402


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        with Session(engine) as session:
            seed_demo_users(session)
        yield test_client


@pytest.fixture(scope="session")
def auth_headers(client):
    response = client.post("/auth/login", data={"username": "admin@credisure.com", "password": "password123"})
    return {"Authorization": f"Bearer {response.json()['access_token']}"}
