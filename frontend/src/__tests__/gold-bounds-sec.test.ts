import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";

function homeState(): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  return gameReducer(s, { type: "SET_NAME", name: "テスト" });
}

describe("ゴールド下限 セキュリティテスト", () => {
  test("宿泊費が不足している場合 REST_AT_INN は no-op", () => {
    const s = homeState();
    const poor: GameState = { ...s, player: { ...s.player, gold: 0, hp: 50 } };
    const after = gameReducer(poor, { type: "REST_AT_INN" });
    expect(after.player.gold).toBe(0);
    expect(after.player.hp).toBe(50);
  });

  test("REST_AT_INN でゴールドが負にならない", () => {
    const s = homeState();
    const after = gameReducer(s, { type: "REST_AT_INN" });
    expect(after.player.gold).toBeGreaterThanOrEqual(0);
  });

  test("REST_AT_INN のコストは最低 10G", () => {
    const s = homeState();
    const full: GameState = { ...s, player: { ...s.player, hp: s.player.maxHp, chakra: s.player.maxChakra, gold: 100 } };
    const costBefore = full.player.gold;
    const after = gameReducer(full, { type: "REST_AT_INN" });
    const spent = costBefore - after.player.gold;
    expect(spent).toBeGreaterThanOrEqual(10);
  });

  test("満HP/チャクラでも REST_AT_INN は最低コストを消費", () => {
    const s = homeState();
    const full: GameState = { ...s, player: { ...s.player, hp: s.player.maxHp, chakra: s.player.maxChakra, gold: 1000 } };
    const after = gameReducer(full, { type: "REST_AT_INN" });
    expect(after.player.gold).toBe(1000 - 10);
  });
});
