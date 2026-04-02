import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session-user";
import { updateStarStorySchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const body = await request.json();
  const parsed = updateStarStorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.starStory.findFirst({
    where: { id, userId }
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const p = parsed.data;
  const nextIsPublic = p.isPublic !== undefined ? p.isPublic : existing.isPublic;
  const nextApplicationId =
    p.applicationId !== undefined ? p.applicationId : existing.applicationId;
  const nextShareFlag =
    p.shareCompanyContext !== undefined ? p.shareCompanyContext : existing.shareCompanyContext;

  if (nextShareFlag && !nextApplicationId) {
    return NextResponse.json(
      { error: "Link an application to share company and role, or turn off company context." },
      { status: 400 }
    );
  }
  if (!nextIsPublic && p.shareCompanyContext === true) {
    return NextResponse.json(
      { error: "Turn on community sharing before sharing company context." },
      { status: 400 }
    );
  }

  const shareCompanyContext =
    Boolean(nextIsPublic) && Boolean(nextShareFlag) && Boolean(nextApplicationId);

  const data = await prisma.starStory.update({
    where: { id },
    data: {
      ...p,
      shareCompanyContext
    }
  });
  return NextResponse.json({ data });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const existing = await prisma.starStory.findFirst({
    where: { id, userId }
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.starStory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
