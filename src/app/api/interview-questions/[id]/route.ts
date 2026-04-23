import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session-user";
import { updateInterviewQuestionSchema } from "@/lib/validation";
import { awardGamification } from "@/lib/gamification";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const body = await request.json();
  const parsed = updateInterviewQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.interviewQuestion.findFirst({
    where: { id, userId }
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = await prisma.interviewQuestion.update({
    where: { id },
    data: parsed.data
  });
  if (!existing.isPublic && data.isPublic) {
    await awardGamification(userId, "community_share");
  }
  return NextResponse.json({ data });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const existing = await prisma.interviewQuestion.findFirst({
    where: { id, userId }
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.interviewQuestion.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
