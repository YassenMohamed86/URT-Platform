import { useState, useEffect, useRef, useCallback } from "react";
import { Clock, Play, Pause, RotateCcw, X, Timer } from "lucide-react";
import { useLocation } from "react-router";

export default function FloatingTimer() {
  const location = useLocation();
  const isExamPage = location.pathname.startsWith("/exam");

  const [isExpanded, setIsExpanded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [inputMin, setInputMin] = useState(25);
  const [inputSec, setInputSec] = useState(0);
  const [flashRed, setFlashRed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const isHidden = isExamPage;

  const playBeep = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.4);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.4 + 0.2);
        osc.start(ctx.currentTime + i * 0.4);
        osc.stop(ctx.currentTime + i * 0.4 + 0.2);
      }
    } catch {
      // Audio not available
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setFlashRed(true);
            playBeep();
            setTimeout(() => setFlashRed(false), 3000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, playBeep]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    setTimeLeft(inputMin * 60 + inputSec);
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(inputMin * 60 + inputSec);
  };

  if (isHidden) return null;

  return (
    <div
      className="fixed z-[1000] transition-all"
      style={{ bottom: 24, right: 24 }}
    >
      {/* Expanded */}
      {isExpanded && (
        <div
          className="mb-3 rounded-xl border p-5 w-[280px]"
          style={{
            backgroundColor: "var(--urt-surface)",
            borderColor: "var(--urt-border)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" style={{ color: "var(--urt-accent)" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>
                Study Timer
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded transition-all"
              style={{ color: "var(--urt-ink-faint)" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center mb-4">
            <span
              className={`text-4xl font-semibold tabular-nums ${flashRed ? "animate-pulse" : ""}`}
              style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                color: flashRed ? "var(--urt-danger)" : timeLeft < 60 ? "var(--urt-warning)" : "var(--urt-ink)",
              }}
            >
              {formatTime(timeLeft)}
            </span>
          </div>

          {!isRunning && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <input
                type="number"
                value={inputMin}
                onChange={(e) => setInputMin(Math.max(0, Math.min(180, parseInt(e.target.value) || 0)))}
                className="w-14 h-9 text-center text-sm rounded-lg border outline-none"
                style={{
                  borderColor: "var(--urt-border)",
                  backgroundColor: "var(--urt-surface)",
                  color: "var(--urt-ink)",
                }}
              />
              <span className="text-sm" style={{ color: "var(--urt-ink-light)" }}>min</span>
              <input
                type="number"
                value={inputSec}
                onChange={(e) => setInputSec(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className="w-14 h-9 text-center text-sm rounded-lg border outline-none"
                style={{
                  borderColor: "var(--urt-border)",
                  backgroundColor: "var(--urt-surface)",
                  color: "var(--urt-ink)",
                }}
              />
              <span className="text-sm" style={{ color: "var(--urt-ink-light)" }}>sec</span>
            </div>
          )}

          <div className="flex gap-2">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="flex-1 h-9 rounded-full text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                style={{ backgroundColor: "var(--urt-accent)" }}
              >
                <Play className="w-3.5 h-3.5" /> Start
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex-1 h-9 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-all border"
                style={{
                  borderColor: "var(--urt-border)",
                  color: "var(--urt-ink)",
                  backgroundColor: "var(--urt-surface)",
                }}
              >
                <Pause className="w-3.5 h-3.5" /> Pause
              </button>
            )}
            <button
              onClick={handleReset}
              className="flex-1 h-9 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-all border"
              style={{
                borderColor: "var(--urt-border)",
                color: "var(--urt-ink)",
                backgroundColor: "var(--urt-surface)",
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      )}

      {/* Collapsed pill */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-4 h-10 rounded-full border transition-all hover:translate-y-[-1px]"
          style={{
            backgroundColor: "var(--urt-surface)",
            borderColor: "var(--urt-border)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            color: flashRed ? "var(--urt-danger)" : "var(--urt-ink)",
          }}
        >
          <Clock className={`w-4 h-4 ${flashRed ? "animate-pulse" : ""}`} />
          <span className="text-sm font-medium tabular-nums">
            {formatTime(timeLeft)}
          </span>
        </button>
      )}
    </div>
  );
}
