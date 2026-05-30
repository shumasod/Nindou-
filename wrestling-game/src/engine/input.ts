export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  strike: boolean;      // F
  grapple: boolean;     // G
  slam: boolean;        // H
  signature: boolean;   // Space
  pin: boolean;         // P
  sprint: boolean;      // Shift
  // Edge-triggered (pressed this frame only)
  strikePressed: boolean;
  grapplePressed: boolean;
  slamPressed: boolean;
  signaturePressed: boolean;
  pinPressed: boolean;
}

export class InputManager {
  private keys = new Set<string>();
  private prevKeys = new Set<string>();

  constructor() {
    window.addEventListener("keydown", (e) => {
      this.keys.add(e.code);
      e.preventDefault();
    });
    window.addEventListener("keyup", (e) => {
      this.keys.delete(e.code);
    });
  }

  /** フレーム終了時に呼ぶ */
  flush(): void {
    this.prevKeys = new Set(this.keys);
  }

  private held(code: string): boolean {
    return this.keys.has(code);
  }

  private pressed(code: string): boolean {
    return this.keys.has(code) && !this.prevKeys.has(code);
  }

  get state(): InputState {
    return {
      up:    this.held("KeyW") || this.held("ArrowUp"),
      down:  this.held("KeyS") || this.held("ArrowDown"),
      left:  this.held("KeyA") || this.held("ArrowLeft"),
      right: this.held("KeyD") || this.held("ArrowRight"),
      strike:    this.held("KeyF"),
      grapple:   this.held("KeyG"),
      slam:      this.held("KeyH"),
      signature: this.held("Space"),
      pin:       this.held("KeyP"),
      sprint:    this.held("ShiftLeft") || this.held("ShiftRight"),
      strikePressed:    this.pressed("KeyF"),
      grapplePressed:   this.pressed("KeyG"),
      slamPressed:      this.pressed("KeyH"),
      signaturePressed: this.pressed("Space"),
      pinPressed:       this.pressed("KeyP"),
    };
  }
}
