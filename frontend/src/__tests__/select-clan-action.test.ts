import { gameReducer, INITIAL_STATE, INITIAL_PLAYER } from "../components/KageNinden/reducer";

describe("SELECT_CLAN — force (剛忍流)", () => {
  const next = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });

  it("sets clan to force", () => {
    expect(next.player.clan).toBe("force");
  });

  it("applies +30 maxHp bonus", () => {
    expect(next.player.maxHp).toBe(INITIAL_PLAYER.maxHp + 30);
  });

  it("sets hp to new maxHp", () => {
    expect(next.player.hp).toBe(next.player.maxHp);
  });

  it("applies +5 attack bonus", () => {
    expect(next.player.stats.attack).toBe(INITIAL_PLAYER.stats.attack + 5);
  });

  it("gives starter skill spin_slash", () => {
    expect(next.player.skills).toContain("spin_slash");
    expect(next.player.skills).toHaveLength(1);
  });

  it("navigates to name_input screen", () => {
    expect(next.ui.screen).toBe("name_input");
  });
});

describe("SELECT_CLAN — illusion (幻忍流)", () => {
  const next = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "illusion" });

  it("sets clan to illusion", () => {
    expect(next.player.clan).toBe("illusion");
  });

  it("applies +20 maxChakra bonus", () => {
    expect(next.player.maxChakra).toBe(INITIAL_PLAYER.maxChakra + 20);
  });

  it("sets chakra to new maxChakra", () => {
    expect(next.player.chakra).toBe(next.player.maxChakra);
  });

  it("applies +5 stealth bonus", () => {
    expect(next.player.stats.stealth).toBe(INITIAL_PLAYER.stats.stealth + 5);
  });

  it("gives starter skill phantom_clone", () => {
    expect(next.player.skills).toContain("phantom_clone");
  });
});

describe("SELECT_CLAN — speed (迅忍流)", () => {
  const next = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "speed" });

  it("sets clan to speed", () => {
    expect(next.player.clan).toBe("speed");
  });

  it("applies +8 speed bonus", () => {
    expect(next.player.stats.speed).toBe(INITIAL_PLAYER.stats.speed + 8);
  });

  it("applies +5 stealth bonus", () => {
    expect(next.player.stats.stealth).toBe(INITIAL_PLAYER.stats.stealth + 5);
  });

  it("gives starter skill flash_step", () => {
    expect(next.player.skills).toContain("flash_step");
  });

  it("does not change player name or level", () => {
    expect(next.player.name).toBe(INITIAL_PLAYER.name);
    expect(next.player.level).toBe(INITIAL_PLAYER.level);
  });
});
