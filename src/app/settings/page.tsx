"use client";

import Link from "next/link";
import {
  APP_NAME,
  HOW_TO_PLAY_PATH,
  PRIVACY_POLICY_URL,
  contactUrlForLocale,
} from "@/lib/site";

export default function SettingsPage() {
  const contact = contactUrlForLocale();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-x-2 border-ink bg-[#f8f7f4]">
      <header className="shrink-0 border-b-2 border-ink bg-white px-4 py-4">
        <Link
          href="/"
          className="text-[11px] font-bold text-ink-soft underline-offset-2 hover:underline"
        >
          ← ホーム
        </Link>
        <h1 className="mt-2 text-[22px] font-extrabold text-ink">設定</h1>
        <p className="mt-1 text-[12px] text-muted">{APP_NAME}</p>
      </header>

      <div className="flex-1 px-4 py-5">
        <ul className="divide-y-2 divide-ink border-2 border-ink bg-white">
          <li>
            <a
              href={PRIVACY_POLICY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-3.5 text-[14px] font-bold text-ink"
            >
              プライバシーポリシー
              <span className="text-muted">↗</span>
            </a>
          </li>
          <li>
            <a
              href={contact}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-3.5 text-[14px] font-bold text-ink"
            >
              お問い合わせ
              <span className="text-muted">↗</span>
            </a>
          </li>
          <li>
            <Link
              href={HOW_TO_PLAY_PATH}
              className="flex items-center justify-between px-4 py-3.5 text-[14px] font-bold text-ink"
            >
              遊び方
              <span className="text-muted">→</span>
            </Link>
          </li>
        </ul>
        <p className="mt-4 text-[11px] leading-relaxed text-muted">
          お問い合わせは、端末の言語設定が日本語以外の場合は英語向けの連絡先へ案内します。
        </p>
      </div>
    </main>
  );
}
