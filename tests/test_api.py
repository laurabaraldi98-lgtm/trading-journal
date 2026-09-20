import pytest

from datetime import date, datetime
from types import SimpleNamespace
from unittest.mock import call, patch

from database import DatabaseError, ResourceNotFoundError
from fastapi.testclient import TestClient

from api import app
from auth import get_current_user


client = TestClient(app)


def fake_current_user():
    return {"user": SimpleNamespace(id="test-user"), "token": "fake-token"}


@pytest.fixture
def authenticated_user():
    app.dependency_overrides[get_current_user] = fake_current_user
    yield
    app.dependency_overrides.clear()


def make_trade_response(**overrides):
    trade = {
        "id": 1,
        "account_id": 1,
        "symbol": "eurusd",
        "direction": "long",
        "entry": 1.12,
        "stop": 1.11,
        "exit": 1.14,
        "result": 2.0,
        "pnl": 400.0,
        "entry_datetime": "2026-08-12T10:00:00",
        "exit_datetime": "2026-08-12T11:00:00",
    }
    trade.update(overrides)
    return trade


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Trading Journal API"}


def test_demo_login():
    fake_session = {"access_token": "access-token",
                    "refresh_token": "refresh-token"}

    with patch("api.get_demo_session", return_value=fake_session) as mock_demo_session:
        response = client.post("/demo-login")

    assert response.status_code == 200
    assert response.json() == fake_session
    mock_demo_session.assert_called_once_with()


def test_get_trades(authenticated_user):
    fake_trade = make_trade_response(id=7, account_id=7)
    fake_trade["user_id"] = "test-user"

    with patch("api.load_trades_from_supabase", return_value=([fake_trade], 45)) as mock_load:
        response = client.get("/trades?account_id=7&page=2&page_size=20")

    assert response.status_code == 200
    assert response.json() == {
        "items": [make_trade_response(id=7, account_id=7)],
        "page": 2,
        "page_size": 20,
        "total": 45,
        "total_pages": 3,
    }
    assert "user_id" not in response.json()["items"][0]
    mock_load.assert_called_once_with(
        "test-user", "fake-token", 7, 2, 20, None, None)


def test_get_trades_uses_default_pagination(authenticated_user):
    with patch("api.load_trades_from_supabase", return_value=([], 0)) as mock_load:
        response = client.get("/trades?account_id=7")

    assert response.status_code == 200
    assert response.json() == {
        "items": [],
        "page": 1,
        "page_size": 20,
        "total": 0,
        "total_pages": 0,
    }
    mock_load.assert_called_once_with(
        "test-user", "fake-token", 7, 1, 20, None, None)


def test_get_trades_passes_date_filters(authenticated_user):
    with patch("api.load_trades_from_supabase", return_value=([], 0)) as mock_load:
        response = client.get(
            "/trades?account_id=7&date_from=2026-08-01&date_to=2026-08-31")

    assert response.status_code == 200
    mock_load.assert_called_once_with(
        "test-user",
        "fake-token",
        7,
        1,
        20,
        date(2026, 8, 1),
        date(2026, 8, 31),
    )


def test_get_trades_rejects_reversed_date_range(authenticated_user):
    with patch("api.load_trades_from_supabase") as mock_load:
        response = client.get(
            "/trades?account_id=7&date_from=2026-08-31&date_to=2026-08-01")

    assert response.status_code == 422
    assert response.json() == {"detail": "date_from cannot be after date_to"}
    mock_load.assert_not_called()


@pytest.mark.parametrize("query_string", ["page=0", "page=-1", "page_size=0", "page_size=101"])
def test_get_trades_rejects_invalid_pagination(authenticated_user, query_string):
    response = client.get(f"/trades?{query_string}")
    assert response.status_code == 422


def test_get_trades_without_auth_returns_401():
    response = client.get("/trades")
    assert response.status_code == 401


def test_create_trade(authenticated_user):
    trade_data = {
        "account_id": 1,
        "symbol": "eurusd",
        "direction": "long",
        "entry": 1.12,
        "stop": 1.11,
        "exit": 1.14,
        "pnl": 400,
        "entry_datetime": "2026-08-12T10:00:00",
        "exit_datetime": "2026-08-12T11:00:00",
    }
    saved_trade = make_trade_response()

    with (
        patch("api.account_belongs_to_user", return_value=True),
        patch("api.save_trade_to_supabase", return_value=saved_trade),
    ):
        response = client.post("/trades", json=trade_data)

    assert response.status_code == 200
    assert response.json() == saved_trade


