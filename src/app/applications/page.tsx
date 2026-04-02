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
      <header className="pit-card p-6 shadow-pit">
        <h1 className="text-3xl font-bold text-zinc-50">Applications</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Create, monitor, and update every job application in one place.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form className="pit-card p-5" onSubmit={handleCreateApplication}>
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">Add application</h2>
          <div className="space-y-3">
            <input
              required
              className="pit-input"
              placeholder="Company"
              value={formState.company}
              onChange={(event) =>
                setFormState((current) => ({ ...current, company: event.target.value }))
              }
            />
            <label className="pit-label">
              Role
              <select
                className="pit-input mt-1"
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
                className="pit-input"
                placeholder="Type your role title"
                value={formState.customRole}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, customRole: event.target.value }))
                }
              />
            ) : null}
            <input
              className="pit-input"
              placeholder="Location (optional)"
              value={formState.location}
              onChange={(event) =>
                setFormState((current) => ({ ...current, location: event.target.value }))
              }
            />
            <input
              className="pit-input"
              placeholder="Source URL (optional)"
              value={formState.sourceUrl}
              onChange={(event) =>
                setFormState((current) => ({ ...current, sourceUrl: event.target.value }))
              }
            />
            <select
              className="pit-input"
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
              <p className="text-xs text-zinc-500">
                Wishlist is for roles you’re interested in before you apply. Date fields appear
                once you change status to Applied or later.
              </p>
            ) : null}
            {formState.status !== "WISHLIST" ? (
              <>
                <label className="pit-label">
                  Applied date
                  <input
                    type="date"
                    className="pit-input mt-1"
                    value={formState.appliedAt}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, appliedAt: event.target.value }))
                    }
                  />
                </label>
                <label className="pit-label">
                  Deadline date
                  <input
                    type="date"
                    className="pit-input mt-1"
                    value={formState.deadlineAt}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, deadlineAt: event.target.value }))
                    }
                  />
                </label>
                <label className="pit-label">
                  Follow-up date
                  <input
                    type="date"
                    className="pit-input mt-1"
                    value={formState.followUpAt}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, followUpAt: event.target.value }))
                    }
                  />
                </label>
              </>
            ) : null}
            <textarea
              className="pit-input h-28"
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
            className="pit-btn-primary mt-4 w-full disabled:bg-zinc-800"
          >
            {isSubmitting ? "Adding..." : "Add application"}
          </button>
        </form>

        <section className="pit-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-100">Application list</h2>
            <button
              className="pit-btn-secondary px-3 py-1 text-xs"
              onClick={() => void loadApplications()}
              type="button"
            >
              Refresh
            </button>
          </div>

          {feedback ? (
            <p className="mb-3 rounded-lg border border-rose-900/40 bg-rose-950/20 px-3 py-2 text-sm text-rose-100/90">
              {feedback}
            </p>
          ) : null}

          {isLoading ? (
            <p className="text-sm text-zinc-500">Loading applications...</p>
          ) : sortedApplications.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No applications yet. Add your first one from the form.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
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
                    <tr key={application.id} className="border-b border-zinc-800/80 text-zinc-200">
                      <td className="py-3 pr-4 font-medium">{application.company}</td>
                      <td className="py-3 pr-4">{application.role}</td>
                      <td className="py-3 pr-4">
                        <select
                          className="pit-input max-w-[160px] px-2 py-1 text-xs"
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
                          className="pit-btn-danger"
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
