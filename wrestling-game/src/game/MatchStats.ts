export interface FighterStats {
  strikesLanded:    number;
  slamsLanded:      number;
  signaturesMade:   number;
  reversals:        number;
  totalDamage:      number;
  knockdownsCaused: number;
  pinAttempts:      number;
  maxCombo:         number;
  cornerSplashes:   number;
  ringoutsScored:   number;
}

export interface MatchStats {
  p1: FighterStats;
  p2: FighterStats;
}

function emptyStats(): FighterStats {
  return {
    strikesLanded:    0,
    slamsLanded:      0,
    signaturesMade:   0,
    reversals:        0,
    totalDamage:      0,
    knockdownsCaused: 0,
    pinAttempts:      0,
    maxCombo:         0,
    cornerSplashes:   0,
    ringoutsScored:   0,
  };
}

export class MatchTracker {
  readonly stats: MatchStats = { p1: emptyStats(), p2: emptyStats() };

  get(side: "p1" | "p2"): FighterStats {
    return this.stats[side];
  }

  recordStrike(side: "p1" | "p2", dmg: number, knockdown: boolean): void {
    const s = this.stats[side];
    s.strikesLanded++;
    s.totalDamage += dmg;
    if (knockdown) s.knockdownsCaused++;
  }

  recordSlam(side: "p1" | "p2", dmg: number): void {
    const s = this.stats[side];
    s.slamsLanded++;
    s.totalDamage += dmg;
  }

  recordSignature(side: "p1" | "p2", dmg: number): void {
    const s = this.stats[side];
    s.signaturesMade++;
    s.totalDamage += dmg;
  }

  recordReversal(side: "p1" | "p2"): void {
    this.stats[side].reversals++;
  }

  recordPin(side: "p1" | "p2"): void {
    this.stats[side].pinAttempts++;
  }

  recordCombo(side: "p1" | "p2", count: number): void {
    if (count > this.stats[side].maxCombo) {
      this.stats[side].maxCombo = count;
    }
  }

  recordCornerSplash(side: "p1" | "p2", dmg: number): void {
    const s = this.stats[side];
    s.cornerSplashes++;
    s.totalDamage += dmg;
    s.knockdownsCaused++;
  }

  recordRingout(scorerSide: "p1" | "p2"): void {
    this.stats[scorerSide].ringoutsScored++;
  }
}
