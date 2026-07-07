import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "./env.js";

// scrypt is a Node built-in (no native npm addon), so it can't hit the class
// of "works locally, breaks on Vercel" bugs a compiled bcrypt/argon2 binding
// can. Cost params below are Node's own recommended minimums.
const KEY_LEN = 64;
const SCRYPT_OPTS = { N: 16384, r: 8, p: 1 } as const;

function scrypt(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LEN, SCRYPT_OPTS, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt);
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const storedBuf = Buffer.from(hashHex, "hex");
  const derived = await scrypt(password, salt);
  if (derived.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(derived, storedBuf);
}

export type AuthTokenPayload = { userId: number; email: string };

export function signUserToken(payload: AuthTokenPayload): string {
  // Long-lived on purpose — the whole point is not re-prompting for a
  // password on a device someone already signed in on.
  return jwt.sign(payload, env.authJwtSecret, { expiresIn: "180d" });
}

export function verifyUserToken(token: string): AuthTokenPayload | null {
  if (!env.authJwtSecret) return null;
  try {
    const decoded = jwt.verify(token, env.authJwtSecret);
    if (typeof decoded === "object" && decoded && "userId" in decoded) {
      return decoded as AuthTokenPayload;
    }
    return null;
  } catch {
    return null;
  }
}
