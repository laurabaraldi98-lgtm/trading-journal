import os

from datetime import datetime, timedelta, timezone
from supabase import create_client

from calculations import calculate_r
from database import (
    execute_query,
    supabase_key,
    supabase_url,
)


DEMO_ACCOUNT = {
    "name": "Demo Trading Account",
    "starting_balance": 100000,
    "currency": "USD",
    "broker": "Demo Broker",
    "account_type": "Prop Firm",
}


DEMO_TRADES = [
    {
        "symbol": "XAUUSD",
        "direction": "long",
        "entry": 2350,
        "stop": 2340,
        "exit": 2368,
        "pnl": 900,
        "days_ago": 18,
    },
    {
        "symbol": "EURUSD",
        "direction": "short",
        "entry": 1.0890,
        "stop": 1.0920,
        "exit": 1.0830,
        "pnl": 1000,
        "days_ago": 17,
    },
    {
        "symbol": "XAUUSD",
        "direction": "short",
        "entry": 2375,
        "stop": 2385,
        "exit": 2385,
        "pnl": -500,
        "days_ago": 16,
    },
    {
        "symbol": "GBPUSD",
        "direction": "long",
        "entry": 1.2720,
        "stop": 1.2680,
        "exit": 1.2780,
        "pnl": 750,
        "days_ago": 15,
    },
    {
        "symbol": "NAS100",
        "direction": "long",
        "entry": 19800,
        "stop": 19700,
        "exit": 19740,
        "pnl": -300,
        "days_ago": 14,
    },
    {
        "symbol": "EURUSD",
        "direction": "long",
        "entry": 1.0850,
        "stop": 1.0820,
        "exit": 1.0850,
        "pnl": 0,
        "days_ago": 13,
    },
    {
        "symbol": "XAUUSD",
        "direction": "long",
        "entry": 2360,
        "stop": 2350,
        "exit": 2385,
        "pnl": 1250,
        "days_ago": 12,
    },
    {
        "symbol": "GBPUSD",
        "direction": "short",
        "entry": 1.2800,
        "stop": 1.2840,
        "exit": 1.2840,
        "pnl": -500,
        "days_ago": 11,
    },
    {
        "symbol": "NAS100",
        "direction": "short",
        "entry": 19950,
        "stop": 20050,
        "exit": 19830,
        "pnl": 600,
        "days_ago": 10,
    },
    {
        "symbol": "XAUUSD",
        "direction": "short",
        "entry": 2390,
        "stop": 2400,
        "exit": 2384,
        "pnl": 300,
        "days_ago": 9,
    },
    {
        "symbol": "EURUSD",
        "direction": "long",
        "entry": 1.0910,
        "stop": 1.0870,
        "exit": 1.0890,
        "pnl": -250,
        "days_ago": 8,
    },
    {
        "symbol": "XAUUSD",
        "direction": "long",
        "entry": 2380,
        "stop": 2370,
        "exit": 2393,
        "pnl": 650,
        "days_ago": 7,
    },
    {
        "symbol": "GBPUSD",
        "direction": "long",
        "entry": 1.2750,
        "stop": 1.2700,
        "exit": 1.2850,
        "pnl": 1000,
        "days_ago": 6,
    },
    {
        "symbol": "NAS100",
        "direction": "long",
        "entry": 20100,
        "stop": 20000,
        "exit": 20000,
        "pnl": -500,
        "days_ago": 5,
    },
    {
        "symbol": "EURUSD",
        "direction": "short",
        "entry": 1.0940,
        "stop": 1.0970,
        "exit": 1.0889,
        "pnl": 850,
        "days_ago": 4,
    },
    {
        "symbol": "XAUUSD",
        "direction": "short",
        "entry": 2410,
        "stop": 2420,
        "exit": 2410,
        "pnl": 0,
        "days_ago": 3,
    },
]


def get_demo_client():
    email = os.getenv("DEMO_EMAIL")
    password = os.getenv("DEMO_PASSWORD")

    if not email or not password:
        raise RuntimeError(
            "Demo account is not configured"
        )

    client = create_client(
        supabase_url,
        supabase_key,
    )

    response = (
        client.auth.sign_in_with_password({
            "email": email,
            "password": password,
        })
    )

    if not response.session or not response.user:
        raise RuntimeError(
            "Demo login failed"
        )

    client.postgrest.auth(
        response.session.access_token
    )

    return client, response.user.id


def build_demo_trades(
    account_id,
    user_id,
):
    now = datetime.now(
        timezone.utc
    ).replace(
        minute=0,
        second=0,
        microsecond=0,
    )

    trades = []

    for trade in DEMO_TRADES:
        entry_datetime = (
            now
            - timedelta(
                days=trade["days_ago"]
            )
        )

        exit_datetime = (
            entry_datetime
            + timedelta(hours=2)
        )

        result = round(
            calculate_r(
                trade["direction"],
                trade["entry"],
                trade["stop"],
                trade["exit"],
            ),
            2,
        )

        trades.append({
            "account_id": account_id,
            "user_id": user_id,
            "symbol": trade["symbol"],
            "direction": trade["direction"],
            "entry": trade["entry"],
            "stop": trade["stop"],
            "exit": trade["exit"],
            "result": result,
            "pnl": trade["pnl"],
            "entry_datetime":
                entry_datetime.isoformat(),
            "exit_datetime":
                exit_datetime.isoformat(),
        })

    return trades


def reset_demo_data():
    client, user_id = (
        get_demo_client()
    )

    execute_query(
        client
        .table("trades")
        .delete()
        .eq("user_id", user_id)
    )

    execute_query(
        client
        .table("accounts")
        .delete()
        .eq("user_id", user_id)
    )

    account = {
        **DEMO_ACCOUNT,
        "user_id": user_id,
    }

    account_response = execute_query(
        client
        .table("accounts")
        .insert(account)
    )

    account_id = (
        account_response
        .data[0]["id"]
    )

    trades = build_demo_trades(
        account_id,
        user_id,
    )

    execute_query(
        client
        .table("trades")
        .insert(trades)
    )


def should_reset_demo():
    client, user_id = get_demo_client()

    response = execute_query(
        client
        .table("demo_state")
        .select("last_activity_at")
        .eq("user_id", user_id)
        .single()
    )

    last_activity = datetime.fromisoformat(
        response.data["last_activity_at"]
        .replace("Z", "+00:00")
    )

    inactive_for = (
        datetime.now(timezone.utc)
        - last_activity
    )

    return inactive_for >= timedelta(
        minutes=30
    )


def reset_demo_if_inactive():
    if should_reset_demo():
        reset_demo_data()
        print("Demo data reset.")
    else:
        print("Demo is active. Reset skipped.")


if __name__ == "__main__":  # pragma: no cover
    reset_demo_if_inactive()
