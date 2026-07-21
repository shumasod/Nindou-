import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import { CLANS, SKILLS } from "@/components/KageNinden/data";
import type { GameState } from "@/components/KageNinden/reducer";

// ===== ヘルパー =====
function makeClanPlayer(clan: "force" | "illusion" | "speed"): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan });
  s = gameReducer(s, { type: "SET_NAME", name: "テスト" });
  return s;
}

function makeBattleState(clan: "force" | "illusion" | "speed"): GameState {
  let s = makeClanPlayer(clan);
  s = gameReducer(s, { type: "START_QUEST", questId: "q001" });
  s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" });
  return s;
}

// ===== 流派ボーナス =====
describe("SELECT_CLAN bonuses", () => {
  test("force: maxHp+30, attack+5, starterSkill=spin_slash", () => {
    const s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    expect(s.player.maxHp).toBe(INITIAL_STATE.player.maxHp + 30);
    expect(s.player.stats.attack).toBe(INITIAL_STATE.player.stats.attack + 5);
    expect(s.player.skills).toContain("spin_slash");
  });

  test("illusion: maxChakra+20, stealth+5, starterSkill=phantom_clone", () => {
    const s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "illusion" });
    expect(s.player.maxChakra).toBe(INITIAL_STATE.player.maxChakra + 20);
    expect(s.player.stats.stealth).toBe(INITIAL_STATE.player.stats.stealth + 5);
    expect(s.player.skills).toContain("phantom_clone");
  });

  test("speed: speed+8, stealth+5, starterSkill=flash_step", () => {
    const s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "speed" });
    expect(s.player.stats.speed).toBe(INITIAL_STATE.player.stats.speed + 8);
    expect(s.player.stats.stealth).toBe(INITIAL_STATE.player.stats.stealth + 5);
    expect(s.player.skills).toContain("flash_step");
  });

  test("clan選択後にhomeへ遷移", () => {
    const s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    expect(s.ui.screen).toBe("name_input");
  });

  test("SET_NAME後にhomeへ遷移", () => {
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
    expect(s.ui.screen).toBe("home");
    expect(s.player.name).toBe("影丸");
  });
});

// ===== PLAYER_SKILL =====
describe("PLAYER_SKILL", () => {
  function makeBattleWithFullChakra(clan: "force" | "illusion" | "speed"): GameState {
    const s = makeBattleState(clan);
    return { ...s, player: { ...s.player, chakra: s.player.maxChakra } };
  }

  test("spin_slash: チャクラを消費して敵にダメージを与える", () => {
    const s = makeBattleWithFullChakra("force");
    const chakraBefore = s.player.chakra;
    const skillCost = SKILLS["spin_slash"].cost;
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.5);
    const after = gameReducer(s, { type: "PLAYER_SKILL", skillId: "spin_slash" });
    spy.mockRestore();
    expect(after.player.chakra).toBe(chakraBefore - skillCost);
    expect(after.battle.enemy!.hp).toBeLessThan(s.battle.enemy!.hp);
  });

  test("チャクラ不足のとき術は発動しない", () => {
    const s = makeBattleState("force");
    const noChakra = { ...s, player: { ...s.player, chakra: 0 } };
    const after = gameReducer(noChakra, { type: "PLAYER_SKILL", skillId: "spin_slash" });
    expect(after.battle.enemy!.hp).toBe(s.battle.enemy!.hp);
    expect(after.player.chakra).toBe(0);
  });

  test("phantom_clone: phaseがenemyになる", () => {
    const s = makeBattleWithFullChakra("illusion");
    const after = gameReducer(s, { type: "PLAYER_SKILL", skillId: "phantom_clone" });
    expect(after.battle.phase).toBe("enemy");
  });

  test("flash_step: phaseがenemyになる", () => {
    const s = makeBattleWithFullChakra("speed");
    const after = gameReducer(s, { type: "PLAYER_SKILL", skillId: "flash_step" });
    expect(after.battle.phase).toBe("enemy");
  });

  test("存在しないスキルIDは状態を変更しない", () => {
    const s = makeBattleWithFullChakra("force");
    const after = gameReducer(s, { type: "PLAYER_SKILL", skillId: "nonexistent_skill" });
    expect(after.player.chakra).toBe(s.player.chakra);
    expect(after.battle.enemy!.hp).toBe(s.battle.enemy!.hp);
  });

  test("スキル使用後にログが追加される", () => {
    const s = makeBattleWithFullChakra("force");
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.5);
    const after = gameReducer(s, { type: "PLAYER_SKILL", skillId: "spin_slash" });
    spy.mockRestore();
    expect(after.battle.log.length).toBeGreaterThan(s.battle.log.length);
  });
});

// ===== CLAN データ整合性 =====
describe("CLANS data integrity", () => {
  test.each(Object.keys(CLANS))("clan %s にはstarterSkillが存在する", (clanId) => {
    const clan = CLANS[clanId];
    expect(SKILLS[clan.starterSkill]).toBeDefined();
  });

  test.each(Object.keys(CLANS))("clan %s のcolorは有効なCSSカラーコード", (clanId) => {
    const { color } = CLANS[clanId];
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  test.each(Object.keys(CLANS))("clan %s のbonusは少なくとも1つのステータスを持つ", (clanId) => {
    const { bonus } = CLANS[clanId];
    expect(Object.keys(bonus).length).toBeGreaterThan(0);
  });
});
