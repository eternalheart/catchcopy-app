/**
 * 入力バリデーション（catchCopySchema）のテスト。
 *
 * 正常系とエラー系を検証する。検証はアプリの根幹（不正入力を AI へ渡さない）なので
 * テスト対象とする。AI 呼び出し自体は外部 API 依存のためテスト対象外。
 */
import { describe, it, expect } from "vitest";
import { catchCopySchema } from "@/lib/catchcopy-schema";

describe("catchCopySchema", () => {
  it("必須項目がそろった正常な入力を受理する", () => {
    const result = catchCopySchema.safeParse({
      productName: "手作りパン工房 こむぎ",
      description: "毎朝焼きたての国産小麦パン。",
      tone: "かわいい",
    });
    expect(result.success).toBe(true);
  });

  it("説明が空でも受理する（任意項目）", () => {
    const result = catchCopySchema.safeParse({
      productName: "テスト商品",
      description: "",
      tone: "おまかせ",
    });
    expect(result.success).toBe(true);
  });

  it("商品名が空だと拒否する", () => {
    const result = catchCopySchema.safeParse({
      productName: "",
      tone: "おまかせ",
    });
    expect(result.success).toBe(false);
  });

  it("トーンが選択肢外だと拒否する", () => {
    const result = catchCopySchema.safeParse({
      productName: "テスト商品",
      tone: "存在しないトーン",
    });
    expect(result.success).toBe(false);
  });

  it("商品名が長すぎると拒否する", () => {
    const result = catchCopySchema.safeParse({
      productName: "あ".repeat(101),
      tone: "おまかせ",
    });
    expect(result.success).toBe(false);
  });
});
