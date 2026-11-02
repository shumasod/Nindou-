import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";
function setupBattle(): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
  s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
  return s;
}
describe("PLAYER_DEFEND セキュリティテスト", () => {
  test("phase='enemy'の時はno-op", () => {
    const base = setupBattle();
    const enemyPhase: GameState = { ...base, battle: { ...base.battle, phase: "enemy" } };
    const after = gameReducer(enemyPhase, { type: "PLAYER_DEFEND" });
    expect(after).toEqual(enemyPhase);
  });
  test("防御でdefendingステータスが付与される", () => {
    const base = setupBattle();
    const after = gameReducer(base, { type: "PLAYER_DEFEND" });
    expect(after.battle.playerStatus.some((e) => e.id === "defending")).toBe(true);
  });
  test("防御でチャクラが8回復する（低チャクラ時）", () => {
    const base = setupBattle();
    const lowCk: GameState = { ...base, player: { ...base.player, chakra: 0 } };
    const after = gameReducer(lowCk, { type: "PLAYER_DEFEND" });
    expect(after.player.chakra).toBe(8);
  });
  test("防御後phaseがenemyになる", () => {
    const base = setupBattle();
    const after = gameReducer(base, { type: "PLAYER_DEFEND" });
    expect(after.battle.phase).toBe("enemy");
  });
  test("チャクラが最大値を超えない", () => {
    const base = setupBattle();
    const fullCk: GameState = { ...base, player: { ...base.player, chakra: base.player.maxChakra } };
    const after = gameReducer(fullCk, { type: "PLAYER_DEFEND" });
    expect(after.player.chakra).toBeLessThanOrEqual(after.player.maxChakra);
  });
  test("連続防御でdefendingが重複しない", () => {
    let s = setupBattle();
    s = gameReducer(s, { type: "PLAYER_DEFEND" });
    s = { ...s, battle: { ...s.battle, phase: "player" } };
    s = gameReducer(s, { type: "PLAYER_DEFEND" });
    const count = s.battle.playerStatus.filter((e) => e.id === "defending").length;
    expect(count).toBe(1);
  });
});
