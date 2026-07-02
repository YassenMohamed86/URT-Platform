import { getDb } from "../server/queries/connection.js";
import {
  practicePassages,
  practiceQuestions,
  practiceChoices,
  exams,
  questions as examQuestions,
} from "./schema.js";

async function main() {
  const db = getDb();

  const pp = await db.select().from(practicePassages);
  const pq = await db.select().from(practiceQuestions);
  const pc = await db.select().from(practiceChoices);
  const ex = await db.select().from(exams);
  const eq = await db.select().from(examQuestions);

  const withExpl = pq.filter((q) => q.explanation && q.explanation.length > 0).length;

  const bySubject: Record<string, number> = {};
  for (const p of pp) {
    bySubject[p.subject] = (bySubject[p.subject] ?? 0) + 1;
  }

  console.log(`practice_passages=${pp.length}`);
  console.log(`practice_questions=${pq.length}`);
  console.log(`practice_questions_with_explanation=${withExpl}`);
  console.log(`practice_choices=${pc.length}`);
  console.log(`exams=${ex.length}`);
  console.log(`exam_questions=${eq.length}`);
  console.log(`passages_by_subject=${JSON.stringify(bySubject)}`);

  process.exit(0);
}

main().catch((e) => {
  console.error("VERIFY FAILED:", e);
  process.exit(1);
});
