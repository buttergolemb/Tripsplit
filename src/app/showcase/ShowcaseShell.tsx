// Presentation wrapper around the iPhone mockup. Renders two side panels
// flanking the app:
//   • Left: a directory of every flow so a reviewer can jump between screens
//     without having to remember the navigation.
//   • Right: narrative notes that update based on the current hash route and
//     explain why the screen was designed this way.
//
// Both panels can be collapsed for a clean view/screenshot. Works outside the
// RouterProvider because we drive everything off window.location.hash via
// useSyncExternalStore.

import React from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  ChevronRight,
  Home,
  Map,
  Clock,
  Wallet,
  ClipboardList,
  Settings,
} from "lucide-react";
import { noteForHash, stripHash } from "./notes";

type DirectoryItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  // Show as a sub-link under a section header.
  nested?: boolean;
};

type DirectorySection = {
  title: string;
  caption?: string;
  items: DirectoryItem[];
};

// Hard-coded because the directory only needs to know about routes the app
// actually exposes. If we add new routes, list them here so demos can find
// them without exploring manually.
const directory: DirectorySection[] = [
  {
    title: "Home",
    items: [
      { label: "All trips", href: "#/", icon: Home },
    ],
  },
  {
    title: "Austin Trip",
    caption: "The main demo trip (fully seeded)",
    items: [
      { label: "Overview", href: "#/trip/austin", icon: Map, nested: true },
      { label: "Timeline", href: "#/trip/austin/timeline", icon: Clock, nested: true },
      { label: "Money", href: "#/trip/austin/money", icon: Wallet, nested: true },
      { label: "Planning", href: "#/trip/austin/planning", icon: ClipboardList, nested: true },
      { label: "Settings", href: "#/trip/austin/settings", icon: Settings, nested: true },
    ],
  },
];

// ── Hash subscription (works outside Router) ────────────────────────────────

function subscribeHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}
function getHash() {
  return typeof window === "undefined" ? "" : window.location.hash;
}
function getServerHash() {
  return "";
}

function useHash(): string {
  return React.useSyncExternalStore(subscribeHash, getHash, getServerHash);
}

