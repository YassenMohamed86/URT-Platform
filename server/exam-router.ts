import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { exams, sections, passages, questions, choices, attempts, responses } from "../db/schema.js";
import { eq } from "drizzle-orm";

// Every query below uses full-table select() (no column projection, no
// WHERE, no JOIN, no relational query API) with all filtering, sorting,
// and nesting done in JS instead. Live testing showed queries using
// partial column projection, .where() clauses, or drizzle's relational
// query API (db.query.*) against this database consistently failing with
// a generic wrapped "Failed query" error — while plain full-table
// select() calls succeeded every time. The underlying cause wasn't fully
// diagnosable (Drizzle's error wrapper hides the real Turso/libsql
// message), so this sidesteps it entirely. Table sizes here are small
// (7 exams, 10 sections, 41 passages, 232 questions, ~930 choices even
// at current scale), so fetching full tables and joining/filtering in
// memory costs nothing and removes reliance on SQL constructs of
// uncertain compatibility with this environment.

export const examRouter = createRouter({
  listExams: publicQuery.query(async () => {
    const db = getDb();
    const dbExams = await db.select().from(exams);
    const allSections = await db.select().from(sections);

    return dbExams
      .map((e) => {
        const examSections = allSections.filter((s) => s.examId === e.id);
        const uniqueSubjects = Array.from(new Set(examSections.map((s) => s.subject)));
        return { ...e, subjects: uniqueSubjects };
      })
      .sort((a, b) => a.year - b.year || a.id.localeCompare(b.id));
  }),

  getExamContent: publicQuery
    .input(z.object({ examId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const { examId } = input;

      const allExams = await db.select().from(exams);
      const exam = allExams.find((e) => e.id === examId);
      if (!exam) {
        throw new Error("Exam not found");
      }

      const allSections = await db.select().from(sections);
      const allPassages = await db.select().from(passages);
      const allQuestions = await db.select().from(questions);
      const allChoices = await db.select().from(choices);

      const examSections = allSections.filter((s) => s.examId === examId);

      const sectionsWithContent = examSections.map((section) => {
        const sectionPassages = allPassages
          .filter((p) => p.sectionId === section.id)
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((passage) => {
            const passageQuestions = allQuestions
              .filter((q) => q.passageId === passage.id)
              .sort((a, b) => a.number - b.number)
              .map((q) => {
                const questionChoices = allChoices
                  .filter((c) => c.questionId === q.id)
                  .sort((a, b) => a.label.localeCompare(b.label));

                // Explicit whitelist — correctAnswer/answerStatus/reviewNote
                // are deliberately excluded and never touch this response.
                return {
                  id: q.id,
                  passageId: q.passageId,
                  number: q.number,
                  text: q.text,
                  choices: questionChoices,
                };
              });

            return { ...passage, questions: passageQuestions };
          });

        return { ...section, passages: sectionPassages };
      });

      return { ...exam, sections: sectionsWithContent };
    }),

  submitAttempt: publicQuery
    .input(
      z.object({
        examId: z.string(),
        userId: z.number().default(0),
        answers: z.record(z.string(), z.string()), // questionId (stringified number) -> selectedLabel
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { examId, userId, answers } = input;

      const [attemptResult] = await db
        .insert(attempts)
        .values({
          userId,
          examId,
          startedAt: new Date(),
        })
        .returning({ id: attempts.id });
      const attemptId = attemptResult.id;

      const allSections = await db.select().from(sections);
      const examSectionIds = new Set(
        allSections.filter((s) => s.examId === examId).map((s) => s.id),
      );

      const allPassages = await db.select().from(passages);
      const examPassageIds = new Set(
        allPassages.filter((p) => examSectionIds.has(p.sectionId)).map((p) => p.id),
      );

      const allQuestions = await db.select().from(questions);
      const examQuestions = allQuestions
        .filter((q) => examPassageIds.has(q.passageId))
        .map((q) => ({ id: q.id, correctAnswer: q.correctAnswer }));

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

      await db
        .update(attempts)
        .set({
          completedAt: new Date(),
          score: correctCount,
        })
        .where(eq(attempts.id, attemptId));

      return {
        attemptId,
        score: correctCount,
        totalQuestions: examQuestions.length,
        feedback,
      };
    }),
});
