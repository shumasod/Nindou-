const MUTE_KEY = "wrestling-muted";

/** Web Audio API のみ使用（外部ファイル不要）*/
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private _muted: boolean;

  constructor() {
    try {
      this._muted = localStorage.getItem(MUTE_KEY) === "1";
    } catch {
      this._muted = false;
    }
  }

  get muted(): boolean {
    return this._muted;
  }

  /** ミュート切替 — localStorage に永続化し、次回訪問時も維持される */
  toggleMute(): boolean {
    this._muted = !this._muted;
    if (this.master) this.master.gain.value = this._muted ? 0 : 1;
    try {
      localStorage.setItem(MUTE_KEY, this._muted ? "1" : "0");
    } catch {
      // localStorage 不可 — セッション内のみ有効
    }
    return this._muted;
  }

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = this._muted ? 0 : 1;
      this.master.connect(this.ctx.destination);
    }
    // ユーザー操作後に resume が必要なブラウザ対策
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  /** すべての音の出口 — master ゲイン (ミュート制御点) */
  private out(): GainNode {
    this.getCtx();
    return this.master!;
  }

  /** 短いノイズバースト — ストライク */
  punch(): void {
    const ctx = this.getCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const dist = ctx.createWaveShaper();
    dist.curve = makeDistortionCurve(80);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    src.connect(dist);
    dist.connect(gain);
    gain.connect(this.out());
    src.start();
  }

  /** 重低音 — スラム */
  slam(): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.35);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.9, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    // ノイズレイヤー
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
    }
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = buf;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.5;

    osc.connect(gain);
    gain.connect(this.out());
    noiseSrc.connect(noiseGain);
    noiseGain.connect(this.out());
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    noiseSrc.start();
  }

  /** 観客の歓声 — シグネチャー */
  crowd(): void {
    const ctx = this.getCtx();
    const dur = 1.2;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1200;
    filter.Q.value = 0.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.2);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.8);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.out());
    src.start();
  }

  /** ピン開始のドラムロール */
  pinRoll(): void {
    const ctx = this.getCtx();
    const interval = 0.12;
    for (let i = 0; i < 6; i++) {
      const t = ctx.currentTime + i * interval;
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = 200 - i * 10;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.3, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(g);
      g.connect(this.out());
      osc.start(t);
      osc.stop(t + 0.1);
    }
  }
}

function makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
  const n = 256;
  const curve = new Float32Array(new ArrayBuffer(n * 4));
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

export const audio = new AudioEngine();
