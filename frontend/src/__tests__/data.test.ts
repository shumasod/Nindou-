import { CLANS, SKILLS, SKILL_UNLOCK, ENEMIES, ITEMS, QUESTS, AREAS, WEAPONS, ARMORS } from "@/components/KageNinden/data";

// ===== CLANS =====
describe("CLANSデータ整合性", () => {
  const clanIds = ["force", "illusion", "speed"] as const;

  test("3流派が全て定義されている", () => {
    clanIds.forEach((id) => {
      expect(CLANS[id]).toBeDefined();
    });
  });

  test.each(clanIds)("%s流派の必須フィールドが揃っている", (id) => {
    const clan = CLANS[id];
    expect(clan.name).toBeTruthy();
    expect(clan.icon).toBeTruthy();
    expect(clan.desc).toBeTruthy();
    expect(clan.bonus).toBeDefined();
    expect(clan.starterSkill).toBeTruthy();
    expect(clan.color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  test.each(clanIds)("%s流派のstarterSkillはSKILLSに存在する", (id) => {
    const skill = CLANS[id].starterSkill;
    expect(SKILLS[skill]).toBeDefined();
  });

  test.each(clanIds)("%s流派のボーナスは正の値", (id) => {
    const bonus = CLANS[id].bonus;
    Object.values(bonus).forEach((v) => {
      expect(v).toBeGreaterThan(0);
    });
  });
});

// ===== SKILLS =====
describe("SKILLSデータ整合性", () => {
  const skillIds = Object.keys(SKILLS);

  test("9種類以上のスキルが定義されている", () => {
    expect(skillIds.length).toBeGreaterThanOrEqual(9);
  });

  test.each(skillIds)("スキル '%s' の必須フィールドが揃っている", (id) => {
    const skill = SKILLS[id];
    expect(skill.name).toBeTruthy();
    expect(skill.cost).toBeGreaterThan(0);
    expect(skill.type).toBeTruthy();
    expect(skill.desc).toBeTruthy();
    expect(["force", "illusion", "speed"]).toContain(skill.clan);
  });

  test("damageタイプのスキルはmultiplierを持つ", () => {
    Object.entries(SKILLS).forEach(([, skill]) => {
      if (skill.type === "damage") {
        expect(skill.multiplier).toBeDefined();
        expect(skill.multiplier!).toBeGreaterThan(1);
      }
    });
  });

  test("チャクラコストは0より大きい", () => {
    Object.entries(SKILLS).forEach(([, skill]) => {
      expect(skill.cost).toBeGreaterThan(0);
    });
  });

  test("各流派に最低3スキルが割り当てられている", () => {
    const byClan: Record<string, number> = { force: 0, illusion: 0, speed: 0 };
    Object.values(SKILLS).forEach((sk) => {
      byClan[sk.clan] = (byClan[sk.clan] ?? 0) + 1;
    });
    expect(byClan.force).toBeGreaterThanOrEqual(3);
    expect(byClan.illusion).toBeGreaterThanOrEqual(3);
    expect(byClan.speed).toBeGreaterThanOrEqual(3);
  });
});

// ===== SKILL_UNLOCK =====
describe("SKILL_UNLOCKデータ整合性", () => {
  test("解放定義のあるスキルはSKILLSに存在する", () => {
    Object.keys(SKILL_UNLOCK).forEach((skillId) => {
      expect(SKILLS[skillId]).toBeDefined();
    });
  });

  test("Lv1スキルが各流派に1つずつある", () => {
    const lv1ByClan: Record<string, number> = {};
    Object.values(SKILL_UNLOCK).forEach(({ level, clan }) => {
      if (level === 1) {
        lv1ByClan[clan] = (lv1ByClan[clan] ?? 0) + 1;
      }
    });
    expect(lv1ByClan.force).toBe(1);
    expect(lv1ByClan.illusion).toBe(1);
    expect(lv1ByClan.speed).toBe(1);
  });

  test("解放レベルは正の整数", () => {
    Object.values(SKILL_UNLOCK).forEach(({ level }) => {
      expect(level).toBeGreaterThan(0);
      expect(Number.isInteger(level)).toBe(true);
    });
  });
});

// ===== ENEMIES =====
describe("ENEMIESデータ整合性", () => {
  const enemyIds = Object.keys(ENEMIES);

  test("6種類以上の敵が定義されている", () => {
    expect(enemyIds.length).toBeGreaterThanOrEqual(6);
  });

  test.each(enemyIds)("敵 '%s' の必須フィールドが揃っている", (id) => {
    const e = ENEMIES[id];
    expect(e.name).toBeTruthy();
    expect(e.icon).toBeTruthy();
    expect(e.hp).toBeGreaterThan(0);
    expect(e.attack).toBeGreaterThan(0);
    expect(e.defense).toBeGreaterThanOrEqual(0);
    expect(e.speed).toBeGreaterThan(0);
    expect(e.exp).toBeGreaterThan(0);
    expect(e.gold).toBeGreaterThanOrEqual(0);
    expect(["aggressive","balanced","debuffer","tank","speed","boss"]).toContain(e.ai);
  });

  test("ドロップアイテムはITEMSに存在する", () => {
    Object.entries(ENEMIES).forEach(([, enemy]) => {
      enemy.drops.forEach((drop) => {
        expect(ITEMS[drop.id]).toBeDefined();
      });
    });
  });

  test("ドロップ率は0〜1の範囲", () => {
    Object.entries(ENEMIES).forEach(([, enemy]) => {
      enemy.drops.forEach((drop) => {
        expect(drop.rate).toBeGreaterThan(0);
        expect(drop.rate).toBeLessThanOrEqual(1);
      });
    });
  });

  test("demon_lord はboss AIでphase2Thresholdを持つ", () => {
    const boss = ENEMIES.demon_lord;
    expect(boss.ai).toBe("boss");
    expect(boss.phase2Threshold).toBeDefined();
    expect(boss.phase2Threshold!).toBeGreaterThan(0);
    expect(boss.phase2Threshold!).toBeLessThan(1);
  });

  test("敵のHPはLv別の想定範囲内（弱〜強の順序）", () => {
    expect(ENEMIES.forest_bandit.hp).toBeLessThan(ENEMIES.ninja_trainee.hp);
    expect(ENEMIES.ninja_trainee.hp).toBeLessThan(ENEMIES.giant_spider.hp);
    expect(ENEMIES.giant_spider.hp).toBeLessThan(ENEMIES.cursed_samurai.hp);
    expect(ENEMIES.cursed_samurai.hp).toBeLessThan(ENEMIES.demon_lord.hp);
  });
});

// ===== ITEMS =====
describe("ITEMSデータ整合性", () => {
  const itemIds = Object.keys(ITEMS);

  test("5種類以上のアイテムが定義されている", () => {
    expect(itemIds.length).toBeGreaterThanOrEqual(5);
  });

  test.each(itemIds)("アイテム '%s' の必須フィールドが揃っている", (id) => {
    const item = ITEMS[id];
    expect(item.name).toBeTruthy();
    expect(item.type).toBeTruthy();
    expect(item.icon).toBeTruthy();
    expect(item.desc).toBeTruthy();
    expect(["heal","chakra","cure","escape"]).toContain(item.type);
  });

  test("heal/chakraタイプはvalueを持つ", () => {
    Object.entries(ITEMS).forEach(([, item]) => {
      if (item.type === "heal" || item.type === "chakra") {
        expect(item.value).toBeDefined();
        expect(item.value!).toBeGreaterThan(0);
      }
    });
  });
});

// ===== QUESTS =====
describe("QUESTSデータ整合性", () => {
  test("5件以上のクエストが定義されている", () => {
    expect(QUESTS.length).toBeGreaterThanOrEqual(5);
  });

  test("全クエストのidが一意", () => {
    const ids = QUESTS.map((q) => q.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  test.each(QUESTS.map((q) => [q.id, q] as const))("クエスト '%s' の必須フィールド", (id, q) => {
    expect(q.title).toBeTruthy();
    expect(q.desc).toBeTruthy();
    expect(["D","C","B","A","S"]).toContain(q.rank);
    expect(q.type).toBe("kill");
    expect(ENEMIES[q.target]).toBeDefined();
    expect(q.count).toBeGreaterThan(0);
    expect(q.reward.exp).toBeGreaterThan(0);
    expect(q.reward.gold).toBeGreaterThanOrEqual(0);
    expect(q.minLevel).toBeGreaterThan(0);
  });

  test("クエスト報酬アイテムはITEMSに存在する", () => {
    QUESTS.forEach((q) => {
      q.reward.items.forEach((ri) => {
        expect(ITEMS[ri.id]).toBeDefined();
      });
    });
  });

  test("ランク順でminLevelが上昇する傾向", () => {
    const rankOrder = ["D","C","B","A","S"];
    const byRank: Record<string, number[]> = {};
    QUESTS.forEach((q) => {
      (byRank[q.rank] ??= []).push(q.minLevel);
    });
    // D < S のminLevel
    const dMin = Math.min(...(byRank.D ?? [9999]));
    const sMin = Math.min(...(byRank.S ?? [9999]));
    expect(dMin).toBeLessThan(sMin);
  });
});

// ===== AREAS =====
describe("AREASデータ整合性", () => {
  const areaIds = Object.keys(AREAS);

  test("5エリア以上が定義されている", () => {
    expect(areaIds.length).toBeGreaterThanOrEqual(5);
  });

  test.each(areaIds)("エリア '%s' の必須フィールド", (id) => {
    const area = AREAS[id];
    expect(area.name).toBeTruthy();
    expect(area.desc).toBeTruthy();
    expect(area.minLevel).toBeGreaterThan(0);
    expect(area.icon).toBeTruthy();
    expect(Array.isArray(area.quests)).toBe(true);
  });

  test("エリアのクエストIDはQUESTSに存在する", () => {
    const questIds = new Set(QUESTS.map((q) => q.id));
    areaIds.forEach((areaId) => {
      AREAS[areaId].quests.forEach((qid) => {
        expect(questIds.has(qid)).toBe(true);
      });
    });
  });
});

// ===== WEAPONS / ARMORS =====
describe("WEAPONS/ARMORSデータ整合性", () => {
  test("初期装備 kunai_basic がWEAPONSに存在する", () => {
    expect(WEAPONS["kunai_basic"]).toBeDefined();
  });

  test("初期防具 cloth_basic がARMORSに存在する", () => {
    expect(ARMORS["cloth_basic"]).toBeDefined();
  });

  test.each(Object.keys(WEAPONS))("武器 '%s' の必須フィールド", (id) => {
    const w = WEAPONS[id];
    expect(w.name).toBeTruthy();
    expect(w.desc).toBeTruthy();
    expect(typeof w.attack).toBe("number");
    expect(typeof w.speed).toBe("number");
  });
});
