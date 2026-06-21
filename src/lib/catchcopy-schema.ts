/**
 * キャッチコピー生成フォームの入力バリデーション定義。
 *
 * クライアント側の表示だけでなく、サーバー側（Server Action）でも必ず
 * このスキーマで再検証する。「入力値はサーバー側でも必ず検証する」
 * （CLAUDE.md 7章/9章）を満たすため、検証ロジックをここへ集約する。
 */
import { z } from "zod";

/**
 * キャッチコピーのトーン（雰囲気）の選択肢。
 * フォームのセレクトと、AI へ渡すプロンプトの指示に使う。
 */
export const COPY_TONES = [
  "おまかせ",
  "かっこいい",
  "かわいい",
  "信頼感・真面目",
  "ユーモア",
] as const;

/** トーンの型。 */
export type CopyTone = (typeof COPY_TONES)[number];

/**
 * キャッチコピー生成リクエストの入力スキーマ。
 */
export const catchCopySchema = z.object({
  /** 商品・サービス・お店の名前（必須）。 */
  productName: z
    .string()
    .trim()
    .min(1, "商品・サービス名を入力してください")
    .max(100, "名前は100文字以内で入力してください"),

  /** どんなものかの説明（任意）。AI の精度を上げるための補足。 */
  description: z
    .string()
    .trim()
    .max(300, "説明は300文字以内で入力してください")
    .optional()
    .or(z.literal("")),

  /** コピーのトーン（必須・選択式）。未指定時は「おまかせ」。 */
  tone: z.enum(COPY_TONES, {
    message: "トーンを選択してください",
  }),
});

/** 検証を通過した入力データの型。 */
export type CatchCopyInput = z.infer<typeof catchCopySchema>;
