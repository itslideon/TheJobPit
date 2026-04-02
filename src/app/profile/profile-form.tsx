"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FormEvent, useState } from "react";

export type ProfileFormInitial = {
  name: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;
};

type Props = {
  email: string;
  initial: ProfileFormInitial;
};

export function ProfileForm({ email, initial }: Props) {
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState(initial.name ?? "");
  const [headline, setHeadline] = useState(initial.headline ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [location, setLocation] = useState(initial.location ?? "");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(initial.linkedinUrl ?? "");
  const [githubUrl, setGithubUrl] = useState(initial.githubUrl ?? "");
  const [twitterUrl, setTwitterUrl] = useState(initial.twitterUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(initial.websiteUrl ?? "");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk(false);
    setPending(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        headline,
        bio,
        location,
        phone,
        linkedinUrl,
        githubUrl,
        twitterUrl,
        websiteUrl
      })
    });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      details?: unknown;
      data?: { name: string | null };
    };
    setPending(false);
    if (!res.ok) {
      setError(body.error ?? "Could not save profile.");
      return;
    }
    setOk(true);
    if (body.data && typeof update === "function") {
      await update({ user: { name: body.data.name ?? undefined } });
    }
    router.refresh();
  }

  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      <section className="pit-card p-6 shadow-pit md:p-8">
        <h2 className="text-lg font-semibold text-zinc-100">Account</h2>
        <p className="mt-1 text-sm text-zinc-500">Email is used to sign in and cannot be changed here.</p>
        <label className="pit-label mt-4">
          Email
          <input className="pit-input mt-1 bg-zinc-900/50" type="email" value={email} disabled readOnly />
        </label>
        <label className="pit-label mt-4">
          Display name
          <input
            className="pit-input mt-1"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
      </section>

      <section className="pit-card p-6 shadow-pit md:p-8">
        <h2 className="text-lg font-semibold text-zinc-100">About you</h2>
        <p className="mt-1 text-sm text-zinc-500">Shown only to you unless you share this app elsewhere.</p>
        <label className="pit-label mt-4">
          Headline
          <input
            className="pit-input mt-1"
            type="text"
            placeholder="e.g. CS student · open to internships"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
        </label>
        <label className="pit-label mt-4">
          Bio
          <textarea
            className="pit-input mt-1 min-h-[120px] resize-y"
            placeholder="A short intro, focus areas, or what you are looking for next."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="pit-label">
            Location
            <input
              className="pit-input mt-1"
              type="text"
              autoComplete="address-level2"
              placeholder="City, region"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </label>
          <label className="pit-label">
            Phone
            <input
              className="pit-input mt-1"
              type="tel"
              autoComplete="tel"
              placeholder="Optional"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="pit-card p-6 shadow-pit md:p-8">
        <h2 className="text-lg font-semibold text-zinc-100">Links</h2>
        <p className="mt-1 text-sm text-zinc-500">Use full URLs including https://</p>
        <label className="pit-label mt-4">
          LinkedIn
          <input
            className="pit-input mt-1"
            type="url"
            inputMode="url"
            placeholder="https://www.linkedin.com/in/…"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
          />
        </label>
        <label className="pit-label mt-4">
          GitHub
          <input
            className="pit-input mt-1"
            type="url"
            inputMode="url"
            placeholder="https://github.com/…"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />
        </label>
        <label className="pit-label mt-4">
          X (Twitter)
          <input
            className="pit-input mt-1"
            type="url"
            inputMode="url"
            placeholder="https://x.com/…"
            value={twitterUrl}
            onChange={(e) => setTwitterUrl(e.target.value)}
          />
        </label>
        <label className="pit-label mt-4">
          Website / portfolio
          <input
            className="pit-input mt-1"
            type="url"
            inputMode="url"
            placeholder="https://…"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
          />
        </label>
      </section>

      {error ? (
        <p className="text-sm text-rose-400" role="alert">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p className="text-sm text-teal-300/90" role="status">
          Profile saved.
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="pit-btn-primary px-8">
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
