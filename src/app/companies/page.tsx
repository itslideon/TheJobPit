"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Contact = {
  id: string;
  companyId: string;
  name: string;
  role: string | null;
  email: string | null;
  linkedin: string | null;
  isReferral: boolean;
  notes: string | null;
};

type Company = {
  id: string;
  name: string;
  website: string | null;
  industry: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  notes: string | null;
  contacts: Contact[];
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyForm, setCompanyForm] = useState({
    name: "",
    website: "",
    industry: "",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    notes: ""
  });
  const [contactForm, setContactForm] = useState({
    name: "",
    role: "",
    email: "",
    linkedin: "",
    isReferral: false,
    notes: ""
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/companies", { cache: "no-store" });
    const json = (await res.json()) as { data: Company[] };
    setCompanies(json.data);
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const selected = companies.find((c) => c.id === selectedId) ?? null;

  async function addCompany(e: FormEvent) {
    e.preventDefault();
    const body: Record<string, unknown> = {
      name: companyForm.name,
      industry: companyForm.industry || undefined,
      currency: companyForm.currency || undefined,
      notes: companyForm.notes || undefined
    };
    if (companyForm.website.trim()) {
      body.website = companyForm.website.trim();
    }
    if (companyForm.salaryMin) body.salaryMin = Number(companyForm.salaryMin);
    if (companyForm.salaryMax) body.salaryMax = Number(companyForm.salaryMax);

    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      setCompanyForm({
        name: "",
        website: "",
        industry: "",
        salaryMin: "",
        salaryMax: "",
        currency: "USD",
        notes: ""
      });
      await load();
    }
  }

  async function removeCompany(id: string) {
    if (!confirm("Delete this company and all contacts?")) return;
    await fetch(`/api/companies/${id}`, { method: "DELETE" });
    if (selectedId === id) setSelectedId(null);
    await load();
  }

  async function addContact(e: FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    await fetch(`/api/companies/${selectedId}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: contactForm.name,
        role: contactForm.role || undefined,
        email: contactForm.email || undefined,
        linkedin: contactForm.linkedin || undefined,
        isReferral: contactForm.isReferral,
        notes: contactForm.notes || undefined
      })
    });
    setContactForm({
      name: "",
      role: "",
      email: "",
      linkedin: "",
      isReferral: false,
      notes: ""
    });
    await load();
  }

  async function removeContact(id: string) {
    if (!confirm("Remove this contact?")) return;
    await fetch(`/api/company-contacts/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="pit-card p-6 shadow-pit">
        <h1 className="text-3xl font-bold text-zinc-50">Company Intel</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Track companies, salary bands, and contacts or referrals in one place.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <form
            className="pit-card p-5"
            onSubmit={addCompany}
          >
            <h2 className="text-lg font-semibold text-zinc-100">Add company</h2>
            <div className="mt-3 space-y-2">
              <input
                required
                className="pit-input py-1.5"
                placeholder="Company name"
                value={companyForm.name}
                onChange={(e) =>
                  setCompanyForm((c) => ({ ...c, name: e.target.value }))
                }
              />
              <input
                className="pit-input py-1.5"
                placeholder="Website (https://…)"
                value={companyForm.website}
                onChange={(e) =>
                  setCompanyForm((c) => ({ ...c, website: e.target.value }))
                }
              />
              <input
                className="pit-input py-1.5"
                placeholder="Industry"
                value={companyForm.industry}
                onChange={(e) =>
                  setCompanyForm((c) => ({ ...c, industry: e.target.value }))
                }
              />
              <div className="flex gap-2">
                <input
                  className="pit-input w-1/3 py-1 text-sm"
                  placeholder="Salary min"
                  type="number"
                  value={companyForm.salaryMin}
                  onChange={(e) =>
                    setCompanyForm((c) => ({ ...c, salaryMin: e.target.value }))
                  }
                />
                <input
                  className="pit-input w-1/3 py-1 text-sm"
                  placeholder="Salary max"
                  type="number"
                  value={companyForm.salaryMax}
                  onChange={(e) =>
                    setCompanyForm((c) => ({ ...c, salaryMax: e.target.value }))
                  }
                />
                <input
                  className="pit-input w-1/3 py-1 text-sm"
                  placeholder="Currency"
                  value={companyForm.currency}
                  onChange={(e) =>
                    setCompanyForm((c) => ({ ...c, currency: e.target.value }))
                  }
                />
              </div>
              <textarea
                className="pit-input h-20"
                placeholder="Notes (culture, process, red flags…)"
                value={companyForm.notes}
                onChange={(e) =>
                  setCompanyForm((c) => ({ ...c, notes: e.target.value }))
                }
              />
            </div>
            <button
              type="submit"
              className="pit-btn-primary mt-3 w-full"
            >
              Save company
            </button>
          </form>

          <div className="pit-card p-5">
            <h2 className="text-lg font-semibold text-zinc-100">Companies</h2>
            {loading ? (
              <p className="mt-3 text-sm text-zinc-500">Loading…</p>
            ) : companies.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">No companies yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {companies.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                        selectedId === c.id
                          ? "border-rose-500/50 bg-rose-950/30 text-zinc-50"
                          : "border-zinc-700/60 bg-zinc-950/40 text-zinc-300 hover:border-teal-500/25"
                      }`}
                    >
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs text-zinc-500">
                        {c.salaryMin != null && c.salaryMax != null
                          ? `${c.salaryMin}–${c.salaryMax} ${c.currency ?? ""}`
                          : "—"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="pit-card p-5">
          {!selected ? (
            <p className="text-sm text-zinc-500">
              Select a company to view intel and contacts, or add one on the left.
            </p>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-zinc-50">{selected.name}</h2>
                  {selected.website ? (
                    <a
                      href={selected.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-teal-400 underline hover:text-teal-300"
                    >
                      {selected.website}
                    </a>
                  ) : null}
                  {selected.industry ? (
                    <p className="mt-1 text-xs text-zinc-500">{selected.industry}</p>
                  ) : null}
                  {selected.salaryMin != null && selected.salaryMax != null ? (
                    <p className="mt-2 text-sm text-zinc-300">
                      Salary band: {selected.salaryMin} – {selected.salaryMax}{" "}
                      {selected.currency ?? ""}
                    </p>
                  ) : null}
                  {selected.notes ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-400">
                      {selected.notes}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="pit-btn-secondary shrink-0 px-2 py-1 text-xs"
                  onClick={() => void removeCompany(selected.id)}
                >
                  Delete company
                </button>
              </div>

              <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Contacts &amp; referrals
              </h3>
              <form className="mt-3 space-y-2 border-b border-zinc-800 pb-6" onSubmit={addContact}>
                <input
                  required
                  className="pit-input py-1.5"
                  placeholder="Name"
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
                <input
                  className="pit-input py-1.5"
                  placeholder="Role / title"
                  value={contactForm.role}
                  onChange={(e) =>
                    setContactForm((f) => ({ ...f, role: e.target.value }))
                  }
                />
                <div className="flex gap-2">
                  <input
                    className="pit-input w-1/2 py-1 text-sm"
                    placeholder="Email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                  <input
                    className="pit-input w-1/2 py-1 text-sm"
                    placeholder="LinkedIn URL"
                    value={contactForm.linkedin}
                    onChange={(e) =>
                      setContactForm((f) => ({ ...f, linkedin: e.target.value }))
                    }
                  />
                </div>
                <label className="flex items-center gap-2 text-xs text-zinc-500">
                  <input
                    type="checkbox"
                    checked={contactForm.isReferral}
                    onChange={(e) =>
                      setContactForm((f) => ({ ...f, isReferral: e.target.checked }))
                    }
                  />
                  Referral contact
                </label>
                <textarea
                  className="pit-input h-16 text-xs"
                  placeholder="Notes"
                  value={contactForm.notes}
                  onChange={(e) =>
                    setContactForm((f) => ({ ...f, notes: e.target.value }))
                  }
                />
                <button
                  type="submit"
                  className="pit-btn-primary w-full"
                >
                  Add contact
                </button>
              </form>

              <ul className="mt-4 space-y-3">
                {selected.contacts.length === 0 ? (
                  <li className="text-sm text-zinc-500">No contacts yet.</li>
                ) : (
                  selected.contacts.map((ct) => (
                    <li
                      key={ct.id}
                      className="flex items-start justify-between gap-2 rounded-lg border border-zinc-700/60 bg-zinc-950/40 p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-zinc-100">{ct.name}</p>
                        {ct.role ? (
                          <p className="text-xs text-zinc-500">{ct.role}</p>
                        ) : null}
                        {ct.email ? (
                          <p className="text-xs text-zinc-400">{ct.email}</p>
                        ) : null}
                        {ct.linkedin ? (
                          <a
                            href={ct.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-teal-400 underline"
                          >
                            LinkedIn
                          </a>
                        ) : null}
                        {ct.isReferral ? (
                          <span className="mt-1 inline-block rounded bg-teal-950/50 px-1.5 py-0.5 text-[10px] uppercase text-teal-300/90">
                            Referral
                          </span>
                        ) : null}
                        {ct.notes ? (
                          <p className="mt-2 text-xs text-zinc-400">{ct.notes}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="text-xs text-rose-400 hover:text-rose-300"
                        onClick={() => void removeContact(ct.id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
