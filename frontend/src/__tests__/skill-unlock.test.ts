import { INITIAL_STATE, gameReducer } from "../components/KageNinden/reducer";
import { SKILL_UNLOCK } from "../components/KageNinden/data";
import { checkLevelUp } from "../components/KageNinden/reducer/helpers";
import type { GameState } from "../components/KageNinden/types";

function playerAtLevel(level: number, clan: string): GameState {
  return {
    ...INITIAL_STATE,
    player: {
      ...INITIAL_STATE.player,
      level,
      clan: clan as any,
      exp: 0,
      expToNext: 9999,
      skills: [],
    },
  };
}

function grantExp(state: GameState, exp: number): GameState {
  return {
    ...state,
    player: { ...state.player, exp },
  };
}

describe("SKILL_UNLOCK structure", () => {
  it("has 9 entries (3 per clan × 3 clans)", () => {
    expect(Object.keys(SKILL_UNLOCK)).toHaveLength(9);
  });

  it("each clan has exactly 3 skill unlock entries", () => {
    const counts: Record<string, number> = {};
    for (const cond of Object.values(SKILL_UNLOCK)) {
      counts[cond.clan] = (counts[cond.clan] ?? 0) + 1;
    }
    for (const c of Object.values(counts)) {
      expect(c).toBe(3);
    }
  });

  it("skill unlock levels are 1, 3, or 7", () => {
    const levels = new Set(Object.values(SKILL_UNLOCK).map((c) => c.level));
    expect(levels.has(1)).toBe(true);
    expect(levels.has(3)).toBe(true);
    expect(levels.has(7)).toBe(true);
  });
});

describe("checkLevelUp skill grants", () => {
  it("force clan gets spin_slash at level 1", () => {
    const state = playerAtLevel(1, "force");
    // Already level 1 with no exp, no level-up. Grant directly to simulate clan start.
    // The starter skill is added separately; checkLevelUp grants skills at threshold.
    // Set exp to trigger level 2 to confirm no double-grant, but check at lv1 first.
    const atLv1 = { ...state, player: { ...state.player, level: 0, exp: 100, expToNext: 100 } };
    const next = checkLevelUp(atLv1);
    expect(next.player.level).toBe(1);
    expect(next.player.skills).toContain("spin_slash");
  });

  it("illusion clan gets phantom_clone at level 1 via checkLevelUp", () => {
    const atLv0 = {
      ...INITIAL_STATE,
      player: {
        ...INITIAL_STATE.player,
        level: 0,
        exp: 100,
        expToNext: 100,
        clan: "illusion" as any,
        skills: [],
      },
    };
    const next = checkLevelUp(atLv0);
    expect(next.player.skills).toContain("phantom_clone");
  });

  it("speed clan gets flash_step at level 1 via checkLevelUp", () => {
    const atLv0 = {
      ...INITIAL_STATE,
      player: {
        ...INITIAL_STATE.player,
        level: 0,
        exp: 100,
        expToNext: 100,
        clan: "speed" as any,
        skills: [],
      },
    };
    const next = checkLevelUp(atLv0);
    expect(next.player.skills).toContain("flash_step");
  });

  it("force clan gets iron_stance when reaching level 3", () => {
    const atLv2 = {
      ...INITIAL_STATE,
      player: {
        ...INITIAL_STATE.player,
        level: 2,
        exp: 100,
        expToNext: 100,
        clan: "force" as any,
        skills: ["spin_slash"],
      },
    };
    const next = checkLevelUp(atLv2);
    expect(next.player.level).toBe(3);
    expect(next.player.skills).toContain("iron_stance");
  });

  it("does not grant skill if player has wrong clan", () => {
    const atLv2 = {
      ...INITIAL_STATE,
      player: {
        ...INITIAL_STATE.player,
        level: 2,
        exp: 100,
        expToNext: 100,
        clan: "illusion" as any,
        skills: [],
      },
    };
    const next = checkLevelUp(atLv2);
    expect(next.player.skills).not.toContain("iron_stance");
  });

  it("does not grant skill the player already has", () => {
    const atLv2 = {
      ...INITIAL_STATE,
      player: {
        ...INITIAL_STATE.player,
        level: 2,
        exp: 100,
        expToNext: 100,
        clan: "force" as any,
        skills: ["iron_stance"],
      },
    };
    const next = checkLevelUp(atLv2);
    const ironCount = next.player.skills.filter((s) => s === "iron_stance").length;
    expect(ironCount).toBe(1);
  });

  it("grants multiple skills if multiple thresholds are crossed", () => {
    const atLv0 = {
      ...INITIAL_STATE,
      player: {
        ...INITIAL_STATE.player,
        level: 0,
        exp: 10000,
        expToNext: 100,
        clan: "force" as any,
        skills: [],
      },
    };
    const next = checkLevelUp(atLv0);
    expect(next.player.skills).toContain("spin_slash");
    expect(next.player.skills).toContain("iron_stance");
    expect(next.player.skills).toContain("thousand_thrust");
  });

  it("sets levelUpPending when leveling up", () => {
    const atLv0 = {
      ...INITIAL_STATE,
      player: {
        ...INITIAL_STATE.player,
        level: 0,
        exp: 100,
        expToNext: 100,
        clan: "force" as any,
        skills: [],
      },
    };
    const next = checkLevelUp(atLv0);
    expect(next.ui.levelUpPending).toBe(true);
  });

  it("does not set levelUpPending when no level up occurs", () => {
    const state = playerAtLevel(5, "force");
    const next = checkLevelUp(state);
    expect(next.ui.levelUpPending).toBe(false);
  });
});