@pytest.mark.parametrize("field,value", [("direction", None), ("symbol", "")])
def test_create_trade_rejects_invalid_fields(authenticated_user, field, value):
    trade_data = {
        "account_id": 1,
        "symbol": "eurusd",
        "direction": "long",
        "entry": 1.12,
        "stop": 1.11,
        "exit": 1.14,
        "pnl": 400,
        "entry_datetime": "2026-08-12T10:00:00",
        "exit_datetime": "2026-08-12T11:00:00",
    }

    if value is None:
        trade_data.pop(field)
    else:
        trade_data[field] = value

    response = client.post("/trades", json=trade_data)
    assert response.status_code == 422


def test_create_trade_rejects_exit_before_entry(authenticated_user):
    trade_data = {
        "account_id": 1,
        "symbol": "eurusd",
        "direction": "long",
        "entry": 1.12,
        "stop": 1.11,
        "exit": 1.14,
        "pnl": 400,
        "entry_datetime": "2026-08-12T11:00:00",
        "exit_datetime": "2026-08-12T10:00:00",
    }

    response = client.post("/trades", json=trade_data)
    assert response.status_code == 422


@pytest.mark.parametrize(
    "method,url,trade_data",
    [
        (
            "post",
            "/trades",
            {
                "account_id": 1,
                "symbol": "eurusd",
                "direction": "long",
                "entry": 1.12,
                "stop": 1.12,
                "exit": 1.14,
                "pnl": 400,
                "entry_datetime": "2026-08-12T10:00:00",
                "exit_datetime": "2026-08-12T11:00:00",
            },
        ),
        (
            "patch",
            "/trades/5",
            {
                "symbol": "eurusd",
                "direction": "long",
                "entry": 1.12,
                "stop": 1.12,
                "exit": 1.14,
                "pnl": 400,
                "entry_datetime": "2026-08-12T10:00:00",
                "exit_datetime": "2026-08-12T11:00:00",
            },
        ),
    ],
)
def test_rejects_entry_equal_to_stop(authenticated_user, method, url, trade_data):
    response = getattr(client, method)(url, json=trade_data)
    assert response.status_code == 422


def test_create_trade_passes_correct_data_to_save(authenticated_user):
    trade_data = {
        "account_id": 1,
        "symbol": "eurusd",
        "direction": "long",
        "entry": 1.12,
        "stop": 1.11,
        "exit": 1.14,
        "pnl": 400,
        "entry_datetime": "2026-08-12T10:00:00",
        "exit_datetime": "2026-08-12T11:00:00",
    }

    with (
        patch("api.account_belongs_to_user", return_value=True),
        patch("api.save_trade_to_supabase", return_value=make_trade_response()) as mock_save,
    ):
        client.post("/trades", json=trade_data)

    mock_save.assert_called_once_with(
        {
            "account_id": 1,
            "symbol": "eurusd",
            "direction": "long",
            "entry": 1.12,
            "stop": 1.11,
            "exit": 1.14,
            "result": 2.0,
            "pnl": 400.0,
            "entry_datetime": datetime(2026, 8, 12, 10, 0),
            "exit_datetime": datetime(2026, 8, 12, 11, 0),
        },
        "test-user",
        "fake-token",
    )


def test_delete_trade(authenticated_user):
    with patch("api.delete_trade_from_supabase", return_value={"message": "Trade deleted"}) as mock_delete:
        response = client.delete("/trades/5")

    assert response.status_code == 200
    assert response.json() == {"message": "Trade deleted"}
    mock_delete.assert_called_once_with(5, "test-user", "fake-token")


def test_delete_trade_invalid_id(authenticated_user):
    response = client.delete("/trades/banana")
    assert response.status_code == 422


def test_update_trade(authenticated_user):
    trade_data = {
        "symbol": "eurusd",
        "direction": "long",
        "entry": 1.12,
        "stop": 1.11,
        "exit": 1.14,
        "pnl": 400,
        "entry_datetime": "2026-08-12T10:00:00",
        "exit_datetime": "2026-08-12T11:00:00",
    }
    expected_trade_for_database = {
        "symbol": "eurusd",
        "direction": "long",
        "entry": 1.12,
        "stop": 1.11,
        "exit": 1.14,
        "result": 2.0,
        "pnl": 400.0,
        "entry_datetime": datetime(2026, 8, 12, 10, 0),
        "exit_datetime": datetime(2026, 8, 12, 11, 0),
    }
    fake_response = make_trade_response(id=5)

    with patch("api.update_trade_in_supabase", return_value=fake_response) as mock_update:
        response = client.patch("/trades/5", json=trade_data)

    assert response.status_code == 200
    assert response.json() == fake_response
    mock_update.assert_called_once_with(
        5,
        expected_trade_for_database,
        "test-user",
        "fake-token",
    )


def test_update_trade_invalid_id(authenticated_user):
    trade_data = {
        "symbol": "eurusd",
        "direction": "long",
        "entry": 1.12,
        "stop": 1.11,
        "exit": 1.14,
        "pnl": 400,
        "entry_datetime": "2026-08-12T10:00:00",
        "exit_datetime": "2026-08-12T11:00:00",
    }

    response = client.patch("/trades/banana", json=trade_data)
    assert response.status_code == 422


