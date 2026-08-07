from fastapi import FastAPI
from database import load_trades_from_supabase, save_trade_to_supabase
from pydantic import BaseModel
from calculations import calculate_r
from typing import Literal


class TradeCreate(BaseModel):
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
