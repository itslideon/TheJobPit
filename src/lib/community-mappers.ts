import type { Prisma } from "@prisma/client";

type StarCommunity = Prisma.StarStoryGetPayload<{
  include: {
    user: { select: { name: true; headline: true; location: true } };
    application: { select: { company: true; role: true } };
  };
}>;

type QuestionCommunity = Prisma.InterviewQuestionGetPayload<{
  include: {
    user: { select: { name: true; headline: true; location: true } };
  };
}>;

export function mapPublicStarStory(s: StarCommunity) {
  const showCompany = s.isPublic && s.shareCompanyContext && s.application;
  return {
    id: s.id,
    title: s.title,
    situation: s.situation,
    task: s.task,
    action: s.action,
    result: s.result,
    updatedAt: s.updatedAt.toISOString(),
    author: {
      name: s.user?.name ?? null,
      headline: s.user?.headline ?? null,
      location: s.user?.location ?? null
    },
    company: showCompany ? s.application!.company : null,
    role: showCompany ? s.application!.role : null
  };
}

export function mapPublicQuestion(q: QuestionCommunity) {
  return {
    id: q.id,
    question: q.question,
    answer: q.answer,
    category: q.category,
    updatedAt: q.updatedAt.toISOString(),
    author: {
      name: q.user?.name ?? null,
      headline: q.user?.headline ?? null,
      location: q.user?.location ?? null
    }
  };
}

export function excerpt(text: string, max = 180) {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}
