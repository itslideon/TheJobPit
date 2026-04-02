"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

type Application = { id: string; company: string; role: string };
type Doc = {
  id: string;
  applicationId: string;
  type: "RESUME" | "COVER_LETTER";
  title: string;
  content: string;
  attachmentUrl: string | null;
  attachmentOriginalName: string | null;
  attachmentMime: string | null;
  updatedAt: string;
};

const ACCEPT = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export default function LabPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationId, setApplicationId] = useState("");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "RESUME" as Doc["type"],
    title: "",
    content: ""
  });
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadApps = useCallback(async () => {
    const res = await fetch("/api/applications", { cache: "no-store" });
    const json = (await res.json()) as { data: Application[] };
    setApplications(json.data);
  }, []);

  const loadDocs = useCallback(async (appId: string) => {
    if (!appId) {
      setDocs([]);
      return;
    }
    const res = await fetch(`/api/application-documents?applicationId=${appId}`, {
      cache: "no-store"
    });
    const json = (await res.json()) as { data: Doc[] };
    setDocs(json.data);
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        await loadApps();
      } finally {
        setLoading(false);
      }
    })();
  }, [loadApps]);

  useEffect(() => {
    void loadDocs(applicationId);
  }, [applicationId, loadDocs]);

  function pickFiles(list: FileList | null) {
    const first = list?.[0];
    if (!first) return;
    setFile(first);
    setMsg("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!applicationId) {
      setMsg("Pick an application first.");
      return;
    }
    if (!form.title.trim()) {
      setMsg("Add a title.");
      return;
    }
    if (!file && !form.content.trim()) {
      setMsg("Upload a PDF or Word file, or type something in Content (notes or full text).");
      return;
    }

    setMsg("");

    if (file) {
      const fd = new FormData();
      fd.set("applicationId", applicationId);
      fd.set("type", form.type);
      fd.set("title", form.title.trim());
      fd.set("content", form.content);
      fd.set("file", file);
      const res = await fetch("/api/application-documents/upload", {
        method: "POST",
        body: fd
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setMsg(err.error ?? "Upload failed.");
        return;
      }
    } else {
      const res = await fetch("/api/application-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          type: form.type,
          title: form.title.trim(),
          content: form.content.trim()
        })
      });
      if (!res.ok) {
        setMsg("Could not save document.");
        return;
      }
    }

    setForm({ type: "RESUME", title: "", content: "" });
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setMsg("Saved.");
    await loadDocs(applicationId);
  }

  async function removeDoc(id: string) {
    if (!window.confirm("Delete this document?")) return;
    await fetch(`/api/application-documents/${id}`, { method: "DELETE" });
    await loadDocs(applicationId);
  }

  async function saveEdit(id: string) {
    const doc = docs.find((d) => d.id === id);
    if (!doc) return;
    const res = await fetch(`/api/application-documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: doc.type,
        title: doc.title,
        content: doc.content
      })
    });
    if (res.ok) {
      setEditingId(null);
      setMsg("Updated.");
      await loadDocs(applicationId);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="pit-card p-6 shadow-pit">
        <h1 className="text-3xl font-bold text-zinc-50">Resume + Cover Letter Lab</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Upload PDF or Word files, or paste text. You can combine a file with optional notes in
          Content.
        </p>
      </header>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="pit-card p-5">
          <h2 className="text-lg font-semibold text-zinc-100">New document</h2>
          {loading ? (
            <p className="mt-4 text-sm text-zinc-500">Loading applications…</p>
          ) : (
            <>
              <label className="mt-4 block text-xs text-zinc-500">
                Application
                <select
                  className="pit-input mt-1"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                >
                  <option value="">Select application</option>
                  {applications.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.company} — {a.role}
                    </option>
                  ))}
                </select>
              </label>
              <form className="mt-4 space-y-3" onSubmit={onSubmit}>
                <select
                  className="pit-input"
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value as Doc["type"] }))
                  }
                >
                  <option value="RESUME">Resume</option>
                  <option value="COVER_LETTER">Cover letter</option>
                </select>
                <input
                  required
                  className="pit-input placeholder:text-zinc-600"
                  placeholder="Title (e.g. Acme — SWE resume v2)"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />

                <div>
                  <p className="text-xs text-zinc-500">File (optional)</p>
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      pickFiles(e.dataTransfer.files);
                    }}
                    className={`mt-1 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center text-sm transition ${
                      dragOver
                        ? "border-teal-500/45 bg-teal-950/25 text-zinc-50"
                        : "border-zinc-700/60 bg-zinc-950/30 text-zinc-500 hover:border-teal-500/25"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPT}
                      className="hidden"
                      onChange={(e) => pickFiles(e.target.files)}
                    />
                    <span className="font-medium text-zinc-300">
                      Drop PDF or Word here, or click to browse
                    </span>
                    <span className="mt-1 text-xs text-zinc-500">
                      .pdf, .doc, .docx — max 8 MB
                    </span>
                    {file ? (
                      <span className="mt-3 truncate text-xs text-zinc-100">{file.name}</span>
                    ) : null}
                    {file ? (
                      <button
                        type="button"
                        className="mt-2 text-xs text-teal-400 underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      >
                        Remove file
                      </button>
                    ) : null}
                  </div>
                </div>

                <label className="block text-xs text-zinc-500">
                  Content (optional if you upload a file)
                  <textarea
                    className="pit-input mt-1 h-40 placeholder:text-zinc-600"
                    placeholder="Notes, bullet summary, or paste full text if you are not uploading a file."
                    value={form.content}
                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  />
                </label>
                <button
                  type="submit"
                  className="pit-btn-primary w-full"
                >
                  Save document
                </button>
              </form>
            </>
          )}
          {msg ? (
            <p className="mt-3 text-sm text-zinc-500" role="status">
              {msg}
            </p>
          ) : null}
        </div>

        <div className="pit-card p-5">
          <h2 className="text-lg font-semibold text-zinc-100">Your versions</h2>
          {!applicationId ? (
            <p className="mt-4 text-sm text-zinc-500">Select an application to see documents.</p>
          ) : docs.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">No documents yet for this application.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {docs.map((d) => (
                <li
                  key={d.id}
                  className="rounded-lg border border-zinc-700/60 bg-zinc-950/40 p-3"
                >
                  {editingId === d.id ? (
                    <div className="space-y-2">
                      <select
                        className="pit-input px-2 py-1 text-xs"
                        value={d.type}
                        onChange={(e) =>
                          setDocs((list) =>
                            list.map((x) =>
                              x.id === d.id
                                ? { ...x, type: e.target.value as Doc["type"] }
                                : x
                            )
                          )
                        }
                      >
                        <option value="RESUME">Resume</option>
                        <option value="COVER_LETTER">Cover letter</option>
                      </select>
                      <input
                        className="pit-input py-1 text-sm"
                        value={d.title}
                        onChange={(e) =>
                          setDocs((list) =>
                            list.map((x) => (x.id === d.id ? { ...x, title: e.target.value } : x))
                          )
                        }
                      />
                      {d.attachmentUrl ? (
                        <p className="text-xs text-zinc-500">
                          Attachment:{" "}
                          <a
                            href={d.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-teal-400/90 underline"
                          >
                            {d.attachmentOriginalName ?? "Download"}
                          </a>
                          {" · "}
                          Edit title/notes below; replace file by deleting and re-adding.
                        </p>
                      ) : null}
                      <textarea
                        className="pit-input h-32 text-xs"
                        value={d.content}
                        onChange={(e) =>
                          setDocs((list) =>
                            list.map((x) =>
                              x.id === d.id ? { ...x, content: e.target.value } : x
                            )
                          )
                        }
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="pit-btn-primary px-2 py-1 text-xs"
                          onClick={() => void saveEdit(d.id)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="pit-btn-secondary px-2 py-1 text-xs"
                          onClick={() => {
                            setEditingId(null);
                            void loadDocs(applicationId);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-zinc-100">{d.title}</p>
                          <p className="text-xs text-zinc-500">
                            {d.type === "RESUME" ? "Resume" : "Cover letter"}
                          </p>
                          {d.attachmentUrl ? (
                            <a
                              href={d.attachmentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-block text-xs text-teal-400/90 underline hover:text-teal-300"
                            >
                              {d.attachmentOriginalName ?? "Open attachment"}
                              {d.attachmentMime ? ` (${d.attachmentMime.split("/").pop()})` : ""}
                            </a>
                          ) : null}
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="pit-btn-secondary px-2 py-0.5 text-xs"
                            onClick={() => setEditingId(d.id)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded border border-rose-800/60 px-2 py-0.5 text-xs text-rose-300/90"
                            onClick={() => void removeDoc(d.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {d.content ? (
                        <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs text-zinc-400">
                          {d.content}
                        </p>
                      ) : d.attachmentUrl ? (
                        <p className="mt-2 text-xs text-zinc-600">File only — no text notes.</p>
                      ) : null}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
