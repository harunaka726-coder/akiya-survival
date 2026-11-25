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
import { ResultScreen } from "@/components/ResultScreen";
import { SiteFooter } from "@/components/SiteFooter";
import { StartScreen } from "@/components/StartScreen";
import { StatusBar } from "@/components/StatusBar";
import { Timeline } from "@/components/Timeline";
import { WelcomeModal } from "@/components/WelcomeModal";
import { YearTimer } from "@/components/YearTimer";

export function GameApp() {
  const [state, setState] = useState<GameState | null>(null);
  const [yearProgress, setYearProgress] = useState(0);
  const [choiceRemain, setChoiceRemain] = useState(CHOICE_DURATION_MS);
  const [taxFloat, setTaxFloat] = useState<number | null>(null);
  const [decayShake, setDecayShake] = useState(false);
  const prevTimelineLen = useRef(0);

  const stateRef = useRef(state);
  stateRef.current = state;

  /** 現在の年に経過した実時間（ms）。pause / アクション中は増やさない */
  const yearElapsedRef = useRef(0);
  const yearLastTickRef = useRef<number | null>(null);
  const yearNumberRef = useRef(-1);

  /** シンキングの経過（ms）。pause 中は増やさない */
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
    // 年タイマーはリセットしない（アクション／決断のあと続きから）
    choiceElapsedRef.current = 0;
    choiceLastTickRef.current = null;
    choicePendingIdRef.current = null;
    setChoiceRemain(CHOICE_DURATION_MS);
    setState((s) => (s ? resolveChoice(s, choiceId) : s));
  }, []);

  const togglePause = useCallback(() => {
    // pause 切替時は経過を保持。次回tickで lastTick を更新するだけ
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

  // 年が変わったら年クロックだけリセット
  useEffect(() => {
    if (!state || state.phase !== "playing") return;
    if (yearNumberRef.current === state.year) return;
    yearNumberRef.current = state.year;
    yearElapsedRef.current = 0;
    yearLastTickRef.current = null;
    setYearProgress(0);
  }, [state?.phase, state?.year]);

  // 税のフローティング／劣化シェイク
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

  // 1年タイマー——pause / pending / 速度変更でも経過を保持
  useEffect(() => {
    if (!state || state.phase !== "playing" || state.endingId) return;

    const id = window.setInterval(() => {
      const s = stateRef.current;
      if (!s || s.phase !== "playing" || s.endingId) return;

      const now = Date.now();
      const need = yearDurationMs(s.speed);

      // 手動進行（なし）または一時停止中は自動で進めない
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

  // シンキング——イベント確認後にだけ進む。pause しても残りを保持
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
    return (
      <PhoneShell>
        <div className="flex h-full items-center justify-center bg-[#f8f7f4] text-sm text-muted">
          初期条件を抽選中…
        </div>
      </PhoneShell>
    );
  }

  if (state.phase === "intro") {
    return (
      <PhoneShell>
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
      </PhoneShell>
    );
  }

  if (state.phase === "result") {
    return (
      <PhoneShell>
        <ResultScreen state={state} onReplay={reroll} />
      </PhoneShell>
    );
  }

  return (
    <PhoneShell>
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
          onReset={() => {
            if (
              window.confirm(
                "最初の画面に戻りますか？進行中のプレイは消えます。",
              )
            ) {
              reroll();
            }
          }}
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
        <SiteFooter />
      </div>
    </PhoneShell>
  );
}

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-stretch justify-center bg-[#e2e8f0] md:items-center md:p-6">
      <div className="relative flex h-dvh w-full max-w-md flex-col overflow-hidden border-2 border-ink bg-[#f8f7f4] shadow-[6px_6px_0_0_rgba(15,23,42,1)] md:h-[min(860px,92dvh)]">
        {children}
      </div>
    </main>
  );
}
