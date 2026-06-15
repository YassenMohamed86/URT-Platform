import { authRouter } from "./auth-router";
import { questionRouter } from "./question-router";
import { uploadRouter } from "./upload-router";
import { commentRouter } from "./comment-router";
import { adminRouter } from "./admin-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  question: questionRouter,
  upload: uploadRouter,
  comment: commentRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
