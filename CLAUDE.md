# Nindou — CLAUDE.md

## プロジェクト概要

「忍道」はブラウザで動くビジュアルノベル＋テキストRPGのモノレポです。

| ディレクトリ | 役割 |
|---|---|
| `frontend/` | Next.js 14 (App Router) — ゲーム本体 UI |
| `server/` | Express + better-sqlite3 — セーブデータ API |
| `infra/nginx/` | Nginx リバースプロキシ |
| `infra/terraform/` | AWS 本番インフラ IaC |
| `docs/prototypes/` | 旧プロトタイプ群（参照のみ） |

## 開発コマンド

```bash
# 依存関係インストール（ルートで一括）
npm install

# フロントエンド開発サーバー
npm run dev

# サーバー開発サーバー（別ターミナル）
npm run dev:server

# 両方同時起動
npm run dev:all

# フロントエンドテスト (Jest 211件)
npm test

# サーバーテスト (Jest 12件)
node node_modules/.bin/jest --config server/jest.config.ts --forceExit

# Docker Compose でフルスタック起動
docker compose up --build
```

## アーキテクチャ

```
Browser → Nginx(:80) → Next.js(:3000)   [フロントエンドページ・API routes]
                     → Express(:3001)    [セーブデータ CRUD]
                           ↓
                       Redis (キャッシュ) + SQLite on EFS (永続化)
```

- Redis が使えない場合でも SQLite で縮退運転継続
- セーブスロットは 1〜9（`POST /saves/:slot`）

## フロントエンド構造

- `src/lib/scenarios.ts` — 全シーン定義（`SCENES` オブジェクト）
- `src/lib/types.ts` — `CharacterId`, `Scene`, `Choice` などの型
- `src/lib/endings.ts` — エンディング判定ロジック
- `src/store/gameStore.ts` — Zustand ストア（localStorage 永続化＋サーバー同期）
- `src/components/GameScreen.tsx` — メインゲーム画面（シーン→選択肢サイクル）
- `src/components/KageNinden/` — テキストRPG「影忍伝」サブゲーム

### キャラクター

| ID | 名前 | 距離初期値 |
|---|---|---|
| `aoi` | 青井 葵 | 70 |
| `mio` | 藤原 美緒 | 45 |
| `kenji` | 田中 健司 | 80 |
| `rin` | 橘 凛 | 95 |
| `daichi` | 松本 大地 | 100 |
| `saki` | 安藤 沙希 | 90 |

距離が低いほど親密。0 に近いとエンディング条件に影響。

## サーバー API

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/saves/:slot` | セーブデータ取得（Redis→SQLite） |
| POST | `/saves/:slot` | セーブ（ライトスルーキャッシュ） |
| DELETE | `/saves/:slot` | セーブ削除 |
| GET | `/saves` | スロット一覧 |
| GET | `/health` | SQLite + Redis ヘルスチェック |

スロット番号は 1〜9 の整数のみ。ペイロード上限 100KB。

## テスト

```bash
# フロントエンド: src/**/__tests__/ 以下
npm test --workspace=frontend

# サーバー: server/src/__tests__/saves.test.ts
node node_modules/.bin/jest --config server/jest.config.ts --forceExit
```

新しいシーンを追加したら `scenarios.ts` の `SCENES` に追記し、
`gameStore.ts` の `isValidLoadedState` が参照する `SCENES` に自動的に含まれる。

## インフラ

### ローカル（Docker Compose）

```bash
docker compose up --build   # http://localhost でアクセス
HOST_PORT=8080 docker compose up  # ポート変更
```

### 本番（Terraform AWS）

```bash
cd infra/terraform
terraform init
terraform plan -var="environment=prod"
terraform apply
```

主要リソース: VPC × 2AZ / ECS Fargate / ALB / CloudFront / ElastiCache Redis / EFS(SQLite)

**注意**: `*.tfstate` / `*.tfvars` は `.gitignore` 対象。シークレットは AWS Secrets Manager または GitHub Actions secrets で管理すること。

## CI

`.github/workflows/ci.yml` — PR 時に自動実行:
1. frontend: 型チェック → Jest → Next.js ビルド
2. server: 型チェック → Jest → tsc ビルド
3. Docker dry-run (push なし)
