from database import load_trades_from_supabase


def test_load_trades_from_supabase():
    trades = load_trades_from_supabase()

    assert isinstance(trades, list)
