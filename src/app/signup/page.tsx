"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setPending(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim() || undefined
      })
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(body.error ?? "Could not create account.");
      return;
    }
    const sign = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
      callbackUrl: "/dashboard"
    });
    if (sign?.error) {
      setError("Account created but login failed. Try logging in manually.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-md flex-col justify-center px-6 py-12">
      <div className="pit-card p-8 shadow-pit">
        <h1 className="text-2xl font-bold text-zinc-50">Create account</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Password must be at least 8 characters. We hash passwords securely server-side.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="pit-label">
            Name (optional)
            <input
              type="text"
              autoComplete="name"
              className="pit-input mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
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
          <label className="pit-label">
            Password
            <input
              required
              type="password"
              autoComplete="new-password"
              className="pit-input mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error ? (
            <p className="text-sm text-rose-400" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={pending} className="pit-btn-primary w-full">
            {pending ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link className="pit-link" href="/login">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
