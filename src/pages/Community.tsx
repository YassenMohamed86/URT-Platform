import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Upload,
  ThumbsUp,
  ThumbsDown,
  Download,
  MessageSquare,
  X,
  Send,
  FileText,
  Filter,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCommunityStore } from "@/stores/communityStore";

const subjects = [
  "all",
  "english",
  "biology",
  "geology",
  "chemistry",
  "physics",
  "other",
];

export default function Community() {
  const [filterSubject, setFilterSubject] = useState("all");
  const [sortBy, setSortBy] = useState<"upvotes" | "newest" | "discussed">("upvotes");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { data: uploads, refetch } = trpc.upload.list.useQuery({
    subject: filterSubject === "all" ? undefined : filterSubject,
    sortBy,
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--urt-paper)" }}>
      <Navbar />

      <div className="max-w-[960px] mx-auto px-6 pt-24 pb-16">
        {/* Upload Area */}
        <button
          onClick={() => setShowUploadModal(true)}
          className="w-full rounded-xl border-2 border-dashed p-10 flex flex-col items-center transition-all hover:translate-y-[-1px]"
          style={{
            borderColor: "var(--urt-border)",
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--urt-accent)";
            e.currentTarget.style.backgroundColor = "var(--urt-accent-bg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--urt-border)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <Upload
            className="w-12 h-12 mb-3"
            style={{ color: "var(--urt-ink-faint)" }}
          />
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--urt-ink)" }}
          >
            Upload Material
          </h3>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--urt-ink-light)" }}
          >
            Share notes, practice questions, or study guides with the community.
          </p>
        </button>

        {/* Filter & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-10">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4" style={{ color: "var(--urt-ink-faint)" }} />
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setFilterSubject(s)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor:
                    filterSubject === s
                      ? "var(--urt-accent)"
                      : "var(--urt-border-subtle)",
                  color:
                    filterSubject === s ? "#fff" : "var(--urt-ink-light)",
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "upvotes" | "newest" | "discussed")
            }
            className="text-sm px-3 py-1.5 rounded-lg border outline-none"
            style={{
              borderColor: "var(--urt-border)",
              backgroundColor: "var(--urt-surface)",
              color: "var(--urt-ink)",
            }}
          >
            <option value="upvotes">Most Upvoted</option>
            <option value="newest">Newest</option>
            <option value="discussed">Most Discussed</option>
          </select>
        </div>

        {/* Uploads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {uploads?.map((upload) => (
            <UploadCard key={upload.id} upload={upload} onUpdate={refetch} />
          ))}
        </div>

        {uploads?.length === 0 && (
          <div className="text-center py-16">
            <FileText
              className="w-12 h-12 mx-auto mb-3"
              style={{ color: "var(--urt-ink-faint)" }}
            />
            <p style={{ color: "var(--urt-ink-light)" }}>
              No uploads yet. Be the first to share!
            </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function UploadCard({
  upload,
  onUpdate,
}: {
  upload: {
    id: number;
    title: string;
    description: string;
    subject: string;
    uploaderName: string;
    createdAt: Date;
    upvotes: number;
    downvotes: number;
    fileUrl: string;
    commentCount: number;
  };
  onUpdate: () => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const sessionId = useCommunityStore((s) => s.sessionId);
  const votedUploads = useCommunityStore((s) => s.votedUploads);
  const setVote = useCommunityStore((s) => s.setVote);

  const voteMutation = trpc.upload.vote.useMutation({
    onSuccess: (data) => {
      setVote(upload.id, data.userVote as "up" | "down" | null);
      onUpdate();
    },
  });

  const handleVote = (type: "up" | "down") => {
    voteMutation.mutate({ uploadId: upload.id, sessionId, voteType: type });
  };

  const userVote = (votedUploads[upload.id] as "up" | "down" | null | undefined) ?? null;

  return (
    <div
      className="rounded-xl border p-5 flex flex-col"
      style={{
        backgroundColor: "var(--urt-surface)",
        borderColor: "var(--urt-border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
      }}
    >
      {/* Subject badge */}
      <span
        className="self-start px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{
          backgroundColor: "var(--urt-accent-bg)",
          color: "var(--urt-accent)",
        }}
      >
        {upload.subject.charAt(0).toUpperCase() + upload.subject.slice(1)}
      </span>

      {/* Title */}
      <h4
        className="mt-3 text-base font-semibold truncate"
        style={{ color: "var(--urt-ink)" }}
        title={upload.title}
      >
        {upload.title}
      </h4>

      {/* Meta */}
      <p className="text-xs mt-1" style={{ color: "var(--urt-ink-light)" }}>
        {upload.uploaderName} ·{" "}
        {new Date(upload.createdAt).toLocaleDateString()}
      </p>

      {/* Description */}
      <p
        className="text-sm mt-2 line-clamp-2"
        style={{ color: "var(--urt-ink-light)" }}
      >
        {upload.description}
      </p>

      {/* Actions */}
      <div
        className="mt-4 pt-4 flex items-center justify-between border-t"
        style={{ borderColor: "var(--urt-border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVote("up")}
            className="flex items-center gap-1 text-xs transition-all"
            style={{
              color: userVote === "up" ? "var(--urt-accent)" : "var(--urt-ink-faint)",
            }}
          >
            <ThumbsUp className="w-4 h-4" />
            {upload.upvotes}
          </button>
          <button
            onClick={() => handleVote("down")}
            className="flex items-center gap-1 text-xs transition-all"
            style={{
              color: userVote === "down" ? "var(--urt-danger)" : "var(--urt-ink-faint)",
            }}
          >
            <ThumbsDown className="w-4 h-4" />
            {upload.downvotes}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 text-xs transition-all"
            style={{ color: "var(--urt-ink-faint)" }}
          >
            <MessageSquare className="w-4 h-4" />
            {upload.commentCount}
          </button>
          <a
            href={upload.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium transition-all"
            style={{ color: "var(--urt-accent)" }}
          >
            <Download className="w-4 h-4" />
            Download
          </a>
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <CommentsSection uploadId={upload.id} onUpdate={onUpdate} />
      )}
    </div>
  );
}

