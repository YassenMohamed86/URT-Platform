import { uploadRouter } from "./upload-router.js";
import { commentRouter } from "./comment-router.js";
import { adminRouter } from "./admin-router.js";
import { examRouter } from "./exam-router.js";
import { practiceRouter } from "./practice-router.js";
import { createRouter, publicQuery } from "./middleware.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  // TEMPORARY diagnostic — bypasses Drizzle entirely, raw libsql queries
  debugRawQuery: publicQuery.query(async () => {
    const { getRawClient } = await import("./queries/connection.js");
    const client = getRawClient();

    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
    );

    let uploadsColumns: unknown = null;
    try {
      const uploadsInfo = await client.execute("PRAGMA table_info(uploads)");
      uploadsColumns = uploadsInfo.rows.map((r) => r.name);
    } catch (e) {
      uploadsColumns = `error: ${(e as Error).message}`;
    }

    let examsCount: unknown = null;
    try {
      const c = await client.execute("SELECT COUNT(*) as c FROM exams");
      examsCount = c.rows[0];
    } catch (e) {
      examsCount = `error: ${(e as Error).message}`;
    }

    return {
      allTables: tables.rows.map((r) => r.name),
      uploadsColumns,
      examsCount,
    };
  }),

  upload: uploadRouter,
  comment: commentRouter,
  admin: adminRouter,
  exam: examRouter,
  practice: practiceRouter,
});

export type AppRouter = typeof appRouter;

