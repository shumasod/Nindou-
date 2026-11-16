import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";

function battleState(): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  s = gameReducer(s, { type: "SET_NAME", name: "テスト" });
  s = gameReducer(s, { type: "START_QUEST", questId: "q001" });
  s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" });
  return s;
}

describe("アイテム個数 セキュリティテスト", () => {
  test("アイテム使用で count が 1 減る", () => {
    const s = battleState();
    const before = s.player.items.find((i) => i.id === "heal_scroll")?.count ?? 0;
    const after = gameReducer(s, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    const afterCount = after.player.items.find((i) => i.id === "heal_scroll")?.count;
    expect(afterCount ?? 0).toBe(before - 1);
  });

  test("count が 0 になったアイテムはリストから除去される", () => {
    const s = battleState();
    const withOne: GameState = {
      ...s,
      player: {
        ...s.player,
        items: [{ id: "heal_scroll", count: 1 }, { id: "chakra_pill", count: 2 }],
      },
    };
    const after = gameReducer(withOne, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    expect(after.player.items.find((i) => i.id === "heal_scroll")).toBeUndefined();
  });

  test("所持していないアイテムは使用できない", () => {
    const s = battleState();
    const noItems: GameState = { ...s, player: { ...s.player, items: [] } };
    const hpBefore = noItems.player.hp;
    const after = gameReducer(noItems, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    expect(after.player.hp).toBe(hpBefore);
  });

  test("存在しないアイテム ID は no-op", () => {
    const s = battleState();
    const hpBefore = s.player.hp;
    const after = gameReducer(s, { type: "PLAYER_ITEM", itemId: "nonexistent_item_xyz" });
    expect(after.player.hp).toBe(hpBefore);
    expect(after.battle.phase).toBe("player");
  });
});
