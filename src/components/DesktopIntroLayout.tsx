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
import { DesktopHeader } from "@/components/DesktopHeader";
import { HouseVisual } from "@/components/HouseVisual";
import { SiteFooter } from "@/components/SiteFooter";
import { WelcomeModal } from "@/components/WelcomeModal";
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

/** PC専用：左右 4:6 のガチャ／設定画面 */
export function DesktopIntroLayout({
  state,
  onStart,
  onReroll,
  onApplyCustom,
  onHome,
}: {
  state: GameState;
  onStart: () => void;
  onReroll: () => void;
  onApplyCustom: (overrides: InitialOverrides) => void;
  onHome: () => void;
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
    mode === "custom" ? BUILDING_TAGS[tags.building].initialDecay : state.decay;
  const gachaTags = tagListFromState(state.tags);
  const shownSavings = mode === "gacha" ? state.savings : savings;
  const shownAge = mode === "gacha" ? state.age : age;

  return (
    <main
      className="desktop-stage desktop-ui relative flex h-dvh min-h-dvh flex-col text-[18px]"
      data-desktop-ui
    >
      <WelcomeModal />
      <div className="mx-auto flex h-full w-full max-w-[1440px] flex-col px-5 lg:px-8">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-x-2 border-ink bg-white shadow-[6px_6px_0_0_rgba(15,23,42,0.08)]">
          <DesktopHeader onHome={onHome} />
          <div className="grid min-h-0 flex-1 grid-cols-[4fr_6fr]">
            {/* 左：操作 */}
            <section className="flex min-h-0 flex-col overflow-hidden border-r-2 border-ink bg-white">
              <div className="flex flex-1 flex-col justify-center px-8 py-8">
                <p className="text-[20px] font-extrabold tabular-nums text-ink">
                  {shownSavings}万円 · {shownAge}歳
                </p>
                <div className="mt-6 flex justify-start">
                  <HouseVisual
                    decay={previewDecay}
                    vacantLevel={state.vacantLevel}
                    large
                  />
                </div>
                <div className="mt-6 grid max-w-md grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("gacha");
                      setOpenId(null);
                      onReroll();
                    }}
                    className={`border-2 border-ink py-3.5 text-[16px] font-extrabold ${
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
                    className={`border-2 border-ink py-3.5 text-[16px] font-extrabold ${
                      mode === "custom"
                        ? "bg-ink text-white shadow-[3px_3px_0_0_rgba(15,23,42,1)]"
                        : "bg-white text-ink-soft"
                    }`}
                  >
                    自分で設定
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    mode === "gacha"
                      ? onStart()
                      : onApplyCustom({ tags, age, savings })
                  }
                  className="nb-btn mt-6 max-w-md bg-ink py-4 text-[17px] font-extrabold text-white"
                >
                  この条件で始める
                </button>
              </div>
            </section>

            {/* 右：条件一覧 */}
            <section className="flex min-h-0 flex-col overflow-hidden bg-[#f8f7f4]">
              <div className="shrink-0 border-b-2 border-ink bg-white px-5 py-3.5">
                <p className="text-[20px] font-extrabold text-ink">
                  {mode === "gacha" ? "ガチャ結果" : "条件を設定"}
                </p>
              </div>
              <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-5 py-4">
                {mode === "gacha"
                  ? gachaTags.map((tag) => (
                      <AccordionTag
                        key={tag.id}
                        tag={tag}
                        open={openId === tag.id}
                        onToggle={() =>
                          setOpenId((id) => (id === tag.id ? null : tag.id))
                        }
                      />
                    ))
                  : (
                      <>
                        <NumberField
                          label="年齢"
                          value={age}
                          min={25}
                          max={75}
                          suffix="歳"
                          onChange={setAge}
                        />
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
                          onChange={(id) =>
                            setTags((t) => ({
                              ...t,
                              trigger: id as TriggerTagId,
                            }))
                          }
                          openId={openId}
                          setOpenId={setOpenId}
                        />
                        <SelectField
                          label="立地"
                          value={tags.location}
                          options={Object.values(LOCATION_TAGS)}
                          onChange={(id) =>
                            setTags((t) => ({
                              ...t,
                              location: id as LocationTagId,
                            }))
                          }
                          openId={openId}
                          setOpenId={setOpenId}
                        />
                        <SelectField
                          label="建物"
                          value={tags.building}
                          options={Object.values(BUILDING_TAGS)}
                          onChange={(id) =>
                            setTags((t) => ({
                              ...t,
                              building: id as BuildingTagId,
                            }))
                          }
                          openId={openId}
                          setOpenId={setOpenId}
                        />
                        <SelectField
                          label="家族"
                          value={tags.family}
                          options={Object.values(FAMILY_TAGS)}
                          onChange={(id) =>
                            setTags((t) => ({
                              ...t,
                              family: id as FamilyTagId,
                            }))
                          }
                          openId={openId}
                          setOpenId={setOpenId}
                        />
                        <SelectField
                          label="距離"
                          value={tags.distance}
                          options={Object.values(DISTANCE_TAGS)}
                          onChange={(id) =>
                            setTags((t) => ({
                              ...t,
                              distance: id as DistanceTagId,
                            }))
                          }
                          openId={openId}
                          setOpenId={setOpenId}
                        />
                      </>
                    )}
              </div>
            </section>
          </div>
        </div>
        <div className="shrink-0 border-x-2 border-ink bg-white">
          <SiteFooter showAd desktop />
        </div>
      </div>
    </main>
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
          <span className="block text-[12px] font-bold tracking-wide text-muted">
            {CATEGORY_LABEL[tag.category]}
          </span>
          <span className="block truncate text-[17px] font-extrabold text-ink">
            {tag.label}
          </span>
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-ink bg-[#f8f7f4] text-[12px] font-bold text-ink">
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <div className="border-t-2 border-ink bg-[#f8f7f4] px-3.5 py-2.5">
          <p className="text-[14px] leading-relaxed text-ink-soft">
            {tag.description}
          </p>
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
        <span className="text-[13px] font-bold text-muted">{label}</span>
        <span className="text-[16px] font-extrabold tabular-nums text-ink">
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
      <legend className="px-1 text-[13px] font-extrabold text-muted">
        {label}
      </legend>
      <div className="mt-1 space-y-1.5">
        {options.map((opt) => {
          const open = openId === `sel-${opt.id}`;
          const selected = value === opt.id;
          return (
            <div
              key={opt.id}
              className="min-w-0 overflow-hidden border-2 border-ink/20 bg-[#f8f7f4]"
            >
              <div className="flex min-w-0 gap-1.5 p-1.5">
                <button
                  type="button"
                  onClick={() => onChange(opt.id)}
                  className={`min-w-0 flex-1 truncate border-2 border-ink px-3 py-2 text-left text-[15px] font-bold ${
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
                  className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-ink bg-white text-[12px] font-bold text-ink"
                >
                  {open ? "▲" : "?"}
                </button>
              </div>
              {open && (
                <p className="border-t-2 border-ink/15 px-3 py-2 text-[14px] leading-relaxed text-ink-soft">
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
