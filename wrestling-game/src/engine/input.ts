export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  strike: boolean;
  grapple: boolean;
  slam: boolean;
  signature: boolean;
  pin: boolean;
  sprint: boolean;
  // Edge-triggered (pressed this frame only)
  strikePressed: boolean;
  grapplePressed: boolean;
  slamPressed: boolean;
  signaturePressed: boolean;
  pinPressed: boolean;
}

/** P1: WASD + F/G/H/Space/P/Shift */
const P1_MAP = {
  up:        ["KeyW"],
  down:      ["KeyS"],
  left:      ["KeyA"],
  right:     ["KeyD"],
  strike:    ["KeyF"],
  grapple:   ["KeyG"],
  slam:      ["KeyH"],
  signature: ["Space"],
  pin:       ["KeyP"],
  sprint:    ["ShiftLeft", "ShiftRight"],
} as const;

/**
 * P2: IJKL 移動
 *   U=ストライク  O=グラップル  N=スラム  M=シグネチャー
 *   Comma=ピン  RCtrl=ダッシュ
 */
const P2_MAP = {
  up:        ["KeyI"],
  down:      ["KeyK"],
  left:      ["KeyJ"],
  right:     ["KeyL"],
  strike:    ["KeyU"],
  grapple:   ["KeyO"],
  slam:      ["KeyN"],
  signature: ["KeyM"],
  pin:       ["Comma"],
  sprint:    ["ControlRight"],
} as const;

interface KeyMap {
  readonly up:        readonly string[];
  readonly down:      readonly string[];
  readonly left:      readonly string[];
  readonly right:     readonly string[];
  readonly strike:    readonly string[];
  readonly grapple:   readonly string[];
  readonly slam:      readonly string[];
  readonly signature: readonly string[];
  readonly pin:       readonly string[];
  readonly sprint:    readonly string[];
}

// 共有キーストア — 2インスタンスで同じイベントを参照
const globalKeys     = new Set<string>();
const globalPrevKeys = new Set<string>();
let listenersAttached = false;

function attachListeners(): void {
  if (listenersAttached) return;
  listenersAttached = true;
  window.addEventListener("keydown", (e) => {
    globalKeys.add(e.code);
    // ブラウザのFキーショートカットは通す
    if (e.code !== "F5" && e.code !== "F11" && e.code !== "F12") {
      e.preventDefault();
    }
  });
  window.addEventListener("keyup", (e) => {
    globalKeys.delete(e.code);
  });
}

export class InputManager {
  private readonly map: KeyMap;

  constructor(player: 1 | 2 = 1) {
    this.map = player === 1 ? P1_MAP : P2_MAP;
    attachListeners();
  }

  /** フレーム終了時に1回だけ呼ぶ（P1 側が呼べばよい）*/
  flush(): void {
    globalPrevKeys.clear();
    for (const k of globalKeys) globalPrevKeys.add(k);
  }

  private held(codes: readonly string[]): boolean {
    return codes.some((c) => globalKeys.has(c));
  }

  private pressed(codes: readonly string[]): boolean {
    return codes.some((c) => globalKeys.has(c) && !globalPrevKeys.has(c));
  }

  get state(): InputState {
    return {
      up:        this.held(this.map.up),
      down:      this.held(this.map.down),
      left:      this.held(this.map.left),
      right:     this.held(this.map.right),
      strike:    this.held(this.map.strike),
      grapple:   this.held(this.map.grapple),
      slam:      this.held(this.map.slam),
      signature: this.held(this.map.signature),
      pin:       this.held(this.map.pin),
      sprint:    this.held(this.map.sprint),
      strikePressed:    this.pressed(this.map.strike),
      grapplePressed:   this.pressed(this.map.grapple),
      slamPressed:      this.pressed(this.map.slam),
      signaturePressed: this.pressed(this.map.signature),
      pinPressed:       this.pressed(this.map.pin),
    };
  }
}
