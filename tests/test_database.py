from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from datetime import datetime
from database import (
    load_trades_from_supabase,
    save_trade_to_supabase,
    delete_trade_from_supabase,
    update_trade_in_supabase,
)


def test_load_trades_from_supabase():
    fake_response = SimpleNamespace(
        data=[
            {
                "id": 1,
                "symbol": "EURUSD",
                "direction": "long",
                "entry": "1.15",
                "stop": "1.14",
                "exit": "1.17",
                "result": "2",
                "entry_datetime": "2026-08-12T10:00:00",
                "exit_datetime": "2026-08-12T11:00:00",
            }
        ]
    )

    mock_query = MagicMock()
    mock_query.select.return_value = mock_query
    mock_query.eq.return_value = mock_query
    mock_query.order.return_value = mock_query
    mock_query.execute.return_value = fake_response

    with patch("database.supabase.table", return_value=mock_query):
        trades = load_trades_from_supabase("user-123")

    assert trades == [
        [
            1,
            "EURUSD",
            "long",
            1.15,
            1.14,
            1.17,
            2.0,
            "2026-08-12T10:00:00",
            "2026-08-12T11:00:00",
        ]
    ]


def test_save_trade_to_supabase():
    fake_response = SimpleNamespace(
        data=[
            {
                "id": 10,
                "symbol": "EURUSD",
                "direction": "long",
                "entry": "1.15",
                "stop": "1.14",
                "exit": "1.17",
                "result": "2",
            }
        ]
    )

    mock_query = MagicMock()
    mock_query.insert.return_value = mock_query
    mock_query.execute.return_value = fake_response

    trade = [
        "EURUSD",
        "long",
        1.15,
        1.14,
        1.17,
        2,
        datetime(2026, 8, 12, 10, 0),
        datetime(2026, 8, 12, 11, 0),
    ]

    with patch("database.supabase.table", return_value=mock_query):
        saved_trade = save_trade_to_supabase(
            trade,
            "user-123"
        )

    expected_new_trade = {
        "symbol": "EURUSD",
        "direction": "long",
        "entry": 1.15,
        "stop": 1.14,
        "exit": 1.17,
        "result": 2,
        "entry_datetime": "2026-08-12T10:00:00",
        "exit_datetime": "2026-08-12T11:00:00",
        "user_id": "user-123",
    }

    mock_query.insert.assert_called_once_with(
        expected_new_trade
    )

    assert saved_trade == [
        10,
        "EURUSD",
        "long",
        1.15,
        1.14,
        1.17,
        2.0,
    ]


def test_save_trade_to_supabase_with_missing_dates():
    fake_response = SimpleNamespace(
        data=[
            {
                "id": 11,
                "symbol": "EURUSD",
                "direction": "long",
                "entry": "1.15",
                "stop": "1.14",
                "exit": "1.17",
                "result": "2",
            }
        ]
    )

    mock_query = MagicMock()
    mock_query.insert.return_value = mock_query
    mock_query.execute.return_value = fake_response

    trade = [
        "EURUSD",
        "long",
        1.15,
        1.14,
        1.17,
        2,
        None,
        None,
    ]

    with patch("database.supabase.table", return_value=mock_query):
        save_trade_to_supabase(
            trade,
            "user-123"
        )

    expected_new_trade = {
        "symbol": "EURUSD",
        "direction": "long",
        "entry": 1.15,
        "stop": 1.14,
        "exit": 1.17,
        "result": 2,
        "entry_datetime": None,
        "exit_datetime": None,
        "user_id": "user-123",
    }

    mock_query.insert.assert_called_once_with(
        expected_new_trade
    )


def test_delete_trade_from_supabase():
    fake_response = SimpleNamespace(data=[])

    mock_query = MagicMock()
    mock_query.delete.return_value = mock_query
    mock_query.eq.return_value = mock_query
    mock_query.execute.return_value = fake_response

    with patch("database.supabase.table", return_value=mock_query):
        response = delete_trade_from_supabase(
            5,
            "user-123"
        )

    mock_query.delete.assert_called_once()

    mock_query.eq.assert_any_call(
        "id",
        5
    )

    mock_query.eq.assert_any_call(
        "user_id",
        "user-123"
    )

    assert response == fake_response


def test_update_trade_in_supabase():
    fake_response = SimpleNamespace(data=[])

    mock_query = MagicMock()
    mock_query.update.return_value = mock_query
    mock_query.eq.return_value = mock_query
    mock_query.execute.return_value = fake_response

    updated_trade = [
        5,
        "GBPUSD",
        "short",
        1.30,
        1.31,
        1.28,
        2,
        datetime(2026, 8, 12, 12, 0),
        datetime(2026, 8, 12, 13, 0),
    ]

    with patch("database.supabase.table", return_value=mock_query):
        response = update_trade_in_supabase(
            5,
            updated_trade,
            "user-123"
        )

    expected_trade_data = {
        "symbol": "GBPUSD",
        "direction": "short",
        "entry": 1.30,
        "stop": 1.31,
        "exit": 1.28,
        "result": 2,
        "entry_datetime": "2026-08-12T12:00:00",
        "exit_datetime": "2026-08-12T13:00:00",
    }

    mock_query.update.assert_called_once_with(
        expected_trade_data
    )

    mock_query.eq.assert_any_call(
        "id",
        5
    )

    mock_query.eq.assert_any_call(
        "user_id",
        "user-123"
    )

    assert response == fake_response


def test_update_trade_in_supabase_with_missing_dates():
    fake_response = SimpleNamespace(data=[])

    mock_query = MagicMock()
    mock_query.update.return_value = mock_query
    mock_query.eq.return_value = mock_query
    mock_query.execute.return_value = fake_response

    updated_trade = [
        5,
        "GBPUSD",
        "short",
        1.30,
        1.31,
        1.28,
        2,
        None,
        None,
    ]

    with patch("database.supabase.table", return_value=mock_query):
        update_trade_in_supabase(
            5,
            updated_trade,
            "user-123"
        )

    expected_trade_data = {
        "symbol": "GBPUSD",
        "direction": "short",
        "entry": 1.30,
        "stop": 1.31,
        "exit": 1.28,
        "result": 2,
        "entry_datetime": None,
        "exit_datetime": None,
    }

    mock_query.update.assert_called_once_with(
        expected_trade_data
    )
