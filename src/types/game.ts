export type TriggerTagId = "inherit" | "consultation" | "sudden_notice";
export type LocationTagId = "urban" | "suburban" | "rural";
export type BuildingTagId = "seismic_new" | "seismic_old";
export type FamilyTagId = "only_child" | "siblings";
export type DistanceTagId = "local" | "remote";

export type TagCategory =
  | "trigger"
  | "location"
  | "building"
  | "family"
  | "distance";

export interface TagOption {
  id: string;
  category: TagCategory;
  label: string;
  description: string;
  difficulty: "easy" | "normal" | "hard";
}

export interface GameTags {
  trigger: TriggerTagId;
  location: LocationTagId;
  building: BuildingTagId;
  family: FamilyTagId;
  distance: DistanceTagId;
}

export type VacantLevel = "none" | "mismanaged" | "specified";
export type AdminStage = 0 | 1 | 2 | 3 | 4;
export type Ownership = "sole" | "shared" | "cleared" | "sold";

/** 空家への方針（プレイヤーがときどき問われる） */
export type PolicyId =
  | "undecided"
  | "self_use"
  | "rent_sell"
  | "demolish"
  | "manage"
  | "wait";

export type EndingId =
  | "admin_execution"
  | "generational_curse"
  | "bankruptcy"
  | "tearful_exit"
  | "true_end"
  | "neighbor_liability"
  | "land_giveup";

export interface EndingDef {
  id: EndingId;
  title: string;
  rank: "BAD" | "NORMAL" | "TRUE";
  subtitle: string;
  body: string[];
  shareHook: string;
}

export interface TimelineEntry {
  id: string;
  year: number;
  age: number;
  title: string;
  body: string;
  legalNote?: string;
  tone: "neutral" | "good" | "warn" | "danger" | "system";
  deltas?: Partial<{
    savings: number;
    decay: number;
    stress: number;
    stamina: number;
  }>;
}

export interface GameFlags {
  inheritanceWindowOpen: boolean;
  inheritanceMonthsLeft: number;
  bankRegistered: boolean;
  saleAttempted: boolean;
  demolished: boolean;
  sold: boolean;
  consultedExpert: boolean;
  siblingNegotiated: boolean;
  siblingFailed: boolean;
  siblingDementia: boolean;
  orderIssued: boolean;
  ignoredOrder: boolean;
  subsidyApplied: boolean;
  /** 除却補助を不採択になった年（同じ年は再申請不可） */
  subsidyRejectedYear: number;
  /** 行政代執行で解体された */
  adminExecuted: boolean;
  kokkoKizoku: boolean;
  neighborClaim: boolean;
  typhoonDamage: boolean;
  /** 自己破産・破綻状態（ゲーム終了ではない） */
  bankrupted: boolean;
  /** 相続で取得した（控除・登記義務の対象） */
  inherited: boolean;
  /** 相続登記済み */
  inheritanceRegistered: boolean;
  /** 相続登記義務違反の過料を払った */
  inheritanceRegPenaltyPaid: boolean;
  /** 勉強・相談で得た知識 */
  knowsSubsidy: boolean;
  knowsAkiyaBank: boolean;
  knowsRenounce: boolean;
  knowsTransferDeduction: boolean;
  knowsInheritanceReg: boolean;
  studiedOnce: boolean;
  familyTalked: boolean;
  visitedHouse: boolean;
  /** 更地化した年（未解体は -1） */
  demolishedAtYear: number;
  /** 荷物の片付け済み */
  belongingsCleared: boolean;
  /** 仏壇・祭祀の整理済み */
  butsudanCleared: boolean;
  /** 解体見積もりを取った */
  demolishEstimated: boolean;
}

