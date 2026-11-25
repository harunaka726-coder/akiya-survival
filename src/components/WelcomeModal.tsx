"use client";

import { useEffect, useState } from "react";
import { APP_NAME, HOW_TO_PLAY_PATH } from "@/lib/site";
import Link from "next/link";

const STORAGE_KEY = "akiya-survival-welcome-v1";

export function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
      setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-end justify-center bg-ink/45 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div className="nb-card max-h-[85%] w-full max-w-sm overflow-y-auto bg-white p-4 animate-card-in">
        <p className="text-[11px] font-bold tracking-wide text-muted">はじめての方へ</p>
        <h2 id="welcome-title" className="mt-1 text-[20px] font-extrabold text-ink">
          {APP_NAME}
        </h2>
        <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-ink-soft">
          <p>
            相続や放置で手元に残った空家（負動産）を、何年も管理しながら出口を探すシミュレーションです。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>上部タイマーで年が進みます（倍速・一時停止・次へあり）</li>
            <li>イベントは内容を読んでから「どうする？」で決断</li>
            <li>アクションで勉強・相談・見積もりなどができます</li>
            <li>早めの対策ほど、出口は取りやすくなります</li>
          </ul>
          <p className="border-2 border-ink/20 bg-[#f8f7f4] p-2.5 text-[12px] leading-relaxed text-ink-soft">
            本アプリの Tips・制度の説明は学習用の簡易表現です。個別の判断や手続きについては、法律や制度の詳細を専門家や行政機関の窓口にご相談ください。
          </p>
        </div>
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={dismiss}
            className="nb-btn w-full bg-ink py-3 text-[14px] font-extrabold text-white"
          >
            はじめる
          </button>
          <Link
            href={HOW_TO_PLAY_PATH}
            onClick={dismiss}
            className="nb-btn block w-full bg-white py-2.5 text-center text-[13px] font-bold text-ink"
          >
            遊び方を詳しく見る
          </Link>
        </div>
      </div>
    </div>
  );
}
