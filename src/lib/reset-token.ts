import { createHash, randomBytes } from "crypto";

export function hashResetToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

/** Opaque token for the URL; only its hash is stored in the database. */
export function generatePasswordResetSecret(): { raw: string; tokenHash: string } {
  const raw = randomBytes(32).toString("base64url");
  return { raw, tokenHash: hashResetToken(raw) };
}