def test_update_trade_invalid_direction(authenticated_user):
    trade_data = {
        "symbol": "eurusd",
        "direction": "banana",
        "entry": 1.12,
        "stop": 1.11,
        "exit": 1.14,
        "pnl": 400,
        "entry_datetime": "2026-08-12T10:00:00",
        "exit_datetime": "2026-08-12T11:00:00",
    }

    response = client.patch("/trades/5", json=trade_data)
    assert response.status_code == 422


def test_database_error_returns_503(authenticated_user):
    with patch(
        "api.load_trades_from_supabase",
        side_effect=DatabaseError("Database request failed"),
    ):
        response = client.get("/trades")

    assert response.status_code == 503
    assert response.json() == {"detail": "Database service unavailable"}


def test_resource_not_found_returns_404(authenticated_user):
    with patch(
        "api.delete_trade_from_supabase",
        side_effect=ResourceNotFoundError("Trade not found"),
    ):
        response = client.delete("/trades/999999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Trade not found"}


def test_get_accounts(authenticated_user):
    fake_accounts = [
        {
            "id": 1,
            "user_id": "test-user",
            "name": "My Account",
            "starting_balance": 100000,
            "currency": "USD",
            "broker": None,
            "account_type": None,
        }
    ]

    with patch("api.load_accounts_from_supabase", return_value=fake_accounts) as mock_load_accounts:
        response = client.get("/accounts")

    assert response.status_code == 200
    assert response.json() == fake_accounts
    mock_load_accounts.assert_called_once_with("test-user", "fake-token")


def test_create_account(authenticated_user):
    account_data = {
        "name": "FTMO 100K",
        "starting_balance": 100000,
        "currency": "USD",
        "broker": "FTMO",
        "account_type": "Prop Firm",
    }
    fake_response = [{"id": 2, "user_id": "test-user", **account_data}]

    with patch("api.save_account_to_supabase", return_value=fake_response) as mock_save_account:
        response = client.post("/accounts", json=account_data)

    assert response.status_code == 200
    assert response.json() == fake_response
    mock_save_account.assert_called_once_with(
        account_data, "test-user", "fake-token")


def test_create_trade_returns_404_for_invalid_account(authenticated_user):
    trade = {
        "account_id": 999,
        "symbol": "EURUSD",
        "direction": "long",
        "entry": 1.10,
        "stop": 1.09,
        "exit": 1.12,
        "pnl": 200,
        "entry_datetime": "2026-08-22T10:00:00",
        "exit_datetime": "2026-08-22T11:00:00",
    }

    with patch("api.account_belongs_to_user", return_value=False):
        response = client.post("/trades", json=trade)

    assert response.status_code == 404
    assert response.json() == {"detail": "Account not found"}


def test_update_account(authenticated_user):
    account_data = {
        "name": "FTMO Updated",
        "starting_balance": 120000,
        "currency": "EUR",
        "broker": "FTMO",
        "account_type": "Prop Firm",
    }
    fake_response = [{"id": 2, "user_id": "test-user", **account_data}]

    with patch("api.update_account_in_supabase", return_value=fake_response) as mock_update_account:
        response = client.patch("/accounts/2", json=account_data)

    assert response.status_code == 200
    assert response.json() == fake_response
    mock_update_account.assert_called_once_with(
        2, account_data, "test-user", "fake-token")


def test_delete_account(authenticated_user):
    fake_response = [{"id": 2, "user_id": "test-user", "name": "FTMO 100K"}]

    with patch("api.delete_account_from_supabase", return_value=fake_response) as mock_delete_account:
        response = client.delete("/accounts/2")

    assert response.status_code == 200
    assert response.json() == fake_response
    mock_delete_account.assert_called_once_with(2, "test-user", "fake-token")


def test_create_trade_without_stop(authenticated_user):
    trade_data = {
        "account_id": 1,
        "symbol": "eurusd",
        "direction": "long",
        "entry": 1.12,
        "exit": 1.14,
        "pnl": 400,
        "entry_datetime": "2026-08-12T10:00:00",
        "exit_datetime": "2026-08-12T11:00:00",
    }
    saved_trade = make_trade_response(stop=None, result=None)

    with (
        patch("api.account_belongs_to_user", return_value=True),
        patch("api.save_trade_to_supabase", return_value=saved_trade) as mock_save,
    ):
        response = client.post("/trades", json=trade_data)

    assert response.status_code == 200
    saved_trade_for_database = mock_save.call_args.args[0]
    assert saved_trade_for_database["stop"] is None
    assert saved_trade_for_database["result"] is None


