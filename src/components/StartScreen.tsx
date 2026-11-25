"use client";

import { useEffect, useState } from "react";
import {
  BUILDING_TAGS,
  CATEGORY_LABEL,
  DISTANCE_TAGS,
  FAMILY_TAGS,
  LOCATION_TAGS,
  TRIGGER_TAGS,
  tagListFromState,
} from "@/data/tags";
import { HouseVisual } from "@/components/HouseVisual";
import type {
  BuildingTagId,
  DistanceTagId,
  FamilyTagId,
  GameState,
  GameTags,
  LocationTagId,
  TagOption,
  TriggerTagId,
} from "@/types/game";
import type { InitialOverrides } from "@/lib/gameEngine";

type Mode = "gacha" | "custom";

export function StartScreen({
  state,
  onStart,
  onReroll,
  onApplyCustom,
}: {
  state: GameState;
  onStart: () => void;
  onReroll: () => void;
  onApplyCustom: (overrides: InitialOverrides) => void;
}) {
  const [mode, setMode] = useState<Mode>("gacha");
  const [tags, setTags] = useState<GameTags>(state.tags);
  const [age, setAge] = useState(state.age);
  const [savings, setSavings] = useState(state.savings);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setTags(state.tags);
    setAge(state.age);
    setSavings(state.savings);
  }, [state]);

  const previewDecay =
    mode === "custom"
      ? BUILDING_TAGS[tags.building].initialDecay
      : state.decay;
  const gachaTags = tagListFromState(state.tags);
  const shownSavings = mode === "gacha" ? state.savings : savings;
  const shownAge = mode === "gacha" ? state.age : age;

  return (
    <div className="relative flex h-full flex-col overflow-y-auto bg-[#f8f7f4]">
      <div className="border-b-2 border-ink bg-white px-4 pb-3 pt-4">
        <div className="flex items-end justify-between gap-3">
          <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-ink">
            空家サバイバル
          </h1>
          <HouseVisual
            decay={previewDecay}
            vacantLevel={state.vacantLevel}
            compact
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("gacha");
              setOpenId(null);
              onReroll();
            }}
            className={`border-2 border-ink py-2 text-xs font-extrabold ${
              mode === "gacha"
                ? "bg-ink text-white shadow-[3px_3px_0_0_rgba(15,23,42,1)]"
                : "bg-white text-ink-soft"
            }`}
          >
            実家ガチャ
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("custom");
              setTags(state.tags);
              setAge(state.age);
              setSavings(state.savings);
              setOpenId(null);
            }}
            className={`border-2 border-ink py-2 text-xs font-extrabold ${
              mode === "custom"
                ? "bg-ink text-white shadow-[3px_3px_0_0_rgba(15,23,42,1)]"
                : "bg-white text-ink-soft"
            }`}
          >
            自分で設定
          </button>
        </div>
      </div>

      {mode === "gacha" ? (
        <div className="flex-1 space-y-2 px-3 py-3">
          <p className="text-[12px] font-extrabold tabular-nums text-ink">
            {shownSavings}万円 · {shownAge}歳
          </p>
          {gachaTags.map((tag) => (
            <AccordionTag
              key={tag.id}
              tag={tag}
              open={openId === tag.id}
              onToggle={() => setOpenId((id) => (id === tag.id ? null : tag.id))}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 space-y-2.5 px-3 py-3">
          <p className="text-[12px] font-extrabold tabular-nums text-ink">
            {shownSavings}万円 · {shownAge}歳
          </p>
          <NumberField label="年齢" value={age} min={25} max={75} suffix="歳" onChange={setAge} />
          <NumberField
            label="預貯金"
            value={savings}
            min={50}
            max={1500}
            step={10}
            suffix="万円"
            onChange={setSavings}
          />
          <SelectField
            label="契機"
            value={tags.trigger}
            options={Object.values(TRIGGER_TAGS)}
            onChange={(id) => setTags((t) => ({ ...t, trigger: id as TriggerTagId }))}
            openId={openId}
            setOpenId={setOpenId}
          />
          <SelectField
            label="立地"
            value={tags.location}
            options={Object.values(LOCATION_TAGS)}
            onChange={(id) => setTags((t) => ({ ...t, location: id as LocationTagId }))}
            openId={openId}
            setOpenId={setOpenId}
          />
          <SelectField
            label="建物"
            value={tags.building}
            options={Object.values(BUILDING_TAGS)}
            onChange={(id) => setTags((t) => ({ ...t, building: id as BuildingTagId }))}
            openId={openId}
            setOpenId={setOpenId}
          />
          <SelectField
            label="家族"
            value={tags.family}
            options={Object.values(FAMILY_TAGS)}
            onChange={(id) => setTags((t) => ({ ...t, family: id as FamilyTagId }))}
            openId={openId}
            setOpenId={setOpenId}
          />
          <SelectField
            label="距離"
            value={tags.distance}
            options={Object.values(DISTANCE_TAGS)}
            onChange={(id) => setTags((t) => ({ ...t, distance: id as DistanceTagId }))}
            openId={openId}
            setOpenId={setOpenId}
          />
        </div>
      )}

      <div className="shrink-0 border-t-2 border-ink bg-white p-3">
        {mode === "gacha" ? (
          <button
            type="button"
            onClick={onStart}
            className="nb-btn w-full bg-ink py-3.5 text-sm font-extrabold text-white"
          >
            この条件で始める
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onApplyCustom({ tags, age, savings })}
            className="nb-btn w-full bg-ink py-3.5 text-sm font-extrabold text-white"
          >
            この条件で始める
          </button>
        )}
      </div>
    </div>
  );
}

