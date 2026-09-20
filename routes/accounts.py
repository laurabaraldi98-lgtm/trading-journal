from fastapi import APIRouter, Depends

from auth import get_current_user
from database import (
    delete_account_from_supabase,
    load_accounts_from_supabase,
    save_account_to_supabase,
    update_account_in_supabase,
)
from schemas.accounts import AccountCreate, AccountUpdate


router = APIRouter()


@router.get("/accounts")
def get_accounts(auth_data=Depends(get_current_user)):
    user = auth_data["user"]
    token = auth_data["token"]

    return load_accounts_from_supabase(user.id, token)


@router.post("/accounts")
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


@router.patch("/accounts/{account_id}")
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


@router.delete("/accounts/{account_id}")
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
