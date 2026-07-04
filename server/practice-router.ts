import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { asc, eq, inArray } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import {
  practicePassages,
  practiceQuestions,
  practiceChoices,
} from "../db/schema.js";

export const practiceRouter = createRouter({
  // List distinct subjects that have at least one passage.
  // Plain select + JS-side dedup/sort instead of selectDistinct+orderBy —
  // that combination returned a wrapped, unhelpful "Failed query" error
  // against Turso despite matching Drizzle's own documented syntax exactly.
  // This table is tiny (low hundreds of rows at most), so deduplicating in
  // JS costs nothing and sidesteps the issue entirely.
  listSubjects: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .select({ subject: practicePassages.subject })
      .from(practicePassages);
    const unique = Array.from(new Set(rows.map((r) => r.subject)));
    unique.sort();
    return unique;
  }),

  // List all passages for a subject with question count and a short preview.
  // Plain selects + JS-side aggregation instead of LEFT JOIN + GROUP BY +
  // raw SQL functions (substr/count) — same reasoning as listSubjects above.
  // Two simple queries on a tiny table beats one complex one of uncertain
  // compatibility.
  listPassages: publicQuery
    .input(z.object({ subject: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = getDb();
      const passages = await db
        .select({
          id: practicePassages.id,
          testCode: practicePassages.testCode,
          sourceLabel: practicePassages.sourceLabel,
          orderIndex: practicePassages.orderIndex,
          bodyText: practicePassages.bodyText,
        })
        .from(practicePassages)
        .where(eq(practicePassages.subject, input.subject));

      if (passages.length === 0) return [];

      const passageIds = passages.map((p) => p.id);
      const questions = await db
        .select({ id: practiceQuestions.id, passageId: practiceQuestions.passageId })
        .from(practiceQuestions)
        .where(inArray(practiceQuestions.passageId, passageIds));

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
      const [passage] = await db
        .select()
        .from(practicePassages)
        .where(eq(practicePassages.id, input.id))
        .limit(1);

      if (!passage) throw new TRPCError({ code: "NOT_FOUND", message: "Passage not found" });

      const qs = await db
        .select({
          id: practiceQuestions.id,
          number: practiceQuestions.number,
          text: practiceQuestions.text,
          explanation: practiceQuestions.explanation,
        })
        .from(practiceQuestions)
        .where(eq(practiceQuestions.passageId, passage.id))
        .orderBy(asc(practiceQuestions.number));

      const allChoices =
        qs.length > 0
          ? await db
              .select()
              .from(practiceChoices)
              .where(
                inArray(
                  practiceChoices.questionId,
                  qs.map((q) => q.id),
                ),
              )
              .orderBy(asc(practiceChoices.label))
          : [];

      return {
        id: passage.id,
        subject: passage.subject,
        sourceLabel: passage.sourceLabel,
        testCode: passage.testCode,
        bodyText: passage.bodyText,
        questions: qs.map((q) => ({
          id: q.id,
          number: q.number,
          text: q.text,
          hasExplanation: q.explanation !== null && q.explanation !== "",
          choices: allChoices.filter((c) => c.questionId === q.id),
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
      const [q] = await db
        .select({
          correctAnswer: practiceQuestions.correctAnswer,
          explanation: practiceQuestions.explanation,
        })
        .from(practiceQuestions)
        .where(eq(practiceQuestions.id, input.questionId))
        .limit(1);

      if (!q) throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });

      return {
        isCorrect: q.correctAnswer === input.selectedLabel,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation ?? null,
      };
    }),
});
