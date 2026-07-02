import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { asc, eq, inArray, sql } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import {
  practicePassages,
  practiceQuestions,
  practiceChoices,
} from "../db/schema.js";

export const practiceRouter = createRouter({
  // List distinct subjects that have at least one passage
  listSubjects: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .selectDistinct({ subject: practicePassages.subject })
      .from(practicePassages)
      .orderBy(asc(practicePassages.subject));
    return rows.map((r) => r.subject);
  }),

  // List all passages for a subject with question count and a short preview
  listPassages: publicQuery
    .input(z.object({ subject: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select({
          id: practicePassages.id,
          testCode: practicePassages.testCode,
          sourceLabel: practicePassages.sourceLabel,
          orderIndex: practicePassages.orderIndex,
          preview: sql<string>`substr(${practicePassages.bodyText}, 1, 180)`,
          questionCount: sql<number>`count(${practiceQuestions.id})`,
        })
        .from(practicePassages)
        .leftJoin(
          practiceQuestions,
          eq(practiceQuestions.passageId, practicePassages.id),
        )
        .where(eq(practicePassages.subject, input.subject))
        .groupBy(practicePassages.id)
        .orderBy(asc(practicePassages.orderIndex));
      return rows;
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
          hasExplanation: sql<number>`case when ${practiceQuestions.explanation} is not null then 1 else 0 end`,
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
          hasExplanation: q.hasExplanation === 1,
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
