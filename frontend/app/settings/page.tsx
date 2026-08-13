"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import AccountSettings from "../../components/AccountSettings";

export default function SettingsPage() {
    const [accountSize, setAccountSize] = useState("");
    const [currency, setCurrency] = useState("");
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    async function loadSettings() {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            window.location.href = "/login";
            return;
        }

        setUserEmail(session.user.email ?? null);

        const response = await fetch("http://127.0.0.1:8000/settings", {
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        });

        const data = await response.json();

        if (data.length > 0) {
            setAccountSize(String(data[0].account_size));
            setCurrency(data[0].currency);
        }

        setAuthLoading(false);
    }

    async function handleSaveSettings() {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            window.location.href = "/login";
            return;
        }

        await fetch("http://127.0.0.1:8000/settings", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
                account_size: Number(accountSize),
                currency,
            }),
        });

        await loadSettings();
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        window.location.href = "/login";
    }

    useEffect(() => {
        loadSettings();
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
                <h2 className="text-3xl font-bold">
                    Settings
                </h2>

                <p className="mt-1 text-zinc-600">
                    Manage your trading account preferences.
                </p>

                <AccountSettings
                    accountSize={accountSize}
                    currency={currency}
                    setAccountSize={setAccountSize}
                    setCurrency={setCurrency}
                    onSave={handleSaveSettings}
                />
            </main>
        </div>
    );
}