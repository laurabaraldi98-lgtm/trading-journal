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
