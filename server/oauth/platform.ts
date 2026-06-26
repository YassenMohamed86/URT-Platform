import { env } from "../lib/env.js";
import type { UserProfile } from "./types.js";

async function platformRequest<T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<T | null> {
  const resp = await fetch(`${env.openUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  if (!resp.ok) {
    const text = await resp.text();
    console.warn(
      `[oauth] Request to ${path} failed (${resp.status}): ${text}`,
    );
    return null;
  }
  return resp.json() as Promise<T>;
}

export const users = {
  getProfile: (token: string) =>
    platformRequest<UserProfile>("/v1/users/me/profile", token),
};
