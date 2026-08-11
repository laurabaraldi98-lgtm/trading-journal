from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from auth import get_bearer_token
from database import (
    load_trades_from_supabase,
    save_trade_to_supabase,
    delete_trade_from_supabase,
    update_trade_in_supabase,
)
from pydantic import BaseModel
from calculations import calculate_r
from typing import Literal
from datetime import datetime


class TradeCreate(BaseModel):
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
def get_trades(token: str = Depends(get_bearer_token)):
    return load_trades_from_supabase()


@app.post("/trades")
def create_trade(trade: TradeCreate):
    result = round(
        calculate_r(
            trade.direction,
            trade.entry,
            trade.stop,
            trade.exit
        ),
        2
    )

    trade_data = [
        trade.symbol,
        trade.direction,
        trade.entry,
        trade.stop,
        trade.exit,
        result,
        trade.entry_datetime,
        trade.exit_datetime
    ]

    return save_trade_to_supabase(trade_data)


@app.delete("/trades/{trade_id}")
def delete_trade(trade_id: int):
    delete_trade_from_supabase(trade_id)

    return {"message": "Trade deleted"}


@app.patch("/trades/{trade_id}")
def update_trade(trade_id: int, trade: TradeUpdate):
    result = round(
        calculate_r(
            trade.direction,
            trade.entry,
            trade.stop,
            trade.exit
        ),
        2
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
        trade.exit_datetime
    ]

    update_trade_in_supabase(trade_id, updated_trade)

    return updated_trade
