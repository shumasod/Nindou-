import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadRecord, recordResult } from "../WinRecord.js";

// localStorage モック (Node 環境には存在しない)
function mockLocalStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() { return store.size; },
  } as Storage;
}

beforeEach(() => {
  vi.stubGlobal("localStorage", mockLocalStorage());
});

describe("WinRecord", () => {
  it("returns empty record when nothing is stored", () => {
    const rec = loadRecord();
    expect(rec).toEqual({ wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0 });
  });

  it("counts wins and builds a streak", () => {
    recordResult("win");
    recordResult("win");
    const rec = recordResult("win");
    expect(rec.wins).toBe(3);
    expect(rec.streak).toBe(3);
    expect(rec.bestStreak).toBe(3);
  });

  it("a loss resets the streak but keeps bestStreak", () => {
    recordResult("win");
    recordResult("win");
    const rec = recordResult("loss");
    expect(rec.losses).toBe(1);
    expect(rec.streak).toBe(0);
    expect(rec.bestStreak).toBe(2);
  });

  it("a draw does not affect the streak", () => {
    recordResult("win");
    const rec = recordResult("draw");
    expect(rec.draws).toBe(1);
    expect(rec.streak).toBe(1);
  });

  it("persists across loadRecord calls", () => {
    recordResult("win");
    recordResult("loss");
    const rec = loadRecord();
    expect(rec.wins).toBe(1);
    expect(rec.losses).toBe(1);
  });

  it("survives corrupted stored JSON", () => {
    localStorage.setItem("wrestling-win-record-v1", "{not json!");
    const rec = loadRecord();
    expect(rec).toEqual({ wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0 });
  });

  it("fills missing fields from partial stored data", () => {
    localStorage.setItem("wrestling-win-record-v1", JSON.stringify({ wins: 5 }));
    const rec = loadRecord();
    expect(rec.wins).toBe(5);
    expect(rec.losses).toBe(0);
    expect(rec.bestStreak).toBe(0);
  });

  it("does not throw when localStorage is unavailable", () => {
    vi.stubGlobal("localStorage", undefined);
    expect(() => loadRecord()).not.toThrow();
    expect(() => recordResult("win")).not.toThrow();
  });
});
