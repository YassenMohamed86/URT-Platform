// Vercel zero-config Hono entry point.
// Per https://vercel.com/docs/frameworks/backend/hono (accurate as of
// 2025-10-15): Vercel looks for a raw Hono app exported as default from
// one of: app.ts, index.ts, server.ts (or the same under src/) — no
// wrapper, no handle() adapter, no Next.js-style `config` export needed.
//
// The previous location (api/index.ts, wrapped with hono/vercel's
// handle()) combined with a leftover Next.js Pages Router `config.api`
// export caused Vercel to invoke this function using the legacy Node
// (req, res) => void calling convention instead of the Web-standard
// fetch(request) => Response convention that a raw Hono app implements.
// Every request hung until Vercel's platform timeout, regardless of the
// route — confirmed via direct testing (even a trivial `ping` route and
// the framework's own 404 fallback hung identically).
export { default } from "./server/boot.js";
