import os

from dotenv import load_dotenv
from supabase import create_client


load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

supabase = create_client(
    supabase_url,
    supabase_key,
)


def get_authenticated_client(token: str):
    client = create_client(
        supabase_url,
        supabase_key,
    )

    client.postgrest.auth(token)

    return client


class DatabaseError(Exception):
    pass


def execute_query(query):
    try:
        return query.execute()
    except Exception as error:
        raise DatabaseError(
            "Database request failed"
        ) from error


def load_trades_from_supabase(
    user_id: str,
    token: str,
    account_id: int | None = None,
):
    client = get_authenticated_client(token)

    query = (
        client
        .table("trades")
        .select("*")
        .eq("user_id", user_id)
    )

    if account_id is not None:
        query = query.eq("account_id", account_id)

    response = execute_query(
        query.order(
            "entry_datetime",
            desc=True,
            nullsfirst=False,
        )
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
            float(trade["pnl"]),
            trade["entry_datetime"],
            trade["exit_datetime"],
        ]

        loaded_trades.append(loaded_trade)

    return loaded_trades


def save_trade_to_supabase(
    trade,
    user_id: str,
    token: str,
):
    client = get_authenticated_client(token)

    new_trade = {
        "account_id": trade["account_id"],
        "symbol": trade["symbol"],
        "direction": trade["direction"],
        "entry": trade["entry"],
        "stop": trade["stop"],
        "exit": trade["exit"],
        "result": trade["result"],
        "pnl": trade["pnl"],
        "entry_datetime": (
            trade["entry_datetime"].isoformat()
            if trade["entry_datetime"]
            else None
        ),
        "exit_datetime": (
            trade["exit_datetime"].isoformat()
            if trade["exit_datetime"]
            else None
        ),
        "user_id": user_id,
    }

    response = execute_query(
        client
        .table("trades")
        .insert(new_trade)
    )

    saved_trade = response.data[0]

    return [
        saved_trade["id"],
        saved_trade["symbol"],
        saved_trade["direction"],
        float(saved_trade["entry"]),
        float(saved_trade["stop"]),
        float(saved_trade["exit"]),
        float(saved_trade["result"]),
        float(saved_trade["pnl"]),
    ]


def delete_trade_from_supabase(
    trade_id,
    user_id: str,
    token: str,
):
    client = get_authenticated_client(token)

    response = execute_query(
        client
        .table("trades")
        .delete()
        .eq("id", trade_id)
        .eq("user_id", user_id)
    )

    return response


def update_trade_in_supabase(
    trade_id,
    updated_trade,
    user_id: str,
    token: str,
):
    client = get_authenticated_client(token)

    trade_data = {
        "symbol": updated_trade["symbol"],
        "direction": updated_trade["direction"],
        "entry": updated_trade["entry"],
        "stop": updated_trade["stop"],
        "exit": updated_trade["exit"],
        "result": updated_trade["result"],
        "pnl": updated_trade["pnl"],
        "entry_datetime": (
            updated_trade["entry_datetime"].isoformat()
            if updated_trade["entry_datetime"]
            else None
        ),
        "exit_datetime": (
            updated_trade["exit_datetime"].isoformat()
            if updated_trade["exit_datetime"]
            else None
        ),
    }

    response = execute_query(
        client
        .table("trades")
        .update(trade_data)
        .eq("id", trade_id)
        .eq("user_id", user_id)
    )

    return response


def load_accounts_from_supabase(
    user_id: str,
    token: str,
):
    client = get_authenticated_client(token)

    response = execute_query(
        client
        .table("accounts")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at")
    )

    return response.data


def save_account_to_supabase(
    account,
    user_id: str,
    token: str,
):
    client = get_authenticated_client(token)

    data = {
        "user_id": user_id,
        "name": account["name"],
        "starting_balance": account["starting_balance"],
        "currency": account["currency"],
        "broker": account.get("broker"),
        "account_type": account.get("account_type"),
    }

    response = execute_query(
        client
        .table("accounts")
        .insert(data)
    )

    return response.data


def update_account_in_supabase(
    account_id: int,
    account,
    user_id: str,
    token: str,
):
    client = get_authenticated_client(token)

    data = {
        "name": account["name"],
        "starting_balance": account["starting_balance"],
        "currency": account["currency"],
        "broker": account.get("broker"),
        "account_type": account.get("account_type"),
    }

    response = execute_query(
        client
        .table("accounts")
        .update(data)
        .eq("id", account_id)
        .eq("user_id", user_id)
    )

    return response.data


def delete_account_from_supabase(
    account_id: int,
    user_id: str,
    token: str,
):
    client = get_authenticated_client(token)

    response = execute_query(
        client
        .table("accounts")
        .delete()
        .eq("id", account_id)
        .eq("user_id", user_id)
    )

    return response.data
