import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";

function setupPlayer(): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
  return s;
}

describe("REST_AT_HOME セキュリティテスト", () => {
  test("HP回復量が正しい（maxHp の30%）", () => {
    const base = setupPlayer();
    const lowHp: GameState = { ...base, player: { ...base.player, hp: 1 } };
    const after = gameReducer(lowHp, { type: "REST_AT_HOME" });
    const expected = Math.min(base.player.maxHp, 1 + Math.floor(base.player.maxHp * 0.3));
    expect(after.player.hp).toBe(expected);
  });

  test("チャクラ回復量が正しい（maxChakra の50%）", () => {
    const base = setupPlayer();
    const lowCk: GameState = { ...base, player: { ...base.player, chakra: 0 } };
    const after = gameReducer(lowCk, { type: "REST_AT_HOME" });
    const expected = Math.min(base.player.maxChakra, Math.floor(base.player.maxChakra * 0.5));
    expect(after.player.chakra).toBe(expected);
  });

  test("HPが最大値を超えない", () => {
    const base = setupPlayer();
    const after = gameReducer(base, { type: "REST_AT_HOME" });
    expect(after.player.hp).toBeLessThanOrEqual(after.player.maxHp);
  });

  test("チャクラが最大値を超えない", () => {
    const base = setupPlayer();
    const after = gameReducer(base, { type: "REST_AT_HOME" });
    expect(after.player.chakra).toBeLessThanOrEqual(after.player.maxChakra);
  });

  test("ゴールドは変化しない", () => {
    const base = setupPlayer();
    const before = base.player.gold;
    const after = gameReducer(base, { type: "REST_AT_HOME" });
    expect(after.player.gold).toBe(before);
  });

  test("満HP・満チャクラ時も状態が返る（クラッシュしない）", () => {
    const base = setupPlayer();
    // 満HP・満チャクラで自宅休息
    const full: GameState = { ...base, player: { ...base.player, hp: base.player.maxHp, chakra: base.player.maxChakra } };
    const after = gameReducer(full, { type: "REST_AT_HOME" });
    expect(after.player.hp).toBe(full.player.maxHp);
    expect(after.player.chakra).toBe(full.player.maxChakra);
  });
});
