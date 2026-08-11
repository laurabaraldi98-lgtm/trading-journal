from database import load_trades_from_supabase


def test_load_trades_from_supabase():
    fake_user_id = "00000000-0000-0000-0000-000000000000"

    trades = load_trades_from_supabase(fake_user_id)

    assert isinstance(trades, list)
