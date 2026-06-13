import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session-user";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const { response } = await requireAdmin();
  if (response) return response;

  const existing = await prisma.starStory.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = await prisma.starStory.update({
    where: { id },
    data: { isPublic: false, shareCompanyContext: false }
  });

  return NextResponse.json({ data });
}
