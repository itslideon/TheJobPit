import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session-user";
import { createMockInterviewSchema } from "@/lib/validation";
import { awardAndBuildReward, jsonWithGamification } from "@/lib/gamification-response";

export async function GET(request: Request) {
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const applicationId = new URL(request.url).searchParams.get("applicationId");
  const data = await prisma.mockInterviewNote.findMany({
    where: {
      application: { userId },
      ...(applicationId ? { applicationId } : {})
    },
    orderBy: [{ occurredAt: "desc" }, { updatedAt: "desc" }]
  });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const body = await request.json();
  const parsed = createMockInterviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const app = await prisma.application.findFirst({
    where: { id: parsed.data.applicationId, userId }
  });
  if (!app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const data = await prisma.mockInterviewNote.create({
    data: {
      applicationId: parsed.data.applicationId,
      occurredAt: parsed.data.occurredAt,
      notes: parsed.data.notes,
      rating: parsed.data.rating ?? null
    }
  });

  const reward = await awardAndBuildReward(userId, "mock_interview_log");

  return NextResponse.json(jsonWithGamification({ data }, reward), { status: 201 });
}
