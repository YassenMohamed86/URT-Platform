import { create } from "zustand";

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
  // Session results
  results: ExamResult[];
  addResult: (result: ExamResult) => void;
  clearResults: () => void;

  // Current exam
  currentExam: {
    examType: string;
    difficulty: string;
    timeLimit: number;
  } | null;
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
