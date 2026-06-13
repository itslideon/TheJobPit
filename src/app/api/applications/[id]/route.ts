import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session-user";
import { updateApplicationSchema } from "@/lib/validation";
import { awardAndBuildReward, jsonWithGamification } from "@/lib/gamification-response";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const application = await prisma.application.findFirst({
    where: { id, userId }
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  return NextResponse.json({ data: application });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const body = await request.json();
  const parseResult = updateApplicationSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid update payload", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.application.findFirst({
    where: { id, userId }
  });
  if (!existing) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const application = await prisma.application.update({
    where: { id },
    data: parseResult.data
  });

  let reward = null;
  if (parseResult.data.status && parseResult.data.status !== existing.status) {
    reward = await awardAndBuildReward(userId, "application_status_update");
  }

  return NextResponse.json(jsonWithGamification({ data: application }, reward));
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const existing = await prisma.application.findFirst({
    where: { id, userId }
  });
  if (!existing) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  await prisma.application.delete({
    where: { id }
  });

  return NextResponse.json({ ok: true });
}
