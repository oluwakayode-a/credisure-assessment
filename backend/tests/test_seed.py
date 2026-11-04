from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine, func, select

from core.security import verify_password
from users.models import User
from users.seed import seed_demo_users


def test_seed_is_idempotent_and_applies_demo_login():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        seed_demo_users(session, email="demo@example.com", password="first")
        seed_demo_users(session, email="demo@example.com", password="second")

        assert session.exec(select(func.count()).select_from(User)).one() == 24
        admin = session.exec(select(User).where(User.email == "demo@example.com")).one()
        assert admin.role == "admin"
        assert verify_password("second", admin.hashed_password)
