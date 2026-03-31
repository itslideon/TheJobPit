import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session-user";
import { createApplicationDocumentSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const applicationId = new URL(request.url).searchParams.get("applicationId");
  if (!applicationId) {
    return NextResponse.json({ error: "applicationId query required" }, { status: 400 });
  }

  const data = await prisma.applicationDocument.findMany({
    where: {
      applicationId,
      application: { userId }
    },
    orderBy: [{ updatedAt: "desc" }]
  });

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const body = await request.json();
  const parsed = createApplicationDocumentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const application = await prisma.application.findFirst({
    where: { id: parsed.data.applicationId, userId }
  });
  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const data = await prisma.applicationDocument.create({
    data: {
      applicationId: parsed.data.applicationId,
      type: parsed.data.type,
      title: parsed.data.title,
      content: parsed.data.content
    }
  });

  return NextResponse.json({ data }, { status: 201 });
}
