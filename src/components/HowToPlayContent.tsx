"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { DesktopHeader } from "@/components/DesktopHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { APP_NAME, DESKTOP_APP_TITLE_MAIN } from "@/lib/site";

const SECTIONS = [
  {
    title: "このゲームは？",
    body: (
      <p>
        相続や放置で手元に残った空家（いわゆる負動産）を、何年も管理しながら出口を探すシミュレーションです。
        税金・劣化・行政の階段・近隣トラブルが積み重なります。破産しても終わりません。終わるのは、手放すか、次世代に渡すか、です。
      </p>
    ),
  },
  {
    title: "時間の流れ",
    body: (
      <p>
        画面上部のタイマーが1年分の時間です。倍速（0.25X〜4X）で早送りできます。
        「なし」にすると自動では進まず、「次へ」を押したときだけ年が進みます。
        決断中でも年は進みます（一時停止中を除く）。
      </p>
    ),
  },
  {
    title: "できること",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>管理・修繕・解体・売却・相談・調べる・相続登記など</li>
        <li>イベントの選択肢で対応を決める（制限時間あり）</li>
        <li>行政の助言→指導→勧告→命令→代執行の流れを意識する</li>
      </ul>
    ),
  },
  {
    title: "Tipsについて",
    body: (
      <p>
        タイムラインの Tips はゲーム内の参考メモです。実在の制度に寄せていますが、個別の法的助言ではありません。
        実際の手続きは自治体・専門家に確認してください。
      </p>
    ),
  },
] as const;

export function HowToPlayContent() {
  const isDesktop = useIsDesktop();
  const router = useRouter();

  if (isDesktop) {
    return (
      <main className="desktop-stage desktop-ui flex min-h-dvh flex-col text-[18px]">
        <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col px-5 lg:px-8">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-x-2 border-ink bg-white shadow-[6px_6px_0_0_rgba(15,23,42,0.08)]">
            <DesktopHeader onHome={() => router.push("/")} />
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="border-b-2 border-ink bg-[#f8f7f4] px-8 py-6">
                <h1 className="text-[28px] font-extrabold text-ink">遊び方</h1>
                <p className="mt-1 text-[16px] font-bold text-ink-soft">
                  {DESKTOP_APP_TITLE_MAIN}
                </p>
              </div>
              <div className="mx-auto max-w-3xl space-y-8 px-8 py-8 text-[17px] leading-relaxed text-ink-soft">
                {SECTIONS.map((s) => (
                  <section key={s.title}>
                    <h2 className="mb-2 text-[20px] font-extrabold text-ink">
                      {s.title}
                    </h2>
                    {s.body}
                  </section>
                ))}
                <p>
                  <Link
                    href="/"
                    className="inline-block border-2 border-ink bg-ink px-5 py-3 text-[16px] font-extrabold text-white"
                  >
                    プレイを始める
                  </Link>
                </p>
              </div>
            </div>
          </div>
          <div className="shrink-0 border-x-2 border-ink bg-white">
            <SiteFooter showAd desktop />
          </div>
        </div>
      </main>
    );
  }

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
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="mb-1 text-[14px] font-extrabold text-ink">{s.title}</h2>
            {s.body}
          </section>
        ))}

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
