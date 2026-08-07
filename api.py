from fastapi import FastAPI
from database import (
    load_trades_from_supabase,
    save_trade_to_supabase,
    delete_trade_from_supabase,
    update_trade_in_supabase,
)
from pydantic import BaseModel
from calculations import calculate_r
from typing import Literal


class TradeCreate(BaseModel):
    symbol: str
    direction: Literal["long", "short"]
    entry: float
    stop: float
    exit_price: float


class TradeUpdate(BaseModel):
    symbol: str
    direction: Literal["long", "short"]
    entry: float
    stop: float
    exit_price: float


app = FastAPI()


@app.get("/")
def root():
    return {"message": "Trading Journal API"}


@app.get("/trades")
def get_trades():
    return load_trades_from_supabase()


@app.post("/trades")
def create_trade(trade: TradeCreate):
    result = round(
        calculate_r(
            trade.direction,
            trade.entry,
            trade.stop,
            trade.exit_price
        ),
        2
    )

    trade_data = [
        trade.symbol,
        trade.direction,
        trade.entry,
        trade.stop,
        trade.exit_price,
        result
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
            trade.exit_price
        ),
        2
    )

    updated_trade = [
        trade_id,
        trade.symbol,
        trade.direction,
        trade.entry,
        trade.stop,
        trade.exit_price,
        result
    ]

    update_trade_in_supabase(trade_id, updated_trade)

    return {"message": "Trade updated"}
