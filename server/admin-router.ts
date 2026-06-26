import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { uploads, comments, questions, sections, passages } from "../db/schema.js";
import { eq, desc, sql } from "drizzle-orm";
import { env } from "./lib/env.js";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";

// Simple JWT verification middleware
const adminProcedure = publicQuery.use(async (opts) => {
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

export const adminRouter = createRouter({
  login: publicQuery
    .input(z.object({ password: z.string() }))
    .mutation(async ({ input }) => {
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
    return db
      .select()
      .from(uploads)
      .where(eq(uploads.status, "pending"))
      .orderBy(desc(uploads.createdAt));
  }),

  getAllUploads: adminProcedure.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(uploads)
      .orderBy(desc(uploads.createdAt));
  }),

  approveUpload: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(uploads)
        .set({ status: "approved" })
        .where(eq(uploads.id, input.id));
      return { success: true };
    }),

  rejectUpload: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(uploads)
        .set({ status: "rejected" })
        .where(eq(uploads.id, input.id));
      return { success: true };
    }),

  deleteUpload: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      // Delete associated comments first
      await db.delete(comments).where(eq(comments.uploadId, input.id));
      // Delete votes
      const { votes } = await import("../db/schema");
      await db.delete(votes).where(eq(votes.uploadId, input.id));
      // Delete upload
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
      })
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
    const allComments = await db
      .select()
      .from(comments)
      .orderBy(desc(comments.createdAt));

    // Get upload titles for each comment
    const withTitles = await Promise.all(
      allComments.map(async (comment) => {
        const upload = await db
          .select({ title: uploads.title })
          .from(uploads)
          .where(eq(uploads.id, comment.uploadId))
          .limit(1);
        return {
          ...comment,
          uploadTitle: upload[0]?.title ?? "Unknown",
        };
      })
    );

    return withTitles;
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
    const flagged = await db
      .select({
        id: questions.id,
        passageTitle: passages.title,
        passageNumber: passages.orderIndex,
        questionText: questions.text,
        reviewNote: questions.reviewNote,
        subject: sections.subject,
      })
      .from(questions)
      .innerJoin(passages, eq(questions.passageId, passages.id))
      .innerJoin(sections, eq(passages.sectionId, sections.id))
      .where(eq(questions.answerStatus, "flagged"))
      .orderBy(desc(questions.id));
    return flagged;
  }),

  verifyQuestion: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(questions)
        .set({ answerStatus: "verified" })
        .where(eq(questions.id, input.id));
      return { success: true };
    }),

  getStats: adminProcedure.query(async () => {
    const db = getDb();

    const totalQuestions = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions);
    const totalUploads = await db
      .select({ count: sql<number>`count(*)` })
      .from(uploads);
    const pendingUploads = await db
      .select({ count: sql<number>`count(*)` })
      .from(uploads)
      .where(eq(uploads.status, "pending"));
    const totalComments = await db
      .select({ count: sql<number>`count(*)` })
      .from(comments);

    return {
      totalQuestions: totalQuestions[0]?.count ?? 0,
      totalUploads: totalUploads[0]?.count ?? 0,
      pendingUploads: pendingUploads[0]?.count ?? 0,
      totalComments: totalComments[0]?.count ?? 0,
    };
  }),
});
