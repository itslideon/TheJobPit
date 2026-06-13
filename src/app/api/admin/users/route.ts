import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session-user";

export async function GET(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const take = Math.min(100, Math.max(1, Number(url.searchParams.get("take") ?? 50)));

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } }
          ]
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          applications: true,
          starStories: true,
          interviewQuestions: true
        }
      },
      gameProfile: {
        select: { level: true, xp: true, streakDays: true }
      }
    }
  });

  return NextResponse.json({ data: users });
}
