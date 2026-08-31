import json
import os
from datetime import datetime
from typing import Literal

from fastapi import (
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    Request,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, model_validator

from auth import get_current_user, get_demo_session
from calculations import calculate_r
from database import (
    DatabaseError,
    ResourceNotFoundError,
    account_belongs_to_user,
    delete_account_from_supabase,
    delete_trade_from_supabase,
    load_accounts_from_supabase,
    load_trades_from_supabase,
    save_account_to_supabase,
    save_trade_to_supabase,
    update_account_in_supabase,
    update_trade_in_supabase,
)
from imports.preview import (
    CsvPreviewError,
    build_csv_preview,
    read_csv_rows,
)
from imports.validation import validate_trade_rows


MAX_CSV_FILE_SIZE = 5 * 1024 * 1024
INVALID_MAPPING_MESSAGE = (
    "Mapping must be a JSON object "
    "containing string keys and values"
)


class TradeBase(BaseModel):
    symbol: str = Field(min_length=1)
    direction: Literal["long", "short"]
    entry: float
    stop: float | None = None
    exit: float
    pnl: float
    entry_datetime: datetime
    exit_datetime: datetime

    @model_validator(mode="after")
    def validate_trade(self):
        if self.exit_datetime < self.entry_datetime:
            raise ValueError(
                "Exit datetime cannot be before entry datetime"
            )

        if self.stop is not None and self.entry == self.stop:
            raise ValueError(
                "Entry and stop cannot be the same"
            )

        return self


class TradeCreate(TradeBase):
    account_id: int


class TradeUpdate(TradeBase):
    pass


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
async def database_error_handler(
    request: Request,
    exc: DatabaseError,
):
    return JSONResponse(
        status_code=503,
        content={
            "detail": "Database service unavailable"
        },
    )


@app.exception_handler(ResourceNotFoundError)
async def resource_not_found_handler(
    request: Request,
    exc: ResourceNotFoundError,
):
    return JSONResponse(
        status_code=404,
        content={"detail": str(exc)},
    )


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


async def _read_csv_upload(file: UploadFile) -> bytes:
    content = await file.read(MAX_CSV_FILE_SIZE + 1)

    if len(content) > MAX_CSV_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="CSV file must not exceed 5 MB",
        )

    return content


def _parse_column_mapping(mapping: str) -> dict[str, str]:
    try:
        parsed_mapping = json.loads(mapping)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=400,
            detail=INVALID_MAPPING_MESSAGE,
        ) from exc

    if not isinstance(parsed_mapping, dict) or not all(
        isinstance(key, str) and isinstance(value, str)
        for key, value in parsed_mapping.items()
    ):
        raise HTTPException(
            status_code=400,
            detail=INVALID_MAPPING_MESSAGE,
        )

    return parsed_mapping


@app.get("/")
def root():
    return {"message": "Trading Journal API"}


@app.post("/demo-login")
def demo_login():
    return get_demo_session()


@app.post("/imports/preview")
async def preview_csv_import(
    file: UploadFile = File(...),
    _auth_data=Depends(get_current_user),
):
    content = await _read_csv_upload(file)

    try:
        return build_csv_preview(
            file.filename,
            content,
        )
    except CsvPreviewError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc


@app.post("/imports/validate")
async def validate_csv_import(
    file: UploadFile = File(...),
    mapping: str = Form(...),
    decimal_separator: Literal[".", ","] = Form(...),
    date_format: str | None = Form(None),
    _auth_data=Depends(get_current_user),
):
    parsed_mapping = _parse_column_mapping(mapping)
    content = await _read_csv_upload(file)

    try:
        csv_data = read_csv_rows(
            file.filename,
            content,
        )
    except CsvPreviewError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    return validate_trade_rows(
        csv_data["rows"],
        parsed_mapping,
        decimal_separator,
        date_format or None,
    )


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

    if not account_belongs_to_user(
        trade.account_id,
        user.id,
        token,
    ):
        raise ResourceNotFoundError(
            "Account not found"
        )

    result = None

    if trade.stop is not None:
        result = round(
            calculate_r(
                trade.direction,
                trade.entry,
                trade.stop,
                trade.exit,
            ),
            2,
        )

    trade_data = {
        "account_id": trade.account_id,
        "symbol": trade.symbol,
        "direction": trade.direction,
        "entry": trade.entry,
        "stop": trade.stop,
        "exit": trade.exit,
        "result": result,
        "pnl": trade.pnl,
        "entry_datetime": trade.entry_datetime,
        "exit_datetime": trade.exit_datetime,
    }

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

    result = None

    if trade.stop is not None:
        result = round(
            calculate_r(
                trade.direction,
                trade.entry,
                trade.stop,
                trade.exit,
            ),
            2,
        )

    updated_trade = {
        "symbol": trade.symbol,
        "direction": trade.direction,
        "entry": trade.entry,
        "stop": trade.stop,
        "exit": trade.exit,
        "result": result,
        "pnl": trade.pnl,
        "entry_datetime": trade.entry_datetime,
        "exit_datetime": trade.exit_datetime,
    }

    return update_trade_in_supabase(
        trade_id,
        updated_trade,
        user.id,
        token,
    )


@app.get("/accounts")
def get_accounts(
    auth_data=Depends(get_current_user),
):
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
