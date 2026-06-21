# AIキャッチコピー・ジェネレーター

商品・サービス名を入力すると、**AI（Google Gemini）がキャッチコピーを5つ提案**するWebアプリです。
日本AIハッカソン2026 のリハーサル用に制作しました。

---

## 6.1 プロジェクト概要

### 目的
商品・サービス名（と任意の説明・トーン）から、AIでキャッチコピー案を素早く生成する。

### 主な機能
- 商品・サービス名、説明（任意）、トーン（雰囲気）を入力して送信。
- AI がキャッチコピーを5案生成して一覧表示。
- 入力バリデーション（クライアント／サーバー双方）。
- 生成中のローディング表示・エラー表示。

### 使用技術
- **Next.js 16**（App Router） / **React 19**（Function Components + Hooks）
- **TypeScript**（strict）
- **Tailwind CSS v4**
- **Google Gemini API**（`@google/genai`、モデル: gemini-2.0-flash）
- **Zod**（入力バリデーション）
- **Vitest**（テスト）
- デプロイ: **Vercel**

> 上記ライブラリは商用利用可能なオープンソースライセンス（MIT 等）です。Gemini API は Google の利用規約・料金に従います。

### 対応ブラウザ / OS
- 最新版 Chrome / Edge / Firefox / Safari（デスクトップ）。
- 開発: Windows / Linux / macOS。特定 OS 専用の構文・パス表記に依存しません。
- スマートフォン最適化は必須要件ではありません（レスポンシブ対応済み）。

### 制限事項
- データベースは使用していません（生成結果は保存しません）。
- Gemini API キーが必要です（無料枠あり）。利用量・料金は Google の規定に従います。

---

## 6.2 ローカル開発手順

コマンド例は OS 共通で実行できます（Windows / macOS / Linux）。

### 1. Node.js の準備
Node.js **v24.1.0 以上**をインストール（[nodejs.org](https://nodejs.org/)）。

```
node --version
```

### 2. 依存パッケージのインストール
本プロジェクトは **npm** に統一しています。

```
npm install
```

### 3. `.env.local` の作成
見本をコピーして作成します。

- macOS / Linux: `cp .env.local.example .env.local`
- Windows（PowerShell）: `Copy-Item .env.local.example .env.local`

`.env.local` に、[Google AI Studio](https://aistudio.google.com/apikey) で取得した Gemini API キーを設定します。

```
GEMINI_API_KEY="AIza..."
```

> `.env.local` は `.gitignore` で除外され、Git にコミットされません。
> `GEMINI_API_KEY` には `NEXT_PUBLIC_` を付けないこと（クライアントに露出させない）。

### 4. 開発サーバー起動
```
npm run dev
```
ブラウザで http://localhost:3000 を開きます。

### 各種スクリプト
| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | ビルド済みアプリの起動 |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript 型チェック |
| `npm run test` | テスト（Vitest） |

---

## 6.3 Vercel デプロイ手順

1. GitHub にコードを push する。
   ```
   git add .
   git commit -m "AIキャッチコピー・ジェネレーターを実装"
   git push origin main
   ```
2. [Vercel](https://vercel.com/) にログイン（GitHub アカウントで可）。
3. **Add New → Project** で対象リポジトリを **Import**。
4. **Framework Preset** が **Next.js** であることを確認。
5. **Environment Variables** に `GEMINI_API_KEY` を設定（値は Google AI Studio のキー）。
6. **Deploy** を実行。
7. 発行された URL にアクセスして動作確認。

> ⚠️ 環境変数 `GEMINI_API_KEY` を設定せずにデプロイすると、生成時にエラーになります。
> 設定後は **Redeploy**（再デプロイ）で反映してください。

---

## 6.4 環境変数

| 変数名 | 用途 | 公開可否 |
| --- | --- | --- |
| `GEMINI_API_KEY` | Gemini API の認証キー | **非公開**（サーバー側のみ。`NEXT_PUBLIC_` を付けない） |

---

## 6.5 運用上の注意

- `.env.local` を Git に含めない（`.gitignore` で除外済み）。
- API キーをクライアントに露出しない（`src/features/catchcopy/gemini.ts` は `server-only`）。
- 機密情報・環境変数の値をログに出力しない。
- Gemini API には利用量制限・課金条件があります。利用前に料金を確認してください。

---

## テストについて

- 入力バリデーション（`src/lib/catchcopy-schema.ts`）の正常系・異常系を `src/test/catchcopy-schema.test.ts` でテストしています。
- AI 呼び出し（`gemini.ts`）は外部 API に依存するため自動テスト対象外とし、`typecheck` / `lint` / `build` による静的検証で品質を担保しています。

```
npm run typecheck   # 型チェック
npm run lint        # お作法チェック
npm run test        # テスト
npm run build       # ビルド
```
