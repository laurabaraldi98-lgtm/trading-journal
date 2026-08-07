import pytest

from calculations import calculate_r


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
