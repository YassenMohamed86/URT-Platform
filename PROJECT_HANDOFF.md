# Anneal / URT-Platform — Project Handoff

Repo: https://github.com/YassenMohamed86/URT-Platform
Live site: https://urt-platform.vercel.app  (use THIS domain — not any hashed
preview URL like `urt-platform-xxxxx-....vercel.app`, those are per-deployment
previews and behave differently)

This file is the source of truth for picking this project back up in a new
conversation with zero prior context. Read this whole file first.

---

## 1. What this is

A free exam-practice platform Yassen built for his NCSS/STEM school peers in
Egypt. Two independent features:

- **Exams** (original/core feature): real timed URT past exams, full-length,
  Bluebook-style two-pane UI (passage left, question+choices right).
- **Drill** (newer feature, nav label "Drill"): untimed, passage-by-passage
  practice pulled from "ACT Crack" material authored by Shahd Gaber, with
  instant right/wrong feedback and a written explanation per question.
  Organized by subject (Biology, Physics, Chemistry, Geology so far).

Both features share the same tRPC/Drizzle/Turso backend but use completely
separate DB tables — Exams data was never touched by any of the Drill work.

## 2. Stack & deployment

Vite + React frontend, Hono + tRPC backend, Drizzle ORM, Turso (libSQL)
database, deployed on Vercel Hobby (free tier, no credit card). GitHub Actions
used for all schema pushes and data seeding (Vercel's own build only serves
the app; it never runs migrations).

**Do not reintroduce these — both caused real multi-hour outages:**

- `api/index.ts` must be exactly:
  ```ts
  import { handle } from "hono/vercel";
  import app from "../server/boot.js";
  export default handle(app);
  ```
  Never add `export const config = { api: { bodyParser: false } }` back —
  that's a Next.js Pages Router artifact with zero meaning here, and its mere
  presence makes Vercel invoke the function with the legacy Node
  `(req, res) => void` convention instead of the Web-standard `fetch`
  convention Hono actually implements. Every route hangs identically
  (confirmed: even a trivial DB-free `ping` route hung) until Vercel's
  platform timeout, regardless of what the route does.
