import { createContext, useContext } from "react";

/** When set, `BottomSheet` / Vaul drawers portal into this element (iPhone mockup screen) instead of `document.body`. */
export const DeviceFrameElementContext = createContext<HTMLElement | null>(null);

export function useDeviceFrameElement() {
  return useContext(DeviceFrameElementContext);
}
