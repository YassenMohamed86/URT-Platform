import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Theme Store ───
interface ThemeState {
  isDark: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: false,
      toggle: () => {
        const next = !get().isDark;
        set({ isDark: next });
        if (next) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },
    }),
    { name: "urt-theme" }
  )
);

// ─── Exam Store ───
export interface ExamResult {
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

interface ExamState {
  results: ExamResult[];
  addResult: (result: ExamResult) => void;
  clearResults: () => void;
  currentExam: { examType: string; difficulty: string; timeLimit: number } | null;
  setCurrentExam: (exam: { examType: string; difficulty: string; timeLimit: number } | null) => void;
}

const loadResults = (): ExamResult[] => {
  try {
    const stored = sessionStorage.getItem("urt-results");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const useExamStore = create<ExamState>((set, get) => ({
  results: loadResults(),
  addResult: (result) => {
    const next = [...get().results, result];
    set({ results: next });
    sessionStorage.setItem("urt-results", JSON.stringify(next));
  },
  clearResults: () => {
    set({ results: [] });
    sessionStorage.removeItem("urt-results");
  },
  currentExam: null,
  setCurrentExam: (exam) => set({ currentExam: exam }),
}));

// ─── Community Store ───
interface CommunityState {
  sessionId: string;
  votedUploads: Record<number, "up" | "down" | null>;
  setVote: (uploadId: number, voteType: "up" | "down" | null) => void;
}

const generateSessionId = () =>
  "sess-" + Math.random().toString(36).substring(2, 15);

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      sessionId: generateSessionId(),
      votedUploads: {},
      setVote: (uploadId, voteType) => {
        set({
          votedUploads: { ...get().votedUploads, [uploadId]: voteType },
        });
      },
    }),
    { name: "urt-community" }
  )
);
