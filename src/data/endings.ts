import type { EndingDef, EndingId } from "@/types/game";

export const ENDINGS: Record<EndingId, EndingDef> = {
  admin_execution: {
    id: "admin_execution",
    title: "行政代執行——更地も、請求も残った",
    rank: "BAD",
    subtitle: "BAD END 1",
    body: [
      "命令無視の末、自治体が強制解体した。費用は公費（血税）で立て替えられ、費用請求が所有者や他の相続人へ向かった。",
      "建物は消えても更地の税と管理は続き、生涯を閉じても土地の負担は次の世代に残り得る。",
      "代執行は『終わり』ではなく、請求と管理が続く入口だった。",
    ],
    shareHook: "代執行後も更地は残る。血税と費用請求のBAD END。",
  },
  generational_curse: {
    id: "generational_curse",
    title: "死亡——空家は子どもへ",
    rank: "BAD",
    subtitle: "BAD END 2",
    body: [
      "空家を解けないまま、あなたは生涯を閉じた。",
      "葬儀の1ヶ月後、子ども宛てに自治体から『空家に関する重要なお知らせ』が届く。",
      "家は残り、迷惑も残り、負のバトンだけが次世代に渡る。",
    ],
    shareHook: "親が死んでも空家は残る。子どもに通知が届くBAD END。",
  },
  bankruptcy: {
    id: "bankruptcy",
    title: "破綻しても空家は残る",
    rank: "BAD",
    subtitle: "BAD END 3",
    body: [
      "家計や心身が先に折れた。だが自己破産しても、空家という物体は消えない。",
      "雑草も苦情も続き、最終的に代執行されれば公費が投入され、他の兄弟等へ費用徴収が向かうこともある。",
      "『自分が潰れたら終わり』ではなかった。終わりがないのが、負動産だ。",
    ],
    shareHook: "自己破産しても空家は残る。迷惑と費用請求は続く。",
  },
  tearful_exit: {
    id: "tearful_exit",
    title: "涙の損切り・逃げ切り成功",
    rank: "NORMAL",
    subtitle: "NORMAL END",
    body: [
      "赤字を出しつつも、解体・売却・国庫帰属などで空家を手放した。",
      "手元に残ったのは傷と教訓だけ。それでも、負の連鎖は断ち切れた。",
      "『損した』と感じるその決断が、いちばん高いリターンだった。",
    ],
    shareHook: "赤字でも手放せた。空家の負の連鎖を、ここで止めた。",
  },
  true_end: {
    id: "true_end",
    title: "早期決断・地域循環",
    rank: "TRUE",
    subtitle: "TRUE END",
    body: [
      "劣化が進む前に売却・空き家バンク成約、または都市部での計画的な解体と土地処分に成功した。",
      "家（または土地）は次の使い道へ移り、あなたは資産と心の余裕を守り切った。",
      "空家対策の本質は、勇気ある早めの一手だった。",
    ],
    shareHook: "早期決断で出口を確保。空家を負動産で終わらせなかったTRUE END。",
  },
  neighbor_liability: {
    id: "neighbor_liability",
    title: "近隣被害——命と請求に潰された",
    rank: "BAD",
    subtitle: "BAD END 4",
    body: [
      "台風や大雪で空家から飛来物・倒壊が起き、隣家に甚大な被害が出た。",
      "最悪のケースでは、子どもを含む人命が失われ、損害賠償は数千万に及ぶ。",
      "空家を放置した代償は、金だけでは測れなかった。ここで詰んだ。",
    ],
    shareHook: "空家の飛来・倒壊で近隣に大被害。命と数千万請求のBAD END。",
  },
  land_giveup: {
    id: "land_giveup",
    title: "更地のまま、ギブアップ",
    rank: "BAD",
    subtitle: "BAD END 5",
    body: [
      "建物を壊してから10年。土地は売れず、国庫にも乗れず、税だけが続き続けた。",
      "気力も体力も尽きた。現場からは降りたが、名義と税の鎖は簡単には外れない。",
      "壊すだけでは、終わりではなかった。",
    ],
    shareHook: "更地にして10年——出口なしのギブアップ。",
  },
};
