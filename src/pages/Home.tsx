import { useState } from "react";
import { useNavigate } from "react-router";
import { BookOpen, Leaf, FlaskConical, ChevronRight, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import MeditativeParticles from "@/components/MeditativeParticles";
import { useExamStore } from "@/stores/examStore";

const exams = [
  {
    id: "english",
    name: "English",
    icon: BookOpen,
    time: 90,
    passages: 5,
    questions: 50,
    maxScore: 40,
    color: "#6B8F71",
  },
  {
    id: "biology_geology",
    name: "Biology \u0026 Geology",
    icon: Leaf,
    time: 90,
    passages: "5 bio + 4 geo",
    questions: 50,
    maxScore: 40,
    color: "#D4A03A",
  },
  {
    id: "chemistry_physics",
    name: "Chemistry \u0026 Physics",
    icon: FlaskConical,
    time: 90,
    passages: "5 chem + 5 phys",
    questions: 50,
    maxScore: 40,
    color: "#C44B4B",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { results } = useExamStore();
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [customTime, setCustomTime] = useState(90);
  const [difficulty, setDifficulty] = useState("all");

  const startExam = (examId: string) => {
    navigate(`/exam/${examId}?time=${customTime}&difficulty=${difficulty}`);
  };

  // Dashboard data
  const subjectColors: Record<string, string> = {
    english: "#6B8F71",
    biology_geology: "#D4A03A",
    chemistry_physics: "#C44B4B",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--urt-paper)" }}>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16">
        <MeditativeParticles />
        <h1
          className="text-center max-w-[800px] z-10"
          style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--urt-ink)",
          }}
        >
          Master Your University Readiness Test
        </h1>
        <p
          className="text-center max-w-[560px] mt-4 z-10"
          style={{
            fontSize: "1rem",
            lineHeight: 1.65,
            color: "var(--urt-ink-light)",
          }}
        >
          Practice in a realistic digital environment. Focused, timed, and built
          for Egyptian students.
        </p>
        <div className="mt-16 z-10 flex flex-col items-center gap-2">
          <div
            className="w-px h-12 animate-pulse"
            style={{ backgroundColor: "var(--urt-ink-faint)" }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{ backgroundColor: "var(--urt-accent)" }}
          />
        </div>
      </section>

      {/* Exam Cards */}
      <section
        className="px-6 py-20"
        style={{ backgroundColor: "var(--urt-paper)" }}
      >
        <div className="max-w-[960px] mx-auto">
          <p
            className="text-center mb-10 tracking-[0.08em] text-xs font-semibold uppercase"
            style={{ color: "var(--urt-ink-faint)" }}
          >
            Choose Your Exam
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exams.map((exam) => {
              const Icon = exam.icon;
              const isSelected = selectedExam === exam.id;
              return (
                <div
                  key={exam.id}
                  className="flex flex-col p-8 rounded-xl transition-all duration-300 cursor-pointer"
                  style={{
                    backgroundColor: "var(--urt-surface)",
                    border: `1px solid ${isSelected ? exam.color + "50" : "var(--urt-border)"}`,
                    boxShadow:
                      "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
                    transform: isSelected ? "translateY(-2px)" : "none",
                    minHeight: "280px",
                  }}
                  onClick={() => setSelectedExam(exam.id)}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: exam.color + "15" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: exam.color }} />
                  </div>
                  <h3
                    className="mt-4 text-lg font-semibold leading-tight"
                    style={{ color: "var(--urt-ink)" }}
                  >
                    {exam.name}
                  </h3>
                  <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--urt-ink-light)" }}
                  >
                    {exam.time} minutes · {exam.questions} questions
                  </p>
                  <div
                    className="my-5 w-full h-px"
                    style={{ backgroundColor: "var(--urt-border-subtle)" }}
                  />

                  {isSelected ? (
                    <div className="flex-1 flex flex-col gap-3">
                      <div>
                        <label
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "var(--urt-ink-faint)" }}
                        >
                          Time (min)
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCustomTime(Math.max(30, customTime - 5));
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                            style={{
                              backgroundColor: "var(--urt-border-subtle)",
                              color: "var(--urt-ink)",
                            }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={customTime}
                            onChange={(e) =>
                              setCustomTime(
                                Math.min(
                                  180,
                                  Math.max(30, parseInt(e.target.value) || 30)
                                )
                              )
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="w-14 h-8 text-center text-sm rounded-lg border outline-none"
                            style={{
                              borderColor: "var(--urt-border)",
                              backgroundColor: "var(--urt-surface)",
                              color: "var(--urt-ink)",
                            }}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCustomTime(Math.min(180, customTime + 5));
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                            style={{
                              backgroundColor: "var(--urt-border-subtle)",
                              color: "var(--urt-ink)",
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div>
                        <label
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "var(--urt-ink-faint)" }}
                        >
                          Difficulty
                        </label>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          {["all", "easy", "medium", "hard"].map((d) => (
                            <button
                              key={d}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDifficulty(d);
                              }}
                              className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                              style={{
                                backgroundColor:
                                  difficulty === d
                                    ? exam.color
                                    : "var(--urt-border-subtle)",
                                color:
                                  difficulty === d
                                    ? "#fff"
                                    : "var(--urt-ink-light)",
                              }}
                            >
                              {d.charAt(0).toUpperCase() + d.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startExam(exam.id);
                        }}
                        className="mt-auto w-full h-12 rounded-full text-white font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90"
                        style={{ backgroundColor: exam.color }}
                      >
                        Begin Exam
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExam(exam.id);
                      }}
                      className="mt-auto w-full h-12 rounded-full font-medium flex items-center justify-center transition-all"
                      style={{
                        backgroundColor: "var(--urt-ink)",
                        color: "var(--urt-surface)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = exam.color)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--urt-ink)")
                      }
                    >
                      Start Exam
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Personal Dashboard */}
      <section
        className="px-6 py-16 border-t"
        style={{
          backgroundColor: "var(--urt-surface)",
          borderColor: "var(--urt-border)",
        }}
      >
        <div className="max-w-[960px] mx-auto">
          <p
            className="text-xs font-semibold uppercase tracking-[0.08em] mb-8"
            style={{ color: "var(--urt-ink-faint)" }}
          >
            Your Session
          </p>

          {results.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <TrendingUp
                className="w-16 h-16 mb-4"
                style={{ color: "var(--urt-ink-faint)" }}
              />
              <p
                className="text-base"
                style={{ color: "var(--urt-ink-light)" }}
              >
                Complete an exam to see your performance here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Score Chart */}
              <div className="lg:col-span-3">
                <div
                  className="rounded-xl p-6 border"
                  style={{
                    backgroundColor: "var(--urt-surface)",
                    borderColor: "var(--urt-border)",
                  }}
                >
                  <h3
                    className="text-sm font-semibold mb-4"
                    style={{ color: "var(--urt-ink)" }}
                  >
                    Score History
                  </h3>
                  <ScoreChart results={results} colors={subjectColors} />
                </div>
              </div>

              {/* Summary Table */}
              <div className="lg:col-span-2">
                <div
                  className="rounded-xl p-6 border"
                  style={{
                    backgroundColor: "var(--urt-surface)",
                    borderColor: "var(--urt-border)",
                  }}
                >
                  <h3
                    className="text-sm font-semibold mb-4"
                    style={{ color: "var(--urt-ink)" }}
                  >
                    Recent Attempts
                  </h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {[...results].reverse().slice(0, 10).map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                        style={{ borderColor: "var(--urt-border-subtle)" }}
                      >
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--urt-ink)" }}
                          >
                            {r.subject}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "var(--urt-ink-faint)" }}
                          >
                            {new Date(r.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: subjectColors[r.examType] || "var(--urt-accent)" }}
                          >
                            {r.score.toFixed(1)}/{r.maxScore}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "var(--urt-ink-light)" }}
                          >
                            {r.percentage.toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-6 px-6 border-t text-center"
        style={{
          backgroundColor: "var(--urt-paper)",
          borderColor: "var(--urt-border)",
        }}
      >
        <p
          className="text-sm"
          style={{ color: "var(--urt-ink-faint)" }}
        >
          URT Practice Platform — Built for focused learning.
        </p>
      </footer>
    </div>
  );
}

