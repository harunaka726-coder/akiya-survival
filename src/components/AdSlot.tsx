"use client";

/** 広告枠（中身は未接続。ラベル文字は出さない） */
export function AdSlot({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full ${className}`} aria-hidden>
      <div className="h-[40px] w-full border border-ink/15 bg-[#e8e6e1]" />
    </div>
  );
}
