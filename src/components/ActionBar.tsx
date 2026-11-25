"use client";

export function ActionBar({
  disabled,
  onAction,
  onSkip,
  popup = false,
}: {
  disabled: boolean;
  onAction: () => void;
  onSkip: () => void;
  /** PC：ポップアップ用（外枠なし） */
  popup?: boolean;
}) {
  return (
    <div
      className={
        popup
          ? "bg-[#f8f7f4] p-3"
          : "shrink-0 border-t-2 border-ink bg-[#f8f7f4] p-2.5"
      }
    >
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onAction}
          className={`nb-btn flex-1 bg-ink font-extrabold text-white disabled:opacity-40 ${
            popup ? "py-3.5 text-[15px]" : "py-3 text-sm"
          }`}
        >
          アクション
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onSkip}
          className={`nb-btn flex-1 bg-white font-extrabold text-ink disabled:opacity-40 ${
            popup ? "py-3.5 text-[15px]" : "py-3 text-sm"
          }`}
        >
          次へ
        </button>
      </div>
    </div>
  );
}
