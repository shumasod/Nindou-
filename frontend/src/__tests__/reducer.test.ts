import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState, GameAction } from "@/components/KageNinden/reducer";

// ===== テストヘルパー =====
function applyActions(state: GameState, actions: GameAction[]): GameState {
  return actions.reduce((s, a) => gameReducer(s, a), state);
}

function makeForcePlayer(): GameState {
  return applyActions(INITIAL_STATE, [
    { type: "SELECT_CLAN", clan: "force" },
    { type: "SET_NAME", name: "影丸" },
  ]);
}

// ===== RESET_GAME =====
describe("RESET_GAME", () => {
  test("ゲーム状態を初期値にリセットする", () => {
    const played = applyActions(INITIAL_STATE, [
      { type: "SELECT_CLAN", clan: "force" },
      { type: "SET_NAME", name: "影丸" },
    ]);
    const reset = gameReducer(played, { type: "RESET_GAME" });
    expect(reset.ui.screen).toBe("title");
    expect(reset.player.name).toBe("");
    expect(reset.player.clan).toBeNull();
    expect(reset.player.level).toBe(1);
  });
});

// ===== GO_TO_SCREEN =====
describe("GO_TO_SCREEN", () => {
  test("指定画面へ遷移する", () => {
    const s = gameReducer(INITIAL_STATE, { type: "GO_TO_SCREEN", screen: "clan_select" });
    expect(s.ui.screen).toBe("clan_select");
  });

  test("homeからmapへ遷移できる", () => {
    const base = makeForcePlayer();
    const s = gameReducer(base, { type: "GO_TO_SCREEN", screen: "map" });
    expect(s.ui.screen).toBe("map");
  });

  test("levelUpPendingをfalseにリセットする", () => {
    const base: GameState = {
      ...makeForcePlayer(),
      ui: { ...makeForcePlayer().ui, levelUpPending: true },
    };
    const s = gameReducer(base, { type: "GO_TO_SCREEN", screen: "home" });
    expect(s.ui.levelUpPending).toBe(false);
  });
});

// ===== SELECT_CLAN =====
describe("SELECT_CLAN", () => {
  test("force選択でHPと攻撃力ボーナス付与", () => {
    const s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    expect(s.player.clan).toBe("force");
    expect(s.player.maxHp).toBe(INITIAL_STATE.player.maxHp + 30);
    expect(s.player.stats.attack).toBe(INITIAL_STATE.player.stats.attack + 5);
  });

  test("illusion選択でチャクラと隠密ボーナス付与", () => {
    const s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "illusion" });
    expect(s.player.clan).toBe("illusion");
    expect(s.player.maxChakra).toBe(INITIAL_STATE.player.maxChakra + 20);
    expect(s.player.stats.stealth).toBe(INITIAL_STATE.player.stats.stealth + 5);
  });

  test("speed選択で素早さと隠密ボーナス付与", () => {
    const s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "speed" });
    expect(s.player.clan).toBe("speed");
    expect(s.player.stats.speed).toBe(INITIAL_STATE.player.stats.speed + 8);
    expect(s.player.stats.stealth).toBe(INITIAL_STATE.player.stats.stealth + 5);
  });

  test("流派スタータースキルが付与される", () => {
    const force = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    expect(force.player.skills).toContain("spin_slash");

    const illusion = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "illusion" });
    expect(illusion.player.skills).toContain("phantom_clone");

    const speed = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "speed" });
    expect(speed.player.skills).toContain("flash_step");
  });

  test("clan_selectからname_input画面に遷移する", () => {
    const s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    expect(s.ui.screen).toBe("name_input");
  });

  test("HPは最大HPと同じに設定される", () => {
    const s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    expect(s.player.hp).toBe(s.player.maxHp);
  });
});

// ===== SET_NAME =====
describe("SET_NAME", () => {
  test("名前が設定されhome画面に遷移する", () => {
    const base = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    const s = gameReducer(base, { type: "SET_NAME", name: "影丸" });
    expect(s.player.name).toBe("影丸");
    expect(s.ui.screen).toBe("home");
  });
});

