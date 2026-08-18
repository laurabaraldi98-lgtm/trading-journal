from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, model_validator
from typing import Literal
import os
from datetime import datetime

from auth import get_current_user
from calculations import calculate_r
from database import (
    load_trades_from_supabase,
    save_trade_to_supabase,
    delete_trade_from_supabase,
    update_trade_in_supabase,
    load_accounts_from_supabase,
    save_account_to_supabase,
    update_account_in_supabase,
    delete_account_from_supabase,
)


class TradeBase(BaseModel):
    symbol: str
    direction: Literal["long", "short"]
    entry: float
    stop: float
    exit: float
    pnl: float
    entry_datetime: datetime
    exit_datetime: datetime

    @model_validator(mode="after")
    def validate_dates(self):
        if self.exit_datetime < self.entry_datetime:
            raise ValueError(
                "Exit datetime cannot be before entry datetime"
            )

        return self


class TradeCreate(TradeBase):
    account_id: int


class TradeUpdate(TradeBase):
    pass


class AccountCreate(BaseModel):
    name: str
    starting_balance: float
    currency: str
    broker: str | None = None
    account_type: str | None = None


class AccountUpdate(BaseModel):
    name: str
    starting_balance: float
    currency: str
    broker: str | None = None
    account_type: str | None = None


app = FastAPI()


cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Trading Journal API"}


@app.get("/trades")
def get_trades(
    account_id: int | None = None,
    auth_data=Depends(get_current_user),
):
    user = auth_data["user"]
    token = auth_data["token"]

    return load_trades_from_supabase(
        user.id,
        token,
        account_id,
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
        trade.pnl,
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
        trade.pnl,
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


@app.post("/accounts")
def create_account(
    account: AccountCreate,
    auth_data=Depends(get_current_user),
):
    user = auth_data["user"]
    token = auth_data["token"]

    account_data = {
        "name": account.name,
        "starting_balance": account.starting_balance,
        "currency": account.currency,
        "broker": account.broker,
        "account_type": account.account_type,
    }

    return save_account_to_supabase(
        account_data,
        user.id,
        token,
    )


@app.patch("/accounts/{account_id}")
def update_account(
    account_id: int,
    account: AccountUpdate,
    auth_data=Depends(get_current_user),
):
    user = auth_data["user"]
    token = auth_data["token"]

    account_data = {
        "name": account.name,
        "starting_balance": account.starting_balance,
        "currency": account.currency,
        "broker": account.broker,
        "account_type": account.account_type,
    }

    return update_account_in_supabase(
        account_id,
        account_data,
        user.id,
        token,
    )


@app.delete("/accounts/{account_id}")
def delete_account(
    account_id: int,
    auth_data=Depends(get_current_user),
):
    user = auth_data["user"]
    token = auth_data["token"]

    return delete_account_from_supabase(
        account_id,
        user.id,
        token,
    )
