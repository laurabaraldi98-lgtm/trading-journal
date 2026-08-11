from fastapi import Header, HTTPException, Depends
from database import supabase


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
        response = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    return response.user


def get_current_user(token: str = Depends(get_bearer_token)):
    return get_user_from_token(token)
