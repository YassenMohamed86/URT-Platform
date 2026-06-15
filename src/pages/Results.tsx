import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Check, X, Minus, ChevronDown, ChevronUp, RotateCcw, Home } from "lucide-react";
import Navbar from "@/components/Navbar";

interface ResultData {
  examType: string;
  subject: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeTaken: number;
  totalQuestions: number;
  correctCount: number;
  answers: Record<number, string>;
  questions: {
    id: number;
    questionText: string;
    passageText: string;
    options: { A: string; B: string; C: string; D: string };
    correctAnswer: string;
    userAnswer: string | null;
    explanation: string | null;
    subject: string;
    passageNumber: number;
  }[];
  date: string;
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as ResultData | undefined;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!result) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--urt-paper)" }}
      >
        <div className="text-center">
          <p style={{ color: "var(--urt-ink-light)" }}>
            No results to display.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 h-11 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: "var(--urt-accent)" }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Split scores for combined exams
  const isCombined = result.examType !== "english";
  let scoreParts: { label: string; score: number; maxScore: number; count: number; total: number }[] = [];

  if (isCombined) {
    const firstSubject = result.examType === "biology_geology" ? "biology" : "chemistry";
    const secondSubject = result.examType === "biology_geology" ? "geology" : "physics";

    const firstQuestions = result.questions.filter((q) => q.subject === firstSubject);
    const secondQuestions = result.questions.filter((q) => q.subject === secondSubject);

    const firstCorrect = firstQuestions.filter((q) => q.userAnswer === q.correctAnswer).length;
    const secondCorrect = secondQuestions.filter((q) => q.userAnswer === q.correctAnswer).length;

    scoreParts = [
      {
        label: firstSubject.charAt(0).toUpperCase() + firstSubject.slice(1),
        score: Math.round((firstCorrect / firstQuestions.length) * 20 * 10) / 10,
        maxScore: 20,
        count: firstCorrect,
        total: firstQuestions.length,
      },
      {
        label: secondSubject.charAt(0).toUpperCase() + secondSubject.slice(1),
        score: Math.round((secondCorrect / secondQuestions.length) * 20 * 10) / 10,
        maxScore: 20,
        count: secondCorrect,
        total: secondQuestions.length,
      },
    ];
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--urt-paper)" }}>
      <Navbar />
      <div className="max-w-[800px] mx-auto px-6 pt-24 pb-16">
        {/* Score Header */}
        <div
          className="rounded-xl p-10 text-center border"
          style={{
            backgroundColor: "var(--urt-surface)",
            borderColor: "var(--urt-border)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
          }}
        >
          {isCombined ? (
            <div className="flex justify-center gap-8">
              {scoreParts.map((part, i) => (
                <ScoreRing
                  key={i}
                  score={part.score}
                  maxScore={part.maxScore}
                  label={part.label}
                  color={i === 0 ? "#6B8F71" : "#D4A03A"}
                  size={120}
                />
              ))}
            </div>
          ) : (
            <ScoreRing
              score={result.score}
              maxScore={result.maxScore}
              label={result.subject}
              color="#6B8F71"
              size={160}
            />
          )}

          {/* Stats Row */}
          <div className="flex justify-center gap-10 mt-8">
            <Stat label="Percentage" value={`${result.percentage.toFixed(0)}%`} />
            <Stat label="Time Taken" value={formatTime(result.timeTaken)} />
            <Stat label="Raw Score" value={`${result.correctCount}/${result.totalQuestions}`} />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => navigate("/")}
              className="px-6 h-11 rounded-full text-sm font-medium transition-all border"
              style={{
                backgroundColor: "var(--urt-surface)",
                color: "var(--urt-ink)",
                borderColor: "var(--urt-border)",
              }}
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Retake Exam
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 h-11 rounded-full text-sm font-medium text-white transition-all"
              style={{ backgroundColor: "var(--urt-ink)" }}
            >
              <Home className="w-4 h-4 inline mr-2" />
              Back to Home
            </button>
          </div>
        </div>

        {/* Question Review */}
        <div className="mt-12">
          <p
            className="text-xs font-semibold uppercase tracking-[0.08em] mb-6"
            style={{ color: "var(--urt-ink-faint)" }}
          >
            Question Review
          </p>

          <div className="space-y-4">
            {result.questions.map((q, i) => {
              const isCorrect = q.userAnswer === q.correctAnswer;
              const isSkipped = q.userAnswer === null;

              return (
                <ReviewCard
                  key={q.id}
                  index={i}
                  question={q}
                  isCorrect={isCorrect}
                  isSkipped={isSkipped}
                />
              );
            })}
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex justify-center gap-4 mt-10">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-6 h-11 rounded-full text-sm font-medium transition-all border"
            style={{
              backgroundColor: "var(--urt-surface)",
              color: "var(--urt-ink)",
              borderColor: "var(--urt-border)",
            }}
          >
            Back to Top
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 h-11 rounded-full text-sm font-medium text-white transition-all"
            style={{ backgroundColor: "var(--urt-ink)" }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreRing({
  score,
  maxScore,
  label,
  color,
  size,
}: {
  score: number;
  maxScore: number;
  label: string;
  color: string;
  size: number;
}) {
  const svgRef = useRef<SVGCircleElement>(null);
  const r = (size / 2) - 10;
  const circumference = 2 * Math.PI * r;
  const percentage = score / maxScore;

  useEffect(() => {
    if (svgRef.current) {
      svgRef.current.style.strokeDashoffset = `${circumference}`;
      requestAnimationFrame(() => {
        if (svgRef.current) {
          svgRef.current.style.transition = "stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)";
          svgRef.current.style.strokeDashoffset = `${circumference * (1 - percentage)}`;
        }
      });
    }
  }, [circumference, percentage]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--urt-border-subtle)"
            strokeWidth={6}
          />
          <circle
            ref={svgRef}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: circumference }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-semibold"
            style={{
              fontSize: size === 160 ? "2rem" : "1.5rem",
              color: "var(--urt-ink)",
            }}
          >
            {score.toFixed(1)}
          </span>
          <span className="text-sm" style={{ color: "var(--urt-ink-light)" }}>
            / {maxScore}
          </span>
        </div>
      </div>
      <span
        className="mt-2 text-xs uppercase tracking-wider font-medium"
        style={{ color: "var(--urt-ink-faint)" }}
      >
        {label}
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-wider font-medium mb-1" style={{ color: "var(--urt-ink-faint)" }}>
        {label}
      </p>
      <p className="text-2xl font-semibold" style={{ color: "var(--urt-ink)", fontFamily: '"DM Serif Display", Georgia, serif' }}>
        {value}
      </p>
    </div>
  );
}

