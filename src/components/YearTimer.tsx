"use client";

import { SPEED_OPTIONS, yearDurationMs, type SpeedRate } from "@/types/game";

export function YearTimer({
  progress,
  year,
  age,
  speed,
  paused,
  frozen: _frozen,
  canSkip,
  onSpeed,
  onTogglePause,
  onSkip,
  onReset,
  desktop = false,
}: {
  progress: number;
  year: number;
  /** PCヘッダー左に出す年齢（desktop時） */
  age?: number;
  speed: SpeedRate;
  paused: boolean;
  frozen?: boolean;
  canSkip: boolean;
  onSpeed: (s: SpeedRate) => void;
  onTogglePause: () => void;
  onSkip: () => void;
  onReset?: () => void;
  /** true のとき PC 向け：年目・年齢＋右揃えコントロール */
  desktop?: boolean;
}) {
  void _frozen;
  const manual = speed === 0;
  const yearSec = manual ? null : Math.round(yearDurationMs(speed) / 1000);
  const remainRatio = Math.max(0, Math.min(1, 1 - progress));
  const remainPct = manual ? 100 : remainRatio * 100;

  const pace = manual ? "手動進行" : `1年＝${yearSec}秒`;

  const btn = desktop
    ? "flex h-9 min-w-[2.75rem] shrink-0 items-center justify-center border-2 px-1.5 text-[12px] font-bold leading-none"
    : "flex h-8 w-8 shrink-0 items-center justify-center border-2 text-[10px] font-bold leading-none";

  const speedLabel = (label: string) => {
    if (desktop) {
      if (label === "なし") return "なし";
      return label.replace("×", "X");
    }
    return label === "なし" ? "ﾅｼ" : label.replace("×", "");
  };

  const controls = (
    <div
      className={`flex shrink-0 flex-wrap items-center justify-end ${
        desktop ? "gap-1" : "gap-0.5"
      }`}
    >
      {desktop && (
        <span className="mr-1.5 text-[13px] font-bold tabular-nums text-ink-soft">
          {pace}
        </span>
      )}
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className={`${btn} border-ink/30 bg-white text-ink`}
          aria-label="最初に戻る"
          title="最初に戻る"
        >
          戻
        </button>
      )}
      {SPEED_OPTIONS.map(({ value, label }) => (
        <button
          key={String(value)}
          type="button"
          onClick={() => onSpeed(value)}
          className={`${btn} ${
            speed === value
              ? "border-ink bg-ink text-white"
              : "border-ink/30 bg-white text-ink-soft"
          }`}
        >
          {speedLabel(label)}
        </button>
      ))}
      <button
        type="button"
        onClick={onTogglePause}
        className={`${btn} border-ink/30 bg-white text-ink`}
        aria-label={paused ? "再生" : "一時停止"}
      >
        {paused ? "▶" : "❚❚"}
      </button>
      <button
        type="button"
        disabled={!canSkip}
        onClick={onSkip}
        className={`${btn} border-ink bg-ink text-white disabled:opacity-40`}
      >
        次
      </button>
    </div>
  );

  if (desktop) {
    return (
      <div className="shrink-0 border-b-2 border-ink bg-white px-5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="text-[24px] font-extrabold text-ink">
            {year === 0 ? "開始" : `${year}年目`}
            {age != null && (
              <span className="ml-2 text-[17px] font-bold text-ink-soft">
                {age}歳
              </span>
            )}
          </p>
          {controls}
        </div>
        <div
          className="mt-2.5 h-2.5 overflow-hidden border border-ink/20 bg-[#e2e8f0]"
          role="progressbar"
          aria-valuenow={Math.round(remainPct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="1年の残り"
          style={{ visibility: manual ? "hidden" : "visible" }}
        >
          <div
            className="h-full bg-ink transition-[width] duration-100"
            style={{ width: `${remainPct}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-b-2 border-ink bg-white px-2 pb-1.5 pt-1.5">
      <div className="flex items-center justify-between gap-1.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-bold leading-tight text-muted">
            <span className="text-ink">空家サバイバル</span>
            <span className="mx-1 text-muted/40">·</span>
            <span className="tabular-nums">{pace}</span>
          </p>
        </div>
        {controls}
      </div>

      <div
        className="mt-1.5 h-2 overflow-hidden border border-ink/20 bg-[#e2e8f0]"
        role="progressbar"
        aria-valuenow={Math.round(remainPct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="1年の残り"
        style={{ visibility: manual ? "hidden" : "visible" }}
      >
        <div
          className="h-full bg-ink transition-[width] duration-100"
          style={{ width: `${remainPct}%` }}
        />
      </div>
    </div>
  );
}
