import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

supabase = create_client(supabase_url, supabase_key)

new_trade = {
    "symbol": "gold",
    "direction": "long",
    "entry": 100,
    "stop": 98,
    "exit_price": 104,
    "result": 2
}

response = supabase.table("trades").insert(new_trade).execute()

print(response)
