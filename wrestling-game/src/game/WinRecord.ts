/**
 * 1P モードの戦績を localStorage に永続化する。
 * 2P ローカル対戦はカウントしない。
 */
export interface WinRecord {
  wins: number;
  losses: number;
  draws: number;
  streak: number;      // 現在の連勝数 (負けでリセット)
  bestStreak: number;
}

const STORAGE_KEY = "wrestling-win-record-v1";

function empty(): WinRecord {
  return { wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0 };
}

export function loadRecord(): WinRecord {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<WinRecord>;
    return {
      wins:       typeof parsed.wins       === "number" ? parsed.wins       : 0,
      losses:     typeof parsed.losses     === "number" ? parsed.losses     : 0,
      draws:      typeof parsed.draws      === "number" ? parsed.draws      : 0,
      streak:     typeof parsed.streak     === "number" ? parsed.streak     : 0,
      bestStreak: typeof parsed.bestStreak === "number" ? parsed.bestStreak : 0,
    };
  } catch {
    return empty();
  }
}

function save(rec: WinRecord): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rec));
  } catch {
    // localStorage 不可 (プライベートモード等) — 無視して続行
  }
}

export function recordResult(outcome: "win" | "loss" | "draw"): WinRecord {
  const rec = loadRecord();
  if (outcome === "win") {
    rec.wins++;
    rec.streak++;
    if (rec.streak > rec.bestStreak) rec.bestStreak = rec.streak;
  } else if (outcome === "loss") {
    rec.losses++;
    rec.streak = 0;
  } else {
    rec.draws++;
  }
  save(rec);
  return rec;
}
