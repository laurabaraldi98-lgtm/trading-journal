import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

supabase = create_client(supabase_url, supabase_key)

trades = []

last_deleted_trade = None


def load_trades_from_supabase():
    response = supabase.table("trades").select("*").execute()

    loaded_trades = []

    for trade in response.data:
        loaded_trade = [
            trade["id"],
            trade["symbol"],
            trade["direction"],
            float(trade["entry"]),
            float(trade["stop"]),
            float(trade["exit_price"]),
            float(trade["result"])
        ]

        loaded_trades.append(loaded_trade)

    return loaded_trades


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

    saved_trade = response.data[0]

    return [
        saved_trade["id"],
        saved_trade["symbol"],
        saved_trade["direction"],
        float(saved_trade["entry"]),
        float(saved_trade["stop"]),
        float(saved_trade["exit_price"]),
        float(saved_trade["result"])
    ]


def delete_trade_from_supabase(trade_id):
    response = supabase.table("trades").delete().eq("id", trade_id).execute()

    return response


def restore_trade_to_supabase(trade):
    restored_trade = {
        "symbol": trade[1],
        "direction": trade[2],
        "entry": trade[3],
        "stop": trade[4],
        "exit_price": trade[5],
        "result": trade[6]
    }

    response = supabase.table("trades").insert(restored_trade).execute()

    saved_trade = response.data[0]

    return [
        saved_trade["id"],
        saved_trade["symbol"],
        saved_trade["direction"],
        float(saved_trade["entry"]),
        float(saved_trade["stop"]),
        float(saved_trade["exit_price"]),
        float(saved_trade["result"])
    ]


trades = load_trades_from_supabase()

while True:

    print("TRADING JOURNAL")
    print("1. Add a trade")
    print("2. View trades")
    print("3. View statistics")
    print("4. Delete a trade")
    print("5. Undo last deletion")
    print("6. Edit a trade")
    print("7. Exit")

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
        saved_trade = save_trade_to_supabase(trade)
        trades.append(saved_trade)

        print("Trade saved!")

    elif choice == "2":
        for number, trade in enumerate(trades, start=1):
            print("Symbol:", trade[1])
            print("Direction:", trade[2])
            print("Entry:", trade[3])
            print("Stop:", trade[4])
            print("Exit:", trade[5])
            print("Result:", round(trade[6], 2), "R")
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
                total = total + trade[6]

                if trade[6] > 0:
                    winners = winners + 1

                if trade[6] < 0:
                    losers = losers + 1

                if trade[6] == 0:
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
            print("Symbol:", trade[1])
            print("Direction:", trade[2])
            print("Entry:", trade[3])
            print("Stop:", trade[4])
            print("Exit:", trade[5])
            print("Result:", round(trade[6], 2), "R")
            print("-------------")

        trade_number_to_delete = get_integer(
            "Which trade do you want to delete? "
        )

        index_to_delete = trade_number_to_delete - 1

        if index_to_delete < 0 or index_to_delete >= len(trades):
            print("Invalid trade number.")
            continue

        trade_to_delete = trades[index_to_delete]

        print("You are about to delete this trade:")
        print("Symbol:", trade_to_delete[1])
        print("Direction:", trade_to_delete[2])
        print("Entry:", trade_to_delete[3])
        print("Stop:", trade_to_delete[4])
        print("Exit:", trade_to_delete[5])
        print("Result:", round(trade_to_delete[6], 2), "R")

        confirmation = input("Are you sure you want to delete it? yes/no: ")

        if confirmation == "yes":
            trade_id = trade_to_delete[0]

            delete_trade_from_supabase(trade_id)

            last_deleted_trade = trades.pop(index_to_delete)

            print("Trade deleted from Supabase!")

        else:
            print("Deletion cancelled.")

    elif choice == "5":

        if last_deleted_trade is None:
            print("There is no trade to recover.")

        else:
            restored_trade = restore_trade_to_supabase(last_deleted_trade)

            trades.append(restored_trade)

            last_deleted_trade = None

            print("Last deletion undone!")

    elif choice == "6":
        print("Edit in Supabase is not available yet.")

    elif choice == "7":
        print("Bye, journal closed")
        break

    else:
        print("Invalid choice")
