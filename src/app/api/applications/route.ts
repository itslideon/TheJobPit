import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session-user";
import { createApplicationSchema } from "@/lib/validation";
import { awardAndBuildReward, jsonWithGamification } from "@/lib/gamification-response";

export async function GET() {
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const applications = await prisma.application.findMany({
    where: { userId },
    orderBy: [{ updatedAt: "desc" }]
  });

  return NextResponse.json({ data: applications });
}

export async function POST(request: Request) {
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const body = await request.json();
  const parseResult = createApplicationSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid application payload", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const application = await prisma.application.create({
    data: {
      userId,
      company: parseResult.data.company,
      role: parseResult.data.role,
      location: parseResult.data.location,
      sourceUrl: parseResult.data.sourceUrl,
      notes: parseResult.data.notes,
      status: parseResult.data.status ?? "WISHLIST",
      appliedAt: parseResult.data.appliedAt,
      deadlineAt: parseResult.data.deadlineAt,
      followUpAt: parseResult.data.followUpAt
    }
  });

  const reward = await awardAndBuildReward(userId, "application_create");

  return NextResponse.json(jsonWithGamification({ data: application }, reward), { status: 201 });
}
