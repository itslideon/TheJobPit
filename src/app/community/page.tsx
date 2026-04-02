import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { excerpt, mapPublicQuestion, mapPublicStarStory } from "@/lib/community-mappers";

export const metadata: Metadata = {
  title: "Community",
  description: "STAR stories and interview Q&A shared by The Job Pit users."
};

export default async function CommunityPage() {
  const [rawStars, rawQuestions] = await Promise.all([
    prisma.starStory.findMany({
      where: { isPublic: true, userId: { not: null } },
      orderBy: { updatedAt: "desc" },
      take: 60,
      include: {
        user: { select: { name: true, headline: true, location: true } },
        application: { select: { company: true, role: true } }
      }
    }),
    prisma.interviewQuestion.findMany({
      where: { isPublic: true, userId: { not: null } },
      orderBy: { updatedAt: "desc" },
      take: 60,
      include: {
        user: { select: { name: true, headline: true, location: true } }
      }
    })
  ]);

  const stars = rawStars.map(mapPublicStarStory);
  const questions = rawQuestions.map(mapPublicQuestion);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="pit-card p-6 shadow-pit md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-500/90">Community</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-50">Learn from other job seekers</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
          People opt in to share STAR stories and interview Q&amp;A from Interview Prep. Nothing appears
          here unless they turn on &quot;Share to community&quot; on their own content.
        </p>
        <p className="mt-4 text-xs text-zinc-500">
          <Link className="pit-link" href="/interview">
            Share your own prep
          </Link>{" "}
          from the Interview hub after you sign in.
        </p>
      </header>

      <section className="mt-10" aria-labelledby="community-star-heading">
        <h2 id="community-star-heading" className="text-lg font-semibold text-zinc-100">
          STAR stories
        </h2>
        {stars.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No public STAR stories yet.</p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {stars.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/community/star/${s.id}`}
                  className="block rounded-xl border border-zinc-800/90 bg-zinc-950/50 p-4 transition hover:border-teal-500/35 hover:bg-zinc-900/40"
                >
                  <p className="font-medium text-zinc-100">{s.title}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {[s.author.name, s.author.headline].filter(Boolean).join(" · ") || "Member"}
                    {s.company ? ` · ${s.company}` : ""}
                  </p>
                  <p className="mt-3 line-clamp-3 text-sm text-zinc-400">{excerpt(s.situation, 200)}</p>
                  <span className="mt-3 inline-block text-xs font-medium text-teal-400/90">Read →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12" aria-labelledby="community-q-heading">
        <h2 id="community-q-heading" className="text-lg font-semibold text-zinc-100">
          Shared interview Q&amp;A
        </h2>
        {questions.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No public questions yet.</p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {questions.map((q) => (
              <li key={q.id}>
                <Link
                  href={`/community/question/${q.id}`}
                  className="block rounded-xl border border-zinc-800/90 bg-zinc-950/50 p-4 transition hover:border-rose-500/35 hover:bg-zinc-900/40"
                >
                  <p className="text-xs text-zinc-500">{q.category || "General"}</p>
                  <p className="mt-2 font-medium text-zinc-100">{q.question}</p>
                  {q.answer ? (
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{excerpt(q.answer, 160)}</p>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-600">No answer shared.</p>
                  )}
                  <p className="mt-3 text-xs text-zinc-500">
                    {[q.author.name, q.author.headline].filter(Boolean).join(" · ") || "Member"}
                  </p>
                  <span className="mt-2 inline-block text-xs font-medium text-teal-400/90">Open →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
