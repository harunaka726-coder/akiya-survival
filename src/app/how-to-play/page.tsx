import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { SiteFooter } from "@/components/SiteFooter";
import { APP_NAME } from "@/lib/site";

export const metadata = {
  title: `遊び方 | ${APP_NAME}`,
  description: "空家サバイバルの遊び方・操作説明",
};

export default function HowToPlayPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-x-2 border-ink bg-[#f8f7f4]">
      <header className="shrink-0 border-b-2 border-ink bg-white px-4 py-4">
        <Link
          href="/"
          className="text-[11px] font-bold text-ink-soft underline-offset-2 hover:underline"
        >
          ← ホーム
        </Link>
        <h1 className="mt-2 text-[22px] font-extrabold text-ink">遊び方</h1>
        <p className="mt-1 text-[12px] text-muted">{APP_NAME}</p>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5 text-[13px] leading-relaxed text-ink-soft">
        <section>
          <h2 className="mb-1 text-[14px] font-extrabold text-ink">このゲームは？</h2>
          <p>
            相続や放置で手元に残った空家（いわゆる負動産）を、何年も管理しながら出口を探すシミュレーションです。
            税金・劣化・行政の階段・近隣トラブルが積み重なります。破産しても終わりません。終わるのは、手放すか、次世代に渡すか、です。
          </p>
        </section>

        <section>
          <h2 className="mb-1 text-[14px] font-extrabold text-ink">時間の流れ</h2>
          <p>
            画面上部のタイマーが1年分の時間です。倍速（0.25×〜4×）で早送りできます。
            「なし」にすると自動では進まず、「次へ」を押したときだけ年が進みます。
            決断中でも年は進みます（一時停止中を除く）。
          </p>
        </section>

        <section>
          <h2 className="mb-1 text-[14px] font-extrabold text-ink">できること</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>管理・修繕・解体・売却・相談・調べる・相続登記など</li>
            <li>イベントの選択肢で対応を決める（制限時間あり）</li>
            <li>行政の助言→指導→勧告→命令→代執行の流れを意識する</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-1 text-[14px] font-extrabold text-ink">Tipsについて</h2>
          <p>
            タイムラインの Tips はゲーム内の参考メモです。実在の制度に寄せていますが、個別の法的助言ではありません。
            実際の手続きは自治体・専門家に確認してください。
          </p>
        </section>

        <p>
          <Link
            href="/"
            className="inline-block border-2 border-ink bg-ink px-4 py-2 text-[13px] font-bold text-white"
          >
            プレイを始める
          </Link>
        </p>
      </div>

      <div className="shrink-0 border-t border-ink/10 px-3 pt-3">
        <AdSlot />
      </div>
      <SiteFooter />
    </main>
  );
}
