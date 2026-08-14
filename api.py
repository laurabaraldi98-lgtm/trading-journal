from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal
from datetime import datetime

from auth import get_current_user
from calculations import calculate_r
from database import (
    load_trades_from_supabase,
    save_trade_to_supabase,
    delete_trade_from_supabase,
    update_trade_in_supabase,
    load_user_settings,
    save_user_settings,
    load_accounts_from_supabase,
)


class TradeCreate(BaseModel):
    account_id: int
    symbol: str
    direction: Literal["long", "short"]
    entry: float
    stop: float
    exit: float
    entry_datetime: datetime | None = None
    exit_datetime: datetime | None = None


class TradeUpdate(BaseModel):
    symbol: str
    direction: Literal["long", "short"]
    entry: float
    stop: float
    exit: float
    entry_datetime: datetime | None = None
    exit_datetime: datetime | None = None


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Trading Journal API"}


@app.get("/trades")
def get_trades(auth_data=Depends(get_current_user)):
    user = auth_data["user"]
    token = auth_data["token"]

    return load_trades_from_supabase(
        user.id,
        token,
    )


@app.post("/trades")
def create_trade(
    trade: TradeCreate,
    auth_data=Depends(get_current_user),
):
    user = auth_data["user"]
    token = auth_data["token"]

    result = round(
        calculate_r(
            trade.direction,
            trade.entry,
            trade.stop,
            trade.exit,
        ),
        2,
    )

    trade_data = [
        trade.account_id,
        trade.symbol,
        trade.direction,
        trade.entry,
        trade.stop,
        trade.exit,
        result,
        trade.entry_datetime,
        trade.exit_datetime,
    ]

    return save_trade_to_supabase(
        trade_data,
        user.id,
        token,
    )


@app.delete("/trades/{trade_id}")
def delete_trade(
    trade_id: int,
    auth_data=Depends(get_current_user),
):
    user = auth_data["user"]
    token = auth_data["token"]

    return delete_trade_from_supabase(
        trade_id,
        user.id,
        token,
    )


@app.patch("/trades/{trade_id}")
def update_trade(
    trade_id: int,
    trade: TradeUpdate,
    auth_data=Depends(get_current_user),
):
    user = auth_data["user"]
    token = auth_data["token"]

    result = round(
        calculate_r(
            trade.direction,
            trade.entry,
            trade.stop,
            trade.exit,
        ),
        2,
    )

    updated_trade = [
        trade_id,
        trade.symbol,
        trade.direction,
        trade.entry,
        trade.stop,
        trade.exit,
        result,
        trade.entry_datetime,
        trade.exit_datetime,
    ]

    return update_trade_in_supabase(
        trade_id,
        updated_trade,
        user.id,
        token,
    )


@app.get("/accounts")
def get_accounts(auth_data=Depends(get_current_user)):
    user = auth_data["user"]
    token = auth_data["token"]

    return load_accounts_from_supabase(
        user.id,
        token,
    )


@app.get("/settings")
def get_settings(auth_data=Depends(get_current_user)):
    user = auth_data["user"]
    token = auth_data["token"]

    return load_user_settings(user.id, token)


@app.put("/settings")
def update_settings(
    settings: dict,
    auth_data=Depends(get_current_user),
):
    user = auth_data["user"]
    token = auth_data["token"]

    return save_user_settings(settings, user.id, token)