// ===== START_QUEST =====
describe("START_QUEST", () => {
  test("クエストが activeQuest に設定されquest_detail画面に遷移", () => {
    const base = makeForcePlayer();
    const s = gameReducer(base, { type: "START_QUEST", questId: "q001" });
    expect(s.progress.activeQuest).not.toBeNull();
    expect(s.progress.activeQuest?.id).toBe("q001");
    expect(s.ui.screen).toBe("quest_detail");
  });

  test("存在しないクエストIDは無視される", () => {
    const base = makeForcePlayer();
    const s = gameReducer(base, { type: "START_QUEST", questId: "nonexistent" });
    expect(s.progress.activeQuest).toBeNull();
  });
});

// ===== START_BATTLE =====
describe("START_BATTLE", () => {
  test("battle画面に遷移し敵が設定される", () => {
    const base = makeForcePlayer();
    const s = gameReducer(base, { type: "START_BATTLE", enemyId: "forest_bandit" });
    expect(s.ui.screen).toBe("battle");
    expect(s.battle.enemy).not.toBeNull();
    expect(s.battle.enemy?.id).toBe("forest_bandit");
    expect(s.battle.active).toBe(true);
  });

  test("敵のmaxHpとhpが一致する", () => {
    const base = makeForcePlayer();
    const s = gameReducer(base, { type: "START_BATTLE", enemyId: "forest_bandit" });
    expect(s.battle.enemy!.hp).toBe(s.battle.enemy!.maxHp);
  });

  test("phase='player'でプレイヤーターンから開始", () => {
    const base = makeForcePlayer();
    const s = gameReducer(base, { type: "START_BATTLE", enemyId: "forest_bandit" });
    expect(s.battle.phase).toBe("player");
    expect(s.battle.turn).toBe(1);
  });

  test("存在しないenemyIdは無視される", () => {
    const base = makeForcePlayer();
    const s = gameReducer(base, { type: "START_BATTLE", enemyId: "no_such_enemy" });
    expect(s.battle.enemy).toBeNull();
  });

  test("ログに敵名が記録される", () => {
    const base = makeForcePlayer();
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.99); // 奇襲なし
    const s = gameReducer(base, { type: "START_BATTLE", enemyId: "forest_bandit" });
    spy.mockRestore();
    expect(s.battle.log.length).toBeGreaterThan(0);
  });
});

