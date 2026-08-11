import os

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

supabase = create_client(supabase_url, supabase_key)


def load_trades_from_supabase(user_id: str):
    response = (
        supabase
        .table("trades")
        .select("*")
        .eq("user_id", user_id)
        .order("entry_datetime", desc=True, nullsfirst=False)
        .execute()
    )

    loaded_trades = []

    for trade in response.data:
        loaded_trade = [
            trade["id"],
            trade["symbol"],
            trade["direction"],
            float(trade["entry"]),
            float(trade["stop"]),
            float(trade["exit"]),
            float(trade["result"]),
            trade["entry_datetime"],
            trade["exit_datetime"]
        ]

        loaded_trades.append(loaded_trade)

    return loaded_trades


def save_trade_to_supabase(trade, user_id: str):
    new_trade = {
        "symbol": trade[0],
        "direction": trade[1],
        "entry": trade[2],
        "stop": trade[3],
        "exit": trade[4],
        "result": trade[5],
        "entry_datetime": trade[6].isoformat() if trade[6] else None,
        "exit_datetime": trade[7].isoformat() if trade[7] else None,
        "user_id": user_id
    }

    response = supabase.table("trades").insert(new_trade).execute()

    saved_trade = response.data[0]

    return [
        saved_trade["id"],
        saved_trade["symbol"],
        saved_trade["direction"],
        float(saved_trade["entry"]),
        float(saved_trade["stop"]),
        float(saved_trade["exit"]),
        float(saved_trade["result"])
    ]


def delete_trade_from_supabase(trade_id, user_id: str):
    response = (
        supabase
        .table("trades")
        .delete()
        .eq("id", trade_id)
        .eq("user_id", user_id)
        .execute()
    )

    return response


def update_trade_in_supabase(trade_id, updated_trade, user_id: str):
    trade_data = {
        "symbol": updated_trade[1],
        "direction": updated_trade[2],
        "entry": updated_trade[3],
        "stop": updated_trade[4],
        "exit": updated_trade[5],
        "result": updated_trade[6],
        "entry_datetime": updated_trade[7].isoformat() if updated_trade[7] else None,
        "exit_datetime": updated_trade[8].isoformat() if updated_trade[8] else None
    }

    response = (
        supabase
        .table("trades")
        .update(trade_data)
        .eq("id", trade_id)
        .eq("user_id", user_id)
        .execute()
    )

    return response
