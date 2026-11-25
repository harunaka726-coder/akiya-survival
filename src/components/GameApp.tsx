"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  advanceYear,
  createInitialState,
  openPlayerActions,
  pickTimeoutChoice,
  resolveChoice,
  setPaused,
  setSpeed,
  startGame,
  type InitialOverrides,
} from "@/lib/gameEngine";
import {
  CHOICE_DURATION_MS,
  yearDurationMs,
  type GameState,
  type SpeedRate,
} from "@/types/game";
import { ActionBar } from "@/components/ActionBar";
import { AdminFlowStrip } from "@/components/AdminFlowStrip";
import { ChoicePanel, useThinkingGate } from "@/components/ChoicePanel";
import { DesktopHeader } from "@/components/DesktopHeader";
import { DesktopIntroLayout } from "@/components/DesktopIntroLayout";
import { DesktopPlayLayout } from "@/components/DesktopPlayLayout";
import { ResultScreen } from "@/components/ResultScreen";
import { SiteFooter } from "@/components/SiteFooter";
import { StartScreen } from "@/components/StartScreen";
import { StatusBar } from "@/components/StatusBar";
import { Timeline } from "@/components/Timeline";
import { WelcomeModal } from "@/components/WelcomeModal";
import { YearTimer } from "@/components/YearTimer";
import { useIsDesktop } from "@/hooks/useIsDesktop";

