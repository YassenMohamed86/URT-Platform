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
  seed-physics.ts / seed-chemistry.ts   Same pattern, already done — copy
                            whichever is most recent for the next subject
  practice-biology.json    Biology passages/questions/choices/explanations
  practice-biology-images.json   Biology figure images, keyed by testCode
  practice-physics*.json / practice-chemistry*.json   Same pattern per subject
  verify-counts.ts         Reusable read-only diagnostic — run via a GitHub
                            Actions workflow_dispatch to check row counts
                            without needing direct DB/Vercel access. Includes
                            an images_by_subject breakdown, useful for
                            sanity-checking figure counts after a new seed.
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
  seed-practice.yml         Runs db:seed-biology, db:seed-physics, and
                             db:seed-chemistry as separate steps (each
                             continue-on-error, each posts its own failure as
                             a commit comment). Triggers on db/practice-*.json
                             or any seed-{subject}.ts changing. ADD A NEW STEP
                             + path trigger per new subject (see §5).
```

## 4. Drill subject status

| Subject | Status | Passages | Questions | Figures |
|---|---|---|---|---|
| Biology | ✅ Done, verified live | 68 | 525 | 54 images, used across 27 passages |
| Physics | ✅ Done, verified live | 36 | 274 | 60 images |
| Chemistry | ✅ Done, verified live | 52 | 310 | 85 images, 28 passages have ≥1 |
| Geology | ⬜ Not started — folder confirmed **empty** on Drive, source material may not exist yet |
| English | ⬜ Not started — Drive folder inaccessible (link-only sharing, not shared with the connected account); needs a re-share or direct upload before any work can start |

**Chemistry specifically** (done — for the next subject, read this before
starting, it'll save you re-discovering the same gotchas):

- Of the 55 tests in the answers PDF, 3 (**Tests 88, 98, 103**) have zero
  matching passage/question text anywhere in the questions PDF — not a
  different heading format, genuinely absent, verified by checking the exact
  line gap between the surrounding tests. Excluded entirely, same as any
  other "source doesn't have it" gap.
- **A misfiled answer-key block**: Test 58's Q7/Q8 explanations are
  physically printed *after* Test 87-2's Q10 in the answers PDF, with no
  header of their own — a pagination artifact in the original Word doc, not
  a new test. Answer-key parsing should never assume a block belongs to
  whatever test-header came most recently; when a test's question-number
  sequence goes non-monotonic (drops instead of increases), that's the
  signal something got misfiled — check by content, not just position.
- **Choice-marker layout is not always "one per line."** This source has: choice
  A merged onto the end of the stem with just one space before it
  (`...which: A. H2O was`); two choices sharing one line in a 2-column
  layout (`A .32.0 g      C. 8.0 g` / `B.16.0g      D. 4.0 g` — note also the
  stray space before some periods and the occasional lowercase OCR glitch
  like `b.` or `c.`); and choices merged at the *end* of a line (`H. S3 J.
  All mixtures...`). A pure "start of line" regex misses all of these.
  Fix: match a choice marker when preceded by either start-of-line OR any
  single space/tab (not requiring 2+), case-insensitive on the letter, then
  require the four matched labels to be exactly `{A,B,C,D}` or `{F,G,H,J}`
  — but pick the **first occurrence of each letter independently** rather
  than requiring them to appear in strict left-to-right order, since a
  2-column layout's raw reading order is A,C,B,D not A,B,C,D. Sort the
  chosen matches by position afterward to slice choice text correctly, then
  sort the output list by letter.
- **Answer-key-guided question boundaries need a trailing-edge safety
  check.** The questions PDF is usually pre-trimmed to only the
  answered-question range, but not always at the *end*: two tests (21-2,
  57) still had one extra unanswered question physically present after the
  last one Shahd explains, which will bleed into the last question's choice
  text unless you specifically scan for (and stop at) any further
  `^\d+\.` line before trusting "end of test section" as the boundary.
- **Not every embedded image has a `Figure N` caption — some are `Table N`,
  and Table captions are genuinely ambiguous**, unlike Figure captions
  (every `Figure N` caption in this source really is an unrenderable image,
  no exceptions found). Some tables are real images with a caption and
  nothing else following (blank all the way to the next caption/section);
  others have the exact same caption format but their data *does* exist as
  plain extracted text somewhere shortly after — sometimes immediately,
  sometimes after a paragraph or two of unrelated prose, sometimes with a
  spurious blank line in the middle of the row data itself. Heuristic that
  worked: collect tokens from right after the caption up to the first run
  of **2+ consecutive blank lines** (tolerating single blank lines within
  that block, e.g. between a header row and the data rows), and treat it as
  real text if that collected block has ≥3 tokens with ≥2 numeric ones —
  otherwise it's an image. Also watch for decimal-style captions
  (`Figure 4.3`, `TABLE 4.1 Functional Group Bonds`) in the more
  textbook-excerpt-flavored later tests, not just the plain-integer ACT
  style — and distinguish a true standalone caption from an inline sentence
  mention (`Figure 4.3 illustrates the relationship...`) by requiring any
  trailing text after the number to start with a capital letter (inline
  mentions continue with a lowercase verb).
- **Known gap, accepted rather than chased further**: a small number of
  tables have *zero* textual trace at all — no caption line, no data,
  referenced only inline mid-sentence (e.g. "...listed in Table 1.") with
  the actual table baked into an image that has its own caption text
  drawn *inside* the image itself, invisible to `pdftotext` entirely. These
  can't be found by any text-based heuristic; catching every one would mean
  visually auditing most of the document's ~140 embedded images by hand.
  Two confirmed instances (Test 2-2's Table 1, and its Table 2) were caught
  incidentally while debugging something else and fixed by hand; others
  likely remain. Not a correctness risk (nothing is mislabeled or wrong,
  some supplementary tables are just missing their visual), so it wasn't
  worth the time to hunt exhaustively — the explanations are written to be
  self-contained enough that this doesn't block understanding.
- Decorative icons aren't just the ~13×13 bullet points seen in Biology —
  this source also repeats a ~62×53 blank/white circle icon 135 times
  across the document. Filter that exact size out alongside the general
  width/height>50 rule, or it'll pollute the figure candidate list.
- A pasted-from-elsewhere page occasionally leaks a UI artifact into the
  text layer (a standalone `SUBMIT` line, from whatever quiz tool the
  source content was assembled in originally) — strip trailing `SUBMIT`
  tokens from cleaned choice/stem text.

17 Biology questions and 10 Chemistry questions were excluded because their
answer choices are graphs/images rather than text (unrenderable as plain
choice text) — expect the same issue in Physics/Geology given how graph-heavy
science sections typically are; flag and exclude the same way, don't silently
guess at a description of the image.

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
- Of the raw large images extracted from each subject's PDF, only a fraction
  end up used (matched to an actual `[[FIGURE]]` marker) — confirmed via
  `images_by_subject` in `verify-counts.ts` output: Biology 54, Physics 60,
  Chemistry 85. The rest are very likely answer-choice images belonging to
  excluded image-choice questions (see §4), not real passage figures. This
  is expected, not a bug — don't be alarmed if most extracted images go
  unused, and don't try to force every extracted image into a marker slot.
