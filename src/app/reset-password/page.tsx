"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { FormEvent, Suspense, useState } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Missing reset token. Open the link from your email again.");
      return;
    }
    setPending(true);
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password })
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(body.error ?? "Could not reset password.");
      return;
    }
    await signOut({ redirect: false });
    const params = new URLSearchParams({ reset: "1" });
    if (email.includes("@")) {
      params.set("email", email);
    }
    router.push(`/login?${params.toString()}`);
    router.refresh();
  }

  if (!token) {
    return (
      <div className="pit-card p-8 shadow-pit">
        <h1 className="text-2xl font-bold text-zinc-50">Reset password</h1>
        <p className="mt-2 text-sm text-rose-400">
          This link is missing the reset token. Use the link from your email or request a new reset.
        </p>
        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link className="pit-link" href="/forgot-password">
            Request a new link
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="pit-card p-8 shadow-pit">
      <h1 className="text-2xl font-bold text-zinc-50">Choose a new password</h1>
      <p className="mt-2 text-sm text-zinc-500">Use at least 8 characters.</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="pit-label">
          New password
          <input
            required
            type="password"
            autoComplete="new-password"
            className="pit-input mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label className="pit-label">
          Confirm password
          <input
            required
            type="password"
            autoComplete="new-password"
            className="pit-input mt-1"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
        {error ? (
          <p className="text-sm text-rose-400" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={pending} className="pit-btn-primary w-full">
          {pending ? "Saving…" : "Update password"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link className="pit-link" href="/login">
          Back to log in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-md flex-col justify-center px-6 py-12">
      <Suspense fallback={<p className="p-10 text-center text-zinc-500">Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