function ReviewCard({
  index,
  question,
  isCorrect,
  isSkipped,
}: {
  index: number;
  question: ResultData["questions"][0];
  isCorrect: boolean;
  isSkipped: boolean;
}) {
  const [showExplanation, setShowExplanation] = useState(false);

  const statusBadge = isSkipped
    ? { text: "Not answered", bg: "rgba(212,160,58,0.1)", color: "#D4A03A" }
    : isCorrect
      ? { text: "Correct", bg: "rgba(107,143,113,0.1)", color: "#6B8F71" }
      : { text: "Incorrect", bg: "rgba(196,75,75,0.1)", color: "#C44B4B" };

  return (
    <div
      className="rounded-xl border p-6"
      style={{
        backgroundColor: "var(--urt-surface)",
        borderColor: "var(--urt-border)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{ backgroundColor: "var(--urt-accent-bg)", color: "var(--urt-accent)" }}
          >
            {index + 1}
          </div>
          <span className="text-xs" style={{ color: "var(--urt-ink-light)" }}>
            {question.subject.charAt(0).toUpperCase() + question.subject.slice(1)} — Passage {question.passageNumber}
          </span>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: statusBadge.bg, color: statusBadge.color }}
        >
          {statusBadge.text}
        </span>
      </div>

      {/* Question */}
      <p className="text-sm mb-4" style={{ color: "var(--urt-ink)" }}>
        {question.questionText}
      </p>

      {/* Options */}
      <div className="space-y-1.5">
        {(["A", "B", "C", "D"] as const).map((letter) => {
          const isCorrectAnswer = question.correctAnswer === letter;
          const isUserAnswer = question.userAnswer === letter;
          const isWrong = isUserAnswer && !isCorrect;

          let borderColor = "transparent";
          let bgColor = "transparent";
          let textDecoration = "none";

          if (isCorrectAnswer) {
            borderColor = "var(--urt-success)";
            bgColor = "rgba(107,143,113,0.06)";
          } else if (isWrong) {
            borderColor = "var(--urt-danger)";
            bgColor = "rgba(196,75,75,0.06)";
            textDecoration = "line-through";
          }

          return (
            <div
              key={letter}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm border-l-[3px]"
              style={{
                borderLeftColor: borderColor,
                backgroundColor: bgColor,
                textDecoration,
                color: isCorrectAnswer || isWrong ? "var(--urt-ink)" : "var(--urt-ink-light)",
              }}
            >
              <span className="font-medium w-5">{letter}</span>
              <span>{question.options[letter]}</span>
              {isCorrectAnswer && (
                <Check className="w-4 h-4 ml-auto" style={{ color: "var(--urt-success)" }} />
              )}
              {isWrong && (
                <X className="w-4 h-4 ml-auto" style={{ color: "var(--urt-danger)" }} />
              )}
              {isSkipped && isCorrectAnswer && (
                <Minus className="w-4 h-4 ml-auto" style={{ color: "var(--urt-warning)" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      {question.explanation && (
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="mt-4 text-sm font-medium flex items-center gap-1 transition-all"
          style={{ color: "var(--urt-accent)" }}
        >
          {showExplanation ? (
            <>
              Hide explanation <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show explanation <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
      {showExplanation && question.explanation && (
        <div
          className="mt-3 pl-3 py-2 text-sm border-l-2"
          style={{
            borderLeftColor: "var(--urt-accent)",
            color: "var(--urt-ink-light)",
          }}
        >
          {question.explanation}
        </div>
      )}
    </div>
  );
}
