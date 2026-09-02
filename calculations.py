def calculate_r(direction, entry, stop, exit):
    if direction == "long":
        risk = entry - stop
        profit = exit - entry
    else:  # short
        risk = stop - entry
        profit = entry - exit

    if risk == 0:
        raise ValueError("Entry and stop cannot be the same")

    return profit / risk


def calculate_dashboard_statistics(trades):
    total_trades = 0
    winning_trades = 0
    total_pnl = 0.0
    total_r = 0.0
    trades_with_r = 0

    for trade in trades:
        pnl = float(trade["pnl"])
        result = trade["result"]

        total_trades += 1
        total_pnl += pnl

        if pnl > 0:
            winning_trades += 1

        if result is not None:
            total_r += float(result)
            trades_with_r += 1

    win_rate = (
        winning_trades / total_trades * 100
        if total_trades > 0
        else 0.0
    )

    average_r = (
        total_r / trades_with_r
        if trades_with_r > 0
        else None
    )

    return {
        "total_trades": total_trades,
        "winning_trades": winning_trades,
        "total_pnl": total_pnl,
        "total_r": total_r if trades_with_r > 0 else None,
        "trades_with_r": trades_with_r,
        "win_rate": win_rate,
        "average_r": average_r,
    }
