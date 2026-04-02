import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { mapPublicStarStory } from "@/lib/community-mappers";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const row = await prisma.starStory.findFirst({
    where: { id, isPublic: true },
    select: { title: true }
  });
  if (!row) return { title: "Story" };
  return { title: row.title };
}

export default async function CommunityStarPage({ params }: Props) {
  const { id } = await params;
  const raw = await prisma.starStory.findFirst({
    where: { id, isPublic: true, userId: { not: null } },
    include: {
      user: { select: { name: true, headline: true, location: true } },
      application: { select: { company: true, role: true } }
    }
  });
  if (!raw) notFound();

  const s = mapPublicStarStory(raw);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-sm text-zinc-500">
        <Link className="pit-link" href="/community">
          ← Community
        </Link>
      </p>
      <article className="pit-card mt-6 p-6 shadow-pit md:p-8">
        <h1 className="text-2xl font-bold text-zinc-50">{s.title}</h1>
        <p className="mt-3 text-sm text-zinc-500">
          {[s.author.name, s.author.headline, s.author.location].filter(Boolean).join(" · ") ||
            "Member"}
          {s.company && s.role ? (
            <>
              {" "}
              · {s.role} at {s.company}
            </>
          ) : null}
        </p>
        <div className="pit-marketing-prose mt-8 space-y-4">
          <p>
            <strong className="text-teal-400/90">Situation</strong>
            <br />
            <span className="text-zinc-300">{s.situation}</span>
          </p>
          <p>
            <strong className="text-teal-400/90">Task</strong>
            <br />
            <span className="text-zinc-300">{s.task}</span>
          </p>
          <p>
            <strong className="text-teal-400/90">Action</strong>
            <br />
            <span className="text-zinc-300">{s.action}</span>
          </p>
          <p>
            <strong className="text-teal-400/90">Result</strong>
            <br />
            <span className="text-zinc-300">{s.result}</span>
          </p>
        </div>
      </article>
    </main>
  );
}