def test_update_trade_without_stop(authenticated_user):
    trade_data = {
        "symbol": "eurusd",
        "direction": "long",
        "entry": 1.12,
        "exit": 1.14,
        "pnl": 400,
        "entry_datetime": "2026-08-12T10:00:00",
        "exit_datetime": "2026-08-12T11:00:00",
    }
    updated_response = make_trade_response(id=5, stop=None, result=None)

    with patch("api.update_trade_in_supabase", return_value=updated_response) as mock_update:
        response = client.patch("/trades/5", json=trade_data)

    assert response.status_code == 200
    updated_trade = mock_update.call_args.args[1]
    assert updated_trade["stop"] is None
    assert updated_trade["result"] is None


def test_get_statistics_reads_all_batches(authenticated_user):
    first_batch = [
        {"pnl": 1, "result": 1, "entry_datetime": "2026-08-12T10:00:00"}
    ] * 1000
    second_batch = [
        {"pnl": -1, "result": -1, "entry_datetime": "2026-08-13T10:00:00"}
    ]

    with patch(
        "api.load_trade_metrics_batch_from_supabase",
        side_effect=[first_batch, second_batch],
    ) as mock_load:
        response = client.get("/statistics?account_id=7")

    assert response.status_code == 200
    assert response.json()["total_trades"] == 1001
    assert response.json()["winning_trades"] == 1000
    assert response.json()["total_pnl"] == 999
    assert response.json()["total_r"] == 999
    assert response.json()["trades_with_r"] == 1001
    assert mock_load.call_args_list == [
        call(
            "test-user",
            "fake-token",
            7,
            offset=0,
            batch_size=1000,
            date_from=None,
            date_to=None,
        ),
        call(
            "test-user",
            "fake-token",
            7,
            offset=1000,
            batch_size=1000,
            date_from=None,
            date_to=None,
        ),
    ]


def test_get_calendar_reads_all_batches(authenticated_user):
    first_batch = [
        {"pnl": 1, "result": 1, "entry_datetime": "2026-09-12T10:00:00"}
    ] * 1000
    second_batch = [
        {"pnl": -1, "result": -1, "entry_datetime": "2026-09-13T10:00:00"}
    ]

    with patch(
        "api.load_calendar_metrics_batch_from_supabase",
        side_effect=[first_batch, second_batch],
    ) as mock_load:
        response = client.get("/calendar?account_id=7&year=2026&month=9")

    assert response.status_code == 200
    assert response.json()["total_trades"] == 1001
    assert response.json()["trading_days"] == 2
    assert response.json()["total_pnl"] == 999
    assert response.json()["total_r"] == 999
    assert mock_load.call_args_list == [
        call(
            "test-user",
            "fake-token",
            7,
            date(2026, 9, 1),
            date(2026, 10, 1),
            offset=0,
            batch_size=1000,
        ),
        call(
            "test-user",
            "fake-token",
            7,
            date(2026, 9, 1),
            date(2026, 10, 1),
            offset=1000,
            batch_size=1000,
        ),
    ]


def test_get_calendar_handles_december(authenticated_user):
    with patch("api.load_calendar_metrics_batch_from_supabase", return_value=[]) as mock_load:
        response = client.get("/calendar?account_id=7&year=2026&month=12")

    assert response.status_code == 200
    mock_load.assert_called_once_with(
        "test-user",
        "fake-token",
        7,
        date(2026, 12, 1),
        date(2027, 1, 1),
        offset=0,
        batch_size=1000,
    )


@pytest.mark.parametrize(
    "query_string",
    [
        "year=0&month=9",
        "year=9999&month=9",
        "year=2026&month=0",
        "year=2026&month=13",
    ],
)
def test_get_calendar_rejects_invalid_year_or_month(authenticated_user, query_string):
    response = client.get(f"/calendar?account_id=7&{query_string}")
    assert response.status_code == 422


def test_get_statistics_passes_date_filters(authenticated_user):
    with patch("api.load_trade_metrics_batch_from_supabase", return_value=[]) as mock_load:
        response = client.get(
            "/statistics?account_id=7&date_from=2026-08-01&date_to=2026-08-31"
        )

    assert response.status_code == 200
    mock_load.assert_called_once_with(
        "test-user",
        "fake-token",
        7,
        offset=0,
        batch_size=1000,
        date_from=date(2026, 8, 1),
        date_to=date(2026, 8, 31),
    )


def test_get_statistics_rejects_reversed_date_range(authenticated_user):
    with patch("api.load_trade_metrics_batch_from_supabase") as mock_load:
        response = client.get(
            "/statistics?account_id=7&date_from=2026-08-31&date_to=2026-08-01"
        )

    assert response.status_code == 422
    assert response.json() == {"detail": "date_from cannot be after date_to"}
    mock_load.assert_not_called()
