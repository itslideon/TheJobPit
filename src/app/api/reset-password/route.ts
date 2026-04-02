import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { hashResetToken } from "@/lib/reset-token";

const bodySchema = z.object({
  token: z.string().min(20).max(512),
  password: z.string().min(8).max(128)
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const tokenHash = hashResetToken(parsed.data.token);
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash }
  });

  if (!row || row.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash }
    }),
    prisma.passwordResetToken.deleteMany({ where: { userId: row.userId } })
  ]);

  return NextResponse.json({ ok: true });
}
