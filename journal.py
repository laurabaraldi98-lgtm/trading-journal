from calculations import calculate_r
from statistics import calculate_statistics
from database import (
    load_trades_from_supabase,
    save_trade_to_supabase,
    delete_trade_from_supabase,
    restore_trade_to_supabase,
    update_trade_in_supabase,
)

trades = []

last_deleted_trade = None


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
        stats = calculate_statistics(trades)

        if len(trades) == 0:
            print("You have not entered any trades yet.")

        else:
            print("Total R:", round(stats["total"], 2))
            print("Number of trades:", stats["trade_count"])
            print("Average R:", round(stats["average"], 2))
            print("Winning trades:", stats["winners"])
            print("Win rate:", round(stats["win_rate"], 2), "%")
            print("Losing trades:", stats["losers"])
            print("Loss rate:", round(stats["loss_rate"], 2), "%")
            print("Breakeven trades:", stats["breakeven"])

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
        for number, trade in enumerate(trades, start=1):
            print("Trade", number)
            print("Symbol:", trade[1])
            print("Direction:", trade[2])
            print("Entry:", trade[3])
            print("Stop:", trade[4])
            print("Exit:", trade[5])
            print("Result:", round(trade[6], 2), "R")
            print("-------------")

        trade_number_to_edit = get_integer("Which trade do you want to edit? ")
        index_to_edit = trade_number_to_edit - 1

        if index_to_edit < 0 or index_to_edit >= len(trades):
            print("Invalid trade number.")
            continue

        old_trade = trades[index_to_edit]
        trade_id = old_trade[0]

        print("You are editing this trade:")
        print("Symbol:", old_trade[1])
        print("Direction:", old_trade[2])
        print("Entry:", old_trade[3])
        print("Stop:", old_trade[4])
        print("Exit:", old_trade[5])
        print("Result:", round(old_trade[6], 2), "R")

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

        updated_trade = [
            trade_id,
            symbol,
            direction,
            entry,
            stop,
            exit_price,
            result
        ]

        update_trade_in_supabase(trade_id, updated_trade)

        trades[index_to_edit] = updated_trade

        print("Trade edited!")

    elif choice == "7":
        print("Bye, journal closed")
        break

    else:
        print("Invalid choice")
