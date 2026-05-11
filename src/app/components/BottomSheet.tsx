import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

// ─── Shared Bottom Sheet Shell ───────────────────────────────────────────────
// Matches the AddExpenseSheet visual/behavior contract so timeline and other
// trays animate identically: backdrop fades, sheet slides in from the bottom,
// background view stays completely static (no scaling, no document body
// manipulation, no scroll lock side effects). Replaces the previous vaul-based
// implementation that caused subtle background "refresh" jumps in the
// timeline screen.
//
// Usage:
//   <BottomSheet open={…} onOpenChange={…} title="Add Category" srDescription="…">
//     {/* purpose-specific content */}
//   </BottomSheet>

export interface BottomSheetProps {
  /** Controlled open state */
  open: boolean;
  /** Called when the sheet wants to change open state (overlay tap, close X, swipe, etc.) */
  onOpenChange: (open: boolean) => void;
  /** Visible header title */
  title: string;
  /** Screen-reader-only description (kept for backwards compatibility) */
  srDescription?: string;
  /** Optional visible subtitle rendered below the title */
  subtitle?: string;
  /** Whether to show the close (X) button — defaults to `true` */
  showClose?: boolean;
  /** Sheet content */
  children: React.ReactNode;
}

export function BottomSheet({
  open,
  onOpenChange,
  title,
  srDescription,
  subtitle,
  showClose = true,
  children,
}: BottomSheetProps) {
  // Close on Escape for keyboard accessibility.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // Pin the parent's scroll position while the sheet is open. Some inputs
  // inside trays (autoFocus, .focus()) cause the browser to scroll their
  // ancestors trying to bring the input into view — even though the sheet is
  // a fixed-position overlay. That manifests as the timeline visibly jumping
  // back to the top behind the tray. We capture scrollTop on open and clamp
  // it back for ~600ms if anything moves it.
  React.useEffect(() => {
    if (!open) return;
    const scroller =
      document.querySelector<HTMLElement>("[data-trip-scroller]") ||
      findScrollableAncestor(document.activeElement);
    if (!scroller) return;
    const saved = scroller.scrollTop;
    let raf = 0;
    const tick = () => {
      if (scroller.scrollTop !== saved) {
        scroller.scrollTop = saved;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const stop = window.setTimeout(() => cancelAnimationFrame(raf), 600);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(stop);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={() => onOpenChange(false)}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            aria-describedby={srDescription ? "bottom-sheet-desc" : undefined}
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 240 }}
            className="fixed inset-x-0 bottom-0 z-[61] flex max-h-[92%] flex-col bg-white rounded-t-[28px] shadow-[0_-4px_40px_rgba(0,0,0,0.18)] outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            {srDescription && (
              <span id="bottom-sheet-desc" className="sr-only">
                {srDescription}
              </span>
            )}

            {/* Handle */}
            <div className="pt-3 pb-0 flex-shrink-0" aria-hidden>
              <div className="w-9 h-[5px] rounded-full bg-[#E5E5EA] mx-auto" />
            </div>

            {/* Header */}
            <div className="px-5 pt-4 pb-3 flex items-start justify-between flex-shrink-0">
              <div className="min-w-0 flex-1">
                <h3 className="text-[20px] font-semibold text-[#1C1C1E] leading-snug">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-[13px] text-[#8E8E93] font-medium mt-0.5 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
              {showClose && (
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  aria-label={`Close ${title}`}
                  className="size-8 bg-[#F1F2F5] rounded-full flex items-center justify-center flex-shrink-0 ml-3 mt-0.5 active:bg-[#E5E5EA] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/40"
                >
                  <X className="size-4 text-[#8E8E93]" aria-hidden />
                </button>
              )}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 touch-pan-y overflow-y-auto overscroll-y-contain px-5 pb-10 [-webkit-overflow-scrolling:touch]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Walk up the DOM from `el` to find the closest ancestor that is a vertical
// scroller (overflow: auto/scroll, with content actually overflowing). Falls
// back to `null` so the caller can pick another sensible default.
function findScrollableAncestor(el: Element | null): HTMLElement | null {
  let node: HTMLElement | null = (el as HTMLElement | null) ?? null;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}
