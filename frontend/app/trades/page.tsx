"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import TradesTable from "../../components/TradesTable";

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

export default function TradesPage() {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingTradeId, setEditingTradeId] = useState<number | null>(null);

    const [symbol, setSymbol] = useState("");
    const [direction, setDirection] = useState("");
    const [entry, setEntry] = useState("");
    const [stop, setStop] = useState("");
    const [exit, setExit] = useState("");
    const [entryDatetime, setEntryDatetime] = useState("");
    const [exitDatetime, setExitDatetime] = useState("");

    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    async function loadTrades() {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            window.location.href = "/login";
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
        setAuthLoading(false);
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        window.location.href = "/login";
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
                body: JSON.stringify({
                    symbol,
                    direction,
                    entry: Number(entry),
                    stop: Number(stop),
                    exit: Number(exit),
                    entry_datetime: entryDatetime || null,
                    exit_datetime: exitDatetime || null,
                }),
            }
        );

        if (response.ok) {
            await loadTrades();
            setEditingTradeId(null);
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
            await loadTrades();
        }
    }

    useEffect(() => {
        loadTrades();
    }, []);

    const tradesPerPage = 20;

    const totalPages = Math.ceil(trades.length / tradesPerPage);

    const startIndex = (currentPage - 1) * tradesPerPage;
    const endIndex = startIndex + tradesPerPage;

    const paginatedTrades = trades.slice(startIndex, endIndex);

    if (authLoading) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar
                userEmail={userEmail}
                onLogout={handleLogout}
            />

            <main className="min-w-0 flex-1 px-8 py-8 xl:px-10">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                        Trades
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Review and manage your trading history.
                    </p>
                </div>

                <TradesTable
                    trades={paginatedTrades}
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
                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((page) => page - 1)}
                            disabled={currentPage === 1}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            ←
                        </button>

                        {Array.from({ length: totalPages }, (_, index) => {
                            const pageNumber = index + 1;

                            return (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    onClick={() => setCurrentPage(pageNumber)}
                                    className={
                                        currentPage === pageNumber
                                            ? "h-9 min-w-9 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white"
                                            : "h-9 min-w-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                                    }
                                >
                                    {pageNumber}
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            onClick={() => setCurrentPage((page) => page + 1)}
                            disabled={currentPage === totalPages}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            →
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}