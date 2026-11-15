import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";

function homeState(): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  s = gameReducer(s, { type: "SET_NAME", name: "テスト" });
  return s;
}

describe("HP 上下限 セキュリティテスト", () => {
  test("REST_AT_HOME で HP は maxHp を超えない", () => {
    const s = homeState();
    const damagedState: GameState = { ...s, player: { ...s.player, hp: 1 } };
    const after = gameReducer(damagedState, { type: "REST_AT_HOME" });
    expect(after.player.hp).toBeLessThanOrEqual(after.player.maxHp);
  });

  test("REST_AT_HOME で満HP の場合 HP は変化しない", () => {
    const s = homeState();
    const after = gameReducer(s, { type: "REST_AT_HOME" });
    expect(after.player.hp).toBe(s.player.maxHp);
  });

  test("REST_AT_INN で HP は maxHp まで回復", () => {
    const s = homeState();
    const damagedState: GameState = { ...s, player: { ...s.player, hp: 10 } };
    const after = gameReducer(damagedState, { type: "REST_AT_INN" });
    expect(after.player.hp).toBe(after.player.maxHp);
  });

  test("REST_AT_HOME の回復量は maxHp の 30%", () => {
    const s = homeState();
    const damagedState: GameState = { ...s, player: { ...s.player, hp: 0 } };
    const healAmt = Math.floor(s.player.maxHp * 0.3);
    const after = gameReducer(damagedState, { type: "REST_AT_HOME" });
    expect(after.player.hp).toBe(healAmt);
  });
});
