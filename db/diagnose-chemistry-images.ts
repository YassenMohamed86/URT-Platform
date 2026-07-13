import { getDb } from "../server/queries/connection.js";
import { practicePassages, practicePassageImages } from "./schema.js";
import { eq } from "drizzle-orm";

async function main() {
  const db = getDb();
  const passages = await db
    .select()
    .from(practicePassages)
    .where(eq(practicePassages.subject, "Chemistry"));

  passages.sort((a, b) => a.orderIndex - b.orderIndex);

  console.log(`Total Chemistry passages: ${passages.length}`);
  console.log("");

  let totalMarkers = 0;
  let totalImages = 0;

  for (const p of passages) {
    const markerCount = (p.bodyText.match(/\[\[FIGURE\]\]/g) ?? []).length;
    const imgs = await db
      .select({
        orderIndex: practicePassageImages.orderIndex,
        width: practicePassageImages.width,
        height: practicePassageImages.height,
      })
      .from(practicePassageImages)
      .where(eq(practicePassageImages.passageId, p.id));
    imgs.sort((a, b) => a.orderIndex - b.orderIndex);

    totalMarkers += markerCount;
    totalImages += imgs.length;

    const dims = imgs.map((i) => `${i.width}x${i.height}`).join(",");
    const flag = markerCount !== imgs.length ? " <<<< MISMATCH" : "";
    console.log(`${p.testCode}\tmarkers=${markerCount}\timages=${imgs.length}\tdims=[${dims}]${flag}`);
  }

  console.log("");
  console.log(`TOTAL markers=${totalMarkers} images=${totalImages}`);
  process.exit(0);
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
