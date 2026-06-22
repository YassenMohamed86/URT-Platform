import React from "react";
import { useNavigate } from "react-router";
import { BookOpen, TrendingUp, ChevronRight, Clock, ShieldCheck, Database } from "lucide-react";
import Navbar from "@/components/Navbar";
import MeditativeParticles from "@/components/MeditativeParticles";
import { useExamStore } from "@/stores";



export default function Home() {
  const navigate = useNavigate();
  const { results } = useExamStore();

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
          className="text-center max-w-[600px] mt-6 z-10"
          style={{
            fontSize: "1.05rem",
            lineHeight: 1.6,
            color: "var(--urt-ink-light)",
          }}
        >
          The University Readiness Test is a critical milestone for Egyptian students. We built this platform to provide a quiet, distraction-free space where you can take full-length practice exams, experience real time limits, and master the material that matters.
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

      {/* Overview / How it Works */}
      <section className="px-6 py-20 border-t" style={{ backgroundColor: "var(--urt-surface)", borderColor: "var(--urt-border)" }}>
        <div className="max-w-[960px] mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] mb-12 text-center" style={{ color: "var(--urt-ink-faint)" }}>
            Platform Overview
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border transition-colors hover:border-[var(--urt-accent)]" style={{ borderColor: "var(--urt-border)", backgroundColor: "var(--urt-paper)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "var(--urt-accent-bg)", color: "var(--urt-accent)" }}>
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--urt-ink)" }}>Realistic Constraints</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--urt-ink-light)" }}>
                Each practice test enforces the actual exam time limits. The timer doesn't stop, forcing you to develop the time-management skills critical for the real test day.
              </p>
            </div>
            
            <div className="p-6 rounded-2xl border transition-colors hover:border-[var(--urt-accent)]" style={{ borderColor: "var(--urt-border)", backgroundColor: "var(--urt-paper)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "var(--urt-accent-bg)", color: "var(--urt-accent)" }}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--urt-ink)" }}>Honest Evaluation</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--urt-ink-light)" }}>
                Answer keys are never sent to your browser during the test. Your submission is securely evaluated on our backend, ensuring your score reflects your actual ability without loopholes.
              </p>
            </div>

            <div className="p-6 rounded-2xl border transition-colors hover:border-[var(--urt-accent)]" style={{ borderColor: "var(--urt-border)", backgroundColor: "var(--urt-paper)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "var(--urt-accent-bg)", color: "var(--urt-accent)" }}>
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--urt-ink)" }}>Persistent Progress</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--urt-ink-light)" }}>
                Your exam history is saved directly on your device. You can track your scores over time in your dashboard—no complicated account registration needed to start practicing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Exam CTA */}
      <section
        className="px-6 py-20"
        style={{ backgroundColor: "var(--urt-paper)" }}
      >
        <div className="max-w-[960px] mx-auto text-center">
          <p
            className="mb-6 tracking-[0.08em] text-xs font-semibold uppercase"
            style={{ color: "var(--urt-ink-faint)" }}
          >
            Ready to start?
          </p>
          <button
            onClick={() => navigate("/exams")}
            className="px-8 py-4 rounded-full text-white font-medium inline-flex items-center gap-2 transition-all hover:scale-105 shadow-lg"
            style={{ backgroundColor: "var(--urt-accent)" }}
          >
            <BookOpen className="w-5 h-5" />
            Browse Practice Exams
            <ChevronRight className="w-5 h-5" />
          </button>
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
