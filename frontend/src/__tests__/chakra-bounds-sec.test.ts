import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";

function homeState(): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  return gameReducer(s, { type: "SET_NAME", name: "テスト" });
}

describe("チャクラ上下限 セキュリティテスト", () => {
  test("REST_AT_HOME でチャクラは maxChakra を超えない", () => {
    const s = homeState();
    const low: GameState = { ...s, player: { ...s.player, chakra: 1 } };
    const after = gameReducer(low, { type: "REST_AT_HOME" });
    expect(after.player.chakra).toBeLessThanOrEqual(after.player.maxChakra);
  });

  test("REST_AT_HOME の回復量は maxChakra の 50%", () => {
    const s = homeState();
    const empty: GameState = { ...s, player: { ...s.player, chakra: 0 } };
    const chakraAmt = Math.floor(s.player.maxChakra * 0.5);
    const after = gameReducer(empty, { type: "REST_AT_HOME" });
    expect(after.player.chakra).toBe(chakraAmt);
  });

  test("REST_AT_INN でチャクラは maxChakra まで回復", () => {
    const s = homeState();
    const empty: GameState = { ...s, player: { ...s.player, chakra: 0 } };
    const after = gameReducer(empty, { type: "REST_AT_INN" });
    expect(after.player.chakra).toBe(after.player.maxChakra);
  });

  test("REST_AT_HOME で満チャクラの場合は変化しない", () => {
    const s = homeState();
    const after = gameReducer(s, { type: "REST_AT_HOME" });
    expect(after.player.chakra).toBe(s.player.maxChakra);
  });
});
