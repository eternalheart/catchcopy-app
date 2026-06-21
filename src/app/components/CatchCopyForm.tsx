"use client";

/**
 * キャッチコピー生成フォーム（Client Component）。
 *
 * - 入力・送信状態の管理が必要なため Client Component とする。
 * - 生成処理は Server Action（generateCopyAction）に委譲し、AI 呼び出しはサーバー側で行う。
 * - React 19 の useActionState で送信中（pending）・成功・失敗を表示する。
 */
import { useActionState } from "react";
import {
  generateCopyAction,
  type CatchCopyState,
} from "@/features/catchcopy/actions";
import { COPY_TONES } from "@/lib/catchcopy-schema";

/** Server Action に渡す初期状態。 */
const initialState: CatchCopyState = { status: "idle" };

/**
 * 指定フィールドのエラーメッセージ（先頭の1件）を返すヘルパー。
 */
function fieldError(state: CatchCopyState, field: string): string | undefined {
  if (state.status === "error" && state.fieldErrors) {
    return state.fieldErrors[field]?.[0];
  }
  return undefined;
}

/** 入力欄に共通で当てるスタイル。 */
const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 " +
  "shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

const labelClass = "block text-sm font-medium text-gray-700 mb-1";
const errorClass = "mt-1 text-sm text-red-600";

/**
 * キャッチコピー生成フォーム本体。
 */
export function CatchCopyForm() {
  const [state, formAction, isPending] = useActionState(
    generateCopyAction,
    initialState,
  );

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-5" noValidate>
        {/* 全体エラー表示 */}
        {state.status === "error" && (
          <div
            role="alert"
            className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-800"
          >
            {state.message}
          </div>
        )}

        {/* 商品・サービス名（必須） */}
        <div>
          <label htmlFor="productName" className={labelClass}>
            商品・サービス名 <span className="text-red-600">*</span>
          </label>
          <input
            id="productName"
            name="productName"
            type="text"
            required
            maxLength={100}
            className={inputClass}
            placeholder="例：手作りパン工房 こむぎ"
          />
          {fieldError(state, "productName") && (
            <p className={errorClass}>{fieldError(state, "productName")}</p>
          )}
        </div>

        {/* 説明（任意） */}
        <div>
          <label htmlFor="description" className={labelClass}>
            どんなもの？（任意・あるとより良いコピーに）
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={300}
            className={inputClass}
            placeholder="例：毎朝焼きたての国産小麦パン。子ども連れに人気のお店。"
          />
          {fieldError(state, "description") && (
            <p className={errorClass}>{fieldError(state, "description")}</p>
          )}
        </div>

        {/* トーン（必須・選択式） */}
        <div>
          <label htmlFor="tone" className={labelClass}>
            トーン（雰囲気）
          </label>
          <select
            id="tone"
            name="tone"
            defaultValue="おまかせ"
            className={inputClass}
          >
            {COPY_TONES.map((tone) => (
              <option key={tone} value={tone}>
                {tone}
              </option>
            ))}
          </select>
          {fieldError(state, "tone") && (
            <p className={errorClass}>{fieldError(state, "tone")}</p>
          )}
        </div>

        {/* 送信ボタン。送信中は無効化＋ローディング文言。 */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-indigo-600 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {isPending ? "AIが考え中…" : "キャッチコピーを生成する"}
        </button>
      </form>

      {/* 生成結果の表示 */}
      {state.status === "success" && (
        <section aria-label="生成結果" className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            ✨ AIが提案するキャッチコピー
          </h2>
          <ul className="space-y-2">
            {state.copies.map((copy, index) => (
              <li
                key={index}
                className="rounded-md border border-indigo-200 bg-indigo-50 px-4 py-3 text-gray-900"
              >
                {copy}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
