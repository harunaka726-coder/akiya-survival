import { ENDINGS } from "@/data/endings";
import { EVENTS } from "@/data/events";
import { PASSIVE_EVENTS } from "@/data/passiveEvents";
import { BUILDING_TAGS } from "@/data/tags";
import { SITE_URL } from "@/lib/site";
import type {
  EndingId,
  EventCondition,
  EventEffect,
  GameEvent,
  GameFlags,
  GameState,
  GameTags,
  PendingChoice,
  PendingEvent,
  TimelineEntry,
  VacantLevel,
} from "@/types/game";

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chance(p: number) {
  return Math.random() < p;
}

export function rollInitialTags(): GameTags {
  return {
    trigger: pickOne(["inherit", "consultation", "sudden_notice"] as const),
    location: pickOne(["urban", "suburban", "rural"] as const),
    building: pickOne(["seismic_new", "seismic_old"] as const),
    family: pickOne(["only_child", "siblings"] as const),
    distance: pickOne(["local", "remote"] as const),
  };
}

function initialSavings(tags: GameTags): number {
  let base = 300 + Math.floor(Math.random() * 301);
  if (tags.trigger === "consultation") base += 50;
  if (tags.trigger === "sudden_notice") base -= 40;
  if (tags.family === "siblings") base += 30;
  if (tags.distance === "remote") base += 20;
  return clamp(base, 220, 700);
}

function createFlags(tags: GameTags): GameFlags {
  const inherited =
    tags.trigger === "inherit" || tags.trigger === "sudden_notice";
  const windowOpen = inherited;
  return {
    inheritanceWindowOpen: windowOpen,
    inheritanceMonthsLeft: windowOpen ? 3 : 0,
    bankRegistered: false,
    saleAttempted: false,
    demolished: false,
    sold: false,
    consultedExpert: false,
    siblingNegotiated: false,
    siblingFailed: false,
    siblingDementia: false,
    orderIssued: false,
    ignoredOrder: false,
    subsidyApplied: false,
    subsidyRejectedYear: -1,
    adminExecuted: false,
    kokkoKizoku: false,
    neighborClaim: false,
    typhoonDamage: false,
    bankrupted: false,
    inherited,
    inheritanceRegistered: !inherited,
    inheritanceRegPenaltyPaid: false,
    knowsSubsidy: false,
    knowsAkiyaBank: false,
    knowsRenounce: false,
    knowsTransferDeduction: false,
    knowsInheritanceReg: false,
    studiedOnce: false,
    familyTalked: false,
    visitedHouse: false,
    demolishedAtYear: -1,
    belongingsCleared: false,
    butsudanCleared: false,
    demolishEstimated: false,
  };
}

/**
 * 管理不全／特定空家のラベルは「劣化％」ではなく行政措置の段階に連動させる。
 * 空家特措法の流れ（概略）：
 * 情報提供(12条) → 助言 → 指導 → 勧告 → 命令 → 代執行
 * 助言・指導＝管理不全として対応開始、勧告以降＝特定空家等としての措置が本格化、のイメージで表現。
 */
function vacantLevelFromAdmin(adminStage: number): VacantLevel {
  if (adminStage >= 3) return "specified";
  if (adminStage >= 1) return "mismanaged";
  return "none";
}

export const ADMIN_STAGE_LABEL = ["なし", "助言", "指導", "勧告", "命令"] as const;

function pushEntry(
  state: GameState,
  partial: Omit<TimelineEntry, "id" | "year" | "age"> &
    Partial<Pick<TimelineEntry, "year" | "age">>,
): GameState {
  const entry: TimelineEntry = {
    id: uid(),
    year: partial.year ?? state.year,
    age: partial.age ?? state.age,
    title: partial.title,
    body: partial.body,
    legalNote: partial.legalNote,
    tone: partial.tone,
    deltas: partial.deltas,
  };
  return { ...state, timeline: [...state.timeline, entry] };
}

function openingText(tags: GameTags, state: GameState): string {
  if (tags.trigger === "inherit") {
    return `${state.age}歳。預貯金${state.savings}万円。親の葬儀が終わり、実家だけが残った。固定資産税の納税通知は、これからあなたのところへ届く。`;
  }
  if (tags.trigger === "consultation") {
    return `${state.age}歳。預貯金${state.savings}万円。親から実家の今後について相談を受けた。まだ時間はある。選択肢も、まだ多い。`;
  }
  return `${state.age}歳。預貯金${state.savings}万円。疎遠だった大叔父の家について、遠方の自治体から連絡があった。戸籍上、相続人の一人にあなたの名がある。`;
}

function openingLegal(tags: GameTags): string {
  if (tags.trigger === "sudden_notice") {
    return "相続人が複数でも、所有者等として管理・対応を求められることがある。善意の放置は、ある日『管理不全空家等』の通知に変わる。";
  }
  if (tags.trigger === "inherit") {
    return "相続後に動かないほど、固定資産税と近隣クレームだけが確実に積み上がる。";
  }
  return "生前に話し合えるなら、それがいちばん安い空家対策になる。";
}

export interface InitialOverrides {
  tags?: GameTags;
  age?: number;
  savings?: number;
}

export function createInitialState(overrides?: InitialOverrides | GameTags): GameState {
  const opts: InitialOverrides =
    overrides && "trigger" in overrides
      ? { tags: overrides }
      : (overrides ?? {});

  const t = opts.tags ?? rollInitialTags();
  const decay = BUILDING_TAGS[t.building].initialDecay;
  const age = opts.age ?? 38 + Math.floor(Math.random() * 15);
  const savings = opts.savings ?? initialSavings(t);
  const state: GameState = {
    phase: "intro",
    tags: t,
    age: clamp(age, 25, 80),
    year: 0,
    savings: clamp(savings, 0, 2000),
    stamina: t.distance === "remote" ? 72 : 85,
    decay,
    stress: t.trigger === "sudden_notice" ? 25 : t.trigger === "consultation" ? 8 : 15,
    totalPaid: 0,
    ownership: t.family === "siblings" ? "shared" : "sole",
    vacantLevel: "none",
    adminStage: 0,
    flags: createFlags(t),
    timeline: [],
    usedEventIds: [],
    endingId: null,
    lastMessage: null,
    pending: null,
    paused: false,
    speed: 1,
    policy: "undecided",
    knowledge: 0,
  };

  return pushEntry(state, {
    title: "はじまり",
    body: openingText(t, state),
    legalNote: openingLegal(t),
    tone: t.trigger === "sudden_notice" ? "warn" : "system",
  });
}

export function startGame(state: GameState): GameState {
  return { ...state, phase: "playing", paused: false, pending: null };
}

export function setPaused(state: GameState, paused: boolean): GameState {
  return { ...state, paused };
}

export function setSpeed(state: GameState, speed: GameState["speed"]): GameState {
  return { ...state, speed };
}

/** 決断タイムアウト時：「放置する」を優先して自動選択 */
export function pickTimeoutChoice(pending: NonNullable<GameState["pending"]>): string {
  const byLabelExact = pending.choices.find((c) => c.label === "放置する");
  if (byLabelExact) return byLabelExact.id;

  const byLabel = pending.choices.find((c) => /放置/.test(c.label));
  if (byLabel) return byLabel.id;

  const wait = pending.choices.find((c) => c.special === "wait");
  if (wait) return wait.id;

  const passive = pending.choices.find((c) =>
    /ignore|later|skip|drawer|burnout|freeze|mute|hold|keep|return|deny|defy|wait/.test(
      c.id,
    ),
  );
  if (passive) return passive.id;

  return pending.choices.at(-1)?.id ?? pending.choices[0]!.id;
}

function annualTax(state: GameState): number {
  if (state.flags.sold) return 0;
  if (state.ownership === "cleared" && !state.flags.demolished) return 0;

  let tax = 8;
  if (state.tags.location === "urban") tax = 18;
  else if (state.tags.location === "suburban") tax = 10;
  else tax = 6;

  if (state.flags.demolished) tax = Math.round(tax * 2.2);
  else if (state.adminStage >= 3) tax = Math.round(tax * 1.8);

  if (state.tags.distance === "remote") tax += 2;
  return tax;
}

function annualDecayDelta(state: GameState): number {
  if (state.flags.demolished || state.flags.sold || state.ownership === "cleared") {
    return 0;
  }
  // 1〜2年で特定空家相当にならないよう、劣化はゆっくり
  let d = 2;
  if (state.tags.location === "rural") d += 2;
  if (state.tags.location === "urban") d += 1; // 近隣クレームは早いが、建物劣化は郊外ほど急ではない
  if (state.tags.building === "seismic_old") d += 1;
  if (state.tags.distance === "remote") d += 1; // 管理遅れ
  if (state.vacantLevel === "mismanaged") d += 1;
  if (state.vacantLevel === "specified") d += 2;
  if (state.flags.neighborClaim) d += 1;
  return d;
}

