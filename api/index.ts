// Vercel serverless function entry point.
//
// This MUST live under api/ — that's the directory Vercel's build system
// actually scans to produce addressable serverless functions that a
// vercel.json rewrite `destination` can target. (Vercel also documents a
// root-level "zero-config" convention for standalone Hono projects, but
// that path did not resolve correctly for this hybrid Vite+API setup —
// requests silently fell through to the SPA catch-all instead of reaching
// the function. Confirmed by direct testing.)
//
// The actual bug this project hit was NOT the api/ location — it was a
// leftover Next.js Pages Router artifact (`export const config = { api:
// { bodyParser: false } }`) that made Vercel invoke this function using
// the legacy Node (req, res) => void calling convention instead of the
// Web-standard fetch(request) => Response convention a Hono app
// implements. That config export is gone for good; this is a plain
// re-export of the raw Hono app, nothing else.
export { default } from "../server/boot.js";
