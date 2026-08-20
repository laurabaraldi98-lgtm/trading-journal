"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { SITE_URL } from "../../lib/api";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [mode, setMode] = useState<"signin" | "signup">("signin");
    const [confirmPassword, setConfirmPassword] = useState("");

    const router = useRouter();

    async function handleLogin() {
        const { error } =
            await supabase.auth.signInWithPassword({
                email,
                password,
            });

        if (error) {
            setMessage(error.message);
            return;
        }

        router.push("/");
    }

    async function handleSignUp() {
        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }
        const { error } =
            await supabase.auth.signUp({
                email,
                password,
            });

        if (error) {
            setMessage(error.message);
            return;
        }

        setMessage(
            "Check your email to confirm your account."
        );
    }

    async function handleForgotPassword() {
        if (!email) {
            setMessage("Enter your email first.");
            return;
        }

        const { error } =
            await supabase.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo:
                        `${SITE_URL}/reset-password`,
                }
            );

        if (error) {
            setMessage(error.message);
            return;
        }

        setMessage(
            "Check your email for a password reset link."
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
            <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6">
                <h1 className="text-2xl font-bold">
                    Trading Journal
                </h1>

                <div className="mt-6 flex flex-col gap-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(
                                event.target.value
                            )
                        }
                        placeholder="Email"
                        className="rounded-lg border border-zinc-300 p-3"
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(
                                event.target.value
                            )
                        }
                        placeholder="Password"
                        className="rounded-lg border border-zinc-300 p-3"
                    />

                    {mode === "signin" && (
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="self-end cursor-pointer text-sm text-blue-600 hover:underline"
                        >
                            Forgot your password?
                        </button>
                    )}

                    {mode === "signup" && (
                        <input
                            type="password"
                            onClick={handleForgotPassword}
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            placeholder="Confirm password"
                            className="rounded-lg border border-zinc-300 p-3"
                        />
                    )}

                    <button
                        onClick={
                            mode === "signin"
                                ? handleLogin
                                : handleSignUp
                        }
                        className="cursor-pointer rounded-lg bg-black px-5 py-3 text-white"
                    >
                        {mode === "signin"
                            ? "Sign In"
                            : "Create Account"}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setMode(
                                mode === "signin"
                                    ? "signup"
                                    : "signin"
                            );

                            setPassword("");
                            setConfirmPassword("");
                            setMessage("");
                        }}
                        className="cursor-pointer text-sm text-zinc-600"
                    >
                        {mode === "signin"
                            ? "Don't have an account? Create one"
                            : "Already have an account? Sign in"}
                    </button>

                    {message && (
                        <p className="text-sm text-zinc-600">
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}