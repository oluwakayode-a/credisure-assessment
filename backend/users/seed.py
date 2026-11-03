from datetime import date, timedelta

from sqlmodel import Session, select

from core.security import hash_password
from users.models import User


def seed_demo_users(session: Session) -> None:
    if session.exec(select(User.id).limit(1)).first() is not None:
        return

    password = hash_password("password123")
    today = date.today()
    people = [
        ("Alex Morgan", "admin@credisure.com", "CrediSure", "active"),
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
            hashed_password=password if index == 0 else None,
        )
        for index, (name, email, company, user_status) in enumerate(people)
    ])
    session.commit()
