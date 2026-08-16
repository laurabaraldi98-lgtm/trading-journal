"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    number,
    string | null,
    string | null
];

type Account = {
    id: number;
    user_id: string;
    name: string;
    starting_balance: number;
    currency: string;
    broker: string | null;
    account_type: string | null;
    created_at?: string;
};

function TradesPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const accountIdParam =
        searchParams.get("account_id");

    const accountIdFromUrl =
        accountIdParam !== null
            ? Number(accountIdParam)
            : null;
    const [trades, setTrades] = useState<Trade[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccountId, setSelectedAccountId] =
        useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingTradeId, setEditingTradeId] = useState<number | null>(null);

    const [symbol, setSymbol] = useState("");
    const [direction, setDirection] = useState("");
    const [entry, setEntry] = useState("");
    const [stop, setStop] = useState("");
    const [exit, setExit] = useState("");
    const [pnl, setPnl] = useState("");
    const [entryDatetime, setEntryDatetime] = useState("");
    const [exitDatetime, setExitDatetime] = useState("");

    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    const loadTrades = useCallback(async (accountId: number) => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            router.push("/login");
            return;
        }

        const response = await fetch(
            `http://127.0.0.1:8000/trades?account_id=${accountId}`,
            {
                cache: "no-store",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            }
        );

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        setTrades(data);
        setCurrentPage(1);
        setAuthLoading(false);
    }, [router]);

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/login");
    }

    function handleEditTrade(trade: Trade) {
        setEditingTradeId(trade[0]);
        setSymbol(trade[1]);
        setDirection(trade[2]);
        setEntry(String(trade[3]));
        setStop(String(trade[4]));
        setExit(String(trade[5]));
        setPnl(String(trade[7]));
        setEntryDatetime(
            trade[8] ? trade[8].slice(0, 16) : ""
        );
        setExitDatetime(
            trade[9] ? trade[9].slice(0, 16) : ""
        );
    }

    async function handleUpdateTrade(tradeId: number) {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            router.push("/login");
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
                    pnl: Number(pnl),
                    entry_datetime: entryDatetime || null,
                    exit_datetime: exitDatetime || null,
                }),
            }
        );

        if (response.ok) {
            if (selectedAccountId !== null) {
                await loadTrades(selectedAccountId);
            }

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
            router.push("/login");
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
            if (selectedAccountId !== null) {
                await loadTrades(selectedAccountId);
            }
        }
    }

    useEffect(() => {
        async function fetchAccounts() {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                router.push("/login");
                return;
            }

            setUserEmail(session.user.email ?? null);

            const response = await fetch(
                "http://127.0.0.1:8000/accounts",
                {
                    cache: "no-store",
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                }
            );

            if (!response.ok) {
                setAuthLoading(false);
                return;
            }

            const data: Account[] = await response.json();

            setAccounts(data);

            if (data.length === 0) {
                setTrades([]);
                setSelectedAccountId(null);
                setAuthLoading(false);
                return;
            }

            const accountFromUrl = data.find(
                (account) =>
                    account.id === accountIdFromUrl
            );

            setSelectedAccountId(
                accountFromUrl
                    ? accountFromUrl.id
                    : data[0].id
            );
        }

        fetchAccounts();
    }, [accountIdFromUrl, router]);

    useEffect(() => {
        if (selectedAccountId === null) {
            return;
        }

        async function fetchTrades() {
            await loadTrades(selectedAccountId!);
        }

        fetchTrades();
    }, [selectedAccountId, loadTrades]);

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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                            Trades
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Review and manage your trading history.
                        </p>
                    </div>

                    <div className="w-full sm:w-64">
                        <label
                            htmlFor="account-select"
                            className="mb-1 block text-sm font-medium text-slate-700"
                        >
                            Account
                        </label>

                        <select
                            id="account-select"
                            value={selectedAccountId ?? ""}
                            onChange={(event) =>
                                setSelectedAccountId(
                                    Number(event.target.value)
                                )
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            {accounts.map((account) => (
                                <option
                                    key={account.id}
                                    value={account.id}
                                >
                                    {account.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <TradesTable
                    trades={paginatedTrades}
                    editingTradeId={editingTradeId}
                    symbol={symbol}
                    direction={direction}
                    entry={entry}
                    stop={stop}
                    exit={exit}
                    pnl={pnl}
                    entryDatetime={entryDatetime}
                    exitDatetime={exitDatetime}
                    setSymbol={setSymbol}
                    setDirection={setDirection}
                    setEntry={setEntry}
                    setStop={setStop}
                    setExit={setExit}
                    setPnl={setPnl}
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

export default function TradesPage() {
    return (
        <Suspense fallback={null}>
            <TradesPageContent />
        </Suspense>
    );
}