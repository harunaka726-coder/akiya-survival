"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/** PC：マウスでドラッグできる半透明ポップアップ（背面は透過で見える） */
export function DraggablePopup({
  children,
  resetKey,
  label,
}: {
  children: ReactNode;
  /** イベント切替時に位置をリセット */
  resetKey: string;
  label: string;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  useEffect(() => {
    setOffset({ x: 0, y: 0 });
  }, [resetKey]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      drag.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: offset.x,
        origY: offset.y,
      };
    },
    [offset.x, offset.y],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current) return;
    setOffset({
      x: drag.current.origX + (e.clientX - drag.current.startX),
      y: drag.current.origY + (e.clientY - drag.current.startY),
    });
  }, []);

  const endDrag = useCallback((e: React.PointerEvent) => {
    if (!drag.current) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    drag.current = null;
  }, []);

  return (
    <div
      role="dialog"
      aria-label={label}
      className="pointer-events-auto absolute z-40 w-[min(100%-2rem,36rem)]"
      style={{
        left: "50%",
        top: "16%",
        transform: `translate(calc(-50% + ${offset.x}px), ${offset.y}px)`,
      }}
    >
      <div className="overflow-hidden border-2 border-ink bg-white/90 shadow-[8px_8px_0_0_rgba(15,23,42,0.85)] backdrop-blur-[2px]">
        <div
          className="flex cursor-grab select-none items-center justify-center border-b-2 border-ink bg-ink py-2 text-white active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          aria-label="ドラッグして移動"
          title="ドラッグして移動"
        >
          <span className="text-[14px] font-black leading-none tracking-[0.35em]" aria-hidden>
            ⋮⋮
          </span>
        </div>
        <div className="max-h-[min(70dvh,640px)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
