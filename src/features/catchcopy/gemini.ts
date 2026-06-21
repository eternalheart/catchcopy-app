/**
 * Gemini（Google 生成AI）呼び出しモジュール（サーバー専用）。
 *
 * - "server-only" により、このモジュールが誤ってクライアント（ブラウザ）
 *   バンドルに含まれた場合にビルドで気付ける。API キー露出を防ぐ（CLAUDE.md 5章/9章）。
 * - API キーは環境変数 GEMINI_API_KEY からのみ取得し、コードに直書きしない。
 */
import "server-only";

import { GoogleGenAI, Type } from "@google/genai";
import type { CatchCopyInput } from "@/lib/catchcopy-schema";

/** 使用する Gemini モデル名（無料枠で動作する高速モデル）。 */
const GEMINI_MODEL = "gemini-2.0-flash";

/** 1 回の生成で返すキャッチコピーの本数。 */
const COPY_COUNT = 5;

/**
 * Gemini クライアントのキャッシュ。
 * モジュール読み込み時ではなく初回利用時に初期化する（遅延初期化）。
 * これにより API キー未設定でもビルド・型チェックが失敗しない。
 */
let cachedClient: GoogleGenAI | null = null;

/**
 * Gemini クライアントを生成する内部関数。
 *
 * @throws GEMINI_API_KEY が未設定の場合に、原因が分かるエラーを投げる。
 */
function createClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "環境変数 GEMINI_API_KEY が設定されていません。" +
        ".env.local に設定するか、Vercel の環境変数を確認してください。",
    );
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * 共有の Gemini クライアントを返す（サーバー側専用）。
 */
function getGeminiClient(): GoogleGenAI {
  if (cachedClient === null) {
    cachedClient = createClient();
  }
  return cachedClient;
}

/**
 * 入力内容をもとに、AI に渡すプロンプト（指示文）を組み立てる。
 *
 * @param input 検証済みの入力データ。
 * @returns Gemini に渡すプロンプト文字列。
 */
function buildPrompt(input: CatchCopyInput): string {
  const lines = [
    "あなたは優秀な日本語のコピーライターです。",
    `次の商品・サービスについて、魅力的なキャッチコピーを${COPY_COUNT}個提案してください。`,
    "",
    `商品・サービス名: ${input.productName}`,
  ];

  // 説明が入力されていれば、精度を上げるためプロンプトに含める。
  if (input.description) {
    lines.push(`説明: ${input.description}`);
  }

  // トーン指定が「おまかせ」以外なら、その雰囲気を明示的に指示する。
  if (input.tone !== "おまかせ") {
    lines.push(`トーン（雰囲気）: ${input.tone}`);
  }

  lines.push(
    "",
    "条件: 各コピーは40文字以内。日本語。記号や番号は付けず、コピー本文のみ。",
  );

  return lines.join("\n");
}

/**
 * キャッチコピーを生成する。
 *
 * @param input 検証済みの入力データ。
 * @returns 生成されたキャッチコピーの配列（最大 {@link COPY_COUNT} 件）。
 * @throws API キー未設定・API 通信失敗・想定外レスポンス時に例外を投げる。
 */
export async function generateCatchCopies(
  input: CatchCopyInput,
): Promise<string[]> {
  const ai = getGeminiClient();

  // 結果を扱いやすいよう、文字列の配列（JSON）で返すよう指示する。
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildPrompt(input),
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("AI から有効な応答が得られませんでした。");
  }

  // JSON をパースし、文字列配列であることを安全に確認する（unknown を型ガード）。
  const parsed: unknown = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    throw new Error("AI 応答の形式が想定と異なります。");
  }

  // 文字列だけを抽出し、空文字を除き、上限件数に整える。
  const copies = parsed
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, COPY_COUNT);

  if (copies.length === 0) {
    throw new Error("キャッチコピーを生成できませんでした。");
  }

  return copies;
}
