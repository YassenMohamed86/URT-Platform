import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { uploads, comments, votes } from "../db/schema.js";
import { eq } from "drizzle-orm";

// All reads use full-table select() + JS filtering/sorting, not WHERE/JOIN/
// GROUP BY — see practice-router.ts and exam-router.ts for why. Writes
// (insert/update/delete keyed on a primary key id) are left as direct
// Drizzle calls since those have a proven track record of working.

export const uploadRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        subject: z.string().optional(),
        sortBy: z.enum(["upvotes", "newest", "discussed"]).default("upvotes"),
      }),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { subject, sortBy } = input;

      const allUploads = await db.select().from(uploads);
      let result = allUploads.filter((u) => u.status === "approved");
      if (subject && subject !== "all") {
        result = result.filter((u) => u.subject === subject);
      }

      if (sortBy === "newest") {
        result = result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      } else {
        // "upvotes" and "discussed" both sort by upvotes for now
        result = result.sort((a, b) => b.upvotes - a.upvotes);
      }

      if (result.length === 0) return [];

      const allComments = await db.select().from(comments);
      const countMap = new Map<number, number>();
      for (const c of allComments) {
        countMap.set(c.uploadId, (countMap.get(c.uploadId) ?? 0) + 1);
      }

      return result.map((upload) => ({
        ...upload,
        commentCount: countMap.get(upload.id) ?? 0,
      }));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const allUploads = await db.select().from(uploads);
      const upload = allUploads.find(
        (u) => u.id === input.id && u.status === "approved",
      );
      if (!upload) return null;

      const allComments = await db.select().from(comments);
      const uploadComments = allComments
        .filter((c) => c.uploadId === input.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return { ...upload, comments: uploadComments };
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
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // The upload endpoint already inserted a draft row and set fileUrl.
      // Find it by fileUrl and update it with the real metadata.
      const allUploads = await db.select().from(uploads);
      const existing = allUploads.find((u) => u.fileUrl === input.fileUrl);

      if (existing) {
        // Update the draft row in-place — fileData and fileUrl stay intact.
        await db
          .update(uploads)
          .set({
            uploaderName: input.uploaderName,
            title: input.title,
            description: input.description,
            subject: input.subject,
            fileType: input.fileType,
            status: "pending",
          })
          .where(eq(uploads.id, existing.id));
        return { id: existing.id };
      }

      // Fallback: insert a fresh row (no fileData — used when fileUrl is external).
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
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { uploadId, sessionId, voteType } = input;

      const allVotesForUpload = await db.select().from(votes);
      const existing = allVotesForUpload.find(
        (v) => v.uploadId === uploadId && v.sessionId === sessionId,
      );

      if (existing) {
        if (existing.voteType === voteType) {
          // Remove vote (toggle off)
          await db.delete(votes).where(eq(votes.id, existing.id));
        } else {
          // Update vote
          await db.update(votes).set({ voteType }).where(eq(votes.id, existing.id));
        }
      } else {
        // Create new vote
        await db.insert(votes).values({ uploadId, sessionId, voteType });
      }

      // Recalculate counts
      const allVotes = await db.select().from(votes);
      const relevantVotes = allVotes.filter((v) => v.uploadId === uploadId);

      const upvotes = relevantVotes.filter((v) => v.voteType === "up").length;
      const downvotes = relevantVotes.filter((v) => v.voteType === "down").length;

      await db.update(uploads).set({ upvotes, downvotes }).where(eq(uploads.id, uploadId));

      const userVote = relevantVotes.find((v) => v.sessionId === sessionId)?.voteType ?? null;

      return { upvotes, downvotes, userVote };
    }),

  getVotes: publicQuery
    .input(
      z.object({
        uploadId: z.number(),
        sessionId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { uploadId, sessionId } = input;

      const allVotes = await db.select().from(votes);
      const relevantVotes = allVotes.filter((v) => v.uploadId === uploadId);

      const upvotes = relevantVotes.filter((v) => v.voteType === "up").length;
      const downvotes = relevantVotes.filter((v) => v.voteType === "down").length;
      const userVote = relevantVotes.find((v) => v.sessionId === sessionId)?.voteType ?? null;

      return { upvotes, downvotes, userVote };
    }),
});
