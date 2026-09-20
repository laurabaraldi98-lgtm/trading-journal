from unittest.mock import Mock, patch

from fastapi.testclient import TestClient

from rate_limit import limiter

from api import app


client = TestClient(app)


def test_demo_login_is_rate_limited():
    # Reset in-memory rate-limit counters so this test is isolated
    # from requests made by other tests in the same test session.
    limiter.reset()

    with patch(
        "api.get_demo_session",
        return_value={
            "access_token": "test-token",
            "refresh_token": "test-refresh-token",
        },
    ):
        for _ in range(5):
            response = client.post("/demo-login")
            assert response.status_code == 200

        response = client.post("/demo-login")

        assert response.status_code == 429


def test_trades_is_rate_limited_per_user():
    limiter.reset()

    mock_user = Mock()
    mock_user.id = "user-123"

    with patch(
        "auth.get_user_from_token",
        return_value=mock_user,
    ), patch(
        "auth.update_demo_activity",
    ), patch(
        "routes.trades.load_trades_from_supabase",
        return_value=([], 0),
    ):
        for _ in range(60):
            response = client.get(
                "/trades",
                headers={"Authorization": "Bearer test-token"},
            )
            assert response.status_code == 200

        response = client.get(
            "/trades",
            headers={"Authorization": "Bearer test-token"},
        )

        assert response.status_code == 429
