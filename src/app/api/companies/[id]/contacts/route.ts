import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session-user";
import { createCompanyContactSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const company = await prisma.company.findFirst({
    where: { id, userId }
  });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const data = await prisma.companyContact.findMany({
    where: { companyId: id },
    orderBy: [{ name: "asc" }]
  });
  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: Ctx) {
  const { id } = await params;
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const company = await prisma.company.findFirst({
    where: { id, userId }
  });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createCompanyContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = await prisma.companyContact.create({
    data: {
      ...parsed.data,
      companyId: id
    }
  });

  return NextResponse.json({ data }, { status: 201 });
}
