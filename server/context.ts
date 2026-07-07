import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { verifyUserToken } from "./lib/auth.js";

// Community uploads/comments still use guest names (stored client-side), and
// the admin panel still uses its own separate JWT login (handled entirely
// within admin-router.ts). Regular user accounts are a third, independent
// identity: an optional `Authorization: Bearer <token>` header, verified
// once here so any procedure can read ctx.userId. No token, expired token,
// or unconfigured secret all resolve to null rather than throwing — most
// Drill/Community endpoints are fully usable by guests, so a missing user
// is a normal case, not an error.
export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  userId: number | null;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  let userId: number | null = null;
  const authHeader = opts.req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const payload = verifyUserToken(authHeader.slice(7));
    if (payload) userId = payload.userId;
  }
  return { req: opts.req, resHeaders: opts.resHeaders, userId };
}
