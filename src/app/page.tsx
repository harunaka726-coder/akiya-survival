import { Suspense } from "react";
import { GameApp } from "@/components/GameApp";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-[#f3f1eb] text-sm text-zinc-500">
          読み込み中…
        </main>
      }
    >
      <GameApp />
    </Suspense>
  );
}
