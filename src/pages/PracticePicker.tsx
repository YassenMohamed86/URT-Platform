import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/Navbar";
import { getCompletedPassageIds } from "@/lib/practiceProgress";
import { FlaskConical, Leaf, Atom, Mountain, ChevronRight, BookOpen, AlertTriangle, CheckCircle2 } from "lucide-react";

const SUBJECTS = [
  { name: "Biology",   icon: Leaf,        color: "#6B8F71", bg: "rgba(107,143,113,0.08)" },
  { name: "Physics",   icon: Atom,        color: "#5B7FA6", bg: "rgba(91,127,166,0.08)"  },
  { name: "Chemistry", icon: FlaskConical, color: "#C4843A", bg: "rgba(196,132,58,0.08)"  },
  { name: "Geology",   icon: Mountain,    color: "#8B6F4E", bg: "rgba(139,111,78,0.08)"  },
];

export default function PracticePicker() {
  const navigate = useNavigate();
  const [activeSubject, setActiveSubject] = useState<string>("Biology");
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [localCompletedIds, setLocalCompletedIds] = useState<Set<number>>(new Set());

  // Refresh local completion state whenever this page is shown (e.g.
  // navigating back here after finishing a passage) so checkmarks stay
  // current. Server-side completion (signed-in users) comes from
  // listCompleted below and is merged in separately.
  useEffect(() => {
    setLocalCompletedIds(getCompletedPassageIds());
    const onFocus = () => setLocalCompletedIds(getCompletedPassageIds());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const {
    data: subjects = [],
    isLoading: subjectsLoading,
    error: subjectsError,
  } = trpc.practice.listSubjects.useQuery();

  const {
    data: passages = [],
    isLoading: passagesLoading,
    error: passagesError,
  } = trpc.practice.listPassages.useQuery(
    { subject: activeSubject },
    { enabled: !!activeSubject },
  );

  // No-ops server-side and returns [] when nobody's signed in, so this is
  // always safe to fire.
  const { data: serverCompletedIds = [] } = trpc.practice.listCompleted.useQuery();

  const completedIds = new Set<number>(localCompletedIds);
  for (const id of serverCompletedIds) completedIds.add(id);

  // Chapters are just the distinct sourceLabels within the active subject —
  // "ACT Crack Shahd Gaber" today, more added over time as other resources
  // come in. Order follows first appearance in the (already orderIndex-sorted) list.
  const chapters = Array.from(new Set(passages.map((p) => p.sourceLabel)));

  useEffect(() => {
    if (chapters.length > 0 && (!activeChapter || !chapters.includes(activeChapter))) {
      setActiveChapter(chapters[0]);
    }
  }, [chapters, activeChapter]);

  const visiblePassages = activeChapter
    ? passages.filter((p) => p.sourceLabel === activeChapter)
    : passages;

  const activeMeta = SUBJECTS.find((s) => s.name === activeSubject) ?? SUBJECTS[0];
  const anyError = subjectsError ?? passagesError;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--urt-paper)" }}>
      <Navbar />

      <div className="max-w-[960px] mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="mb-10">
          <p
            className="text-xs font-semibold uppercase tracking-[0.08em] mb-3"
            style={{ color: "var(--urt-ink-faint)" }}
          >
            Drill
          </p>
          <h1
            className="text-4xl mb-3"
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              color: "var(--urt-ink)",
              lineHeight: 1.15,
            }}
          >
            Subject Drill
          </h1>
          <p className="text-base" style={{ color: "var(--urt-ink-light)", maxWidth: 520 }}>
            Passage-by-passage practice with instant answer feedback and explanations. No timer,
            no pressure — just focused drilling.
          </p>
        </div>

        {/* Connection error banner — surfaces DB/config failures instead of silently showing empty state */}
        {anyError && (
          <div
            className="flex items-start gap-3 p-4 rounded-xl mb-6 border"
            style={{
              backgroundColor: "rgba(196,75,75,0.06)",
              borderColor: "rgba(196,75,75,0.25)",
            }}
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#C44B4B" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#C44B4B" }}>
                Couldn't load practice data
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--urt-ink-light)" }}>
                {anyError.message}
              </p>
            </div>
          </div>
        )}

        {/* Subject tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {SUBJECTS.map((s) => {
            const hasData = subjects.includes(s.name);
            const active = activeSubject === s.name;
            return (
              <button
                key={s.name}
                onClick={() => setActiveSubject(s.name)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border"
                style={{
                  backgroundColor: active ? s.bg : "transparent",
                  borderColor: active ? s.color : "var(--urt-border)",
                  color: active ? s.color : "var(--urt-ink-light)",
                  opacity: hasData || subjectsLoading ? 1 : 0.5,
                  cursor: hasData ? "pointer" : "default",
                }}
              >
                <s.icon className="w-4 h-4" />
                {s.name}
                {!subjectsLoading && !hasData && !anyError && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: "var(--urt-border)", color: "var(--urt-ink-faint)" }}
                  >
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Chapter tabs — a horizontal row, not cards, since this is a second,
            lighter-weight tier of navigation nested under the subject tabs
            above. "ACT Crack Shahd Gaber" is the only chapter today; more
            resources will show up here as additional tabs later. */}
        {chapters.length > 0 && (
          <div
            className="flex items-center gap-6 mb-7 border-b overflow-x-auto"
            style={{ borderColor: "var(--urt-border)" }}
          >
            {chapters.map((chapter) => {
              const active = chapter === activeChapter;
              return (
                <button
                  key={chapter}
                  onClick={() => setActiveChapter(chapter)}
                  className="relative whitespace-nowrap pb-3 text-sm transition-colors"
                  style={{
                    fontWeight: active ? 600 : 500,
                    color: active ? activeMeta.color : "var(--urt-ink-faint)",
                  }}
                >
                  {chapter}
                  {active && (
                    <span
                      className="absolute left-0 right-0 -bottom-px h-[2px] rounded-full"
                      style={{ backgroundColor: activeMeta.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Passage list */}
        {passagesError ? null : passagesLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-2xl animate-pulse"
                style={{ backgroundColor: "var(--urt-border)" }}
              />
            ))}
          </div>
        ) : visiblePassages.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed"
            style={{ borderColor: "var(--urt-border)", color: "var(--urt-ink-faint)" }}
          >
            <BookOpen className="w-10 h-10 mb-4 opacity-30" />
            <p className="text-sm font-medium">No passages yet</p>
            <p className="text-xs mt-1 opacity-70">
              {activeSubject} questions will appear here once imported
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visiblePassages.map((p, i) => (
              <button
                key={p.id}
                onClick={() => navigate(`/practice/session/${p.id}`)}
                className="group w-full text-left p-5 rounded-2xl border transition-all hover:shadow-sm"
                style={{
                  backgroundColor: "var(--urt-surface)",
                  borderColor: "var(--urt-border)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = activeMeta.color;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--urt-border)";
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: activeMeta.color }}
                      >
                        {p.testCode ?? `Passage ${i + 1}`}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: activeMeta.bg,
                          color: activeMeta.color,
                        }}
                      >
                        {p.questionCount} Q
                      </span>
                    </div>
                    <p
                      className="text-sm leading-relaxed line-clamp-2"
                      style={{ color: "var(--urt-ink-light)" }}
                    >
                      {p.preview}…
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                    {completedIds.has(p.id) && (
                      <CheckCircle2 className="w-5 h-5" style={{ color: "#6B8F71" }} />
                    )}
                    <ChevronRight
                      className="w-5 h-5 transition-transform group-hover:translate-x-0.5"
                      style={{ color: "var(--urt-ink-faint)" }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
