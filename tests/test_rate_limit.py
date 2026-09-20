from unittest.mock import patch

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
