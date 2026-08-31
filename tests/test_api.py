import pytest

from datetime import datetime
from types import SimpleNamespace
from unittest.mock import patch
from database import (
    DatabaseError,
    ResourceNotFoundError,
)

from fastapi.testclient import TestClient

from api import MAX_CSV_FILE_SIZE, app
from auth import get_current_user


client = TestClient(app)


def fake_current_user():
    return {
        "user": SimpleNamespace(id="test-user"),
        "token": "fake-token",
    }


@pytest.fixture
def authenticated_user():
    app.dependency_overrides[get_current_user] = fake_current_user

    yield

    app.dependency_overrides.clear()


def test_root():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "message": "Trading Journal API"
    }


def test_demo_login():
    fake_session = {
        "access_token": "access-token",
        "refresh_token": "refresh-token",
    }

    with patch(
        "api.get_demo_session",
        return_value=fake_session,
    ) as mock_demo_session:
        response = client.post(
            "/demo-login"
        )

    assert response.status_code == 200
    assert response.json() == fake_session

    mock_demo_session.assert_called_once_with()


def test_get_trades(authenticated_user):
    fake_trades = [
        [
            1,
            "eurusd",
            "long",
            1.10,
            1.09,
            1.12,
            2.0,
            400.0,
        ]
    ]

    with patch(
        "api.load_trades_from_supabase",
        return_value=fake_trades,
    ) as mock_load:
        response = client.get("/trades")

    assert response.status_code == 200
    assert response.json() == fake_trades

    mock_load.assert_called_once_with(
        "test-user",
        "fake-token",
        None,
    )


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

    with (
        patch(
            "api.account_belongs_to_user",
            return_value=True,
        ),
        patch(
            "api.save_trade_to_supabase",
            return_value=trade_data,
        ),
    ):
        response = client.post(
            "/trades",
            json=trade_data,
        )

    assert response.status_code == 200
    assert response.json() == trade_data


@pytest.mark.parametrize(
    "field,value",
    [
        ("direction", None),
        ("symbol", ""),
    ],
)
def test_create_trade_rejects_invalid_fields(
    authenticated_user,
    field,
    value,
):
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

    response = client.post(
        "/trades",
        json=trade_data,
    )

    assert response.status_code == 422


def test_create_trade_rejects_exit_before_entry(
    authenticated_user,
):
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

    response = client.post(
        "/trades",
        json=trade_data,
    )

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
def test_rejects_entry_equal_to_stop(
    authenticated_user,
    method,
    url,
    trade_data,
):
    response = getattr(client, method)(
        url,
        json=trade_data,
    )

    assert response.status_code == 422


def test_create_trade_passes_correct_data_to_save(
    authenticated_user,
):
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
        patch(
            "api.account_belongs_to_user",
            return_value=True,
        ),
        patch(
            "api.save_trade_to_supabase"
        ) as mock_save,
    ):
        client.post(
            "/trades",
            json=trade_data,
        )

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
    with patch(
        "api.delete_trade_from_supabase",
        return_value={
            "message": "Trade deleted"
        },
    ) as mock_delete:
        response = client.delete(
            "/trades/5"
        )

    assert response.status_code == 200
    assert response.json() == {
        "message": "Trade deleted"
    }

    mock_delete.assert_called_once_with(
        5,
        "test-user",
        "fake-token",
    )


def test_delete_trade_invalid_id(
    authenticated_user,
):
    response = client.delete(
        "/trades/banana"
    )

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

    fake_response = [
        5,
        "eurusd",
        "long",
        1.12,
        1.11,
        1.14,
        2.0,
        400.0,
        "2026-08-12T10:00:00",
        "2026-08-12T11:00:00",
    ]

    with patch(
        "api.update_trade_in_supabase",
        return_value=fake_response,
    ) as mock_update:
        response = client.patch(
            "/trades/5",
            json=trade_data,
        )

    assert response.status_code == 200
    assert response.json() == fake_response

    mock_update.assert_called_once_with(
        5,
        expected_trade_for_database,
        "test-user",
        "fake-token",
    )


def test_update_trade_invalid_id(
    authenticated_user,
):
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

    response = client.patch(
        "/trades/banana",
        json=trade_data,
    )

    assert response.status_code == 422


def test_update_trade_invalid_direction(
    authenticated_user,
):
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

    response = client.patch(
        "/trades/5",
        json=trade_data,
    )

    assert response.status_code == 422


