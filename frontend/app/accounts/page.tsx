"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import Accounts from "../../components/Accounts";

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

    const [name, setName] = useState("");
    const [startingBalance, setStartingBalance] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [broker, setBroker] = useState("");
    const [accountType, setAccountType] = useState("");

    const [editingAccountId, setEditingAccountId] =
        useState<number | null>(null);

    const [userEmail, setUserEmail] =
        useState<string | null>(null);

    const [authLoading, setAuthLoading] = useState(true);

    async function loadAccounts() {
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
            return;
        }

        const data = await response.json();

        setAccounts(data);
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
    }

    function handleEditAccount(account: Account) {
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
        const confirmed = window.confirm(
            "Are you sure you want to delete this account?"
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
        loadAccounts();
    }, []);

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
                <div>
                    <h2 className="text-3xl font-bold">
                        Accounts
                    </h2>

                    <p className="mt-1 text-zinc-600">
                        Manage your trading accounts.
                    </p>
                </div>

                <Accounts
                    name={name}
                    startingBalance={startingBalance}
                    currency={currency}
                    broker={broker}
                    accountType={accountType}
                    setName={setName}
                    setStartingBalance={
                        setStartingBalance
                    }
                    setCurrency={setCurrency}
                    setBroker={setBroker}
                    setAccountType={
                        setAccountType
                    }
                    onSave={handleSaveAccount}
                />

                <div className="mt-8 rounded-xl border border-zinc-200 bg-white">
                    <div className="border-b border-zinc-200 px-6 py-4">
                        <h3 className="text-xl font-semibold">
                            Your accounts
                        </h3>
                    </div>

                    {accounts.length === 0 ? (
                        <p className="p-6 text-zinc-500">
                            No accounts yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
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
                                        (account) => (
                                            <tr
                                                key={
                                                    account.id
                                                }
                                                className="border-b border-zinc-100"
                                            >
                                                <td className="px-6 py-4 font-medium">
                                                    {
                                                        account.name
                                                    }
                                                </td>

                                                <td className="px-6 py-4">
                                                    {
                                                        account.starting_balance
                                                    }
                                                </td>

                                                <td className="px-6 py-4">
                                                    {
                                                        account.currency
                                                    }
                                                </td>

                                                <td className="px-6 py-4">
                                                    {account.broker ??
                                                        "—"}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {account.account_type ??
                                                        "—"}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleEditAccount(
                                                                    account
                                                                )
                                                            }
                                                            className="cursor-pointer rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeleteAccount(
                                                                    account.id
                                                                )
                                                            }
                                                            className="cursor-pointer rounded-lg bg-red-600 px-3 py-2 text-sm text-white"
                                                        >
                                                            Delete
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
            </main>
        </div>
    );
}