import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const questions = mysqlTable("questions", {
  id: serial("id").primaryKey(),
  subject: varchar("subject", { length: 32 }).notNull(),
  passageTitle: varchar("passage_title", { length: 255 }),
  passageText: text("passage_text").notNull(),
  passageNumber: int("passage_number").notNull(),
  questionText: text("question_text").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctAnswer: varchar("correct_answer", { length: 1 }).notNull(),
  difficulty: varchar("difficulty", { length: 16 }).notNull(),
  skillTag: varchar("skill_tag", { length: 64 }),
  explanation: text("explanation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

export const uploads = mysqlTable("uploads", {
  id: serial("id").primaryKey(),
  uploaderName: varchar("uploader_name", { length: 128 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  subject: varchar("subject", { length: 32 }).notNull(),
  fileUrl: varchar("file_url", { length: 512 }).notNull(),
  fileType: varchar("file_type", { length: 32 }).notNull(),
  upvotes: int("upvotes").default(0).notNull(),
  downvotes: int("downvotes").default(0).notNull(),
  status: varchar("status", { length: 16 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Upload = typeof uploads.$inferSelect;
export type InsertUpload = typeof uploads.$inferInsert;

export const comments = mysqlTable("comments", {
  id: serial("id").primaryKey(),
  uploadId: bigint("upload_id", { mode: "number", unsigned: true })
    .notNull(),
  commenterName: varchar("commenter_name", { length: 128 }).notNull(),
  commentText: text("comment_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

export const votes = mysqlTable("votes", {
  id: serial("id").primaryKey(),
  uploadId: bigint("upload_id", { mode: "number", unsigned: true })
    .notNull(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  voteType: varchar("vote_type", { length: 8 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;
