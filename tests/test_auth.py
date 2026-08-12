import pytest
from fastapi import HTTPException
from unittest.mock import patch
from types import SimpleNamespace

from auth import (
    get_bearer_token,
    get_user_from_token,
    get_current_user,
)


def test_get_bearer_token_missing_header():
    with pytest.raises(HTTPException) as error:
        get_bearer_token(None)

    assert error.value.status_code == 401
    assert error.value.detail == "Missing Authorization header"


def test_get_bearer_token_invalid_header():
    with pytest.raises(HTTPException) as error:
        get_bearer_token("NotBearer abc123")

    assert error.value.status_code == 401
    assert error.value.detail == "Invalid Authorization header"


def test_get_bearer_token_returns_token():
    token = get_bearer_token("Bearer abc123")

    assert token == "abc123"


def test_get_user_from_token_returns_user():
    fake_user = SimpleNamespace(id="user-123")

    fake_response = SimpleNamespace(user=fake_user)

    with patch("auth.supabase.auth.get_user", return_value=fake_response):
        user = get_user_from_token("abc123")

    assert user == fake_user


def test_get_user_from_token_invalid_token():
    with patch(
        "auth.supabase.auth.get_user",
        side_effect=Exception("Invalid token")
    ):
        with pytest.raises(HTTPException) as error:
            get_user_from_token("bad-token")

    assert error.value.status_code == 401
    assert error.value.detail == "Invalid or expired token"


def test_get_current_user_returns_user():
    fake_user = SimpleNamespace(id="user-123")

    with patch(
        "auth.get_user_from_token",
        return_value=fake_user
    ):
        user = get_current_user("abc123")

    assert user == fake_user