def test_database_error_returns_503(
    authenticated_user,
):
    with patch(
        "api.load_trades_from_supabase",
        side_effect=DatabaseError(
            "Database request failed"
        ),
    ):
        response = client.get("/trades")

    assert response.status_code == 503
    assert response.json() == {
        "detail": "Database service unavailable"
    }


def test_resource_not_found_returns_404(
    authenticated_user,
):
    with patch(
        "api.delete_trade_from_supabase",
        side_effect=ResourceNotFoundError(
            "Trade not found"
        ),
    ):
        response = client.delete(
            "/trades/999999"
        )

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Trade not found"
    }


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

    with patch(
        "api.load_accounts_from_supabase",
        return_value=fake_accounts,
    ) as mock_load_accounts:
        response = client.get("/accounts")

    assert response.status_code == 200
    assert response.json() == fake_accounts

    mock_load_accounts.assert_called_once_with(
        "test-user",
        "fake-token",
    )


def test_create_account(authenticated_user):
    account_data = {
        "name": "FTMO 100K",
        "starting_balance": 100000,
        "currency": "USD",
        "broker": "FTMO",
        "account_type": "Prop Firm",
    }

    fake_response = [
        {
            "id": 2,
            "user_id": "test-user",
            **account_data,
        }
    ]

    with patch(
        "api.save_account_to_supabase",
        return_value=fake_response,
    ) as mock_save_account:
        response = client.post(
            "/accounts",
            json=account_data,
        )

    assert response.status_code == 200
    assert response.json() == fake_response

    mock_save_account.assert_called_once_with(
        account_data,
        "test-user",
        "fake-token",
    )


def test_create_trade_returns_404_for_invalid_account(
    authenticated_user,
):
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

    with patch(
        "api.account_belongs_to_user",
        return_value=False,
    ):
        response = client.post(
            "/trades",
            json=trade,
        )

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Account not found"
    }


def test_update_account(authenticated_user):
    account_data = {
        "name": "FTMO Updated",
        "starting_balance": 120000,
        "currency": "EUR",
        "broker": "FTMO",
        "account_type": "Prop Firm",
    }

    fake_response = [
        {
            "id": 2,
            "user_id": "test-user",
            **account_data,
        }
    ]

    with patch(
        "api.update_account_in_supabase",
        return_value=fake_response,
    ) as mock_update_account:
        response = client.patch(
            "/accounts/2",
            json=account_data,
        )

    assert response.status_code == 200
    assert response.json() == fake_response

    mock_update_account.assert_called_once_with(
        2,
        account_data,
        "test-user",
        "fake-token",
    )


def test_delete_account(authenticated_user):
    fake_response = [
        {
            "id": 2,
            "user_id": "test-user",
            "name": "FTMO 100K",
        }
    ]

    with patch(
        "api.delete_account_from_supabase",
        return_value=fake_response,
    ) as mock_delete_account:
        response = client.delete(
            "/accounts/2"
        )

    assert response.status_code == 200
    assert response.json() == fake_response

    mock_delete_account.assert_called_once_with(
        2,
        "test-user",
        "fake-token",
    )


def test_create_trade_without_stop(
    authenticated_user,
):
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

    with (
        patch(
            "api.account_belongs_to_user",
            return_value=True,
        ),
        patch(
            "api.save_trade_to_supabase",
            return_value=trade_data,
        ) as mock_save,
    ):
        response = client.post(
            "/trades",
            json=trade_data,
        )

    assert response.status_code == 200

    saved_trade = mock_save.call_args.args[0]

    assert saved_trade["stop"] is None
    assert saved_trade["result"] is None


def test_update_trade_without_stop(
    authenticated_user,
):
    trade_data = {
        "symbol": "eurusd",
        "direction": "long",
        "entry": 1.12,
        "exit": 1.14,
        "pnl": 400,
        "entry_datetime": "2026-08-12T10:00:00",
        "exit_datetime": "2026-08-12T11:00:00",
    }

    with patch(
        "api.update_trade_in_supabase",
        return_value=trade_data,
    ) as mock_update:
        response = client.patch(
            "/trades/5",
            json=trade_data,
        )

    assert response.status_code == 200

    updated_trade = mock_update.call_args.args[1]

    assert updated_trade["stop"] is None
    assert updated_trade["result"] is None


