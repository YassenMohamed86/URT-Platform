import { uploadRouter } from "./upload-router.js";
import { commentRouter } from "./comment-router.js";
import { adminRouter } from "./admin-router.js";
import { examRouter } from "./exam-router.js";
import { practiceRouter } from "./practice-router.js";
import { createRouter, publicQuery } from "./middleware.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  // TEMPORARY diagnostic — bypasses Drizzle entirely, raw libsql query
  debugRawQuery: publicQuery.query(async () => {
    const { getRawClient } = await import("./queries/connection.js");
    const client = getRawClient();
    const result = await client.execute("SELECT * FROM practice_passages LIMIT 3");
    return {
      columns: result.columns,
      rowCount: result.rows.length,
      firstRow: result.rows[0] ?? null,
    };
  }),

  upload: uploadRouter,
  comment: commentRouter,
  admin: adminRouter,
  exam: examRouter,
  practice: practiceRouter,
});

export type AppRouter = typeof appRouter;

