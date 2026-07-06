// @ts-nocheck
import { getDb } from "../server/queries/connection.js";
import { practicePassages, practicePassageImages } from "./schema.js";
import { eq } from "drizzle-orm";

async function main() {
  const db = getDb();
  const all = await db.select().from(practicePassages);
  const test61 = all.find((p) => p.testCode === "Test 6-1");
  console.log("=== Test 6-1 bodyText (first 600 chars) ===");
  console.log(test61.bodyText.slice(0, 600));
  console.log();
  console.log("=== Full length ===", test61.bodyText.length);
  console.log("=== Contains [[FIGURE]] ===", test61.bodyText.includes("[[FIGURE]]"));

  const images = await db.select().from(practicePassageImages).where(eq(practicePassageImages.passageId, test61.id));
  console.log("=== Images for this passage ===", images.length);
  for (const img of images) {
    console.log(`  order=${img.orderIndex} ${img.width}x${img.height} dataUrl length=${img.imageData.length}`);
  }
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
