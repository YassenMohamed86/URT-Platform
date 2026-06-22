import { authRouter } from "./auth-router";

import { uploadRouter } from "./upload-router";
import { commentRouter } from "./comment-router";
import { adminRouter } from "./admin-router";
import { examRouter } from "./exam-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,

  upload: uploadRouter,
  comment: commentRouter,
  admin: adminRouter,
  exam: examRouter,
});

export type AppRouter = typeof appRouter;

