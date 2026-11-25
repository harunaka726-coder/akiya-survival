"use client";

import type { TagOption } from "@/types/game";
import { CATEGORY_LABEL } from "@/data/tags";

const difficultyLabel = {
  easy: "有利",
  normal: "標準",
  hard: "過酷",
} as const;

export function TagDetailSheet({
  tag,
  onClose,
}: {
  tag: TagOption;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-end justify-center bg-on-surface/40 p-3 backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tag-detail-title"
        className="animate-sheet-up w-full rounded-xl bg-surface-low p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] font-bold tracking-wide text-on-variant">
          {CATEGORY_LABEL[tag.category]}
        </p>
        <div className="mt-1 flex items-start justify-between gap-2">
          <h2 id="tag-detail-title" className="text-xl font-extrabold text-on-surface">
            {tag.label}
          </h2>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
              tag.difficulty === "easy"
                ? "bg-primary-container text-on-primary-container"
                : tag.difficulty === "hard"
                  ? "bg-error-container text-on-tertiary-container"
                  : "bg-secondary-container text-on-secondary-container"
            }`}
          >
            {difficultyLabel[tag.difficulty]}
          </span>
        </div>
        <p className="mt-3 text-[14px] leading-relaxed text-on-variant">{tag.description}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-bold text-on-primary"
        >
          とじる
        </button>
      </div>
    </div>
  );
}
