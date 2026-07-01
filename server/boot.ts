import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router.js";
import { createContext } from "./context.js";
import { env } from "./lib/env.js";
import { createOAuthCallbackHandler } from "./oauth/auth.js";
import { Paths } from "../contracts/constants.js";
import { getDb } from "./queries/connection.js";
import { uploads } from "../db/schema.js";
import { eq } from "drizzle-orm";

const app = new Hono<{ Bindings: HttpBindings }>();

// 3 MB hard cap — base64 overhead brings this to ~4 MB in the DB,
// well under Vercel Hobby's 4.5 MB function payload limit.
app.use(bodyLimit({ maxSize: 3 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

// File upload endpoint — stores file as base64 in Turso instead of /tmp.
// Vercel's /tmp is NOT shared between function invocations, so files
// written there silently 404 after a cold start. DB storage persists.
app.post("/api/upload-file", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body.file as File;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }
    if (file.type !== "application/pdf") {
      return c.json({ error: "Only PDF files are allowed" }, 400);
    }

    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      return c.json({ error: "File size exceeds 3 MB limit" }, 400);
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    // Insert a draft row with the file data. The tRPC create mutation
    // will update uploaderName / title / description / subject / status.
    const db = getDb();
    const [result] = await db
      .insert(uploads)
      .values({
        uploaderName: "",
        title: "_draft_",
        description: "",
        subject: "",
        fileUrl: "",
        fileType: "pdf",
        fileData: base64,
        status: "draft",
      })
      .returning({ id: uploads.id });

    const fileUrl = `/uploads/file/${result.id}`;
    await db
      .update(uploads)
      .set({ fileUrl })
      .where(eq(uploads.id, result.id));

    return c.json({ fileUrl, fileType: "pdf" });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ error: "Upload failed" }, 500);
  }
});

// Serve uploaded files from Turso — never touches the filesystem.
app.get("/uploads/file/:id", async (c) => {
  const id = parseInt(c.req.param("id") ?? "", 10);
  if (isNaN(id)) return c.json({ error: "Invalid file ID" }, 400);

  try {
    const db = getDb();
    const [row] = await db
      .select({ fileData: uploads.fileData })
      .from(uploads)
      .where(eq(uploads.id, id))
      .limit(1);

    if (!row || !row.fileData) {
      return c.json({ error: "File not found" }, 404);
    }

    const buf = Buffer.from(row.fileData, "base64");
    return new Response(buf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": buf.length.toString(),
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch {
    return c.json({ error: "File not found" }, 404);
  }
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction && process.env.VERCEL !== "1" && process.env.VERCEL !== "true") {
  (async () => {
    const { serve } = await import("@hono/node-server");
    const { serveStaticFiles } = await import("./lib/vite.js");
    serveStaticFiles(app);

    const port = parseInt(process.env.PORT || "3000");
    serve({ fetch: app.fetch, port }, () => {
      console.log(`Server running on http://localhost:${port}/`);
    });
  })();
}
