"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() })
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    setPending(false);
    if (!res.ok) {
      setError(body.error ?? "Something went wrong.");
      return;
    }
    setDone(true);
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-md flex-col justify-center px-6 py-12">
      <div className="pit-card p-8 shadow-pit">
        <h1 className="text-2xl font-bold text-zinc-50">Forgot password</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Enter your email and we will send you a link to choose a new password.
        </p>
        {done ? (
          <p className="mt-6 text-sm text-zinc-400" role="status">
            If an account exists for that email, we sent a reset link. Check your inbox and spam
            folder.
          </p>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <label className="pit-label">
              Email
              <input
                required
                type="email"
                autoComplete="email"
                className="pit-input mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            {error ? (
              <p className="text-sm text-rose-400" role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" disabled={pending} className="pit-btn-primary w-full">
              {pending ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link className="pit-link" href="/login">
            Back to log in
          </Link>
        </p>
      </div>
    </main>
  );
}
