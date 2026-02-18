# Lecture Folder App (Silent Cassini)

講習会・研修参加者向けのフォルダ管理アプリ（プロトタイプ）。
Next.js で構築されており、Cloudflare Pages (Full Stack) へのデプロイを想定しています。
データベースとして Cloudflare D1 を使用しています。

## 機能

- **参加者ダッシュボード**: ログイン、ファイル管理、振り返りフォーム。
- **講師ダッシュボード**: 参加者一覧（データベース連携済み）。
- **ユーザー登録**: 参加者による自己登録（データベース連携済み）。

## ローカルでの実行

1.  依存関係のインストール:
    ```bash
    npm install
    npm install -D wrangler @cloudflare/next-on-pages
    ```

2.  開発サーバーの起動:
    ```bash
    npm run dev
    ```
    *注: ローカルでの D1 連携には `wrangler pages dev` 等の追加設定が必要ですが、現在はUI確認用として `npm run dev` を使用します。APIはダミーレスポンスまたはエラーを返す場合があります。*

## Cloudflare Pages へのデプロイ

このアプリは **Next.js App Router** と **Cloudflare D1** を使用しています。

### 1. データベースの準備
(初回のみ) D1 データベースを作成します。
```bash
npx wrangler d1 create lecture-app-db
```
出力された `database_id` を `wrangler.toml` に反映してください。

### 2. スキーマの適用
テーブルを作成します。
```bash
npx wrangler d1 execute lecture-app-db --remote --file=./schema.sql
```

### 3. デプロイ設定 (Cloudflare Dashboard)
GitHub リポジトリを連携し、以下の設定でプロジェクトを作成します。

- **Framework preset**: `Next.js`
- **Build command**: `npx @cloudflare/next-on-pages`
- **Build output directory**: `.vercel/output/static`
- **Compatibility flags**: `nodejs_compat` (推奨)

**重要: D1 データベースのバインディング**
デプロイ後、Cloudflare Pages の設定画面 (Settings -> Functions -> D1 Database Bindings) で、変数名 `DB` に対して作成した `lecture-app-db` を紐付けてください。
これが設定されていないと、API ルートがデータベースに接続できません。
