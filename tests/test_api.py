from unittest.mock import patch
from fastapi.testclient import TestClient
from api import app


client = TestClient(app)


def test_root():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "Trading Journal API"}


def test_get_trades():
    fake_trades = [
        [1, "eurusd", "long", 1.10, 1.09, 1.12, 2.0]
    ]

    with patch("api.load_trades_from_supabase", return_value=fake_trades):
        response = client.get("/trades")

    assert response.status_code == 200
    assert response.json() == fake_trades