- Vercel env vars (`DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `ADMIN_PASSWORD`,
  `ADMIN_JWT_SECRET`) must be set for **all three** environments — Production,
  Preview, *and* Development — under Settings → Environment Variables. A
  Preview-only value once caused Vercel to silently query a completely
  different/stale point-in-time snapshot of the database (missing tables
  that definitely existed) while GitHub Actions, using the same secrets
  correctly scoped, saw the real, current schema. If anything ever looks
  like "the code is right but the data seems stale/wrong on the live site
  specifically," check env var environment-scoping first before assuming a
  DB or replication bug.
- All backend reads use **full-table `select()` with zero arguments**, then
  filter/sort/join in plain JS — not `.where()`, not `.innerJoin`/`.leftJoin`,
  not `.groupBy()`, not Drizzle's relational query API (`db.query.*`), not
  raw `sql` template columns. This was a defensive rewrite made while
  chasing what looked like query-shape-specific failures; it turned out the
  real cause was the env var issue above, not the query shape. But the
  rewrite works, every table here is small (low hundreds of rows at most),
  and reverting it back to targeted queries would be effort with no upside —
  leave this pattern in place and follow it for any new code.
- Writes (`insert`/`update`/`delete` keyed on a primary key `id`) were never
  part of the above issue and use normal Drizzle `.where(eq(table.id, x))`
  as usual.

**Secrets already configured, do not need to be touched:** `DATABASE_URL`,
`DATABASE_AUTH_TOKEN` (Turso, non-expiring token), `ADMIN_PASSWORD`,
`ADMIN_JWT_SECRET` — all set correctly in both GitHub Actions repo secrets
and Vercel env vars (all 3 environments) as of this writing.

## 3. Repo structure

```
api/index.ts              Vercel function entry (see above — do not modify lightly)
server/                   Hono app, tRPC routers, Drizzle connection
  boot.ts                 Hono app: file upload/serve routes + tRPC mount
  router.ts               tRPC root router (exam, practice, upload, comment, admin)
  exam-router.ts           Exams feature backend
  practice-router.ts       Drill feature backend
  middleware.ts            tRPC init + 8s universal timeout safety net
  queries/connection.ts    Turso client (forced HTTP transport, not auto-detected)
db/
  schema.ts                Drizzle schema — practicePassages/Questions/Choices/
                            PassageImages tables have a `subject` field, so
                            Physics/Chemistry/Geology/English all live in the
                            SAME tables as Biology, just filtered by subject.
  seed.ts                  Seeds Exams data (unrelated to Drill)
  seed-biology.ts          Seeds Drill Biology — USE AS THE TEMPLATE for any
                            new subject's seed script (copy + adapt)
  practice-biology.json    Biology passages/questions/choices/explanations
  practice-biology-images.json   Biology figure images, keyed by testCode
  verify-counts.ts         Reusable read-only diagnostic — run via a GitHub
                            Actions workflow_dispatch to check row counts
                            without needing direct DB/Vercel access
src/pages/
  PracticePicker.tsx        Drill subject tabs + passage list + completion checkmarks
  PracticeSession.tsx       Drill session: 50/50 passage/question layout,
                             inline figure rendering, next-passage flow
  ExamPicker.tsx / Exam.tsx / Results.tsx   Exams feature (untouched by Drill work)
src/lib/practiceProgress.ts  localStorage-based completion tracker (no user
                              accounts exist for Drill — same guest pattern as
                              Community's display name)
.github/workflows/
  db-setup.yml              drizzle-kit push + seeds Exams data. Triggers on
                             schema.ts / seed.ts changes.
  seed-practice.yml         Runs db:seed-biology. Triggers on db/practice-*.json
                             or seed-biology.ts changes. ADD A NEW STEP + path
                             trigger per new subject (see §5).
```

## 4. Drill subject status

| Subject | Status | Passages | Questions | Figures |
|---|---|---|---|---|
| Biology | ✅ Done, verified live | 68 | 525 | 56 images, 27 passages |
| Chemistry | 🟡 Files uploaded, not yet processed | — | — | — |
| Physics | ⬜ Not started, no files yet | — | — | — |
| Geology | ⬜ Not started, no files yet | — | — | — |
| English | ⬜ Mentioned once by Yassen, **no source material provided at all** — confirm what this actually is (likely a different source than "ACT Crack," ACT doesn't have a science-style English section) before doing any work |

**Chemistry specifically**: `ACT_Crack_Chemistry.pdf` (questions) and
`ACT_Crack_Chemistry_Answers.pdf` (answers) were uploaded in the conversation
that produced this handoff, and were mid-processing when it ended. **Files
uploaded in one conversation do not carry over to a new one** — Yassen will
need to re-upload both Chemistry PDFs (and eventually Physics/Geology/English
source files) at the start of the new chat before any processing can resume.

17 Biology questions were excluded entirely because their answer choices are
graphs/images rather than text (unrenderable as plain choice text) — expect
the same issue in Chemistry/Physics given how graph-heavy those sections
typically are; flag and exclude the same way, don't silently guess at a
description of the image.

## 5. Pipeline for adding a new Drill subject

This is the exact process used for Biology — repeat it for Chemistry, then
Physics/Geology once their files exist.

1. **Get both PDFs**: the questions PDF and the separate answers PDF (Shahd
   Gaber's material always splits these).
2. **Extract raw text**: `pdftotext -layout <file>.pdf out.txt` for both.
3. **Split into passages/tests**: regex on `\(Test \d+-?\d*\)` headings in the
   questions file to find passage boundaries; same pattern in the answers
   file to find `Question: N` / `Correct Answer: X` / `Explanation:` blocks
   per test.
4. **Match answers to questions** by `(test_code, question_number)`. Cross-
   check answers against passage logic where feasible; don't trust a source
   key blindly if it contradicts the passage's own data (this happened twice
   in earlier URT exam work, before Drill existed).
5. **Filter out image-choice questions**: any question whose 4 choices didn't
   extract as text (came through as blank/garbage — the actual content is an
   embedded image) gets excluded from the dataset. Note the exclusion count.
6. **Clean passage text** — this is the step that was missing for Biology's
   first pass and caused visibly broken, choppily-wrapped paragraphs. `pdftotext
   -layout` preserves the original PDF's hard line-wraps as literal `\n`
   characters; naively storing and rendering that (even with
   `whitespace-pre-wrap`) looks broken. Rejoin hard-wrapped lines into flowing
   paragraphs, while detecting genuine section headers (e.g. "Coevolution
   Hypothesis", "Study 1", "Experiment 2") as their own paragraph break using
   this heuristic: the line is short (≤6 words), doesn't end in `.?!:;,`,
   the *previous* line ends with `.!?` (a completed sentence), and the *next*
   line starts with a capital letter (a new sentence). Also handle the edge
   case where a header immediately follows a figure-caption line (see next
   step) — it won't have a normal "previous line" to check against, so fall
   back to a standalone check (short + capitalized + no ending punctuation)
   in that specific position.
7. **Extract figures**: `pdfimages -list <file>.pdf` lists every embedded
   image with page number and dimensions — filter to width>50 AND height>50
   to exclude thousands of tiny ~13×13px bullet/radio-button icons used next
   to answer choices (these vastly outnumber real figures). Build a
   page-number → test-code map from where each `(Test N-M)` heading falls in
   the page sequence (page breaks come through as `\f` form-feed characters
   in `pdftotext` output without `-layout`'s page markers stripped — extract
   with plain `pdftotext -layout` then split raw output on `\f`). Extract
   matching images via `pdfimages -j <file>.pdf prefix` (filenames are
   `prefix-NNN.ext`, where NNN is the same "num" column from `-list` — use
   that to correlate). Convert every extracted image to base64 PNG (PIL/
   Pillow: open → convert to RGB/L if needed → save as PNG → base64).
8. **Replace floating "Figure N" caption lines** in the cleaned passage text
   (they survive `pdftotext` as bare orphaned text mid-paragraph, since
   `pdftotext` can't render the image itself) with a literal `[[FIGURE]]`
   marker. The frontend (`PracticeSession.tsx`'s `PassageContent` component)
   splits on this exact string and renders the matched image inline.
9. **Build two JSON files**: `db/practice-{subject}.json` (array of
   `{subject, sourceLabel, testCode, orderIndex, bodyText, questions: [{number,
   text, correctAnswer, explanation, choices: [{label, text}]}]}`) and
   `db/practice-{subject}-images.json` (object keyed by testCode, each value
   an array of `{page, width, height, dataUrl}` in page+reading order — the
   seed script assigns them to a passage's `[[FIGURE]]` markers in that same
   order, 1:1, truncating if there are more images than markers).
10. **Copy `db/seed-biology.ts` to `db/seed-{subject}.ts`**, change the two
    `readFileSync` paths to the new subject's JSON files, and change the log
    strings. The upsert logic (match-by-testCode, match-by-number-within-
    passage, delete+reinsert choices/images) is subject-agnostic — no other
    changes needed. Add a `db:seed-{subject}` script to `package.json`.
11. **Add the new files to `seed-practice.yml`'s path trigger list** (or add a
    parallel job) so pushes to the new subject's JSON auto-seed it.
12. **Frontend**: `PracticePicker.tsx` has a hardcoded `SUBJECTS` array with
    name/icon/color per subject — add the new one there (pick a distinct
    accent color; Biology `#6B8F71`, Physics `#5B7FA6`, Chemistry `#C4843A`,
    Geology `#8B6F4E` are taken). `PracticeSession.tsx`'s `SUBJECT_COLORS`
    map needs the same addition. No other frontend changes needed — the
    passage/question/image rendering is fully subject-agnostic already.
13. **Push, then trigger workflows in order**: `db-setup.yml` only if
    `schema.ts` changed (it hasn't needed to for any subject after Biology —
    the tables are already generic); `seed-practice.yml` (or its per-subject
    job) to actually load the data. Verify with `db/verify-counts.ts` via a
    throwaway `workflow_dispatch` workflow that runs it and posts output as a
    commit comment (GitHub's own log viewer redirects to blob storage that
    isn't fetchable from the sandbox — posting results as a commit comment
    via `api.github.com` is the reliable way to read workflow output).

## 6. Style / theme (for consistency, not just Drill)

Warm cream/paper background (`var(--urt-paper)`), warm off-white card surface
(`var(--urt-surface)`), DM Serif Display for headings, Inter for body text.
Subject accent colors listed above. Platform is named **Anneal** in spirit/
branding discussions, though the live nav currently reads "URT Practice."

## 7. Known minor loose ends (non-blocking)

- `practice_choices` row count showed 2112 vs an expected 2100 (525
  questions × 4) after a re-seed — likely a small number of harmless orphaned
  rows from an earlier seed iteration before a question's ID was corrected.
  Never investigated further since `getPassage`/`checkAnswer` filter choices
  by current valid `questionId`, so orphaned rows can't surface in any real
  response. Worth a `DELETE FROM practice_choices WHERE question_id NOT IN
  (SELECT id FROM practice_questions)` cleanup someday, not urgent.
- Of 191 raw large images extracted from the Biology PDF, only 56 ended up
  used (matched to an actual `[[FIGURE]]` marker) — the rest are very likely
  the answer-choice images belonging to the 17 excluded image-choice
  questions, not real passage figures. This is expected, not a bug, but the
  same ratio will likely show up for other subjects — don't be alarmed if
  most extracted images go unused.
