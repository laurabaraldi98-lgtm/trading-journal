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


def test_create_trade():
    trade_data = {
        "symbol": "eurusd",
        "direction": "long",
        "entry": 1.12,
        "stop": 1.11,
        "exit_price": 1.14
    }

    with patch("api.save_trade_to_supabase", return_value=trade_data):
        response = client.post("/trades", json=trade_data)

    assert response.status_code == 200
    assert response.json() == trade_data


def test_create_trade_missing_direction():
    trade_data = {
        "symbol": "eurusd",
        "entry": 1.12,
        "stop": 1.11,
        "exit_price": 1.14
    }

    response = client.post("/trades", json=trade_data)

    assert response.status_code == 422


def test_create_trade_passes_correct_data_to_save():
    trade_data = {
        "symbol": "eurusd",
        "direction": "long",
        "entry": 1.12,
        "stop": 1.11,
        "exit_price": 1.14
    }

    with patch("api.save_trade_to_supabase") as mock_save:
        client.post("/trades", json=trade_data)

    mock_save.assert_called_once_with([
        "eurusd",
        "long",
        1.12,
        1.11,
        1.14,
        2.0
    ])


def test_delete_trade():
    with patch("api.delete_trade_from_supabase") as mock_delete:
        response = client.delete("/trades/5")

    assert response.status_code == 200
    assert response.json() == {"message": "Trade deleted"}
    mock_delete.assert_called_once_with(5)


def test_delete_trade_invalid_id():
    response = client.delete("/trades/banana")

    assert response.status_code == 422


def test_update_trade():
    trade_data = {
        "symbol": "eurusd",
        "direction": "long",
        "entry": 1.12,
        "stop": 1.11,
        "exit_price": 1.14
    }

    with patch("api.update_trade_in_supabase") as mock_update:
        response = client.patch("/trades/5", json=trade_data)

    assert response.status_code == 200
    assert response.json() == {"message": "Trade updated"}

    mock_update.assert_called_once_with(
        5,
        [
            5,
            "eurusd",
            "long",
            1.12,
            1.11,
            1.14,
            2.0
        ]
    )


def test_update_trade_invalid_id():
    trade_data = {
        "symbol": "eurusd",
        "direction": "long",
        "entry": 1.12,
        "stop": 1.11,
        "exit_price": 1.14
    }

    response = client.patch("/trades/banana", json=trade_data)

    assert response.status_code == 422


def test_update_trade_invalid_direction():
    trade_data = {
        "symbol": "eurusd",
        "direction": "banana",
        "entry": 1.12,
        "stop": 1.11,
        "exit_price": 1.14
    }

    response = client.patch("/trades/5", json=trade_data)

    assert response.status_code == 422
