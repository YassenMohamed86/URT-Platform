// Tracks which practice passages have been fully completed (every question
// answered) in this browser. No server-side accounts exist for Drill practice
// (guest-based, like Community), so this lives in localStorage — consistent
// with how the guest display name is already stored (see Login.tsx).

const STORAGE_KEY = "urt_completed_passages";

function readCompletedSet(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function isPassageCompleted(passageId: number): boolean {
  return readCompletedSet().has(passageId);
}

export function markPassageCompleted(passageId: number): void {
  const set = readCompletedSet();
  set.add(passageId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // localStorage unavailable (private browsing, etc.) — fail silently,
    // completion tracking is a nice-to-have, not critical functionality.
  }
}

export function getCompletedPassageIds(): Set<number> {
  return readCompletedSet();
}
