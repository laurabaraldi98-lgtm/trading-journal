def calculate_statistics(trades):
    total = 0
    winners = 0
    losers = 0
    breakeven = 0

    for trade in trades:
        total = total + trade[6]

        if trade[6] > 0:
            winners = winners + 1

        if trade[6] < 0:
            losers = losers + 1

        if trade[6] == 0:
            breakeven = breakeven + 1

    trade_count = len(trades)

    if trade_count == 0:
        return {
            "total": 0,
            "trade_count": 0,
            "average": 0,
            "winners": 0,
            "win_rate": 0,
            "losers": 0,
            "loss_rate": 0,
            "breakeven": 0
        }

    average = total / trade_count
    win_rate = winners / trade_count * 100
    loss_rate = losers / trade_count * 100

    return {
        "total": total,
        "trade_count": trade_count,
        "average": average,
        "winners": winners,
        "win_rate": win_rate,
        "losers": losers,
        "loss_rate": loss_rate,
        "breakeven": breakeven
    }
