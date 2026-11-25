"use client";

import Link from "next/link";
import {
  DESKTOP_APP_TITLE,
  DESKTOP_APP_TITLE_MAIN,
  DESKTOP_APP_TITLE_SUB,
  HOW_TO_PLAY_PATH,
} from "@/lib/site";

/** PC専用：左上タイトル／右上メニュー */
export function DesktopHeader({ onHome }: { onHome: () => void }) {
  return (
    <header className="shrink-0 border-b-2 border-ink bg-white px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-ink">
            <span className="block sm:inline">{DESKTOP_APP_TITLE_MAIN}</span>
            <span className="mt-0.5 block text-[15px] font-bold text-ink-soft sm:mt-0 sm:ml-2 sm:inline">
              {DESKTOP_APP_TITLE_SUB}
            </span>
          </h1>
          <span className="sr-only">{DESKTOP_APP_TITLE}</span>
        </div>
        <nav className="flex shrink-0 items-center gap-1 pt-0.5">
          <button
            type="button"
            onClick={onHome}
            className="border-2 border-ink bg-white px-3.5 py-1.5 text-[15px] font-extrabold text-ink hover:bg-[#f8f7f4]"
          >
            ホーム
          </button>
          <Link
            href={HOW_TO_PLAY_PATH}
            className="border-2 border-ink bg-white px-3.5 py-1.5 text-[15px] font-extrabold text-ink hover:bg-[#f8f7f4]"
          >
            遊び方
          </Link>
        </nav>
      </div>
    </header>
  );
}
