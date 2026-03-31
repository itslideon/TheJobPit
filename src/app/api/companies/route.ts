import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session-user";
import { createCompanySchema } from "@/lib/validation";

export async function GET() {
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const data = await prisma.company.findMany({
    where: { userId },
    orderBy: [{ name: "asc" }],
    include: { contacts: true }
  });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const body = await request.json();
  const parsed = createCompanySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = await prisma.company.create({ data: { ...parsed.data, userId } });
  return NextResponse.json({ data }, { status: 201 });
}
