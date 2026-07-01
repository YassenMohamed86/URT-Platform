// @ts-nocheck
/**
 * Seeds the Turso database with all exam data from seed-data.json.
 * Runs as part of the GitHub Actions db-setup workflow.
 *
 * Usage: tsx db/seed.ts
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { getDb } from "../server/queries/connection.js";
import { exams, sections, passages, questions, choices } from "./schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(join(__dirname, "seed-data.json"), "utf-8");
const data = JSON.parse(raw);

const db = getDb();

async function main() {
  console.log("🌱  Starting seed...");

  // ── Exams ──────────────────────────────────────────────────────────────────
  console.log(`  Upserting ${data.exams.length} exams...`);
  for (const e of data.exams) {
    await db.insert(exams).values({
      id:      e.id,
      title:   e.title,
      year:    e.year,
      session: e.session,
      note:    e.note ?? null,
    }).onConflictDoUpdate({
      target: exams.id,
      set: { title: e.title, year: e.year, session: e.session, note: e.note ?? null },
    });
  }

  // ── Sections ───────────────────────────────────────────────────────────────
  console.log(`  Upserting ${data.sections.length} sections...`);
  for (const s of data.sections) {
    await db.insert(sections).values({
      id:      s.id,
      examId:  s.exam_id,
      subject: s.subject,
    }).onConflictDoUpdate({
      target: sections.id,
      set: { examId: s.exam_id, subject: s.subject },
    });
  }

  // ── Passages ───────────────────────────────────────────────────────────────
  console.log(`  Upserting ${data.passages.length} passages...`);
  for (const p of data.passages) {
    await db.insert(passages).values({
      id:         p.id,
      sectionId:  p.section_id,
      title:      p.title ?? null,
      bodyText:   p.body_text,
      orderIndex: p.order_index,
    }).onConflictDoUpdate({
      target: passages.id,
      set: { sectionId: p.section_id, title: p.title ?? null, bodyText: p.body_text, orderIndex: p.order_index },
    });
  }

  // ── Questions ──────────────────────────────────────────────────────────────
  console.log(`  Upserting ${data.questions.length} questions...`);
  for (const q of data.questions) {
    await db.insert(questions).values({
      id:            q.id,
      passageId:     q.passage_id,
      number:        q.number,
      text:          q.text,
      correctAnswer: q.correct_answer,
      answerStatus:  q.answer_status ?? "verified",
      reviewNote:    q.review_note ?? null,
    }).onConflictDoUpdate({
      target: questions.id,
      set: {
        passageId:     q.passage_id,
        number:        q.number,
        text:          q.text,
        correctAnswer: q.correct_answer,
        answerStatus:  q.answer_status ?? "verified",
        reviewNote:    q.review_note ?? null,
      },
    });
  }

  // ── Choices ────────────────────────────────────────────────────────────────
  console.log(`  Upserting ${data.choices.length} choices...`);
  for (const c of data.choices) {
    await db.insert(choices).values({
      id:         c.id,
      questionId: c.question_id,
      label:      c.label,
      text:       c.text,
    }).onConflictDoUpdate({
      target: choices.id,
      set: { questionId: c.question_id, label: c.label, text: c.text },
    });
  }

  console.log("✅  Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