function AccordionTag({
  tag,
  open,
  onToggle,
}: {
  tag: TagOption;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="nb-card w-full min-w-0 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full min-w-0 items-center gap-2 px-3.5 py-3 text-left"
      >
        <span className="min-w-0 flex-1 overflow-hidden">
          <span className="block text-[10px] font-bold tracking-wide text-muted">
            {CATEGORY_LABEL[tag.category]}
          </span>
          <span className="block truncate text-[15px] font-extrabold text-ink">
            {tag.label}
          </span>
        </span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-ink bg-[#f8f7f4] text-[11px] font-bold text-ink">
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <div className="border-t-2 border-ink bg-[#f8f7f4] px-3.5 py-2.5">
          <p className="text-[12px] leading-relaxed text-ink-soft">{tag.description}</p>
        </div>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix: string;
  onChange: (n: number) => void;
}) {
  return (
    <label className="nb-card block px-3 py-2.5">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-bold text-muted">{label}</span>
        <span className="text-sm font-extrabold tabular-nums text-ink">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-ink"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  openId,
  setOpenId,
}: {
  label: string;
  value: string;
  options: TagOption[];
  onChange: (id: string) => void;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) {
  return (
    <fieldset className="nb-card p-2.5">
      <legend className="px-1 text-[11px] font-extrabold text-muted">{label}</legend>
      <div className="mt-1 space-y-1.5">
        {options.map((opt) => {
          const open = openId === `sel-${opt.id}`;
          const selected = value === opt.id;
          return (
            <div key={opt.id} className="min-w-0 overflow-hidden border-2 border-ink/20 bg-[#f8f7f4]">
              <div className="flex min-w-0 gap-1.5 p-1.5">
                <button
                  type="button"
                  onClick={() => onChange(opt.id)}
                  className={`min-w-0 flex-1 truncate border-2 border-ink px-3 py-2 text-left text-[13px] font-bold ${
                    selected
                      ? "bg-ink text-white shadow-[2px_2px_0_0_rgba(15,23,42,1)]"
                      : "bg-white text-ink"
                  }`}
                >
                  {opt.label}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : `sel-${opt.id}`)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-ink bg-white text-[11px] font-bold text-ink"
                >
                  {open ? "▲" : "?"}
                </button>
              </div>
              {open && (
                <p className="border-t-2 border-ink/15 px-3 py-2 text-[12px] leading-relaxed text-ink-soft">
                  {opt.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