// ===== PLAYER_ATTACK =====
describe("PLAYER_ATTACK", () => {
  function startBattle(): GameState {
    const base = makeForcePlayer();
    return applyActions(base, [
      { type: "START_QUEST", questId: "q001" },
      { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" },
    ]);
  }

  test("playerターンのみ行動できる", () => {
    const s = startBattle();
    expect(s.battle.phase).toBe("player");
  });

  test("攻撃後はphase='enemy'になる（敵が生存の場合）", () => {
    // 敵をHPが高い状態にして攻撃
    const s = startBattle();
    // 敵がまだ生きているケース（HPを高く設定）
    const highHpState: GameState = {
      ...s,
      battle: {
        ...s.battle,
        enemy: { ...s.battle.enemy!, hp: 1000, maxHp: 1000 },
      },
    };
    const after = gameReducer(highHpState, { type: "PLAYER_ATTACK" });
    expect(after.battle.phase).toBe("enemy");
  });

  test("攻撃でログが追加される", () => {
    const s: GameState = {
      ...startBattle(),
      battle: {
        ...startBattle().battle,
        enemy: { ...startBattle().battle.enemy!, hp: 1000, maxHp: 1000 },
      },
    };
    const after = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(after.battle.log[0]).toMatch(/攻撃|ダメージ/);
  });

  test("敵HPが0以下になると倒した旨のログが入る", () => {
    const base = startBattle();
    const killState: GameState = {
      ...base,
      battle: {
        ...base.battle,
        enemy: { ...base.battle.enemy!, hp: 1, maxHp: 60 },
      },
    };
    const after = gameReducer(killState, { type: "PLAYER_ATTACK" });
    const logText = after.battle.log.join("\n");
    expect(logText).toMatch(/倒した/);
  });

  test("敵を倒すとEXPとゴールドが増える", () => {
    const base = startBattle();
    const killState: GameState = {
      ...base,
      battle: {
        ...base.battle,
        enemy: { ...base.battle.enemy!, hp: 1, maxHp: 60 },
      },
    };
    const before = { exp: base.player.exp, gold: base.player.gold };
    const after = gameReducer(killState, { type: "PLAYER_ATTACK" });
    expect(after.player.exp).toBeGreaterThan(before.exp);
    expect(after.player.gold).toBeGreaterThan(before.gold);
  });
});

// ===== PLAYER_DEFEND =====
describe("PLAYER_DEFEND", () => {
  function startBattle(): GameState {
    const base = makeForcePlayer();
    return applyActions(base, [
      { type: "START_QUEST", questId: "q001" },
      { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" },
    ]);
  }

  test("防御後は phase='enemy' になる", () => {
    const s = startBattle();
    const after = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(after.battle.phase).toBe("enemy");
  });

  test("防御後にdefendingステータスが付与される", () => {
    const s = startBattle();
    const after = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(after.battle.playerStatus.some((e) => e.id === "defending")).toBe(true);
  });

  test("防御後にチャクラが回復する（チャクラ消費後）", () => {
    const s = startBattle();
    // チャクラを半分に減らしてから防御
    const lowCkState: GameState = { ...s, player: { ...s.player, chakra: 10 } };
    const after = gameReducer(lowCkState, { type: "PLAYER_DEFEND" });
    expect(after.player.chakra).toBeGreaterThan(10);
  });
});

// ===== PLAYER_ESCAPE =====
describe("PLAYER_ESCAPE", () => {
  function startBattle(): GameState {
    const base = makeForcePlayer();
    return applyActions(base, [
      { type: "START_QUEST", questId: "q001" },
      { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" },
    ]);
  }

  test("逃走成功でhome画面に戻る", () => {
    const s = startBattle();
    // Math.randomを0.0 (逃走成功確定) にモック
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.0);
    const after = gameReducer(s, { type: "PLAYER_ESCAPE" });
    spy.mockRestore();
    expect(after.ui.screen).toBe("home");
    expect(after.battle.active).toBe(false);
  });

  test("逃走失敗でphase='enemy'になる", () => {
    const s = startBattle();
    // Math.randomを0.99 (逃走失敗確定) にモック
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.99);
    const after = gameReducer(s, { type: "PLAYER_ESCAPE" });
    spy.mockRestore();
    expect(after.battle.phase).toBe("enemy");
    expect(after.ui.screen).toBe("battle");
  });
});

// ===== PLAYER_SKILL =====
describe("PLAYER_SKILL", () => {
  function startBattle(): GameState {
    const base = makeForcePlayer();
    const s = applyActions(base, [
      { type: "START_QUEST", questId: "q001" },
      { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" },
    ]);
    // 敵のHPを高くして即死しないようにする
    return {
      ...s,
      battle: { ...s.battle, enemy: { ...s.battle.enemy!, hp: 1000, maxHp: 1000 } },
    };
  }

  test("チャクラが消費される", () => {
    const s = startBattle();
    const before = s.player.chakra;
    const skill = "spin_slash"; // cost: 15
    const after = gameReducer(s, { type: "PLAYER_SKILL", skillId: skill });
    expect(after.player.chakra).toBe(before - 15);
  });

  test("チャクラ不足のとき使用できない", () => {
    const s = startBattle();
    const noChakraState: GameState = { ...s, player: { ...s.player, chakra: 0 } };
    const after = gameReducer(noChakraState, { type: "PLAYER_SKILL", skillId: "spin_slash" });
    expect(after.player.chakra).toBe(0); // 変化なし
  });

  test("damageスキル使用後はphase='enemy'", () => {
    const s = startBattle();
    const after = gameReducer(s, { type: "PLAYER_SKILL", skillId: "spin_slash" });
    expect(after.battle.phase).toBe("enemy");
  });

  test("iron_stance(buff)使用でdefense_upステータス付与", () => {
    const s = startBattle();
    const after = gameReducer(s, { type: "PLAYER_SKILL", skillId: "iron_stance" });
    expect(after.battle.playerStatus.some((e) => e.id === "defense_up")).toBe(true);
  });

  test("shinigami_illusion(stun)で敵にstunステータス付与", () => {
    const base = makeForcePlayer();
    // illusion流派に変更
    const illusionBase = applyActions(INITIAL_STATE, [
      { type: "SELECT_CLAN", clan: "illusion" },
      { type: "SET_NAME", name: "幻丸" },
    ]);
    const s: GameState = {
      ...applyActions(illusionBase, [
        { type: "START_QUEST", questId: "q001" },
        { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" },
      ]),
      battle: {
        ...applyActions(illusionBase, [
          { type: "START_QUEST", questId: "q001" },
          { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" },
        ]).battle,
        enemy: {
          ...applyActions(illusionBase, [
            { type: "START_QUEST", questId: "q001" },
            { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" },
          ]).battle.enemy!,
          hp: 1000, maxHp: 1000,
        },
      },
    };
    // shinigami_illusionはLv7解放なのでスキルを手動追加
    const sWithSkill: GameState = {
      ...s,
      player: { ...s.player, skills: [...s.player.skills, "shinigami_illusion"], chakra: 50, maxChakra: 70 },
    };
    const after = gameReducer(sWithSkill, { type: "PLAYER_SKILL", skillId: "shinigami_illusion" });
    expect(after.battle.enemyStatus.some((e) => e.id === "stun")).toBe(true);
  });

  test("smoke_escape(escape)スキルでhome画面に逃走", () => {
    const base = applyActions(INITIAL_STATE, [
      { type: "SELECT_CLAN", clan: "speed" },
      { type: "SET_NAME", name: "疾風" },
    ]);
    const s = applyActions(base, [
      { type: "START_QUEST", questId: "q001" },
      { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" },
    ]);
    const sWithSkill: GameState = {
      ...s,
      player: { ...s.player, skills: [...s.player.skills, "smoke_escape"] },
    };
    const after = gameReducer(sWithSkill, { type: "PLAYER_SKILL", skillId: "smoke_escape" });
    expect(after.ui.screen).toBe("home");
    expect(after.battle.active).toBe(false);
  });
});

// ===== PLAYER_ITEM =====
describe("PLAYER_ITEM", () => {
  function startBattle(): GameState {
    const base = makeForcePlayer();
    return applyActions(base, [
      { type: "START_QUEST", questId: "q001" },
      { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" },
    ]);
  }

  test("回復巻物でHPが回復する", () => {
    const s = startBattle();
    // HPを半分に
    const lowHpState: GameState = { ...s, player: { ...s.player, hp: 30 } };
    const after = gameReducer(lowHpState, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    expect(after.player.hp).toBeGreaterThan(30);
    expect(after.player.hp).toBeLessThanOrEqual(after.player.maxHp);
  });

  test("アイテム使用後に個数が1減る", () => {
    const s = startBattle();
    const before = s.player.items.find((i) => i.id === "heal_scroll")!.count;
    const after = gameReducer(s, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    const afterCount = after.player.items.find((i) => i.id === "heal_scroll")?.count ?? 0;
    expect(afterCount).toBe(before - 1);
  });

  test("アイテム使用後はphase='enemy'", () => {
    const s = startBattle();
    const after = gameReducer(s, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    expect(after.battle.phase).toBe("enemy");
  });

  test("HP上限を超えて回復しない", () => {
    const s = startBattle();
    // HPが満タンの状態でも最大HPを超えない
    const after = gameReducer(s, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    expect(after.player.hp).toBeLessThanOrEqual(after.player.maxHp);
  });

  test("チャクラ丹でチャクラが回復する", () => {
    const s = startBattle();
    const noChakraState: GameState = { ...s, player: { ...s.player, chakra: 0 } };
    const after = gameReducer(noChakraState, { type: "PLAYER_ITEM", itemId: "chakra_pill" });
    expect(after.player.chakra).toBeGreaterThan(0);
  });
});

// ===== ALLOCATE_STAT =====
describe("ALLOCATE_STAT", () => {
  test("SPがある場合ステータスが+1される", () => {
    const base = makeForcePlayer();
    const withSP: GameState = { ...base, player: { ...base.player, statPoints: 3 } };
    const after = gameReducer(withSP, { type: "ALLOCATE_STAT", stat: "attack" });
    expect(after.player.stats.attack).toBe(withSP.player.stats.attack + 1);
    expect(after.player.statPoints).toBe(2);
  });

  test("SP=0のとき振り分けできない", () => {
    const base = makeForcePlayer();
    // statPoints は初期0
    expect(base.player.statPoints).toBe(0);
    const after = gameReducer(base, { type: "ALLOCATE_STAT", stat: "attack" });
    expect(after.player.stats.attack).toBe(base.player.stats.attack); // 変化なし
  });

  test.each(["attack","defense","speed","stealth"] as const)("%s に振り分けできる", (stat) => {
    const withSP: GameState = { ...makeForcePlayer(), player: { ...makeForcePlayer().player, statPoints: 10 } };
    const after = gameReducer(withSP, { type: "ALLOCATE_STAT", stat });
    expect(after.player.stats[stat]).toBe(withSP.player.stats[stat] + 1);
  });
});
