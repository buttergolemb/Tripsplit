// Lightweight pull-to-refresh gesture. Wraps a scrollable region and, when the
// user drags downward while already at scrollTop === 0, reveals a spinner and
// invokes `onRefresh`. Built on Pointer Events so both mouse and touch work
// inside the prototype's iPhone mockup.
//
// This is intentionally minimal: no rubber-banding physics, no multi-stage
// animations — just "drag > threshold, release, refetch".

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { RefreshCw } from "lucide-react";

type Props = {
  onRefresh: () => Promise<unknown> | void;
  children: React.ReactNode;
  // Disable the gesture entirely (useful inside nested scrollers).
  disabled?: boolean;
  // Pixels the user must pull before the release triggers a refresh.
  threshold?: number;
  className?: string;
};

const DEFAULT_THRESHOLD = 72;
const MAX_PULL = 120;

export function PullToRefresh({
  onRefresh,
  children,
  disabled,
  threshold = DEFAULT_THRESHOLD,
  className = "",
}: Props) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const startYRef = React.useRef<number | null>(null);
  const activePointerRef = React.useRef<number | null>(null);
  const [pull, setPull] = React.useState(0);
  const [refreshing, setRefreshing] = React.useState(false);

  const atTop = () => (scrollRef.current?.scrollTop ?? 0) <= 0;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || refreshing) return;
    // Only engage when the scroll position is already at the top.
    if (!atTop()) return;
    // Ignore non-primary buttons on mouse.
    if (e.pointerType === "mouse" && e.button !== 0) return;
    startYRef.current = e.clientY;
    activePointerRef.current = e.pointerId;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startYRef.current == null || activePointerRef.current !== e.pointerId) return;
    const delta = e.clientY - startYRef.current;
    if (delta <= 0) {
      // Upward swipe cancels the gesture but keeps the pointer tracked in case
      // they reverse direction.
      if (pull !== 0) setPull(0);
      return;
    }
    // Don't engage if the underlying scroller has moved off the top since the
    // gesture started (e.g. iOS bounce scroll).
    if (!atTop()) {
      startYRef.current = null;
      activePointerRef.current = null;
      setPull(0);
      return;
    }
    // Apply a gentle resistance curve so the indicator doesn't track 1:1 with
    // the finger — feels more like native pull-to-refresh.
    const resisted = Math.min(MAX_PULL, Math.pow(delta, 0.85));
    setPull(resisted);
  };

  const endGesture = React.useCallback(
    async (e: React.PointerEvent<HTMLDivElement>) => {
      if (activePointerRef.current !== e.pointerId) return;
      const crossed = pull >= threshold;
      startYRef.current = null;
      activePointerRef.current = null;
      if (!crossed) {
        setPull(0);
        return;
      }
      setRefreshing(true);
      setPull(threshold);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    },
    [pull, threshold, onRefresh],
  );

  return (
    <div className={`relative ${className}`}>
      {/* Indicator sits above the scroll container but moves with the pull. */}
      <AnimatePresence>
        {(pull > 0 || refreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex justify-center"
            style={{ transform: `translateY(${Math.max(0, pull - 28)}px)` }}
            role="status"
            aria-live="polite"
            aria-label={refreshing ? "Refreshing" : "Pull to refresh"}
          >
            <div className="mt-2 size-8 rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.12)] ring-1 ring-black/5 flex items-center justify-center">
              <RefreshCw
                className={`size-4 text-[#1C1C1E] ${refreshing ? "animate-spin" : ""}`}
                style={{
                  transform: refreshing
                    ? undefined
                    : `rotate(${Math.min(360, pull * 3)}deg)`,
                }}
                strokeWidth={2.4}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={scrollRef}
        data-trip-scroller
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
        // IMPORTANT: only set a transform while the gesture is active. Any
        // non-none transform on this container creates a CSS containing block
        // for descendants with `position: fixed` — which silently re-parents
        // in-screen FABs and bottom sheets onto this scroller instead of the
        // iPhone frame. Leaving the style undefined at rest keeps `fixed`
        // behaving the way downstream screens expect.
        style={pull > 0 ? { transform: `translateY(${pull}px)` } : undefined}
        className="transition-transform duration-75 h-full overflow-y-auto no-scrollbar"
      >
        {children}
      </div>
    </div>
  );
}
