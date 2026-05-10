import { useState, type ReactNode } from "react";
import { DeviceFrameElementContext } from "./DeviceFrameContext";

/**
 * Wraps the app in a centered iPhone-style frame. The inner screen uses `transform`
 * so `position: fixed` UI (FABs, sheets) stays relative to the device, not the browser.
 * Trip tabs use a flex footer in `TripLayout` so the bar stays pinned to the bottom of this screen.
 */
export function IPhoneMockup({ children }: { children: ReactNode }) {
  const [deviceFrameEl, setDeviceFrameEl] = useState<HTMLDivElement | null>(null);

  return (
    <div className="iphone-mockup-stage flex min-h-svh w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#d4d8df] via-[#bcc3cd] to-[#aeb6c2] px-4 py-8">
      <div className="iphone-mockup-scale">
        <div className="relative rounded-[3rem] bg-[#101010] p-[11px] shadow-[0_48px_96px_-24px_rgba(0,0,0,0.55),0_24px_48px_-24px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div
            ref={setDeviceFrameEl}
            className="iphone-mockup-screen no-scrollbar relative flex h-[852px] w-[393px] flex-col overflow-hidden rounded-[2.35rem] bg-[#F7F7F5] [transform:translateZ(0)]"
          >
            <div
              className="pointer-events-none absolute left-1/2 top-[14px] z-[120] h-[32px] w-[112px] -translate-x-1/2 rounded-full bg-black shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
              aria-hidden
            />
            <DeviceFrameElementContext.Provider value={deviceFrameEl}>
              <div className="iphone-mockup-route-root flex min-h-0 w-full min-w-0 flex-1 flex-col">
                {children}
              </div>
            </DeviceFrameElementContext.Provider>
          </div>
        </div>
      </div>
    </div>
  );
}