def test_preview_csv(authenticated_user):
    content = (
        b"Instrument,Side,Open Price\n"
        b"EURUSD,Buy,1.15\n"
        b"XAUUSD,Sell,2350\n"
    )

    response = client.post(
        "/imports/preview",
        files={
            "file": (
                "trades.csv",
                content,
                "text/csv",
            )
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "filename": "trades.csv",
        "delimiter": ",",
        "headers": [
            "Instrument",
            "Side",
            "Open Price",
        ],
        "row_count": 2,
        "sample_rows": [
            {
                "Instrument": "EURUSD",
                "Side": "Buy",
                "Open Price": "1.15",
            },
            {
                "Instrument": "XAUUSD",
                "Side": "Sell",
                "Open Price": "2350",
            },
        ],
        "mapping": {
            "symbol": "Instrument",
            "direction": "Side",
            "entry": "Open Price",
        },
        "ambiguous_fields": {},
        "unmapped_headers": [],
    }


def test_preview_csv_without_auth_returns_401():
    response = client.post(
        "/imports/preview",
        files={
            "file": (
                "trades.csv",
                b"symbol,direction\nEURUSD,long",
                "text/csv",
            )
        },
    )

    assert response.status_code == 401


def test_preview_csv_returns_400_for_invalid_file(
    authenticated_user,
):
    response = client.post(
        "/imports/preview",
        files={
            "file": (
                "trades.txt",
                b"symbol,direction\nEURUSD,long",
                "text/plain",
            )
        },
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "Please upload a CSV file"
    }


def test_preview_csv_rejects_file_over_size_limit(
    authenticated_user,
):
    oversized_content = b"a" * (
        MAX_CSV_FILE_SIZE + 1
    )

    response = client.post(
        "/imports/preview",
        files={
            "file": (
                "trades.csv",
                oversized_content,
                "text/csv",
            )
        },
    )

    assert response.status_code == 413
    assert response.json() == {
        "detail": "CSV file must not exceed 5 MB"
    }


def test_validate_csv_import(authenticated_user):
    content = (
        "Instrument;Side;Open Price;Stop Loss;"
        "Close Price;Profit;Open Time;Close Time\n"
        "EURUSD;Buy;1,1500;1,1400;"
        "1,1700;€200,00;"
        "30/08/2026 10:00;30/08/2026 11:00\n"
    ).encode("utf-8")

    response = client.post(
        "/imports/validate",
        files={
            "file": (
                "trades.csv",
                content,
                "text/csv",
            )
        },
        data={
            "mapping": (
                '{"symbol":"Instrument",'
                '"direction":"Side",'
                '"entry":"Open Price",'
                '"stop":"Stop Loss",'
                '"exit":"Close Price",'
                '"pnl":"Profit",'
                '"entry_datetime":"Open Time",'
                '"exit_datetime":"Close Time"}'
            ),
            "decimal_separator": ",",
            "date_format": "%d/%m/%Y %H:%M",
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "total_rows": 1,
        "valid_count": 1,
        "invalid_count": 0,
        "valid_rows": [
            {
                "row": 2,
                "trade": {
                    "symbol": "EURUSD",
                    "direction": "long",
                    "entry": 1.15,
                    "stop": 1.14,
                    "exit": 1.17,
                    "pnl": 200.0,
                    "entry_datetime": "2026-08-30T10:00:00",
                    "exit_datetime": "2026-08-30T11:00:00",
                },
            }
        ],
        "errors": [],
    }


def test_validate_csv_import_without_auth_returns_401():
    response = client.post(
        "/imports/validate",
        files={
            "file": (
                "trades.csv",
                b"symbol,direction\nEURUSD,long",
                "text/csv",
            )
        },
        data={
            "mapping": "{}",
            "decimal_separator": ".",
        },
    )

    assert response.status_code == 401


@pytest.mark.parametrize(
    "mapping",
    [
        "not valid JSON",
        '{"symbol": 123}',
    ],
)
def test_validate_csv_import_rejects_invalid_mapping(
    authenticated_user,
    mapping,
):
    response = client.post(
        "/imports/validate",
        files={
            "file": (
                "trades.csv",
                b"symbol,direction\nEURUSD,long",
                "text/csv",
            )
        },
        data={
            "mapping": mapping,
            "decimal_separator": ".",
        },
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": (
            "Mapping must be a JSON object "
            "containing string keys and values"
        )
    }


def test_validate_csv_import_rejects_invalid_file(
    authenticated_user,
):
    response = client.post(
        "/imports/validate",
        files={
            "file": (
                "trades.txt",
                b"symbol,direction\nEURUSD,long",
                "text/plain",
            )
        },
        data={
            "mapping": "{}",
            "decimal_separator": ".",
        },
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "Please upload a CSV file"
    }


IMPORT_MAPPING = (
    '{"symbol":"Instrument","direction":"Side","entry":"Open Price",'
    '"stop":"Stop Loss","exit":"Close Price","pnl":"Profit",'
    '"entry_datetime":"Open Time","exit_datetime":"Close Time"}'
)

VALID_IMPORT_CSV = (
    "Instrument;Side;Open Price;Stop Loss;Close Price;Profit;"
    "Open Time;Close Time\n"
    "EURUSD;Buy;1,1500;1,1400;1,1700;€200,00;"
    "30/08/2026 10:00;30/08/2026 11:00\n"
).encode("utf-8")


def _post_csv_import(content=VALID_IMPORT_CSV):
    return client.post(
        "/imports",
        files={"file": ("trades.csv", content, "text/csv")},
        data={
            "account_id": "7",
            "mapping": IMPORT_MAPPING,
            "decimal_separator": ",",
            "date_format": "%d/%m/%Y %H:%M",
        },
    )


def test_imports_valid_csv(authenticated_user):
    with (
        patch("api.account_belongs_to_user", return_value=True),
        patch(
            "api.save_trades_to_supabase",
            return_value=[{"id": 10}],
        ) as mock_save,
    ):
        response = _post_csv_import()

    assert response.status_code == 200
    assert response.json() == {"imported_count": 1}

    saved_trades = mock_save.call_args.args[0]
    assert saved_trades == [
        {
            "account_id": 7,
            "symbol": "EURUSD",
            "direction": "long",
            "entry": 1.15,
            "stop": 1.14,
            "exit": 1.17,
            "result": 2.0,
            "pnl": 200.0,
            "entry_datetime": datetime(2026, 8, 30, 10, 0),
            "exit_datetime": datetime(2026, 8, 30, 11, 0),
        }
    ]
    assert mock_save.call_args.args[1:] == ("test-user", "fake-token")


def test_import_rejects_account_not_owned_by_user(authenticated_user):
    with (
        patch("api.account_belongs_to_user", return_value=False),
        patch("api.save_trades_to_supabase") as mock_save,
    ):
        response = _post_csv_import()

    assert response.status_code == 404
    assert response.json() == {"detail": "Account not found"}
    mock_save.assert_not_called()


def test_import_rejects_invalid_rows(authenticated_user):
    invalid_csv = VALID_IMPORT_CSV.replace(b"Buy", b"Hold")

    with (
        patch("api.account_belongs_to_user", return_value=True),
        patch("api.save_trades_to_supabase") as mock_save,
    ):
        response = _post_csv_import(invalid_csv)

    assert response.status_code == 422
    assert response.json()["detail"]["message"] == "CSV contains invalid rows"
    assert response.json()["detail"]["errors"] == [
        {
            "row": 2,
            "field": "direction",
            "message": "Unsupported direction value: Hold",
        }
    ]
    mock_save.assert_not_called()


def test_import_rejects_csv_without_trades(authenticated_user):
    empty_csv = (
        "Instrument;Side;Open Price;Stop Loss;Close Price;Profit;"
        "Open Time;Close Time\n"
    ).encode("utf-8")

    with (
        patch("api.account_belongs_to_user", return_value=True),
        patch("api.save_trades_to_supabase") as mock_save,
    ):
        response = _post_csv_import(empty_csv)

    assert response.status_code == 400
    assert response.json() == {"detail": "CSV file contains no trades"}
    mock_save.assert_not_called()


def test_import_without_auth_returns_401():
    response = _post_csv_import()

    assert response.status_code == 401


def test_import_rejects_invalid_file(authenticated_user):
    with (
        patch("api.account_belongs_to_user", return_value=True),
        patch("api.save_trades_to_supabase") as mock_save,
    ):
        response = client.post(
            "/imports",
            files={
                "file": (
                    "trades.txt",
                    b"symbol,direction\nEURUSD,long",
                    "text/plain",
                )
            },
            data={
                "account_id": "7",
                "mapping": "{}",
                "decimal_separator": ".",
            },
        )

    assert response.status_code == 400
    assert response.json() == {"detail": "Please upload a CSV file"}
    mock_save.assert_not_called()