function matchesCondition(state: GameState, c?: EventCondition): boolean {
  if (!c) return true;
  if (c.minYear !== undefined && state.year < c.minYear) return false;
  if (c.maxYear !== undefined && state.year > c.maxYear) return false;
  if (c.minDecay !== undefined && state.decay < c.minDecay) return false;
  if (c.maxDecay !== undefined && state.decay > c.maxDecay) return false;
  if (c.minStress !== undefined && state.stress < c.minStress) return false;
  if (c.maxStress !== undefined && state.stress > c.maxStress) return false;
  if (c.minSavings !== undefined && state.savings < c.minSavings) return false;
  if (c.maxSavings !== undefined && state.savings > c.maxSavings) return false;
  if (c.minAdminStage !== undefined && state.adminStage < c.minAdminStage) return false;
  if (c.maxAdminStage !== undefined && state.adminStage > c.maxAdminStage) return false;
  if (c.ownership && !c.ownership.includes(state.ownership)) return false;

  if (c.requireTags) {
    for (const [k, v] of Object.entries(c.requireTags) as [keyof GameTags, string][]) {
      if (state.tags[k] !== v) return false;
    }
  }
  if (c.requireFlags) {
    for (const [k, v] of Object.entries(c.requireFlags) as [keyof GameFlags, boolean][]) {
      if (state.flags[k] !== v) return false;
    }
  }
  if (c.forbidFlags) {
    for (const [k, v] of Object.entries(c.forbidFlags) as [keyof GameFlags, boolean][]) {
      if (v && state.flags[k]) return false;
    }
  }
  return true;
}

function applyEffect(state: GameState, effect?: EventEffect): GameState {
  if (!effect) return state;
  const next: GameState = { ...state, flags: { ...state.flags } };

  if (effect.savings) {
    next.savings += effect.savings;
    if (effect.savings < 0) next.totalPaid += -effect.savings;
  }
  if (effect.decay) next.decay = clamp(next.decay + effect.decay, 0, 100);
  if (effect.stress) next.stress = clamp(next.stress + effect.stress, 0, 100);
  if (effect.stamina) next.stamina = clamp(next.stamina + effect.stamina, 0, 100);
  if (effect.adminStage !== undefined) next.adminStage = effect.adminStage;
  if (effect.ownership) next.ownership = effect.ownership;
  if (effect.setFlags) next.flags = { ...next.flags, ...effect.setFlags };
  if (effect.policy) next.policy = effect.policy;
  if (effect.knowledge) next.knowledge = Math.min(10, next.knowledge + effect.knowledge);

  next.vacantLevel = vacantLevelFromAdmin(next.adminStage);
  return next;
}

function drawEvent(state: GameState): GameEvent | null {
  if (state.flags.sold || state.ownership === "cleared") return null;

  const candidates = EVENTS.filter((e) => {
    if (e.condition?.once && state.usedEventIds.includes(e.id)) return false;
    return matchesCondition(state, e.condition);
  });
  if (candidates.length === 0) return null;

  const weights = candidates.map((e) => e.condition?.weight ?? 1);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return candidates[i]!;
  }
  return candidates.at(-1) ?? null;
}

function filterChoices(state: GameState, choices: PendingChoice[]): PendingChoice[] {
  return choices.filter((c) => {
    if (c.minSavings !== undefined && state.savings < c.minSavings) return false;
    if (c.requireKnowledge) {
      for (const k of c.requireKnowledge) {
        if (!state.flags[k]) return false;
      }
    }
    if (c.special === "renounce" && !state.flags.knowsRenounce) return false;
    if (c.special === "renounce" && !state.flags.inherited) return false;
    if (c.special === "sibling" && state.ownership !== "shared") return false;
    if (c.special === "sibling" && state.flags.siblingDementia) return false;
    if (c.special === "bank" && state.flags.bankRegistered) return false;
    if (c.special === "bank" && !state.flags.knowsAkiyaBank) return false;
    if (
      c.special === "bank" &&
      state.tags.location !== "suburban" &&
      state.tags.location !== "rural"
    ) {
      return false;
    }
    if (c.special === "kokko" && !state.flags.demolished) return false;
    if (c.special === "conclude") return false;
    if (c.special === "apply_subsidy" && !state.flags.knowsSubsidy) return false;
    if (c.special === "apply_subsidy" && state.flags.subsidyApplied) return false;
    if (
      c.special === "apply_subsidy" &&
      state.flags.subsidyRejectedYear === state.year
    ) {
      return false;
    }
    if (
      c.special === "register_inheritance" &&
      (!state.flags.inherited || state.flags.inheritanceRegistered)
    ) {
      return false;
    }
    if (c.special === "demolish") {
      // 親が存命（未相続）の家は勝手に解体できない
      if (!state.flags.inherited) return false;
      if (state.flags.siblingDementia) return false;
      if (state.ownership === "shared" && !state.flags.siblingNegotiated) return false;
      // 見積もり後は常に表示。未見積でも資金がだいたい足りそうなら表示
      if (!state.flags.demolishEstimated) {
        const roughMin = 220 + state.year * 8;
        const afterSubsidy = state.flags.subsidyApplied ? roughMin * 0.6 : roughMin;
        if (state.savings < afterSubsidy * 0.7) return false;
      }
    }
    if (c.special === "estimate_demolish") {
      if (!state.flags.inherited) return false;
      if (state.flags.demolished || state.flags.sold) return false;
    }
    return true;
  });
}

/** プレイヤー主導アクション中か（年タイマーは止めない） */
export function isPlayerActionPending(state: GameState): boolean {
  return state.pending?.id === "player_actions" || state.pending?.timeContinues === true;
}

/** プレイヤーがいつでも開けるアクションメニュー */
export function openPlayerActions(state: GameState): GameState {
  if (state.phase !== "playing" || state.pending || state.endingId) return state;

  const choices: PendingChoice[] = [
    { id: "act_study", label: "勉強する", special: "study" },
    { id: "act_consult", label: "窓口・専門家に相談する", special: "consult" },
    { id: "act_family", label: "家族で話し合う", special: "family_talk" },
  ];

  if (!state.flags.sold && state.ownership !== "cleared") {
    if (state.flags.demolished) {
      choices.push({
        id: "act_visit",
        label: "土地の様子を見に行く",
        special: "visit",
      });
    } else {
      choices.push({
        id: "act_visit",
        label: "空家の様子を見に行く",
        special: "visit",
      });
      if (state.flags.inherited) {
        if (!state.flags.demolishEstimated) {
          choices.push({
            id: "act_estimate_demolish",
            label: "解体費用の見積もりをとる",
            special: "estimate_demolish",
          });
        } else {
          choices.push({
            id: "act_demolish",
            label: "解体して更地に",
            special: "demolish",
          });
        }
      }
      if (state.flags.inherited && !state.flags.belongingsCleared) {
        choices.push({
          id: "act_belong_self",
          label: "荷物を自分で片付ける",
          special: "clear_belongings_self",
        });
        choices.push({
          id: "act_belong_pro",
          label: "荷物片付けを業者に依頼",
          special: "clear_belongings_pro",
        });
      }
      if (state.flags.inherited && !state.flags.butsudanCleared) {
        choices.push({
          id: "act_butsudan",
          label: "仏壇・祭祀を整理する",
          special: "clear_butsudan",
        });
      }
    }

    if (state.flags.knowsInheritanceReg && state.flags.inherited && !state.flags.inheritanceRegistered) {
      choices.push({
        id: "act_reg",
        label: "相続登記をする",
        special: "register_inheritance",
      });
    }
    if (
      state.flags.knowsSubsidy &&
      !state.flags.subsidyApplied &&
      !state.flags.demolished &&
      state.flags.subsidyRejectedYear !== state.year
    ) {
      choices.push({
        id: "act_subsidy",
        label: "除却補助金を調べて申請",
        special: "apply_subsidy",
      });
    }
    if (
      state.flags.knowsAkiyaBank &&
      !state.flags.bankRegistered &&
      !state.flags.demolished
    ) {
      choices.push({
        id: "act_bank",
        label: "空き家バンクに登録",
        special: "bank",
      });
    }
    if (state.flags.knowsRenounce && state.flags.inherited) {
      choices.push({
        id: "act_renounce",
        label: "相続放棄を検討",
        special: "renounce",
      });
    }
    if (
      state.tags.family === "siblings" &&
      state.ownership === "shared" &&
      !state.flags.siblingDementia
    ) {
      choices.push({
        id: "act_sibling",
        label: "兄弟と遺産分割協議",
        special: "sibling",
      });
    }
  }

  choices.push({
    id: "act_cancel",
    label: "やめる",
    effect: {},
    resultTitle: "アクションをやめた",
    resultBody: "また時間が流れる。",
    tone: "neutral",
  });

  const filtered = filterChoices(state, choices);
  return {
    ...state,
    pending: {
      id: "player_actions",
      title: "アクション",
      body: "",
      tone: "system",
      timed: false,
      timeContinues: true,
      choices: filtered.length > 0 ? filtered : choices,
    },
  };
}

function toPending(state: GameState, event: GameEvent): PendingEvent {
  return {
    id: event.id,
    title: event.title,
    body: event.body,
    legalNote: event.legalNote,
    tone: event.tone,
    choices: filterChoices(state, event.choices ?? []),
  };
}

function isPassiveEvent(event: GameEvent): boolean {
  return event.passive === true || !event.choices || event.choices.length === 0;
}

function drawPassive(state: GameState): GameEvent | null {
  if (state.flags.sold) return null;
  const candidates = PASSIVE_EVENTS.filter((e) => {
    if (e.condition?.once && state.usedEventIds.includes(e.id)) return false;
    return matchesCondition(state, e.condition);
  });
  if (candidates.length === 0) return null;
  const weights = candidates.map((e) => e.condition?.weight ?? 1);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return candidates[i]!;
  }
  return candidates.at(-1) ?? null;
}

