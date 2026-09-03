import pytest

from calculations import (
    MAX_CHART_POINTS,
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
    assert statistics["performance"] == {
        "r": [
            {"trade_number": 1, "value": 2},
            {"trade_number": 2, "value": 1},
        ],
        "pnl": [
            {"trade_number": 1, "value": 100},
            {"trade_number": 2, "value": 50},
            {"trade_number": 3, "value": 75},
        ],
    }


def test_dashboard_performance_limits_chart_points():
    trades = [
        {"pnl": 1, "result": 1}
        for _ in range(1000)
    ]

    statistics = calculate_dashboard_statistics(trades)
    pnl_points = statistics["performance"]["pnl"]
    r_points = statistics["performance"]["r"]

    assert len(pnl_points) <= MAX_CHART_POINTS
    assert len(r_points) <= MAX_CHART_POINTS
    assert pnl_points[-1] == {
        "trade_number": 1000,
        "value": 1000,
    }
    assert r_points[-1] == {
        "trade_number": 1000,
        "value": 1000,
    }
