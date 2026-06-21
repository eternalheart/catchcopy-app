"use server";

/**
 * キャッチコピー生成の送信処理（Server Action）。
 *
 * - "use server" によりサーバー側だけで実行される。AI 呼び出し（API キー利用）を
 *   クライアント任せにしない（CLAUDE.md 7章/9章）。
 * - フォーム入力はサーバー側で zod により必ず再検証する。
 */
import { catchCopySchema } from "@/lib/catchcopy-schema";
import { generateCatchCopies } from "@/features/catchcopy/gemini";

/**
 * Server Action の実行結果を表す型。
 * クライアント（useActionState）はこの状態を見て表示を切り替える。
 */
export type CatchCopyState =
  /** 初期状態。 */
  | { status: "idle" }
  /** 生成成功。copies に結果が入る。 */
  | { status: "success"; copies: string[] }
  /**
   * 失敗。fieldErrors にはフィールド単位の検証エラーが入る（あれば）。
   */
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

/**
 * フォーム送信を受け取り、検証して Gemini でキャッチコピーを生成する。
 *
 * @param _prevState 直前の状態（useActionState から渡されるが未使用）。
 * @param formData   送信されたフォームデータ。
 * @returns 処理結果を表す CatchCopyState。
 */
export async function generateCopyAction(
  _prevState: CatchCopyState,
  formData: FormData,
): Promise<CatchCopyState> {
  // FormData から素の値を取り出す（この時点では未検証）。
  const rawInput = {
    productName: formData.get("productName"),
    description: formData.get("description"),
    tone: formData.get("tone"),
  };

  // サーバー側で必ず検証する。
  const parsed = catchCopySchema.safeParse(rawInput);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      status: "error",
      message: "入力内容をご確認ください。",
      fieldErrors,
    };
  }

  try {
    const copies = await generateCatchCopies(parsed.data);
    return { status: "success", copies };
  } catch (error) {
    // 開発者向けには詳細をログに残す。ユーザーには内部詳細を見せない。
    console.error("キャッチコピー生成に失敗しました:", error);
    return {
      status: "error",
      message:
        "生成に失敗しました。時間をおいて再度お試しください。（APIキーの設定もご確認ください）",
    };
  }
}