function yearlyDecision(state: GameState): PendingEvent {
  if (state.flags.demolished && !state.flags.sold && !state.flags.kokkoKizoku) {
    const yearsOnLand =
      state.flags.demolishedAtYear >= 0
        ? state.year - state.flags.demolishedAtYear
        : 0;
    return {
      id: "after_demolish",
      title: "更地のその後",
      body:
        yearsOnLand >= 7
          ? `更地から${yearsOnLand}年。税と草刈りだけが続く。出口が見えない。`
          : "建物は消えた。だが土地の固定資産税は残る。田舎では更地でも買い手がつかないことが多い。",
      legalNote: "更地化で住宅用地特例が外れ税が増える場合がある。売却・国庫帰属も簡単ではない。",
      tone: "system",
      choices: filterChoices(state, [
        { id: "wait_land", label: "放置する（税だけ払う）", special: "wait" },
        { id: "mow_land", label: "草刈り・境界の手入れ", special: "maintain" },
        { id: "sell_land", label: "土地の売却を試みる", special: "sell" },
        { id: "consult_land", label: "専門家・窓口に相談", special: "consult" },
        { id: "kokko", label: "相続土地国庫帰属を申請", special: "kokko" },
        {
          id: "give_up_land",
          label: "もうギブアップする",
          effect: {},
          resultTitle: "現場から降りた",
          resultBody: "気力が尽きた。土地の名義と税は残るが、あなたはここまでだ。",
          tone: "danger",
          endingId: "land_giveup",
        },
      ]),
    };
  }

  const choices: PendingChoice[] = [
    { id: "wait", label: "放置する", special: "wait" },
    { id: "maintain", label: "草刈り・換気・小修繕", special: "maintain" },
    { id: "consult", label: "専門家・窓口に相談", special: "consult" },
    { id: "sell", label: "売却を試みる", special: "sell" },
  ];

  if (state.flags.inherited && !state.flags.belongingsCleared) {
    choices.push({
      id: "belong_self",
      label: "荷物を自分で片付ける",
      special: "clear_belongings_self",
    });
    choices.push({
      id: "belong_pro",
      label: "荷物片付けを業者に依頼",
      special: "clear_belongings_pro",
    });
  }
  if (state.flags.inherited && !state.flags.butsudanCleared) {
    choices.push({
      id: "butsudan",
      label: "仏壇・祭祀を整理する",
      special: "clear_butsudan",
    });
  }

  if (
    state.flags.knowsAkiyaBank &&
    (state.tags.location === "suburban" || state.tags.location === "rural") &&
    !state.flags.bankRegistered
  ) {
    choices.push({
      id: "bank",
      label: "空き家バンクに登録",
      special: "bank",
      requireKnowledge: ["knowsAkiyaBank"],
    });
  }

  if (
    state.tags.family === "siblings" &&
    state.ownership === "shared" &&
    !state.flags.siblingDementia
  ) {
    choices.push({
      id: "sibling",
      label: "兄弟と遺産分割協議",
      special: "sibling",
    });
  }

  if (state.flags.knowsRenounce && state.flags.inherited) {
    choices.push({
      id: "renounce",
      label: "相続放棄を検討",
      special: "renounce",
      requireKnowledge: ["knowsRenounce"],
    });
  }

  if (
    state.flags.knowsInheritanceReg &&
    state.flags.inherited &&
    !state.flags.inheritanceRegistered
  ) {
    choices.push({
      id: "reg_inherit",
      label: "相続登記をする",
      special: "register_inheritance",
    });
  }

  if (
    state.flags.knowsSubsidy &&
    !state.flags.subsidyApplied &&
    !state.flags.demolished &&
    state.flags.subsidyRejectedYear !== state.year
  ) {
    choices.push({
      id: "subsidy",
      label: "除却補助金を申請",
      special: "apply_subsidy",
      requireKnowledge: ["knowsSubsidy"],
    });
  }

  if (!state.flags.demolished && state.flags.inherited) {
    choices.push({
      id: "estimate_demolish",
      label: "解体費用の見積もりをとる",
      special: "estimate_demolish",
    });
    choices.push({
      id: "demolish",
      label: "解体して更地に",
      special: "demolish",
    });
  }

  const policyLabel: Record<string, string> = {
    undecided: "未定",
    self_use: "自ら活用",
    rent_sell: "貸す・売る",
    demolish: "解体する",
    manage: "管理継続",
    wait: "放置",
  };

  return {
    id: "yearly_decision",
    title: `${state.year}年目——どうする？`,
    body: `方針：${policyLabel[state.policy] ?? "未定"}。`,
    tone: "system",
    choices: filterChoices(state, choices),
  };
}

function finalizeEnding(state: GameState, ending: EndingId): GameState {
  let next: GameState = {
    ...state,
    endingId: ending,
    phase: "result",
    pending: null,
    paused: true,
  };
  if (ending === "generational_curse") {
    next = pushEntry(next, {
      title: "あなたの死——空家は残る",
      body: "解決できないまま生涯を閉じた。空家も近隣迷惑も残り、子どもが通知を受け取る。",
      legalNote: "未解決の空家・管理責任は、次世代へ引き継がれ得る。",
      tone: "danger",
    });
  }
  if (ending === "admin_execution") {
    next = pushEntry(next, {
      title: "代執行のあと",
      body: "公費で壊したあと、請求は所有者等へ。払えなければ他の相続人・共有者へ費用請求が広がることがある。",
      tone: "danger",
    });
  }
  return next;
}

/** 破綻しても空家は残る——ゲームは続く */
function applyBankruptcyCrisis(state: GameState): GameState {
  if (state.flags.bankrupted) {
    return {
      ...state,
      savings: Math.min(state.savings, 0),
      stress: Math.min(100, Math.max(state.stress, 85)),
      stamina: Math.min(state.stamina, 25),
    };
  }
  let next: GameState = {
    ...state,
    flags: { ...state.flags, bankrupted: true },
    savings: Math.min(state.savings, 0),
    stress: Math.max(state.stress, 90),
    stamina: Math.min(state.stamina, 20),
  };
  next = pushEntry(next, {
    title: "自己破産——でも空家は残る",
    body: "家計が先に折れた。手続きで借金は整理できても、現地の空家は消えない。雑草も苦情も続く。代執行になれば血税が投入され、その後の費用請求は他の兄弟等に向かうこともある。",
    legalNote:
      "自己破産しても不動産の管理問題が自動で消えるわけではない。行政代執行費用の費用請求は関係者に及ぶ場合がある。",
    tone: "danger",
    deltas: { stress: 10 },
  });
  return next;
}

function checkForcedEndings(state: GameState): GameState | null {
  // 命令無視後は代執行で解体——ただし更地の管理・費用請求は続く（即ゲームオーバーにしない）
  if (
    state.flags.ignoredOrder &&
    state.adminStage >= 4 &&
    !state.flags.demolished &&
    !state.flags.sold &&
    !state.flags.adminExecuted
  ) {
    let next: GameState = {
      ...state,
      flags: { ...state.flags },
      savings: state.savings - 350,
      totalPaid: state.totalPaid + 350,
      stress: clamp(state.stress + 20, 0, 100),
      stamina: Math.min(state.stamina, 25),
      decay: 0,
      adminStage: 0,
      vacantLevel: "none",
    };
    next.flags.demolished = true;
    next.flags.demolishedAtYear = state.year;
    next.flags.adminExecuted = true;
    next.flags.ignoredOrder = true;
    const execTitle = "行政代執行——建物は消えた。終わりではない";
    const execBody =
      "自治体が強制解体した。費用はいったん公費（血税）で立て替えられ、のちに所有者等へ請求される。破産していても他の兄弟・共有者へ徴収が向かうことがある。更地の固定資産税と雑草管理は、これから続く。";
    const execLegal =
      "行政代執行の費用は義務者負担。建物が消えても土地の管理・税・費用請求は残る。";
    next = pushEntry(next, {
      title: execTitle,
      body: execBody,
      legalNote: execLegal,
      tone: "danger",
      deltas: { savings: -350, stress: 20, decay: -100 },
    });
    // タイムラインの代執行通知と揃えた pending（更地決断は確認後）
    const landChoices = yearlyDecision(next).choices;
    next.pending = {
      id: "admin_execution_notice",
      title: execTitle,
      body: execBody,
      legalNote: execLegal,
      tone: "danger",
      timed: true,
      choices: landChoices,
    };
    return next;
  }
  // 勧告・命令を長期間放置＋高劣化でも代執行コースへ
  if (
    state.adminStage >= 4 &&
    state.decay >= 85 &&
    state.year >= 12 &&
    !state.flags.demolished &&
    !state.flags.sold
  ) {
    let next = {
      ...state,
      flags: { ...state.flags, ignoredOrder: true },
    };
    return checkForcedEndings(next);
  }
  // 更地から10年——出口なしでギブアップ
  if (
    state.flags.demolished &&
    !state.flags.sold &&
    !state.flags.kokkoKizoku &&
    state.flags.demolishedAtYear >= 0 &&
    state.year - state.flags.demolishedAtYear >= 10
  ) {
    return finalizeEnding(state, "land_giveup");
  }
  // 死亡・限界（未解決のまま）
  if (
    state.age >= 85 &&
    !state.flags.sold &&
    !state.flags.kokkoKizoku &&
    state.ownership !== "cleared"
  ) {
    if (state.flags.adminExecuted) {
      return finalizeEnding(state, "admin_execution");
    }
    if (state.flags.demolished) {
      return finalizeEnding(state, "land_giveup");
    }
    return finalizeEnding(state, "generational_curse");
  }
  return null;
}

