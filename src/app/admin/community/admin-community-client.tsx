"use client";

import { useCallback, useEffect, useState } from "react";

type StarRow = {
  id: string;
  title: string;
  updatedAt: string;
  shareCompanyContext: boolean;
  user: { id: string; email: string; name: string | null };
  application: { company: string; role: string } | null;
};

type QuestionRow = {
  id: string;
  question: string;
  category: string | null;
  updatedAt: string;
  user: { id: string; email: string; name: string | null };
};

export function AdminCommunityClient() {
  const [stars, setStars] = useState<StarRow[]>([]);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/community", { cache: "no-store" });
    const body = (await res.json().catch(() => ({}))) as {
      data?: { stars: StarRow[]; questions: QuestionRow[] };
    };
    setLoading(false);
    setStars(body.data?.stars ?? []);
    setQuestions(body.data?.questions ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function hideStar(id: string) {
    if (!confirm("Remove this STAR story from the public community feed?")) return;
    setStatus("");
    const res = await fetch(`/api/admin/community/star-stories/${id}`, { method: "PATCH" });
    if (!res.ok) {
      setStatus("Could not hide STAR story.");
      return;
    }
    setStatus("STAR story removed from community.");
    await load();
  }

  async function hideQuestion(id: string) {
    if (!confirm("Remove this Q&A from the public community feed?")) return;
    setStatus("");
    const res = await fetch(`/api/admin/community/interview-questions/${id}`, {
      method: "PATCH"
    });
    if (!res.ok) {
      setStatus("Could not hide question.");
      return;
    }
    setStatus("Question removed from community.");
    await load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="pit-card p-5">
        <h2 className="text-lg font-semibold text-zinc-100">Public STAR stories</h2>
        {status ? <p className="mt-2 text-sm text-teal-300/90">{status}</p> : null}
        {loading ? (
          <p className="mt-4 text-sm text-zinc-500">Loading…</p>
        ) : stars.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No public STAR stories.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {stars.map((s) => (
              <li key={s.id} className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
                <p className="font-medium text-zinc-200">{s.title}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {s.user.name ?? s.user.email}
                  {s.shareCompanyContext && s.application
                    ? ` · ${s.application.company} — ${s.application.role}`
                    : ""}
                </p>
                <div className="mt-2 flex gap-2">
                  <a
                    href={`/community/star/${s.id}`}
                    className="pit-btn-secondary px-2 py-1 text-xs"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </a>
                  <button
                    type="button"
                    className="rounded border border-rose-500/40 px-2 py-1 text-xs text-rose-300 transition hover:bg-rose-950/40"
                    onClick={() => void hideStar(s.id)}
                  >
                    Hide from feed
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="pit-card p-5">
        <h2 className="text-lg font-semibold text-zinc-100">Public interview Q&amp;A</h2>
        {loading ? (
          <p className="mt-4 text-sm text-zinc-500">Loading…</p>
        ) : questions.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No public questions.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {questions.map((q) => (
              <li key={q.id} className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
                <p className="font-medium text-zinc-200">{q.question}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {q.user.name ?? q.user.email}
                  {q.category ? ` · ${q.category}` : ""}
                </p>
                <div className="mt-2 flex gap-2">
                  <a
                    href={`/community/question/${q.id}`}
                    className="pit-btn-secondary px-2 py-1 text-xs"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </a>
                  <button
                    type="button"
                    className="rounded border border-rose-500/40 px-2 py-1 text-xs text-rose-300 transition hover:bg-rose-950/40"
                    onClick={() => void hideQuestion(q.id)}
                  >
                    Hide from feed
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
