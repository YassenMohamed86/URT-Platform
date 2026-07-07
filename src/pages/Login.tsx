import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/providers/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";

type Mode = "login" | "signup";

export default function Login() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showGuest, setShowGuest] = useState(false);
  const [guestName, setGuestName] = useState("");

  const loginMutation = trpc.auth.login.useMutation();
  const signupMutation = trpc.auth.signup.useMutation();
  const activeMutation = mode === "login" ? loginMutation : signupMutation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    try {
      const result =
        mode === "login"
          ? await loginMutation.mutateAsync({ email: email.trim(), password })
          : await signupMutation.mutateAsync({
              email: email.trim(),
              password,
              name: displayName.trim() || undefined,
            });
      setSession(result.token, result.user);
      navigate("/");
    } catch {
      // Surfaced below via activeMutation.error — nothing else to do here.
    }
  };

  const handleGuestContinue = () => {
    const trimmed = guestName.trim();
    if (trimmed) localStorage.setItem("urt_guest_name", trimmed);
    navigate("/");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "var(--urt-paper)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-8"
        style={{ backgroundColor: "var(--urt-surface)", borderColor: "var(--urt-border)" }}
      >
        {/* Mode toggle */}
        <div
          className="flex p-1 rounded-xl mb-7"
          style={{ backgroundColor: "var(--urt-paper)" }}
        >
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: mode === m ? "var(--urt-surface)" : "transparent",
                color: mode === m ? "var(--urt-ink)" : "var(--urt-ink-faint)",
                boxShadow: mode === m ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              }}
            >
              {m === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <h1
          className="text-2xl mb-2"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif', color: "var(--urt-ink)" }}
        >
          {mode === "login" ? "Welcome back" : "Join Anneal"}
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--urt-ink-light)" }}>
          {mode === "login"
            ? "Sign in to pick up your Drill progress on any device."
            : "Your progress follows you — study here, keep going on your phone."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Display name (optional)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border transition-colors"
              style={{ borderColor: "var(--urt-border)", color: "var(--urt-ink)" }}
            />
          )}

          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none border transition-colors"
            style={{ borderColor: "var(--urt-border)", color: "var(--urt-ink)" }}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none border transition-colors"
              style={{ borderColor: "var(--urt-border)", color: "var(--urt-ink)" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
              style={{ color: "var(--urt-ink-faint)" }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {activeMutation.error && (
            <p className="text-xs" style={{ color: "var(--urt-danger)" }}>
              {activeMutation.error.message}
            </p>
          )}

          <button
            type="submit"
            disabled={activeMutation.isPending || !email.trim() || password.length < 8}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: "var(--urt-accent)",
              color: "#fff",
              opacity: activeMutation.isPending ? 0.7 : 1,
            }}
          >
            {activeMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        {/* Guest fallback — no account required to use Drill; only Community
            posting benefits from a name at all. */}
        <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: "var(--urt-border-subtle)" }}>
          {!showGuest ? (
            <button
              onClick={() => setShowGuest(true)}
              className="text-xs underline"
              style={{ color: "var(--urt-ink-faint)" }}
            >
              Prefer not to make an account? Continue as guest
            </button>
          ) : (
            <div className="space-y-2.5 text-left">
              <input
                type="text"
                placeholder="Display name (optional, for Community)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGuestContinue()}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                style={{ borderColor: "var(--urt-border)", color: "var(--urt-ink)" }}
              />
              <button
                onClick={handleGuestContinue}
                className="w-full py-2.5 rounded-xl text-sm font-medium border"
                style={{ borderColor: "var(--urt-border)", color: "var(--urt-ink-light)" }}
              >
                {guestName.trim() ? "Save & Continue" : "Continue as Guest"}
              </button>
              <p className="text-xs text-center" style={{ color: "var(--urt-ink-faint)" }}>
                Note: guest progress only lives on this device.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
