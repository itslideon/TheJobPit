import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session-user";
import { createStarStorySchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const applicationId = new URL(request.url).searchParams.get("applicationId");
  const data = await prisma.starStory.findMany({
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
  const parsed = createStarStorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { applicationId, shareCompanyContext, isPublic, ...rest } = parsed.data;
  if (applicationId) {
    const app = await prisma.application.findFirst({
      where: { id: applicationId, userId }
    });
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }
  }

  const wantPublic = Boolean(isPublic);
  const wantCompany =
    wantPublic && Boolean(shareCompanyContext) && Boolean(applicationId);

  const data = await prisma.starStory.create({
    data: {
      ...rest,
      userId,
      applicationId: applicationId ?? null,
      isPublic: wantPublic,
      shareCompanyContext: wantCompany
    }
  });

  return NextResponse.json({ data }, { status: 201 });
}
