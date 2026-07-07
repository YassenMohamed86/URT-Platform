import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import {
  practicePassages,
  practiceQuestions,
  practiceChoices,
  practicePassageImages,
  practiceProgress,
} from "../db/schema.js";

// Every query in this file uses full-row select() (no column projection,
// no .where(), no .orderBy(), no JOIN/GROUP BY/raw sql) with all filtering,
// sorting, and aggregation done in JS instead. This is deliberate: live
// testing showed queries using partial column projection or WHERE clauses
// against these tables consistently failing with a generic wrapped
// "Failed query" error, while plain full-table select() calls succeeded
// every single time (matching the pattern already proven working in
// exam-router.ts and db/verify-counts.ts). The underlying cause wasn't
// fully diagnosable — Drizzle's error wrapper hides the real Turso/libsql
// message — so this sidesteps it entirely rather than keep guessing at
// which specific SQL shape is safe. Table sizes here are tiny (currently
// 525 questions, 2100 choices total even fully populated across all four
// subjects), so fetching full tables and filtering in memory costs nothing.

export const practiceRouter = createRouter({
  listSubjects: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(practicePassages);
    const unique = Array.from(new Set(rows.map((r) => r.subject)));
    unique.sort();
    return unique;
  }),

  listPassages: publicQuery
    .input(z.object({ subject: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = getDb();
      const allPassages = await db.select().from(practicePassages);
      const passages = allPassages.filter((p) => p.subject === input.subject);

      if (passages.length === 0) return [];

      const passageIds = new Set(passages.map((p) => p.id));
      const allQuestions = await db.select().from(practiceQuestions);
      const questions = allQuestions.filter((q) => passageIds.has(q.passageId));

      const countByPassage = new Map<number, number>();
      for (const q of questions) {
        countByPassage.set(q.passageId, (countByPassage.get(q.passageId) ?? 0) + 1);
      }

      return passages
        .map((p) => ({
          id: p.id,
          testCode: p.testCode,
          sourceLabel: p.sourceLabel,
          orderIndex: p.orderIndex,
          preview: p.bodyText.slice(0, 180),
          questionCount: countByPassage.get(p.id) ?? 0,
        }))
        .sort((a, b) => a.orderIndex - b.orderIndex);
    }),

  // Full passage + questions + choices — correctAnswer intentionally excluded
  getPassage: publicQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = getDb();
      const allPassages = await db.select().from(practicePassages);
      const passage = allPassages.find((p) => p.id === input.id);

      if (!passage) throw new TRPCError({ code: "NOT_FOUND", message: "Passage not found" });

      const allQuestions = await db.select().from(practiceQuestions);
      const qs = allQuestions
        .filter((q) => q.passageId === passage.id)
        .sort((a, b) => a.number - b.number);

      const questionIds = new Set(qs.map((q) => q.id));
      const allChoices = await db.select().from(practiceChoices);
      const relevantChoices = allChoices
        .filter((c) => questionIds.has(c.questionId))
        .sort((a, b) => a.label.localeCompare(b.label));

      const allImages = await db.select().from(practicePassageImages);
      const images = allImages
        .filter((img) => img.passageId === passage.id)
        .sort((a, b) => a.orderIndex - b.orderIndex);

      return {
        id: passage.id,
        subject: passage.subject,
        sourceLabel: passage.sourceLabel,
        testCode: passage.testCode,
        bodyText: passage.bodyText,
        images: images.map((img) => ({ dataUrl: img.imageData, width: img.width, height: img.height })),
        questions: qs.map((q) => ({
          id: q.id,
          number: q.number,
          text: q.text,
          hasExplanation: q.explanation !== null && q.explanation !== "",
          choices: relevantChoices.filter((c) => c.questionId === q.id),
        })),
      };
    }),

  // Check a single answer — returns correct answer + explanation after submission
  // correctAnswer is never sent to the client before this call
  checkAnswer: publicQuery
    .input(
      z.object({
        questionId: z.number().int().positive(),
        selectedLabel: z.string().min(1).max(1),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const allQuestions = await db.select().from(practiceQuestions);
      const q = allQuestions.find((row) => row.id === input.questionId);

      if (!q) throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });

      return {
        isCorrect: q.correctAnswer === input.selectedLabel,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation ?? null,
      };
    }),

  // Everything below is server-side completion tracking for signed-in users.
  // Guests keep working purely off localStorage (src/lib/practiceProgress.ts)
  // — these all no-op (rather than error) when ctx.userId is null, since
  // being logged out is a completely normal state, not a failure.

  markCompleted: publicQuery
    .input(z.object({ passageId: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) return { synced: false };
      const db = getDb();
      const existing = await db.select().from(practiceProgress);
      const already = existing.some(
        (r) => r.userId === ctx.userId && r.passageId === input.passageId,
      );
      if (!already) {
        await db.insert(practiceProgress).values({ userId: ctx.userId, passageId: input.passageId });
      }
      return { synced: true };
    }),

  listCompleted: publicQuery.query(async ({ ctx }) => {
    if (!ctx.userId) return [];
    const db = getDb();
    const rows = await db.select().from(practiceProgress);
    return rows.filter((r) => r.userId === ctx.userId).map((r) => r.passageId);
  }),

  // Called once right after signup/login so progress made as a guest on
  // this device isn't lost when an account is created.
  claimLocalProgress: publicQuery
    .input(z.object({ passageIds: z.array(z.number().int().positive()).max(500) }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const db = getDb();
      const existing = await db.select().from(practiceProgress);
      const already = new Set(
        existing.filter((r) => r.userId === ctx.userId).map((r) => r.passageId),
      );
      const toInsert = input.passageIds.filter((id) => !already.has(id));
      if (toInsert.length > 0) {
        const userId = ctx.userId;
        await db.insert(practiceProgress).values(
          toInsert.map((passageId) => ({ userId, passageId })),
        );
      }
      return { claimed: toInsert.length };
    }),
});