/** 自動進行用：1年進め、選択待ちイベントをセット（開いていた決断は閉じる） */
export function advanceYear(state: GameState): GameState {
  if (state.phase !== "playing" || state.endingId) return state;

  let next: GameState = {
    ...state,
    pending: null,
    year: state.year + 1,
    age: state.age + 1,
    flags: { ...state.flags },
  };

  if (next.flags.inheritanceWindowOpen && next.flags.inheritanceMonthsLeft > 0) {
    next.flags.inheritanceMonthsLeft -= 1;
    if (next.flags.inheritanceMonthsLeft <= 0) {
      next.flags.inheritanceWindowOpen = false;
      next.flags.inheritanceMonthsLeft = 0;
    }
  }

  // 相続登記義務：3年目に未登記なら過料（いきなり科す）
  if (
    next.flags.inherited &&
    !next.flags.inheritanceRegistered &&
    !next.flags.inheritanceRegPenaltyPaid &&
    next.year === 3 &&
    !next.flags.sold
  ) {
    const fine = 10; // 万円（法定上限のイメージ）
    next.savings -= fine;
    next.totalPaid += fine;
    next.flags.inheritanceRegPenaltyPaid = true;
    next.stress = clamp(next.stress + 12, 0, 100);
    next = pushEntry(next, {
      title: "相続登記を怠った——過料",
      body: `3年目。登記しないままにしていたところ、過料${fine}万円相当の処分。名義の問題は、まだ残っている。`,
      legalNote:
        "相続登記は原則、相続開始を知った日から3年以内。正当な理由なく怠ると10万円以下の過料の対象になり得る。",
      tone: "danger",
      deltas: { savings: -fine, stress: 12 },
    });
  }

  // 譲渡所得3000万控除の期限リマインド（相続3年目）
  if (
    next.flags.inherited &&
    next.flags.knowsTransferDeduction &&
    !next.flags.sold &&
    !next.flags.demolished &&
    next.year === 3
  ) {
    next = pushEntry(next, {
      title: "控除の期限が近い",
      body: "空き家の譲渡所得3000万円特別控除——おおむね相続から3年を経過する年の年末まで。売るなら、今年が山場だ。",
      legalNote: "要件（耐震・除去など）を満たさないと使えない。期限後は通常課税に近づく。",
      tone: "warn",
    });
  }

  if (next.flags.demolished && !next.flags.sold && !next.flags.kokkoKizoku) {
    const tax = annualTax(next);
    next.savings -= tax;
    if (tax > 0) next.totalPaid += tax;
    const landBody = next.flags.adminExecuted
      ? `代執行後の更地。固定資産税 −${tax}万円。雑草と費用請求の心配は続く。`
      : `固定資産税 −${tax}万円。建物はない。土地の負担は残る。`;
    next = pushEntry(next, {
      title: `${next.year}年目——更地の管理`,
      body: landBody,
      tone: next.flags.adminExecuted ? "danger" : "system",
      deltas: { savings: -tax },
    });
    const forcedLand = checkForcedEndings(next);
    if (forcedLand) return forcedLand;
    if (next.savings < 0 || next.stress >= 100 || next.stamina <= 0) {
      next = applyBankruptcyCrisis(next);
    }
    next.pending = yearlyDecision(next);
    return next;
  }

  const tax = annualTax(next);
  const decayDelta = annualDecayDelta(next);

  const staminaDelta =
    (next.tags.distance === "remote" ? -3 : -1) +
    (next.stress >= 60 ? -3 : -1) +
    (tax > 15 ? -1 : 0);

  next.savings -= tax;
  if (tax > 0) next.totalPaid += tax;
  next.decay = clamp(next.decay + decayDelta, 0, 100);
  next.stress = clamp(next.stress + (tax > 15 ? 3 : 1), 0, 100);
  next.stamina = clamp(next.stamina + staminaDelta, 0, 100);

  // 命令後に手を打たなければ「無視」扱いへ
  if (
    next.flags.orderIssued &&
    !next.flags.demolished &&
    !next.flags.sold &&
    !next.flags.ignoredOrder
  ) {
    next.flags.ignoredOrder = true;
  }

  next.vacantLevel = vacantLevelFromAdmin(next.adminStage);

  next = pushEntry(next, {
    title: `${next.year}年目`,
    body:
      tax > 0
        ? `税・維持 −${tax}万 / 劣化 ${Math.round(next.decay)}%`
        : "時間だけが進む。",
    legalNote: "空家でも固定資産税は所有者に課税される。",
    tone: next.vacantLevel === "specified" ? "danger" : "system",
    deltas: {
      savings: -tax,
      decay: decayDelta,
      stress: tax > 15 ? 3 : 1,
      stamina: staminaDelta,
    },
  });

  const forced = checkForcedEndings(next);
  if (forced) return forced;

  if (next.savings < 0 || next.stress >= 100 || next.stamina <= 0) {
    next = applyBankruptcyCrisis(next);
  }

  // 生前相談：途中で親が亡くなる（未発生なら年が進むほど発生しやすく、5年目で強制）
  if (
    next.tags.trigger === "consultation" &&
    !next.flags.inherited &&
    !next.usedEventIds.includes("parent_passes") &&
    next.year >= 2 &&
    (next.year >= 5 || chance(0.28 + (next.year - 2) * 0.14))
  ) {
    const story = EVENTS.find((e) => e.id === "parent_passes");
    if (story) {
      if (story.effect) next = applyEffect(next, story.effect);
      next.usedEventIds = [...next.usedEventIds, story.id];
      next = pushEntry(next, {
        title: story.title,
        body: story.body,
        legalNote: story.legalNote,
        tone: story.tone,
      });
      const pending = toPending(next, story);
      next.pending = pending.choices.length > 0 ? pending : yearlyDecision(next);
      return next;
    }
  }

  // 行政イベントが条件を満たしていれば優先抽選（段階を飛ばさない）
  const ADMIN_IDS = new Set([
    "advice_notice",
    "guidance_notice",
    "recommendation_notice",
    "order_notice",
    "ignore_order_warning",
  ]);
  const adminReady = EVENTS.filter((e) => {
    if (!ADMIN_IDS.has(e.id)) return false;
    if (e.condition?.once && next.usedEventIds.includes(e.id)) return false;
    return matchesCondition(next, e.condition);
  });
  if (adminReady.length > 0 && chance(0.9)) {
    const story = adminReady[0]!;
    if (story.effect) next = applyEffect(next, story.effect);
    if (story.condition?.once) next.usedEventIds = [...next.usedEventIds, story.id];
    next = pushEntry(next, {
      title: story.title,
      body: story.body,
      legalNote: story.legalNote,
      tone: story.tone,
    });
    const pending = toPending(next, story);
    next.pending = pending.choices.length > 0 ? pending : yearlyDecision(next);
    return next;
  }

  // ときどき方針を問い直す
  if (
    next.year >= 1 &&
    next.year % 3 === 0 &&
    !next.usedEventIds.includes(`policy_check_${next.year}`) &&
    chance(0.7)
  ) {
    next.usedEventIds = [...next.usedEventIds, `policy_check_${next.year}`];
    next.pending = {
      id: "policy_check",
      title: "この空家、どうしたい？",
      body: "時間が経つたび、方針がぼやける。いまの本音はどれだ。",
      tone: "system",
      timed: true,
      choices: [
        { id: "p_use", label: "自ら活用する", special: "policy_self_use" },
        { id: "p_rent", label: "貸す・売る", special: "policy_rent_sell" },
        { id: "p_manage", label: "とりあえず管理し続ける", special: "policy_manage" },
        { id: "p_break", label: "解体する", special: "policy_demolish" },
        { id: "p_wait", label: "放置する", special: "policy_wait" },
      ],
    };
    return next;
  }

  // 35% 選択イベント / 40% 選択なし（近隣迷惑など） / 25% 年次決断
  const roll = Math.random();

  if (roll < 0.35) {
    const story = drawEvent(next);
    if (story && !isPassiveEvent(story)) {
      if (story.effect) next = applyEffect(next, story.effect);
      if (story.condition?.once) {
        next.usedEventIds = [...next.usedEventIds, story.id];
      }
      next = pushEntry(next, {
        title: story.title,
        body: story.body,
        legalNote: story.legalNote,
        tone: story.tone,
        deltas: story.effect
          ? {
              savings: story.effect.savings,
              decay: story.effect.decay,
              stress: story.effect.stress,
              stamina: story.effect.stamina,
            }
          : undefined,
      });
      const pending = toPending(next, story);
      next.pending = pending.choices.length > 0 ? pending : yearlyDecision(next);
      return next;
    }
  }

  if (roll < 0.75 || next.flags.neighborClaim) {
    const passive = drawPassive(next);
    if (passive) {
      if (passive.effect) next = applyEffect(next, passive.effect);
      if (passive.condition?.once) {
        next.usedEventIds = [...next.usedEventIds, passive.id];
      }
      next = pushEntry(next, {
        title: passive.title,
        body: passive.body,
        legalNote: passive.legalNote,
        tone: passive.tone,
        deltas: passive.effect
          ? {
              savings: passive.effect.savings,
              decay: passive.effect.decay,
              stress: passive.effect.stress,
              stamina: passive.effect.stamina,
            }
          : undefined,
      });
      // 選択なし——pending を置かず自動進行継続
      const forced2 = checkForcedEndings(next);
      return forced2 ?? next;
    }
  }

  next.pending = yearlyDecision(next);
  return next;
}

