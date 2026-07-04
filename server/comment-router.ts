import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { comments } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const commentRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        uploadId: z.number(),
        commenterName: z.string().min(1),
        commentText: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(comments).values(input);
      return result;
    }),

  listByUpload: publicQuery
    .input(z.object({ uploadId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const allComments = await db.select().from(comments);
      return allComments
        .filter((c) => c.uploadId === input.uploadId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(comments).where(eq(comments.id, input.id));
      return { success: true };
    }),
});
