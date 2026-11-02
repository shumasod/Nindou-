import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";
function battleState(clan: "force" | "illusion" | "speed" = "force"): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan });
  s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
  return gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
}
describe("PLAYER_SKILL セキュリティテスト", () => {
  test("damageスキルで敵HPが減る", () => {
    const base = battleState("force");
    const hp = base.battle.enemy!.hp;
    const s = gameReducer(base, { type: "PLAYER_SKILL", skillId: "spin_slash" });
    expect(s.battle.enemy!.hp).toBeLessThan(hp);
  });
  test("buffスキルでステータスが付与される", () => {
    const base = battleState("speed");
    const s = gameReducer(base, { type: "PLAYER_SKILL", skillId: "flash_step" });
    expect(s.battle.playerStatus.length).toBeGreaterThan(0);
  });
  test("debuffスキルで混乱が付与される", () => {
    const base = { ...battleState("illusion"), player: { ...battleState("illusion").player, skills: ["phantom_clone", "confusion_jutsu"] } };
    const s = gameReducer(base, { type: "PLAYER_SKILL", skillId: "confusion_jutsu" });
    expect(s.battle.enemyStatus.some((e) => e.id === "confusion")).toBe(true);
  });
  test("dodgeスキルで回避が設定される", () => {
    const base = battleState("illusion");
    const s = gameReducer(base, { type: "PLAYER_SKILL", skillId: "phantom_clone" });
    expect(s.battle.playerDodge > 0 || s.battle.playerDodgeChance > 0 || s.battle.playerStatus.length > 0).toBe(true);
  });
  test("スキルのチャクラコストが消費される", () => {
    const base = battleState("force");
    const ck = base.player.chakra;
    const s = gameReducer(base, { type: "PLAYER_SKILL", skillId: "spin_slash" });
    expect(s.player.chakra).toBeLessThan(ck);
  });
  test("未所持スキルはno-op（ownership check）", () => {
    const base = battleState("force");
    const hp = base.battle.enemy!.hp;
    const s = gameReducer(base, { type: "PLAYER_SKILL", skillId: "confusion_jutsu" });
    expect(s.battle.enemy!.hp).toBe(hp);
  });
});
