/**
 * Delete all users and cascaded account data (applications, profiles, gamification, etc.).
 * Also removes uploaded document files from public/uploads/documents/.
 *
 * Usage: CONFIRM_WIPE=yes npm run db:wipe
 */
import { PrismaClient } from "@prisma/client";
import { readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

function wipeUploads() {
  const dir = join(process.cwd(), "public", "uploads", "documents");
  let removed = 0;
  try {
    for (const name of readdirSync(dir)) {
      if (name === ".gitkeep") continue;
      try {
        unlinkSync(join(dir, name));
        removed += 1;
      } catch {
        // ignore single file errors
      }
    }
  } catch {
    // directory may not exist yet
  }
  return removed;
}

async function main() {
  if (process.env.CONFIRM_WIPE !== "yes") {
    console.error(
      "This permanently deletes ALL users and their data.\n" +
        "Run again with: CONFIRM_WIPE=yes npm run db:wipe"
    );
    process.exit(1);
  }

  const before = await prisma.user.count();
  if (before === 0) {
    const files = wipeUploads();
    console.log("No users in database.");
    if (files > 0) console.log(`Removed ${files} uploaded file(s).`);
    return;
  }

  const result = await prisma.user.deleteMany({});
  const files = wipeUploads();

  console.log(`\nWiped ${result.count} user account(s) and all related data.`);
  if (files > 0) console.log(`Removed ${files} uploaded file(s).`);
  console.log("Database is empty — sign up again at /signup when ready.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
