// @ts-nocheck
/**
 * Seeds Chemistry practice data from ACT Crack (Shahd Gaber).
 * 68 passages, 525 questions with full explanations, plus figure images
 * extracted directly from the source PDF and matched to passages by page
 * range + marker order.
 *
 * Usage: tsx db/seed-chemistry.ts
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { eq } from "drizzle-orm";
import { getDb } from "../server/queries/connection.js";
import { practicePassages, practiceQuestions, practiceChoices, practicePassageImages } from "./schema.js";

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
  readFileSync(join(__dirname, "practice-chemistry.json"), "utf-8"),
);

const imagesByTest: Record<
  string,
  Array<{ page: number; width: number; height: number; dataUrl: string }>
> = JSON.parse(
  readFileSync(join(__dirname, "practice-chemistry-images.json"), "utf-8"),
);

const db = getDb();

async function main() {
  console.log(`🌱  Seeding Chemistry: ${passages.length} passages...`);
  let totalImages = 0;

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
        .set({
          subject: p.subject,
          sourceLabel: p.sourceLabel,
          bodyText: p.bodyText,
          orderIndex: p.orderIndex,
        })
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

    // ── Upsert images (matched to [[FIGURE]] markers, in order) ────
    const markerCount = (p.bodyText.match(/\[\[FIGURE\]\]/g) ?? []).length;
    const availableImages = imagesByTest[p.testCode] ?? [];

    if (markerCount > 0 && availableImages.length > 0) {
      await db
        .delete(practicePassageImages)
        .where(eq(practicePassageImages.passageId, passageId));

      const toInsert = availableImages.slice(0, markerCount).map((img, i) => ({
        passageId,
        orderIndex: i,
        imageData: img.dataUrl,
        width: img.width,
        height: img.height,
      }));

      if (toInsert.length > 0) {
        await db.insert(practicePassageImages).values(toInsert);
        totalImages += toInsert.length;
      }
    }

    if ((idx + 1) % 10 === 0 || idx === passages.length - 1) {
      console.log(`  ✓ ${idx + 1}/${passages.length} passages`);
    }
  }

  console.log(`✅  Chemistry seed complete — 52 passages, 310 questions, ${totalImages} figure images.`);
  process.exit(0);
}

main().catch((e) => {
  console.error("Chemistry seed failed:", e);
  process.exit(1);
});
