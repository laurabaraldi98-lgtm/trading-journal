"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import TradeForm from "../components/TradeForm";
import TradesTable from "../components/TradesTable";
import StatisticsCards from "../components/StatisticsCards";


type Trade = [
  number,
  string,
  string,
  number,
  number,
  number,
  number,
  string | null,
  string | null
];

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [direction, setDirection] = useState("");
  const [entry, setEntry] = useState("");
  const [stop, setStop] = useState("");
  const [exit, setExit] = useState("");
  const [entryDatetime, setEntryDatetime] = useState("");
  const [exitDatetime, setExitDatetime] = useState("");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [editingTradeId, setEditingTradeId] = useState<number | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null);;
  const [authLoading, setAuthLoading] = useState(true);

  async function loadTrades() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return;
    }

    setUserEmail(session.user.email ?? null);

    const response = await fetch("http://127.0.0.1:8000/trades", {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const data = await response.json();

    setTrades(data);
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    setUserEmail(null);

    window.location.href = "/login";
  }

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      setUserEmail(session.user.email ?? null);
      setAuthLoading(false);
    }

    loadUser();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        window.location.href = "/login";
        return;
      }

      setUserEmail(session.user.email ?? null);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    loadTrades();
  }, []);

  async function handleSaveTrade() {
    const tradeData = {
      symbol: symbol,
      direction: direction,
      entry: Number(entry),
      stop: Number(stop),
      exit: Number(exit),
      entry_datetime: entryDatetime || null,
      exit_datetime: exitDatetime || null,
    };

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/login";
      return;
    }

    const response = await fetch("http://127.0.0.1:8000/trades", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(tradeData),
    });

    if (response.ok) {
      await loadTrades();

      setSymbol("");
      setDirection("");
      setEntry("");
      setStop("");
      setExit("");
      setEntryDatetime("");
      setExitDatetime("");
    }
  }

  async function handleDeleteTrade(tradeId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this trade?"
    );

    if (!confirmed) {
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/login";
      return;
    }

    const response = await fetch(
      `http://127.0.0.1:8000/trades/${tradeId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (response.ok) {
      setTrades((currentTrades) =>
        currentTrades.filter((trade) => trade[0] !== tradeId)
      );
    }
  }

  function handleEditTrade(trade: Trade) {
    setEditingTradeId(trade[0]);
    setSymbol(trade[1]);
    setDirection(trade[2]);
    setEntry(String(trade[3]));
    setStop(String(trade[4]));
    setExit(String(trade[5]));
    setEntryDatetime(trade[7] ? trade[7].slice(0, 16) : "");
    setExitDatetime(trade[8] ? trade[8].slice(0, 16) : "");
  }

  async function handleUpdateTrade(tradeId: number) {
    const tradeData = {
      symbol,
      direction,
      entry: Number(entry),
      stop: Number(stop),
      exit: Number(exit),
      entry_datetime: entryDatetime || null,
      exit_datetime: exitDatetime || null,
    };

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/login";
      return;
    }

    const response = await fetch(
      `http://127.0.0.1:8000/trades/${tradeId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(tradeData),
      }
    );

    if (response.ok) {
      // Reload from the server instead of patching the array in place,
      // so the list stays correctly ordered by date after an edit.
      await loadTrades();
      setEditingTradeId(null);
    }
  }

  if (authLoading) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-zinc-100">
      <Sidebar
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      <main className="min-w-0 flex-1 p-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              Dashboard
            </h2>

            <p className="text-zinc-600 mt-1">
              Overview of your trading performance.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="cursor-pointer rounded-lg bg-black px-5 py-3 text-white"
          >
            + Add Trade
          </button>

        </div>

        {showForm && (
          <TradeForm
            symbol={symbol}
            direction={direction}
            entry={entry}
            stop={stop}
            exit={exit}
            entryDatetime={entryDatetime}
            exitDatetime={exitDatetime}
            setSymbol={setSymbol}
            setDirection={setDirection}
            setEntry={setEntry}
            setStop={setStop}
            setExit={setExit}
            setEntryDatetime={setEntryDatetime}
            setExitDatetime={setExitDatetime}
            onSave={handleSaveTrade}
          />
        )}

        <StatisticsCards trades={trades} />

        <div className="mt-8 rounded-xl bg-white p-6 border border-zinc-200">
          <h3 className="text-xl font-semibold">Equity Curve</h3>
          <p className="text-zinc-500 mt-2">
            Chart coming soon.
          </p>
        </div>

        <TradesTable
          trades={trades}
          editingTradeId={editingTradeId}

          symbol={symbol}
          direction={direction}
          entry={entry}
          stop={stop}
          exit={exit}
          entryDatetime={entryDatetime}
          exitDatetime={exitDatetime}

          setSymbol={setSymbol}
          setDirection={setDirection}
          setEntry={setEntry}
          setStop={setStop}
          setExit={setExit}
          setEntryDatetime={setEntryDatetime}
          setExitDatetime={setExitDatetime}

          onEdit={handleEditTrade}
          onUpdate={handleUpdateTrade}
          onDelete={handleDeleteTrade}
        />
      </main >
    </div >
  );
}
