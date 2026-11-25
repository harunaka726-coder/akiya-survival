"use client";

import { HouseVisual, houseModeFromState } from "@/components/HouseVisual";
import { tagListFromState, tagShortLabel } from "@/data/tags";
import { SAVINGS_BAR_MAX, type GameState } from "@/types/game";

function GaugeRow({
  label,
  value,
  display,
  tone = "teal",
  shake,
}: {
  label: string;
  value: number;
  display: string;
  tone?: "teal" | "ink" | "warn" | "danger";
  shake?: boolean;
}) {
  const v = Math.max(0, Math.min(100, value));
  const bar =
    tone === "danger"
      ? "bg-danger"
      : tone === "warn"
        ? "bg-warn"
        : tone === "ink"
          ? "bg-ink-soft"
          : "bg-teal";
  const text =
    tone === "danger"
      ? "text-danger"
      : tone === "warn"
        ? "text-warn"
        : "text-ink";

  return (
    <div className={`flex items-center gap-1.5 ${shake ? "animate-gauge-shake" : ""}`}>
      <span className="w-8 shrink-0 text-[11px] font-extrabold text-ink-soft">
        {label}
      </span>
      <div className="h-2 min-w-0 flex-1 overflow-hidden border border-ink/20 bg-[#e2e8f0]">
        <div
          className={`h-full transition-all duration-500 ${bar}`}
          style={{ width: `${v}%` }}
        />
      </div>
      <span className={`w-11 shrink-0 text-right text-[11px] font-extrabold tabular-nums ${text}`}>
        {display}
      </span>
    </div>
  );
}

export function StatusBar({
  state,
  decayShake,
}: {
  state: GameState;
  decayShake?: boolean;
}) {
  const mode = houseModeFromState(state.flags, state.ownership);
  const fundsPct = Math.max(0, Math.min(100, (state.savings / SAVINGS_BAR_MAX) * 100));
  const mind = 100 - state.stress;
  const tags = tagListFromState(state.tags);
  const alert =
    state.decay >= 80 || state.vacantLevel === "specified"
      ? "danger"
      : state.decay >= 60 || state.vacantLevel === "mismanaged"
        ? "warn"
        : "normal";
  const decayTone =
    alert === "danger" ? "danger" : alert === "warn" ? "warn" : "ink";

  return (
    <header
      className={`shrink-0 border-b-2 px-2.5 pb-2 pt-2 ${
        alert === "danger"
          ? "border-danger bg-[#fef2f2]"
          : alert === "warn"
            ? "border-warn bg-[#fffbeb]"
            : "border-ink bg-[#f8f7f4]"
      }`}
    >
      <p className="mb-1.5 text-[13px] font-extrabold tabular-nums leading-tight text-ink">
        {state.age}歳
        <span className="mx-1 text-muted">/</span>
        {state.year === 0 ? "開始" : `${state.year}年目`}
        {state.flags.bankrupted && (
          <span className="ml-1.5 border border-danger bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-danger">
            自己破産後
          </span>
        )}
      </p>

      {/* 絵の下端と、精神バー直下の条件タグの下端を揃える */}
      <div className="flex items-end gap-2.5">
        <HouseVisual
          decay={state.decay}
          vacantLevel={state.vacantLevel}
          mode={mode}
          compact
        />
        <div className="flex min-h-[92px] min-w-0 flex-1 flex-col justify-end gap-1">
          {(state.vacantLevel === "specified" ||
            state.vacantLevel === "mismanaged") && (
            <p
              className={`text-[11px] font-extrabold ${
                state.vacantLevel === "specified" ? "text-danger" : "text-warn"
              }`}
            >
              {state.vacantLevel === "specified"
                ? "特定空家等"
                : "管理不全空家等"}
            </p>
          )}
          <GaugeRow
            label="劣化"
            value={state.decay}
            display={`${Math.round(state.decay)}%`}
            tone={decayTone}
            shake={decayShake}
          />
          <GaugeRow
            label="資金"
            value={fundsPct}
            display={`${Math.round(state.savings)}万`}
          />
          <GaugeRow
            label="体力"
            value={state.stamina}
            display={`${Math.round(state.stamina)}%`}
          />
          <GaugeRow
            label="精神"
            value={mind}
            display={`${Math.round(mind)}%`}
          />
          <div className="flex flex-nowrap gap-1 overflow-x-auto pt-0.5">
            {tags.map((t) => (
              <span
                key={t.id}
                className="shrink-0 border border-ink/35 bg-white px-1.5 py-0.5 text-[10px] font-bold text-ink-soft"
              >
                {tagShortLabel(t)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
