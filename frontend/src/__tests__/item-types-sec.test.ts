import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";
function battleWithItem(itemId: string, count: number = 1): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
  s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
  return { ...s, player: { ...s.player, hp: Math.floor(s.player.maxHp * 0.5), items: [{ id: itemId, count }] } };
}
describe("PLAYER_ITEM セキュリティテスト", () => {
  test("heal_scrollでHPが回復する", () => {
    const base = battleWithItem("heal_scroll");
    const hp = base.player.hp;
    const s = gameReducer(base, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    expect(s.player.hp).toBeGreaterThan(hp);
  });
  test("chakra_pillでチャクラが回復する", () => {
    const base = { ...battleWithItem("chakra_pill"), player: { ...battleWithItem("chakra_pill").player, chakra: 0 } };
    const s = gameReducer(base, { type: "PLAYER_ITEM", itemId: "chakra_pill" });
    expect(s.player.chakra).toBeGreaterThan(0);
  });
  test("antidoteで毒が解除される", () => {
    const base = battleWithItem("antidote");
    const poisoned: GameState = { ...base, battle: { ...base.battle, playerStatus: [{ id: "poison", name: "毒", turns: 3, value: 5 }] } };
    const s = gameReducer(poisoned, { type: "PLAYER_ITEM", itemId: "antidote" });
    expect(s.battle.playerStatus.some((e) => e.id === "poison")).toBe(false);
  });
  test("count=0のアイテムはno-op", () => {
    const base = battleWithItem("heal_scroll", 0);
    const hp = base.player.hp;
    const s = gameReducer(base, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    expect(s.player.hp).toBe(hp);
  });
  test("使用後にアイテムのcountが1減る", () => {
    const base = battleWithItem("heal_scroll", 2);
    const s = gameReducer(base, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    expect(s.player.items.find((i) => i.id === "heal_scroll")?.count).toBe(1);
  });
  test("HPがmaxHpを超えない", () => {
    let base = battleWithItem("heal_scroll");
    base = { ...base, player: { ...base.player, hp: base.player.maxHp } };
    const s = gameReducer(base, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    expect(s.player.hp).toBeLessThanOrEqual(s.player.maxHp);
  });
});
