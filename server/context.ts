import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

// No OAuth/user auth — the platform uses guest names (stored client-side)
// for Community uploads/comments, and a separate JWT-based admin login for
// the admin panel (handled entirely within admin-router.ts). This context
// intentionally carries no user identity.
export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  return { req: opts.req, resHeaders: opts.resHeaders };
}
