"use client";

import { ENDINGS } from "@/data/endings";
import { tagListFromState, tagShortLabel } from "@/data/tags";
import { SiteFooter } from "@/components/SiteFooter";
import { buildShareText } from "@/lib/gameEngine";
import type { GameState } from "@/types/game";

export function ResultScreen({
  state,
  onReplay,
}: {
  state: GameState;
  onReplay: () => void;
}) {
  const ending = state.endingId ? ENDINGS[state.endingId] : null;
  if (!ending) return null;

  const shareText = buildShareText(state);
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const tags = tagListFromState(state.tags);

  return (
    <div className="flex h-full flex-col bg-[#f8f7f4]">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="border-b-2 border-ink bg-white px-4 pb-4 pt-5">
          <p className="text-right font-serif text-[10px] font-bold tracking-widest text-muted">
            空家対結第{String(state.year).padStart(3, "0")}号
          </p>
          <h1 className="mt-1 font-serif text-center text-[18px] font-bold tracking-[0.25em] text-ink">
            空家対策結果通知書
          </h1>
          <p className="mt-1 text-center font-sans text-[11px] text-muted">空家サバイバル</p>
        </div>

        <div className="space-y-3 px-4 py-4">
          <section className="nb-card p-3 font-serif">
            <p className="text-[10px] font-bold tracking-widest text-muted">
              {ending.subtitle}
            </p>
            <h2 className="mt-1 text-xl font-bold leading-snug text-ink">
              {ending.title}
            </h2>
            <p className="mt-3 text-center text-[10px] font-bold tracking-[0.3em] text-muted">
              記
            </p>
            <div className="mt-2 space-y-2">
              {ending.body.map((line) => (
                <p key={line} className="text-[13px] leading-relaxed text-ink-soft">
                  {line}
                </p>
              ))}
            </div>
          </section>

          <section className="nb-card p-3 font-sans">
            <h2 className="text-[11px] font-bold text-muted">集計</h2>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-[13px]">
              <Stat label="経過年数" value={`${state.year}年`} />
              <Stat label="最終年齢" value={`${state.age}歳`} />
              <Stat label="累計支払額" value={`約${Math.round(state.totalPaid)}万円`} />
              <Stat
                label="最終預貯金"
                value={`${Math.round(state.savings)}万円`}
                danger={state.savings < 0}
              />
              <Stat label="最終劣化度" value={`${Math.round(state.decay)}%`} />
              <Stat label="最終精神" value={`${Math.round(100 - state.stress)}%`} />
            </dl>
          </section>

          <section className="nb-card p-3">
            <h2 className="text-[11px] font-bold text-muted">初期条件</h2>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <li
                  key={t.id}
                  className="border border-ink/40 bg-[#f8f7f4] px-2.5 py-1 text-[11px] font-bold text-ink"
                >
                  {tagShortLabel(t)}
                </li>
              ))}
            </ul>
          </section>

          <section className="nb-card bg-ink p-4 text-center text-white">
            <p className="text-[12px] font-bold tracking-wide text-white/70">最後のアドバイス</p>
            <p className="mt-2 font-serif text-[17px] font-bold leading-snug">
              いちばん安い空家対策は、早めの一手です。
            </p>
            <p className="mt-2.5 font-sans text-[13px] leading-relaxed text-white/90">
              相続の前に話し合う。登記する。使う・貸す・売る・壊すを決める。
              <br />
              放置するほど、税・劣化・近隣・行政のコストは積み上がります。
              <br />
              あなたの家も、今から考えてみませんか。
            </p>
          </section>
        </div>
      </div>

      <div className="shrink-0 space-y-2 border-t-2 border-ink bg-white p-3">
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="nb-btn block w-full bg-ink py-3.5 text-center text-sm font-extrabold text-white"
        >
          Xで結果をシェア
        </a>
        <button
          type="button"
          onClick={onReplay}
          className="nb-btn w-full bg-white py-2.5 text-sm font-bold text-ink"
        >
          もう一度プレイ
        </button>
      </div>
      <SiteFooter />
    </div>
  );
}

function Stat({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] font-bold text-muted">{label}</dt>
      <dd
        className={`font-extrabold tabular-nums ${
          danger ? "text-danger" : "text-ink"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
