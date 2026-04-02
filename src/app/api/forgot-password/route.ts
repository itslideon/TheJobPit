import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generatePasswordResetSecret } from "@/lib/reset-token";
import { sendPasswordResetEmail } from "@/lib/send-password-reset-email";

const bodySchema = z.object({
  email: z.string().email().max(255)
});

function genericSuccess() {
  return NextResponse.json({
    ok: true,
    message: "If an account exists for that email, we sent a reset link."
  });
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } }
  });

  if (!user) {
    return genericSuccess();
  }

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const { raw, tokenHash } = generatePasswordResetSecret();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt
    }
  });

  try {
    await sendPasswordResetEmail({ to: user.email, rawToken: raw });
  } catch (e) {
    console.error("[forgot-password] email error", e);
    await prisma.passwordResetToken.deleteMany({ where: { tokenHash } });
    return NextResponse.json(
      { error: "Could not send email. Try again later or contact support." },
      { status: 503 }
    );
  }

  return genericSuccess();
}
