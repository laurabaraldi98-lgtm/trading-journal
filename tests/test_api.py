from unittest.mock import patch
from fastapi.testclient import TestClient
from api import app
from auth import get_current_user
from types import SimpleNamespace

client = TestClient(app)


def fake_current_user():
    return SimpleNamespace(id="test-user")


def test_root():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "Trading Journal API"}


def test_get_trades():
    fake_trades = [
        [1, "eurusd", "long", 1.10, 1.09, 1.12, 2.0]
    ]

    app.dependency_overrides[get_current_user] = fake_current_user

    with patch(
        "api.load_trades_from_supabase",
        return_value=fake_trades
    ) as mock_load:
        response = client.get("/trades")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == fake_trades

    mock_load.assert_called_once_with("test-user")


def test_get_trades_without_auth_returns_401():
    response = client.get("/trades")

    assert response.status_code == 401


def test_create_trade():
    trade_data = {
        "symbol": "eurusd",
        "direction": "long",
        "entry": 1.12,
        "stop": 1.11,
        "exit": 1.14
    }

    app.dependency_overrides[get_current_user] = fake_current_user

    with patch(
        "api.save_trade_to_supabase",
        return_value=trade_data
    ):
        response = client.post("/trades", json=trade_data)

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == trade_data


def test_create_trade_missing_direction():
    trade_data = {
        "symbol": "eurusd",
        "entry": 1.12,
        "stop": 1.11,
        "exit": 1.14
    }

    app.dependency_overrides[get_current_user] = fake_current_user

    response = client.post("/trades", json=trade_data)

    app.dependency_overrides.clear()

    assert response.status_code == 422


def test_create_trade_passes_correct_data_to_save():
    trade_data = {
        "symbol": "eurusd",
        "direction": "long",
        "entry": 1.12,
        "stop": 1.11,
        "exit": 1.14
    }

    app.dependency_overrides[get_current_user] = fake_current_user

    with patch("api.save_trade_to_supabase") as mock_save:
        client.post("/trades", json=trade_data)

    app.dependency_overrides.clear()

    mock_save.assert_called_once_with(
        [
            "eurusd",
            "long",
            1.12,
            1.11,
            1.14,
            2.0,
            None,
            None
        ],
        "test-user"
    )


def test_delete_trade():
    app.dependency_overrides[get_current_user] = fake_current_user

    with patch(
        "api.delete_trade_from_supabase",
        return_value={"message": "Trade deleted"}
    ) as mock_delete:
        response = client.delete("/trades/5")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == {"message": "Trade deleted"}

    mock_delete.assert_called_once_with(
        5,
        "test-user"
    )


def test_delete_trade_invalid_id():
    app.dependency_overrides[get_current_user] = fake_current_user

    response = client.delete("/trades/banana")

    app.dependency_overrides.clear()

    assert response.status_code == 422


def test_update_trade():
    trade_data = {
        "symbol": "eurusd",
        "direction": "long",
        "entry": 1.12,
        "stop": 1.11,
        "exit": 1.14
    }

    expected_trade = [
        5,
        "eurusd",
        "long",
        1.12,
        1.11,
        1.14,
        2.0,
        None,
        None
    ]

    app.dependency_overrides[get_current_user] = fake_current_user

    with patch(
        "api.update_trade_in_supabase",
        return_value=expected_trade
    ) as mock_update:
        response = client.patch("/trades/5", json=trade_data)

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == expected_trade

    mock_update.assert_called_once_with(
        5,
        expected_trade,
        "test-user"
    )


def test_update_trade_invalid_id():
    trade_data = {
        "symbol": "eurusd",
        "direction": "long",
        "entry": 1.12,
        "stop": 1.11,
        "exit": 1.14
    }

    app.dependency_overrides[get_current_user] = fake_current_user

    response = client.patch("/trades/banana", json=trade_data)

    app.dependency_overrides.clear()

    assert response.status_code == 422


def test_update_trade_invalid_direction():
    trade_data = {
        "symbol": "eurusd",
        "direction": "banana",
        "entry": 1.12,
        "stop": 1.11,
        "exit": 1.14
    }

    app.dependency_overrides[get_current_user] = fake_current_user

    response = client.patch("/trades/5", json=trade_data)

    app.dependency_overrides.clear()

    assert response.status_code == 422
