from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import func, or_
from sqlmodel import Session, select

from core.database import get_session
from core.security import create_access_token, get_current_user, verify_password
from users.models import User
from users.schema import Overview, Token, UserPage, UserPublic

router = APIRouter()


@router.post("/auth/login", response_model=Token, tags=["auth"])
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[Session, Depends(get_session)],
):
    user = session.exec(select(User).where(User.email == form.username)).first()
    if not user or not user.hashed_password or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return Token(access_token=create_access_token(user), user=UserPublic.model_validate(user))


@router.get("/auth/me", response_model=UserPublic, tags=["auth"])
def me(user: Annotated[User, Depends(get_current_user)]):
    return user


@router.get("/overview", response_model=Overview, tags=["dashboard"])
def overview(
    _: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    users = session.exec(select(User)).all()
    return Overview(
        total_users=len(users),
        active_users=sum(user.status == "active" for user in users),
        pending_users=sum(user.status == "pending" for user in users),
        inactive_users=sum(user.status == "inactive" for user in users),
        users_change=12.8,
        activity=[4, 7, 6, 11, 9, 15, len(users)],
    )


@router.get("/users", response_model=UserPage, tags=["users"])
def list_users(
    _: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
    search: str | None = Query(default=None, max_length=100),
    status_filter: str | None = Query(default=None, alias="status", pattern="^(active|pending|inactive)$"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=8, ge=1, le=100),
):
    filters = []
    if search and search.strip():
        term = f"%{search.strip()}%"
        filters.append(or_(User.full_name.ilike(term), User.email.ilike(term), User.company.ilike(term)))
    if status_filter:
        filters.append(User.status == status_filter)

    statement = select(User).where(*filters).order_by(User.joined_at.desc(), User.id.desc())
    count_statement = select(func.count()).select_from(User).where(*filters)
    items = session.exec(statement.offset((page - 1) * limit).limit(limit)).all()
    total = session.exec(count_statement).one()
    return UserPage(
        items=[UserPublic.model_validate(user) for user in items],
        total=total,
        page=page,
        limit=limit,
    )
