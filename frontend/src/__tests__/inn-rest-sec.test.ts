import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";

function setupPlayer(): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
  return s;
}

describe("REST_AT_INN セキュリティテスト", () => {
  test("宿屋休息でHP・チャクラが全回復する", () => {
    let s = setupPlayer();
    s = { ...s, player: { ...s.player, hp: 1, chakra: 1, gold: 999 } };
    const after = gameReducer(s, { type: "REST_AT_INN" });
    expect(after.player.hp).toBe(after.player.maxHp);
    expect(after.player.chakra).toBe(after.player.maxChakra);
  });

  test("ゴールド不足の場合は状態変化しない", () => {
    let s = setupPlayer();
    s = { ...s, player: { ...s.player, hp: 1, chakra: 1, gold: 0 } };
    const after = gameReducer(s, { type: "REST_AT_INN" });
    expect(after.player.hp).toBe(1);
    expect(after.player.gold).toBe(0);
  });

  test("宿屋休息でゴールドが減少する", () => {
    let s = setupPlayer();
    const initialGold = 500;
    s = { ...s, player: { ...s.player, hp: 50, chakra: 20, gold: initialGold } };
    const after = gameReducer(s, { type: "REST_AT_INN" });
    expect(after.player.gold).toBeLessThan(initialGold);
    expect(after.player.gold).toBeGreaterThanOrEqual(0);
  });

  test("満HP・満チャクラ時も最低コストが発生する", () => {
    let s = setupPlayer();
    const fullGold = 999;
    s = { ...s, player: { ...s.player, hp: s.player.maxHp, chakra: s.player.maxChakra, gold: fullGold } };
    const after = gameReducer(s, { type: "REST_AT_INN" });
    // cost = Math.max(10, 0) = 10
    expect(after.player.gold).toBe(fullGold - 10);
  });

  test("ゴールドがマイナスにならない", () => {
    let s = setupPlayer();
    s = { ...s, player: { ...s.player, hp: 1, chakra: 1, gold: 9 } };
    const after = gameReducer(s, { type: "REST_AT_INN" });
    // cost > 9 なので休息不可
    expect(after.player.gold).toBeGreaterThanOrEqual(0);
  });

  test("HPが最大値を超えない", () => {
    let s = setupPlayer();
    s = { ...s, player: { ...s.player, hp: s.player.maxHp - 1, gold: 999 } };
    const after = gameReducer(s, { type: "REST_AT_INN" });
    expect(after.player.hp).toBeLessThanOrEqual(after.player.maxHp);
  });

  test("チャクラが最大値を超えない", () => {
    let s = setupPlayer();
    s = { ...s, player: { ...s.player, chakra: s.player.maxChakra - 1, gold: 999 } };
    const after = gameReducer(s, { type: "REST_AT_INN" });
    expect(after.player.chakra).toBeLessThanOrEqual(after.player.maxChakra);
  });
});
