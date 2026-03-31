"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/types/application";

type ApplicationRecord = {
  id: string;
  company: string;
  role: string;
  location: string | null;
  sourceUrl: string | null;
  notes: string | null;
  status: ApplicationStatus;
  appliedAt: string | null;
  deadlineAt: string | null;
  followUpAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const ROLE_PRESETS = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Data Engineer",
  "DevOps / SRE",
  "Product Manager",
  "Designer"
] as const;

const ROLE_OTHER = "__other__" as const;

type FormState = {
  company: string;
  roleSelect: "" | (typeof ROLE_PRESETS)[number] | typeof ROLE_OTHER;
  customRole: string;
  location: string;
  sourceUrl: string;
  notes: string;
  status: ApplicationStatus;
  appliedAt: string;
  deadlineAt: string;
  followUpAt: string;
};

const defaultFormState: FormState = {
  company: "",
  roleSelect: "",
  customRole: "",
  location: "",
  sourceUrl: "",
  notes: "",
  status: "WISHLIST",
  appliedAt: "",
  deadlineAt: "",
  followUpAt: ""
};

function resolveRole(form: FormState): string | null {
  if (!form.roleSelect) return null;
  if (form.roleSelect === ROLE_OTHER) {
    const trimmed = form.customRole.trim();
    return trimmed.length >= 2 ? trimmed : null;
  }
  return form.roleSelect;
}

const statusDisplay: Record<ApplicationStatus, string> = {
  WISHLIST: "Wishlist",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn"
};

