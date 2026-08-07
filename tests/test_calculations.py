from calculations import calculate_r


def test_long_winning_trade():
    result = calculate_r(
        direction="long",
        entry=100,
        stop=90,
        exit_price=120
    )

    assert result == 2