function saleSuccessRate(state: GameState): number {
  // TRUE ENDは稀に。放置・行政進行・更地田舎ほど売れない
  let rate = 0.12;
  if (state.flags.demolished) {
    rate = state.tags.location === "urban" ? 0.22 : state.tags.location === "suburban" ? 0.1 : 0.04;
    if (state.ownership === "shared") rate -= 0.15;
    return Math.max(0.02, Math.min(0.35, rate));
  }
  if (state.tags.location === "urban") rate += 0.22;
  if (state.tags.location === "suburban") rate += 0.06;
  if (state.tags.location === "rural") rate -= 0.06;
  if (state.tags.building === "seismic_new") rate += 0.1;
  if (state.tags.building === "seismic_old") rate -= 0.12;
  rate -= state.decay / 160;
  rate -= state.adminStage * 0.06;
  if (state.flags.bankRegistered) rate += 0.05;
  if (state.ownership === "shared") rate -= 0.22;
  if (state.flags.neighborClaim || state.flags.typhoonDamage) rate -= 0.08;
  if (state.year <= 2 && state.decay < 35 && state.adminStage === 0) rate += 0.12;
  // 都市部・低劣化は稀に売却成功しやすく
  if (state.tags.location === "urban" && state.decay < 30 && state.adminStage === 0) {
    rate += 0.14;
  }
  return Math.max(0.03, Math.min(0.58, rate));
}

type ConsultDesk = {
  who: string;
  costMan: number;
  tip: string;
  feeNote: string;
  flags: Partial<GameFlags>;
};

/** 行政ステージ・状態に応じて相談先を変える */
function pickConsultDesk(state: GameState): ConsultDesk {
  if (state.flags.demolished) {
    return pickOne([
      {
        who: "不動産会社（土地）",
        costMan: 0,
        tip: "更地の査定は厳しい。『値段がつく土地』と『つかない土地』の差を突きつけられた。",
        feeNote: "売却相談は無料のことが多い。仲介手数料は成約時。",
        flags: { consultedExpert: true },
      },
      {
        who: "法務局・国庫帰属の案内",
        costMan: 0,
        tip: "相続土地国庫帰属の要件・負担金の話を聞いた。簡単ボタンではない。",
        feeNote:
          "窓口案内は無料。申請は審査手数料（1筆1.4万円）＋負担金（更地の場合おおむね20万円／筆が目安、面積等で変動）が必要。",
        flags: { consultedExpert: true },
      },
      {
        who: "司法書士",
        costMan: 0.5,
        tip: "更地の名義・共有解消の手続きを整理した。",
        feeNote: "相談料の目安は30分あたり約5,000円。",
        flags: { consultedExpert: true, knowsInheritanceReg: true },
      },
    ]);
  }

  if (state.adminStage >= 3) {
    return pickOne([
      {
        who: "弁護士（初回相談）",
        costMan: 0.55,
        tip: "特定空家等の勧告・命令、近隣賠償、代執行時の費用請求リスクを整理した。",
        feeNote: "弁護士会相談は概ね30分5,500円（税込）。",
        flags: { consultedExpert: true, knowsTransferDeduction: true },
      },
      {
        who: "役所の空家対策担当課",
        costMan: 0,
        tip: "勧告・命令への対応期限と、除却補助金の最終チャンスを確認した。",
        feeNote: "自治体窓口は原則無料。",
        flags: { consultedExpert: true, knowsSubsidy: true },
      },
      {
        who: "解体工事業者の見積窓口",
        costMan: 0,
        tip: "緊急解体の見積を取った。高いが、代執行よりは自分で動いた方がマシ、と言われた。",
        feeNote: "見積は無料のことが多い。",
        flags: { consultedExpert: true, knowsSubsidy: true },
      },
    ]);
  }

  if (state.adminStage >= 1) {
    return pickOne([
      {
        who: "役所の空家対策担当課",
        costMan: 0,
        tip: "管理不全空家等としての指導内容と、改善すれば措置が止まる可能性を聞いた。除却補助金の案内ももらった。",
        feeNote: "自治体窓口は原則無料。",
        flags: { consultedExpert: true, knowsSubsidy: true },
      },
      {
        who: "司法書士",
        costMan: 0.5,
        tip: "名義・相続登記を急ぎ、処分できる状態にする話をした。",
        feeNote: "相談料の目安は30分あたり約5,000円。",
        flags: {
          consultedExpert: true,
          knowsInheritanceReg: true,
          knowsRenounce: true,
        },
      },
      {
        who: "自治体の空き家バンク担当",
        costMan: 0,
        tip: "管理不全のままでは登録しにくい、と釘を刺された。",
        feeNote: "自治体窓口は原則無料。",
        flags: { consultedExpert: true, knowsAkiyaBank: true },
      },
    ]);
  }

  // 初期：相続・売却の入口
  return pickOne([
    {
      who: "司法書士",
      costMan: 0.5,
      tip: "相続登記・名義・放棄の手続きの地図が少し見えた。",
      feeNote: "相談料の目安は30分あたり約5,000円（初回無料の事務所も多い）。",
      flags: {
        consultedExpert: true,
        knowsInheritanceReg: true,
        knowsRenounce: true,
      },
    },
    {
      who: "役所の空家対策担当課",
      costMan: 0,
      tip: "補助金・相談窓口・管理の目安を教えてもらった。",
      feeNote: "自治体窓口は原則無料。",
      flags: { consultedExpert: true, knowsSubsidy: true },
    },
    {
      who: "家庭裁判所の案内窓口",
      costMan: 0,
      tip: "相続放棄の熟慮期間と必要書類の話を聞いた。",
      feeNote: "案内は無料。申述には別途費用がかかる。",
      flags: { consultedExpert: true, knowsRenounce: true },
    },
    {
      who: "弁護士（初回相談）",
      costMan: 0.55,
      tip: "共有・賠償・譲渡所得の特例など、法的リスクを整理した。",
      feeNote: "全国目安は30分あたり約5,000〜10,000円。",
      flags: { consultedExpert: true, knowsTransferDeduction: true },
    },
    {
      who: "自治体の空き家バンク担当",
      costMan: 0,
      tip: "登録要件と『売れない物件』の現実を突きつけられた。",
      feeNote: "自治体窓口は原則無料。",
      flags: { consultedExpert: true, knowsAkiyaBank: true },
    },
  ]);
}

function urgentInheritanceRegPending(state: GameState): PendingEvent {
  return {
    id: "urgent_inheritance_reg",
    title: "相続登記——もう期限を過ぎている",
    body: "原則は相続から3年以内。今から急いで登記するか、このまま過料リスクを抱えるか。",
    legalNote:
      "正当な理由なく怠ると10万円以下の過料の対象になり得る。未登記のままでは処分も進みにくい。",
    tone: "danger",
    timed: true,
    timeContinues: true,
    choices: [
      { id: "urgent_reg_now", label: "急いで相続登記する", special: "register_inheritance" },
      {
        id: "urgent_reg_later",
        label: "放置する",
        effect: { stress: 10 },
        resultTitle: "登記を先延ばしにした",
        resultBody: "過料と、売れない・動けないリスクを、また一年先送りした。",
        tone: "danger",
      },
    ],
  };
}

type ResolveResult = {
  title: string;
  body: string;
  legalNote?: string;
  tone: TimelineEntry["tone"];
  effect: EventEffect;
  endingId?: EndingId;
};

