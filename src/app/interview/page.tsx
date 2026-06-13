"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRewardedFetch } from "@/lib/rewarded-fetch";

type Application = { id: string; company: string; role: string };

type StarRow = {
  id: string;
  applicationId: string | null;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  isPublic: boolean;
  shareCompanyContext: boolean;
};

type QRow = {
  id: string;
  applicationId: string | null;
  question: string;
  answer: string | null;
  category: string | null;
  isPublic: boolean;
};

type MockRow = {
  id: string;
  applicationId: string;
  occurredAt: string | null;
  notes: string;
  rating: number | null;
};

type Tab = "star" | "questions" | "mock";

export default function InterviewPage() {
  const { readJsonWithReward } = useRewardedFetch();
  const [tab, setTab] = useState<Tab>("star");
  const [applications, setApplications] = useState<Application[]>([]);
  const [filterApp, setFilterApp] = useState("");
  const [stars, setStars] = useState<StarRow[]>([]);
  const [questions, setQuestions] = useState<QRow[]>([]);
  const [mocks, setMocks] = useState<MockRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [starForm, setStarForm] = useState({
    title: "",
    situation: "",
    task: "",
    action: "",
    result: "",
    isPublic: false,
    shareCompanyContext: false
  });
  const [qForm, setQForm] = useState({
    question: "",
    answer: "",
    category: "",
    isPublic: false
  });
  const [mockForm, setMockForm] = useState({
    applicationId: "",
    occurredAt: "",
    notes: "",
    rating: "" as "" | "1" | "2" | "3" | "4" | "5"
  });

  const loadApps = useCallback(async () => {
    const res = await fetch("/api/applications", { cache: "no-store" });
    const json = (await res.json()) as { data: Application[] };
    setApplications(json.data);
  }, []);

  const loadStars = useCallback(async () => {
    const q = filterApp ? `?applicationId=${filterApp}` : "";
    const res = await fetch(`/api/star-stories${q}`, { cache: "no-store" });
    const json = (await res.json()) as { data: StarRow[] };
    setStars(json.data);
  }, [filterApp]);

  const loadQuestions = useCallback(async () => {
    const q = filterApp ? `?applicationId=${filterApp}` : "";
    const res = await fetch(`/api/interview-questions${q}`, { cache: "no-store" });
    const json = (await res.json()) as { data: QRow[] };
    setQuestions(json.data);
  }, [filterApp]);

  const loadMocks = useCallback(async () => {
    const q = filterApp ? `?applicationId=${filterApp}` : "";
    const res = await fetch(`/api/mock-interviews${q}`, { cache: "no-store" });
    const json = (await res.json()) as { data: MockRow[] };
    setMocks(json.data);
  }, [filterApp]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadApps();
      setLoading(false);
    })();
  }, [loadApps]);

  useEffect(() => {
    void loadStars();
    void loadQuestions();
    void loadMocks();
  }, [loadStars, loadQuestions, loadMocks]);

  async function addStar(e: FormEvent) {
    e.preventDefault();
    const shareCompany =
      starForm.isPublic && starForm.shareCompanyContext && Boolean(filterApp);
    const res = await fetch("/api/star-stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: filterApp || undefined,
        title: starForm.title,
        situation: starForm.situation,
        task: starForm.task,
        action: starForm.action,
        result: starForm.result,
        isPublic: starForm.isPublic,
        shareCompanyContext: shareCompany
      })
    });
    await readJsonWithReward(res);
    setStarForm({
      title: "",
      situation: "",
      task: "",
      action: "",
      result: "",
      isPublic: false,
      shareCompanyContext: false
    });
    await loadStars();
  }

  async function patchStar(id: string, patch: { isPublic?: boolean; shareCompanyContext?: boolean }) {
    const res = await fetch(`/api/star-stories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    await readJsonWithReward(res);
    await loadStars();
  }

  async function delStar(id: string) {
    if (!confirm("Delete this STAR story?")) return;
    await fetch(`/api/star-stories/${id}`, { method: "DELETE" });
    await loadStars();
  }

  async function addQ(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/interview-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: filterApp || undefined,
        question: qForm.question,
        answer: qForm.answer || undefined,
        category: qForm.category || undefined,
        isPublic: qForm.isPublic
      })
    });
    await readJsonWithReward(res);
    setQForm({ question: "", answer: "", category: "", isPublic: false });
    await loadQuestions();
  }

  async function patchQ(id: string, isPublic: boolean) {
    const res = await fetch(`/api/interview-questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic })
    });
    await readJsonWithReward(res);
    await loadQuestions();
  }

  async function delQ(id: string) {
    if (!confirm("Delete this question?")) return;
    await fetch(`/api/interview-questions/${id}`, { method: "DELETE" });
    await loadQuestions();
  }

  async function addMock(e: FormEvent) {
    e.preventDefault();
    if (!mockForm.applicationId) return;
    const res = await fetch("/api/mock-interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: mockForm.applicationId,
        occurredAt: mockForm.occurredAt
          ? new Date(mockForm.occurredAt).toISOString()
          : undefined,
        notes: mockForm.notes,
        rating: mockForm.rating ? Number(mockForm.rating) : undefined
      })
    });
    await readJsonWithReward(res);
    setMockForm({ applicationId: "", occurredAt: "", notes: "", rating: "" });
    await loadMocks();
  }

  async function delMock(id: string) {
    if (!confirm("Delete this mock session?")) return;
    await fetch(`/api/mock-interviews/${id}`, { method: "DELETE" });
    await loadMocks();
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "star", label: "STAR stories" },
    { id: "questions", label: "Question bank" },
    { id: "mock", label: "Mock sessions" }
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="pit-card p-6 shadow-pit">
        <h1 className="text-3xl font-bold text-zinc-50">Interview Prep Hub</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Build STAR stories, collect questions and answers, and log mock interview sessions.{" "}
          <Link className="pit-link" href="/community">
            See what others have shared
          </Link>
          .
        </p>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="text-xs text-zinc-500">
          Filter by application (optional)
          <select
            className="pit-input ml-2 inline-block w-auto py-1 text-sm"
            value={filterApp}
            onChange={(e) => setFilterApp(e.target.value)}
          >
            <option value="">All / general</option>
            {applications.map((a) => (
              <option key={a.id} value={a.id}>
                {a.company} — {a.role}
              </option>
            ))}
          </select>
        </label>
        {loading ? <span className="text-xs text-zinc-600">Loading…</span> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-b border-zinc-800 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              tab === t.id
                ? "bg-rose-500/15 text-zinc-50 ring-1 ring-rose-400/30"
                : "text-zinc-500 hover:bg-zinc-800/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "star" ? (
        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <form className="space-y-2 pit-card p-5" onSubmit={addStar}>
            <h2 className="text-lg font-semibold text-zinc-100">New STAR story</h2>
            <p className="text-xs text-zinc-500">
              {filterApp
                ? "Linked to the selected application filter."
                : "Saved as general (no application). Use filter above to link."}
            </p>
            <input
              required
              className="pit-input py-1.5"
              placeholder="Title"
              value={starForm.title}
              onChange={(e) => setStarForm((s) => ({ ...s, title: e.target.value }))}
            />
            {(["situation", "task", "action", "result"] as const).map((field) => (
              <textarea
                key={field}
                required
                className="pit-input h-20 text-xs"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={starForm[field]}
                onChange={(e) =>
                  setStarForm((s) => ({ ...s, [field]: e.target.value }))
                }
              />
            ))}
            <label className="flex cursor-pointer items-start gap-2 text-xs text-zinc-400">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-zinc-600"
                checked={starForm.isPublic}
                onChange={(e) =>
                  setStarForm((s) => ({
                    ...s,
                    isPublic: e.target.checked,
                    shareCompanyContext: e.target.checked ? s.shareCompanyContext : false
                  }))
                }
              />
              <span>Share this STAR story on the public community feed (opt-in).</span>
            </label>
            <label
              className={`flex cursor-pointer items-start gap-2 text-xs ${
                starForm.isPublic && filterApp ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              <input
                type="checkbox"
                disabled={!starForm.isPublic || !filterApp}
                className="mt-0.5 rounded border-zinc-600"
                checked={starForm.shareCompanyContext}
                onChange={(e) =>
                  setStarForm((s) => ({ ...s, shareCompanyContext: e.target.checked }))
                }
              />
              <span>
                When shared, include company &amp; role from the filtered application (requires a
                application selected in the filter above).
              </span>
            </label>
            <button
              type="submit"
              className="pit-btn-primary w-full"
            >
              Add STAR story
            </button>
          </form>
          <ul className="space-y-3">
            {stars.length === 0 ? (
              <li className="text-sm text-zinc-500">No STAR stories yet.</li>
            ) : (
              stars.map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-zinc-700/60 bg-zinc-950/40 p-3 text-sm text-zinc-100"
                >
                  <div className="flex justify-between gap-2">
                    <p className="font-medium">{s.title}</p>
                    <button
                      type="button"
                      className="text-xs text-teal-400 hover:text-teal-300"
                      onClick={() => void delStar(s.id)}
                    >
                      Delete
                    </button>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-xs text-zinc-400">
                    <strong>S:</strong> {s.situation}
                    {"\n"}
                    <strong>T:</strong> {s.task}
                    {"\n"}
                    <strong>A:</strong> {s.action}
                    {"\n"}
                    <strong>R:</strong> {s.result}
                  </p>
                  <div className="mt-3 flex flex-col gap-2 border-t border-zinc-800/80 pt-3">
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-500">
                      <input
                        type="checkbox"
                        className="rounded border-zinc-600"
                        checked={s.isPublic}
                        onChange={(e) => void patchStar(s.id, { isPublic: e.target.checked })}
                      />
                      Community feed
                    </label>
                    <label
                      className={`flex cursor-pointer items-center gap-2 text-xs ${
                        s.isPublic && s.applicationId ? "text-zinc-500" : "text-zinc-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="rounded border-zinc-600"
                        disabled={!s.isPublic || !s.applicationId}
                        checked={s.shareCompanyContext}
                        onChange={(e) =>
                          void patchStar(s.id, { shareCompanyContext: e.target.checked })
                        }
                      />
                      Show company &amp; role when shared
                    </label>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      ) : null}

      {tab === "questions" ? (
        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <form className="space-y-2 pit-card p-5" onSubmit={addQ}>
            <h2 className="text-lg font-semibold text-zinc-100">Add question</h2>
            <input
              className="pit-input py-1.5"
              placeholder="Category (optional)"
              value={qForm.category}
              onChange={(e) => setQForm((q) => ({ ...q, category: e.target.value }))}
            />
            <textarea
              required
              className="pit-input h-24"
              placeholder="Question"
              value={qForm.question}
              onChange={(e) => setQForm((q) => ({ ...q, question: e.target.value }))}
            />
            <textarea
              className="pit-input h-24"
              placeholder="Your answer (optional)"
              value={qForm.answer}
              onChange={(e) => setQForm((q) => ({ ...q, answer: e.target.value }))}
            />
            <label className="flex cursor-pointer items-start gap-2 text-xs text-zinc-400">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-zinc-600"
                checked={qForm.isPublic}
                onChange={(e) => setQForm((q) => ({ ...q, isPublic: e.target.checked }))}
              />
              <span>Share this Q&amp;A on the community feed (opt-in).</span>
            </label>
            <button
              type="submit"
              className="pit-btn-primary w-full"
            >
              Save question
            </button>
          </form>
          <ul className="space-y-3">
            {questions.length === 0 ? (
              <li className="text-sm text-zinc-500">No questions yet.</li>
            ) : (
              questions.map((q) => (
                <li
                  key={q.id}
                  className="rounded-lg border border-zinc-700/60 bg-zinc-950/40 p-3 text-sm"
                >
                  <div className="flex justify-between gap-2">
                    <span className="text-xs text-zinc-500">
                      {q.category || "General"}
                    </span>
                    <button
                      type="button"
                      className="text-xs text-teal-400 hover:text-teal-300"
                      onClick={() => void delQ(q.id)}
                    >
                      Delete
                    </button>
                  </div>
                  <p className="mt-1 font-medium text-zinc-100">{q.question}</p>
                  {q.answer ? (
                    <p className="mt-2 whitespace-pre-wrap text-xs text-zinc-400">{q.answer}</p>
                  ) : null}
                  <label className="mt-3 flex cursor-pointer items-center gap-2 border-t border-zinc-800/80 pt-3 text-xs text-zinc-500">
                    <input
                      type="checkbox"
                      className="rounded border-zinc-600"
                      checked={q.isPublic}
                      onChange={(e) => void patchQ(q.id, e.target.checked)}
                    />
                    Community feed
                  </label>
                </li>
              ))
            )}
          </ul>
        </section>
      ) : null}

      {tab === "mock" ? (
        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <form className="space-y-2 pit-card p-5" onSubmit={addMock}>
            <h2 className="text-lg font-semibold text-zinc-100">Log mock session</h2>
            <select
              required
              className="pit-input py-1.5"
              value={mockForm.applicationId}
              onChange={(e) =>
                setMockForm((m) => ({ ...m, applicationId: e.target.value }))
              }
            >
              <option value="">Select application</option>
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.company} — {a.role}
                </option>
              ))}
            </select>
            <label className="block text-xs text-zinc-500">
              Date (optional)
              <input
                type="datetime-local"
                className="pit-input mt-1"
                value={mockForm.occurredAt}
                onChange={(e) =>
                  setMockForm((m) => ({ ...m, occurredAt: e.target.value }))
                }
              />
            </label>
            <textarea
              required
              className="pit-input h-28"
              placeholder="Notes: what went well, what to improve"
              value={mockForm.notes}
              onChange={(e) => setMockForm((m) => ({ ...m, notes: e.target.value }))}
            />
            <label className="block text-xs text-zinc-500">
              Rating (1–5, optional)
              <select
                className="pit-input mt-1"
                value={mockForm.rating}
                onChange={(e) =>
                  setMockForm((m) => ({
                    ...m,
                    rating: e.target.value as typeof m.rating
                  }))
                }
              >
                <option value="">—</option>
                {([1, 2, 3, 4, 5] as const).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="pit-btn-primary w-full"
            >
              Save session
            </button>
          </form>
          <ul className="space-y-3">
            {mocks.length === 0 ? (
              <li className="text-sm text-zinc-500">No mock sessions yet.</li>
            ) : (
              mocks.map((m) => (
                <li
                  key={m.id}
                  className="rounded-lg border border-zinc-700/60 bg-zinc-950/40 p-3 text-sm text-zinc-100"
                >
                  <div className="flex justify-between gap-2">
                    <span className="text-xs text-zinc-500">
                      {m.occurredAt
                        ? new Date(m.occurredAt).toLocaleString()
                        : "No date"}
                      {m.rating ? ` · ${m.rating}/5` : ""}
                    </span>
                    <button
                      type="button"
                      className="text-xs text-teal-400 hover:text-teal-300"
                      onClick={() => void delMock(m.id)}
                    >
                      Delete
                    </button>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-xs text-zinc-400">{m.notes}</p>
                </li>
              ))
            )}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
