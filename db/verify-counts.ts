import { getDb } from "../server/queries/connection.js";
import {
  practicePassages,
  practiceQuestions,
  practiceChoices,
  practicePassageImages,
  practiceProgress,
  exams,
  questions as examQuestions,
  users,
} from "./schema.js";

async function main() {
  const db = getDb();

  const pp = await db.select().from(practicePassages);
  const pq = await db.select().from(practiceQuestions);
  const pc = await db.select().from(practiceChoices);
  const pi = await db.select().from(practicePassageImages);
  const ex = await db.select().from(exams);
  const eq = await db.select().from(examQuestions);
  const us = await db.select().from(users);
  const prog = await db.select().from(practiceProgress);

  const withExpl = pq.filter((q) => q.explanation && q.explanation.length > 0).length;
  const passagesWithFigureMarker = pp.filter((p) => p.bodyText.includes("[[FIGURE]]")).length;

  console.log(`practice_passages=${pp.length}`);
  console.log(`practice_questions=${pq.length}`);
  console.log(`practice_questions_with_explanation=${withExpl}`);
  console.log(`practice_choices=${pc.length}`);
  console.log(`practice_passage_images=${pi.length}`);
  console.log(`passages_with_figure_marker=${passagesWithFigureMarker}`);
  console.log(`exams=${ex.length}`);
  console.log(`exam_questions=${eq.length}`);
  console.log(`users=${us.length}`);
  console.log(`users_with_password=${us.filter((u) => u.passwordHash).length}`);
  console.log(`practice_progress_rows=${prog.length}`);

  const bySubject: Record<string, number> = {};
  const byChapter: Record<string, number> = {};
  for (const p of pp) {
    bySubject[p.subject] = (bySubject[p.subject] ?? 0) + 1;
    const key = `${p.subject} / ${p.sourceLabel}`;
    byChapter[key] = (byChapter[key] ?? 0) + 1;
  }
  console.log(`passages_by_subject=${JSON.stringify(bySubject)}`);
  console.log(`passages_by_chapter=${JSON.stringify(byChapter)}`);

  process.exit(0);
}

main().catch((e) => {
  console.error("VERIFY FAILED:", e);
  process.exit(1);
});
