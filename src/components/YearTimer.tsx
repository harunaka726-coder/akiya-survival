"use client";

import { SPEED_OPTIONS, yearDurationMs, type SpeedRate } from "@/types/game";

const BTN =
  "flex h-8 w-8 shrink-0 items-center justify-center border-2 text-[10px] font-bold leading-none";

export function YearTimer({
  progress,
  year: _year,
  speed,
  paused,
  frozen: _frozen,
  canSkip,
  onSpeed,
  onTogglePause,
  onSkip,
  onReset,
}: {
  progress: number;
  year: number;
  speed: SpeedRate;
  paused: boolean;
  frozen?: boolean;
  canSkip: boolean;
  onSpeed: (s: SpeedRate) => void;
  onTogglePause: () => void;
  onSkip: () => void;
  onReset?: () => void;
}) {
  void _year;
  void _frozen;
  const manual = speed === 0;
  const yearSec = manual ? null : Math.round(yearDurationMs(speed) / 1000);
  const remainRatio = Math.max(0, Math.min(1, 1 - progress));
  const remainPct = manual ? 100 : remainRatio * 100;

  const pace = manual ? "手動進行" : `1年＝${yearSec}秒`;

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
        <div className="flex shrink-0 items-center gap-0.5">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className={`${BTN} border-ink/30 bg-white text-ink`}
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
              className={`${BTN} ${
                speed === value
                  ? "border-ink bg-ink text-white"
                  : "border-ink/30 bg-white text-ink-soft"
              }`}
            >
              {label === "なし" ? "ﾅｼ" : label.replace("×", "")}
            </button>
          ))}
          <button
            type="button"
            onClick={onTogglePause}
            className={`${BTN} border-ink/30 bg-white text-ink`}
            aria-label={paused ? "再生" : "一時停止"}
          >
            {paused ? "▶" : "❚❚"}
          </button>
          <button
            type="button"
            disabled={!canSkip}
            onClick={onSkip}
            className={`${BTN} border-ink bg-ink text-white disabled:opacity-40`}
          >
            次
          </button>
        </div>
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