// Mark the current route so the directory highlights it.
function isActive(hash: string, href: string): boolean {
  const current = stripHash(hash);
  const target = stripHash(href.replace(/^#?/, "#"));
  if (target === "/") return current === "/";
  // Exact match, or the current path starts with the target followed by '/'.
  return current === target || current.startsWith(`${target}/`);
}

// ── Component ────────────────────────────────────────────────────────────────

export function ShowcaseShell({ children }: { children: React.ReactNode }) {
  // Panels open by default on desktop; user can collapse for clean screenshots.
  const [leftOpen, setLeftOpen] = React.useState(true);
  const [rightOpen, setRightOpen] = React.useState(true);
  const hash = useHash();
  const note = React.useMemo(() => noteForHash(hash), [hash]);

  // NOTE on layout: the mockup renders as `children` in its own full-viewport
  // stage (it owns its own gradient + centering). The directory/notes panels
  // are deliberately `position: fixed` overlays anchored to the viewport
  // edges instead of flex columns — putting the mockup inside a flex row
  // breaks the transform containing block that the iPhone screen relies on
  // to pin `position: fixed` FABs and sheets (they'd scroll with the page).
  return (
    <div className="relative">
      {children}

      {/* ── Left: Directory ────────────────────────────────────────── */}
      {leftOpen && (
        <aside
          aria-label="Flow directory"
          className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[264px] flex-col border-r border-black/[0.06] bg-white/70 backdrop-blur-xl"
        >
            <header className="flex items-center justify-between px-4 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-[9px] bg-[#007AFF] text-white text-[13px] font-bold flex items-center justify-center">
                  T
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#1C1C1E] leading-tight">
                    TripSplit
                  </p>
                  <p className="text-[10px] font-medium text-[#8E8E93] leading-tight">
                    Prototype directory
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLeftOpen(false)}
                aria-label="Hide directory"
                className="size-7 rounded-lg text-[#8E8E93] hover:bg-black/5 flex items-center justify-center transition-colors"
              >
                <PanelLeftClose className="size-4" strokeWidth={2} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
              {directory.map((section) => (
                <div key={section.title} className="px-3 pt-3">
                  <p className="px-2 pb-1.5 text-[10px] font-semibold tracking-[0.8px] uppercase text-[#8E8E93]">
                    {section.title}
                  </p>
                  {section.caption && (
                    <p className="px-2 pb-2 text-[11px] text-[#8E8E93] leading-snug">
                      {section.caption}
                    </p>
                  )}
                  <nav aria-label={section.title} className="flex flex-col gap-0.5">
                    {section.items.map((item) => {
                      const active = isActive(hash, item.href);
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={`group flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] font-medium transition-colors ${
                            item.nested ? "pl-3" : ""
                          } ${
                            active
                              ? "bg-[#007AFF]/[0.09] text-[#007AFF]"
                              : "text-[#1C1C1E] hover:bg-black/[0.04]"
                          }`}
                        >
                          <Icon
                            className={`size-[15px] ${active ? "text-[#007AFF]" : "text-[#8E8E93]"}`}
                            strokeWidth={active ? 2.4 : 1.9}
                          />
                          <span className="flex-1 truncate">{item.label}</span>
                          <ChevronRight
                            className={`size-3.5 transition-all ${
                              active
                                ? "text-[#007AFF] opacity-100"
                                : "text-[#C7C7CC] opacity-0 group-hover:opacity-100"
                            }`}
                            strokeWidth={2}
                          />
                        </a>
                      );
                    })}
                  </nav>
                </div>
              ))}

              <div className="mx-4 mt-6 rounded-[12px] border border-black/[0.06] bg-white/70 p-3">
                <p className="text-[11px] font-semibold text-[#1C1C1E] mb-1">
                  Tips
                </p>
                <ul className="text-[11px] text-[#3C3C43] leading-relaxed space-y-1">
                  <li>• Tap the acting-as chip to impersonate a member.</li>
                  <li>• Pull down on any trip screen to refresh.</li>
                  <li>• Use the panel toggles to hide this chrome.</li>
                </ul>
              </div>
            </div>
          </aside>
        )}

      {/* Floating toggles — show when a panel is collapsed. */}
      {!leftOpen && (
        <button
          type="button"
          onClick={() => setLeftOpen(true)}
          aria-label="Show directory"
          className="hidden lg:flex fixed left-4 top-4 z-40 size-9 rounded-full bg-white/90 backdrop-blur shadow-[0_4px_14px_rgba(0,0,0,0.1)] ring-1 ring-black/5 items-center justify-center text-[#1C1C1E] hover:bg-white transition-colors"
        >
          <PanelLeftOpen className="size-4" strokeWidth={2} />
        </button>
      )}
      {!rightOpen && (
        <button
          type="button"
          onClick={() => setRightOpen(true)}
          aria-label="Show notes"
          className="hidden lg:flex fixed right-4 top-4 z-40 size-9 rounded-full bg-white/90 backdrop-blur shadow-[0_4px_14px_rgba(0,0,0,0.1)] ring-1 ring-black/5 items-center justify-center text-[#1C1C1E] hover:bg-white transition-colors"
        >
          <PanelRightOpen className="size-4" strokeWidth={2} />
        </button>
      )}

      {/* ── Right: Notes ──────────────────────────────────────────── */}
      {rightOpen && (
        <aside
          aria-label="Design notes"
          className="hidden lg:flex fixed inset-y-0 right-0 z-40 w-[352px] flex-col border-l border-black/[0.06] bg-white/70 backdrop-blur-xl"
        >
            <header className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-black/[0.05]">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-[0.8px] uppercase text-[#8E8E93]">
                  Notes
                </p>
                <p className="text-[14px] font-semibold text-[#1C1C1E] truncate">
                  {note.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRightOpen(false)}
                aria-label="Hide notes"
                className="size-7 rounded-lg text-[#8E8E93] hover:bg-black/5 flex items-center justify-center transition-colors"
              >
                <PanelRightClose className="size-4" strokeWidth={2} />
              </button>
            </header>

            <div
              key={note.title /* re-run enter animation when the route changes */}
              className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 animate-in fade-in duration-200"
            >
              <p className="text-[13px] text-[#3C3C43] leading-relaxed italic mb-5">
                {note.tagline}
              </p>

              {note.sections.map((section) => (
                <section key={section.heading} className="mb-5 last:mb-0">
                  <h3 className="text-[13px] font-semibold text-[#1C1C1E] mb-1.5">
                    {section.heading}
                  </h3>
                  {section.body.map((p, i) => (
                    <p
                      key={i}
                      className="text-[13px] text-[#3C3C43] leading-[1.55] mb-2 last:mb-0"
                    >
                      {p}
                    </p>
                  ))}
                </section>
              ))}

              <div className="mt-6 rounded-[12px] bg-[#F7F7F5] p-3">
                <p className="text-[10px] font-semibold tracking-[0.8px] uppercase text-[#8E8E93] mb-1.5">
                  Quick jumps
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <a
                    href="#/"
                    className="text-[11px] px-2 py-1 rounded-full bg-white text-[#007AFF] font-semibold hover:bg-[#EAF2FF] transition-colors"
                  >
                    Home
                  </a>
                  <a
                    href="#/trip/austin/timeline"
                    className="text-[11px] px-2 py-1 rounded-full bg-white text-[#007AFF] font-semibold hover:bg-[#EAF2FF] transition-colors"
                  >
                    Timeline
                  </a>
                  <a
                    href="#/trip/austin/money"
                    className="text-[11px] px-2 py-1 rounded-full bg-white text-[#007AFF] font-semibold hover:bg-[#EAF2FF] transition-colors"
                  >
                    Money
                  </a>
                  <a
                    href="#/trip/austin/planning"
                    className="text-[11px] px-2 py-1 rounded-full bg-white text-[#007AFF] font-semibold hover:bg-[#EAF2FF] transition-colors"
                  >
                    Planning
                  </a>
                </div>
              </div>
            </div>
          </aside>
        )}
    </div>
  );
}
