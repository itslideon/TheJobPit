/**
 * Print users from the database (email, role, created date, activity counts).
 * Usage: npm run db:users
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
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
      }
    }
  });

  if (users.length === 0) {
    console.log("No users in database.");
    return;
  }

  console.log(`\nThe Job Pit — ${users.length} user(s)\n`);
  console.log(
    "Email".padEnd(36) +
      "Role".padEnd(8) +
      "Apps".padEnd(6) +
      "STAR".padEnd(6) +
      "Q&A".padEnd(6) +
      "Joined"
  );
  console.log("-".repeat(86));

  for (const u of users) {
    console.log(
      u.email.padEnd(36) +
        u.role.padEnd(8) +
        String(u._count.applications).padEnd(6) +
        String(u._count.starStories).padEnd(6) +
        String(u._count.interviewQuestions).padEnd(6) +
        u.createdAt.toISOString().slice(0, 10)
    );
    if (u.name) console.log(`  name: ${u.name}`);
  }

  console.log("");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
