import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import { AlertTriangle, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function ExamPicker() {
  const navigate = useNavigate();
  const { data: exams, isLoading, error } = trpc.exam.listExams.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--urt-surface)]">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin border-[var(--urt-accent)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--urt-surface)] text-[var(--urt-warning)]">
        Failed to load exams: {error.message}
      </div>
    );
  }

  const getUserFriendlyNote = (note: string) => {
    if (note.includes("only included questions 26-50")) {
      return "This practice exam focuses specifically on the Biology section.";
    }
    if (note.includes("question numbering resets")) {
      return "Note: Question numbering restarts at 1 for each new passage.";
    }
    return note;
  };

  const getFormattedTitle = (exam: any) => {
    if (!exam.subjects || exam.subjects.length === 0) return exam.title;
    const subjectsMap = exam.subjects.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1));
    const subjectString = subjectsMap.join(" and ");
    return `${subjectString} ${exam.year}`;
  };

  return (
    <div className="min-h-screen bg-[var(--urt-surface)]">
      <Navbar />
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif mb-2 text-[var(--urt-ink)]">Select an Exam</h1>
          <p className="text-[var(--urt-ink-light)] mb-12 text-lg">Choose a practice test below to begin.</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {exams?.map((exam) => (
            <div
              key={exam.id}
              className="group bg-[var(--urt-paper)] rounded-2xl p-6 border border-[var(--urt-border)] shadow-sm hover:shadow-md hover:border-[var(--urt-accent)] transition-all cursor-pointer relative overflow-hidden"
              onClick={() => navigate(`/exam/${exam.id}`)}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--urt-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-[var(--urt-ink)]">{getFormattedTitle(exam)}</h2>
                <div className="bg-[var(--urt-accent-bg)] text-[var(--urt-accent)] text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                  {exam.year}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {exam.note && (
                  <div className="flex items-start gap-2 text-sm text-[var(--urt-warning)] bg-[var(--urt-warning)]/10 p-3 rounded-lg">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{getUserFriendlyNote(exam.note)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-[var(--urt-border-subtle)]">
                <button
                  className="bg-[var(--urt-ink)] text-[var(--urt-surface)] hover:bg-[var(--urt-accent)] px-5 py-2.5 rounded-full text-sm font-medium transition-colors w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/exam/${exam.id}`);
                  }}
                >
                  Start Exam
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {exams?.length === 0 && (
          <div className="text-center py-24 border-2 border-dashed border-[var(--urt-border)] rounded-2xl">
            <BookOpen className="w-12 h-12 text-[var(--urt-border)] mx-auto mb-4" />
            <p className="text-[var(--urt-ink-light)] text-lg">No exams available yet.</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
