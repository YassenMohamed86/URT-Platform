import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CommunityState {
  sessionId: string;
  votedUploads: Record<number, "up" | "down" | null>;
  setVote: (uploadId: number, voteType: "up" | "down" | null) => void;
}

const generateSessionId = () => {
  return "sess-" + Math.random().toString(36).substring(2, 15);
};

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
    {
      name: "urt-community",
    }
  )
);
