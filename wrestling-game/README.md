# Wrestling Game

Three.js + TypeScript で作られた WWE 2K 風の 3D プロレスゲーム。
ブラウザだけで動作し、外部アセット（画像・音声ファイル）を一切使いません。
モデルは BoxGeometry の組み立て、効果音は Web Audio API による合成です。

## 開発コマンド

リポジトリルートから（`wrestling-game` は npm workspace として登録済み）:

```bash
npm install                        # ルートで一括インストール
npm run dev:wrestling              # 開発サーバー (Vite)
npm run test:wrestling             # Vitest
npm exec --workspace=wrestling-game -- tsc --noEmit   # 型チェック
npm run build --workspace=wrestling-game              # 本番ビルド → dist/
```

## 操作方法

| 操作 | P1 | P2 |
|---|---|---|
| 移動 | WASD | IJKL |
| ダッシュ | Shift | 右Ctrl |
| ストライク | F | U |
| グラップル / スラム | G | O |
| アイリッシュウィップ | H | N |
| シグネチャー / 特殊技 | Space | M |
| ピン | P | , |
| タント | T | B |
| ポーズ | Esc | Esc |

ダッシュ中の **F** はランニングストライク、相手をコーナーに追い詰めた状態でのダッシュ **F** は
コーナースプラッシュ（確定ダウン）になります。リバウンド中の相手への **F** はクロスラインです。

## ゲームシステム

### モーメンタム

攻撃を当てると蓄積。**50%** で特殊技（キャラ固有・モーメンタム半分消費）、
**100%** でフィニッシャー（キャラ固有の演出と大ダメージ）が発動できます。
一定時間攻撃しないと減衰します（`USE IT OR LOSE IT!`）。

### スタミナ

移動・ダッシュ・技で消費し、静止中に回復します。**20 未満でガス欠**となり、
ダッシュ不能・移動速度低下・与ダメージ 0.75 倍のペナルティを受けます。

### 決着条件

| 条件 | 説明 |
|---|---|
| ピンフォール | ダウン中の相手に **P**。3 カウントで勝利（相手は連打で脱出可） |
| サブミッション | グラップル中に成立。連打ゲージで脱出 |
| TKO | 累計 3 ノックダウン |
| ノックアウト | HP が 0 |
| カウントアウト | 場外に 10 カウント |
| 時間切れ | HP 判定。同点なら **サドンデス**（45 秒延長・先にダウンを奪った側の勝ち） |

### クラウドメーター

大技で上昇し、**75% 以上（HOT CROWD）** で両者のモーメンタムが自動回復。
この状態でタントすると即座にスタミナ +25 / モーメンタム +10 のボーナスが入ります。

## モード

- **1 Player vs CPU** — Easy / Normal / Hard
- **Local 2 Players** — 同一キーボードで対戦
- **Championship (BO3)** — 3 本先取（2 本先取で決着）

1P モードの戦績（勝敗・連勝記録）は localStorage に保存され、タイトル画面に表示されます。

## ディレクトリ構成

```
src/
├── main.ts              エントリポイント・ゲームループ・入力処理・HUD
├── engine/
│   ├── renderer.ts      レンダラー / カメラ / シーン / ライティング
│   ├── input.ts         キーボード入力（P1/P2 の共有キーストア）
│   ├── audio.ts         Web Audio 合成音（マスターゲインでミュート制御）
│   └── effects.ts       パーティクル・カメラシェイク・ダメージ数値
└── game/
    ├── Wrestler.ts      レスラーの状態機械・アニメーション・物理
    ├── CpuAI.ts         難易度別 CPU AI（chase / attack / recover / pin）
    ├── Ring.ts          リング構築とロープの揺れ制御
    ├── characters.ts    キャラクター定義（ROSTER）
    ├── MatchStats.ts    試合統計トラッカー
    └── WinRecord.ts     戦績の永続化（localStorage）
```

## キャラクター

| ID | 名前 | 特徴 | HP |
|---|---|---|---|
| `thunder` | THUNDER | バランス型 | 100 |
| `steel` | STEEL | 高火力・高耐久・低速 | 130 |
| `shadow` | SHADOW | 高速・低耐久 | 80 |
| `blaze` | BLAZE | 中火力・スタミナ優秀 | 120 |

新しいキャラクターを追加する場合は `characters.ts` の `ROSTER` に定義を足すだけで、
キャラ選択画面と全ゲームシステムに自動的に反映されます
（`__tests__/characters.test.ts` の不変条件テストも自動で適用されます）。
