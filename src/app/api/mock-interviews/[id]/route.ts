import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session-user";
import { updateMockInterviewSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const body = await request.json();
  const parsed = updateMockInterviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.mockInterviewNote.findFirst({
    where: { id },
    include: { application: true }
  });
  if (!existing || existing.application.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = await prisma.mockInterviewNote.update({
    where: { id },
    data: parsed.data
  });
  return NextResponse.json({ data });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const existing = await prisma.mockInterviewNote.findFirst({
    where: { id },
    include: { application: true }
  });
  if (!existing || existing.application.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.mockInterviewNote.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