function resolveSpecial(state: GameState, special: PendingChoice["special"]): ResolveResult {
  switch (special) {
    case "wait":
      if (state.flags.demolished) {
        return {
          title: "様子を見た",
          body: "更地のまま税だけ払った。草は伸び、隣から見張られているような気配だけが残る。",
          tone: "warn",
          effect: { stress: 4, stamina: 2 },
        };
      }
      return {
        title: "様子を見た",
        body: "何もしなかった。雑草は伸び、隣の家からは不満そうな目が向いている気がする。",
        tone: "warn",
        effect: {
          stress: 5,
          decay: 4,
          stamina: 3,
          setFlags: state.decay >= 35 ? { neighborClaim: true } : undefined,
        },
      };
    case "maintain": {
      const cost = state.flags.demolished ? randInt(3, 10) : randInt(5, 15);
      if (state.savings < cost) {
        return {
          title: "資金不足",
          body: `手入れには約${cost}万円必要だったが、足りない。`,
          tone: "warn",
          effect: { stress: 4, stamina: -2 },
        };
      }
      if (state.flags.demolished) {
        return {
          title: "土地を手入れした",
          body: `${cost}万円で草刈り・境界まわりの清掃。建物はない。税は残る。`,
          tone: "good",
          effect: {
            savings: -cost,
            stress: -randInt(2, 6),
            stamina: -6,
          },
        };
      }
      return {
        title: "手入れした",
        body: `${cost}万円で草刈り・換気・小修繕。一時しのぎ。`,
        tone: "good",
        effect: {
          savings: -cost,
          decay: -randInt(5, 12),
          stress: -randInt(4, 10),
          stamina: -8,
        },
      };
    }
    case "consult": {
      const desk = pickConsultDesk(state);
      const cost = desk.costMan;
      if (cost > 0 && state.savings < cost) {
        return {
          title: "相談できず",
          body: `${desk.who}の相談料（約${cost}万円）が足りない。`,
          tone: "warn",
          effect: { stress: 3, stamina: -2 },
        };
      }
      const costText =
        cost <= 0
          ? "無料"
          : cost < 1
            ? `約${Math.round(cost * 10000).toLocaleString("ja-JP")}円`
            : `約${cost}万円`;
      return {
        title: `${desk.who}に相談した`,
        body: `${desk.who}へ（${costText}）。${desk.tip}`,
        legalNote: desk.feeNote,
        tone: "good",
        effect: {
          savings: -cost,
          stress: -10,
          stamina: -5,
          knowledge: 1,
          setFlags: {
            ...desk.flags,
            ...(state.flags.inherited ? { knowsRenounce: true } : {}),
          },
        },
      };
    }
    case "study": {
      const lateDeduction = state.year >= 3 && state.flags.inherited;
      const lateReg =
        state.year >= 3 &&
        state.flags.inherited &&
        !state.flags.inheritanceRegistered;
      const topics: {
        title: string;
        body: string;
        flags: Partial<GameFlags>;
        legal?: string;
      }[] = [
        {
          title: "空家特措法を読んだ",
          body: "助言・指導・勧告・命令・代執行の階段が見えた。",
          flags: { studiedOnce: true, knowsSubsidy: true },
        },
        {
          title: "相続登記の義務を調べた",
          body: lateReg
            ? "原則は相続から3年以内。もう期限を過ぎている——今から急いで登記するか、過料リスクを抱えるかの二択だ。"
            : "相続で取得したら、原則3年以内に登記——怠ると過料の可能性がある。",
          flags: { studiedOnce: true, knowsInheritanceReg: true },
          legal:
            "令和6年から相続登記は義務。正当な理由なく怠ると10万円以下の過料の対象になり得る。",
        },
        {
          title: "譲渡所得の特例を調べた",
          body: lateDeduction
            ? "空き家の譲渡所得3000万円特別控除——おおむね相続から3年を経過する年の年末まで。もう間に合わない可能性が高い。"
            : "相続した空家を一定要件で譲渡すると、譲渡所得から最高3000万円控除できる制度がある。期限はおおむね相続から3年を経過する日の属する年の年末まで。",
          flags: { studiedOnce: true, knowsTransferDeduction: true },
          legal: "空き家の譲渡所得の3000万円特別控除（要件・期限あり）。",
        },
        {
          title: "空き家バンクと補助金を調べた",
          body: "自治体のバンク登録と、除却（解体）補助金のチラシをブックマークした。",
          flags: { studiedOnce: true, knowsAkiyaBank: true, knowsSubsidy: true },
        },
        {
          title: "相続放棄の期限を確認した",
          body: "自己のために相続の開始を知ったときから3ヶ月——家庭裁判所への申述が必要。",
          flags: { studiedOnce: true, knowsRenounce: true },
        },
      ];
      const topic = pickOne(topics);
      return {
        title: topic.title,
        body: topic.body,
        legalNote: topic.legal,
        tone: lateDeduction && topic.flags.knowsTransferDeduction ? "warn" : "good",
        effect: {
          stress: lateDeduction && topic.flags.knowsTransferDeduction ? 4 : -4,
          stamina: -3,
          knowledge: 1,
          setFlags: {
            ...topic.flags,
            ...(state.flags.inherited ? { knowsRenounce: true } : {}),
          },
        },
      };
    }
    case "visit": {
      const remote = state.tags.distance === "remote";
      const cost = remote ? randInt(3, 8) : randInt(0, 2);
      if (state.savings < cost) {
        return {
          title: "行けなかった",
          body: "交通費が足りず、現地確認を先延ばしにした。",
          tone: "warn",
          effect: { stress: 4 },
        };
      }
      if (state.flags.demolished) {
        return {
          title: "土地を見に行った",
          body: `更地に草が伸びている。境界杭だけが残り、隣の家から見られている気がする。${cost > 0 ? `（移動費約${cost}万円）` : ""}`,
          tone: "neutral",
          effect: {
            savings: -cost,
            stress: 2,
            stamina: remote ? -12 : -5,
            setFlags: { visitedHouse: true },
          },
        };
      }
      const saw =
        state.decay >= 50
          ? "雨漏りと倒木の気配。写真を撮って震えが止まらない。"
          : state.decay >= 30
            ? "ポストは溢れ、庭は膝まで草。隣家のカーテンが動いた。"
            : "まだ形はある。鍵を回す手が、少し重い。";
      return {
        title: "空家を見に行った",
        body: `${saw}${cost > 0 ? `（移動費約${cost}万円）` : ""}`,
        tone: state.decay >= 50 ? "warn" : "neutral",
        effect: {
          savings: -cost,
          stress: state.decay >= 40 ? 6 : -2,
          stamina: remote ? -12 : -5,
          decay: -randInt(1, 3),
          setFlags: { visitedHouse: true },
        },
      };
    }
    case "family_talk": {
      return {
        title: "家族で話し合った",
        body:
          state.tags.family === "siblings"
            ? "兄弟の温度差がはっきりした。誰かが『売れ』、誰かが『まだいい』と言う。"
            : "配偶者と子どもに現状を共有した。『私たちの老後にも残るの？』と聞かれた。",
        tone: "neutral",
        effect: {
          stress: state.tags.family === "siblings" ? 4 : -6,
          stamina: -2,
          setFlags: { familyTalked: true },
        },
      };
    }
    case "register_inheritance": {
      const cost = randInt(8, 18);
      if (state.savings < cost) {
        return {
          title: "相続登記できず",
          body: `司法書士報酬・登録免許税などで約${cost}万円必要。貯金が足りない。`,
          tone: "warn",
          effect: { stress: 5 },
        };
      }
      return {
        title: "相続登記をした",
        body: `約${cost}万円で名義を整理した。義務の第一歩は踏めた。`,
        legalNote:
          "相続登記は原則、相続開始を知った日から3年以内。怠ると過料の対象になり得る。",
        tone: "good",
        effect: {
          savings: -cost,
          stress: -8,
          setFlags: { inheritanceRegistered: true, knowsInheritanceReg: true },
        },
      };
    }
    case "apply_subsidy": {
      if (state.flags.subsidyRejectedYear === state.year) {
        return {
          title: "除却補助金——今年は締め切った",
          body: "今年はすでに見送りになっている。同じ年度に結果が覆ることはない。来年の公募を待つ。",
          tone: "warn",
          effect: { stress: 2 },
        };
      }
      if (chance(0.55)) {
        return {
          title: "除却補助金——採択の見込み",
          body: "窓口で要件を満たしそうだと分かった。解体時に数十万〜百万円程度の補助が期待できる。",
          legalNote: "補助金は自治体ごとに要件・予算・締切が異なる。",
          tone: "good",
          effect: {
            stress: -6,
            stamina: -4,
            setFlags: { subsidyApplied: true, knowsSubsidy: true },
          },
        };
      }
      return {
        title: "除却補助金——今回は厳しい",
        body: "予算枠・老朽度・道路要件などで見送り。同じ年に再申請しても結果は変わらない。来年度の公募を待つしかない。",
        tone: "warn",
        effect: {
          stress: 4,
          stamina: -3,
          setFlags: {
            knowsSubsidy: true,
            subsidyRejectedYear: state.year,
          },
        },
      };
    }
    case "policy_self_use":
      return {
        title: "方針：自ら活用する",
        body: "移住・二拠点・親族の居住——いずれにせよ、手がかかる道を選んだ。",
        tone: "good",
        effect: { policy: "self_use", stress: -3 },
      };
    case "policy_rent_sell":
      return {
        title: "方針：他人に貸す・売る",
        body: "出口は市場に置く。成約までは管理が続く。",
        tone: "good",
        effect: { policy: "rent_sell", stress: -2 },
      };
    case "policy_demolish":
      return {
        title: "方針：壊す",
        body: "解体費用は年々高騰している。解体後は住宅用地特例が外れ固定資産税が上がる可能性も。",
        tone: "warn",
        effect: { policy: "demolish", stress: 2 },
      };
    case "clear_belongings_self": {
      const cost = randInt(2, 8);
      const days = state.tags.distance === "remote" ? "往復と宿泊を含め数日" : "週末まるごと";
      if (state.savings < cost) {
        return {
          title: "片付け中断",
          body: `ゴミ袋とガソリン代で約${cost}万円。資金が足りず、段ボールは玄関に残った。`,
          tone: "warn",
          effect: { stress: 4, stamina: -6 },
        };
      }
      return {
        title: "荷物を自分で片付けた",
        body: `${days}を使い、約${cost}万円分の廃棄・搬送。押し入れの奥から写真が出てきた。処分はまだ半分だ。`,
        legalNote:
          "残置物がある限り売却・賃貸は進みにくい。相続人間で『誰の荷物か』でもめることもある。",
        tone: "good",
        effect: {
          savings: -cost,
          stress: -4,
          stamina: state.tags.distance === "remote" ? -18 : -12,
          setFlags: { belongingsCleared: true },
        },
      };
    }
    case "clear_belongings_pro": {
      const cost = randInt(25, 55);
      if (state.savings < cost) {
        return {
          title: "見積だけ取った",
          body: `遺品整理の見積は約${cost}万円。口座残高が足りず、契約書に判は押せなかった。`,
          tone: "warn",
          effect: { stress: 5 },
        };
      }
      return {
        title: "業者に片付けを依頼した",
        body: `遺品整理一式で約${cost}万円。室内は空になった。建物の傷みと名義の問題は、そのまま残っている。`,
        legalNote:
          "業者費用は地域・量で大きく振れる。貴重品の扱いと処分証明の有無は事前に確認する。",
        tone: "good",
        effect: {
          savings: -cost,
          stress: -8,
          stamina: -4,
          setFlags: { belongingsCleared: true },
        },
      };
    }
    case "clear_butsudan": {
      const cost = randInt(5, 20);
      if (state.savings < cost) {
        return {
          title: "仏壇は手つかず",
          body: `閉眼供養や搬送で約${cost}万円が見込まれる。資金が足りず、居間の仏壇だけが残った。`,
          tone: "warn",
          effect: { stress: 6 },
        };
      }
      return {
        title: "仏壇を整理した",
        body: `閉眼・搬送・処分で約${cost}万円。親族への連絡に半日かかった。家の中の『誰かの気配』が、少し薄れた。`,
        legalNote:
          "祭祀財産の扱いは相続人の話し合いが必要になることが多い。勝手な処分はトラブルの種になる。",
        tone: "good",
        effect: {
          savings: -cost,
          stress: -6,
          stamina: -5,
          setFlags: { butsudanCleared: true },
        },
      };
    }
    case "policy_manage":
      return {
        title: "方針：とりあえず管理し続ける",
        body: "草刈りと納税を続ける。出口は、まだ決めていない。",
        tone: "neutral",
        effect: { policy: "manage" },
      };
    case "policy_wait":
      return {
        title: "方針：様子を見る",
        body: "決めたことは『まだ決めない』こと。時間だけが確実に減る。",
        tone: "warn",
        effect: { policy: "wait", stress: 3 },
      };
    case "sell": {
      const cost = randInt(0, 5);
      const rate = saleSuccessRate(state);
      const within3 =
        state.flags.inherited && state.year > 0 && state.year <= 3;
      const canDeduct =
        within3 &&
        state.flags.knowsTransferDeduction &&
        !state.flags.demolished;
      if (chance(rate)) {
        const early =
          !state.flags.demolished &&
          state.year <= 2 &&
          state.decay < 35 &&
          state.adminStage === 0 &&
          state.tags.building === "seismic_new";
        let price = state.flags.demolished
          ? state.tags.location === "urban"
            ? randInt(40, 180)
            : state.tags.location === "suburban"
              ? randInt(5, 60)
              : randInt(0, 15)
          : state.tags.location === "urban"
            ? randInt(120, 320)
            : state.tags.location === "suburban"
              ? randInt(20, 100)
              : randInt(0, 25);
        // 3000万控除を知って期限内なら、手取りイメージを少し厚く（税負担軽減の簡易表現）
        const deductBonus = canDeduct ? randInt(15, 40) : 0;
        price += deductBonus;
        return {
          title: early
            ? "売却成功——早期決断"
            : canDeduct
              ? "売却成功——3000万控除を活用"
              : state.flags.demolished
                ? "土地を手放せた"
                : "赤字気味でも売却",
          body: state.flags.demolished
            ? `更地を${price}万円で処分。得はないが、税と近隣迷惑の当事者からは降りた。`
            : canDeduct
              ? `${price}万円相当で手放せた。相続から3年を経過する年の年末までの譲渡所得3000万円特別控除を検討できたのが大きかった。`
              : within3 && !state.flags.knowsTransferDeduction
                ? `${price}万円で手放せた。控除の制度を知らぬまま期限が迫っていた——勉強していれば違ったかも。`
                : `${price}万円で手放せた。得は少ない。だが近所への迷惑は止まった。`,
          legalNote: canDeduct
            ? "空き家の譲渡所得の3000万円特別控除は要件・期限あり（おおむね相続から3年を経過する年の年末まで）。"
            : undefined,
          tone: "good",
          effect: {
            savings: -cost + price,
            setFlags: { sold: true, saleAttempted: true },
            ownership: "sold",
          },
          endingId: early || canDeduct ? "true_end" : "tearful_exit",
        };
      }
      return {
        title: state.flags.demolished ? "更地も売れない" : "買い手がつかない",
        body: state.flags.demolished
          ? "土地の売却も不成約。更地＝出口、ではなかった。"
          : within3
            ? "不成約。控除の期限（相続後おおむね3年）は、待ってくれない。"
            : "動いたが不成約。立地・劣化・共有・行政指導の段階が壁になった。",
        tone: "warn",
        effect: {
          savings: -cost,
          stress: 12,
          setFlags: { saleAttempted: true },
        },
      };
    }
    case "bank": {
      if (state.flags.bankRegistered) {
        return {
          title: "登録済み",
          body: "すでに空き家バンクに載っている。",
          tone: "neutral",
          effect: {},
        };
      }
      return {
        title: "空き家バンク登録",
        body: "登録した。あとは運と管理継続。",
        tone: "good",
        effect: { stress: -3, setFlags: { bankRegistered: true } },
      };
    }
    case "estimate_demolish": {
      if (!state.flags.inherited) {
        return {
          title: "見積もりを頼めない——親が存命",
          body: "解体の前提となる所有者の判断がまだ親側にある。生前相談の段階では、勝手に業者を入れられない。",
          tone: "warn",
          effect: { stress: 3 },
        };
      }
      let estimate = randInt(240, 380) + state.year * randInt(6, 14);
      if (state.tags.building === "seismic_old") estimate += randInt(20, 50);
      if (state.tags.location === "urban") estimate += randInt(30, 70);
      const fee = randInt(0, 3);
      if (fee > 0 && state.savings < fee) {
        return {
          title: "見積もり依頼できず",
          body: `現地調査の実費が約${fee}万円。いまは依頼できない。`,
          tone: "warn",
          effect: { stress: 3 },
        };
      }
      return {
        title: "解体の見積もりが届いた",
        body: `概算${estimate}万円前後（産廃・足場込みの目安）。補助金があれば下がることもある。`,
        legalNote: "解体費は地域・建物・産廃処分で大きく振れる。複数社の見積が安全。",
        tone: "system",
        effect: {
          savings: -fee,
          stress: 4,
          stamina: -2,
          setFlags: { demolishEstimated: true },
        },
      };
    }
    case "demolish": {
      if (!state.flags.inherited) {
        return {
          title: "解体できない——親が存命",
          body: "名義はまだ親のもの。生前に子が勝手に解体することはできない。",
          legalNote: "所有者の同意なく建物を解体すれば、民事・刑事上の問題になり得る。",
          tone: "warn",
          effect: { stress: 6 },
        };
      }
      if (state.flags.siblingDementia) {
        return {
          title: "解体できない——共有者の意思確認不能",
          body: "兄が認知症で同意が取れない。成年後見なしでは解体工事の契約すら進まない。",
          legalNote: "共有建物の解体・処分は、原則として共有者の同意が必要。",
          tone: "danger",
          effect: { stress: 14, stamina: -4 },
        };
      }
      if (state.ownership === "shared" && !state.flags.siblingNegotiated) {
        return {
          title: "解体できない——共有の壁",
          body: "兄弟の同意が揃わず、業者は動かない。遺産分割が先決だ。",
          tone: "warn",
          effect: { stress: 10 },
        };
      }
      // 人件費・産廃・足場で値上がり。経過年数でも嵩む
      let cost = randInt(240, 380) + state.year * randInt(6, 14);
      if (state.tags.building === "seismic_old") cost += randInt(20, 50);
      if (state.tags.location === "urban") cost += randInt(30, 70);
      let note = "";
      if (state.flags.subsidyApplied) {
        const subsidy = randInt(50, 120);
        cost = Math.max(150, cost - subsidy);
        note = `事前に確保した除却補助金${subsidy}万円が効き、実質${cost}万円。`;
      } else if (state.flags.knowsSubsidy && chance(0.25)) {
        const subsidy = randInt(30, 70);
        cost = Math.max(180, cost - subsidy);
        note = `駆け込みで補助金${subsidy}万円。実質${cost}万円。勉強しておいてよかった。`;
      } else {
        note = `見積は高騰気味。補助金なしで${cost}万円。`;
      }
      if (state.savings < cost) {
        return {
          title: "解体できない——資金不足",
          body: `必要額約${cost}万円。貯金が足りず、業者は首を縦に振らない。`,
          legalNote: "解体費は地域・建物・産廃処分で大きく振れる。安い見積だけを信じない。",
          tone: "warn",
          effect: { stress: 12, stamina: -3 },
        };
      }
      const mind = 100 - state.stress;
      const prepared =
        state.flags.demolishEstimated &&
        (state.flags.studiedOnce || state.flags.consultedExpert) &&
        (state.flags.knowsSubsidy || state.flags.subsidyApplied) &&
        state.tags.location === "urban" &&
        state.savings - cost >= 80 &&
        state.stamina >= 45 &&
        mind >= 45;
      if (prepared) {
        return {
          title: "解体完了——都市部で区切りがついた",
          body: `${note} 準備を重ねた解体だった。更地はすぐに動き、負動産の当事者からは降りられた。`,
          legalNote: "更地化で住宅用地特例が外れる場合がある。都市部では土地の出口が付きやすい。",
          tone: "good",
          effect: {
            savings: -cost,
            decay: -100,
            stress: -14,
            stamina: -10,
            adminStage: 0,
            setFlags: {
              demolished: true,
              demolishedAtYear: state.year,
              sold: true,
              subsidyApplied: state.flags.subsidyApplied,
            },
            ownership: "sold",
          },
          endingId: "true_end",
        };
      }
      return {
        title: "解体完了——まだ終わらない",
        body: `${note} 更地になった。倒壊の恐怖は減ったが、固定資産税は残る。田舎では更地でもすぐには売れない。`,
        legalNote: "更地化で住宅用地特例が外れる場合がある。解体＝出口、ではない。",
        tone: "good",
        effect: {
          savings: -cost,
          decay: -100,
          stress: -8,
          stamina: -15,
          adminStage: 0,
          setFlags: {
            demolished: true,
            demolishedAtYear: state.year,
            subsidyApplied: note.includes("当たり") || state.flags.subsidyApplied,
          },
        },
      };
    }
    case "renounce": {
      if (!state.flags.inheritanceWindowOpen) {
        return {
          title: "相続放棄はやめた",
          body: "熟慮期間（原則3ヶ月）を過ぎており、家庭裁判所は認めてくれない。仮に放棄できても、株や債券などプラスの財産まで手放すことになる。結局、放棄は取りやめた。",
          legalNote: "民法915条：原則、自己のために相続の開始を知った時から3ヶ月以内。",
          tone: "warn",
          effect: { stress: 8 },
        };
      }
      const cost = randInt(1, 3);
      if (state.savings < cost) {
        return {
          title: "申述できず",
          body: "費用が足りない。",
          tone: "warn",
          effect: {},
        };
      }
      return {
        title: "相続放棄",
        body: `申述した（${cost}万円）。あなたは当事者から外れた。`,
        legalNote: "民法915条：原則、知った時から3ヶ月以内。",
        tone: "good",
        effect: {
          savings: -cost,
          stress: -20,
          setFlags: { inheritanceWindowOpen: false, inheritanceMonthsLeft: 0 },
          ownership: "cleared",
        },
        endingId: "renounce",
      };
    }
    case "sibling": {
      const cost = randInt(2, 8);
      if (state.savings < cost) {
        return {
          title: "協議できず",
          body: "集まる費用すらない。",
          tone: "warn",
          effect: { stress: 5 },
        };
      }
      const ok = chance(state.flags.consultedExpert ? 0.55 : 0.35);
      if (ok) {
        return {
          title: "遺産分割がまとまった",
          body: `${cost}万円相当のコストで、処分できる形になった。`,
          tone: "good",
          effect: {
            savings: -cost,
            stress: -5,
            ownership: "sole",
            setFlags: { siblingNegotiated: true },
          },
        };
      }
      return {
        title: "協議決裂",
        body: `${cost}万円かけて平行線。関係だけ悪化。`,
        tone: "danger",
        effect: {
          savings: -cost,
          stress: 16,
          setFlags: { siblingFailed: true },
        },
      };
    }
    case "kokko": {
      // 審査手数料＋負担金。実際も安くなく、要件・書類が重い
      const cost = randInt(55, 120);
      if (state.savings < cost) {
        return {
          title: "国庫帰属——資金不足",
          body: `審査・負担金などで約${cost}万円が見込まれる。貯金が足りず、申請すら重い。`,
          legalNote:
            "相続土地国庫帰属制度は、審査手数料（1筆1.4万円）と負担金が必要。建物がある場合は解体が前提になることが多い。",
          tone: "warn",
          effect: { stress: 10, stamina: -6 },
        };
      }
      // ゲーム難易度用の成功判定（公式の承認率統計ではない）
      if (!chance(0.28)) {
        return {
          title: "国庫帰属——却下／取下げ",
          body: `${cost}万円と半年近い書類地獄の末、要件不足で却下。隣地境界や管理不能事由がネックになった。`,
          legalNote:
            "却下されても手数料は戻らないことが多い。手放しの『簡単ボタン』ではない。",
          tone: "danger",
          effect: { savings: -cost, stress: 18, stamina: -12 },
        };
      }
      return {
        title: "国庫帰属が承認——高くついた区切り",
        body: `${cost}万円と膨大な手続きの末、土地を国に引き取ってもらえた。得はしていない。ただ、次世代への呪いは止めた。`,
        legalNote:
          "承認時も審査手数料（1筆1.4万円）＋負担金の負担は残る。それでも代執行よりマシ、という損切りになりやすい。",
        tone: "good",
        effect: {
          savings: -cost,
          stress: -10,
          stamina: -8,
          setFlags: { kokkoKizoku: true },
          ownership: "cleared",
        },
        endingId: "tearful_exit",
      };
    }
    case "conclude":
      return {
        title: "区切りはまだ早い",
        body: "更地のまま税だけ払い続ける日々。出口は売却か国庫帰属か——簡単には閉じない。",
        tone: "warn",
        effect: { stress: 4 },
      };
    default:
      return {
        title: "…",
        body: "特に何も起きなかった。",
        tone: "neutral",
        effect: {},
      };
  }
}