function toIsoDateTime(value: string) {
  return value ? new Date(`${value}T00:00:00.000Z`).toISOString() : undefined;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [formState, setFormState] = useState<FormState>(defaultFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string>("");

  async function loadApplications() {
    setIsLoading(true);
    setFeedback("");

    try {
      const response = await fetch("/api/applications", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load applications.");
      }

      const payload = (await response.json()) as { data: ApplicationRecord[] };
      setApplications(payload.data);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to fetch data.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadApplications();
  }, []);

  const sortedApplications = useMemo(
    () =>
      [...applications].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [applications]
  );

  async function handleCreateApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback("");

    const role = resolveRole(formState);
    if (!role) {
      setFeedback(
        formState.roleSelect === ROLE_OTHER
          ? "Enter a custom role (at least 2 characters)."
          : "Select a role or choose Other and type your own."
      );
      setIsSubmitting(false);
      return;
    }

    const isWishlist = formState.status === "WISHLIST";

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: formState.company,
          role,
          location: formState.location || undefined,
          sourceUrl: formState.sourceUrl || undefined,
          notes: formState.notes || undefined,
          status: formState.status,
          appliedAt: isWishlist ? undefined : toIsoDateTime(formState.appliedAt),
          deadlineAt: isWishlist ? undefined : toIsoDateTime(formState.deadlineAt),
          followUpAt: isWishlist ? undefined : toIsoDateTime(formState.followUpAt)
        })
      });

      if (!response.ok) {
        throw new Error("Could not create application.");
      }

      setFormState(defaultFormState);
      setFeedback("Application added.");
      await loadApplications();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateStatus(id: string, status: ApplicationStatus) {
    setFeedback("");

    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error("Status update failed.");
      }

      setFeedback("Status updated.");
      await loadApplications();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Request failed.");
    }
  }

  async function deleteApplication(id: string) {
    const ok = window.confirm("Delete this application?");
    if (!ok) return;

    setFeedback("");

    try {
      const response = await fetch(`/api/applications/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Delete failed.");
      }

      setFeedback("Application removed.");
      await loadApplications();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Request failed.");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-10">
      <header className="rounded-2xl border border-red-950 bg-black/70 p-6 shadow-[0_0_40px_rgba(220,38,38,0.12)]">
        <h1 className="text-3xl font-bold text-red-100">Applications</h1>
        <p className="mt-2 text-sm text-red-200/80">
          Create, monitor, and update every job application in one place.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form
          className="rounded-2xl border border-red-950 bg-black/70 p-5"
          onSubmit={handleCreateApplication}
        >
          <h2 className="mb-4 text-lg font-semibold text-red-100">Add application</h2>
          <div className="space-y-3">
            <input
              required
              className="w-full rounded-md border border-red-900 bg-black/80 px-3 py-2 text-sm text-red-50 outline-none ring-red-700 placeholder:text-red-300/50 focus:ring-2"
              placeholder="Company"
              value={formState.company}
              onChange={(event) =>
                setFormState((current) => ({ ...current, company: event.target.value }))
              }
            />
            <label className="block text-xs text-red-200/70">
              Role
              <select
                className="mt-1 w-full rounded-md border border-red-900 bg-black/80 px-3 py-2 text-sm text-red-50 outline-none ring-red-700 focus:ring-2"
                value={formState.roleSelect}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    roleSelect: event.target.value as FormState["roleSelect"]
                  }))
                }
              >
                <option value="">Select role</option>
                {ROLE_PRESETS.map((preset) => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
                <option value={ROLE_OTHER}>Other (custom)</option>
              </select>
            </label>
            {formState.roleSelect === ROLE_OTHER ? (
              <input
                required
                className="w-full rounded-md border border-red-900 bg-black/80 px-3 py-2 text-sm text-red-50 outline-none ring-red-700 placeholder:text-red-300/50 focus:ring-2"
                placeholder="Type your role title"
                value={formState.customRole}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, customRole: event.target.value }))
                }
              />
            ) : null}
            <input
              className="w-full rounded-md border border-red-900 bg-black/80 px-3 py-2 text-sm text-red-50 outline-none ring-red-700 placeholder:text-red-300/50 focus:ring-2"
              placeholder="Location (optional)"
              value={formState.location}
              onChange={(event) =>
                setFormState((current) => ({ ...current, location: event.target.value }))
              }
            />
            <input
              className="w-full rounded-md border border-red-900 bg-black/80 px-3 py-2 text-sm text-red-50 outline-none ring-red-700 placeholder:text-red-300/50 focus:ring-2"
              placeholder="Source URL (optional)"
              value={formState.sourceUrl}
              onChange={(event) =>
                setFormState((current) => ({ ...current, sourceUrl: event.target.value }))
              }
            />
            <select
              className="w-full rounded-md border border-red-900 bg-black/80 px-3 py-2 text-sm text-red-50 outline-none ring-red-700 focus:ring-2"
              value={formState.status}
              onChange={(event) => {
                const next = event.target.value as ApplicationStatus;
                setFormState((current) => ({
                  ...current,
                  status: next,
                  ...(next === "WISHLIST"
                    ? { appliedAt: "", deadlineAt: "", followUpAt: "" }
                    : {})
                }));
              }}
            >
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusDisplay[status]}
                </option>
              ))}
            </select>
            {formState.status === "WISHLIST" ? (
              <p className="text-xs text-red-300/60">
                Wishlist is for roles you’re interested in before you apply. Date fields appear
                once you change status to Applied or later.
              </p>
            ) : null}
            {formState.status !== "WISHLIST" ? (
              <>
                <label className="block text-xs text-red-200/70">
                  Applied date
                  <input
                    type="date"
                    className="mt-1 w-full rounded-md border border-red-900 bg-black/80 px-3 py-2 text-sm text-red-50 outline-none ring-red-700 focus:ring-2"
                    value={formState.appliedAt}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, appliedAt: event.target.value }))
                    }
                  />
                </label>
                <label className="block text-xs text-red-200/70">
                  Deadline date
                  <input
                    type="date"
                    className="mt-1 w-full rounded-md border border-red-900 bg-black/80 px-3 py-2 text-sm text-red-50 outline-none ring-red-700 focus:ring-2"
                    value={formState.deadlineAt}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, deadlineAt: event.target.value }))
                    }
                  />
                </label>
                <label className="block text-xs text-red-200/70">
                  Follow-up date
                  <input
                    type="date"
                    className="mt-1 w-full rounded-md border border-red-900 bg-black/80 px-3 py-2 text-sm text-red-50 outline-none ring-red-700 focus:ring-2"
                    value={formState.followUpAt}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, followUpAt: event.target.value }))
                    }
                  />
                </label>
              </>
            ) : null}
            <textarea
              className="h-28 w-full rounded-md border border-red-900 bg-black/80 px-3 py-2 text-sm text-red-50 outline-none ring-red-700 placeholder:text-red-300/50 focus:ring-2"
              placeholder="Notes"
              value={formState.notes}
              onChange={(event) =>
                setFormState((current) => ({ ...current, notes: event.target.value }))
              }
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 w-full rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-900"
          >
            {isSubmitting ? "Adding..." : "Add application"}
          </button>
        </form>

        <section className="rounded-2xl border border-red-950 bg-black/70 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-red-100">Application list</h2>
            <button
              className="rounded-md border border-red-800 px-3 py-1 text-xs font-medium text-red-200 hover:bg-red-950/40"
              onClick={() => void loadApplications()}
              type="button"
            >
              Refresh
            </button>
          </div>

          {feedback ? (
            <p className="mb-3 rounded-md border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
              {feedback}
            </p>
          ) : null}

          {isLoading ? (
            <p className="text-sm text-red-200/80">Loading applications...</p>
          ) : sortedApplications.length === 0 ? (
            <p className="text-sm text-red-200/80">
              No applications yet. Add your first one from the form.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-red-900 text-xs uppercase tracking-wide text-red-300/80">
                    <th className="pb-2 pr-4">Company</th>
                    <th className="pb-2 pr-4">Role</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Applied</th>
                    <th className="pb-2 pr-4">Deadline</th>
                    <th className="pb-2 pr-4">Follow-up</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedApplications.map((application) => (
                    <tr key={application.id} className="border-b border-red-950/80 text-red-100">
                      <td className="py-3 pr-4 font-medium">{application.company}</td>
                      <td className="py-3 pr-4">{application.role}</td>
                      <td className="py-3 pr-4">
                        <select
                          className="rounded-md border border-red-900 bg-black/80 px-2 py-1 text-xs text-red-50 outline-none ring-red-700 focus:ring-2"
                          value={application.status}
                          onChange={(event) =>
                            void updateStatus(
                              application.id,
                              event.target.value as ApplicationStatus
                            )
                          }
                        >
                          {APPLICATION_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {statusDisplay[status]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 pr-4">{formatDate(application.appliedAt)}</td>
                      <td className="py-3 pr-4">{formatDate(application.deadlineAt)}</td>
                      <td className="py-3 pr-4">{formatDate(application.followUpAt)}</td>
                      <td className="py-3">
                        <button
                          type="button"
                          className="rounded-md border border-red-700 px-2 py-1 text-xs text-red-200 hover:bg-red-950/50"
                          onClick={() => void deleteApplication(application.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
