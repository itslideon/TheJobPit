import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminEmails } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session-user";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  role: z.enum(["USER", "ADMIN"])
});

async function adminCount() {
  return prisma.user.count({ where: { role: "ADMIN" } });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const { userId, response } = await requireAdmin();
  if (!userId) return response!;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (target.id === userId && parsed.data.role === "USER") {
    const admins = await adminCount();
    const envAdmins = getAdminEmails();
    if (admins <= 1 && envAdmins.length === 0) {
      return NextResponse.json(
        { error: "Cannot demote yourself while you are the only admin." },
        { status: 400 }
      );
    }
  }

  const data = await prisma.user.update({
    where: { id },
    data: { role: parsed.data.role },
    select: { id: true, email: true, name: true, role: true }
  });

  return NextResponse.json({ data });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const { userId, response } = await requireAdmin();
  if (!userId) return response!;

  if (id === userId) {
    return NextResponse.json({ error: "You cannot delete your own account here." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (target.role === "ADMIN") {
    const admins = await adminCount();
    if (admins <= 1) {
      return NextResponse.json({ error: "Cannot delete the only admin account." }, { status: 400 });
    }
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
