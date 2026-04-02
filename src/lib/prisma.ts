import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({
    log: ["error", "warn"]
  });
}

/**
 * Drop cached dev client if `prisma generate` added models/delegates the old instance lacks.
 * After schema changes, also restart `npm run dev` so queries validate against new User fields, etc.
 */
function replaceStaleDevClient() {
  if (process.env.NODE_ENV === "production") return;
  const g = global.prisma;
  if (!g) return;
  const delegate = (g as { passwordResetToken?: unknown }).passwordResetToken;
  if (delegate !== undefined) return;
  void g.$disconnect().catch(() => {});
  global.prisma = undefined;
}

replaceStaleDevClient();

export const prisma = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
