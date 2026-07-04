import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { uploads, comments, votes, questions, sections, passages } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { env } from "./lib/env.js";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";

// Simple JWT verification middleware
const adminProcedure = publicQuery.use(async (opts) => {
  if (!env.adminJwtSecret) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin panel is not configured on this deployment" });
  }
  const token = opts.ctx.req.headers.get("x-admin-token");
  if (!token) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin token required" });
  }
  try {
    jwt.verify(token, env.adminJwtSecret);
    return opts.next();
  } catch {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin token" });
  }
});

// All reads below use full-table select() + JS filtering/sorting, not
// WHERE/JOIN/GROUP BY/count(*) — see practice-router.ts and exam-router.ts
// for why. Writes (insert/update/delete keyed on a primary key id) are
// left as direct Drizzle calls since those have a proven track record of
// working correctly against this database.

export const adminRouter = createRouter({
  login: publicQuery
    .input(z.object({ password: z.string() }))
    .mutation(async ({ input }) => {
      // Fail closed: if the deployment hasn't set real secrets, refuse every
      // login instead of falling back to a value anyone could read in the repo.
      if (!env.adminPassword || !env.adminJwtSecret) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin panel is not configured on this deployment" });
      }
      if (input.password !== env.adminPassword) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid password" });
      }
      const token = jwt.sign({ admin: true }, env.adminJwtSecret, {
        expiresIn: "24h",
      });
      return { token };
    }),

  getPendingUploads: adminProcedure.query(async () => {
    const db = getDb();
    const allUploads = await db.select().from(uploads);
    return allUploads
      .filter((u) => u.status === "pending")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }),

  getAllUploads: adminProcedure.query(async () => {
    const db = getDb();
    const allUploads = await db.select().from(uploads);
    return allUploads.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }),

  approveUpload: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(uploads).set({ status: "approved" }).where(eq(uploads.id, input.id));
      return { success: true };
    }),

  rejectUpload: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(uploads).set({ status: "rejected" }).where(eq(uploads.id, input.id));
      return { success: true };
    }),

  deleteUpload: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(comments).where(eq(comments.uploadId, input.id));
      await db.delete(votes).where(eq(votes.uploadId, input.id));
      await db.delete(uploads).where(eq(uploads.id, input.id));
      return { success: true };
    }),

  updateUpload: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        subject: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.title) updateData.title = data.title;
      if (data.description) updateData.description = data.description;
      if (data.subject) updateData.subject = data.subject;

      await db.update(uploads).set(updateData).where(eq(uploads.id, id));
      return { success: true };
    }),

  getAllComments: adminProcedure.query(async () => {
    const db = getDb();
    const allComments = await db.select().from(comments);
    const allUploads = await db.select().from(uploads);
    const titleById = new Map(allUploads.map((u) => [u.id, u.title]));

    return allComments
      .map((c) => ({
        id: c.id,
        uploadId: c.uploadId,
        commenterName: c.commenterName,
        commentText: c.commentText,
        createdAt: c.createdAt,
        uploadTitle: titleById.get(c.uploadId) ?? "Unknown",
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }),

  deleteComment: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(comments).where(eq(comments.id, input.id));
      return { success: true };
    }),

  getFlaggedQuestions: adminProcedure.query(async () => {
    const db = getDb();
    const allQuestions = await db.select().from(questions);
    const flagged = allQuestions.filter((q) => q.answerStatus === "flagged");
    if (flagged.length === 0) return [];

    const allPassages = await db.select().from(passages);
    const allSections = await db.select().from(sections);
    const passageById = new Map(allPassages.map((p) => [p.id, p]));
    const sectionById = new Map(allSections.map((s) => [s.id, s]));

    return flagged
      .map((q) => {
        const passage = passageById.get(q.passageId);
        const section = passage ? sectionById.get(passage.sectionId) : undefined;
        if (!passage || !section) return null; // orphaned row — innerJoin would have excluded it too
        return {
          id: q.id,
          passageTitle: passage.title,
          passageNumber: passage.orderIndex,
          questionText: q.text,
          reviewNote: q.reviewNote,
          subject: section.subject,
        };
      })
      .filter((q): q is NonNullable<typeof q> => q !== null)
      .sort((a, b) => b.id - a.id);
  }),

  verifyQuestion: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(questions).set({ answerStatus: "verified" }).where(eq(questions.id, input.id));
      return { success: true };
    }),

  getStats: adminProcedure.query(async () => {
    const db = getDb();

    const allQuestions = await db.select().from(questions);
    const allUploads = await db.select().from(uploads);
    const allComments = await db.select().from(comments);

    return {
      totalQuestions: allQuestions.length,
      totalUploads: allUploads.length,
      pendingUploads: allUploads.filter((u) => u.status === "pending").length,
      totalComments: allComments.length,
    };
  }),
});
