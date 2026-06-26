import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router.js";
import { createContext } from "./context.js";
import { env } from "./lib/env.js";
import { createOAuthCallbackHandler } from "./oauth/auth.js";
import { Paths } from "../contracts/constants.js";
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

    const isVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";
    const uploadDir = isVercel ? "/tmp" : env.uploadDir;
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
  const isVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";
  const uploadDir = isVercel ? "/tmp" : env.uploadDir;
  const filePath = join(uploadDir, path.replace("/uploads/", ""));

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

app.get("/api/seed-dummy-data", async (c) => {
  try {
    const { getDb } = await import("./queries/connection.js");
    const schema = await import("../db/schema.js");
    const db = getDb();
    
    // Insert dummy exam
    await db.insert(schema.exams).values({
      id: "dummy-exam-1",
      title: "Platform Test Exam 2024",
      year: 2024,
      session: "General",
      note: "This is an automatic test exam to verify the platform is fully functional."
    }).onConflictDoNothing();

    await db.insert(schema.sections).values({
      id: "dummy-section-1",
      examId: "dummy-exam-1",
      subject: "Test Subject"
    }).onConflictDoNothing();

    await db.insert(schema.passages).values({
      id: "dummy-passage-1",
      sectionId: "dummy-section-1",
      title: "Welcome to the URT Platform",
      bodyText: "If you can read this, your Turso database is successfully connected and working perfectly!",
      orderIndex: 0
    }).onConflictDoNothing();

    await db.insert(schema.questions).values({
      id: "dummy-q-1",
      passageId: "dummy-passage-1",
      number: 1,
      text: "Is the platform database fully functional?",
      correctAnswer: "Yes",
      answerStatus: "verified"
    }).onConflictDoNothing();

    await db.insert(schema.choices).values([
      { questionId: "dummy-q-1", label: "A", text: "Yes" },
      { questionId: "dummy-q-1", label: "B", text: "No" },
      { questionId: "dummy-q-1", label: "C", text: "Maybe" },
      { questionId: "dummy-q-1", label: "D", text: "I don't know" }
    ]).onConflictDoNothing();

    return c.json({ success: true, message: "Database successfully seeded with test exam!" });
  } catch (error: any) {
    console.error(error);
    return c.json({ error: error.message }, 500);
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
