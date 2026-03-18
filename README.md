# 忍道 / Nindou — 恋愛RPG

> 「東京に来たことで、人は変わるのか？」

地方から上京した主人公が、仕事・人間関係・恋愛の中で少しずつ価値観を変えていく物語。
プレイヤーの選択によって「誰と結ばれるか」ではなく「どう変わったか」がエンディングを決定する。

---

## ディレクトリ構成

```
Nindou-/
├── frontend/                # Next.js + TypeScript + TailwindCSS
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   └── api/
│   │   │       ├── save/route.ts    # セーブ API
│   │   │       └── load/route.ts    # ロード API
│   │   ├── components/
│   │   │   ├── TitleScreen.tsx      # タイトル画面
│   │   │   ├── GameScreen.tsx       # ゲームメイン画面
│   │   │   ├── NovelView.tsx        # ノベルゲーム表示
│   │   │   ├── MessageView.tsx      # LINE風メッセージ画面
│   │   │   ├── ChoicePanel.tsx      # 選択肢パネル（タイマー付き）
│   │   │   ├── ParameterDisplay.tsx # パラメータ表示
│   │   │   ├── EndingScreen.tsx     # エンディング画面
│   │   │   └── UnsentLog.tsx        # 未送信メッセージログ
│   │   ├── lib/
│   │   │   ├── types.ts             # 型定義
│   │   │   ├── scenarios.ts         # 全シナリオデータ
│   │   │   └── endings.ts           # エンディング定義・計算
│   │   └── store/
│   │       └── gameStore.ts         # Zustand 状態管理
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.mjs
│
├── server/                  # Express + SQLite バックエンド
│   ├── src/
│   │   └── index.ts         # Express サーバー
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## ゲーム設計

### パラメータ（0〜100）

| パラメータ | 意味 |
|---|---|
| `empathy` 共感力 | 他者への理解・感情移入の深さ |
| `ambition` 野心 | 上昇志向・都市への適応度 |
| `loneliness` 孤独 | 孤立感・連絡の断絶 |
| `honesty` 誠実さ | 自分に正直でいられるか |

### キャラクター

| キャラ | 役割 |
|---|---|
| **蒼井 葵** (Aoi) | 都市に染まった女性。深く関わるとプレイヤーの価値観を揺さぶる |
| **三浦 美緒** (Mio) | 地元の幼馴染。安定志向。プレイヤーの「原点」を象徴 |
| **田中 健二** (Kenji) | 先輩同僚。ドライで現実的。成長を促す |

### 心の距離システム

- 各キャラクターとの距離を 0〜100 で管理（0 = 親密、100 = 疎遠）
- 数値の好感度ではなく「距離」という概念
- 近すぎると壊れる可能性がある

### タイミングシステム

- 一部の選択肢にはカウントダウンタイマーが付く
- 時間内に選ばないと「逃した」扱いになる
- 一度逃したイベントは戻らない

### 未送信メッセージ

- 「書いたけど送らなかった」メッセージがゲーム内に残る
- エンディングで振り返ることができる

### エンディング（5種類）

| エンディング | 条件 |
|---|---|
| 都会に染まったエンド | ambition ≥ 65 & empathy ≤ 40 |
| 地元に戻るエンド | honesty ≥ 65 & ambition ≤ 40 |
| 愛したが壊れたエンド | loneliness ≥ 55 & 多くのシーンを経験 |
| 誰とも結ばれないが成長したエンド | バランス型 & 孤独低め |
| 何も変われなかったエンド | デフォルト |

---

## シナリオ構造（サンプル）

```json
{
  "id": "scene_tokyo_001",
  "type": "monologue",
  "timeOfDay": "night",
  "day": 1,
  "text": "東京の夜は、思ったよりも静かだった。...",
  "choices": [
    {
      "text": "誰かに連絡する",
      "effect": { "loneliness": -2 },
      "next": "scene_message_choice"
    },
    {
      "text": "何もせず寝る",
      "effect": { "loneliness": 2 },
      "next": "scene_sleep_001"
    }
  ]
}
```

---

## 実行手順

### 必要環境

- Node.js v18+
- npm v9+

### フロントエンド（Next.js）

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### バックエンド（Express + SQLite）

```bash
cd server
npm install
npm run dev
# → http://localhost:3001
```

### 両方同時起動

```bash
# ルートで
npm run dev          # フロントエンド
npm run dev:server   # バックエンド（別ターミナル）
```

---

## 技術スタック

| 層 | 技術 |
|---|---|
| Frontend | Next.js 14 / TypeScript / TailwindCSS |
| 状態管理 | Zustand（localStorage 永続化） |
| Backend | Node.js / Express |
| DB | SQLite（better-sqlite3）/ JSON ファイル |
| UI スタイル | スマホ風フレーム / LINE風メッセージ / ノベルゲーム形式 |

---

## ゲームループ

```
朝  → 仕事 / サボる / 誰かに連絡
昼  → イベント（会話・選択）
夕  → 出会い・タイミングシステム発動
夜  → メッセージ / 独白 / 未送信メッセージ
```

---

*「言わなかったこと」が、最も重要になる設計。*