/** プレイヤーが選択肢を選んだ */
export function resolveChoice(
  state: GameState,
  choiceId: string,
  options?: { timedOut?: boolean },
): GameState {
  if (!state.pending) return state;
  const choice = state.pending.choices.find((c) => c.id === choiceId);
  if (!choice) return state;

  let result: ResolveResult;
  if (choice.special) {
    result = resolveSpecial(state, choice.special);
  } else {
    result = {
      title: choice.resultTitle ?? choice.label,
      body: choice.resultBody ?? "",
      legalNote: choice.legalNote,
      tone: choice.tone ?? "neutral",
      effect: choice.effect ?? {},
      endingId: choice.endingId,
    };
  }

  if (options?.timedOut) {
    result = {
      ...result,
      title: "放置した（時間切れ）",
      body: result.body
        ? `決断できず、時間が切れた。${result.body}`
        : "決断できず、時間が切れた。何もしないまま、事態だけが進む。",
      tone: result.tone === "good" ? "warn" : result.tone,
    };
  }

  let next: GameState = { ...state, pending: null, lastMessage: null };
  next = pushEntry(next, {
    title: result.title,
    body: result.body,
    legalNote: result.legalNote,
    tone: result.tone,
    deltas: {
      savings: result.effect.savings,
      decay: result.effect.decay,
      stress: result.effect.stress,
      stamina: result.effect.stamina,
    },
  });
  next = applyEffect(next, result.effect);

  if (result.endingId) {
    return finalizeEnding(next, result.endingId);
  }

  const forced = checkForcedEndings(next);
  if (forced) return forced;

  if (next.savings < 0 || next.stress >= 100 || next.stamina <= 0) {
    next = applyBankruptcyCrisis(next);
  }

  // 3年目以降に相続登記を知った → すぐ登記するかの決断
  const learnedReg =
    Boolean(result.effect.setFlags?.knowsInheritanceReg) &&
    !state.flags.knowsInheritanceReg;
  if (
    learnedReg &&
    next.flags.inherited &&
    !next.flags.inheritanceRegistered &&
    next.year >= 3 &&
    !next.endingId
  ) {
    next.pending = urgentInheritanceRegPending(next);
  }

  return next;
}

