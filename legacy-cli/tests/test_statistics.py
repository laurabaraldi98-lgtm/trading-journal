from statistics import calculate_statistics


def test_statistics():
    trades = [
        [1, "XAUUSD", "long", 100, 90, 120, 2],
        [2, "EURUSD", "long", 100, 90, 95, -0.5],
        [3, "GBPUSD", "long", 100, 90, 100, 0]
    ]

    stats = calculate_statistics(trades)

    assert stats["total"] == 1.5
    assert stats["trade_count"] == 3
    assert stats["average"] == 0.5
    assert stats["winners"] == 1
    assert stats["losers"] == 1
    assert stats["breakeven"] == 1


def test_statistics_with_no_trades():
    stats = calculate_statistics([])

    assert stats["total"] == 0
    assert stats["trade_count"] == 0
    assert stats["average"] == 0
    assert stats["winners"] == 0
    assert stats["win_rate"] == 0
    assert stats["losers"] == 0
    assert stats["loss_rate"] == 0
    assert stats["breakeven"] == 0
