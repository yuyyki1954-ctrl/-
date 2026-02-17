# Lecture Folder App (Silent Cassini)

講習会・研修参加者向けのフォルダ管理アプリ（プロトタイプ）。
Next.js で構築されており、Cloudflare Pages へのデプロイを想定しています。

## 機能

- **ランディングページ (LP)**: サービスの概要説明。
- **ダッシュボード**: 期（Cohort）と参加者の選択。
- **詳細ページ**:
  - **フォルダ管理**: ドラッグ＆ドロップでのファイルアップロード（シミュレーション）。
  - **振り返り・コメント**: LocalStorageを使用したデータ保存。

## ローカルでの実行

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

## Cloudflare Pages へのデプロイ

このリポジトリを Cloudflare Pages に連携するだけでデプロイ可能です。

### ビルド設定 (Build Settings)

| 項目 | 設定値 |
| --- | --- |
| **Framework preset** | `Next.js` |
| **Build command** | `npm run build` |
| **Build output directory** | `out` (または `.vercel/output/static`) |

※ `next.config.ts` で `output: "export"` を設定しているため、静的サイトとして書き出されます。

## ディレクトリ構成

- `src/app/page.tsx`: LP
- `src/app/app/page.tsx`: ダッシュボード（参加者一覧）
- `src/app/app/users/[id]/page.tsx`: 詳細画面
- `src/components/`: UIコンポーネント
