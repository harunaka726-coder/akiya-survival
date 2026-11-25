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
}: {
  vacantLevel: VacantLevel;
  adminStage: AdminStage;
  orderIgnored: boolean;
}) {
  const hIdx = houseIndex(vacantLevel);

  return (
    <div className="shrink-0 border-b-2 border-ink bg-white px-2.5 py-1.5">
      <FlowRow
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
}: {
  items: {
    key: string;
    label: string;
    active: boolean;
    done: boolean;
    danger?: boolean;
    warn?: boolean;
  }[];
}) {
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
            <span className="shrink-0 text-[9px] text-muted">›</span>
          )}
        </div>
      ))}
    </div>
  );
}
