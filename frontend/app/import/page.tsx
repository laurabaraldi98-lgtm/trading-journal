"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

import Sidebar from "../../components/Sidebar";
import { API_URL } from "../../lib/api";
import { supabase } from "../../lib/supabase";

type Account = {
    id: number;
    name: string;
};

type ImportErrorDetail = {
    message?: string;
    missing_fields?: string[];
    ambiguous_fields?: Record<string, string[]>;
    errors?: Array<{
        row: number;
        field: string;
        message: string;
    }>;
};

function formatImportError(data: { detail?: string | ImportErrorDetail }) {
    if (typeof data.detail === "string") {
        return data.detail;
    }

    if (!data.detail) {
        return "Unable to import this CSV file.";
    }

    const { message, missing_fields, ambiguous_fields, errors } = data.detail;

    if (missing_fields?.length) {
        return `${message ?? "Required columns are missing"}: ${missing_fields.join(", ")}.`;
    }

    if (ambiguous_fields && Object.keys(ambiguous_fields).length > 0) {
        return `${message ?? "Some columns are ambiguous"}: ${Object.keys(ambiguous_fields).join(", ")}.`;
    }

    if (errors?.length) {
        const firstError = errors[0];
        const remainingErrors = errors.length - 1;
        const suffix = remainingErrors > 0 ? ` (${remainingErrors} more errors)` : "";

        return `Row ${firstError.row}, ${firstError.field}: ${firstError.message}${suffix}`;
    }

    return message ?? "Unable to import this CSV file.";
}

export default function ImportPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [importLoading, setImportLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        async function loadPage() {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                router.push("/login");
                return;
            }

            setUserEmail(session.user.email ?? null);

            const response = await fetch(`${API_URL}/accounts`, {
                cache: "no-store",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });

            if (!response.ok) {
                setError("Unable to load accounts.");
                setAuthLoading(false);
                return;
            }

            const data: Account[] = await response.json();

            setAccounts(data);
            setSelectedAccountId(data[0]?.id ?? null);
            setError(null);
            setAuthLoading(false);
        }

        loadPage();

        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.push("/login");
                return;
            }

            setUserEmail(session.user.email ?? null);
        });

        return () => data.subscription.unsubscribe();
    }, [router]);

    async function handleImport() {
        if (!selectedFile) {
            setError("Please select a CSV file.");
            return;
        }

        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            router.push("/login");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("account_id", String(selectedAccountId));

        setImportLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`${API_URL}/imports`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: formData,
            });
            const data = await response.json();

            if (!response.ok) {
                setError(formatImportError(data));
                return;
            }

            const importedCount = data.imported_count;
            const tradeLabel = importedCount === 1 ? "trade" : "trades";

            setSuccess(`${importedCount} ${tradeLabel} imported successfully.`);
            setSelectedFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch {
            setError("Unable to connect to the server.");
        } finally {
            setImportLoading(false);
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/login");
    }

    if (authLoading) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            <main className="min-w-0 flex-1 px-5 py-5 sm:px-6 md:px-8 md:py-8 xl:px-10">
                <div className="pl-14 md:pl-0">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                        Import CSV
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Upload trades from your broker or trading platform.
                    </p>
                </div>

                <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="import-account"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Account
                            </label>
                            <select
                                id="import-account"
                                value={selectedAccountId ?? ""}
                                onChange={(event) => {
                                    setSelectedAccountId(Number(event.target.value));
                                    setError(null);
                                    setSuccess(null);
                                }}
                                disabled={accounts.length === 0 || importLoading}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                            >
                                {accounts.length === 0 ? (
                                    <option value="">No accounts available</option>
                                ) : (
                                    accounts.map((account) => (
                                        <option key={account.id} value={account.id}>
                                            {account.name}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="csv-file"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                CSV file
                            </label>
                            <input
                                ref={fileInputRef}
                                id="csv-file"
                                type="file"
                                accept=".csv,text/csv"
                                disabled={importLoading}
                                onChange={(event) => {
                                    setSelectedFile(event.target.files?.[0] ?? null);
                                    setError(null);
                                    setSuccess(null);
                                }}
                                className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-white text-sm text-slate-600 file:mr-4 file:cursor-pointer file:border-0 file:bg-slate-100 file:px-4 file:py-2.5 file:font-medium file:text-slate-700 hover:file:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>

                    {accounts.length === 0 && (
                        <p className="mt-4 text-sm text-amber-700">
                            Create an account before importing trades.
                        </p>
                    )}

                    {error && (
                        <p className="mt-4 text-sm font-medium text-red-600">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="mt-4 text-sm font-medium text-emerald-600">
                            {success}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={handleImport}
                        disabled={importLoading || accounts.length === 0}
                        className="mt-4 flex cursor-pointer items-center gap-2 rounded-lg bg-black px-4 py-2 text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Upload size={16} />
                        {importLoading ? "Importing..." : "Import trades"}
                    </button>
                </section>
            </main>
        </div>
    );
}
