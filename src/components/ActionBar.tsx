"use client";

export function ActionBar({
  disabled,
  onAction,
  onSkip,
}: {
  disabled: boolean;
  onAction: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="shrink-0 border-t-2 border-ink bg-[#f8f7f4] p-2.5">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onAction}
          className="nb-btn flex-1 bg-ink py-3 text-sm font-extrabold text-white disabled:opacity-40"
        >
          アクション
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onSkip}
          className="nb-btn flex-1 bg-white py-3 text-sm font-extrabold text-ink disabled:opacity-40"
        >
          次へ
        </button>
      </div>
    </div>
  );
}
