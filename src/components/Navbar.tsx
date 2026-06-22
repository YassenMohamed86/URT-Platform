import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Sun, Moon, BookOpen } from "lucide-react";
import { useThemeStore } from "@/stores";

export default function Navbar() {
  const { isDark, toggle } = useThemeStore();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const bgClass = scrolled
    ? "bg-[var(--urt-surface)] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] border-b border-[var(--urt-border-subtle)]"
    : isHome
      ? "bg-transparent"
      : "bg-[var(--urt-surface)] border-b border-[var(--urt-border-subtle)]";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-16 z-50 transition-all duration-300 ${bgClass}`}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <BookOpen className="w-5 h-5 text-[var(--urt-accent)]" />
          <span
            className="text-xl font-normal tracking-tight"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif', color: "var(--urt-ink)" }}
          >
            URT Practice
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--urt-accent)] ml-1 align-top mt-1" />
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/community"
            className="text-sm transition-colors hover:text-[var(--urt-ink)]"
            style={{ color: "var(--urt-ink-light)" }}
          >
            Community Uploads
          </Link>
          <button
            onClick={toggle}
            className="p-2 rounded-full transition-all hover:bg-[var(--urt-accent-bg)]"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5" style={{ color: "var(--urt-ink)" }} />
            ) : (
              <Moon className="w-5 h-5" style={{ color: "var(--urt-ink)" }} />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
