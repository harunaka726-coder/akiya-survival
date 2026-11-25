import type {
  BuildingTagId,
  DistanceTagId,
  FamilyTagId,
  LocationTagId,
  TagOption,
  TriggerTagId,
} from "@/types/game";

export const TRIGGER_TAGS: Record<
  TriggerTagId,
  TagOption & { id: TriggerTagId }
> = {
  inherit: {
    id: "inherit",
    category: "trigger",
    label: "実家相続",
    description: "親が他界し、突然あなたが空家の名義人になった。",
    difficulty: "normal",
  },
  consultation: {
    id: "consultation",
    category: "trigger",
    label: "生前相談",
    description: "親が元気なうちに相談を受けた。情報と時間がある有利スタート。",
    difficulty: "easy",
  },
  sudden_notice: {
    id: "sudden_notice",
    category: "trigger",
    label: "突然の通知",
    description:
      "疎遠な大叔父が暮らしていた家。戸籍をたどると相続人の一人にあなたが含まれるらしい——遠方の自治体から連絡が来るハードモード。",
    difficulty: "hard",
  },
};

export const LOCATION_TAGS: Record<
  LocationTagId,
  TagOption & { id: LocationTagId }
> = {
  urban: {
    id: "urban",
    category: "location",
    label: "都市部・駅近",
    description: "売却しやすいが固定資産税が高い。近隣クレームも早い。",
    difficulty: "normal",
  },
  suburban: {
    id: "suburban",
    category: "location",
    label: "地方都市・郊外",
    description: "空き家バンクや解体補助金があるが、買い手がつきにくい。",
    difficulty: "normal",
  },
  rural: {
    id: "rural",
    category: "location",
    label: "過疎地域・山間部",
    description: "資産価値ほぼゼロ。雑草の成長が早く、管理コストが重い。",
    difficulty: "hard",
  },
};

export const BUILDING_TAGS: Record<
  BuildingTagId,
  TagOption & { id: BuildingTagId; initialDecay: number }
> = {
  seismic_new: {
    id: "seismic_new",
    category: "building",
    label: "築30年・新耐震",
    description:
      "1981年（昭和56年）以降に建築された想定（新耐震基準）。劣化度20%スタート。賃貸や売却の芽はある。",
    difficulty: "easy",
    initialDecay: 20,
  },
  seismic_old: {
    id: "seismic_old",
    category: "building",
    label: "築55年・旧耐震",
    description:
      "1981年（昭和56年）より前に建築された想定（旧耐震基準）。劣化度55%スタート。解体が現実的な選択肢になる。",
    difficulty: "hard",
    initialDecay: 55,
  },
};

export const FAMILY_TAGS: Record<FamilyTagId, TagOption & { id: FamilyTagId }> =
  {
    only_child: {
      id: "only_child",
      category: "family",
      label: "一人っ子",
      description: "意思決定は速いが、費用も責任もすべて独りで背負う。",
      difficulty: "normal",
    },
    siblings: {
      id: "siblings",
      category: "family",
      label: "兄弟3人",
      description:
        "遺産分割がまとまらず共有名義になりやすい。連絡コストも大きい。",
      difficulty: "hard",
    },
  };

export const DISTANCE_TAGS: Record<
  DistanceTagId,
  TagOption & { id: DistanceTagId }
> = {
  local: {
    id: "local",
    category: "distance",
    label: "地元在住",
    description: "現地確認はしやすいが、「近くにいるんだから」と負担が集中しやすい。",
    difficulty: "normal",
  },
  remote: {
    id: "remote",
    category: "distance",
    label: "遠方在住",
    description: "帰省の交通費がかさむ。管理の遅れと情報不足が積み上がる。",
    difficulty: "hard",
  },
};

export const CATEGORY_LABEL: Record<TagCategoryLabel, string> = {
  trigger: "契機",
  location: "立地",
  building: "建物",
  family: "家族",
  distance: "距離",
};

type TagCategoryLabel = TagOption["category"];

export function tagListFromState(tags: {
  trigger: TriggerTagId;
  location: LocationTagId;
  building: BuildingTagId;
  family: FamilyTagId;
  distance: DistanceTagId;
}): TagOption[] {
  return [
    TRIGGER_TAGS[tags.trigger],
    LOCATION_TAGS[tags.location],
    BUILDING_TAGS[tags.building],
    FAMILY_TAGS[tags.family],
    DISTANCE_TAGS[tags.distance],
  ];
}

/** ゲーム中表示用（耐震の年代注記は省く） */
export function tagShortLabel(tag: TagOption): string {
  if (tag.id === "seismic_new") return "築30年・新耐震";
  if (tag.id === "seismic_old") return "築55年・旧耐震";
  return tag.label;
}
