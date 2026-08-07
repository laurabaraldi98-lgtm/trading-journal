from fastapi import FastAPI
from database import load_trades_from_supabase

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Trading Journal API"}


@app.get("/trades")
def get_trades():
    return load_trades_from_supabase()
