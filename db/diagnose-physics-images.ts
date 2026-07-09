import { getDb } from "../server/queries/connection.js";
import { practicePassages, practicePassageImages } from "./schema.js";
import { eq } from "drizzle-orm";

async function main() {
  const db = getDb();
  const passages = await db
    .select()
    .from(practicePassages)
    .where(eq(practicePassages.subject, "Physics"));

  let totalExpected = 0;
  let totalActual = 0;

  for (const p of passages) {
    const markerCount = (p.bodyText.match(/\[\[FIGURE\]\]/g) ?? []).length;
    const imgs = await db
      .select()
      .from(practicePassageImages)
      .where(eq(practicePassageImages.passageId, p.id));
    totalExpected += markerCount;
    totalActual += imgs.length;
    if (markerCount !== imgs.length) {
      console.log(`MISMATCH: ${p.testCode} markers=${markerCount} images=${imgs.length}`);
    }
  }

  console.log(`Total passages: ${passages.length}`);
  console.log(`Total expected images (marker count): ${totalExpected}`);
  console.log(`Total actual images in DB: ${totalActual}`);
  process.exit(0);
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
