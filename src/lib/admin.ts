import { prisma } from "@/lib/prisma";

/** Comma-separated admin emails from env (case-insensitive). */
export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  const admins = getAdminEmails();
  if (admins.length === 0) return false;
  return admins.includes(email.toLowerCase().trim());
}

export async function syncAdminRoleForEmail(userId: string, email: string) {
  if (!isAdminEmail(email)) return;
  await prisma.user.update({
    where: { id: userId },
    data: { role: "ADMIN" }
  });
}

export async function userIsAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, email: true }
  });
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  if (isAdminEmail(user.email)) {
    await prisma.user.update({
      where: { id: userId },
      data: { role: "ADMIN" }
    });
    return true;
  }
  return false;
}

export async function getAdminStats() {
  const [
    userCount,
    applicationCount,
    publicStarCount,
    publicQuestionCount,
    recentUsers
  ] = await Promise.all([
    prisma.user.count(),
    prisma.application.count(),
    prisma.starStory.count({ where: { isPublic: true } }),
    prisma.interviewQuestion.count({ where: { isPublic: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, email: true, name: true, createdAt: true, role: true }
    })
  ]);

  return {
    userCount,
    applicationCount,
    publicStarCount,
    publicQuestionCount,
    publicPostCount: publicStarCount + publicQuestionCount,
    recentUsers
  };
}
