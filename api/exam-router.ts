import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { exams, sections, passages, questions, choices, attempts, responses } from "@db/schema";
import { eq, asc } from "drizzle-orm";

export const examRouter = createRouter({
  listExams: publicQuery.query(async () => {
    const db = getDb();
    const dbExams = await db.select().from(exams).orderBy(asc(exams.year), asc(exams.id));
    const allSections = await db.select().from(sections);
    
    return dbExams.map(e => {
      const examSections = allSections.filter(s => s.examId === e.id);
      const uniqueSubjects = Array.from(new Set(examSections.map(s => s.subject)));
      return {
        ...e,
        subjects: uniqueSubjects
      };
    });
  }),

  getExamContent: publicQuery
    .input(z.object({ examId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const { examId } = input;

      const examData = await db.query.exams.findFirst({
        where: eq(exams.id, examId),
        with: {
          sections: {
            with: {
              passages: {
                orderBy: asc(passages.orderIndex),
                with: {
                  questions: {
                    orderBy: asc(questions.number),
                    columns: { correctAnswer: false, answerStatus: false, reviewNote: false },
                    with: {
                      choices: {
                        orderBy: asc(choices.label)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!examData) {
        throw new Error("Exam not found");
      }

      return examData;
    }),

  submitAttempt: publicQuery
    .input(z.object({
      examId: z.string(),
      userId: z.number().default(0),
      answers: z.record(z.string(), z.string()) // questionId (stringified number) -> selectedLabel
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { examId, userId, answers } = input;

      const [attemptResult] = await db.insert(attempts).values({
        userId,
        examId,
        startedAt: new Date(),
      }).returning({ id: attempts.id });
      const attemptId = attemptResult.id;

      const examQuestions = await db.select({
        id: questions.id,
        correctAnswer: questions.correctAnswer,
      })
      .from(questions)
      .innerJoin(passages, eq(questions.passageId, passages.id))
      .innerJoin(sections, eq(passages.sectionId, sections.id))
      .where(eq(sections.examId, examId));

      let correctCount = 0;
      const responsesToInsert = [];
      const feedback: Record<number, { isCorrect: boolean; correctAnswer: string }> = {};

      for (const q of examQuestions) {
        const userChoice = answers[q.id.toString()];
        if (!userChoice) continue;

        const isCorrect = userChoice === q.correctAnswer;
        if (isCorrect) correctCount++;

        responsesToInsert.push({
          attemptId,
          questionId: q.id,
          selectedLabel: userChoice,
          isCorrect: isCorrect ? 1 : 0,
          answeredAt: new Date(),
        });

        feedback[q.id] = {
          isCorrect,
          correctAnswer: q.correctAnswer,
        };
      }

      if (responsesToInsert.length > 0) {
        await db.insert(responses).values(responsesToInsert);
      }

      await db.update(attempts).set({
        completedAt: new Date(),
        score: correctCount,
      }).where(eq(attempts.id, attemptId));

      return {
        attemptId,
        score: correctCount,
        totalQuestions: examQuestions.length,
        feedback,
      };
    })
});
