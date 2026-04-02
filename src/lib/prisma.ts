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

/** Drop cached client if schema added models (e.g. PasswordResetToken) after `prisma generate`. */
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
