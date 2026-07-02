// @ts-nocheck
/**
 * Seeds Biology practice data from ACT Crack (Shahd Gaber).
 * 68 passages, 525 questions with full explanations.
 * Figure-only questions (17) excluded — their choices are embedded images.
 *
 * Usage: tsx db/seed-biology.ts
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { eq } from "drizzle-orm";
import { getDb } from "../server/queries/connection.js";
import { practicePassages, practiceQuestions, practiceChoices } from "./schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const passages: Array<{
  subject: string;
  sourceLabel: string;
  testCode: string;
  orderIndex: number;
  bodyText: string;
  questions: Array<{
    number: number;
    text: string;
    correctAnswer: string;
    explanation: string | null;
    choices: Array<{ label: string; text: string }>;
  }>;
}> = JSON.parse(
  readFileSync(join(__dirname, "practice-biology.json"), "utf-8"),
);

const db = getDb();

async function main() {
  console.log(`🌱  Seeding Biology: ${passages.length} passages...`);

  for (const [idx, p] of passages.entries()) {
    // ── Upsert passage ────────────────────────────────────────────
    const existingP = await db
      .select({ id: practicePassages.id })
      .from(practicePassages)
      .where(eq(practicePassages.testCode, p.testCode))
      .limit(1);

    let passageId: number;

    if (existingP.length > 0) {
      passageId = existingP[0].id;
      await db
        .update(practicePassages)
        .set({ bodyText: p.bodyText, orderIndex: p.orderIndex })
        .where(eq(practicePassages.id, passageId));
    } else {
      const [row] = await db
        .insert(practicePassages)
        .values({
          subject: p.subject,
          sourceLabel: p.sourceLabel,
          testCode: p.testCode,
          bodyText: p.bodyText,
          orderIndex: p.orderIndex,
        })
        .returning({ id: practicePassages.id });
      passageId = row.id;
    }

    // ── Upsert questions + choices ─────────────────────────────────
    const existingQs = await db
      .select({ id: practiceQuestions.id, number: practiceQuestions.number })
      .from(practiceQuestions)
      .where(eq(practiceQuestions.passageId, passageId));

    for (const q of p.questions) {
      const match = existingQs.find((r) => r.number === q.number);
      let questionId: number;

      if (match) {
        questionId = match.id;
        await db
          .update(practiceQuestions)
          .set({
            text: q.text,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation ?? null,
          })
          .where(eq(practiceQuestions.id, questionId));
        // Replace choices
        await db
          .delete(practiceChoices)
          .where(eq(practiceChoices.questionId, questionId));
      } else {
        const [row] = await db
          .insert(practiceQuestions)
          .values({
            passageId,
            number: q.number,
            text: q.text,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation ?? null,
          })
          .returning({ id: practiceQuestions.id });
        questionId = row.id;
      }

      await db.insert(practiceChoices).values(
        q.choices.map((c) => ({
          questionId,
          label: c.label,
          text: c.text,
        })),
      );
    }

    if ((idx + 1) % 10 === 0 || idx === passages.length - 1) {
      console.log(`  ✓ ${idx + 1}/${passages.length} passages`);
    }
  }

  console.log("✅  Biology seed complete — 68 passages, 525 questions.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Biology seed failed:", e);
  process.exit(1);
});
