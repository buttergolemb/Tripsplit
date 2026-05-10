import {
  useRef,
  useCallback,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
  type ReactNode,
} from "react";

const DRAG_THRESHOLD_PX = 6;

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Horizontal strip: native touch pan-x, plus mouse/trackpad drag and horizontal wheel
 * so desktop feels closer to swiping on a phone.
 */
export function HorizontalDragScroll({ children, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    scrollStart: 0,
    dragging: false,
  });

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = ref.current;
    if (!el) return;
    // Do not capture on pointerdown — capture would steal the click from children (e.g. suggestion cards).
    drag.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      scrollStart: el.scrollLeft,
      dragging: false,
    };
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.active || e.pointerId !== drag.current.pointerId) return;
    const el = ref.current;
    if (!el) return;
    const dx = drag.current.startX - e.clientX;
    if (!drag.current.dragging) {
      if (Math.abs(dx) < DRAG_THRESHOLD_PX) return;
      drag.current.dragging = true;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    el.scrollLeft = drag.current.scrollStart + dx;
  }, []);

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== drag.current.pointerId) return;
    const wasDragging = drag.current.dragging;
    drag.current.active = false;
    drag.current.dragging = false;
    try {
      ref.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (wasDragging) {
      const root = ref.current;
      if (root) {
        const stopMisclick = (ev: MouseEvent) => {
          if (root.contains(ev.target as Node)) {
            ev.preventDefault();
            ev.stopPropagation();
          }
          document.removeEventListener("click", stopMisclick, true);
        };
        document.addEventListener("click", stopMisclick, true);
      }
    }
  }, []);

  const onWheel = useCallback((e: ReactWheelEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const dx = e.deltaX !== 0 ? e.deltaX : e.shiftKey ? e.deltaY : 0;
    if (dx === 0) return;
    e.preventDefault();
    el.scrollLeft += dx;
  }, []);

  return (
    <div
      ref={ref}
      role="presentation"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      className={`touch-pan-x cursor-grab active:cursor-grabbing select-none [-webkit-overflow-scrolling:touch] [overscroll-behavior-x:contain] ${className}`}
    >
      {children}
    </div>
  );
}
