"use client";

import type { AdminStage, VacantLevel } from "@/types/game";

const HOUSE_FLOW: { id: VacantLevel | "akiya"; label: string }[] = [
  { id: "akiya", label: "空家等" },
  { id: "mismanaged", label: "管理不全空家等" },
  { id: "specified", label: "特定空家等" },
];

function houseIndex(level: VacantLevel): number {
  if (level === "specified") return 2;
  if (level === "mismanaged") return 1;
  return 0;
}

export function AdminFlowStrip({
  vacantLevel,
  adminStage,
  orderIgnored,
  desktop = false,
}: {
  vacantLevel: VacantLevel;
  adminStage: AdminStage;
  orderIgnored: boolean;
  /** PC：タイトル付き・等幅チップ */
  desktop?: boolean;
}) {
  const hIdx = houseIndex(vacantLevel);

  return (
    <div
      className={`shrink-0 border-b-2 border-ink bg-white ${
        desktop ? "space-y-2 px-3 py-2" : "px-2.5 py-1.5"
      }`}
    >
      <FlowRow
        desktop={desktop}
        title={desktop ? "空家の状態" : undefined}
        items={HOUSE_FLOW.map((s, i) => ({
          key: s.id,
          label: s.label,
          active: i === hIdx,
          done: i < hIdx,
          danger: s.id === "specified" && i === hIdx,
          warn: s.id === "mismanaged" && i === hIdx,
        }))}
      />
      <FlowRow
        desktop={desktop}
        title={desktop ? "行政指導の段階" : undefined}
        items={[
          {
            key: "a1",
            label: "助言",
            active: adminStage === 1,
            done: adminStage > 1,
          },
          {
            key: "a2",
            label: "指導",
            active: adminStage === 2,
            done: adminStage > 2,
          },
          {
            key: "a3",
            label: "勧告",
            active: adminStage === 3,
            done: adminStage > 3,
          },
          {
            key: "a4",
            label: "命令",
            active: adminStage === 4 && !orderIgnored,
            done: adminStage >= 4 && orderIgnored,
          },
          {
            key: "a5",
            label: "代執行",
            active: orderIgnored,
            done: false,
            danger: orderIgnored,
          },
        ]}
      />
    </div>
  );
}

function FlowRow({
  items,
  desktop,
  title,
}: {
  items: {
    key: string;
    label: string;
    active: boolean;
    done: boolean;
    danger?: boolean;
    warn?: boolean;
  }[];
  desktop?: boolean;
  title?: string;
}) {
  if (!desktop) {
    return (
      <div className="mb-1 flex items-center gap-0.5 last:mb-0">
        {items.map((item, i) => (
          <div key={item.key} className="flex min-w-0 flex-1 items-center gap-0.5">
            <span
              className={`w-full truncate border px-1 py-0.5 text-center text-[10px] font-extrabold ${
                item.active
                  ? item.danger
                    ? "border-danger bg-danger text-white"
                    : item.warn
                      ? "border-warn bg-warn text-ink"
                      : "border-ink bg-ink text-white"
                  : item.done
                    ? "border-teal/40 bg-teal/15 text-teal"
                    : "border-ink/20 bg-[#f1f5f9] text-muted"
              }`}
            >
              {item.label}
            </span>
            {i < items.length - 1 && (
              <span className="shrink-0 text-[9px] text-muted" aria-hidden>
                ›
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  // PC：チップ同士を flex-1 の兄弟にして等幅（矢印はチップ外）
  return (
    <div>
      {title && (
        <p className="mb-1 text-[12px] font-extrabold tracking-wide text-muted">
          {title}
        </p>
      )}
      <div className="flex items-stretch gap-1">
        {items.map((item, i) => (
          <div key={item.key} className="contents">
            <span
              className={`desktop-flow-chip flex h-9 min-w-0 flex-1 items-center justify-center border-2 px-1 text-center text-[12px] font-extrabold leading-tight ${
                item.active
                  ? item.danger
                    ? "border-danger bg-danger text-white"
                    : item.warn
                      ? "border-warn bg-warn text-ink"
                      : "border-ink bg-ink text-white"
                  : item.done
                    ? "border-teal/40 bg-teal/15 text-teal"
                    : "border-ink/20 bg-[#f1f5f9] text-muted"
              }`}
            >
              <span className="line-clamp-2 break-keep">{item.label}</span>
            </span>
            {i < items.length - 1 && (
              <span
                className="desktop-flow-arrow flex shrink-0 items-center text-[16px] font-black leading-none text-ink"
                aria-hidden
              >
                ▶
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
