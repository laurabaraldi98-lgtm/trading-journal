import os

from fastapi import Header, HTTPException, Depends
from supabase import create_client
from database import supabase_url, supabase_key


def get_bearer_token(authorization: str | None = Header(default=None)):
    if authorization is None:
        raise HTTPException(
            status_code=401,
            detail="Missing Authorization header"
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid Authorization header"
        )

    token = authorization.removeprefix("Bearer ")

    return token


def get_user_from_token(token: str):
    try:
        client = create_client(
            supabase_url,
            supabase_key,
        )

        response = client.auth.get_user(token)

    except Exception as error:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    return response.user


def get_current_user(token: str = Depends(get_bearer_token)):
    user = get_user_from_token(token)

    return {
        "user": user,
        "token": token,
    }


def get_demo_session():
    demo_email = os.getenv("DEMO_EMAIL")
    demo_password = os.getenv("DEMO_PASSWORD")

    if not demo_email or not demo_password:
        raise HTTPException(
            status_code=500,
            detail="Demo account is not configured",
        )

    try:
        client = create_client(
            supabase_url,
            supabase_key,
        )

        response = client.auth.sign_in_with_password({
            "email": demo_email,
            "password": demo_password,
        })

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Demo login unavailable",
        )

    if response.session is None:
        raise HTTPException(
            status_code=503,
            detail="Demo login unavailable",
        )

    return {
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token,
    }
