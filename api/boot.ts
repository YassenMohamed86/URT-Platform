import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { createReadStream } from "fs";
import { stat } from "fs/promises";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

// File upload endpoint
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

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return c.json({ error: "File size exceeds 10MB limit" }, 400);
    }

    const uploadDir = env.uploadDir;
    const dateDir = new Date().toISOString().split("T")[0];
    const targetDir = join(uploadDir, dateDir);
    await mkdir(targetDir, { recursive: true });

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.pdf`;
    const filePath = join(targetDir, fileName);

    const buffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(buffer));

    const fileUrl = `/uploads/${dateDir}/${fileName}`;
    return c.json({ fileUrl, fileType: "pdf" });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ error: "Upload failed" }, 500);
  }
});

// Serve uploaded files
app.get("/uploads/*", async (c) => {
  const path = c.req.path;
  const filePath = join(env.uploadDir, path.replace("/uploads/", ""));

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return c.json({ error: "Not found" }, 404);
    }

    const stream = createReadStream(filePath);
    c.header("Content-Type", "application/pdf");
    c.header("Content-Length", fileStat.size.toString());
    return new Response(stream as unknown as ReadableStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": fileStat.size.toString(),
      },
    });
  } catch {
    return c.json({ error: "Not found" }, 404);
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

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
