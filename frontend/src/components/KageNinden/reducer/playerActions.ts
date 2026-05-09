import type { GameState } from "../types";
import { CLANS } from "../data";
import type { ClanId } from "../types";

// SELECT_CLAN
export function handleSelectClan(state: GameState, clan: ClanId): GameState {
  const clanData = CLANS[clan];
  const bonus = clanData.bonus;
  const p = { ...state.player };

  p.clan = clan;
  if (bonus.maxHp)     { p.maxHp    += bonus.maxHp;     p.hp    = p.maxHp; }
  if (bonus.maxChakra) { p.maxChakra += bonus.maxChakra; p.chakra = p.maxChakra; }
  if (bonus.attack)    p.stats = { ...p.stats, attack:  p.stats.attack  + bonus.attack };
  if (bonus.defense)   p.stats = { ...p.stats, defense: p.stats.defense + bonus.defense };
  if (bonus.speed)     p.stats = { ...p.stats, speed:   p.stats.speed   + bonus.speed };
  if (bonus.stealth)   p.stats = { ...p.stats, stealth: p.stats.stealth + bonus.stealth };
  p.skills = [clanData.starterSkill];

  return { ...state, player: p, ui: { ...state.ui, screen: "name_input" } };
}

// SET_NAME
export function handleSetName(state: GameState, name: string): GameState {
  const safeName = name
    .replace(/[‪-‮⁦-⁩]/g, "")
    .replace(/[<>"'`]/g, "")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .trim()
    .slice(0, 12);

  if (safeName.length === 0) return state;

  return {
    ...state,
    player: { ...state.player, name: safeName },
    ui: { ...state.ui, screen: "home" },
  };
}

// ALLOCATE_STAT
export function handleAllocateStat(
  state: GameState,
  stat: keyof GameState["player"]["stats"]
): GameState {
  if (state.player.statPoints <= 0) return state;
  return {
    ...state,
    player: {
      ...state.player,
      statPoints: state.player.statPoints - 1,
      stats: { ...state.player.stats, [stat]: state.player.stats[stat] + 1 },
    },
  };
}
