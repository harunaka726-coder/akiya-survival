"use client";

import Link from "next/link";
import {
  COPYRIGHT,
  HOW_TO_PLAY_PATH,
  OTHER_WORKS_URL,
  PRIVACY_POLICY_URL,
  contactUrlForLocale,
} from "@/lib/site";
import { AdSlot } from "@/components/AdSlot";

export function SiteFooter({ showAd = false }: { showAd?: boolean }) {
  const contact = contactUrlForLocale();

  return (
    <footer className="shrink-0 border-t-2 border-ink bg-white px-2 py-2.5">
      {showAd && <AdSlot className="mb-2.5" />}
      <nav className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-[11px] font-bold leading-tight text-ink-soft">
        <Link href={HOW_TO_PLAY_PATH} className="underline-offset-2 hover:underline">
          遊び方
        </Link>
        <span className="text-muted">·</span>
        <a
          href={PRIVACY_POLICY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:underline"
        >
          プライバシーポリシー
        </a>
        <span className="text-muted">·</span>
        <a
          href={contact}
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:underline"
        >
          お問い合わせ
        </a>
        <span className="text-muted">·</span>
        <a
          href={OTHER_WORKS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:underline"
        >
          他の作品
        </a>
        <span className="text-muted">·</span>
        <span className="font-semibold text-muted">{COPYRIGHT}</span>
      </nav>
    </footer>
  );
}
