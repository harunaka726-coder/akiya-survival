"use client";

import { ActionBar } from "@/components/ActionBar";
import { AdminFlowStrip } from "@/components/AdminFlowStrip";
import { ChoicePanel } from "@/components/ChoicePanel";
import { DesktopHeader } from "@/components/DesktopHeader";
import { DraggablePopup } from "@/components/DraggablePopup";
import { SiteFooter } from "@/components/SiteFooter";
import { StatusBar } from "@/components/StatusBar";
import { Timeline } from "@/components/Timeline";
import { YearTimer } from "@/components/YearTimer";
import type { GameState, SpeedRate } from "@/types/game";

/** PC専用：左4：右6＝状況 / タイムライン＋下操作、選択肢はドラッグ可ポップアップ */
export function DesktopPlayLayout({
  state,
  yearProgress,
  choiceRemain,
  choiceTotalMs,
  taxFloat,
  decayShake,
  thinkingActive,
  onSpeed,
  onTogglePause,
  onSkip,
  onReset,
  onHome,
  onAction,
  onChoose,
  onStartThinking,
}: {
  state: GameState;
  yearProgress: number;
  choiceRemain: number;
  choiceTotalMs: number;
  taxFloat: number | null;
  decayShake: boolean;
  thinkingActive: boolean;
  onSpeed: (s: SpeedRate) => void;
  onTogglePause: () => void;
  onSkip: () => void;
  onReset: () => void;
  onHome: () => void;
  onAction: () => void;
  onChoose: (id: string) => void;
  onStartThinking: () => void;
}) {
  return (
    <main
      className="desktop-stage desktop-ui flex h-dvh min-h-dvh flex-col text-[18px]"
      data-desktop-ui
    >
      <div className="mx-auto flex h-full w-full max-w-[1440px] flex-col px-5 lg:px-8">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden border-x-2 border-b-0 border-ink bg-[#f8f7f4] shadow-[6px_6px_0_0_rgba(15,23,42,0.08)]">
          <DesktopHeader onHome={onHome} />
          <div className="grid min-h-0 flex-1 grid-cols-[4fr_6fr] gap-0">
            {/* 左：状態パネル（下まで埋める） */}
            <section className="flex min-h-0 flex-col overflow-hidden border-r-2 border-ink bg-[#f8f7f4]">
              <AdminFlowStrip
                vacantLevel={state.vacantLevel}
                adminStage={state.adminStage}
                orderIgnored={state.flags.ignoredOrder}
                desktop
              />
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <StatusBar state={state} decayShake={decayShake} desktop />
              </div>
            </section>

            {/* 右：タイムライン＋下にアクション／次へ */}
            <section className="relative flex min-h-0 flex-col overflow-hidden bg-[#f8f7f4]">
              <YearTimer
                progress={yearProgress}
                year={state.year}
                age={state.age}
                speed={state.speed}
                paused={state.paused}
                canSkip={!state.paused}
                onSpeed={onSpeed}
                onTogglePause={onTogglePause}
                onSkip={onSkip}
                onReset={onReset}
                desktop
              />
              {taxFloat != null && (
                <div className="pointer-events-none absolute left-1/2 top-20 z-20 -translate-x-1/2">
                  <span className="animate-float-tax text-2xl font-black tabular-nums text-danger">
                    {taxFloat}万円
                  </span>
                </div>
              )}
              <div className="min-h-0 flex-1 overflow-hidden">
                <Timeline entries={state.timeline} />
              </div>
              {!state.pending && (
                <ActionBar
                  disabled={state.paused}
                  onAction={onAction}
                  onSkip={onSkip}
                />
              )}
            </section>
          </div>

          {/* 選択肢ポップアップ（透過・ドラッグ可。背面の状況も見える） */}
          {state.pending && (
            <DraggablePopup
              resetKey={state.pending.id}
              label={state.pending.title}
            >
              <ChoicePanel
                event={state.pending}
                remainMs={choiceRemain}
                totalMs={choiceTotalMs}
                onChoose={onChoose}
                thinkingActive={thinkingActive}
                onStartThinking={onStartThinking}
                desktop
              />
            </DraggablePopup>
          )}
        </div>

        <div className="shrink-0 border-x-2 border-ink bg-white">
          <SiteFooter showAd desktop />
        </div>
      </div>
    </main>
  );
}
