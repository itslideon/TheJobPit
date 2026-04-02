const SALT_ROUNDS = 12;

type BcryptMod = {
  compare: (plain: string, hash: string) => Promise<boolean>;
  hash: (plain: string, salt: number | string) => Promise<string>;
};

async function loadBcrypt(): Promise<BcryptMod> {
  const mod = await import("bcryptjs");
  if (typeof mod.compare === "function" && typeof mod.hash === "function") {
    return mod;
  }
  const d = mod.default as BcryptMod | undefined;
  if (d && typeof d.compare === "function" && typeof d.hash === "function") {
    return d;
  }
  throw new Error("bcryptjs: compare/hash not available");
}

export async function hashPassword(plain: string): Promise<string> {
  const bcrypt = await loadBcrypt();
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, passwordHash: string): Promise<boolean> {
  const h = passwordHash?.trim();
  if (!h) {
    return false;
  }
  const bcrypt = await loadBcrypt();
  return bcrypt.compare(plain, h);
}
