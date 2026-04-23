import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session-user";
import { createInterviewQuestionSchema } from "@/lib/validation";
import { awardGamification } from "@/lib/gamification";

export async function GET(request: Request) {
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const applicationId = new URL(request.url).searchParams.get("applicationId");
  const data = await prisma.interviewQuestion.findMany({
    where: {
      userId,
      ...(applicationId ? { applicationId } : {})
    },
    orderBy: [{ updatedAt: "desc" }]
  });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const body = await request.json();
  const parsed = createInterviewQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { applicationId, ...rest } = parsed.data;
  if (applicationId) {
    const app = await prisma.application.findFirst({
      where: { id: applicationId, userId }
    });
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }
  }

  const data = await prisma.interviewQuestion.create({
    data: {
      ...rest,
      userId,
      applicationId: applicationId ?? null
    }
  });

  await awardGamification(userId, "interview_question_create");
  if (data.isPublic) {
    await awardGamification(userId, "community_share");
  }

  return NextResponse.json({ data }, { status: 201 });
}
