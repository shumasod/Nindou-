import { CLANS, SKILLS, ENEMIES, ITEMS, QUESTS, AREAS, SKILL_UNLOCK } from "../components/KageNinden/data";

describe("CLANS data integrity", () => {
  it("has exactly 3 clans", () => {
    expect(Object.keys(CLANS)).toHaveLength(3);
  });

  it("each clan has required fields", () => {
    for (const [id, clan] of Object.entries(CLANS)) {
      expect(clan.name).toBeTruthy();
      expect(clan.icon).toBeTruthy();
      expect(clan.desc).toBeTruthy();
      expect(clan.color).toMatch(/^#/);
      expect(clan.starterSkill).toBeTruthy();
      expect(typeof clan.bonus).toBe("object");
    }
  });

  it("each clan starter skill exists in SKILLS", () => {
    for (const clan of Object.values(CLANS)) {
      expect(SKILLS[clan.starterSkill]).toBeDefined();
    }
  });

  it("clan bonus values are positive numbers", () => {
    for (const clan of Object.values(CLANS)) {
      for (const val of Object.values(clan.bonus)) {
        expect(val).toBeGreaterThan(0);
      }
    }
  });
});

describe("SKILLS data integrity", () => {
  it("each skill has name, cost, type, desc", () => {
    for (const [id, skill] of Object.entries(SKILLS)) {
      expect(skill.name).toBeTruthy();
      expect(skill.cost).toBeGreaterThan(0);
      expect(skill.type).toBeTruthy();
      expect(skill.desc).toBeTruthy();
    }
  });

  it("damage skills have a multiplier > 1", () => {
    for (const skill of Object.values(SKILLS)) {
      if (skill.type === "damage") {
        expect(skill.multiplier).toBeGreaterThan(1);
      }
    }
  });

  it("SKILL_UNLOCK references only known skill ids", () => {
    for (const [skillId] of Object.entries(SKILL_UNLOCK)) {
      expect(SKILLS[skillId]).toBeDefined();
    }
  });

  it("SKILL_UNLOCK clan references only known clans", () => {
    for (const [, cond] of Object.entries(SKILL_UNLOCK)) {
      expect(CLANS[cond.clan]).toBeDefined();
    }
  });

  it("each clan has at least 3 skills in SKILL_UNLOCK", () => {
    for (const clanId of Object.keys(CLANS)) {
      const count = Object.values(SKILL_UNLOCK).filter((c) => c.clan === clanId).length;
      expect(count).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("ENEMIES data integrity", () => {
  it("each enemy has required fields", () => {
    for (const [id, enemy] of Object.entries(ENEMIES)) {
      expect(enemy.name).toBeTruthy();
      expect(enemy.icon).toBeTruthy();
      expect(enemy.hp).toBeGreaterThan(0);
      expect(enemy.attack).toBeGreaterThan(0);
      expect(enemy.defense).toBeGreaterThanOrEqual(0);
      expect(enemy.speed).toBeGreaterThan(0);
      expect(enemy.exp).toBeGreaterThan(0);
      expect(enemy.gold).toBeGreaterThan(0);
    }
  });

  it("item drops reference known item ids", () => {
    for (const enemy of Object.values(ENEMIES)) {
      for (const drop of enemy.drops) {
        expect(ITEMS[drop.id]).toBeDefined();
        expect(drop.rate).toBeGreaterThan(0);
        expect(drop.rate).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("QUESTS data integrity", () => {
  it("each quest has required fields", () => {
    for (const quest of QUESTS) {
      expect(quest.id).toBeTruthy();
      expect(quest.title).toBeTruthy();
      expect(quest.target).toBeTruthy();
      expect(quest.count).toBeGreaterThan(0);
      expect(quest.reward.exp).toBeGreaterThan(0);
      expect(quest.reward.gold).toBeGreaterThan(0);
    }
  });

  it("each quest target exists in ENEMIES", () => {
    for (const quest of QUESTS) {
      expect(ENEMIES[quest.target]).toBeDefined();
    }
  });

  it("quest reward items reference known item ids", () => {
    for (const quest of QUESTS) {
      for (const ri of quest.reward.items) {
        expect(ITEMS[ri.id]).toBeDefined();
      }
    }
  });

  it("quest ids are unique", () => {
    const ids = QUESTS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("AREAS quest references point to existing quest ids", () => {
    const questIds = new Set(QUESTS.map((q) => q.id));
    for (const area of Object.values(AREAS)) {
      for (const qid of area.quests) {
        expect(questIds.has(qid)).toBe(true);
      }
    }
  });
});
