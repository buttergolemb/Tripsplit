import React from "react";
import { Drawer } from "vaul";
import { X } from "lucide-react";
import { useDeviceFrameElement } from "./DeviceFrameContext";

// ─── Shared Bottom Sheet Shell ───────────────────────────────────────────────
// Standardises the vaul Drawer chrome across the entire app:
//   - Consistent overlay, corner radius, handle bar, and close button
//   - sr-only Title/Description for accessibility (Radix requirement)
//   - Optional visible subtitle below the title
//
// Usage:
//   <BottomSheet open={…} onOpenChange={…} title="Add Category" srDescription="…">
//     {/* purpose-specific content */}
//   </BottomSheet>

export interface BottomSheetProps {
  /** Controlled open state */
  open: boolean;
  /** Called when the sheet wants to change open state (swipe-down, overlay tap, etc.) */
  onOpenChange: (open: boolean) => void;
  /** Visible header title */
  title: string;
  /** Screen-reader-only description (Radix a11y requirement) */
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
  const deviceFrame = useDeviceFrameElement();
  const maxHClass = deviceFrame ? "max-h-[88%]" : "max-h-[88vh]";

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} container={deviceFrame ?? undefined}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content
          className={`bg-white flex flex-col rounded-t-[24px] fixed bottom-0 left-0 right-0 z-50 outline-none ${maxHClass}`}
        >
          {/* ── Accessibility ──────────────────────────────────── */}
          <Drawer.Title className="sr-only">{title}</Drawer.Title>
          <Drawer.Description className="sr-only">
            {srDescription ?? title}
          </Drawer.Description>

          {/* ── Handle bar ─────────────────────────────────────── */}
          <div className="pt-3 pb-0 flex-shrink-0" aria-hidden>
            <div className="w-9 h-[5px] rounded-full bg-[#E5E5EA] mx-auto" />
          </div>

          {/* ── Header ─────────────────────────────────────────── */}
          <div className="px-5 pt-4 pb-3 flex items-start justify-between flex-shrink-0">
            <div className="min-w-0 flex-1">
              <h3 className="text-[20px] font-semibold text-[#1C1C1E] leading-snug">{title}</h3>
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

          {/* ── Scrollable content area ────────────────────────── */}
          <div className="flex-1 touch-pan-y overflow-y-auto overscroll-y-contain px-5 pb-10 [-webkit-overflow-scrolling:touch]">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}