function ScoreChart({
  results,
  colors,
}: {
  results: Array<{ examType: string; score: number; maxScore: number; date: string }>;
  colors: Record<string, string>;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || results.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };

    ctx.clearRect(0, 0, w, h);

    // Group by examType
    const grouped: Record<string, typeof results> = {};
    results.forEach((r) => {
      if (!grouped[r.examType]) grouped[r.examType] = [];
      grouped[r.examType].push(r);
    });

    const maxScore = Math.max(...results.map((r) => r.maxScore));

    // Draw axes
    ctx.strokeStyle = "var(--urt-border-subtle)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, h - padding.bottom);
    ctx.lineTo(w - padding.right, h - padding.bottom);
    ctx.stroke();

    // Draw Y labels
    ctx.fillStyle = "var(--urt-ink-faint)";
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const val = (maxScore / 4) * i;
      const y =
        h - padding.bottom - ((h - padding.top - padding.bottom) / maxScore) * val;
      ctx.fillText(val.toFixed(0), padding.left - 6, y + 3);
    }

    // Draw lines per subject
    Object.entries(grouped).forEach(([type, data]) => {
      const color = colors[type] || "var(--urt-accent)";
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((point, i) => {
        const x =
          padding.left +
          ((w - padding.left - padding.right) / Math.max(data.length - 1, 1)) *
            i;
        const y =
          h -
          padding.bottom -
          ((h - padding.top - padding.bottom) / maxScore) * point.score;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Draw points
      ctx.fillStyle = color;
      data.forEach((point, i) => {
        const x =
          padding.left +
          ((w - padding.left - padding.right) / Math.max(data.length - 1, 1)) *
            i;
        const y =
          h -
          padding.bottom -
          ((h - padding.top - padding.bottom) / maxScore) * point.score;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }, [results, colors]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: "200px" }}
    />
  );
}

import React from "react";
