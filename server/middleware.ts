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

export const createRouter = t.router;
export const publicQuery = t.procedure.use(withTimeout);
