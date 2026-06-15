import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useExamStore } from "@/stores/examStore";
import { AlertTriangle } from "lucide-react";

interface Question {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string | null;
  subject: string;
  passageNumber: number;
  passageTitle: string | null;
  passageText: string;
  difficulty: string;
  skillTag: string | null;
}

export default function Exam() {
  const { type } = useParams<{ type: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const addResult = useExamStore((s) => s.addResult);

  const timeLimit = parseInt(searchParams.get("time") || "90");
  const difficulty = searchParams.get("difficulty") || "all";

  const { data: passageGroups, isLoading } = trpc.question.getByExam.useQuery({
    examType: type as "english" | "biology_geology" | "chemistry_physics",
    difficulty: difficulty as "all" | "easy" | "medium" | "hard",
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const [timerWarning, setTimerWarning] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const startTimeRef = useRef(Date.now());

  // Flatten questions from passage groups
  useEffect(() => {
    if (passageGroups) {
      const flat: Question[] = [];
      passageGroups.forEach((pg) => {
        pg.questions.forEach((q) => {
          flat.push({
            ...q,
            passageText: pg.passageText,
            passageTitle: pg.passageTitle,
            passageNumber: pg.passageNumber,
            subject: pg.subject,
          });
        });
      });
      setQuestions(flat);
    }
  }, [passageGroups]);

  // Timer
  useEffect(() => {
    if (examFinished || questions.length === 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setExamFinished(true);
          submitExam();
          return 0;
        }
        if (prev <= 300) setTimerWarning(true);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examFinished, questions.length]);

  // Hide shortcuts hint after 10s
  useEffect(() => {
    const t = setTimeout(() => setShowShortcuts(false), 10000);
    return () => clearTimeout(t);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (examFinished) return;
      const key = e.key.toLowerCase();

      if (["a", "b", "c", "d"].includes(key)) {
        e.preventDefault();
        selectAnswer(key.toUpperCase());
      } else if (key === "enter") {
        e.preventDefault();
        if (currentQIndex < questions.length - 1) {
          setCurrentQIndex((p) => p + 1);
        }
      } else if (key === "arrowleft") {
        e.preventDefault();
        if (currentQIndex > 0) setCurrentQIndex((p) => p - 1);
      } else if (key === "arrowright") {
        e.preventDefault();
        if (currentQIndex < questions.length - 1)
          setCurrentQIndex((p) => p + 1);
      } else if (key === "?") {
        setShowShortcuts((s) => !s);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentQIndex, questions.length, examFinished, answers]);

  const selectAnswer = useCallback(
    (letter: string) => {
      if (!questions[currentQIndex]) return;
      setAnswers((prev) => ({ ...prev, [questions[currentQIndex].id]: letter }));
    },
    [currentQIndex, questions]
  );

  const submitExam = useCallback(() => {
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });

    const rawScore = correct;
    const totalQuestions = questions.length;
    const maxScore =
      type === "english"
        ? 40
        : type === "biology_geology"
          ? 40
          : type === "chemistry_physics"
            ? 40
            : 40;
    const scaledScore = (rawScore / totalQuestions) * maxScore;
    const percentage = (rawScore / totalQuestions) * 100;

    const result = {
      examType: type || "",
      subject:
        type === "english"
          ? "English"
          : type === "biology_geology"
            ? "Biology & Geology"
            : "Chemistry & Physics",
      score: Math.round(scaledScore * 10) / 10,
      maxScore,
      percentage: Math.round(percentage * 10) / 10,
      timeTaken,
      totalQuestions,
      correctCount: correct,
      answers,
      questions: questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        passageText: q.passageText,
        options: {
          A: q.optionA,
          B: q.optionB,
          C: q.optionC,
          D: q.optionD,
        },
        correctAnswer: q.correctAnswer,
        userAnswer: answers[q.id] || null,
        explanation: q.explanation,
        subject: q.subject,
        passageNumber: q.passageNumber,
      })),
      date: new Date().toISOString(),
    };

    addResult(result);
    navigate("/results", { state: { result } });
  }, [questions, answers, type, addResult, navigate]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length && questions.length > 0;
  const currentQ = questions[currentQIndex];

  // Get current passage info
  const currentPassageGroup = passageGroups?.find(
    (pg) =>
      pg.subject === currentQ?.subject &&
      pg.passageNumber === currentQ?.passageNumber
  );

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--urt-paper)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "var(--urt-accent)", borderTopColor: "transparent" }}
          />
          <p style={{ color: "var(--urt-ink-light)" }}>Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--urt-paper)" }}
      >
        <p style={{ color: "var(--urt-ink-light)" }}>
          No questions found for this exam and difficulty.
        </p>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: "var(--urt-surface)" }}
    >
      {/* Top Bar */}
      <div
        className="h-12 flex items-center justify-between px-6 border-b shrink-0"
        style={{
          backgroundColor: "var(--urt-surface)",
          borderColor: "var(--urt-border)",
        }}
      >
        <span className="text-sm" style={{ color: "var(--urt-ink-light)" }}>
          {currentQ?.subject
            ? `${currentQ.subject.charAt(0).toUpperCase() + currentQ.subject.slice(1)} — Passage ${currentQ.passageNumber}`
            : ""}
        </span>
        <span
          className="text-sm font-medium"
          style={{ color: "var(--urt-ink)" }}
        >
          Question {currentQIndex + 1} of {questions.length}
        </span>
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: timerWarning
                ? "var(--urt-timer-warning)"
                : "var(--urt-nav-answered)",
            }}
          />
          <span
            className={`text-sm font-semibold tabular-nums ${timerWarning ? "animate-pulse" : ""}`}
            style={{
              color: timerWarning
                ? "var(--urt-timer-warning)"
                : "var(--urt-timer-normal)",
            }}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Passage Panel */}
        <div
          className="w-[42%] overflow-y-auto border-r hidden lg:block"
          style={{
            backgroundColor: "var(--urt-paper)",
            borderColor: "var(--urt-border)",
          }}
        >
          <div className="p-8">
            {currentPassageGroup?.passageTitle && (
              <h2
                className="text-xl mb-4"
                style={{
                  fontFamily: '"DM Serif Display", Georgia, serif',
                  color: "var(--urt-ink)",
                }}
              >
                {currentPassageGroup.passageTitle}
              </h2>
            )}
            <p
              className="text-sm uppercase tracking-wider mb-3 font-semibold"
              style={{ color: "var(--urt-ink-faint)" }}
            >
              Passage
            </p>
            <div
              className="text-base leading-relaxed whitespace-pre-wrap"
              style={{
                color: "var(--urt-ink)",
                lineHeight: 1.75,
                letterSpacing: "0.01em",
              }}
            >
              {currentQ?.passageText}
            </div>
          </div>
        </div>

        {/* Question Panel */}
        <div
          className="flex-1 overflow-y-auto lg:w-[38%]"
          style={{ backgroundColor: "var(--urt-surface)" }}
        >
          <div className="p-8 max-w-xl">
            {/* Mobile passage toggle */}
            <div className="lg:hidden mb-6">
              <details className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--urt-border)" }}>
                <summary
                  className="px-4 py-3 text-sm font-medium cursor-pointer"
                  style={{ color: "var(--urt-ink)", backgroundColor: "var(--urt-paper)" }}
                >
                  Show Passage
                </summary>
                <div className="p-4" style={{ backgroundColor: "var(--urt-paper)" }}>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--urt-ink)" }}>
                    {currentQ?.passageText}
                  </div>
                </div>
              </details>
            </div>

            {/* Question */}
            <div className="flex items-start gap-3 mb-6">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                style={{
                  backgroundColor: "var(--urt-accent-bg)",
                  color: "var(--urt-accent)",
                }}
              >
                {currentQIndex + 1}
              </div>
              <p
                className="text-lg font-medium leading-snug"
                style={{ color: "var(--urt-ink)" }}
              >
                {currentQ?.questionText}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {(["A", "B", "C", "D"] as const).map((letter) => {
                const isSelected =
                  answers[currentQ?.id || 0] === letter;
                const optionText = currentQ
                  ? currentQ[`option${letter}` as keyof Question]
                  : "";
                return (
                  <button
                    key={letter}
                    onClick={() => selectAnswer(letter)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-[1.5px] text-left transition-all duration-150 hover:translate-y-[-1px]"
                    style={{
                      borderColor: isSelected
                        ? "var(--urt-accent)"
                        : "var(--urt-border)",
                      backgroundColor: isSelected
                        ? "var(--urt-accent-bg-strong)"
                        : "var(--urt-surface)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 transition-all"
                      style={{
                        backgroundColor: isSelected
                          ? "var(--urt-accent)"
                          : "var(--urt-border-subtle)",
                        color: isSelected ? "#fff" : "var(--urt-ink-light)",
                      }}
                    >
                      {letter}
                    </div>
                    <span
                      className="text-base leading-snug"
                      style={{
                        color: "var(--urt-ink)",
                        fontWeight: isSelected ? 500 : 400,
                      }}
                    >
                      {optionText as string}
                    </span>
                    <span
                      className="ml-auto text-xs hidden md:block"
                      style={{ color: "var(--urt-ink-faint)" }}
                    >
                      Press {letter}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() =>
                  currentQIndex > 0 && setCurrentQIndex((p) => p - 1)
                }
                disabled={currentQIndex === 0}
                className="px-4 py-2 text-sm rounded-lg transition-all disabled:opacity-40"
                style={{ color: "var(--urt-ink-light)" }}
              >
                ← Previous
              </button>
              {allAnswered ? (
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="px-6 h-11 rounded-full text-white text-sm font-medium transition-all hover:translate-y-[-1px]"
                  style={{ backgroundColor: "var(--urt-accent)" }}
                >
                  Submit Exam
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="px-4 py-2 text-sm rounded-lg transition-all"
                  style={{ color: "var(--urt-ink-faint)" }}
                >
                  Submit Early
                </button>
              )}
              <button
                onClick={() =>
                  currentQIndex < questions.length - 1 &&
                  setCurrentQIndex((p) => p + 1)
                }
                disabled={currentQIndex === questions.length - 1}
                className="px-4 py-2 text-sm rounded-lg transition-all disabled:opacity-40"
                style={{ color: "var(--urt-ink-light)" }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Panel */}
        <div
          className="w-[20%] border-l overflow-y-auto hidden lg:block"
          style={{
            backgroundColor: "var(--urt-paper)",
            borderColor: "var(--urt-border)",
          }}
        >
          <div className="p-5">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ color: "var(--urt-ink-faint)" }}
            >
              Navigation
            </p>

            {/* Subject dividers */}
            {type !== "english" && (
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1" style={{ backgroundColor: "var(--urt-accent)" }} />
                <span className="text-xs font-medium" style={{ color: "var(--urt-accent)" }}>
                  {questions[0]?.subject === "biology" ? "Biology" : "Chemistry"}
                </span>
                <div className="h-px flex-1" style={{ backgroundColor: "var(--urt-accent)" }} />
              </div>
            )}

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, i) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = i === currentQIndex;

                // Subject divider in grid
                if (
                  type !== "english" &&
                  i > 0 &&
                  q.subject !== questions[i - 1].subject
                ) {
                  return (
                    <div key={`divider-${i}`} className="col-span-5 my-1">
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1" style={{ backgroundColor: "var(--urt-accent)" }} />
                        <span className="text-xs font-medium" style={{ color: "var(--urt-accent)" }}>
                          {q.subject === "geology" ? "Geology" : "Physics"}
                        </span>
                        <div className="h-px flex-1" style={{ backgroundColor: "var(--urt-accent)" }} />
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQIndex(i)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium transition-all"
                    style={{
                      backgroundColor: isCurrent
                        ? "var(--urt-nav-current)"
                        : isAnswered
                          ? "var(--urt-nav-answered)"
                          : "var(--urt-nav-unanswered)",
                      color: isCurrent || isAnswered ? "#fff" : "var(--urt-ink-light)",
                      border: isCurrent
                        ? "2px solid var(--urt-accent)"
                        : isAnswered
                          ? "1.5px solid var(--urt-nav-answered)"
                          : "1.5px solid var(--urt-border)",
                      boxShadow: isCurrent
                        ? "0 0 0 2px var(--urt-accent-bg-strong)"
                        : "none",
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 flex items-center gap-4 text-xs" style={{ color: "var(--urt-ink-faint)" }}>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full border"
                  style={{ borderColor: "var(--urt-border)", backgroundColor: "var(--urt-nav-unanswered)" }}
                />
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "var(--urt-nav-answered)" }}
                />
                <span>Answered</span>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: "var(--urt-ink-light)" }}>
                <span>Progress</span>
                <span>{answeredCount}/{questions.length}</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--urt-border)" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(answeredCount / questions.length) * 100}%`,
                    backgroundColor: "var(--urt-nav-answered)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div
        className="lg:hidden h-14 border-t overflow-x-auto flex items-center gap-1.5 px-3 shrink-0"
        style={{
          backgroundColor: "var(--urt-paper)",
          borderColor: "var(--urt-border)",
        }}
      >
        {questions.map((q, i) => {
          const isAnswered = !!answers[q.id];
          const isCurrent = i === currentQIndex;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentQIndex(i)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-all"
              style={{
                backgroundColor: isCurrent
                  ? "var(--urt-nav-current)"
                  : isAnswered
                    ? "var(--urt-nav-answered)"
                    : "var(--urt-nav-unanswered)",
                color: isCurrent || isAnswered ? "#fff" : "var(--urt-ink-light)",
                border: isCurrent
                  ? "2px solid var(--urt-accent)"
                  : isAnswered
                    ? "1.5px solid var(--urt-nav-answered)"
                    : "1.5px solid var(--urt-border)",
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Keyboard shortcuts hint */}
      {showShortcuts && !examFinished && (
        <div
          className="fixed bottom-16 lg:bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs z-40"
          style={{
            backgroundColor: "var(--urt-paper)",
            color: "var(--urt-ink-faint)",
            border: "1px solid var(--urt-border)",
          }}
        >
          A/B/C/D: Select · Enter: Next · ← →: Navigate · ? for help
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "var(--urt-overlay)" }}
          onClick={() => setShowSubmitConfirm(false)}
        >
          <div
            className="max-w-md w-full mx-4 rounded-xl p-8"
            style={{
              backgroundColor: "var(--urt-surface)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6" style={{ color: "var(--urt-warning)" }} />
              <h3
                className="text-lg font-semibold"
                style={{ color: "var(--urt-ink)" }}
              >
                Submit Exam?
              </h3>
            </div>
            {!allAnswered && (
              <p className="text-sm mb-6" style={{ color: "var(--urt-ink-light)" }}>
                You have {questions.length - answeredCount} unanswered
                {questions.length - answeredCount === 1
                  ? " question"
                  : " questions"}
                . Are you sure you want to submit?
              </p>
            )}
            {allAnswered && (
              <p className="text-sm mb-6" style={{ color: "var(--urt-ink-light)" }}>
                All questions answered. Ready to submit?
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 h-11 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: "var(--urt-border-subtle)",
                  color: "var(--urt-ink)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSubmitConfirm(false);
                  setExamFinished(true);
                  submitExam();
                }}
                className="flex-1 h-11 rounded-full text-white text-sm font-medium transition-all"
                style={{ backgroundColor: "var(--urt-accent)" }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
