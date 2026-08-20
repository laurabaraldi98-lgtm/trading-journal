"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");
    const [message, setMessage] = useState("");
    const [isRecovery, setIsRecovery] = useState(false);
    const [checkingRecovery, setCheckingRecovery] =
        useState(true);
    const router = useRouter();

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log(
                    "AUTH EVENT:",
                    event,
                    session
                );

                if (event === "PASSWORD_RECOVERY") {
                    setIsRecovery(true);
                }

                setCheckingRecovery(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    async function handleUpdatePassword() {
        if (!password || !confirmPassword) {
            setMessage(
                "Please fill in all required fields."
            );
            return;
        }

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        const { error } =
            await supabase.auth.updateUser({
                password,
            });

        if (error) {
            setMessage(error.message);
            return;
        }

        await supabase.auth.signOut();

        router.push("/login");
    }

    if (checkingRecovery) {
        return null;
    }

    if (!isRecovery) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
                <p className="text-sm text-slate-600">
                    This password reset link is invalid or has expired.
                </p>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">
                    Reset password
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Choose a new password for your account.
                </p>

                <div className="mt-6 flex flex-col gap-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(
                                event.target.value
                            )
                        }
                        placeholder="New password"
                        className="rounded-lg border border-slate-300 p-3"
                    />

                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) =>
                            setConfirmPassword(
                                event.target.value
                            )
                        }
                        placeholder="Confirm password"
                        className="rounded-lg border border-slate-300 p-3"
                    />

                    <button
                        type="button"
                        onClick={handleUpdatePassword}
                        className="cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-blue-800"
                    >
                        Update password
                    </button>

                    {message && (
                        <p className="text-sm text-slate-600">
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}