import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { mapPublicQuestion } from "@/lib/community-mappers";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const row = await prisma.interviewQuestion.findFirst({
    where: { id, isPublic: true },
    select: { question: true }
  });
  if (!row) return { title: "Question" };
  return { title: row.question.slice(0, 60) };
}

export default async function CommunityQuestionPage({ params }: Props) {
  const { id } = await params;
  const raw = await prisma.interviewQuestion.findFirst({
    where: { id, isPublic: true, userId: { not: null } },
    include: {
      user: { select: { name: true, headline: true, location: true } }
    }
  });
  if (!raw) notFound();

  const q = mapPublicQuestion(raw);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-sm text-zinc-500">
        <Link className="pit-link" href="/community">
          ← Community
        </Link>
      </p>
      <article className="pit-card mt-6 p-6 shadow-pit md:p-8">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {q.category || "General"}
        </p>
        <h1 className="mt-3 text-2xl font-bold text-zinc-50">{q.question}</h1>
        <p className="mt-3 text-sm text-zinc-500">
          {[q.author.name, q.author.headline, q.author.location].filter(Boolean).join(" · ") ||
            "Member"}
        </p>
        {q.answer ? (
          <div className="pit-marketing-prose mt-8">
            <p className="text-sm font-medium text-teal-400/90">Answer</p>
            <p className="mt-2 whitespace-pre-wrap text-zinc-300">{q.answer}</p>
          </div>
        ) : (
          <p className="mt-8 text-sm text-zinc-500">No written answer was shared.</p>
        )}
      </article>
    </main>
  );
}
