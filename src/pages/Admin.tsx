import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import {
  Shield,
  FileText,
  MessageSquare,
  Check,
  X,
  Trash2,
  LogOut,
  Users,
  BookOpen,
  Clock,
} from "lucide-react";

type Tab = "questions" | "uploads" | "comments";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("questions");

  useEffect(() => {
    const stored = sessionStorage.getItem("urt-admin-token");
    if (stored) setToken(stored);
  }, []);

  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: (data) => {
      setToken(data.token);
      sessionStorage.setItem("urt-admin-token", data.token);
      setError("");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ password });
  };

  const handleLogout = () => {
    setToken("");
    sessionStorage.removeItem("urt-admin-token");
  };

  if (!token) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--urt-paper)" }}
      >
        <div
          className="w-full max-w-sm rounded-xl border p-8"
          style={{
            backgroundColor: "var(--urt-surface)",
            borderColor: "var(--urt-border)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6" style={{ color: "var(--urt-accent)" }} />
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--urt-ink)" }}
            >
              Admin Panel
            </h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--urt-ink-faint)" }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border text-sm outline-none"
                style={{
                  borderColor: "var(--urt-border)",
                  backgroundColor: "var(--urt-surface)",
                  color: "var(--urt-ink)",
                }}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm" style={{ color: "var(--urt-danger)" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-11 rounded-full text-white text-sm font-medium transition-all"
              style={{ backgroundColor: "var(--urt-ink)" }}
            >
              {loginMutation.isPending ? "Checking..." : "Enter"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--urt-paper)" }}>
      {/* Header */}
      <div
        className="border-b px-6 py-4 flex items-center justify-between"
        style={{
          backgroundColor: "var(--urt-surface)",
          borderColor: "var(--urt-border)",
        }}
      >
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5" style={{ color: "var(--urt-accent)" }} />
          <h1 className="text-lg font-semibold" style={{ color: "var(--urt-ink)" }}>
            Admin Panel
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
          style={{
            border: "1px solid var(--urt-border)",
            color: "var(--urt-ink-light)",
          }}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-6">
        {/* Stats */}
        <StatsCards />

        {/* Tabs */}
        <div className="flex gap-6 mt-8 border-b" style={{ borderColor: "var(--urt-border)" }}>
          {([
            { key: "questions", label: "Questions", icon: FileText },
            { key: "uploads", label: "Uploads", icon: Clock },
            { key: "comments", label: "Comments", icon: MessageSquare },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 pb-3 text-sm font-medium transition-all"
                style={{
                  color: isActive ? "var(--urt-ink)" : "var(--urt-ink-light)",
                  borderBottom: isActive ? "2px solid var(--urt-accent)" : "2px solid transparent",
                }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "questions" && <QuestionsTab />}
          {activeTab === "uploads" && <UploadsTab />}
          {activeTab === "comments" && <CommentsTab />}
        </div>
      </div>
    </div>
  );
}

function StatsCards() {
  const { data: stats } = trpc.admin.getStats.useQuery();

  const cards = [
    { label: "Total Questions", value: stats?.totalQuestions ?? 0, icon: BookOpen, color: "var(--urt-accent)" },
    { label: "Total Uploads", value: stats?.totalUploads ?? 0, icon: FileText, color: "#D4A03A" },
    { label: "Pending", value: stats?.pendingUploads ?? 0, icon: Clock, color: "var(--urt-warning)" },
    { label: "Comments", value: stats?.totalComments ?? 0, icon: Users, color: "#6B8F71" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-xl border p-5 flex items-center gap-4"
            style={{
              backgroundColor: "var(--urt-surface)",
              borderColor: "var(--urt-border)",
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: card.color + "15" }}
            >
              <Icon className="w-5 h-5" style={{ color: card.color }} />
            </div>
            <div>
              <p className="text-2xl font-semibold" style={{ color: "var(--urt-ink)" }}>
                {card.value}
              </p>
              <p className="text-xs" style={{ color: "var(--urt-ink-light)" }}>
                {card.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QuestionsTab() {
  const { data: flaggedQuestions, refetch } = trpc.admin.getFlaggedQuestions.useQuery();

  const verifyMutation = trpc.admin.verifyQuestion.useMutation({
    onSuccess: () => refetch(),
  });

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold" style={{ color: "var(--urt-ink)" }}>Flagged Questions Review Queue</h3>
        <p className="text-sm" style={{ color: "var(--urt-ink-light)" }}>
          These questions were imported with unverified or flagged status. Review and verify them.
        </p>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--urt-border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--urt-paper)" }}>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>Subject</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>Passage</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>Question</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>Review Note</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flaggedQuestions?.map((q) => (
              <tr
                key={q.id}
                className="border-t transition-colors"
                style={{
                  borderColor: "var(--urt-border-subtle)",
                  backgroundColor: "var(--urt-surface)",
                }}
              >
                <td className="px-4 py-3 font-medium capitalize" style={{ color: "var(--urt-ink)" }}>
                  {q.subject}
                </td>
                <td className="px-4 py-3 max-w-[120px] truncate" style={{ color: "var(--urt-ink-light)" }}>
                  {q.passageTitle || `Passage ${q.passageNumber + 1}`}
                </td>
                <td className="px-4 py-3 max-w-[300px] truncate" style={{ color: "var(--urt-ink)" }} title={q.questionText}>
                  {q.questionText}
                </td>
                <td className="px-4 py-3 max-w-[200px]" style={{ color: "var(--urt-warning)" }}>
                  <div className="text-xs bg-[var(--urt-warning)]/10 p-2 rounded-lg">
                    {q.reviewNote || "Flagged for review"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      if (confirm("Mark this question as verified?")) {
                        verifyMutation.mutate({ id: q.id });
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:bg-[var(--urt-accent)] hover:text-white"
                    style={{ color: "var(--urt-accent)", border: "1px solid var(--urt-accent)" }}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Verify
                  </button>
                </td>
              </tr>
            ))}
            {(!flaggedQuestions || flaggedQuestions.length === 0) && (
              <tr>
                <td colSpan={5} className="text-center py-12" style={{ color: "var(--urt-ink-light)" }}>
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Check className="w-12 h-12 text-[var(--urt-accent)] opacity-50" />
                    <p>No flagged questions! The queue is clean.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UploadsTab() {
  const { data: pendingUploads, refetch: refetchPending } = trpc.admin.getPendingUploads.useQuery();
  const { data: allUploads, refetch: refetchAll } = trpc.admin.getAllUploads.useQuery();

  const approveMutation = trpc.admin.approveUpload.useMutation({
    onSuccess: () => { refetchPending(); refetchAll(); },
  });
  const rejectMutation = trpc.admin.rejectUpload.useMutation({
    onSuccess: () => { refetchPending(); refetchAll(); },
  });
  const deleteMutation = trpc.admin.deleteUpload.useMutation({
    onSuccess: () => { refetchPending(); refetchAll(); },
  });

  return (
    <div className="space-y-8">
      {/* Pending Uploads */}
      <div>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--urt-ink)" }}>
          <Clock className="w-4 h-4" style={{ color: "var(--urt-warning)" }} />
          Pending Approval ({pendingUploads?.length ?? 0})
        </h3>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--urt-border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--urt-paper)" }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>Uploader</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>Subject</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUploads?.map((u) => (
                <tr key={u.id} className="border-t" style={{ borderColor: "var(--urt-border-subtle)", backgroundColor: "var(--urt-surface)" }}>
                  <td className="px-4 py-3 max-w-[200px] truncate" style={{ color: "var(--urt-ink)" }}>{u.title}</td>
                  <td className="px-4 py-3" style={{ color: "var(--urt-ink-light)" }}>{u.uploaderName}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "var(--urt-accent-bg)", color: "var(--urt-accent)" }}>
                      {u.subject}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => approveMutation.mutate({ id: u.id })}
                        className="p-1.5 rounded transition-all hover:bg-[rgba(107,143,113,0.1)]"
                        style={{ color: "var(--urt-accent)" }}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate({ id: u.id })}
                        className="p-1.5 rounded transition-all hover:bg-[var(--urt-danger-bg)]"
                        style={{ color: "var(--urt-danger)" }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!pendingUploads || pendingUploads.length === 0) && (
                <tr>
                  <td colSpan={4} className="text-center py-6" style={{ color: "var(--urt-ink-light)" }}>
                    No pending uploads.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Uploads */}
      <div>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--urt-ink)" }}>
          All Uploads
        </h3>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--urt-border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--urt-paper)" }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>Votes</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUploads?.map((u) => (
                <tr key={u.id} className="border-t" style={{ borderColor: "var(--urt-border-subtle)", backgroundColor: "var(--urt-surface)" }}>
                  <td className="px-4 py-3 max-w-[250px] truncate" style={{ color: "var(--urt-ink)" }}>{u.title}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--urt-ink-light)" }}>
                    ↑{u.upvotes} ↓{u.downvotes}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        if (confirm("Delete this upload?")) {
                          deleteMutation.mutate({ id: u.id });
                        }
                      }}
                      className="p-1.5 rounded transition-all hover:bg-[var(--urt-danger-bg)]"
                      style={{ color: "var(--urt-danger)" }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CommentsTab() {
  const { data: allComments, refetch } = trpc.admin.getAllComments.useQuery();

  const deleteMutation = trpc.admin.deleteComment.useMutation({
    onSuccess: () => refetch(),
  });

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--urt-border)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: "var(--urt-paper)" }}>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>File</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>Commenter</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>Comment</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {allComments?.map((c) => (
            <tr key={c.id} className="border-t" style={{ borderColor: "var(--urt-border-subtle)", backgroundColor: "var(--urt-surface)" }}>
              <td className="px-4 py-3 max-w-[150px] truncate" style={{ color: "var(--urt-ink-light)" }}>{c.uploadTitle}</td>
              <td className="px-4 py-3" style={{ color: "var(--urt-ink)" }}>{c.commenterName}</td>
              <td className="px-4 py-3 max-w-[400px] truncate" style={{ color: "var(--urt-ink)" }}>{c.commentText}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => {
                    if (confirm("Delete this comment?")) {
                      deleteMutation.mutate({ id: c.id });
                    }
                  }}
                  className="p-1.5 rounded transition-all hover:bg-[var(--urt-danger-bg)]"
                  style={{ color: "var(--urt-danger)" }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
          {(!allComments || allComments.length === 0) && (
            <tr>
              <td colSpan={4} className="text-center py-6" style={{ color: "var(--urt-ink-light)" }}>
                No comments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    pending: { bg: "rgba(212,160,58,0.1)", color: "#D4A03A" },
    approved: { bg: "rgba(107,143,113,0.1)", color: "#6B8F71" },
    rejected: { bg: "rgba(196,75,75,0.1)", color: "#C44B4B" },
  };
  const c = colors[status] || colors.pending;
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: c.bg, color: c.color }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
