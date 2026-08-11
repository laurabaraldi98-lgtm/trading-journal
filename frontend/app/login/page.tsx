"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    async function handleLogin() {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
            return;
        }

        console.log(data);

        setMessage("Login successful");
    }

    async function handleSignUp() {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
            return;
        }

        setMessage("Check your email to confirm your account.");
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
            <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6">
                <h1 className="text-2xl font-bold">Trading Journal</h1>

                <div className="mt-6 flex flex-col gap-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Email"
                        className="rounded-lg border border-zinc-300 p-3"
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Password"
                        className="rounded-lg border border-zinc-300 p-3"
                    />

                    <button
                        onClick={handleLogin}
                        className="cursor-pointer rounded-lg bg-black px-5 py-3 text-white"
                    >
                        Sign In
                    </button>

                    <button
                        onClick={handleSignUp}
                        className="cursor-pointer rounded-lg border border-zinc-300 px-5 py-3"
                    >
                        Create Account
                    </button>

                    {message && (
                        <p className="text-sm text-zinc-600">{message}</p>
                    )}
                </div>
            </div>
        </main>
    );
}