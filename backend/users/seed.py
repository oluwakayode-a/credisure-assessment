from datetime import date, timedelta

from sqlmodel import Session, SQLModel, select

from core.config import DEMO_EMAIL, DEMO_PASSWORD
from core.database import engine
from core.security import hash_password
from users.models import User


def seed_demo_users(session: Session, email: str = DEMO_EMAIL, password: str = DEMO_PASSWORD) -> None:
    if session.exec(select(User.id).limit(1)).first() is None:
        seed_customers(session, admin_email=email)

    
    admin = session.exec(select(User).where(User.email == email)).first()
    if admin is None:
        admin = User(email=email, full_name="Alex Morgan", company="CrediSure", role="admin")
    admin.hashed_password = hash_password(password)
    session.add(admin)
    session.commit()


def seed_customers(session: Session, admin_email: str) -> None:
    today = date.today()
    people = [
        ("Alex Morgan", admin_email, "CrediSure", "active"),
        ("Jordan Lee", "jordan.lee@northstar.io", "Northstar Studio", "active"),
        ("Samira Okafor", "samira@wellnest.co", "Wellnest Health", "pending"),
        ("Daniel Kim", "daniel.kim@fieldwork.com", "Fieldwork Labs", "active"),
        ("Amina Yusuf", "amina@brightpath.org", "Brightpath Group", "active"),
        ("Theo Bennett", "theo@kinetic.app", "Kinetic Software", "inactive"),
        ("Priya Shah", "priya@daybreak.co", "Daybreak Coffee", "active"),
        ("Emeka Nwosu", "emeka@greenline.africa", "Greenline Africa", "pending"),
        ("Maya Thompson", "maya@studioform.design", "Studio Form", "active"),
        ("Lucas Ferreira", "lucas@monument.io", "Monument Capital", "active"),
        ("Fatima Bello", "fatima@horizon.ng", "Horizon Energy", "pending"),
        ("Oliver Grant", "oliver@oakandstone.com", "Oak & Stone", "active"),
        ("Zara Adeyemi", "zara@carecircle.health", "CareCircle", "active"),
        ("Noah Williams", "noah@papertrail.app", "Papertrail", "inactive"),
        ("Laila Hassan", "laila@sunrisefoods.co", "Sunrise Foods", "active"),
        ("Chidi Eze", "chidi@apexventures.io", "Apex Ventures", "pending"),
        ("Grace Chen", "grace@hushhome.com", "Hush Home", "active"),
        ("Rafael Costa", "rafael@orbitlogistics.com", "Orbit Logistics", "active"),
        ("Nneka Obi", "nneka@maplewood.edu", "Maplewood Academy", "inactive"),
        ("Isabel Romero", "isabel@commonthread.co", "Common Thread", "active"),
        ("David Osei", "david@bluepeak.tech", "Bluepeak Tech", "active"),
        ("Mariam Bello", "mariam@kindredcare.org", "Kindred Care", "pending"),
        ("Ethan Brooks", "ethan@atlasbuild.com", "Atlas Build", "active"),
        ("Tomi Adebayo", "tomi@littleleaf.ng", "Little Leaf", "active"),
    ]
    session.add_all([
        User(
            email=email,
            full_name=name,
            company=company,
            role="admin" if index == 0 else "customer",
            status=user_status,
            joined_at=today - timedelta(days=(23 - index) * 8 + index % 5),
        )
        for index, (name, email, company, user_status) in enumerate(people)
    ])
    session.commit()


if __name__ == "__main__":
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        seed_demo_users(session)
    print(f"Seeded demo data. Demo login: {DEMO_EMAIL}")
