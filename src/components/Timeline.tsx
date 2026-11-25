"use client";

import { useEffect, useRef, useState } from "react";
import type { TimelineEntry } from "@/types/game";

/** 役所・行政からの通知っぽいものだけ「通知書」体裁にする */
const OFFICIAL_NOTICE =
  /助言|指導|勧告|命令|代執行|管理不全空家等|特定空家等|空家等に関する施策|納税通知|命令書|固定資産税の納税/;

function isOfficialNotice(entry: TimelineEntry): boolean {
  return OFFICIAL_NOTICE.test(entry.title);
}

function DeltaChips({ deltas }: { deltas?: TimelineEntry["deltas"] }) {
  if (!deltas) return null;
  const items: string[] = [];
  // 表示順：劣化 → 資金 → 体力 → 精神
  if (deltas.decay) items.push(`劣化${deltas.decay > 0 ? "+" : ""}${deltas.decay}`);
  if (deltas.savings) items.push(`資金${deltas.savings > 0 ? "+" : ""}${deltas.savings}万`);
  if (deltas.stamina) items.push(`体力${deltas.stamina > 0 ? "+" : ""}${deltas.stamina}`);
  if (deltas.stress) {
    const mind = -deltas.stress;
    items.push(`精神${mind > 0 ? "+" : ""}${mind}`);
  }
  if (items.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {items.map((t) => (
        <span
          key={t}
          className="border border-ink/30 bg-[#f8f7f4] px-2 py-0.5 text-[10px] font-bold tabular-nums text-ink-soft"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function TipsNote({ note }: { note: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-[10px] font-bold text-teal underline-offset-2 hover:underline"
      >
        {open ? "Tips を閉じる" : "Tips"}
      </button>
      {open && (
        <p className="mt-1 border border-ink/20 bg-[#f8f7f4] px-2 py-1.5 font-serif text-[11px] leading-relaxed text-ink-soft">
          ※ {note}
        </p>
      )}
    </div>
  );
}

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [entries.length]);

  return (
    <div className="flex-1 overflow-y-auto px-3 py-2">
      <ol className="space-y-2.5">
        {entries.map((entry, i) => {
          const official = isOfficialNotice(entry);
          const danger = entry.tone === "danger";
          const warn = entry.tone === "warn";
          const cardClass = danger
            ? "nb-card-danger"
            : warn
              ? "nb-card-warn"
              : "nb-card";

          return (
            <li
              key={entry.id}
              className={`animate-card-in p-2.5 ${cardClass} ${
                official ? "font-serif" : ""
              }`}
              style={{ animationDelay: `${Math.min(i, 6) * 20}ms` }}
            >
              {official ? (
                <div className="mb-2 border-b border-ink/20 pb-1.5">
                  <p className="text-right text-[9px] font-bold tracking-widest text-muted">
                    空家対第{String(entry.year).padStart(3, "0")}号
                  </p>
                  <p className="text-center text-[11px] font-bold tracking-[0.2em] text-ink">
                    通　知　書
                  </p>
                </div>
              ) : (
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="border border-ink/30 bg-[#f8f7f4] px-2 py-0.5 text-[10px] font-bold text-ink-soft">
                    {entry.tone === "good"
                      ? "進展"
                      : entry.tone === "system"
                        ? "経過"
                        : "記録"}
                  </span>
                  <span className="text-[10px] font-medium tabular-nums text-muted">
                    {entry.year === 0 ? "開始" : `${entry.year}年目`}
                  </span>
                </div>
              )}

              <h3
                className={`leading-snug text-ink ${
                  official
                    ? "text-center text-[15px] font-bold tracking-wide"
                    : "text-[15px] font-extrabold font-sans"
                }`}
              >
                {entry.title}
              </h3>

              {official && (
                <p className="mt-2 text-center text-[11px] font-bold tracking-[0.3em] text-muted">
                  記
                </p>
              )}

              <p
                className={`mt-1 text-[13px] leading-relaxed text-ink-soft ${
                  official ? "" : "font-sans"
                }`}
              >
                {entry.body}
              </p>
              <DeltaChips deltas={entry.deltas} />
              {entry.legalNote && <TipsNote note={entry.legalNote} />}
            </li>
          );
        })}
      </ol>
      <div ref={endRef} className="h-2" />
    </div>
  );
}
