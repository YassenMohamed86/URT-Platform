import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // Legacy field from an earlier OAuth-style design that was never wired up.
  // Real accounts (email/password auth) just set this to the email address,
  // so it keeps satisfying the unique/not-null constraint with no extra migration.
  unionId: text("unionId").notNull().unique(),
  name: text("name"),
  email: text("email").unique(),
  passwordHash: text("password_hash"), // null for any pre-auth rows; always set for real accounts
  avatar: text("avatar"),
  role: text("role").default("user").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow().notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: integer("lastSignInAt", { mode: "timestamp" }).defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const exams = sqliteTable("exams", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  year: integer("year").notNull(),
  session: text("session").notNull(),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow().notNull(),
});
export type Exam = typeof exams.$inferSelect;

export const sections = sqliteTable("sections", {
  id: text("id").primaryKey(),
  examId: text("exam_id").notNull(),
  subject: text("subject").notNull(),
});
export type Section = typeof sections.$inferSelect;

export const passages = sqliteTable("passages", {
  id: text("id").primaryKey(),
  sectionId: text("section_id").notNull(),
  title: text("title"),
  bodyText: text("body_text").notNull(),
  orderIndex: integer("order_index").notNull(),
});
export type Passage = typeof passages.$inferSelect;

export const questions = sqliteTable("questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  passageId: text("passage_id").notNull(),
  number: integer("number").notNull(),
  text: text("text").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  answerStatus: text("answer_status").default("verified").notNull(),
  reviewNote: text("review_note"),
});
export type Question = typeof questions.$inferSelect;

export const choices = sqliteTable("choices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  questionId: integer("question_id").notNull(),
  label: text("label").notNull(),
  text: text("text").notNull(),
});
export type Choice = typeof choices.$inferSelect;

export const attempts = sqliteTable("attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  examId: text("exam_id").notNull(),
  startedAt: integer("started_at", { mode: "timestamp" }).defaultNow().notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  score: integer("score"),
});
export type Attempt = typeof attempts.$inferSelect;

export const responses = sqliteTable("responses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  attemptId: integer("attempt_id").notNull(),
  questionId: integer("question_id").notNull(),
  selectedLabel: text("selected_label").notNull(),
  isCorrect: integer("is_correct").notNull(),
  answeredAt: integer("answered_at", { mode: "timestamp" }).defaultNow().notNull(),
});
export type Response = typeof responses.$inferSelect;

export const uploads = sqliteTable("uploads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uploaderName: text("uploader_name").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  subject: text("subject").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileData: text("file_data"), // base64-encoded file content — replaces ephemeral /tmp storage
  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  status: text("status").default("pending").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow().notNull(),
});
export type Upload = typeof uploads.$inferSelect;
export type InsertUpload = typeof uploads.$inferInsert;

export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uploadId: integer("upload_id").notNull(),
  commenterName: text("commenter_name").notNull(),
  commentText: text("comment_text").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow().notNull(),
});
export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

export const votes = sqliteTable("votes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uploadId: integer("upload_id").notNull(),
  sessionId: text("session_id").notNull(),
  voteType: text("vote_type").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow().notNull(),
});
export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;

// ── Practice / Drill ─────────────────────────────────────────────────────
// Completely separate from URT exam tables.
// Passages have a subject tag and a source label ("sourceLabel"), which the
// UI surfaces as a "Chapter" — a horizontal tab within a subject. Today every
// subject has exactly one chapter, "ACT Crack Shahd Gaber", but the field
// exists precisely so more chapters (other question banks/resources) can be
// added later without any schema change — just a new sourceLabel value.

export const practicePassages = sqliteTable("practice_passages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  subject: text("subject").notNull(),       // "Biology" | "Physics" | "Chemistry" | "Geology"
  sourceLabel: text("source_label").notNull(), // Chapter name, e.g. "ACT Crack Shahd Gaber"
  testCode: text("test_code"),              // "Test 6-1", "Test 7-2", …
  bodyText: text("body_text").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow().notNull(),
});
export type PracticePassage = typeof practicePassages.$inferSelect;

export const practiceQuestions = sqliteTable("practice_questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  passageId: integer("passage_id").notNull(),
  number: integer("number").notNull(),
  text: text("text").notNull(),
  correctAnswer: text("correct_answer").notNull(), // "A"–"D" or "F"–"J"
  explanation: text("explanation"),                 // null until answers PDF is imported
});
export type PracticeQuestion = typeof practiceQuestions.$inferSelect;

export const practiceChoices = sqliteTable("practice_choices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  questionId: integer("question_id").notNull(),
  label: text("label").notNull(),  // "A", "B", "C", "D" / "F", "G", "H", "J"
  text: text("text").notNull(),
});
export type PracticeChoice = typeof practiceChoices.$inferSelect;

export const practicePassageImages = sqliteTable("practice_passage_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  passageId: integer("passage_id").notNull(),
  orderIndex: integer("order_index").notNull().default(0), // which [[FIGURE]] marker this fills, in order
  imageData: text("image_data").notNull(), // base64 data URL (data:image/png;base64,...)
  width: integer("width"),
  height: integer("height"),
});
export type PracticePassageImage = typeof practicePassageImages.$inferSelect;

// Server-side record of which Drill passages a signed-in user has finished,
// so progress survives switching devices. Guests keep working entirely off
// localStorage (see src/lib/practiceProgress.ts) — this table only ever gets
// rows for requests carrying a valid user auth token.
export const practiceProgress = sqliteTable("practice_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  passageId: integer("passage_id").notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }).defaultNow().notNull(),
});
export type PracticeProgress = typeof practiceProgress.$inferSelect;
