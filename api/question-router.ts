import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { questions } from "@db/schema";
import { eq, and, asc, sql } from "drizzle-orm";

export const questionRouter = createRouter({
  getByExam: publicQuery
    .input(
      z.object({
        examType: z.enum(["english", "biology_geology", "chemistry_physics"]),
        difficulty: z.enum(["all", "easy", "medium", "hard"]).default("all"),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { examType, difficulty } = input;

      let questionsPerSubject: { subject: string; count: number }[] = [];

      switch (examType) {
        case "english":
          questionsPerSubject = [{ subject: "english", count: 50 }];
          questionsPerSubject = [{ subject: "english", count: 50 }];
          break;
        case "biology_geology":
          questionsPerSubject = [
            { subject: "biology", count: 25 },
            { subject: "geology", count: 25 },
          ];
          break;
        case "chemistry_physics":
          questionsPerSubject = [
            { subject: "chemistry", count: 25 },
            { subject: "physics", count: 25 },
          ];
          break;
      }

      const allQuestions: {
        subject: string;
        passageNumber: number;
        passageTitle: string | null;
        passageText: string;
        questions: typeof questions.$inferSelect[];
      }[] = [];

      for (const qs of questionsPerSubject) {
        const conditions = [eq(questions.subject, qs.subject)];
        if (difficulty !== "all") {
          conditions.push(eq(questions.difficulty, difficulty));
        }

        const subjectQuestions = await db
          .select()
          .from(questions)
          .where(and(...conditions))
          .orderBy(asc(questions.passageNumber), asc(questions.id));

        if (subjectQuestions.length === 0) continue;

        // Group by passage
        const passageMap = new Map<
          number,
          {
            passageTitle: string | null;
            passageText: string;
            questions: typeof questions.$inferSelect[];
          }
        >();

        for (const q of subjectQuestions) {
          if (!passageMap.has(q.passageNumber)) {
            passageMap.set(q.passageNumber, {
              passageTitle: q.passageTitle,
              passageText: q.passageText,
              questions: [],
            });
          }
          passageMap.get(q.passageNumber)!.questions.push(q);
        }

        for (const [passageNumber, data] of passageMap) {
          allQuestions.push({
            subject: qs.subject,
            passageNumber,
            passageTitle: data.passageTitle,
            passageText: data.passageText,
            questions: data.questions,
          });
        }
      }

      return allQuestions;
    }),

  list: publicQuery
    .input(
      z.object({
        subject: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { subject, page, limit } = input;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (subject) {
        conditions.push(eq(questions.subject, subject));
      }

      const query = conditions.length > 0 ? and(...conditions) : undefined;

      const result = await db
        .select()
        .from(questions)
        .where(query)
        .orderBy(asc(questions.passageNumber), asc(questions.id))
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(questions)
        .where(query);

      return {
        questions: result,
        total: countResult[0]?.count ?? 0,
      };
    }),

  create: publicQuery
    .input(
      z.object({
        subject: z.string(),
        passageText: z.string(),
        passageTitle: z.string().optional(),
        passageNumber: z.number(),
        questionText: z.string(),
        optionA: z.string(),
        optionB: z.string(),
        optionC: z.string(),
        optionD: z.string(),
        correctAnswer: z.enum(["A", "B", "C", "D"]),
        difficulty: z.enum(["easy", "medium", "hard"]),
        skillTag: z.string().optional(),
        explanation: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(questions).values(input);
      return result;
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        subject: z.string(),
        passageText: z.string(),
        passageTitle: z.string().optional(),
        passageNumber: z.number(),
        questionText: z.string(),
        optionA: z.string(),
        optionB: z.string(),
        optionC: z.string(),
        optionD: z.string(),
        correctAnswer: z.enum(["A", "B", "C", "D"]),
        difficulty: z.enum(["easy", "medium", "hard"]),
        skillTag: z.string().optional(),
        explanation: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const result = await db
        .update(questions)
        .set(data)
        .where(eq(questions.id, id));
      return result;
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(questions).where(eq(questions.id, input.id));
      return { success: true };
    }),
});
