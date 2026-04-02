"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, Suspense, useEffect, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const justReset = searchParams.get("reset") === "1";
  const emailHint = searchParams.get("email")?.trim().toLowerCase() ?? "";
  const [email, setEmail] = useState(emailHint);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (emailHint && emailHint !== email) {
      setEmail(emailHint);
    }
  }, [emailHint, email]);

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
      <div className="pit-card p-8 shadow-pit">
        <h1 className="text-2xl font-bold text-zinc-50">Log in</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Welcome back. Use the email and password you registered with.
        </p>
        {justReset ? (
          <p className="mt-4 rounded-lg border border-teal-500/30 bg-teal-950/40 px-3 py-2 text-sm text-teal-200/90" role="status">
            Password updated. You can log in with your new password.
          </p>
        ) : null}
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
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="login-password" className="pit-label !mb-0">
                Password
              </label>
              <Link className="pit-link text-xs font-normal" href="/forgot-password">
                Forgot password?
              </Link>
            </div>
            <input
              id="login-password"
              required
              type="password"
              autoComplete="current-password"
              className="pit-input w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? (
            <p className="text-sm text-rose-400" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={pending} className="pit-btn-primary w-full">
            {pending ? "Signing in…" : "Log in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-500">
          No account?{" "}
          <Link className="pit-link" href="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-zinc-500">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
