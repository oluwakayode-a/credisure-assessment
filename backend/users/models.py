from datetime import date

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    full_name: str
    company: str
    role: str = "customer"
    status: str = Field(default="active", index=True)
    joined_at: date = Field(default_factory=date.today, index=True)
    hashed_password: str | None = None
