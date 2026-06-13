import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session-user";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const [stars, questions] = await Promise.all([
    prisma.starStory.findMany({
      where: { isPublic: true },
      orderBy: { updatedAt: "desc" },
      take: 80,
      select: {
        id: true,
        title: true,
        updatedAt: true,
        shareCompanyContext: true,
        user: { select: { id: true, email: true, name: true } },
        application: { select: { company: true, role: true } }
      }
    }),
    prisma.interviewQuestion.findMany({
      where: { isPublic: true },
      orderBy: { updatedAt: "desc" },
      take: 80,
      select: {
        id: true,
        question: true,
        category: true,
        updatedAt: true,
        user: { select: { id: true, email: true, name: true } }
      }
    })
  ]);

  return NextResponse.json({ data: { stars, questions } });
}
