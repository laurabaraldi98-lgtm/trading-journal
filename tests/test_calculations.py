import pytest

from calculations import (
    calculate_dashboard_statistics,
    calculate_r,
)


def test_long_winning_trade():
    result = calculate_r("long", 100, 90, 120)

    assert result == 2


def test_long_losing_trade():
    result = calculate_r("long", 100, 90, 95)

    assert result == -0.5


def test_short_winning_trade():
    result = calculate_r("short", 100, 110, 80)

    assert result == 2


def test_breakeven_trade():
    result = calculate_r("long", 100, 90, 100)

    assert result == 0


def test_entry_equals_stop():
    with pytest.raises(ValueError):
        calculate_r("long", 100, 100, 120)


def test_calculate_dashboard_statistics():
    trades = [
        {"pnl": 100, "result": 2},
        {"pnl": -50, "result": -1},
        {"pnl": 25, "result": None},
    ]

    statistics = calculate_dashboard_statistics(trades)

    assert statistics["total_trades"] == 3
    assert statistics["winning_trades"] == 2
    assert statistics["total_pnl"] == 75
    assert statistics["total_r"] == 1
    assert statistics["trades_with_r"] == 2
    assert statistics["win_rate"] == pytest.approx(66.67, abs=0.01)
    assert statistics["average_r"] == pytest.approx(0.5)
