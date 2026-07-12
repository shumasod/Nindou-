import {
  CLANS,
  SKILLS,
  SKILL_UNLOCK,
  ENEMIES,
  ITEMS,
  WEAPONS,
  ARMORS,
  QUESTS,
  AREAS,
} from "@/components/KageNinden/data";

// ===== CLANSデータ =====
describe("CLANS", () => {
  const clanIds = Object.keys(CLANS);

  test("3つの流派が存在する", () => {
    expect(clanIds).toHaveLength(3);
    expect(clanIds).toContain("force");
    expect(clanIds).toContain("illusion");
    expect(clanIds).toContain("speed");
  });

  test.each(clanIds)("%s: 必須フィールドが揃っている", (id) => {
    const c = CLANS[id];
    expect(typeof c.name).toBe("string");
    expect(c.name.length).toBeGreaterThan(0);
    expect(typeof c.icon).toBe("string");
    expect(typeof c.desc).toBe("string");
    expect(typeof c.color).toBe("string");
    expect(typeof c.starterSkill).toBe("string");
  });

  test.each(clanIds)("%s: スタータースキルがSKILLSに存在する", (id) => {
    const starterSkill = CLANS[id].starterSkill;
    expect(SKILLS[starterSkill]).toBeDefined();
  });

  test.each(clanIds)("%s: スタータースキルの流派が一致する", (id) => {
    const starterSkillId = CLANS[id].starterSkill;
    expect(SKILLS[starterSkillId].clan).toBe(id);
  });
});

// ===== SKILLSデータ =====
describe("SKILLS", () => {
  const skillIds = Object.keys(SKILLS);

  test("9つのスキルが存在する", () => {
    expect(skillIds).toHaveLength(9);
  });

  test.each(skillIds)("%s: 必須フィールドが揃っている", (id) => {
    const sk = SKILLS[id];
    expect(typeof sk.name).toBe("string");
    expect(sk.cost).toBeGreaterThan(0);
    expect(["damage","buff","debuff","dodge","escape","stun","heal"]).toContain(sk.type);
    expect(["force","illusion","speed"]).toContain(sk.clan);
  });

  test("damageスキルはmultiplierを持つ", () => {
    const dmgSkills = skillIds.filter((id) => SKILLS[id].type === "damage");
    for (const id of dmgSkills) {
      expect(typeof SKILLS[id].multiplier).toBe("number");
      expect(SKILLS[id].multiplier!).toBeGreaterThan(1);
    }
  });
});

// ===== SKILL_UNLOCK =====
describe("SKILL_UNLOCK", () => {
  test("全9スキルの解放条件が定義されている", () => {
    expect(Object.keys(SKILL_UNLOCK)).toHaveLength(9);
  });

  test("解放レベルは1以上", () => {
    for (const [, cond] of Object.entries(SKILL_UNLOCK)) {
      expect(cond.level).toBeGreaterThanOrEqual(1);
    }
  });

  test("解放流派が有効なclanIdを指す", () => {
    const validClans = ["force", "illusion", "speed"];
    for (const [, cond] of Object.entries(SKILL_UNLOCK)) {
      expect(validClans).toContain(cond.clan);
    }
  });

  test("Lv1スキルが各流派に1つずつある", () => {
    const lv1 = Object.entries(SKILL_UNLOCK).filter(([, c]) => c.level === 1);
    expect(lv1).toHaveLength(3);
    const lv1Clans = lv1.map(([, c]) => c.clan);
    expect(lv1Clans).toContain("force");
    expect(lv1Clans).toContain("illusion");
    expect(lv1Clans).toContain("speed");
  });
});

// ===== ENEMIESデータ =====
describe("ENEMIES", () => {
  const enemyIds = Object.keys(ENEMIES);

  test("6体の敵が定義されている", () => {
    expect(enemyIds).toHaveLength(6);
  });

  test.each(enemyIds)("%s: 正の数値ステータスを持つ", (id) => {
    const e = ENEMIES[id];
    expect(e.hp).toBeGreaterThan(0);
    expect(e.attack).toBeGreaterThan(0);
    expect(e.defense).toBeGreaterThanOrEqual(0);
    expect(e.speed).toBeGreaterThan(0);
    expect(e.exp).toBeGreaterThan(0);
    expect(e.gold).toBeGreaterThanOrEqual(0);
  });

  test.each(enemyIds)("%s: ドロップアイテムのIDがITEMSに存在する", (id) => {
    for (const drop of ENEMIES[id].drops) {
      expect(ITEMS[drop.id]).toBeDefined();
      expect(drop.rate).toBeGreaterThan(0);
      expect(drop.rate).toBeLessThanOrEqual(1);
    }
  });

  test("phase2Thresholdが設定されている敵は0〜1の範囲", () => {
    for (const e of Object.values(ENEMIES)) {
      if (e.phase2Threshold !== undefined) {
        expect(e.phase2Threshold).toBeGreaterThan(0);
        expect(e.phase2Threshold).toBeLessThan(1);
      }
    }
  });
});

// ===== ITEMSデータ =====
describe("ITEMS", () => {
  test("5種のアイテムが定義されている", () => {
    expect(Object.keys(ITEMS)).toHaveLength(5);
  });

  test("healアイテムはvalueを持つ", () => {
    const heals = Object.values(ITEMS).filter((i) => i.type === "heal");
    for (const item of heals) {
      expect(item.value).toBeDefined();
      expect(item.value!).toBeGreaterThan(0);
    }
  });

  test("chakraアイテムはvalueを持つ", () => {
    const chakras = Object.values(ITEMS).filter((i) => i.type === "chakra");
    for (const item of chakras) {
      expect(item.value).toBeDefined();
      expect(item.value!).toBeGreaterThan(0);
    }
  });
});

// ===== QUESTSデータ =====
describe("QUESTS", () => {
  test("5つのクエストが定義されている", () => {
    expect(QUESTS).toHaveLength(5);
  });

  test("クエストIDが一意である", () => {
    const ids = QUESTS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test.each(QUESTS.map((q) => [q.id, q] as const))("%s: ターゲット敵がENEMIESに存在する", (_, q) => {
    expect(ENEMIES[q.target]).toBeDefined();
  });

  test.each(QUESTS.map((q) => [q.id, q] as const))("%s: 報酬アイテムがITEMSに存在する", (_, q) => {
    for (const ri of q.reward.items) {
      expect(ITEMS[ri.id]).toBeDefined();
    }
  });

  test("minLevelが昇順になっている（概ね）", () => {
    for (let i = 1; i < QUESTS.length; i++) {
      expect(QUESTS[i].minLevel).toBeGreaterThanOrEqual(QUESTS[i - 1].minLevel);
    }
  });

  test("rankが有効な値を持つ", () => {
    const validRanks = ["D", "C", "B", "A", "S"];
    for (const q of QUESTS) {
      expect(validRanks).toContain(q.rank);
    }
  });
});

// ===== ARMASデータ =====
describe("AREAS", () => {
  const areaIds = Object.keys(AREAS);

  test("5つのエリアが存在する", () => {
    expect(areaIds).toHaveLength(5);
  });

  test.each(areaIds)("%s: questsに含まれるIDがQUESTSに存在する", (id) => {
    const questIds = QUESTS.map((q) => q.id);
    for (const qid of AREAS[id].quests) {
      expect(questIds).toContain(qid);
    }
  });

  test("forest エリアのminLevelは1", () => {
    expect(AREAS["forest"].minLevel).toBe(1);
  });
});