function shareVacantLabel(state: GameState): string {
  if (state.flags.sold || state.ownership === "sold") return "売却済み";
  if (state.flags.demolished || state.ownership === "cleared") return "更地";
  if (state.vacantLevel === "specified") return "特定空家等";
  if (state.vacantLevel === "mismanaged") return "管理不全空家等";
  return "空家等";
}

function shareAdminLabel(state: GameState): string {
  if (state.flags.adminExecuted || state.flags.ignoredOrder) return "代執行";
  if (state.adminStage >= 4) return "命令";
  if (state.adminStage >= 3) return "勧告";
  if (state.adminStage >= 2) return "指導";
  if (state.adminStage >= 1) return "助言";
  return "なし";
}

export function buildShareText(state: GameState): string {
  const ending = state.endingId ? ENDINGS[state.endingId] : null;
  const rank = ending?.rank ?? "BAD";
  const title = ending?.title ?? "結末";
  return [
    `『空家サバイバル』`,
    `${rank} END / ${title}`,
    `${state.year}年経過・累計支払約${Math.round(state.totalPaid)}万円`,
    `空家の状況：${shareVacantLabel(state)}`,
    `行政指導の段階：${shareAdminLabel(state)}`,
    SITE_URL,
    `#空家サバイバル #実家ガチャ #空家対策 #負動産`,
  ].join("\n");
}
