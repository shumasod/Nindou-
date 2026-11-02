import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";

describe("流派二重選択防止 セキュリティテスト", () => {
  test("流派未選択の場合は選択できる", () => {
    const s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    expect(s.player.clan).toBe("force");
  });

  test("流派選択済みの場合は別流派選択が no-op", () => {
    const s1 = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    const s2 = gameReducer(s1, { type: "SELECT_CLAN", clan: "illusion" });
    expect(s2.player.clan).toBe("force");
  });

  test("同じ流派を再選択しても no-op", () => {
    const s1 = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    const maxHp1 = s1.player.maxHp;
    const s2 = gameReducer(s1, { type: "SELECT_CLAN", clan: "force" });
    expect(s2.player.maxHp).toBe(maxHp1);
  });

  test("二重選択でステータスが二重加算されない", () => {
    const s1 = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    const atk1 = s1.player.stats.attack;
    const s2 = gameReducer(s1, { type: "SELECT_CLAN", clan: "force" });
    expect(s2.player.stats.attack).toBe(atk1);
  });

  test("二重選択でスキルがリセットされない", () => {
    const s1 = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    const s2 = gameReducer(s1, { type: "SELECT_CLAN", clan: "illusion" });
    expect(s2.player.skills).toEqual(s1.player.skills);
  });
});
