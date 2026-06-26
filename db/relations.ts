import { relations } from "drizzle-orm";
import { exams, sections, passages, questions, choices, attempts, responses } from "./schema.js";

export const examsRelations = relations(exams, ({ many }) => ({
  sections: many(sections),
  attempts: many(attempts),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  exam: one(exams, {
    fields: [sections.examId],
    references: [exams.id],
  }),
  passages: many(passages),
}));

export const passagesRelations = relations(passages, ({ one, many }) => ({
  section: one(sections, {
    fields: [passages.sectionId],
    references: [sections.id],
  }),
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  passage: one(passages, {
    fields: [questions.passageId],
    references: [passages.id],
  }),
  choices: many(choices),
  responses: many(responses),
}));

export const choicesRelations = relations(choices, ({ one }) => ({
  question: one(questions, {
    fields: [choices.questionId],
    references: [questions.id],
  }),
}));

export const attemptsRelations = relations(attempts, ({ one, many }) => ({
  exam: one(exams, {
    fields: [attempts.examId],
    references: [exams.id],
  }),
  responses: many(responses),
}));

export const responsesRelations = relations(responses, ({ one }) => ({
  attempt: one(attempts, {
    fields: [responses.attemptId],
    references: [attempts.id],
  }),
  question: one(questions, {
    fields: [responses.questionId],
    references: [questions.id],
  }),
}));
