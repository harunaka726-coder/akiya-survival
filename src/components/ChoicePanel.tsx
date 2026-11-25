"use client";

import type { PendingEvent } from "@/types/game";

export function ChoicePanel({
  event,
  remainMs,
  totalMs,
  onChoose,
  desktop = false,
}: {
  event: PendingEvent;
  remainMs: number;
  totalMs: number;
  onChoose: (choiceId: string) => void;
  /** 互換用（未使用：最初から選択肢表示） */
  thinkingActive?: boolean;
  onStartThinking?: () => void;
  /** PC：ポップアップ内表示 */
  desktop?: boolean;
}) {
  const timed = event.timed !== false;
  const pct = Math.max(0, Math.min(100, (remainMs / totalMs) * 100));
  const urgent = timed && remainMs <= 8000;
  const official =
    /助言|指導|勧告|命令|代執行|管理不全空家等|特定空家等|空家等に関する施策|納税通知|命令書|固定資産税の納税/.test(
      event.title,
    );

  return (
    <div
      className={`bg-white ${
        desktop ? "" : "shrink-0 border-t-2 border-ink"
      } ${urgent ? "animate-urgent" : ""}`}
    >
      <div className={`px-3 pt-2.5 ${official ? "font-serif" : ""}`}>
        {official && (
          <p className="mb-1 text-center text-[10px] font-bold tracking-[0.2em] text-muted">
            通　知　書
          </p>
        )}
        <p
          className={`font-extrabold leading-snug text-ink ${
            desktop ? "text-[17px]" : "text-[16px]"
          }`}
        >
          {event.title}
        </p>
        {event.body ? (
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
            {event.body}
          </p>
        ) : null}
        {event.legalNote && (
          <p className="mt-1.5 font-serif text-[11px] leading-snug text-muted">
            ※ {event.legalNote}
          </p>
        )}
      </div>

      {timed && (
        <div className="px-3 pt-2 font-sans">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[12px] font-extrabold tracking-wide text-muted">
              シンキングタイム
            </p>
            <p
              className={`text-[14px] font-black tabular-nums ${
                urgent ? "text-danger" : "text-ink"
              }`}
            >
              {Math.ceil(remainMs / 1000)}秒
            </p>
          </div>
          <div
            className="mb-2 h-2 overflow-hidden border border-ink/20 bg-[#e2e8f0]"
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="シンキングタイム"
          >
            <div
              className={`h-full transition-[width] duration-100 ${
                urgent ? "bg-danger" : "bg-ink"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <div
        className={`space-y-1.5 p-2.5 font-sans ${
          desktop ? "pb-3" : "max-h-[34vh] overflow-y-auto"
        }`}
      >
        {event.choices.map((choice, i) => (
          <button
            key={choice.id}
            type="button"
            onClick={() => onChoose(choice.id)}
            className="nb-btn flex w-full items-center gap-2.5 bg-[#f8f7f4] px-3 py-2.5 text-left"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-ink bg-ink text-[12px] font-extrabold text-white">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 text-[14px] font-bold text-ink">
              {choice.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** 互換：常にシンキング開始済み */
export function useThinkingGate(_pendingId: string | null, _timed: boolean) {
  return [true, () => {}] as const;
}