function CommentsSection({
  uploadId,
  onUpdate,
}: {
  uploadId: number;
  onUpdate: () => void;
}) {
  const { data: comments } = trpc.comment.listByUpload.useQuery({ uploadId });
  const createComment = trpc.comment.create.useMutation({
    onSuccess: () => onUpdate(),
  });
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    createComment.mutate(
      { uploadId, commenterName: name, commentText: text },
      {
        onSuccess: () => {
          setText("");
        },
      }
    );
  };

  return (
    <div
      className="mt-4 pt-4 border-t"
      style={{ borderColor: "var(--urt-border-subtle)" }}
    >
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {comments?.map((c) => (
          <div key={c.id} className="text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium" style={{ color: "var(--urt-ink)" }}>
                {c.commenterName}
              </span>
              <span className="text-xs" style={{ color: "var(--urt-ink-faint)" }}>
                {new Date(c.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-0.5" style={{ color: "var(--urt-ink-light)" }}>
              {c.commentText}
            </p>
          </div>
        ))}
        {comments?.length === 0 && (
          <p className="text-sm italic" style={{ color: "var(--urt-ink-faint)" }}>
            No comments yet.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-24 px-2.5 py-1.5 text-xs rounded-lg border outline-none"
          style={{
            borderColor: "var(--urt-border)",
            backgroundColor: "var(--urt-surface)",
            color: "var(--urt-ink)",
          }}
        />
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border outline-none"
          style={{
            borderColor: "var(--urt-border)",
            backgroundColor: "var(--urt-surface)",
            color: "var(--urt-ink)",
          }}
        />
        <button
          type="submit"
          className="p-1.5 rounded-lg transition-all"
          style={{ backgroundColor: "var(--urt-accent)" }}
        >
          <Send className="w-3.5 h-3.5 text-white" />
        </button>
      </form>
    </div>
  );
}

function UploadModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("english");
  const [customSubject, setCustomSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const createUpload = trpc.upload.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !title.trim() || !description.trim()) {
      setError("All fields are required.");
      return;
    }

    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-file", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }

      const finalSubject = subject === "custom" ? customSubject : subject;

      await createUpload.mutateAsync({
        uploaderName: name,
        title,
        description,
        subject: finalSubject,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
      });

      setSubmitted(true);
      setTimeout(() => onSuccess(), 1500);
    } catch {
      setError("Upload failed. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "var(--urt-overlay)" }}
      onClick={onClose}
    >
      <div
        className="max-w-lg w-full mx-4 rounded-xl p-8 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: "var(--urt-surface)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3
            className="text-xl font-semibold"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif', color: "var(--urt-ink)" }}
          >
            Upload Material
          </h3>
          <button onClick={onClose} style={{ color: "var(--urt-ink-faint)" }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "var(--urt-accent-bg)" }}
            >
              <CheckIcon className="w-6 h-6" style={{ color: "var(--urt-accent)" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--urt-ink)" }}>
              Your file has been submitted and is awaiting admin approval.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>
                Your Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border text-sm outline-none focus:border-[var(--urt-accent)]"
                style={{
                  borderColor: "var(--urt-border)",
                  backgroundColor: "var(--urt-surface)",
                  color: "var(--urt-ink)",
                }}
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>
                Subject *
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border text-sm outline-none"
                style={{
                  borderColor: "var(--urt-border)",
                  backgroundColor: "var(--urt-surface)",
                  color: "var(--urt-ink)",
                }}
              >
                <option value="english">English</option>
                <option value="biology">Biology</option>
                <option value="geology">Geology</option>
                <option value="chemistry">Chemistry</option>
                <option value="physics">Physics</option>
                <option value="custom">Custom category...</option>
              </select>
              {subject === "custom" && (
                <input
                  type="text"
                  placeholder="Enter custom category"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{
                    borderColor: "var(--urt-border)",
                    backgroundColor: "var(--urt-surface)",
                    color: "var(--urt-ink)",
                  }}
                />
              )}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>
                File Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border text-sm outline-none"
                style={{
                  borderColor: "var(--urt-border)",
                  backgroundColor: "var(--urt-surface)",
                  color: "var(--urt-ink)",
                }}
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full mt-1 px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                style={{
                  borderColor: "var(--urt-border)",
                  backgroundColor: "var(--urt-surface)",
                  color: "var(--urt-ink)",
                }}
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--urt-ink-faint)" }}>
                File (PDF only) *
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full mt-1 px-3 py-2 rounded-lg border text-sm file:mr-3 file:px-3 file:py-1 file:rounded-full file:border-0 file:text-xs file:font-medium"
                style={{
                  borderColor: "var(--urt-border)",
                  backgroundColor: "var(--urt-surface)",
                  color: "var(--urt-ink)",
                }}
              />
            </div>

            {error && (
              <p className="text-sm" style={{ color: "var(--urt-danger)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={createUpload.isPending}
              className="w-full h-12 rounded-full text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "var(--urt-ink)" }}
            >
              {createUpload.isPending ? "Uploading..." : "Submit"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function CheckIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
