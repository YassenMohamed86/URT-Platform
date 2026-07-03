import { ErrorMessages } from "../contracts/constants.js";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context.js";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

// Universal safety net: if any procedure hangs for any reason (unreachable
// DB host, DNS resolution stall, network blip), fail fast with a clear
// TIMEOUT error instead of leaving the frontend spinning indefinitely.
const withTimeout = t.middleware(async ({ next }) => {
  const TIMEOUT_MS = 8000;
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(
        new TRPCError({
          code: "TIMEOUT",
          message: "Request timed out after 8s. The database may be unreachable — check DATABASE_URL/DATABASE_AUTH_TOKEN are set correctly.",
        }),
      );
    }, TIMEOUT_MS);
  });

  try {
    return await Promise.race([next(), timeout]);
  } finally {
    clearTimeout(timer!);
  }
});

const timedProcedure = t.procedure.use(withTimeout);

export const createRouter = t.router;
export const publicQuery = timedProcedure;

const requireAuth = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

function requireRole(role: string) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== role) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole,
      });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  });
}

export const authedQuery = timedProcedure.use(requireAuth);
export const adminQuery = authedQuery.use(requireRole("admin"));
