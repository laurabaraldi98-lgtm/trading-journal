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


def load_trades_from_supabase(
    user_id: str,
    token: str,
):
    client = get_authenticated_client(token)

    response = (
        client
        .table("trades")
        .select("*")
        .eq("user_id", user_id)
        .order(
            "entry_datetime",
            desc=True,
            nullsfirst=False,
        )
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
        "account_id": trade[0],
        "symbol": trade[1],
        "direction": trade[2],
        "entry": trade[3],
        "stop": trade[4],
        "exit": trade[5],
        "result": trade[6],
        "pnl": trade[7],
        "entry_datetime": (
            trade[8].isoformat()
            if trade[8]
            else None
        ),
        "exit_datetime": (
            trade[9].isoformat()
            if trade[9]
            else None
        ),
        "user_id": user_id,
    }

    response = (
        client
        .table("trades")
        .insert(new_trade)
        .execute()
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

    response = (
        client
        .table("trades")
        .delete()
        .eq("id", trade_id)
        .eq("user_id", user_id)
        .execute()
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
        "symbol": updated_trade[1],
        "direction": updated_trade[2],
        "entry": updated_trade[3],
        "stop": updated_trade[4],
        "exit": updated_trade[5],
        "result": updated_trade[6],
        "pnl": updated_trade[7],
        "entry_datetime": (
            updated_trade[8].isoformat()
            if updated_trade[8]
            else None
        ),
        "exit_datetime": (
            updated_trade[9].isoformat()
            if updated_trade[9]
            else None
        ),
    }

    response = (
        client
        .table("trades")
        .update(trade_data)
        .eq("id", trade_id)
        .eq("user_id", user_id)
        .execute()
    )

    return response


def load_user_settings(user_id: str, token: str):
    client = get_authenticated_client(token)

    response = (
        client.table("user_settings")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )

    return response.data


def save_user_settings(settings, user_id: str, token: str):
    client = get_authenticated_client(token)

    data = {
        "user_id": user_id,
        "account_size": settings["account_size"],
        "currency": settings["currency"],
    }

    response = (
        client.table("user_settings")
        .upsert(data)
        .execute()
    )

    return response.data


def load_accounts_from_supabase(
    user_id: str,
    token: str,
):
    client = get_authenticated_client(token)

    response = (
        client
        .table("accounts")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at")
        .execute()
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

    response = (
        client
        .table("accounts")
        .insert(data)
        .execute()
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

    response = (
        client
        .table("accounts")
        .update(data)
        .eq("id", account_id)
        .eq("user_id", user_id)
        .execute()
    )

    return response.data


def delete_account_from_supabase(
    account_id: int,
    user_id: str,
    token: str,
):
    client = get_authenticated_client(token)

    response = (
        client
        .table("accounts")
        .delete()
        .eq("id", account_id)
        .eq("user_id", user_id)
        .execute()
    )

    return response.data
