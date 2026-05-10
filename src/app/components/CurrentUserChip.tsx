// Prototype user switcher. Surfaces the current "acting as" identity and lets
// the user impersonate a different trip member. In a real product this would
// be driven by auth, but for this prototype we persist the choice in
// localStorage via useCurrentUser.

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Check } from "lucide-react";
import { useCurrentUser } from "../../lib/currentUser";
import { AVATAR_COLORS } from "./AddExpenseSheet";

export function CurrentUserChip({
  members,
  // A subtle variant for use on light-on-light surfaces.
  variant = "default",
}: {
  members: { id?: string; name: string }[];
  variant?: "default" | "subtle";
}) {
  const [currentName, setCurrentName] = useCurrentUser();
  const [open, setOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement | null>(null);

  // Make sure the chosen name actually exists in this list; if not, default to
  // the first member (keeps copy sensible if you switch trips).
  const resolvedName =
    members.find((m) => m.name === currentName)?.name ?? members[0]?.name ?? currentName;

  // Close on any outside tap for a lightweight popover.
  React.useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (popoverRef.current && !popoverRef.current.contains(target)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("touchstart", handle);
    };
  }, [open]);

  const base =
    variant === "subtle"
      ? "bg-white/60 hover:bg-white"
      : "bg-[#F1F2F5] hover:bg-[#E9EAEE]";

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Currently acting as ${resolvedName}. Change active user.`}
        className={`flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full transition-colors active:scale-[0.97] ${base}`}
      >
        <div
          className={`size-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold ${
            AVATAR_COLORS[resolvedName[0]] || "bg-[#8E8E93]"
          }`}
        >
          {resolvedName[0]}
        </div>
        <span className="text-[12px] font-semibold text-[#1C1C1E]">
          {resolvedName}
        </span>
        <ChevronDown
          className={`size-3 text-[#8E8E93] transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2.4}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.14 }}
            role="listbox"
            aria-label="Select active user"
            className="absolute right-0 top-full mt-2 w-52 bg-white rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.18)] ring-1 ring-black/5 p-1 z-50"
          >
            <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-[#8E8E93] uppercase tracking-[0.6px]">
              Acting as
            </p>
            {members.map((m) => {
              const isActive = m.name === resolvedName;
              return (
                <button
                  key={m.id ?? m.name}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setCurrentName(m.name);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-left transition-colors ${
                    isActive ? "bg-[#F1F2F5]" : "hover:bg-[#F7F7F5]"
                  }`}
                >
                  <div
                    className={`size-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold ${
                      AVATAR_COLORS[m.name[0]] || "bg-[#8E8E93]"
                    }`}
                  >
                    {m.name[0]}
                  </div>
                  <span
                    className={`flex-1 text-[14px] ${
                      isActive ? "font-semibold text-[#1C1C1E]" : "text-[#3C3C43]"
                    }`}
                  >
                    {m.name}
                  </span>
                  {isActive && <Check className="size-4 text-[#007AFF]" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
