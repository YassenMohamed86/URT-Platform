import { uploadRouter } from "./upload-router.js";
import { commentRouter } from "./comment-router.js";
import { adminRouter } from "./admin-router.js";
import { examRouter } from "./exam-router.js";
import { practiceRouter } from "./practice-router.js";
import { authRouter } from "./auth-router.js";
import { createRouter, publicQuery } from "./middleware.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  upload: uploadRouter,
  comment: commentRouter,
  admin: adminRouter,
  exam: examRouter,
  practice: practiceRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;

