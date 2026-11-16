import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";

function battleWithSkill(): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  s = gameReducer(s, { type: "SET_NAME", name: "テスト" });
  s = gameReducer(s, { type: "START_QUEST", questId: "q001" });
  s = gameReducer(s, {
    type: "START_BATTLE",
    enemyId: "forest_bandit",
    questId: "q001",
  });
  return { ...s, battle: { ...s.battle, enemy: { ...s.battle.enemy!, hp: 1000, maxHp: 1000 } } };
}

describe("ステータスエフェクト セキュリティテスト", () => {
  test("PLAYER_DEFEND で defending ステータスが付与される", () => {
    const s = battleWithSkill();
    const after = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(after.battle.playerStatus.some((e) => e.id === "defending")).toBe(true);
  });

  test("PLAYER_DEFEND で defending は 1 ターン", () => {
    const s = battleWithSkill();
    const after = gameReducer(s, { type: "PLAYER_DEFEND" });
    const def = after.battle.playerStatus.find((e) => e.id === "defending");
    expect(def?.turns).toBe(1);
  });

  test("PLAYER_DEFEND でチャクラが最大 8 回復", () => {
    const s = battleWithSkill();
    const chakraBefore = s.player.chakra;
    const after = gameReducer(s, { type: "PLAYER_DEFEND" });
    const gained = after.player.chakra - chakraBefore;
    expect(gained).toBeGreaterThanOrEqual(0);
    expect(gained).toBeLessThanOrEqual(8);
  });

  test("PLAYER_DEFEND でチャクラは maxChakra を超えない", () => {
    const s = battleWithSkill();
    const full: GameState = { ...s, player: { ...s.player, chakra: s.player.maxChakra } };
    const after = gameReducer(full, { type: "PLAYER_DEFEND" });
    expect(after.player.chakra).toBe(full.player.maxChakra);
  });
});
