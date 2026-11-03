from datetime import date

from sqlmodel import SQLModel


class UserPublic(SQLModel):
    id: int
    email: str
    full_name: str
    company: str
    role: str
    status: str
    joined_at: date


class UserPage(SQLModel):
    items: list[UserPublic]
    total: int
    page: int
    limit: int


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserPublic


class Overview(SQLModel):
    total_users: int
    active_users: int
    pending_users: int
    inactive_users: int
    users_change: float
    activity: list[int]
