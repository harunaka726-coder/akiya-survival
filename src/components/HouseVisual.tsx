"use client";

import Image from "next/image";
import type { VacantLevel } from "@/types/game";

type HouseMode = "standing" | "demolished" | "sold" | "cleared";

function houseSrc(decay: number, mode: HouseMode): string {
  if (mode === "sold") return "/houses/house-sold.jpg";
  if (decay >= 85) return "/houses/house-critical.jpg";
  if (decay >= 65) return "/houses/house-bad.jpg";
  if (decay >= 40) return "/houses/house-worn.jpg";
  return "/houses/house-good.jpg";
}

const grass = [
  { left: "12%", top: "20%", size: 6, color: "#5a7a3a" },
  { left: "40%", top: "55%", size: 4, color: "#6b8a42" },
  { right: "18%", top: "30%", size: 5, color: "#4f6e32" },
  { left: "28%", bottom: "22%", size: 4, color: "#5a7a3a" },
  { right: "30%", bottom: "35%", size: 4, color: "#6b8a42" },
] as const;

const pegs = [
  { left: -2, top: -2 },
  { right: -2, top: -2 },
  { left: -2, bottom: -2 },
  { right: -2, bottom: -2 },
] as const;

/** 更地：四角い区画の簡易ビジュアル */
function VacantLotPlot() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: "#d4c4a8" }}
    >
      <div
        className="relative border-2 border-ink"
        style={{
          width: "72%",
          height: "72%",
          background: "#c4b48a",
          boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.15)",
        }}
      >
        {grass.map((g, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: "left" in g ? g.left : undefined,
              right: "right" in g ? g.right : undefined,
              top: "top" in g ? g.top : undefined,
              bottom: "bottom" in g ? g.bottom : undefined,
              width: g.size,
              height: g.size,
              borderRadius: 9999,
              background: g.color,
            }}
          />
        ))}
        {pegs.map((p, i) => (
          <span
            key={`p${i}`}
            style={{
              position: "absolute",
              left: "left" in p ? p.left : undefined,
              right: "right" in p ? p.right : undefined,
              top: "top" in p ? p.top : undefined,
              bottom: "bottom" in p ? p.bottom : undefined,
              width: 6,
              height: 6,
              background: "#0f172a",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function HouseVisual({
  decay,
  vacantLevel,
  mode = "standing",
  compact = false,
}: {
  decay: number;
  vacantLevel: VacantLevel;
  mode?: HouseMode;
  compact?: boolean;
}) {
  const size = compact ? "h-[92px] w-[92px]" : "h-[128px] w-[128px]";
  const isLot = mode === "demolished" || mode === "cleared";

  return (
    <div className={`relative ${size} shrink-0`} aria-hidden>
      <div className="absolute inset-0 overflow-hidden border-2 border-ink bg-[#f8f7f4]">
        {isLot ? (
          <VacantLotPlot />
        ) : (
          <Image
            src={houseSrc(decay, mode)}
            alt=""
            fill
            className="object-cover"
            sizes="128px"
            priority
          />
        )}
      </div>
      {vacantLevel !== "none" && mode === "standing" && (
        <span
          className={`absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center border-2 border-ink text-[12px] font-black text-white ${
            vacantLevel === "specified" ? "bg-danger" : "bg-warn"
          }`}
        >
          !
        </span>
      )}
    </div>
  );
}

export function houseModeFromState(
  flags: { demolished: boolean; sold: boolean },
  ownership: string,
): HouseMode {
  if (flags.sold) return "sold";
  if (flags.demolished) return "demolished";
  if (ownership === "cleared") return "cleared";
  return "standing";
}
