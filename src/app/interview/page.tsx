"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Application = { id: string; company: string; role: string };

type StarRow = {
  id: string;
  applicationId: string | null;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
};

type QRow = {
  id: string;
  applicationId: string | null;
  question: string;
  answer: string | null;
  category: string | null;
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
    result: ""
  });
  const [qForm, setQForm] = useState({
    question: "",
    answer: "",
    category: ""
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
    await fetch("/api/star-stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: filterApp || undefined,
        title: starForm.title,
        situation: starForm.situation,
        task: starForm.task,
        action: starForm.action,
        result: starForm.result
      })
    });
    setStarForm({ title: "", situation: "", task: "", action: "", result: "" });
    await loadStars();
  }

  async function delStar(id: string) {
    if (!confirm("Delete this STAR story?")) return;
    await fetch(`/api/star-stories/${id}`, { method: "DELETE" });
    await loadStars();
  }

  async function addQ(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/interview-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: filterApp || undefined,
        question: qForm.question,
        answer: qForm.answer || undefined,
        category: qForm.category || undefined
      })
    });
    setQForm({ question: "", answer: "", category: "" });
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
    await fetch("/api/mock-interviews", {
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
      <header className="rounded-2xl border border-red-950 bg-black/70 p-6 shadow-[0_0_40px_rgba(220,38,38,0.1)]">
        <h1 className="text-3xl font-bold text-red-100">Interview Prep Hub</h1>
        <p className="mt-2 text-sm text-red-200/75">
          Build STAR stories, collect questions and answers, and log mock interview sessions.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="text-xs text-red-300/70">
          Filter by application (optional)
          <select
            className="ml-2 rounded-md border border-red-900 bg-black/80 px-2 py-1 text-sm text-red-50"
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
        {loading ? <span className="text-xs text-red-400/60">Loading…</span> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-b border-red-950 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              tab === t.id
                ? "bg-red-950/80 text-red-50 ring-1 ring-red-800"
                : "text-red-300/80 hover:bg-red-950/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "star" ? (
        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <form className="space-y-2 rounded-2xl border border-red-950 bg-black/70 p-5" onSubmit={addStar}>
            <h2 className="text-lg font-semibold text-red-100">New STAR story</h2>
            <p className="text-xs text-red-300/60">
              {filterApp
                ? "Linked to the selected application filter."
                : "Saved as general (no application). Use filter above to link."}
            </p>
            <input
              required
              className="w-full rounded border border-red-900 bg-black/80 px-2 py-1.5 text-sm text-red-50"
              placeholder="Title"
              value={starForm.title}
              onChange={(e) => setStarForm((s) => ({ ...s, title: e.target.value }))}
            />
            {(["situation", "task", "action", "result"] as const).map((field) => (
              <textarea
                key={field}
                required
                className="h-20 w-full rounded border border-red-900 bg-black/80 px-2 py-1 text-xs text-red-50"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={starForm[field]}
                onChange={(e) =>
                  setStarForm((s) => ({ ...s, [field]: e.target.value }))
                }
              />
            ))}
            <button
              type="submit"
              className="w-full rounded-md bg-red-700 py-2 text-sm font-semibold text-white hover:bg-red-600"
            >
              Add STAR story
            </button>
          </form>
          <ul className="space-y-3">
            {stars.length === 0 ? (
              <li className="text-sm text-red-300/70">No STAR stories yet.</li>
            ) : (
              stars.map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-red-900/80 bg-black/60 p-3 text-sm text-red-100"
                >
                  <div className="flex justify-between gap-2">
                    <p className="font-medium">{s.title}</p>
                    <button
                      type="button"
                      className="text-xs text-red-400 hover:text-red-200"
                      onClick={() => void delStar(s.id)}
                    >
                      Delete
                    </button>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-xs text-red-200/75">
                    <strong>S:</strong> {s.situation}
                    {"\n"}
                    <strong>T:</strong> {s.task}
                    {"\n"}
                    <strong>A:</strong> {s.action}
                    {"\n"}
                    <strong>R:</strong> {s.result}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>
      ) : null}

      {tab === "questions" ? (
        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <form className="space-y-2 rounded-2xl border border-red-950 bg-black/70 p-5" onSubmit={addQ}>
            <h2 className="text-lg font-semibold text-red-100">Add question</h2>
            <input
              className="w-full rounded border border-red-900 bg-black/80 px-2 py-1.5 text-sm text-red-50"
              placeholder="Category (optional)"
              value={qForm.category}
              onChange={(e) => setQForm((q) => ({ ...q, category: e.target.value }))}
            />
            <textarea
              required
              className="h-24 w-full rounded border border-red-900 bg-black/80 px-2 py-1 text-sm text-red-50"
              placeholder="Question"
              value={qForm.question}
              onChange={(e) => setQForm((q) => ({ ...q, question: e.target.value }))}
            />
            <textarea
              className="h-24 w-full rounded border border-red-900 bg-black/80 px-2 py-1 text-sm text-red-50"
              placeholder="Your answer (optional)"
              value={qForm.answer}
              onChange={(e) => setQForm((q) => ({ ...q, answer: e.target.value }))}
            />
            <button
              type="submit"
              className="w-full rounded-md bg-red-700 py-2 text-sm font-semibold text-white hover:bg-red-600"
            >
              Save question
            </button>
          </form>
          <ul className="space-y-3">
            {questions.length === 0 ? (
              <li className="text-sm text-red-300/70">No questions yet.</li>
            ) : (
              questions.map((q) => (
                <li
                  key={q.id}
                  className="rounded-lg border border-red-900/80 bg-black/60 p-3 text-sm"
                >
                  <div className="flex justify-between gap-2">
                    <span className="text-xs text-red-400/80">
                      {q.category || "General"}
                    </span>
                    <button
                      type="button"
                      className="text-xs text-red-400 hover:text-red-200"
                      onClick={() => void delQ(q.id)}
                    >
                      Delete
                    </button>
                  </div>
                  <p className="mt-1 font-medium text-red-100">{q.question}</p>
                  {q.answer ? (
                    <p className="mt-2 whitespace-pre-wrap text-xs text-red-200/75">{q.answer}</p>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </section>
      ) : null}

      {tab === "mock" ? (
        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <form className="space-y-2 rounded-2xl border border-red-950 bg-black/70 p-5" onSubmit={addMock}>
            <h2 className="text-lg font-semibold text-red-100">Log mock session</h2>
            <select
              required
              className="w-full rounded border border-red-900 bg-black/80 px-2 py-1.5 text-sm text-red-50"
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
            <label className="block text-xs text-red-300/70">
              Date (optional)
              <input
                type="datetime-local"
                className="mt-1 w-full rounded border border-red-900 bg-black/80 px-2 py-1 text-sm text-red-50"
                value={mockForm.occurredAt}
                onChange={(e) =>
                  setMockForm((m) => ({ ...m, occurredAt: e.target.value }))
                }
              />
            </label>
            <textarea
              required
              className="h-28 w-full rounded border border-red-900 bg-black/80 px-2 py-1 text-sm text-red-50"
              placeholder="Notes: what went well, what to improve"
              value={mockForm.notes}
              onChange={(e) => setMockForm((m) => ({ ...m, notes: e.target.value }))}
            />
            <label className="block text-xs text-red-300/70">
              Rating (1–5, optional)
              <select
                className="mt-1 w-full rounded border border-red-900 bg-black/80 px-2 py-1 text-sm text-red-50"
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
              className="w-full rounded-md bg-red-700 py-2 text-sm font-semibold text-white hover:bg-red-600"
            >
              Save session
            </button>
          </form>
          <ul className="space-y-3">
            {mocks.length === 0 ? (
              <li className="text-sm text-red-300/70">No mock sessions yet.</li>
            ) : (
              mocks.map((m) => (
                <li
                  key={m.id}
                  className="rounded-lg border border-red-900/80 bg-black/60 p-3 text-sm text-red-100"
                >
                  <div className="flex justify-between gap-2">
                    <span className="text-xs text-red-400/80">
                      {m.occurredAt
                        ? new Date(m.occurredAt).toLocaleString()
                        : "No date"}
                      {m.rating ? ` · ${m.rating}/5` : ""}
                    </span>
                    <button
                      type="button"
                      className="text-xs text-red-400 hover:text-red-200"
                      onClick={() => void delMock(m.id)}
                    >
                      Delete
                    </button>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-xs text-red-200/80">{m.notes}</p>
                </li>
              ))
            )}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
