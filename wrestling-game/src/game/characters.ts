export interface CharacterDef {
  id: string;
  name: string;
  title: string;         // ニックネーム
  primaryColor: number;
  secondaryColor: number;
  skinColor: number;
  // Stat multipliers (1.0 = baseline)
  speedMult:  number;    // 移動速度
  damageMult: number;    // 与ダメージ
  defenceMult: number;   // 被ダメ軽減 (< 1.0 で硬い)
  maxHp:      number;    // 最大 HP
  staminaMult: number;   // スタミナ回復速度
  // Per-character finisher
  finisher: { name: string; color: number };
}

export const ROSTER: CharacterDef[] = [
  {
    id: "thunder",
    name: "THUNDER",
    title: "The Balanced Warrior",
    primaryColor:   0x0044cc,
    secondaryColor: 0xffffff,
    skinColor:      0xf5c5a3,
    speedMult:   1.0,
    damageMult:  1.0,
    defenceMult: 1.0,
    maxHp:       100,
    staminaMult: 1.0,
    finisher: { name: "THUNDER BOLT!!", color: 0x44aaff },
  },
  {
    id: "steel",
    name: "STEEL",
    title: "The Iron Powerhouse",
    primaryColor:   0x888888,
    secondaryColor: 0xcc0000,
    skinColor:      0xe8b89a,
    speedMult:   0.75,
    damageMult:  1.45,
    defenceMult: 0.75,
    maxHp:       130,
    staminaMult: 0.8,
    finisher: { name: "STEEL CRUSHER!!", color: 0xff2200 },
  },
  {
    id: "shadow",
    name: "SHADOW",
    title: "The Swift Phantom",
    primaryColor:   0x330066,
    secondaryColor: 0xcc44ff,
    skinColor:      0xd4a574,
    speedMult:   1.55,
    damageMult:  0.8,
    defenceMult: 1.2,
    maxHp:       80,
    staminaMult: 1.4,
    finisher: { name: "PHANTOM STRIKE!!", color: 0xcc44ff },
  },
  {
    id: "blaze",
    name: "BLAZE",
    title: "The Resilient Flame",
    primaryColor:   0xcc5500,
    secondaryColor: 0xffd700,
    skinColor:      0xf0c090,
    speedMult:   0.95,
    damageMult:  1.1,
    defenceMult: 0.85,
    maxHp:       120,
    staminaMult: 1.15,
    finisher: { name: "BLAZING INFERNO!!", color: 0xff8800 },
  },
];
