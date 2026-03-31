"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    const res = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
      callbackUrl
    });
    setPending(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-red-950 bg-black/70 p-8 shadow-[0_0_40px_rgba(220,38,38,0.12)]">
        <h1 className="text-2xl font-bold text-red-100">Log in</h1>
        <p className="mt-2 text-sm text-red-300/70">
          Welcome back. Use the email and password you registered with.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block text-xs text-red-300/70">
            Email
            <input
              required
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-red-900 bg-black/80 px-3 py-2 text-sm text-red-50 outline-none ring-red-700 focus:ring-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-xs text-red-300/70">
            Password
            <input
              required
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-red-900 bg-black/80 px-3 py-2 text-sm text-red-50 outline-none ring-red-700 focus:ring-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-red-700 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Log in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-red-300/70">
          No account?{" "}
          <Link className="font-medium text-red-300 underline hover:text-red-200" href="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-red-300">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
