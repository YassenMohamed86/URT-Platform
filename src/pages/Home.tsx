import React from "react";
import { useNavigate } from "react-router";
import { BookOpen, TrendingUp, ChevronRight, Clock, Target, Users } from "lucide-react";
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

      {/* Mission: quote + origin story */}
      <section className="px-6 pt-20 pb-4 border-t" style={{ backgroundColor: "var(--urt-surface)", borderColor: "var(--urt-border)" }}>
        <div className="max-w-[720px] mx-auto text-center mb-20">
          <p
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: "clamp(1.35rem, 2.6vw, 1.75rem)",
              lineHeight: 1.5,
              fontStyle: "italic",
              color: "var(--urt-ink)",
            }}
          >
            Do your little bit of good where you are; it's those little bits of good put together that overwhelm the world.
          </p>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] mt-5" style={{ color: "var(--urt-ink-faint)" }}>
            Desmond Tutu
          </p>
        </div>

        <div className="max-w-[680px] mx-auto mb-20">
          <h2
            className="text-2xl md:text-3xl mb-6 text-center"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif', color: "var(--urt-ink)" }}
          >
            Why I built this
          </h2>
          <p className="mb-5" style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "var(--urt-ink-light)" }}>
            I built URT-Platform because I hate being distracted. When I'm trying to study something, the last thing I want to hear is "oh, you'll find that in this Drive," followed by "wait, that other thing's in a different Drive." I'm not searching through every Drive in the world just to study one subject. So I built a place that puts everything together, every subject, every resource, all in one spot.
          </p>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "var(--urt-ink-light)" }}>
            There's a more personal reason too, I've always preferred taking tests online over reading through PDFs. So instead of adding to the pile of PDFs already out there, I built somewhere you can move between subjects and resources and actually take tests the way they're meant to be taken, all in one place, and completely free.
          </p>
        </div>

        <div className="max-w-[960px] mx-auto pb-16">
          <h2
            className="text-2xl md:text-3xl mb-12 text-center"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif', color: "var(--urt-ink)" }}
          >
            So, what do we have over here?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <button
              onClick={() => navigate("/exams")}
              className="text-left w-full p-6 rounded-2xl border transition-colors hover:border-[var(--urt-accent)]"
              style={{ borderColor: "var(--urt-border)", backgroundColor: "var(--urt-paper)" }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "var(--urt-accent-bg)", color: "var(--urt-accent)" }}>
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--urt-ink)" }}>Exams</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--urt-ink-light)" }}>
                Every past exam I could personally get my hands on, in one place, timed, laid out in the same two-pane style as the real thing, so exam day doesn't throw anything unfamiliar at you. Missing one? Upload it through the Community page and it's there for everyone after you.
              </p>
            </button>

            <button
              onClick={() => navigate("/practice")}
              className="text-left w-full p-6 rounded-2xl border transition-colors hover:border-[var(--urt-accent)]"
              style={{ borderColor: "var(--urt-border)", backgroundColor: "var(--urt-paper)" }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "var(--urt-accent-bg)", color: "var(--urt-accent)" }}>
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--urt-ink)" }}>Drill</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--urt-ink-light)" }}>
                Five subjects, Biology, Chemistry, Physics, Geology, and English (sorry for math division :)). Every subject comes loaded with multiple resources, ACT Crack, E-Reading, and more coming soon hopefully, broken down passage by passage with instant feedback, so you actually know what you got wrong and why. It's all right here in your hands, so there's no excuse not to drill into them.
              </p>
            </button>

            <button
              onClick={() => navigate("/community")}
              className="text-left w-full p-6 rounded-2xl border transition-colors hover:border-[var(--urt-accent)]"
              style={{ borderColor: "var(--urt-border)", backgroundColor: "var(--urt-paper)" }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "var(--urt-accent-bg)", color: "var(--urt-accent)" }}>
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--urt-ink)" }}>Community</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--urt-ink-light)" }}>
                The other half of the "stop scattering my resources across fifty Drives" problem. Not everything's been turned into a digital test yet, so for whatever's left, Community is a shared library where you can just upload it yourself. It's built to outlast us, whatever gets added here sticks around for the classes that come after.
              </p>
            </button>
          </div>

          <p className="text-center text-sm italic mt-10" style={{ color: "var(--urt-ink-faint)" }}>
            Kind of the whole point of that quote up top, honestly, one small upload at a time.
          </p>
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
