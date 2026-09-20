import os
from datetime import date

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from auth import get_current_user, get_demo_session
from calculations import calculate_calendar_statistics, calculate_dashboard_statistics
from database import (
    DatabaseError,
    ResourceNotFoundError,
    delete_account_from_supabase,
    load_accounts_from_supabase,
    load_calendar_metrics_batch_from_supabase,
    load_trade_metrics_batch_from_supabase,
    save_account_to_supabase,
    update_account_in_supabase,
)
from routes.csv_imports import router as csv_imports_router
from routes.trades import router as trades_router


STATISTICS_BATCH_SIZE = 1000
CALENDAR_BATCH_SIZE = 1000


class AccountBase(BaseModel):
    name: str = Field(min_length=1)
    starting_balance: float
    currency: str = Field(min_length=1)
    broker: str | None = None
    account_type: str | None = None


class AccountCreate(AccountBase):
    pass


class AccountUpdate(AccountBase):
    pass


app = FastAPI()


@app.exception_handler(DatabaseError)
async def database_error_handler(request: Request, exc: DatabaseError):
    return JSONResponse(status_code=503, content={"detail": "Database service unavailable"})


@app.exception_handler(ResourceNotFoundError)
async def resource_not_found_handler(request: Request, exc: ResourceNotFoundError):
    return JSONResponse(status_code=404, content={"detail": str(exc)})


cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(csv_imports_router)
app.include_router(trades_router)


@app.get("/")
def root():
    return {"message": "Trading Journal API"}


@app.post("/demo-login")
def demo_login():
    return get_demo_session()


def iter_trade_metrics(
    user_id: str,
    token: str,
    account_id: int,
    date_from: date | None = None,
    date_to: date | None = None,
):
    offset = 0

    while True:
        batch = load_trade_metrics_batch_from_supabase(
            user_id,
            token,
            account_id,
            offset=offset,
            batch_size=STATISTICS_BATCH_SIZE,
            date_from=date_from,
            date_to=date_to,
        )

        yield from batch

        if len(batch) < STATISTICS_BATCH_SIZE:
            break

        offset += STATISTICS_BATCH_SIZE


@app.get("/statistics")
def get_statistics(
    account_id: int,
    date_from: date | None = None,
    date_to: date | None = None,
    auth_data=Depends(get_current_user),
):
    if date_from is not None and date_to is not None and date_from > date_to:
        raise HTTPException(
            status_code=422, detail="date_from cannot be after date_to")

    user = auth_data["user"]
    token = auth_data["token"]

    metrics = iter_trade_metrics(
        user.id,
        token,
        account_id,
        date_from,
        date_to,
    )

    return calculate_dashboard_statistics(metrics)


def iter_calendar_metrics(
    user_id: str,
    token: str,
    account_id: int,
    month_start: date,
    next_month_start: date,
):
    offset = 0

    while True:
        batch = load_calendar_metrics_batch_from_supabase(
            user_id,
            token,
            account_id,
            month_start,
            next_month_start,
            offset=offset,
            batch_size=CALENDAR_BATCH_SIZE,
        )

        yield from batch

        if len(batch) < CALENDAR_BATCH_SIZE:
            break

        offset += CALENDAR_BATCH_SIZE


@app.get("/calendar")
def get_calendar(
    account_id: int,
    year: int = Query(ge=1, le=9998),
    month: int = Query(ge=1, le=12),
    auth_data=Depends(get_current_user),
):
    month_start = date(year, month, 1)

    if month == 12:
        next_month_start = date(year + 1, 1, 1)
    else:
        next_month_start = date(year, month + 1, 1)

    user = auth_data["user"]
    token = auth_data["token"]

    metrics = iter_calendar_metrics(
        user.id,
        token,
        account_id,
        month_start,
        next_month_start,
    )

    return calculate_calendar_statistics(metrics)


@app.get("/accounts")
def get_accounts(auth_data=Depends(get_current_user)):
    user = auth_data["user"]
    token = auth_data["token"]

    return load_accounts_from_supabase(user.id, token)


@app.post("/accounts")
def create_account(account: AccountCreate, auth_data=Depends(get_current_user)):
    user = auth_data["user"]
    token = auth_data["token"]

    account_data = {
        "name": account.name,
        "starting_balance": account.starting_balance,
        "currency": account.currency,
        "broker": account.broker,
        "account_type": account.account_type,
    }

    return save_account_to_supabase(account_data, user.id, token)


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
def delete_account(account_id: int, auth_data=Depends(get_current_user)):
    user = auth_data["user"]
    token = auth_data["token"]

    return delete_account_from_supabase(account_id, user.id, token)
