"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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

      setUserEmail(session?.user.email ?? null);
    }

    loadUser();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
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

    const response = await fetch("http://127.0.0.1:8000/trades", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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

    const response = await fetch(
      `http://127.0.0.1:8000/trades/${tradeId}`,
      {
        method: "DELETE",
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
      entry_datetime: entryDatetime,
      exit_datetime: exitDatetime,
    };

    const response = await fetch(
      `http://127.0.0.1:8000/trades/${tradeId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
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

  return (
    <div className="flex min-h-screen bg-zinc-100">
      <aside className="w-64 bg-white p-6 border-r border-zinc-200">
        <h1 className="text-2xl font-bold mb-8">
          Trading Journal
        </h1>

        <div className="mb-6 border-b border-zinc-200 pb-4">
          <p className="text-sm text-zinc-600">
            {userEmail}
          </p>

          <button
            onClick={handleLogout}
            className="mt-2 cursor-pointer text-sm text-zinc-500 hover:text-black"
          >
            Sign Out
          </button>
        </div>


        <nav className="flex flex-col gap-4">
          <a href="#" className="font-medium">
            Dashboard
          </a>

          <a href="#" className="text-zinc-600">
            Trades
          </a>

          <a href="#" className="text-zinc-600">
            Statistics
          </a>

          <a href="#" className="text-zinc-600">
            Import CSV
          </a>

          <a href="#" className="text-zinc-600">
            Account
          </a>
        </nav>
      </aside>

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
          <div className="mt-6 rounded-xl bg-white p-6 border border-zinc-200">
            <h3 className="text-xl font-semibold mb-4">Add Trade</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                type="text"
                value={symbol}
                onChange={(event) => setSymbol(event.target.value)}
                placeholder="Symbol"
                className="rounded-lg border border-zinc-300 p-3"
              />

              <select
                value={direction}
                onChange={(event) => setDirection(event.target.value)}
                className="rounded-lg border border-zinc-300 p-3"
              >
                <option value="">Direction</option>
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>

              <input
                type="number"
                value={entry}
                onChange={(event) => setEntry(event.target.value)}
                placeholder="Entry"
                className="rounded-lg border border-zinc-300 p-3"
              />

              <input
                type="number"
                value={stop}
                onChange={(event) => setStop(event.target.value)}
                placeholder="Stop"
                className="rounded-lg border border-zinc-300 p-3"
              />

              <input
                type="number"
                value={exit}
                onChange={(event) => setExit(event.target.value)}
                placeholder="Exit price"
                className="rounded-lg border border-zinc-300 p-3"
              />

              <input
                type="datetime-local"
                value={entryDatetime}
                onChange={(event) => setEntryDatetime(event.target.value)}
                className="rounded-lg border border-zinc-300 p-3"
              />

              <input
                type="datetime-local"
                value={exitDatetime}
                onChange={(event) => setExitDatetime(event.target.value)}
                className="rounded-lg border border-zinc-300 p-3"
              />
            </div>

            <button
              onClick={handleSaveTrade}
              className="mt-4 cursor-pointer rounded-lg bg-black px-5 py-3 text-white"
            >
              Save Trade
            </button>
          </div>
        )
        }

        <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-white p-5 border border-zinc-200">
            <p className="text-sm text-zinc-500">Total R</p>
            <p className="text-2xl font-bold mt-2">+12.4R</p>
          </div>

          <div className="rounded-xl bg-white p-5 border border-zinc-200">
            <p className="text-sm text-zinc-500">Win Rate</p>
            <p className="text-2xl font-bold mt-2">58%</p>
          </div>

          <div className="rounded-xl bg-white p-5 border border-zinc-200">
            <p className="text-sm text-zinc-500">Average R</p>
            <p className="text-2xl font-bold mt-2">0.62R</p>
          </div>

          <div className="rounded-xl bg-white p-5 border border-zinc-200">
            <p className="text-sm text-zinc-500">Total Trades</p>
            <p className="text-2xl font-bold mt-2">20</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 border border-zinc-200">
          <h3 className="text-xl font-semibold">Equity Curve</h3>
          <p className="text-zinc-500 mt-2">
            Chart coming soon.
          </p>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 border border-zinc-200">
          <h3 className="text-xl font-semibold mb-4">Recent Trades</h3>

          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-sm text-zinc-500">
                  <th className="py-3 pr-6">Symbol</th>
                  <th className="py-3 pr-6">Direction</th>
                  <th className="py-3 pr-6">Entry</th>
                  <th className="py-3 pr-6">Stop</th>
                  <th className="py-3 pr-6">Exit</th>
                  <th className="py-3 pr-6">Entry Time</th>
                  <th className="py-3 pr-6">Exit Time</th>
                  <th className="py-3 pr-6">Result</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {trades.map((trade) => (
                  <tr key={trade[0]} className="border-b border-zinc-200">
                    {editingTradeId === trade[0] ? (
                      <>
                        <td className="py-3 pr-6">
                          <input
                            value={symbol}
                            onChange={(event) => setSymbol(event.target.value)}
                            className="rounded border border-zinc-300 px-2 py-1"
                          />
                        </td>

                        <td className="py-3 pr-6">
                          <select
                            value={direction}
                            onChange={(event) => setDirection(event.target.value)}
                            className="rounded border border-zinc-300 px-2 py-1"
                          >
                            <option value="long">Long</option>
                            <option value="short">Short</option>
                          </select>
                        </td>

                        <td className="py-3 pr-6">
                          <input
                            value={entry}
                            onChange={(event) => setEntry(event.target.value)}
                            className="w-24 rounded border border-zinc-300 px-2 py-1"
                          />
                        </td>

                        <td className="py-3 pr-6">
                          <input
                            value={stop}
                            onChange={(event) => setStop(event.target.value)}
                            className="w-24 rounded border border-zinc-300 px-2 py-1"
                          />
                        </td>

                        <td className="py-3 pr-6">
                          <input
                            value={exit}
                            onChange={(event) => setExit(event.target.value)}
                            className="w-24 rounded border border-zinc-300 px-2 py-1"
                          />
                        </td>

                        <td className="py-3 pr-6">
                          <input
                            type="datetime-local"
                            value={entryDatetime}
                            onChange={(event) => setEntryDatetime(event.target.value)}
                            className="rounded border border-zinc-300 px-2 py-1"
                          />
                        </td>

                        <td className="py-3 pr-6">
                          <input
                            type="datetime-local"
                            value={exitDatetime}
                            onChange={(event) => setExitDatetime(event.target.value)}
                            className="rounded border border-zinc-300 px-2 py-1"
                          />
                        </td>

                        <td className="py-3 pr-6">
                          {trade[6]}R
                        </td>

                        <td className="py-3">
                          <button
                            onClick={() => handleUpdateTrade(trade[0])}
                            className="cursor-pointer rounded-lg px-2 py-1 text-zinc-700 hover:bg-zinc-100"
                          >
                            Save
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 pr-6">{trade[1]}</td>
                        <td className="py-3 pr-6">{trade[2]}</td>
                        <td className="py-3 pr-6">{trade[3]}</td>
                        <td className="py-3 pr-6">{trade[4]}</td>
                        <td className="py-3 pr-6">{trade[5]}</td>

                        <td className="py-3 pr-6 whitespace-nowrap">
                          {trade[7] ? new Date(trade[7]).toLocaleString() : "-"}
                        </td>

                        <td className="py-3 pr-6 whitespace-nowrap">
                          {trade[8] ? new Date(trade[8]).toLocaleString() : "-"}
                        </td>

                        <td className="py-3 pr-6">
                          {trade[6]}R
                        </td>

                        <td className="py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditTrade(trade)}
                              className="cursor-pointer rounded-lg px-2 py-1 text-zinc-700 hover:bg-zinc-100"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDeleteTrade(trade[0])}
                              className="cursor-pointer rounded-lg px-2 py-1 text-red-600 hover:bg-red-50 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
