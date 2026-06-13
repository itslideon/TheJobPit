"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
  _count: { applications: number; starStories: number; interviewQuestions: number };
  gameProfile: { level: number; xp: number; streakDays: number } | null;
};

export function AdminUsersClient() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (q: string) => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    const res = await fetch(`/api/admin/users?${params.toString()}`, { cache: "no-store" });
    const body = (await res.json().catch(() => ({}))) as { data?: UserRow[]; error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(body.error ?? "Could not load users.");
      return;
    }
    setUsers(body.data ?? []);
  }, []);

  useEffect(() => {
    void load("");
  }, [load]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    void load(query);
  }

  return (
    <section className="pit-card p-5">
      <h2 className="text-lg font-semibold text-zinc-100">Users</h2>
      <form className="mt-4 flex flex-wrap gap-2" onSubmit={onSearch}>
        <input
          className="pit-input min-w-[14rem] flex-1 py-1.5"
          placeholder="Search by email or name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="pit-btn-secondary px-4 py-1.5 text-sm">
          Search
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
      {loading ? (
        <p className="mt-5 text-sm text-zinc-500">Loading…</p>
      ) : users.length === 0 ? (
        <p className="mt-5 text-sm text-zinc-500">No users found.</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="pb-2 pr-4">User</th>
                <th className="pb-2 pr-4">Role</th>
                <th className="pb-2 pr-4">Activity</th>
                <th className="pb-2">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-zinc-200">{u.name ?? "—"}</p>
                    <p className="text-xs text-zinc-500">{u.email}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        u.role === "ADMIN"
                          ? "bg-rose-950/50 text-rose-200"
                          : "bg-zinc-800/80 text-zinc-400"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-zinc-400">
                    {u._count.applications} apps · {u._count.starStories} STAR ·{" "}
                    {u._count.interviewQuestions} Q&amp;A
                    {u.gameProfile ? (
                      <>
                        <br />
                        Lv {u.gameProfile.level} · {u.gameProfile.xp} XP · {u.gameProfile.streakDays}d
                        streak
                      </>
                    ) : null}
                  </td>
                  <td className="py-3 text-xs text-zinc-500">
                    {new Date(u.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
