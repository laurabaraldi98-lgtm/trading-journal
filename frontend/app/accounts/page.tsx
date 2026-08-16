"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import AccountForm from "./AccountForm";
import {
    Pencil,
    Trash2,
    Save,
} from "lucide-react";

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

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [accountsLoading, setAccountsLoading] = useState(true);
    const [showAccountForm, setShowAccountForm] = useState(false);

    const [name, setName] = useState("");
    const [startingBalance, setStartingBalance] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [broker, setBroker] = useState("");
    const [accountType, setAccountType] = useState("");

    const [editingAccountId, setEditingAccountId] =
        useState<number | null>(null);

    const [accountToDelete, setAccountToDelete] =
        useState<Account | null>(null);

    const [userEmail, setUserEmail] =
        useState<string | null>(null);

    const [authLoading, setAuthLoading] = useState(true);

    async function loadAccounts() {
        setAccountsLoading(true);

        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            window.location.href = "/login";
            return;
        }

        setUserEmail(session.user.email ?? null);

        const response = await fetch(
            "http://127.0.0.1:8000/accounts",
            {
                cache: "no-store",
                headers: {
                    Authorization:
                        `Bearer ${session.access_token}`,
                },
            }
        );

        if (!response.ok) {
            console.log("ACCOUNTS ERROR:", response.status);
            setAccountsLoading(false);
            return;
        }

        const data = await response.json();

        console.log("ACCOUNTS DATA:", data);

        setAccounts(data);
        setAccountsLoading(false);
    }

    function resetForm() {
        setName("");
        setStartingBalance("");
        setCurrency("USD");
        setBroker("");
        setAccountType("");
        setEditingAccountId(null);
    }

    async function handleSaveAccount() {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            window.location.href = "/login";
            return;
        }

        const accountData = {
            name,
            starting_balance: Number(startingBalance),
            currency,
            broker: broker || null,
            account_type: accountType || null,
        };

        const url =
            editingAccountId === null
                ? "http://127.0.0.1:8000/accounts"
                : `http://127.0.0.1:8000/accounts/${editingAccountId}`;

        const method =
            editingAccountId === null
                ? "POST"
                : "PATCH";

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(accountData),
        });

        if (!response.ok) {
            return;
        }

        await loadAccounts();
        resetForm();
        setShowAccountForm(false);
    }

    function handleEditAccount(account: Account) {
        setShowAccountForm(false);
        setEditingAccountId(account.id);

        setName(account.name);
        setStartingBalance(
            String(account.starting_balance)
        );
        setCurrency(account.currency);
        setBroker(account.broker ?? "");
        setAccountType(account.account_type ?? "");
    }

    async function handleDeleteAccount(
        accountId: number
    ) {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            window.location.href = "/login";
            return;
        }

        const response = await fetch(
            `http://127.0.0.1:8000/accounts/${accountId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization:
                        `Bearer ${session.access_token}`,
                },
            }
        );

        if (!response.ok) {
            return;
        }

        await loadAccounts();

        setAccountToDelete(null);

        if (editingAccountId === accountId) {
            resetForm();
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();

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

            setUserEmail(
                session.user.email ?? null
            );

            setAuthLoading(false);
        }

        loadUser();

        const { data } =
            supabase.auth.onAuthStateChange(
                (_event, session) => {
                    if (!session) {
                        window.location.href =
                            "/login";
                        return;
                    }

                    setUserEmail(
                        session.user.email ?? null
                    );
                }
            );

        return () => {
            data.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!authLoading) {
            loadAccounts();
        }
    }, [authLoading]);

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
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold">
                            Accounts
                        </h2>

                        <p className="mt-1 text-zinc-600">
                            Manage your trading accounts.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setEditingAccountId(null);

                            setName("");
                            setStartingBalance("");
                            setCurrency("USD");
                            setBroker("");
                            setAccountType("");

                            setShowAccountForm(!showAccountForm);
                        }}
                        className="cursor-pointer rounded-lg bg-black px-4 py-2 text-white transition hover:bg-zinc-800"
                    >
                        + Add account
                    </button>
                </div>

                {showAccountForm && (
                    <AccountForm
                        name={name}
                        startingBalance={startingBalance}
                        currency={currency}
                        broker={broker}
                        accountType={accountType}
                        setName={setName}
                        setStartingBalance={setStartingBalance}
                        setCurrency={setCurrency}
                        setBroker={setBroker}
                        setAccountType={setAccountType}
                        onSave={handleSaveAccount}
                    />
                )}

                <div className="mt-8 rounded-xl border border-zinc-200 bg-white">
                    <div className="border-b border-zinc-200 px-6 py-4">
                        <h3 className="text-xl font-semibold">
                            Your accounts
                        </h3>
                    </div>

                    {accountsLoading ? (
                        <p className="p-6 text-zinc-500">
                            Loading accounts...
                        </p>
                    ) : accounts.length === 0 ? (
                        <p className="p-6 text-zinc-500">
                            No accounts yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] table-fixed text-left">
                                <colgroup>
                                    <col className="w-[180px]" />
                                    <col className="w-[180px]" />
                                    <col className="w-[120px]" />
                                    <col className="w-[180px]" />
                                    <col className="w-[180px]" />
                                    <col className="w-[120px]" />
                                </colgroup>
                                <thead className="border-b border-zinc-200 bg-zinc-50 text-sm text-zinc-600">
                                    <tr>
                                        <th className="px-6 py-3">
                                            Name
                                        </th>

                                        <th className="px-6 py-3">
                                            Starting balance
                                        </th>

                                        <th className="px-6 py-3">
                                            Currency
                                        </th>

                                        <th className="px-6 py-3">
                                            Broker
                                        </th>

                                        <th className="px-6 py-3">
                                            Type
                                        </th>

                                        <th className="px-6 py-3">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {accounts.map(
                                        (account) =>
                                            editingAccountId === account.id ? (
                                                <tr
                                                    key={account.id}
                                                    className="border-b border-zinc-100"
                                                >
                                                    <td className="px-6 py-4">
                                                        <input
                                                            value={name}
                                                            onChange={(event) =>
                                                                setName(event.target.value)
                                                            }
                                                            className="w-full min-w-0 rounded-lg border border-zinc-300 px-2 py-1"
                                                        />
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="number"
                                                            value={startingBalance}
                                                            onChange={(event) =>
                                                                setStartingBalance(event.target.value)
                                                            }
                                                            className="w-full min-w-0 rounded-lg border border-zinc-300 px-2 py-1"
                                                        />
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <select
                                                            value={currency}
                                                            onChange={(event) =>
                                                                setCurrency(event.target.value)
                                                            }
                                                            className="w-full min-w-0 rounded-lg border border-zinc-300 px-2 py-1"
                                                        >
                                                            <option value="USD">USD</option>
                                                            <option value="EUR">EUR</option>
                                                            <option value="GBP">GBP</option>
                                                        </select>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <input
                                                            value={broker}
                                                            onChange={(event) =>
                                                                setBroker(event.target.value)
                                                            }
                                                            className="w-full min-w-0 rounded-lg border border-zinc-300 px-2 py-1"
                                                        />
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <input
                                                            value={accountType}
                                                            onChange={(event) =>
                                                                setAccountType(event.target.value)
                                                            }
                                                            className="w-full min-w-0 rounded-lg border border-zinc-300 px-2 py-1"
                                                        />
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <button
                                                            type="button"
                                                            onClick={handleSaveAccount}
                                                            aria-label="Save account"
                                                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                                                        >
                                                            <Save size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ) : (
                                                <tr
                                                    key={account.id}
                                                    className="border-b border-zinc-100"
                                                >
                                                    <td className="px-6 py-4 font-medium">
                                                        {account.name}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {account.starting_balance}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {account.currency}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {account.broker ?? "—"}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {account.account_type ?? "—"}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEditAccount(account)
                                                                }
                                                                aria-label="Edit account"
                                                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setAccountToDelete(account)
                                                                }
                                                                aria-label="Delete account"
                                                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                            )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {accountToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-rose-600">
                                    Delete account
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-zinc-700">
                                    Are you sure you want to permanently delete{" "}
                                    <span className="font-semibold">
                                        {accountToDelete.name}
                                    </span>
                                    ?
                                </p>

                                <p className="mt-3 text-sm leading-6 text-zinc-700">
                                    All trades linked to this account will also be
                                    permanently deleted, including the related
                                    statistics and performance history.
                                </p>

                                <p className="mt-3 font-semibold text-rose-600">
                                    This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAccountToDelete(null)}
                                    className="cursor-pointer rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDeleteAccount(accountToDelete.id)
                                    }
                                    className="cursor-pointer rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                                >
                                    Delete permanently
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main >
        </div >
    );
}