# kakeibo — ターミナル家計簿

Ink (React for CLI) + TypeScript 製のインタラクティブなターミナル家計簿アプリです。

## 機能

- **記録**: 支出・収入を金額/カテゴリ/日付/メモ付きで記録
- **一覧**: 矢印キーで選択できるインタラクティブなリスト。編集・削除が可能
- **集計**: 月次の収支サマリーとカテゴリ別テキストバーグラフ
- **データ保存**: `~/.kakeibo/data.json` に自動保存

## インストール

```bash
# リポジトリの kakeibo/ ディレクトリで
cd kakeibo
npm install
npm run build

# グローバルにリンク (省略可)
npm link
```

## 使い方

### メインメニューを開く

```bash
npm start
# または
node dist/cli.js
# または (npm link 後)
kakeibo
```

```
💰 kakeibo — ターミナル家計簿
────────────────────────────
❯ 📝  記録する
  📋  一覧を見る
  📊  月次集計
  ❌  終了
```

### 記録を追加する (引数指定)

```bash
kakeibo add
```

ウィザード形式で種別 → 金額 → カテゴリ → 日付 → メモ → 確認の順に入力します。

### 一覧画面のキーバインド

| キー | 動作 |
|---|---|
| `↑` / `↓` | カーソル移動 |
| `Enter` | 選択行を編集 |
| `d` | 削除確認プロンプト |
| `y` / `n` | 削除実行 / キャンセル |
| `Esc` | メインメニューへ戻る |

### 集計画面のキーバインド

| キー | 動作 |
|---|---|
| `←` | 前月へ |
| `→` | 翌月へ |
| `Esc` | メインメニューへ戻る |

## 集計画面の例

```
📊  月次集計
──────────────────────────────────────────
← 前月  2025年6月  翌月 →  Esc 戻る
──────────────────────────────────────────
収入:       ¥250,000
支出:        ¥87,500
────────────────────────────────
収支:       +¥162,500

──────── 収支バランス ────────
収入 ████████████████░░░░  ¥250,000
支出 ███████░░░░░░░░░░░░░   ¥87,500

──────── カテゴリ別支出 ────────
食費   ██████████░░░░░░░░░░  ¥35,000
交通費 ████░░░░░░░░░░░░░░░░  ¥15,000
娯楽   ███░░░░░░░░░░░░░░░░░  ¥12,000
```

## 開発

```bash
# 依存関係インストール
npm install

# 開発モード (ホットリロード)
npm run dev

# 型チェック
npm run typecheck

# ビルド
npm run build
```

## ディレクトリ構成

```
kakeibo/
├── src/
│   ├── models/
│   │   └── transaction.ts       # Transaction 型・カテゴリ定数
│   ├── store/
│   │   ├── interface.ts         # KakeiboStore インターフェース (DAL境界)
│   │   └── json-store.ts        # lowdb JSON 実装
│   ├── components/
│   │   ├── App.tsx              # ルート・画面ルーティング
│   │   ├── MainMenu.tsx         # メインメニュー
│   │   ├── AddForm.tsx          # 記録フォーム (新規/編集兼用)
│   │   ├── TransactionList.tsx  # インタラクティブ一覧
│   │   ├── Summary.tsx          # 月次集計 + バーグラフ
│   │   └── shared/
│   │       ├── SelectInput.tsx  # 矢印キー選択
│   │       ├── FormField.tsx    # テキスト入力フィールド
│   │       └── Divider.tsx      # 区切り線
│   ├── utils/
│   │   ├── format.ts            # 金額・日付フォーマット
│   │   └── chart.ts             # テキストバーグラフ生成
│   └── cli.tsx                  # エントリポイント + meow 引数パース
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

## データストアの差し替え

`src/store/interface.ts` の `KakeiboStore` インターフェースを実装するクラスを用意し、
`src/store/json-store.ts` の末尾 `export const store` を差し替えるだけで SQLite 等に移行できます。

```typescript
// 例: SQLite 実装に差し替え
export const store: KakeiboStore = new SqliteStore();
```

## データ形式

`~/.kakeibo/data.json`:

```json
{
  "transactions": [
    {
      "id": "abc123",
      "type": "expense",
      "amount": 1500,
      "category": "食費",
      "date": "2025-06-15",
      "memo": "ランチ",
      "createdAt": "2025-06-15T12:00:00.000Z",
      "updatedAt": "2025-06-15T12:00:00.000Z"
    }
  ]
}
```
