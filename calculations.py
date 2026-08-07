def calculate_r(direction, entry, stop, exit_price):
    if direction == "long":
        risk = entry - stop
        profit = exit_price - entry
    else:  # short
        risk = stop - entry
        profit = entry - exit_price

    if risk == 0:
        raise ValueError("Entry and stop cannot be the same")

    return profit / risk
