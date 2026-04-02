import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session-user";
import { updateProfileSchema } from "@/lib/validation";

const profileSelect = {
  id: true,
  email: true,
  name: true,
  headline: true,
  bio: true,
  location: true,
  phone: true,
  linkedinUrl: true,
  githubUrl: true,
  twitterUrl: true,
  websiteUrl: true,
  updatedAt: true
} as const;

export async function GET() {
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  const data = await prisma.user.findUnique({
    where: { id: userId },
    select: profileSelect
  });
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data });
}

export async function PATCH(request: Request) {
  const { userId, response } = await requireUserId();
  if (!userId) return response!;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = updateProfileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
    select: profileSelect
  });

  return NextResponse.json({ data });
}
