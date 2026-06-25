import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { uploads, comments, votes } from "../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const uploadRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        subject: z.string().optional(),
        sortBy: z.enum(["upvotes", "newest", "discussed"]).default("upvotes"),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { subject, sortBy } = input;

      const conditions = [eq(uploads.status, "approved")];
      if (subject && subject !== "all") {
        conditions.push(eq(uploads.subject, subject));
      }

      const query = and(...conditions);

      let orderBy;
      switch (sortBy) {
        case "newest":
          orderBy = desc(uploads.createdAt);
          break;
        case "discussed":
          orderBy = desc(uploads.upvotes);
          break;
        default:
          orderBy = desc(uploads.upvotes);
      }

      const result = await db
        .select()
        .from(uploads)
        .where(query)
        .orderBy(orderBy);

      // Get comment counts
      const uploadsWithComments = await Promise.all(
        result.map(async (upload) => {
          const commentCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(comments)
            .where(eq(comments.uploadId, upload.id));

          return {
            ...upload,
            commentCount: commentCount[0]?.count ?? 0,
          };
        })
      );

      return uploadsWithComments;
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const upload = await db
        .select()
        .from(uploads)
        .where(and(eq(uploads.id, input.id), eq(uploads.status, "approved")))
        .limit(1);

      if (upload.length === 0) return null;

      const uploadComments = await db
        .select()
        .from(comments)
        .where(eq(comments.uploadId, input.id))
        .orderBy(desc(comments.createdAt));

      return {
        ...upload[0],
        comments: uploadComments,
      };
    }),

  create: publicQuery
    .input(
      z.object({
        uploaderName: z.string().min(1),
        title: z.string().min(1),
        description: z.string().min(1),
        subject: z.string(),
        fileUrl: z.string(),
        fileType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(uploads).values({
        uploaderName: input.uploaderName,
        title: input.title,
        description: input.description,
        subject: input.subject,
        fileUrl: input.fileUrl,
        fileType: input.fileType,
        status: "pending",
      });
      return result;
    }),

  vote: publicQuery
    .input(
      z.object({
        uploadId: z.number(),
        sessionId: z.string(),
        voteType: z.enum(["up", "down"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { uploadId, sessionId, voteType } = input;

      // Check existing vote
      const existing = await db
        .select()
        .from(votes)
        .where(and(eq(votes.uploadId, uploadId), eq(votes.sessionId, sessionId)))
        .limit(1);

      if (existing.length > 0) {
        if (existing[0].voteType === voteType) {
          // Remove vote (toggle off)
          await db.delete(votes).where(eq(votes.id, existing[0].id));
        } else {
          // Update vote
          await db
            .update(votes)
            .set({ voteType })
            .where(eq(votes.id, existing[0].id));
        }
      } else {
        // Create new vote
        await db.insert(votes).values({ uploadId, sessionId, voteType });
      }

      // Recalculate counts
      const allVotes = await db
        .select()
        .from(votes)
        .where(eq(votes.uploadId, uploadId));

      const upvotes = allVotes.filter((v) => v.voteType === "up").length;
      const downvotes = allVotes.filter((v) => v.voteType === "down").length;

      await db
        .update(uploads)
        .set({ upvotes, downvotes })
        .where(eq(uploads.id, uploadId));

      const userVote =
        allVotes.find((v) => v.sessionId === sessionId)?.voteType ?? null;

      return { upvotes, downvotes, userVote };
    }),

  getVotes: publicQuery
    .input(
      z.object({
        uploadId: z.number(),
        sessionId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { uploadId, sessionId } = input;

      const allVotes = await db
        .select()
        .from(votes)
        .where(eq(votes.uploadId, uploadId));

      const upvotes = allVotes.filter((v) => v.voteType === "up").length;
      const downvotes = allVotes.filter((v) => v.voteType === "down").length;
      const userVote =
        allVotes.find((v) => v.sessionId === sessionId)?.voteType ?? null;

      return { upvotes, downvotes, userVote };
    }),
});
