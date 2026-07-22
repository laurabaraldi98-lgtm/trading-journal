import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

supabase = create_client(supabase_url, supabase_key)

trades = []

last_deleted_trade = None

try:
    file = open("trades.txt", "r")
    lines = file.readlines()
    file.close()
except FileNotFoundError:
    lines = []

for line in lines:
    line = line.strip()
    parts = line.split(",")

    symbol = parts[0]
    direction = parts[1]
    entry = float(parts[2])
    stop = float(parts[3])
    exit_price = float(parts[4])
    result = float(parts[5])

    trade = [symbol, direction, entry, stop, exit_price, result]
    trades.append(trade)


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


def get_number(message):
    while True:
        try:
            number = float(input(message))
            return number
        except ValueError:
            print("Please enter a valid number.")


def get_integer(message):
    while True:
        try:
            number = int(input(message))
            return number
        except ValueError:
            print("Please enter a valid whole number.")


def save_trades():
    file = open("trades.txt", "w")

    for trade in trades:
        line = str(trade[0]) + "," + str(trade[1]) + "," + str(trade[2]) + \
            "," + str(trade[3]) + "," + str(trade[4]) + "," + str(trade[5])
        file.write(line + "\n")

    file.close()


def save_trade_to_supabase(trade):
    new_trade = {
        "symbol": trade[0],
        "direction": trade[1],
        "entry": trade[2],
        "stop": trade[3],
        "exit_price": trade[4],
        "result": trade[5]
    }

    response = supabase.table("trades").insert(new_trade).execute()

    return response


def load_trades_from_supabase():
    response = supabase.table("trades").select("*").execute()

    loaded_trades = []

    for trade in response.data:
        loaded_trade = [
            trade["symbol"],
            trade["direction"],
            float(trade["entry"]),
            float(trade["stop"]),
            float(trade["exit_price"]),
            float(trade["result"])
        ]

        loaded_trades.append(loaded_trade)

    return loaded_trades


while True:

    print("TRADING JOURNAL")
    print("1. Add a trade")
    print("2. View trades")
    print("3. View statistics")
    print("4. Delete a trade")
    print("5. Undo last deletion")
    print("6. Edit a trade")
    print("7. Exit")
    print("8. Load trades from Supabase")

    choice = input("Choose an option: ")

    if choice == "1":
        symbol = input("Symbol: ").lower()

        while True:
            direction = input("Direction long/short: ").lower()

            if direction == "long" or direction == "short":
                break
            else:
                print("Invalid direction. Type long or short.")

        entry = get_number("Entry price: ")
        stop = get_number("Stop loss: ")
        exit_price = get_number("Exit price: ")

        try:
            result = round(calculate_r(direction, entry, stop, exit_price), 2)
        except ValueError as e:
            print("Error:", e)
            continue

        trade = [symbol, direction, entry, stop, exit_price, result]
        trades.append(trade)
        save_trades()
        save_trade_to_supabase(trade)

        print("Trade saved!")

    elif choice == "2":
        for number, trade in enumerate(trades, start=1):
            print("Trade", number)
            print("Symbol:", trade[0])
            print("Direction:", trade[1])
            print("Entry:", trade[2])
            print("Stop:", trade[3])
            print("Exit:", trade[4])
            print("Result:", round(trade[5], 2), "R")
            print("-------------")

    elif choice == "3":
        if len(trades) == 0:
            print("You have not entered any trades yet.")

        else:
            total = 0
            winners = 0
            losers = 0
            breakeven = 0

            for trade in trades:
                total = total + trade[5]

                if trade[5] > 0:
                    winners = winners + 1

                if trade[5] < 0:
                    losers = losers + 1

                if trade[5] == 0:
                    breakeven = breakeven + 1

            trade_count = len(trades)
            average = total / trade_count
            win_rate = winners / trade_count * 100
            loss_rate = losers / trade_count * 100

            print("Total R:", round(total, 2))
            print("Number of trades:", trade_count)
            print("Average R:", round(average, 2))
            print("Winning trades:", winners)
            print("Win rate:", round(win_rate, 2), "%")
            print("Losing trades:", losers)
            print("Loss rate:", round(loss_rate, 2), "%")
            print("Breakeven trades:", breakeven)

    elif choice == "4":
        for number, trade in enumerate(trades, start=1):
            print("Trade", number)
            print("Symbol:", trade[0])
            print("Direction:", trade[1])
            print("Entry:", trade[2])
            print("Stop:", trade[3])
            print("Exit:", trade[4])
            print("Result:", round(trade[5], 2), "R")
            print("-------------")

        trade_number_to_delete = get_integer(
            "Which trade do you want to delete? ")

        index_to_delete = trade_number_to_delete - 1

        if index_to_delete < 0 or index_to_delete >= len(trades):
            print("Invalid trade number.")
            continue

        trade_to_delete = trades[index_to_delete]

        print("You are about to delete this trade:")
        print("Symbol:", trade_to_delete[0])
        print("Direction:", trade_to_delete[1])
        print("Entry:", trade_to_delete[2])
        print("Stop:", trade_to_delete[3])
        print("Exit:", trade_to_delete[4])
        print("Result:", round(trade_to_delete[5], 2), "R")

        confirmation = input("Are you sure you want to delete it? yes/no: ")

        if confirmation == "yes":
            last_deleted_trade = trades.pop(index_to_delete)

            save_trades()

            print("Trade deleted!")

        else:
            print("Deletion cancelled.")

    elif choice == "5":

        if last_deleted_trade is None:
            print("There is no trade to recover.")

        else:
            trades.append(last_deleted_trade)

            save_trades()

            last_deleted_trade = None

            print("Last deletion undone!")

    elif choice == "6":
        for number, trade in enumerate(trades, start=1):
            print("Trade", number)
            print("Symbol:", trade[0])
            print("Direction:", trade[1])
            print("Entry:", trade[2])
            print("Stop:", trade[3])
            print("Exit:", trade[4])
            print("Result:", round(trade[5], 2), "R")
            print("-------------")

        trade_number_to_edit = get_integer("Which trade do you want to edit? ")
        index_to_edit = trade_number_to_edit - 1

        if index_to_edit < 0 or index_to_edit >= len(trades):
            print("Invalid trade number.")
            continue

        old_trade = trades[index_to_edit]

        print("You are editing this trade:")
        print("Symbol:", old_trade[0])
        print("Direction:", old_trade[1])
        print("Entry:", old_trade[2])
        print("Stop:", old_trade[3])
        print("Exit:", old_trade[4])
        print("Result:", round(old_trade[5], 2), "R")

        symbol = input("New symbol: ").lower()

        while True:
            direction = input("New direction long/short: ").lower()

            if direction == "long" or direction == "short":
                break
            else:
                print("Invalid direction. Type long or short.")

        entry = get_number("New entry price: ")
        stop = get_number("New stop loss: ")
        exit_price = get_number("New exit price: ")

        try:
            result = round(calculate_r(direction, entry, stop, exit_price), 2)
        except ValueError as e:
            print("Error:", e)
            continue

        new_trade = [symbol, direction, entry, stop, exit_price, result]

        trades[index_to_edit] = new_trade

        save_trades()

        print("Trade edited!")

    elif choice == "7":
        print("Bye, journal closed")
        break

    elif choice == "8":
        trades = load_trades_from_supabase()
        print("Trades loaded from Supabase!")

    else:
        print("Invalid choice")
