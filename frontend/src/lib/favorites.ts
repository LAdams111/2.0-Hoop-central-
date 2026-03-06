import { useState, useEffect } from "react";

const FAVORITE_PLAYERS_KEY = "hoop-favorites";
const FAVORITE_TEAMS_KEY = "hoop-favorite-teams";

export function getFavoritePlayerIds(): number[] {
  try {
    const raw = localStorage.getItem(FAVORITE_PLAYERS_KEY) ?? "[]";
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getFavoriteTeamKeys(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITE_TEAMS_KEY) ?? "[]";
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function isPlayerFavorite(id: number): boolean {
  return getFavoritePlayerIds().includes(id);
}

export function isTeamFavorite(team: string, season: string): boolean {
  const key = `${team}|${season}`;
  return getFavoriteTeamKeys().includes(key);
}

export function togglePlayerFavorite(id: number): void {
  const arr = getFavoritePlayerIds();
  const next = arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
  localStorage.setItem(FAVORITE_PLAYERS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("storage"));
  window.dispatchEvent(new CustomEvent("hoop-favorites-changed"));
}

export function toggleTeamFavorite(team: string, season: string): void {
  const arr = getFavoriteTeamKeys();
  const key = `${team}|${season}`;
  const next = arr.includes(key) ? arr.filter((x) => x !== key) : [...arr, key];
  localStorage.setItem(FAVORITE_TEAMS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("storage"));
  window.dispatchEvent(new CustomEvent("hoop-favorites-changed"));
}

/** Re-renders when favorites change (same tab or storage event from another tab). Returns current ids and team keys. */
export function useFavoritesSnapshot() {
  const [, setSnap] = useState(0);
  useEffect(() => {
    const handler = () => setSnap((s) => s + 1);
    window.addEventListener("storage", handler);
    window.addEventListener("hoop-favorites-changed", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("hoop-favorites-changed", handler);
    };
  }, []);
  return { playerIds: getFavoritePlayerIds(), teamKeys: getFavoriteTeamKeys() };
}
