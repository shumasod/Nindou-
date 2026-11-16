import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";

function stateWithStat(stat: "attack" | "defense" | "speed" | "stealth", value: number): GameState {
  return {
    ...INITIAL_STATE,
    player: {
      ...INITIAL_STATE.player,
      statPoints: 5,
      stats: { ...INITIAL_STATE.player.stats, [stat]: value },
    },
  };
}

describe("ステータス上限99 セキュリティテスト", () => {
  test("attack は 99 を超えない", () => {
    const after = gameReducer(stateWithStat("attack", 99), { type: "ALLOCATE_STAT", stat: "attack" });
    expect(after.player.stats.attack).toBeLessThanOrEqual(99);
  });

  test("defense は 99 を超えない", () => {
    const after = gameReducer(stateWithStat("defense", 99), { type: "ALLOCATE_STAT", stat: "defense" });
    expect(after.player.stats.defense).toBeLessThanOrEqual(99);
  });

  test("speed は 99 を超えない", () => {
    const after = gameReducer(stateWithStat("speed", 99), { type: "ALLOCATE_STAT", stat: "speed" });
    expect(after.player.stats.speed).toBeLessThanOrEqual(99);
  });

  test("stealth は 99 を超えない", () => {
    const after = gameReducer(stateWithStat("stealth", 99), { type: "ALLOCATE_STAT", stat: "stealth" });
    expect(after.player.stats.stealth).toBeLessThanOrEqual(99);
  });

  test("statPoints=0 では no-op", () => {
    const s = { ...INITIAL_STATE, player: { ...INITIAL_STATE.player, statPoints: 0, stats: { ...INITIAL_STATE.player.stats, attack: 20 } } };
    const after = gameReducer(s, { type: "ALLOCATE_STAT", stat: "attack" });
    expect(after.player.stats.attack).toBe(20);
    expect(after.player.statPoints).toBe(0);
  });
});
