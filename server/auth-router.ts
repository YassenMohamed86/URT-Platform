import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { users, type User } from "../db/schema.js";
import { hashPassword, verifyPassword, signUserToken } from "./lib/auth.js";
import { env } from "./lib/env.js";

const emailSchema = z.string().trim().toLowerCase().min(3).max(254).email();
const passwordSchema = z.string().min(8, "Password needs at least 8 characters").max(200);
const nameSchema = z.string().trim().min(1).max(80).optional();

function sanitizeUser(u: User) {
  return { id: u.id, name: u.name, email: u.email, avatar: u.avatar, role: u.role };
}

function requireAuthConfigured() {
  if (!env.authJwtSecret) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Accounts aren't configured on this deployment yet (missing AUTH_JWT_SECRET).",
    });
  }
}

export const authRouter = createRouter({
  signup: publicQuery
    .input(
      z.object({
        email: emailSchema,
        password: passwordSchema,
        name: nameSchema,
      }),
    )
    .mutation(async ({ input }) => {
      requireAuthConfigured();
      const db = getDb();

      // Full-table read + JS filter, matching the rest of this codebase's
      // defensive query pattern (see PROJECT_HANDOFF.md).
      const all = await db.select().from(users);
      if (all.some((u) => u.email === input.email)) {
        throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists." });
      }

      const passwordHash = await hashPassword(input.password);
      const [inserted] = await db
        .insert(users)
        .values({
          unionId: input.email,
          email: input.email,
          name: input.name ?? null,
          passwordHash,
        })
        .returning();

      const token = signUserToken({ userId: inserted.id, email: input.email });
      return { token, user: sanitizeUser(inserted) };
    }),

  login: publicQuery
    .input(z.object({ email: emailSchema, password: passwordSchema }))
    .mutation(async ({ input }) => {
      requireAuthConfigured();
      const db = getDb();

      const all = await db.select().from(users);
      const user = all.find((u) => u.email === input.email);
      const ok = user?.passwordHash ? await verifyPassword(input.password, user.passwordHash) : false;
      if (!user || !ok) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect email or password." });
      }

      await db.update(users).set({ lastSignInAt: new Date() }).where(eq(users.id, user.id));

      const token = signUserToken({ userId: user.id, email: input.email });
      return { token, user: sanitizeUser(user) };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    if (!ctx.userId) return null;
    const db = getDb();
    const all = await db.select().from(users);
    const user = all.find((u) => u.id === ctx.userId);
    return user ? sanitizeUser(user) : null;
  }),
});