export interface PendingChoice {
  id: string;
  label: string;
  hint?: string;
  minSavings?: number;
  special?:
    | "wait"
    | "maintain"
    | "sell"
    | "bank"
    | "demolish"
    | "consult"
    | "renounce"
    | "sibling"
    | "kokko"
    | "conclude"
    | "study"
    | "visit"
    | "family_talk"
    | "register_inheritance"
    | "apply_subsidy"
    | "policy_self_use"
    | "policy_rent_sell"
    | "policy_demolish"
    | "policy_manage"
    | "policy_wait"
    | "clear_belongings_self"
    | "clear_belongings_pro"
    | "clear_butsudan"
    | "estimate_demolish";
  effect?: EventEffect;
  resultTitle?: string;
  resultBody?: string;
  legalNote?: string;
  tone?: TimelineEntry["tone"];
  endingId?: EndingId;
  /** この選択肢を出すのに必要な知識フラグ */
  requireKnowledge?: (keyof GameFlags)[];
}

export interface PendingEvent {
  id: string;
  title: string;
  body: string;
  legalNote?: string;
  tone: TimelineEntry["tone"];
  choices: PendingChoice[];
  /** false ならシンキングタイマーなし（プレイヤー主導アクション） */
  timed?: boolean;
  /** true なら年タイマーが進行し、年が進むとこのウィンドウは閉じる */
  timeContinues?: boolean;
}

/** 0 = 手動のみ（自動進行なし） */
export type SpeedRate = 0 | 0.25 | 0.5 | 1 | 2 | 4;

export interface GameState {
  phase: "intro" | "playing" | "result";
  tags: GameTags;
  age: number;
  year: number;
  savings: number;
  /** 体力 0-100 */
  stamina: number;
  decay: number;
  stress: number;
  totalPaid: number;
  ownership: Ownership;
  vacantLevel: VacantLevel;
  adminStage: AdminStage;
  flags: GameFlags;
  timeline: TimelineEntry[];
  usedEventIds: string[];
  endingId: EndingId | null;
  lastMessage: string | null;
  pending: PendingEvent | null;
  paused: boolean;
  speed: SpeedRate;
  /** いまの方針 */
  policy: PolicyId;
  /** 勉強・相談の累計（知識アンロック用） */
  knowledge: number;
}

export interface EventCondition {
  minYear?: number;
  maxYear?: number;
  minDecay?: number;
  maxDecay?: number;
  minStress?: number;
  maxStress?: number;
  minSavings?: number;
  maxSavings?: number;
  minAdminStage?: number;
  maxAdminStage?: number;
  requireTags?: Partial<GameTags>;
  requireFlags?: Partial<GameFlags>;
  forbidFlags?: Partial<GameFlags>;
  ownership?: Ownership[];
  once?: boolean;
  weight?: number;
}

export interface EventEffect {
  savings?: number;
  decay?: number;
  stress?: number;
  stamina?: number;
  adminStage?: AdminStage;
  setFlags?: Partial<GameFlags>;
  ownership?: Ownership;
  forceEnding?: EndingId;
  policy?: PolicyId;
  knowledge?: number;
}

export interface GameEvent {
  id: string;
  title: string;
  body: string;
  legalNote?: string;
  tone: TimelineEntry["tone"];
  condition?: EventCondition;
  effect?: EventEffect;
  /** 空配列／未設定＋passive で選択なしイベント */
  choices?: PendingChoice[];
  /** true ならタイムラインに流すだけで選択なし */
  passive?: boolean;
}

/** 1年の実時間（1倍速時） */
export const YEAR_DURATION_MS = 30_000;

export function yearDurationMs(speed: SpeedRate): number {
  if (speed === 0) return Number.POSITIVE_INFINITY;
  if (speed === 0.25) return 120_000;
  if (speed === 0.5) return 60_000;
  if (speed === 2) return 15_000;
  if (speed === 4) return 8_000;
  return YEAR_DURATION_MS;
}

export const SPEED_OPTIONS: { value: SpeedRate; label: string }[] = [
  { value: 0, label: "なし" },
  { value: 0.25, label: "0.25×" },
  { value: 0.5, label: "0.5×" },
  { value: 1, label: "1×" },
  { value: 2, label: "2×" },
  { value: 4, label: "4×" },
];
/** 決断の制限時間（倍速の影響を受けない実時間） */
export const CHOICE_DURATION_MS = 30_000;
/** 資金バーの上限目安（万円） */
export const SAVINGS_BAR_MAX = 800;
