/**
 * トップページ（AIキャッチコピー・ジェネレーター）。
 *
 * 画面の骨組みはサーバー側で描画する Server Component とし、
 * 入力・送信を行うフォーム部分のみ Client Component（CatchCopyForm）に委譲する。
 */
import { CatchCopyForm } from "@/app/components/CatchCopyForm";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-16">
      {/* 見出し */}
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          ✨ AIキャッチコピー・ジェネレーター
        </h1>
        <p className="mt-2 text-gray-600">
          商品やサービスの名前を入れるだけ。AIがキャッチコピーを5つ提案します。
        </p>
      </header>

      {/* 生成フォーム本体（Client Component） */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <CatchCopyForm />
      </section>

      <footer className="mt-8 text-center text-xs text-gray-400">
        Powered by Google Gemini ・ 日本AIハッカソン2026 リハーサル
      </footer>
    </main>
  );
}
