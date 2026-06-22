// @ts-nocheck
import fs from "fs";
import { getDb } from "../server/queries/connection";
import { exams, sections, passages, questions, choices } from "./schema";
import { eq, and } from "drizzle-orm";

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Please provide the path to urt_exam_data.json");
    process.exit(1);
  }

  console.log(`Reading file: ${filePath}`);
  const rawData = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(rawData);

  const db = getDb();

  let examsCreated = 0;
  let questionsCreated = 0;
  let questionsFlagged = 0;

  console.log(`Importing ${data.stats.examCount} exams...`);

  for (const examData of data.exams) {
    // Upsert Exam
    await db.insert(exams).values({
      id: examData.examId,
      title: examData.examTitle,
      year: examData.year || 2024,
      session: examData.session || "General",
      note: examData.examNote || null,
    }).onConflictDoUpdate({
      target: exams.id,
      set: {
        title: examData.examTitle,
        year: examData.year || 2024,
        session: examData.session || "General",
        note: examData.examNote || null,
      }
    });
    examsCreated++;

    for (const sectionData of examData.sections) {
      // Upsert Section
      await db.insert(sections).values({
        id: sectionData.sectionId,
        examId: examData.examId,
        subject: sectionData.subject,
      }).onConflictDoUpdate({
        target: sections.id,
        set: { subject: sectionData.subject }
      });

      for (let i = 0; i < sectionData.passages.length; i++) {
        const passageData = sectionData.passages[i];
        
        // Upsert Passage
        await db.insert(passages).values({
          id: passageData.passageId,
          sectionId: sectionData.sectionId,
          title: passageData.passageTitle || null,
          bodyText: passageData.passageText,
          orderIndex: i,
        }).onConflictDoUpdate({
          target: passages.id,
          set: {
            title: passageData.passageTitle || null,
            bodyText: passageData.passageText,
            orderIndex: i,
          }
        });

        for (const q of passageData.questions) {
          // Verify correct answer matches a choice
          const matchingChoice = q.choices.find((c: any) => c.label === q.correctAnswer);
          if (!matchingChoice) {
            console.error(`Question ${q.questionNumber} in passage ${passageData.passageId} has invalid correctAnswer: ${q.correctAnswer}`);
            continue;
          }

          let existingQ = await db.query.questions.findFirst({
            where: (questions, { eq, and }) => and(
              eq(questions.passageId, passageData.passageId),
              eq(questions.number, q.questionNumber)
            )
          });

          let questionId;

          if (existingQ) {
            await db.update(questions).set({
              text: q.questionText,
              correctAnswer: q.correctAnswer,
              answerStatus: q.answerStatus,
              reviewNote: q.reviewNote || null,
            }).where(eq(questions.id, existingQ.id));
            questionId = existingQ.id;
          } else {
            const result = await db.insert(questions).values({
              passageId: passageData.passageId,
              number: q.questionNumber,
              text: q.questionText,
              correctAnswer: q.correctAnswer,
              answerStatus: q.answerStatus,
              reviewNote: q.reviewNote || null,
            }).returning({ id: questions.id });
            questionId = result[0].id;
            questionsCreated++;
          }

          if (q.answerStatus !== "verified") {
            questionsFlagged++;
          }

          await db.delete(choices).where(eq(choices.questionId, questionId));
          
          const choicesToInsert = q.choices.map((c: any) => ({
            questionId: questionId,
            label: c.label,
            text: c.text,
          }));

          if (choicesToInsert.length > 0) {
             await db.insert(choices).values(choicesToInsert);
          }
        }
      }
    }
  }

  console.log("Import Complete!");
  console.log(`Exams upserted/processed: ${examsCreated}`);
  console.log(`New questions created: ${questionsCreated}`);
  console.log(`Questions flagged for review: ${questionsFlagged}`);
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
