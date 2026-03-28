import sqlite3

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from app.services.auth_store import create_user, get_user_by_email, verify_user

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register")
def register_user(payload: RegisterRequest):
    existing = get_user_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists.")

    if len(payload.password.strip()) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters.")

    try:
        user_id = create_user(payload.full_name, payload.email, payload.password)
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already exists.")

    return {
        "success": True,
        "user": {
            "id": user_id,
            "full_name": payload.full_name,
            "email": payload.email,
        },
    }


@router.post("/login")
def login_user(payload: LoginRequest):
    user = verify_user(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {
        "success": True,
        "user": user,
    }