export function GameApp() {
  const isDesktop = useIsDesktop();
  const [state, setState] = useState<GameState | null>(null);
  const [yearProgress, setYearProgress] = useState(0);
  const [choiceRemain, setChoiceRemain] = useState(CHOICE_DURATION_MS);
  const [taxFloat, setTaxFloat] = useState<number | null>(null);
  const [decayShake, setDecayShake] = useState(false);
  const prevTimelineLen = useRef(0);

  const stateRef = useRef(state);
  stateRef.current = state;

  const yearElapsedRef = useRef(0);
  const yearLastTickRef = useRef<number | null>(null);
  const yearNumberRef = useRef(-1);

  const choiceElapsedRef = useRef(0);
  const choiceLastTickRef = useRef<number | null>(null);
  const choicePendingIdRef = useRef<string | null>(null);

  useEffect(() => {
    setState(createInitialState());
  }, []);

  const hardResetClocks = () => {
    yearElapsedRef.current = 0;
    yearLastTickRef.current = null;
    yearNumberRef.current = -1;
    choiceElapsedRef.current = 0;
    choiceLastTickRef.current = null;
    choicePendingIdRef.current = null;
    setYearProgress(0);
    setChoiceRemain(CHOICE_DURATION_MS);
  };

  const reroll = useCallback(() => {
    hardResetClocks();
    setState(createInitialState());
  }, []);

  const begin = useCallback(() => {
    hardResetClocks();
    setState((s) => (s ? startGame(s) : s));
  }, []);

  const applyCustom = useCallback((overrides: InitialOverrides) => {
    hardResetClocks();
    setState(startGame(createInitialState(overrides)));
  }, []);

  const choose = useCallback((choiceId: string) => {
    choiceElapsedRef.current = 0;
    choiceLastTickRef.current = null;
    choicePendingIdRef.current = null;
    setChoiceRemain(CHOICE_DURATION_MS);
    setState((s) => (s ? resolveChoice(s, choiceId) : s));
  }, []);

  const togglePause = useCallback(() => {
    yearLastTickRef.current = null;
    choiceLastTickRef.current = null;
    setState((s) => (s ? setPaused(s, !s.paused) : s));
  }, []);

  const changeSpeed = useCallback((speed: SpeedRate) => {
    setState((s) => {
      if (!s) return s;
      const oldNeed = yearDurationMs(s.speed);
      const newNeed = yearDurationMs(speed);
      if (speed === 0 || !Number.isFinite(newNeed)) {
        yearElapsedRef.current = 0;
        yearLastTickRef.current = null;
        setYearProgress(0);
      } else if (Number.isFinite(oldNeed) && oldNeed > 0) {
        const ratio = yearElapsedRef.current / oldNeed;
        yearElapsedRef.current = Math.min(newNeed, ratio * newNeed);
        yearLastTickRef.current = null;
        setYearProgress(Math.min(1, yearElapsedRef.current / newNeed));
      } else {
        yearElapsedRef.current = 0;
        yearLastTickRef.current = null;
        setYearProgress(0);
      }
      return setSpeed(s, speed);
    });
  }, []);

  const skipYear = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.phase !== "playing" || s.endingId || s.paused) return;
    yearElapsedRef.current = 0;
    yearLastTickRef.current = null;
    setYearProgress(0);
    setState(advanceYear(s));
  }, []);

  const openActions = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.phase !== "playing" || s.pending || s.endingId || s.paused) return;
    setState(openPlayerActions(s));
  }, []);

  const confirmReset = useCallback(() => {
    if (
      window.confirm("最初の画面に戻りますか？進行中のプレイは消えます。")
    ) {
      reroll();
    }
  }, [reroll]);

  useEffect(() => {
    if (!state || state.phase !== "playing") return;
    if (yearNumberRef.current === state.year) return;
    yearNumberRef.current = state.year;
    yearElapsedRef.current = 0;
    yearLastTickRef.current = null;
    setYearProgress(0);
  }, [state?.phase, state?.year]);

  useEffect(() => {
    if (!state || state.phase !== "playing") return;
    if (state.timeline.length <= prevTimelineLen.current) {
      prevTimelineLen.current = state.timeline.length;
      return;
    }
    prevTimelineLen.current = state.timeline.length;
    const last = state.timeline.at(-1);
    if (!last?.deltas) return;
    const timers: number[] = [];
    if (last.deltas.savings != null && last.deltas.savings < 0) {
      setTaxFloat(last.deltas.savings);
      timers.push(window.setTimeout(() => setTaxFloat(null), 1100));
    }
    if (last.deltas.decay != null && last.deltas.decay > 0) {
      setDecayShake(true);
      timers.push(window.setTimeout(() => setDecayShake(false), 400));
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [state?.phase, state?.timeline.length]);

  useEffect(() => {
    if (!state || state.phase !== "playing" || state.endingId) return;

    const id = window.setInterval(() => {
      const s = stateRef.current;
      if (!s || s.phase !== "playing" || s.endingId) return;

      const now = Date.now();
      const need = yearDurationMs(s.speed);

      if (s.paused || s.speed === 0 || !Number.isFinite(need)) {
        yearLastTickRef.current = null;
        if (s.speed !== 0 && Number.isFinite(need)) {
          setYearProgress(Math.min(1, yearElapsedRef.current / need));
        }
        return;
      }

      if (yearLastTickRef.current != null) {
        yearElapsedRef.current += now - yearLastTickRef.current;
      }
      yearLastTickRef.current = now;

      const p = Math.min(1, yearElapsedRef.current / need);
      setYearProgress(p);

      if (yearElapsedRef.current >= need) {
        yearElapsedRef.current = 0;
        yearLastTickRef.current = null;
        setYearProgress(0);
        const cur = stateRef.current;
        if (cur && cur.phase === "playing" && !cur.endingId && !cur.paused) {
          setState(advanceYear(cur));
        }
      }
    }, 50);

    return () => window.clearInterval(id);
  }, [state?.phase, state?.endingId]);

  const pendingTimed = state?.pending?.timed !== false;
  const [thinkingActive, startThinkingGate] = useThinkingGate(
    state?.pending?.id ?? null,
    pendingTimed && !!state?.pending,
  );
  const startThinking = useCallback(() => {
    choiceElapsedRef.current = 0;
    choiceLastTickRef.current = null;
    setChoiceRemain(CHOICE_DURATION_MS);
    startThinkingGate();
  }, [startThinkingGate]);

  useEffect(() => {
    if (!state || state.phase !== "playing" || !state.pending) return;

    if (state.pending.timed === false) {
      setChoiceRemain(CHOICE_DURATION_MS);
      return;
    }

    if (!thinkingActive) {
      choiceLastTickRef.current = null;
      return;
    }

    if (choicePendingIdRef.current !== state.pending.id) {
      choicePendingIdRef.current = state.pending.id;
      choiceElapsedRef.current = 0;
      choiceLastTickRef.current = null;
      setChoiceRemain(CHOICE_DURATION_MS);
    }

    const pendingId = state.pending.id;
    const id = window.setInterval(() => {
      const s = stateRef.current;
      if (!s?.pending || s.pending.id !== pendingId) return;
      if (s.pending.timed === false) return;

      const now = Date.now();
      if (s.paused) {
        choiceLastTickRef.current = null;
        const remain = Math.max(0, CHOICE_DURATION_MS - choiceElapsedRef.current);
        setChoiceRemain(remain);
        return;
      }

      if (choiceLastTickRef.current != null) {
        choiceElapsedRef.current += now - choiceLastTickRef.current;
      }
      choiceLastTickRef.current = now;

      const remain = Math.max(0, CHOICE_DURATION_MS - choiceElapsedRef.current);
      setChoiceRemain(remain);

      if (remain <= 0) {
        window.clearInterval(id);
        const cur = stateRef.current;
        if (cur?.pending && cur.pending.id === pendingId) {
          const autoId = pickTimeoutChoice(cur.pending);
          choiceElapsedRef.current = 0;
          choiceLastTickRef.current = null;
          choicePendingIdRef.current = null;
          setChoiceRemain(CHOICE_DURATION_MS);
          setState(resolveChoice(cur, autoId, { timedOut: true }));
        }
      }
    }, 50);

    return () => window.clearInterval(id);
  }, [state?.phase, state?.pending?.id, state?.pending?.timed, thinkingActive]);

  if (!state) {
    if (isDesktop) {
      return (
        <main className="desktop-stage flex min-h-dvh items-center justify-center">
          <p className="text-sm text-muted">初期条件を抽選中…</p>
        </main>
      );
    }
    return (
      <AppShell desktop={false}>
        <div className="flex h-full items-center justify-center bg-[#f8f7f4] text-sm text-muted">
          初期条件を抽選中…
        </div>
      </AppShell>
    );
  }

  if (state.phase === "intro") {
    if (isDesktop) {
      return (
        <DesktopIntroLayout
          state={state}
          onStart={begin}
          onReroll={reroll}
          onApplyCustom={applyCustom}
          onHome={confirmReset}
        />
      );
    }
    return (
      <AppShell desktop={false}>
        <div className="relative flex h-full flex-col">
          <WelcomeModal />
          <div className="min-h-0 flex-1 overflow-hidden">
            <StartScreen
              state={state}
              onStart={begin}
              onReroll={reroll}
              onApplyCustom={applyCustom}
            />
          </div>
          <SiteFooter showAd />
        </div>
      </AppShell>
    );
  }

  if (state.phase === "result") {
    if (isDesktop) {
      return (
        <main className="desktop-stage desktop-ui flex h-dvh min-h-dvh flex-col text-[18px]">
          <div className="mx-auto flex h-full w-full max-w-[1440px] flex-col px-5 lg:px-8">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-x-2 border-ink bg-white shadow-[6px_6px_0_0_rgba(15,23,42,0.08)]">
              <DesktopHeader onHome={confirmReset} />
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto max-w-3xl">
                  <ResultScreen
                    state={state}
                    onReplay={reroll}
                    embedFooter={false}
                  />
                </div>
              </div>
            </div>
            <div className="shrink-0 border-x-2 border-ink bg-white">
              <SiteFooter showAd={false} desktop />
            </div>
          </div>
        </main>
      );
    }
    return (
      <AppShell desktop={false}>
        <ResultScreen state={state} onReplay={reroll} />
      </AppShell>
    );
  }

  if (isDesktop) {
    return (
      <DesktopPlayLayout
        state={state}
        yearProgress={yearProgress}
        choiceRemain={choiceRemain}
        choiceTotalMs={CHOICE_DURATION_MS}
        taxFloat={taxFloat}
        decayShake={decayShake}
        thinkingActive={thinkingActive}
        onSpeed={changeSpeed}
        onTogglePause={togglePause}
        onSkip={skipYear}
        onReset={confirmReset}
        onHome={confirmReset}
        onAction={openActions}
        onChoose={choose}
        onStartThinking={startThinking}
      />
    );
  }

  return (
    <AppShell desktop={false}>
      <div className="relative flex h-full flex-col bg-[#f8f7f4]">
        {taxFloat != null && (
          <div className="pointer-events-none absolute left-1/2 top-24 z-20 -translate-x-1/2">
            <span className="animate-float-tax text-lg font-black tabular-nums text-danger">
              {taxFloat}万円
            </span>
          </div>
        )}
        <YearTimer
          progress={yearProgress}
          year={state.year}
          speed={state.speed}
          paused={state.paused}
          frozen={false}
          canSkip={!state.paused}
          onSpeed={changeSpeed}
          onTogglePause={togglePause}
          onSkip={skipYear}
          onReset={confirmReset}
        />
        <AdminFlowStrip
          vacantLevel={state.vacantLevel}
          adminStage={state.adminStage}
          orderIgnored={state.flags.ignoredOrder}
        />
        <StatusBar state={state} decayShake={decayShake} />
        <Timeline entries={state.timeline} />

        {!state.pending && (
          <ActionBar
            disabled={state.paused}
            onAction={openActions}
            onSkip={skipYear}
          />
        )}

        {state.pending && (
          <ChoicePanel
            event={state.pending}
            remainMs={choiceRemain}
            totalMs={CHOICE_DURATION_MS}
            onChoose={choose}
            thinkingActive={thinkingActive}
            onStartThinking={startThinking}
          />
        )}
        <SiteFooter showAd />
      </div>
    </AppShell>
  );
}

function AppShell({
  children,
  desktop: _desktop,
}: {
  children: React.ReactNode;
  desktop: boolean;
}) {
  void _desktop;
  return (
    <main className="flex min-h-dvh items-stretch justify-center bg-[#e2e8f0]">
      <div className="relative flex h-dvh w-full max-w-md flex-col overflow-hidden border-2 border-ink bg-[#f8f7f4] shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
        {children}
      </div>
    </main>
  );
}
