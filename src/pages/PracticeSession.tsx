import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/Navbar";
import { ArrowLeft, ArrowRight, ChevronLeft, Lightbulb, CheckCircle2, XCircle } from "lucide-react";

type AnswerState = {
  selectedLabel: string;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string | null;
};

const SUBJECT_COLORS: Record<string, string> = {
  Biology:   "#6B8F71",
  Physics:   "#5B7FA6",
  Chemistry: "#C4843A",
  Geology:   "#8B6F4E",
};

export default function PracticeSession() {
  const { passageId } = useParams<{ passageId: string }>();
  const navigate = useNavigate();
  const id = parseInt(passageId ?? "0", 10);

  const { data: passage, isLoading, error } = trpc.practice.getPassage.useQuery(
    { id },
    { enabled: id > 0 },
  );

  const checkAnswerMutation = trpc.practice.checkAnswer.useMutation();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<Record<number, string>>({}); // questionId → selectedLabel
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({}); // questionId → result
  const [checking, setChecking] = useState(false);

  // Reset when passage changes
  useEffect(() => {
    setCurrentIdx(0);
    setSelected({});
    setAnswers({});
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--urt-paper)" }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--urt-accent)" }} />
            <p className="text-sm" style={{ color: "var(--urt-ink-faint)" }}>Loading passage…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !passage) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--urt-paper)" }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: "var(--urt-danger)" }}>Failed to load passage.</p>
        </div>
      </div>
    );
  }

  const accentColor = SUBJECT_COLORS[passage.subject] ?? "var(--urt-accent)";
  const questions = passage.questions;
  const currentQ = questions[currentIdx];
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;
  const currentSelected = currentQ ? selected[currentQ.id] : undefined;
  const isAnswered = !!currentAnswer;

  const handleSelect = (label: string) => {
    if (!currentQ || isAnswered) return;
    setSelected((prev) => ({ ...prev, [currentQ.id]: label }));
  };

  const handleCheck = async () => {
    if (!currentQ || !currentSelected || isAnswered || checking) return;
    setChecking(true);
    try {
      const result = await checkAnswerMutation.mutateAsync({
        questionId: currentQ.id,
        selectedLabel: currentSelected,
      });
      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: {
          selectedLabel: currentSelected,
          isCorrect: result.isCorrect,
          correctAnswer: result.correctAnswer,
          explanation: result.explanation,
        },
      }));
    } finally {
      setChecking(false);
    }
  };

  const getChoiceStyle = (label: string) => {
    const base: React.CSSProperties = {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      width: "100%",
      textAlign: "left",
      padding: "12px 16px",
      borderRadius: "10px",
      border: "1.5px solid var(--urt-border)",
      backgroundColor: "transparent",
      color: "var(--urt-ink)",
      fontSize: "0.9rem",
      lineHeight: 1.5,
      cursor: isAnswered ? "default" : "pointer",
      transition: "all 0.15s ease",
    };

    if (!isAnswered) {
      if (currentSelected === label) {
        return { ...base, borderColor: accentColor, backgroundColor: `${accentColor}14` };
      }
      return base;
    }

    // Answered state
    if (label === currentAnswer!.correctAnswer) {
      return {
        ...base,
        borderColor: "#6B8F71",
        backgroundColor: "rgba(107,143,113,0.10)",
        color: "#3d5e42",
        cursor: "default",
      };
    }
    if (label === currentAnswer!.selectedLabel && !currentAnswer!.isCorrect) {
      return {
        ...base,
        borderColor: "#C44B4B",
        backgroundColor: "rgba(196,75,75,0.08)",
        color: "#C44B4B",
        cursor: "default",
      };
    }
    return { ...base, opacity: 0.4, cursor: "default" };
  };

  const getNavDotStyle = (idx: number): React.CSSProperties => {
    const q = questions[idx];
    const ans = q ? answers[q.id] : undefined;
    const isCurrent = idx === currentIdx;

    if (isCurrent) {
      return {
        width: 28, height: 28, borderRadius: 8, fontSize: "0.7rem", fontWeight: 600,
        display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: accentColor, color: "#fff", cursor: "pointer", flexShrink: 0,
        border: "none",
      };
    }
    if (ans) {
      return {
        width: 28, height: 28, borderRadius: 8, fontSize: "0.7rem", fontWeight: 600,
        display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: ans.isCorrect ? "rgba(107,143,113,0.15)" : "rgba(196,75,75,0.10)",
        color: ans.isCorrect ? "#3d5e42" : "#C44B4B",
        cursor: "pointer", flexShrink: 0, border: "none",
      };
    }
    return {
      width: 28, height: 28, borderRadius: 8, fontSize: "0.7rem", fontWeight: 600,
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: "transparent",
      color: "var(--urt-ink-faint)",
      cursor: "pointer", flexShrink: 0,
      border: "1.5px solid var(--urt-border)",
    };
  };

  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.isCorrect).length;

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: "var(--urt-paper)" }}
    >
      {/* Top bar */}
      <div
        className="flex-shrink-0 flex items-center gap-4 px-5 border-b"
        style={{
          height: 56,
          backgroundColor: "var(--urt-surface)",
          borderColor: "var(--urt-border)",
        }}
      >
        <button
          onClick={() => navigate("/practice")}
          className="flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--urt-ink)]"
          style={{ color: "var(--urt-ink-light)" }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="h-4 w-px" style={{ backgroundColor: "var(--urt-border)" }} />

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: accentColor }}
          >
            {passage.subject}
          </span>
          {passage.testCode && (
            <>
              <span style={{ color: "var(--urt-border)" }}>·</span>
              <span className="text-xs" style={{ color: "var(--urt-ink-faint)" }}>
                {passage.testCode}
              </span>
            </>
          )}
          <span style={{ color: "var(--urt-border)" }}>·</span>
          <span className="text-xs" style={{ color: "var(--urt-ink-faint)" }}>
            {passage.sourceLabel}
          </span>
        </div>

        {answeredCount > 0 && (
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs flex items-center gap-1" style={{ color: "#6B8F71" }}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {correctCount}
            </span>
            <span className="text-xs flex items-center gap-1" style={{ color: "#C44B4B" }}>
              <XCircle className="w-3.5 h-3.5" />
              {answeredCount - correctCount}
            </span>
            <span className="text-xs" style={{ color: "var(--urt-ink-faint)" }}>
              {answeredCount}/{questions.length}
            </span>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left: Passage ── */}
        <div
          className="w-[42%] overflow-y-auto border-r hidden lg:block"
          style={{ backgroundColor: "var(--urt-paper)", borderColor: "var(--urt-border)" }}
        >
          <div className="p-8">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ color: "var(--urt-ink-faint)" }}
            >
              Passage
            </p>
            <div
              className="text-base leading-relaxed whitespace-pre-wrap"
              style={{ color: "var(--urt-ink)", lineHeight: 1.8, letterSpacing: "0.01em" }}
            >
              {passage.bodyText}
            </div>
          </div>
        </div>

        {/* ── Right: Question panel ── */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ backgroundColor: "var(--urt-surface)" }}
        >
          <div className="p-6 max-w-xl">

            {/* Mobile passage toggle */}
            <div className="lg:hidden mb-6">
              <details
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: "var(--urt-border)" }}
              >
                <summary
                  className="px-4 py-3 text-sm font-medium cursor-pointer"
                  style={{ color: "var(--urt-ink-light)", backgroundColor: "var(--urt-paper)" }}
                >
                  Show Passage
                </summary>
                <div
                  className="px-4 py-4 text-sm leading-relaxed whitespace-pre-wrap border-t"
                  style={{
                    color: "var(--urt-ink)",
                    borderColor: "var(--urt-border)",
                    backgroundColor: "var(--urt-paper)",
                  }}
                >
                  {passage.bodyText}
                </div>
              </details>
            </div>

            {/* Question navigator */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  style={getNavDotStyle(idx)}
                  onClick={() => setCurrentIdx(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Question */}
            {currentQ && (
              <div>
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: "var(--urt-ink-faint)" }}
                >
                  Question {currentIdx + 1} of {questions.length}
                </p>
                <p
                  className="text-base mb-5 leading-relaxed"
                  style={{ color: "var(--urt-ink)", lineHeight: 1.65 }}
                >
                  {currentQ.text}
                </p>

                {/* Choices */}
                <div className="flex flex-col gap-2.5">
                  {currentQ.choices.map((choice) => (
                    <button
                      key={choice.id}
                      style={getChoiceStyle(choice.label)}
                      onClick={() => handleSelect(choice.label)}
                    >
                      {/* Label badge */}
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold mt-0.5"
                        style={{
                          backgroundColor: (() => {
                            if (!isAnswered) {
                              return currentSelected === choice.label ? accentColor : "var(--urt-border)";
                            }
                            if (choice.label === currentAnswer!.correctAnswer) return "#6B8F71";
                            if (choice.label === currentAnswer!.selectedLabel && !currentAnswer!.isCorrect) return "#C44B4B";
                            return "var(--urt-border)";
                          })(),
                          color: (() => {
                            if (!isAnswered) return currentSelected === choice.label ? "#fff" : "var(--urt-ink-faint)";
                            if (choice.label === currentAnswer!.correctAnswer) return "#fff";
                            if (choice.label === currentAnswer!.selectedLabel && !currentAnswer!.isCorrect) return "#fff";
                            return "var(--urt-ink-faint)";
                          })(),
                        }}
                      >
                        {choice.label}
                      </span>
                      <span>{choice.text}</span>
                    </button>
                  ))}
                </div>

                {/* Check Answer button */}
                {!isAnswered && (
                  <button
                    onClick={handleCheck}
                    disabled={!currentSelected || checking}
                    className="mt-5 w-full py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: currentSelected ? accentColor : "var(--urt-border)",
                      color: currentSelected ? "#fff" : "var(--urt-ink-faint)",
                      cursor: currentSelected ? "pointer" : "not-allowed",
                      opacity: checking ? 0.7 : 1,
                    }}
                  >
                    {checking ? "Checking…" : "Check Answer"}
                  </button>
                )}

                {/* Result + Explanation */}
                {isAnswered && (
                  <div className="mt-5 space-y-3">
                    {/* Result banner */}
                    <div
                      className="flex items-center gap-2 px-4 py-3 rounded-xl"
                      style={{
                        backgroundColor: currentAnswer.isCorrect
                          ? "rgba(107,143,113,0.12)"
                          : "rgba(196,75,75,0.08)",
                        border: `1.5px solid ${currentAnswer.isCorrect ? "rgba(107,143,113,0.25)" : "rgba(196,75,75,0.20)"}`,
                      }}
                    >
                      {currentAnswer.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#6B8F71" }} />
                      ) : (
                        <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#C44B4B" }} />
                      )}
                      <p
                        className="text-sm font-medium"
                        style={{ color: currentAnswer.isCorrect ? "#3d5e42" : "#C44B4B" }}
                      >
                        {currentAnswer.isCorrect
                          ? "Correct!"
                          : `Incorrect — the correct answer is ${currentAnswer.correctAnswer}`}
                      </p>
                    </div>

                    {/* Explanation */}
                    {currentAnswer.explanation && (
                      <div
                        className="flex gap-3 px-4 py-4 rounded-xl"
                        style={{
                          backgroundColor: "rgba(212,160,58,0.07)",
                          border: "1.5px solid rgba(212,160,58,0.20)",
                        }}
                      >
                        <Lightbulb
                          className="w-4 h-4 flex-shrink-0 mt-0.5"
                          style={{ color: "#D4A03A" }}
                        />
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: "var(--urt-ink)", lineHeight: 1.65 }}
                        >
                          {currentAnswer.explanation}
                        </p>
                      </div>
                    )}

                    {!currentAnswer.explanation && (
                      <p className="text-xs" style={{ color: "var(--urt-ink-faint)" }}>
                        Explanation not available yet.
                      </p>
                    )}
                  </div>
                )}

                {/* Prev / Next navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t" style={{ borderColor: "var(--urt-border)" }}>
                  <button
                    onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                    disabled={currentIdx === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors"
                    style={{
                      color: currentIdx === 0 ? "var(--urt-ink-faint)" : "var(--urt-ink-light)",
                      backgroundColor: "transparent",
                      border: "1.5px solid var(--urt-border)",
                      cursor: currentIdx === 0 ? "not-allowed" : "pointer",
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </button>

                  {currentIdx < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIdx((i) => i + 1)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: accentColor,
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate("/practice")}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: accentColor,
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Done — Back to Passages
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
