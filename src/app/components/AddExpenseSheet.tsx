import React from "react";
import {
  X,
  ChevronDown,
  Clock,
  Users,
  Check,
  SplitSquareHorizontal,
  ScanLine,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCurrentUser } from "../../lib/currentUser";
import { formatExpenseDateLabelFromISO, formatExpenseWhenChipFromISO, todayISODate } from "../../lib/expenseDate";
import receiptPottoImg from "../../assets/receipt-potto.png";

// Only allow digits and a single decimal point (max 2 fraction digits).
function sanitizeMoneyInput(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join("").slice(0, 2)}`;
}

// ─── Constants ───────────────────────────────────────────────────────────────

// Legacy default — still exported for callers that haven't adopted
// useCurrentUser yet. Prefer useCurrentUser() in new code.
export const YOU = "Sarah";

export const EXPENSE_CATEGORIES = [
  { id: "food",     name: "Food",     icon: "🍽"  },
  { id: "gas",      name: "Gas",      icon: "⛽"  },
  { id: "lodging",  name: "Lodging",  icon: "🏠"  },
  { id: "fun",      name: "Fun",      icon: "🎟️" },
  { id: "drinks",   name: "Drinks",   icon: "🍺"  },
  { id: "shopping", name: "Shopping", icon: "🛍️" },
  { id: "groceries",name: "Groceries",icon: "🛒"  },
  { id: "other",    name: "Other",    icon: "💸"  },
];

export const AVATAR_COLORS: Record<string, string> = {
  S: "bg-[#007AFF]",
  M: "bg-[#34C759]",
  A: "bg-[#FF9F0A]",
  J: "bg-[#AF52DE]",
  T: "bg-[#FF6482]",
  C: "bg-[#5AC8FA]",
};

// ─── Sample Receipts (proof-of-concept) ─────────────────────────────────────

type SampleReceipt = {
  id: string;
  merchant: string;
  location: string;
  emoji: string;
  items: { name: string; price: number }[];
  total: number;
  category: string;
  description: string;
  date: string;
  image?: string; // real photo, if available
};

const SAMPLE_RECEIPTS: SampleReceipt[] = [
  {
    id: "potto",
    merchant: "Potto",
    location: "290 Sanchez St, San Francisco",
    emoji: "🍜",
    image: receiptPottoImg,
    items: [
      { name: "2× Gyudon", price: 40.00 },
      { name: "1× Gyoza", price: 10.00 },
      { name: "3× Yakiniku Don", price: 108.00 },
      { name: "1× Shogun's Cut", price: 76.00 },
      { name: "1× Rice", price: 5.00 },
      { name: "Tax", price: 20.60 },
      { name: "Tip", price: 46.73 },
    ],
    total: 306.33,
    category: "food",
    description: "Dinner at Potto",
    date: "Aug 5",
  },
  {
    id: "shell-gas",
    merchant: "Shell Gas Station",
    location: "I-35 N, Round Rock TX",
    emoji: "⛽",
    items: [
      { name: "Premium Unleaded 11.2 gal", price: 38.42 },
      { name: "Car Wash — Basic", price: 6.58 },
    ],
    total: 45.00,
    category: "gas",
    description: "Gas fill-up",
    date: "Mar 17",
  },
  {
    id: "whole-foods",
    merchant: "Whole Foods Market",
    location: "Domain Northside, Austin",
    emoji: "🛒",
    items: [
      { name: "Snacks & trail mix", price: 18.40 },
      { name: "Breakfast items", price: 24.10 },
      { name: "Drinks & sparkling water", price: 15.20 },
      { name: "Sunscreen & misc", price: 22.80 },
      { name: "Tax", price: 8.80 },
    ],
    total: 89.30,
    category: "groceries",
    description: "Grocery run",
    date: "Mar 16",
  },
];

// ─── Tax/tip helpers ─────────────────────────────────────────────────────────

function isTaxOrTip(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes("tax") || n.includes("tip") || n.includes("gratuity") || n.includes("service");
}

// Parse a leading quantity from the line-item name.
// "2× Gyudon" / "2x Gyudon" / "3 × Yakiniku Don" → 2 / 2 / 3
// "1× Gyoza" → 1 (treated as shared, no constraint)
// Returns null when no leading quantity is present (e.g. "Tax").
function parseItemQuantity(name: string): number | null {
  const m = name.match(/^\s*(\d+)\s*[x×]\s+/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Default receipt image (first sample with image)
const DEFAULT_RECEIPT = SAMPLE_RECEIPTS.find((r) => r.image) ?? SAMPLE_RECEIPTS[0];

// ─── Camera View (fullscreen iPhone-style viewfinder) ───────────────────────

function CameraView({
  receipt,
  onCapture,
  onClose,
}: {
  receipt: SampleReceipt;
  onCapture: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col"
    >
      {/* Top toolbar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),16px)] pb-3">
        <button
          onClick={onClose}
          className="size-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Close camera"
        >
          <X className="size-5 text-white" strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-1.5 bg-[#FFD60A] px-3 py-1.5 rounded-full">
          <ScanLine className="size-3.5 text-black" strokeWidth={2.5} />
          <span className="text-[12px] font-bold text-black tracking-tight">RECEIPT</span>
        </div>
        <div className="size-9" /> {/* spacer */}
      </div>

      {/* Viewfinder */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {receipt.image ? (
          <img
            src={receipt.image}
            alt="Receipt in viewfinder"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white/60 text-sm">No preview available</div>
        )}

        {/* Soft vignette */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/30 via-transparent to-black/30" />

        {/* Auto-detect frame around receipt */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, type: "spring", damping: 18, stiffness: 200 }}
            className="relative w-[68%] h-[78%]"
          >
            {[
              "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-[6px]",
              "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-[6px]",
              "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-[6px]",
              "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-[6px]",
            ].map((cls, i) => (
              <motion.div
                key={i}
                className={`absolute w-7 h-7 border-[#FFD60A] ${cls}`}
                animate={{ opacity: [1, 0.55, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.05 }}
              />
            ))}
          </motion.div>
        </div>

        {/* "Receipt detected" pill */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#34C759] px-3 py-1.5 rounded-full shadow-lg"
        >
          <Check className="size-3.5 text-white" strokeWidth={3} />
          <span className="text-[12px] font-semibold text-white">Receipt detected</span>
        </motion.div>
      </div>

      {/* Bottom shutter bar */}
      <div className="bg-black pt-5 pb-[max(env(safe-area-inset-bottom),24px)] px-8 flex items-center justify-between">
        {/* Left: Photo library icon (decorative) */}
        <div className="size-10 rounded-[8px] bg-white/10 flex items-center justify-center">
          <div className="size-5 rounded-[4px] bg-gradient-to-br from-white/40 to-white/20" />
        </div>

        {/* Shutter button */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onCapture}
          className="size-[72px] rounded-full bg-white flex items-center justify-center shadow-[0_0_0_4px_rgba(255,255,255,0.25)] focus:outline-none"
          aria-label="Capture receipt"
        >
          <div className="size-[60px] rounded-full bg-white border-[3px] border-black" />
        </motion.button>

        {/* Right: flip camera (decorative) */}
        <button className="size-10 rounded-full bg-white/10 flex items-center justify-center" aria-hidden>
          <svg viewBox="0 0 24 24" className="size-5 text-white/70" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 4l4 4-4 4M4 12V8a4 4 0 014-4h12M8 20l-4-4 4-4M20 12v4a4 4 0 01-4 4H4" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

// ─── Fullscreen Scan Animation ───────────────────────────────────────────────

function ScanningOverlay({ receipt, onDone }: { receipt: SampleReceipt; onDone: () => void }) {
  const [step, setStep] = React.useState<"flash" | "scanning" | "reading" | "done">("flash");

  React.useEffect(() => {
    const t0 = setTimeout(() => setStep("scanning"), 220);
    const t1 = setTimeout(() => setStep("reading"), 1500);
    const t2 = setTimeout(() => setStep("done"), 2400);
    const t3 = setTimeout(onDone, 2900);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[101] bg-black flex items-center justify-center"
    >
      {/* Camera flash */}
      <AnimatePresence>
        {step === "flash" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="absolute inset-0 bg-white z-20"
          />
        )}
      </AnimatePresence>

      {/* Captured photo, centered */}
      <div className="relative w-[78%] max-w-[420px] aspect-[3/4] bg-black rounded-[18px] overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.5)]">
        {receipt.image ? (
          <img src={receipt.image} alt="Captured receipt" className="w-full h-full object-cover" />
        ) : null}

        {/* Subtle dark overlay during processing */}
        {(step === "scanning" || step === "reading") && (
          <div className="absolute inset-0 bg-black/30" />
        )}

        {/* Scanning laser */}
        {step === "scanning" && (
          <>
            <motion.div
              initial={{ top: "0%" }}
              animate={{ top: "100%" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute left-0 right-0 h-[3px] bg-[#34C759] shadow-[0_0_24px_8px_rgba(52,199,89,0.6)] z-10"
            />
            {/* Trailing gradient */}
            <motion.div
              initial={{ top: "-40%" }}
              animate={{ top: "100%" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute left-0 right-0 h-[40%] bg-gradient-to-b from-transparent via-[#34C759]/15 to-[#34C759]/30 pointer-events-none z-[9]"
            />
          </>
        )}

        {/* Detected line item highlights */}
        {step === "reading" && (
          <>
            {[
              { top: "32%", h: "3.5%" },
              { top: "37%", h: "3.5%" },
              { top: "42%", h: "3.5%" },
              { top: "47%", h: "3.5%" },
              { top: "52%", h: "3.5%" },
              { top: "60%", h: "3.5%" },
              { top: "65%", h: "3.5%" },
              { top: "70%", h: "3.5%" },
            ].map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scaleX: 0.85 }}
                animate={{ opacity: [0, 1, 1], scaleX: 1 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="absolute left-[10%] right-[10%] bg-[#FFD60A]/35 rounded-[3px] border-[1.5px] border-[#FFD60A]"
                style={{ top: row.top, height: row.h }}
              />
            ))}
          </>
        )}

        {/* Success overlay */}
        <AnimatePresence>
          {step === "done" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[#34C759]/85 flex items-center justify-center z-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 14, stiffness: 280 }}
                className="size-20 rounded-full bg-white flex items-center justify-center"
              >
                <Check className="size-10 text-[#34C759]" strokeWidth={3.5} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status text */}
      <div className="absolute bottom-[max(env(safe-area-inset-bottom),32px)] left-0 right-0 px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="text-center"
          >
            <p className="text-white text-[17px] font-semibold tracking-tight">
              {step === "flash" && " "}
              {step === "scanning" && "Scanning receipt…"}
              {step === "reading" && "Reading line items…"}
              {step === "done" && "Got it!"}
            </p>
            {step === "reading" && (
              <p className="text-white/60 text-[13px] mt-1">
                Found {receipt.items.filter((i) => !isTaxOrTip(i.name)).length} items · ${receipt.total.toFixed(2)} total
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Line-Item Split View ─────────────────────────────────────────────────────
//
// After scanning, each non-tax/tip item can be assigned to one or more
// participants (e.g. an entree to a single person, gyoza shared with everyone).
// Tax & tip are distributed proportionally based on each member's pre-tax share.

function computePerMemberShares(
  receipt: SampleReceipt,
  assignments: Record<number, string[]>,
  participants: string[],
): Record<string, number> {
  const shares: Record<string, number> = {};
  participants.forEach((p) => { shares[p] = 0; });

  let preTaxTotal = 0;
  let taxTipTotal = 0;

  receipt.items.forEach((item, idx) => {
    if (isTaxOrTip(item.name)) {
      taxTipTotal += item.price;
    } else {
      preTaxTotal += item.price;
      const assignees = assignments[idx] ?? [];
      if (assignees.length > 0) {
        const each = item.price / assignees.length;
        for (const name of assignees) {
          shares[name] = (shares[name] ?? 0) + each;
        }
      }
    }
  });

  // Distribute tax/tip proportionally to each member's pre-tax share.
  if (taxTipTotal > 0 && preTaxTotal > 0) {
    const ratio = taxTipTotal / preTaxTotal;
    for (const name of participants) {
      shares[name] = (shares[name] ?? 0) * (1 + ratio);
    }
  }

  return shares;
}


function LineItemSplitView({
  receipt,
  participants,
  currentUserName,
  assignments,
  setAssignments,
  onContinue,
  onBack,
}: {
  receipt: SampleReceipt;
  participants: string[];
  currentUserName: string;
  assignments: Record<number, string[]>;
  setAssignments: (next: Record<number, string[]>) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const [openItem, setOpenItem] = React.useState<number | null>(null);

  // ── Drag-to-assign: supports both item→person and person→item ────────
  // sourceType "item": user drags a line-item card up to an avatar in the bar.
  // sourceType "person": user drags an avatar down onto a line-item row.
  // Both directions toggle membership identically on drop.
  type DragState = {
    sourceType: "item" | "person";
    itemIdx: number | null;
    personName: string | null;
    pointerId: number;
    startX: number;
    startY: number;
    x: number;
    y: number;
    moved: boolean;
    hoveringAvatar: string | null;
    hoveringItemIdx: number | null;
  };
  const [drag, setDrag] = React.useState<DragState | null>(null);
  const dragRef = React.useRef<DragState | null>(null);
  dragRef.current = drag;

  const assignmentsRef = React.useRef(assignments);
  assignmentsRef.current = assignments;

  const beginItemDrag = (e: React.PointerEvent, itemIdx: number) => {
    if (e.button !== undefined && e.button !== 0) return;
    setDrag({
      sourceType: "item",
      itemIdx,
      personName: null,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      x: e.clientX,
      y: e.clientY,
      moved: false,
      hoveringAvatar: null,
      hoveringItemIdx: null,
    });
  };

  const beginPersonDrag = (e: React.PointerEvent, name: string) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.stopPropagation();
    setDrag({
      sourceType: "person",
      itemIdx: null,
      personName: name,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      x: e.clientX,
      y: e.clientY,
      moved: false,
      hoveringAvatar: null,
      hoveringItemIdx: null,
    });
  };

  React.useEffect(() => {
    if (!drag) return;
    const onMove = (e: PointerEvent) => {
      const cur = dragRef.current;
      if (!cur || e.pointerId !== cur.pointerId) return;
      const dx = e.clientX - cur.startX;
      const dy = e.clientY - cur.startY;
      const dist = Math.hypot(dx, dy);
      const moved = cur.moved || dist > 6;

      let hoveringAvatar: string | null = null;
      let hoveringItemIdx: number | null = null;
      if (moved) {
        const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
        if (cur.sourceType === "item") {
          const avatarEl = el?.closest("[data-avatar-name]") as HTMLElement | null;
          hoveringAvatar = avatarEl?.dataset.avatarName ?? null;
        } else {
          const itemEl = el?.closest("[data-item-idx]") as HTMLElement | null;
          const raw = itemEl?.dataset.itemIdx;
          hoveringItemIdx = raw !== undefined ? Number(raw) : null;
        }
      }
      setDrag({ ...cur, x: e.clientX, y: e.clientY, moved, hoveringAvatar, hoveringItemIdx });
    };
    const onUp = (e: PointerEvent) => {
      const cur = dragRef.current;
      if (!cur || e.pointerId !== cur.pointerId) return;
      if (cur.moved) {
        if (cur.sourceType === "item" && cur.hoveringAvatar && cur.itemIdx !== null) {
          const current = assignmentsRef.current[cur.itemIdx] ?? [];
          const name = cur.hoveringAvatar;
          const next = current.includes(name) ? current.filter((n) => n !== name) : [...current, name];
          setAssignments({ ...assignmentsRef.current, [cur.itemIdx]: next });
        } else if (cur.sourceType === "person" && cur.hoveringItemIdx !== null && cur.personName) {
          const idx = cur.hoveringItemIdx;
          const current = assignmentsRef.current[idx] ?? [];
          const name = cur.personName;
          const next = current.includes(name) ? current.filter((n) => n !== name) : [...current, name];
          setAssignments({ ...assignmentsRef.current, [idx]: next });
        }
      }
      setDrag(null);
    };
    const onCancel = () => setDrag(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [drag?.pointerId, setAssignments]); // eslint-disable-line react-hooks/exhaustive-deps

  const itemizableIndices = receipt.items
    .map((item, idx) => (isTaxOrTip(item.name) ? -1 : idx))
    .filter((i) => i !== -1);

  const unassignedCount = itemizableIndices.filter(
    (idx) => (assignments[idx] ?? []).length === 0
  ).length;
  const allAssigned = unassignedCount === 0;

  const shares = React.useMemo(
    () => computePerMemberShares(receipt, assignments, participants),
    [receipt, assignments, participants]
  );

  const allocated = Object.values(shares).reduce((s, v) => s + v, 0);

  const toggleAssignee = (idx: number, name: string) => {
    const current = assignments[idx] ?? [];
    const next = current.includes(name)
      ? current.filter((n) => n !== name)
      : [...current, name];
    setAssignments({ ...assignments, [idx]: next });
  };

  const assignAll = (idx: number) => {
    setAssignments({ ...assignments, [idx]: [...participants] });
  };

  const clearItem = (idx: number) => {
    setAssignments({ ...assignments, [idx]: [] });
  };

  const taxTipItems = receipt.items.filter((i) => isTaxOrTip(i.name));
  const taxTipTotal = taxTipItems.reduce((s, i) => s + i.price, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="px-5 pb-6"
    >
      {/* Top scanned banner */}
      <div className="flex items-center gap-3 bg-[#E8F7EE] rounded-[14px] p-3 mb-3">
        {receipt.image ? (
          <img src={receipt.image} alt="" className="size-12 rounded-[10px] object-cover object-top" />
        ) : (
          <div className="size-12 rounded-[10px] bg-white flex items-center justify-center text-2xl">{receipt.emoji}</div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[#1C1C1E] truncate">{receipt.merchant}</p>
          <p className="text-[11px] text-[#6E6E73]">${receipt.total.toFixed(2)} · {receipt.items.filter((i) => !isTaxOrTip(i.name)).length} items detected</p>
        </div>
        <div className="size-7 rounded-full bg-[#34C759] flex items-center justify-center flex-shrink-0">
          <Check className="size-4 text-white" strokeWidth={3} />
        </div>
      </div>

      {/* Avatar bar — drag an item up here, or drag a person down to an item */}
      <div className="sticky top-0 z-10 -mx-5 px-5 py-2 mb-2 bg-white/95 backdrop-blur-md">
        <p className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-[0.6px] mb-1.5 flex items-center gap-1">
          <span>Drag a person to an item</span>
          <span className="text-[#C7C7CC]">·</span>
          <span className="text-[#C7C7CC] normal-case tracking-normal">or drag an item here</span>
        </p>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {participants.map((name) => {
            const isItemHover = drag?.sourceType === "item" && drag.hoveringAvatar === name;
            const isDraggingPerson = drag?.sourceType === "person" && drag.personName === name && drag.moved;
            const owe = Object.entries(assignments).reduce((sum, [idxStr, members]) => {
              const idx = Number(idxStr);
              if (!members.includes(name)) return sum;
              const item = receipt.items[idx];
              if (!item || isTaxOrTip(item.name)) return sum;
              return sum + item.price / members.length;
            }, 0);
            return (
              <motion.div
                key={name}
                data-avatar-name={name}
                onPointerDown={(e) => beginPersonDrag(e, name)}
                animate={{
                  scale: isItemHover ? 1.12 : isDraggingPerson ? 0.88 : 1,
                  y: isItemHover ? -2 : 0,
                  opacity: isDraggingPerson ? 0.4 : 1,
                }}
                transition={{ type: "spring", damping: 18, stiffness: 320 }}
                style={{ touchAction: "none" }}
                className={`flex flex-col items-center gap-0.5 flex-shrink-0 px-1 py-1 rounded-[12px] cursor-grab transition-colors select-none ${
                  isItemHover ? "bg-[#EAF2FF]" : "bg-transparent"
                }`}
              >
                <div className={`relative size-11 rounded-full flex items-center justify-center text-white text-[14px] font-semibold ${AVATAR_COLORS[name[0]] || "bg-[#8E8E93]"} ${isItemHover ? "ring-[3px] ring-[#007AFF]" : "ring-2 ring-white"}`}>
                  {name[0]}
                  {isItemHover && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 size-5 rounded-full bg-[#007AFF] flex items-center justify-center"
                    >
                      <Check className="size-3 text-white" strokeWidth={3.5} />
                    </motion.div>
                  )}
                </div>
                <span className="text-[10px] font-medium text-[#1C1C1E] truncate max-w-[44px]">
                  {name === currentUserName ? "You" : name.split(" ")[0]}
                </span>
                <span className="text-[9px] font-semibold text-[#8E8E93]">
                  ${owe.toFixed(0)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex items-baseline justify-between mb-2">
        <p className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-[0.6px]">Assign each item</p>
        {!allAssigned && (
          <p className="text-[11px] text-[#FF9F0A] font-medium">{unassignedCount} unassigned</p>
        )}
      </div>

      {/* Line items */}
      <div className="space-y-2 mb-4">
        {receipt.items.map((item, idx) => {
          if (isTaxOrTip(item.name)) return null;
          const assignees = assignments[idx] ?? [];
          const isOpen = openItem === idx;
          const isUnassigned = assignees.length === 0;
          const isEveryone = assignees.length === participants.length;
          const perPerson = assignees.length > 0 ? item.price / assignees.length : 0;
          const expectedQty = parseItemQuantity(item.name);
          const hasQtyMismatch =
            expectedQty !== null &&
            expectedQty > 1 &&
            assignees.length !== expectedQty &&
            !isEveryone;

          const isDraggingThis = drag?.sourceType === "item" && drag.itemIdx === idx && drag.moved;
          const isPersonHoverTarget = drag?.sourceType === "person" && drag.hoveringItemIdx === idx && drag.moved;
          return (
            <div
              key={idx}
              data-item-idx={idx}
              className={`bg-white rounded-[14px] border overflow-hidden transition-all ${
                isPersonHoverTarget
                  ? "border-[#007AFF] shadow-[0_0_0_2px_rgba(0,122,255,0.18)]"
                  : hasQtyMismatch
                  ? "border-[#FF9F0A]/60"
                  : isUnassigned
                  ? "border-[#FF9F0A]/40"
                  : "border-[#F1F2F5]"
              } ${isDraggingThis ? "opacity-40" : ""}`}
            >
              <button
                onClick={() => {
                  if (drag?.moved) return;
                  setOpenItem(isOpen ? null : idx);
                }}
                onPointerDown={(e) => beginItemDrag(e, idx)}
                style={{ touchAction: "pan-y" }}
                className="w-full p-3.5 flex items-center justify-between gap-3 active:bg-[#F7F7F5] transition-colors text-left cursor-grab"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-[14px] font-semibold text-[#1C1C1E] truncate">{item.name}</p>
                      {expectedQty !== null && expectedQty > 1 && (
                        <span className="text-[10px] font-bold px-1.5 py-[2px] rounded-[5px] bg-[#F1EEFF] text-[#8E8EFA] flex-shrink-0">
                          PICK {expectedQty}
                        </span>
                      )}
                    </div>
                    <p className="text-[14px] font-semibold text-[#1C1C1E] flex-shrink-0">${item.price.toFixed(2)}</p>
                  </div>
                  {isUnassigned ? (
                    <p className="text-[12px] text-[#FF9F0A] font-medium">
                      {expectedQty && expectedQty > 1
                        ? `Tap to pick the ${expectedQty} people who ordered →`
                        : "Tap to assign →"}
                    </p>
                  ) : hasQtyMismatch ? (
                    <p className="text-[12px] text-[#FF9F0A] font-medium">
                      ⚠ {assignees.length} assigned, {expectedQty} expected
                    </p>
                  ) : isEveryone ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-[#007AFF] bg-[#EAF2FF] px-2 py-0.5 rounded-full">Everyone</span>
                      <span className="text-[11px] text-[#8E8E93]">${perPerson.toFixed(2)} each</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="flex -space-x-1.5">
                        {assignees.slice(0, 4).map((n) => (
                          <div
                            key={n}
                            className={`size-5 rounded-full ring-2 ring-white flex items-center justify-center text-white text-[9px] font-semibold ${AVATAR_COLORS[n[0]] || "bg-[#8E8E93]"}`}
                          >
                            {n[0]}
                          </div>
                        ))}
                        {assignees.length > 4 && (
                          <div className="size-5 rounded-full ring-2 ring-white bg-[#F1F2F5] flex items-center justify-center text-[9px] font-semibold text-[#8E8E93]">
                            +{assignees.length - 4}
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-[#8E8E93]">${perPerson.toFixed(2)} each</span>
                    </div>
                  )}
                </div>
                <ChevronDown className={`size-4 text-[#C7C7CC] flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden border-t border-[#F1F2F5]"
                  >
                    <div className="p-3 bg-[#FAFAF8]">
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={() => assignAll(idx)}
                          className="text-[12px] font-semibold text-[#007AFF] active:opacity-60"
                        >
                          {isEveryone ? "✓ Everyone" : "Assign to everyone"}
                        </button>
                        {assignees.length > 0 && (
                          <button
                            onClick={() => clearItem(idx)}
                            className="text-[12px] font-medium text-[#FF453A] active:opacity-60"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {participants.map((name) => {
                          const checked = assignees.includes(name);
                          return (
                            <button
                              key={name}
                              onClick={() => toggleAssignee(idx, name)}
                              className={`flex items-center gap-2 px-2.5 py-2 rounded-[10px] transition-all active:scale-[0.97] ${
                                checked ? "bg-white shadow-sm" : "bg-white/60"
                              }`}
                            >
                              <div className={`size-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0 ${AVATAR_COLORS[name[0]] || "bg-[#8E8E93]"}`}>
                                {name[0]}
                              </div>
                              <span className={`text-[13px] flex-1 text-left truncate ${checked ? "font-semibold text-[#1C1C1E]" : "text-[#3C3C43]"}`}>
                                {name === currentUserName ? "You" : name}
                              </span>
                              <div className={`size-[18px] rounded-[5px] flex items-center justify-center transition-colors flex-shrink-0 ${
                                checked ? "bg-[#007AFF]" : "bg-[#E5E5EA]"
                              }`}>
                                {checked && <Check className="size-2.5 text-white" strokeWidth={3} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Tax & tip note */}
      {taxTipTotal > 0 && (
        <div className="bg-[#F7F7F5] rounded-[12px] p-3 mb-4 flex items-start gap-2.5">
          <Sparkles className="size-4 text-[#FF9F0A] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[12px] font-semibold text-[#1C1C1E]">Tax & tip split proportionally</p>
            <p className="text-[11px] text-[#6E6E73] leading-snug mt-0.5">
              ${taxTipTotal.toFixed(2)} distributed based on what each person ordered.
            </p>
          </div>
        </div>
      )}

      {/* Per-person summary */}
      {allAssigned && (
        <div className="mb-4">
          <p className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-[0.6px] mb-2">Per-person total</p>
          <div className="bg-white rounded-[14px] divide-y divide-[#F1F2F5] border border-[#F1F2F5]">
            {participants.map((name) => {
              const share = shares[name] ?? 0;
              if (share < 0.01) return null;
              return (
                <div key={name} className="flex items-center gap-3 px-3.5 py-2.5">
                  <div className={`size-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold ${AVATAR_COLORS[name[0]] || "bg-[#8E8E93]"}`}>
                    {name[0]}
                  </div>
                  <span className="text-[14px] text-[#1C1C1E] flex-1 font-medium">
                    {name === currentUserName ? "You" : name}
                  </span>
                  <span className="text-[15px] font-semibold text-[#1C1C1E]">${share.toFixed(2)}</span>
                </div>
              );
            })}
            <div className="flex items-center gap-3 px-3.5 py-2.5 bg-[#FAFAF8]">
              <span className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider flex-1">Total</span>
              <span className="text-[15px] font-bold text-[#1C1C1E]">${allocated.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onBack}
          className="h-12 px-5 rounded-[14px] bg-[#F1F2F5] text-[#1C1C1E] font-semibold text-[14px] active:scale-[0.98] transition-transform"
        >
          Back
        </button>
        <motion.button
          whileTap={allAssigned ? { scale: 0.97 } : {}}
          onClick={onContinue}
          disabled={!allAssigned}
          animate={{
            opacity: allAssigned ? 1 : 0.4,
            boxShadow: allAssigned ? "0 4px 16px rgba(0,122,255,0.30)" : "none",
          }}
          className="flex-1 h-12 rounded-[14px] bg-[#007AFF] text-white font-semibold text-[15px]"
        >
          {allAssigned ? "Continue" : `Assign ${unassignedCount} more`}
        </motion.button>
      </div>

      {/* Floating drag ghost */}
      {drag && drag.moved && (() => {
        if (drag.sourceType === "item") {
          const item = drag.itemIdx !== null ? receipt.items[drag.itemIdx] : null;
          if (!item) return null;
          return (
            <div
              className="fixed pointer-events-none z-[200]"
              style={{ left: drag.x, top: drag.y, transform: "translate(-50%, -50%)" }}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1, rotate: -2 }}
                className="bg-white rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.25)] border border-[#007AFF]/30 px-3 py-2 flex items-center gap-2 max-w-[220px]"
              >
                <span className="text-[13px] font-semibold text-[#1C1C1E] truncate">{item.name}</span>
                <span className="text-[13px] font-bold text-[#007AFF] flex-shrink-0">${item.price.toFixed(2)}</span>
              </motion.div>
            </div>
          );
        }
        // Person drag ghost — show a floating avatar
        const name = drag.personName ?? "";
        return (
          <div
            className="fixed pointer-events-none z-[200]"
            style={{ left: drag.x, top: drag.y, transform: "translate(-50%, -50%)" }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1.08, rotate: 3 }}
              className={`size-12 rounded-full flex items-center justify-center text-white text-[16px] font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.22)] ring-[3px] ring-white ${AVATAR_COLORS[name[0]] || "bg-[#8E8E93]"}`}
            >
              {name[0]}
            </motion.div>
          </div>
        );
      })()}
    </motion.div>
  );
}

// ─── Add Expense Sheet ──────────────────────────────────────────────────────

export type ExpenseSavePayload = {
  emoji: string;
  description: string;
  amount: string;
  categoryName: string;
  paidByName: string;
  splitMode: "equal" | "custom";
  // Each entry is a real share in dollars. Callers can treat this list as the
  // authoritative split — "equal" mode fills them in before emitting.
  splits: { name: string; share: number }[];
  /** Stored as API `date_label` — must reflect the user's picked calendar day. */
  dateLabel: string;
  // Optional URL to a receipt photo (set when the user used the scan flow).
  // The host app stashes this in localStorage so it can be re-displayed later.
  receiptImage?: string;
};

export function AddExpenseSheet({
  onClose,
  participants,
  onSaved,
  tripId,
}: {
  onClose: () => void;
  participants: string[];
  onSaved: (info: ExpenseSavePayload) => void;
  tripId?: string;
}) {
  const [me] = useCurrentUser();
  const YOU_NAME = participants.includes(me) ? me : YOU;

  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedCat, setSelectedCat] = React.useState<string | null>(null);
  const [focusedField, setFocusedField] = React.useState<"amount" | "desc" | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [paidBy, setPaidBy] = React.useState(YOU_NAME);
  const [showPaidByPicker, setShowPaidByPicker] = React.useState(false);
  const [splitMembers, setSplitMembers] = React.useState<Set<string>>(() => new Set(participants));
  const [showSplitPicker, setShowSplitPicker] = React.useState(false);

  const [splitMode, setSplitMode] = React.useState<"equal" | "custom">("equal");
  const [customAmounts, setCustomAmounts] = React.useState<Record<string, string>>({});
  const [activeSplitName, setActiveSplitName] = React.useState<string | null>(null);
  const [expenseDateISO, setExpenseDateISO] = React.useState(todayISODate);

  // ── Receipt scanner state ───────────────────────────────────────────────
  const [scanView, setScanView] = React.useState<
    "hidden" | "camera" | "scanning" | "itemsplit"
  >("hidden");
  const [scanningReceipt, setScanningReceipt] = React.useState<SampleReceipt | null>(null);
  const [itemAssignments, setItemAssignments] = React.useState<Record<number, string[]>>({});
  const [scannedBadge, setScannedBadge] = React.useState(false);

  const openCamera = () => {
    setScanningReceipt(DEFAULT_RECEIPT);
    setItemAssignments({});
    setScanView("camera");
  };

  // After item assignment is confirmed, fill the form with computed custom splits.
  const applyItemSplit = () => {
    const receipt = scanningReceipt;
    if (!receipt) return;
    const shares = computePerMemberShares(receipt, itemAssignments, participants);

    setAmount(receipt.total.toFixed(2));
    setDescription(receipt.description);
    setSelectedCat(receipt.category);

    // Switch to custom split mode and pre-fill amounts.
    const involved = participants.filter((p) => (shares[p] ?? 0) >= 0.01);
    const nextAmounts: Record<string, string> = {};
    for (const name of involved) {
      nextAmounts[name] = (shares[name] ?? 0).toFixed(2);
    }
    setSplitMembers(new Set(involved.length > 0 ? involved : participants));
    setCustomAmounts(nextAmounts);
    setSplitMode("custom");
    setScannedBadge(true);
    setScanView("hidden");
  };

  const cat = EXPENSE_CATEGORIES.find((c) => c.id === selectedCat);
  const splitCount = splitMembers.size;
  const allSelected = splitCount === participants.length;
  const expenseAmt = parseFloat(amount) || 0;

  const customTotal = [...splitMembers].reduce(
    (s, n) => s + (parseFloat(customAmounts[n] || "0") || 0),
    0
  );
  const remaining = expenseAmt - customTotal;
  const isCustomBalanced = splitMode === "custom" && Math.abs(remaining) < 0.02;
  const isValid =
    amount !== "" && parseFloat(amount) > 0 && (splitMode === "equal" || isCustomBalanced);

  const allocationPct = expenseAmt > 0 ? Math.min(customTotal / expenseAmt, 1) : 0;
  const allocationColor = isCustomBalanced
    ? "#34C759"
    : remaining < 0
    ? "#FF453A"
    : "#FF9F0A";

  const switchToCustom = () => {
    setSplitMode("custom");
    setActiveSplitName(null);
    const count = splitMembers.size;
    const amounts: Record<string, string> = {};
    if (expenseAmt > 0 && count > 0) {
      const perPerson = (expenseAmt / count).toFixed(2);
      [...splitMembers].forEach((n) => { amounts[n] = perPerson; });
    } else {
      [...splitMembers].forEach((n) => { amounts[n] = ""; });
    }
    setCustomAmounts(amounts);
  };

  const switchToEqual = () => {
    setSplitMode("equal");
    setActiveSplitName(null);
    setCustomAmounts({});
  };

  const toggleSplitMember = (name: string) => {
    setSplitMembers((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        if (next.size > 1) {
          next.delete(name);
          if (splitMode === "custom") {
            setCustomAmounts((a) => { const b = { ...a }; delete b[name]; return b; });
          }
        }
      } else {
        next.add(name);
        if (splitMode === "custom") {
          setCustomAmounts((a) => ({ ...a, [name]: "" }));
        }
      }
      return next;
    });
  };

  const handleSave = () => {
    if (!isValid) return;
    setSaving(true);
    const emoji = cat?.icon ?? "💸";
    const desc = description.trim() || cat?.name || "Expense";
    const total = parseFloat(amount) || 0;
    const members = [...splitMembers];

    let splits: { name: string; share: number }[] = [];
    if (splitMode === "equal") {
      const count = Math.max(members.length, 1);
      const base = Math.floor((total * 100) / count);          // cents
      const remainderCents = Math.round(total * 100) - base * count;
      splits = members.map((name, i) => ({
        name,
        share: (base + (i < remainderCents ? 1 : 0)) / 100,
      }));
    } else {
      splits = members.map((name) => ({
        name,
        share: parseFloat(customAmounts[name] || "0") || 0,
      }));
    }

    setTimeout(() => {
      onSaved({
        emoji,
        description: desc,
        amount: total.toFixed(2),
        categoryName: cat?.name ?? "Other",
        paidByName: paidBy,
        splitMode,
        splits,
        dateLabel: formatExpenseDateLabelFromISO(expenseDateISO),
        receiptImage: scanningReceipt?.image,
      });
      onClose();
    }, 420);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-[60]"
        onClick={onClose}
      />

      <motion.div
        initial={{ y: "100%", opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 240 }}
        className="fixed inset-x-0 bottom-0 z-[61] max-h-[92%] overflow-y-auto overscroll-contain bg-white rounded-t-[28px] shadow-[0_-4px_40px_rgba(0,0,0,0.18)] no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="pt-3 pb-0">
          <div className="w-9 h-[5px] rounded-full bg-[#E5E5EA] mx-auto" />
        </div>

        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-start justify-between">
          <div>
            {scanView === "itemsplit" && (
              <button
                onClick={() => scanningReceipt && setScanView("camera")}
                className="flex items-center gap-1 text-[#007AFF] mb-1 -ml-0.5"
              >
                <ChevronLeft className="size-4" />
                <span className="text-[14px] font-medium">Retake</span>
              </button>
            )}
            <h3 className="text-[20px] font-semibold text-[#1C1C1E] leading-snug">
              {scanView === "itemsplit" ? "Split by Item" : "Add Expense"}
            </h3>
            <p className="text-[13px] text-[#8E8E93] font-medium mt-0.5">
              {scanView === "itemsplit"
                ? "Assign each dish to who ordered it"
                : "Log spending for this trip"}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-3 mt-0.5 flex-shrink-0">
            {scanView === "hidden" && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={openCamera}
                className="flex items-center gap-1.5 h-8 px-3 bg-[#EAF2FF] rounded-full"
              >
                <ScanLine className="size-3.5 text-[#007AFF]" />
                <span className="text-[12px] font-semibold text-[#007AFF]">Scan</span>
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="size-8 bg-[#F1F2F5] rounded-full flex items-center justify-center"
            >
              <X className="size-4 text-[#8E8E93]" />
            </motion.button>
          </div>
        </div>

        {/* ── Item Split view ── */}
        <AnimatePresence>
          {scanView === "itemsplit" && scanningReceipt && (
            <LineItemSplitView
              receipt={scanningReceipt}
              participants={participants}
              currentUserName={YOU_NAME}
              assignments={itemAssignments}
              setAssignments={setItemAssignments}
              onContinue={applyItemSplit}
              onBack={() => setScanView("camera")}
            />
          )}
        </AnimatePresence>

        {/* Form body */}
        <AnimatePresence>
        {scanView === "hidden" && (
        <motion.div
          initial={scannedBadge ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 pb-2 space-y-4"
        >

          {/* ── Scanned badge ── */}
          <AnimatePresence>
            {scannedBadge && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-2.5 bg-[#E8F7EE] rounded-[14px] px-4 py-3"
              >
                <div className="size-7 rounded-full bg-[#34C759] flex items-center justify-center flex-shrink-0">
                  <Check className="size-4 text-white" strokeWidth={3} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1C1C1E]">Receipt scanned</p>
                  <p className="text-[11px] text-[#6E6E73]">Amount, category & description pre-filled — review and adjust below</p>
                </div>
                <button onClick={() => setScannedBadge(false)} className="flex-shrink-0 p-1">
                  <X className="size-3.5 text-[#8E8E93]" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Section 1: Amount ── */}
          <div>
            <p className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-[0.6px] mb-2">Amount</p>
            <motion.div
              animate={{
                borderColor: focusedField === "amount" ? "#007AFF" : "rgba(0,0,0,0)",
                backgroundColor: focusedField === "amount" ? "#F0F6FF" : "#F7F7F5",
              }}
              className="w-full rounded-[14px] px-4 py-3 border-[1.5px] flex items-center justify-between gap-3"
            >
              <label className="flex items-center gap-1.5 flex-1 min-w-0 cursor-text">
                <span className="text-[18px] text-[#C7C7CC] font-semibold">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  enterKeyHint="next"
                  autoComplete="off"
                  value={amount}
                  onChange={(e) => setAmount(sanitizeMoneyInput(e.target.value))}
                  onFocus={() => { setFocusedField("amount"); setActiveSplitName(null); setShowPaidByPicker(false); }}
                  onBlur={() => setFocusedField((f) => (f === "amount" ? null : f))}
                  placeholder="0"
                  className="flex-1 min-w-0 w-full bg-transparent border-0 outline-none p-0 text-[32px] font-semibold tracking-tight leading-none text-[#1C1C1E] placeholder:text-[#D1D1D6]"
                />
              </label>
              <button
                type="button"
                className="text-right pl-3 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/40 rounded-md"
                aria-haspopup="listbox"
                aria-expanded={showPaidByPicker}
                aria-label={`Paid by ${paidBy}. Change payer.`}
                onClick={(e) => { e.stopPropagation(); setShowPaidByPicker((p) => !p); setFocusedField(null); setActiveSplitName(null); }}
              >
                <p className="text-[10px] font-medium text-[#8E8E93]">Paid by</p>
                <div className="flex items-center gap-1 justify-end">
                  <p className="text-[13px] font-semibold text-[#007AFF]">
                    {paidBy === YOU_NAME ? "You" : paidBy}
                  </p>
                  <ChevronDown className={`size-3 text-[#007AFF] transition-transform ${showPaidByPicker ? "rotate-180" : ""}`} />
                </div>
              </button>
            </motion.div>

            {/* Paid By Picker */}
            <AnimatePresence>
              {showPaidByPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="bg-[#F7F7F5] rounded-[14px] p-2 mt-2 space-y-0.5">
                    {participants.map((name) => {
                      const isActive = paidBy === name;
                      return (
                        <button
                          key={name}
                          onClick={() => { setPaidBy(name); setShowPaidByPicker(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-all active:scale-[0.98] ${
                            isActive ? "bg-white shadow-sm" : "hover:bg-white/50"
                          }`}
                        >
                          <div className={`size-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold ${AVATAR_COLORS[name[0]] || "bg-[#8E8E93]"}`}>
                            {name[0]}
                          </div>
                          <span className={`text-[14px] flex-1 text-left ${isActive ? "font-semibold text-[#1C1C1E]" : "text-[#3C3C43]"}`}>
                            {name === YOU_NAME ? "You" : name}
                          </span>
                          {isActive && <Check className="size-4 text-[#007AFF]" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Section 2: Category ── */}
          <div>
            <p className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-[0.6px] mb-2">Category</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5">
              {EXPENSE_CATEGORIES.map((c) => {
                const isActive = selectedCat === c.id;
                return (
                  <motion.button
                    key={c.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedCat(isActive ? null : c.id)}
                    className={`flex flex-col items-center gap-1 w-[56px] py-2.5 rounded-[12px] transition-all flex-shrink-0 ${
                      isActive
                        ? "bg-[#007AFF] shadow-[0_4px_12px_rgba(0,122,255,0.25)]"
                        : "bg-[#F7F7F5]"
                    }`}
                  >
                    <span className="text-[20px] leading-none">{c.icon}</span>
                    <span className={`text-[10px] font-semibold ${
                      isActive ? "text-white/80" : "text-[#8E8E93]"
                    }`}>{c.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ── Section 3: Description ── */}
          <div>
            <p className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-[0.6px] mb-2">Description</p>
            <motion.div
              animate={{
                borderColor: focusedField === "desc" ? "#007AFF" : "rgba(0,0,0,0)",
                backgroundColor: focusedField === "desc" ? "#F0F6FF" : "#F7F7F5",
              }}
              className="w-full rounded-[14px] px-4 py-3 border-[1.5px] flex items-center gap-3"
            >
              <input
                type="text"
                enterKeyHint="done"
                autoComplete="off"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={() => { setFocusedField("desc"); setActiveSplitName(null); setShowPaidByPicker(false); }}
                onBlur={() => setFocusedField((f) => (f === "desc" ? null : f))}
                placeholder="What was this for?"
                className="flex-1 min-w-0 bg-transparent border-0 outline-none p-0 text-[15px] text-[#1C1C1E] placeholder:text-[#C7C7CC]"
              />
              {description && (
                <motion.button
                  type="button"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setDescription("")}
                  className="size-5 bg-[#C7C7CC] rounded-full flex items-center justify-center flex-shrink-0"
                  aria-label="Clear description"
                >
                  <X className="size-3 text-white" strokeWidth={3} />
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* ── Section 4: Date + Split (compact chips — matches sheet mockup) ── */}
          <div>
            <div className="flex gap-2 items-stretch">
              <label className="relative flex-1 min-w-0 overflow-hidden rounded-[14px] bg-[#F7F7F5] px-3.5 py-3 flex items-center gap-2 cursor-pointer transition-transform active:scale-[0.97]">
                <Clock className="size-4 text-[#C7C7CC] flex-shrink-0 pointer-events-none" aria-hidden />
                <span className="text-[13px] font-medium text-[#1C1C1E] truncate pointer-events-none select-none">
                  {formatExpenseWhenChipFromISO(expenseDateISO)}
                </span>
                <input
                  type="date"
                  value={expenseDateISO}
                  onChange={(e) => setExpenseDateISO(e.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0 w-full h-full"
                  aria-label="Expense date"
                />
              </label>
              <button
                type="button"
                onClick={() => { setShowSplitPicker((p) => !p); setFocusedField(null); }}
                aria-haspopup="dialog"
                aria-expanded={showSplitPicker}
                aria-label={`Split with ${splitMembers.size} ${splitMembers.size === 1 ? "person" : "people"}. Adjust split.`}
                className={`flex-1 rounded-[14px] px-3.5 py-3 min-h-0 flex items-center gap-2 transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/40 ${
                  showSplitPicker ? "bg-[#EAF2FF] ring-1.5 ring-[#007AFF]/20" : "bg-[#F7F7F5]"
                }`}
              >
                {splitMode === "custom"
                  ? <SplitSquareHorizontal className={`size-4 flex-shrink-0 ${showSplitPicker ? "text-[#007AFF]" : "text-[#C7C7CC]"}`} />
                  : <Users className={`size-4 flex-shrink-0 ${showSplitPicker ? "text-[#007AFF]" : "text-[#C7C7CC]"}`} />
                }
                <span className={`text-[13px] font-medium truncate ${showSplitPicker ? "text-[#007AFF]" : "text-[#1C1C1E]"}`}>
                  {splitMode === "custom"
                    ? "Custom split"
                    : allSelected
                    ? `Split ${splitCount} ${splitCount === 1 ? "way" : "ways"}`
                    : `Split ${splitCount} of ${participants.length}`}
                </span>
              </button>
            </div>

            {/* ── Expanded Split Picker ── */}
            <AnimatePresence>
              {showSplitPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="bg-[#F7F7F5] rounded-[14px] p-2 mt-2 space-y-1">

                    {/* Segmented control */}
                    <div className="bg-[#E5E5EA] rounded-[10px] p-[3px] flex mb-2">
                      <button
                        onClick={switchToEqual}
                        className={`flex-1 py-[7px] rounded-[8px] text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          splitMode === "equal"
                            ? "bg-white shadow-sm text-[#1C1C1E]"
                            : "text-[#8E8E93]"
                        }`}
                      >
                        <Users className="size-3.5" />
                        Equally
                      </button>
                      <button
                        onClick={switchToCustom}
                        className={`flex-1 py-[7px] rounded-[8px] text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          splitMode === "custom"
                            ? "bg-white shadow-sm text-[#1C1C1E]"
                            : "text-[#8E8E93]"
                        }`}
                      >
                        <SplitSquareHorizontal className="size-3.5" />
                        Custom $
                      </button>
                    </div>

                    {/* Equal Mode */}
                    {splitMode === "equal" && (
                      <>
                        <button
                          onClick={() => setSplitMembers(new Set(participants))}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] mb-0.5 transition-all active:scale-[0.98] ${
                            allSelected ? "bg-white shadow-sm" : "hover:bg-white/50"
                          }`}
                        >
                          <div className="size-7 rounded-full bg-[#007AFF]/10 flex items-center justify-center">
                            <Users className="size-3.5 text-[#007AFF]" />
                          </div>
                          <span className={`text-[14px] flex-1 text-left ${allSelected ? "font-semibold text-[#1C1C1E]" : "text-[#3C3C43]"}`}>
                            Everyone
                          </span>
                          {allSelected && <Check className="size-4 text-[#007AFF]" />}
                        </button>

                        <div className="h-px bg-[#E5E5EA]/60 mx-2 my-1" />

                        {participants.map((name) => {
                          const included = splitMembers.has(name);
                          return (
                            <button
                              key={name}
                              onClick={() => toggleSplitMember(name)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-all active:scale-[0.98] ${
                                included ? "bg-white shadow-sm" : "hover:bg-white/50 opacity-60"
                              }`}
                            >
                              <div className={`size-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold ${AVATAR_COLORS[name[0]] || "bg-[#8E8E93]"}`}>
                                {name[0]}
                              </div>
                              <span className={`text-[14px] flex-1 text-left ${included ? "font-medium text-[#1C1C1E]" : "text-[#8E8E93]"}`}>
                                {name === YOU_NAME ? "You" : name}
                              </span>
                              <div className={`size-5 rounded-[6px] flex items-center justify-center transition-colors ${
                                included ? "bg-[#007AFF]" : "bg-[#E5E5EA]"
                              }`}>
                                {included && <Check className="size-3 text-white" strokeWidth={3} />}
                              </div>
                            </button>
                          );
                        })}

                        {expenseAmt > 0 && splitCount > 0 && (
                          <div className="px-3 pt-2 pb-1">
                            <p className="text-[11px] text-[#8E8E93]">
                              ${(expenseAmt / splitCount).toFixed(2)} per person
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Custom $ Mode */}
                    {splitMode === "custom" && (
                      <>
                        <p className="text-[11px] text-[#8E8E93] px-3 pt-0.5 pb-1.5 leading-relaxed">
                          Tap an amount to edit — great for dinners where everyone ordered something different.
                        </p>

                        {participants.map((name) => {
                          const included = splitMembers.has(name);
                          const isActive = activeSplitName === name;
                          const val = customAmounts[name] || "";

                          return (
                            <div
                              key={name}
                              className={`flex items-center gap-3 px-3 py-[9px] rounded-[12px] transition-all ${
                                included ? "bg-white shadow-sm" : "opacity-40"
                              }`}
                            >
                              <button
                                onClick={() => toggleSplitMember(name)}
                                className={`size-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0 ${AVATAR_COLORS[name[0]] || "bg-[#8E8E93]"}`}
                              >
                                {name[0]}
                              </button>

                              <span className="text-[14px] text-[#1C1C1E] flex-1 font-medium">
                                {name === YOU_NAME ? "You" : name}
                              </span>

                              {included ? (
                                <label
                                  className={`flex items-center gap-0.5 px-3 py-1.5 rounded-[10px] border-[1.5px] transition-all min-w-[86px] justify-end cursor-text ${
                                    isActive
                                      ? "border-[#007AFF] bg-[#EAF2FF]"
                                      : "border-[#E5E5EA] bg-[#F7F7F5]"
                                  }`}
                                >
                                  <span className="text-[12px] text-[#8E8E93] mr-0.5">$</span>
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={val}
                                    onChange={(e) =>
                                      setCustomAmounts((a) => ({
                                        ...a,
                                        [name]: sanitizeMoneyInput(e.target.value),
                                      }))
                                    }
                                    onFocus={() => {
                                      setActiveSplitName(name);
                                      setFocusedField(null);
                                      setShowPaidByPicker(false);
                                    }}
                                    onBlur={() =>
                                      setActiveSplitName((s) => (s === name ? null : s))
                                    }
                                    placeholder="0"
                                    aria-label={`${name === YOU_NAME ? "Your" : `${name}'s`} share`}
                                    className="w-[56px] min-w-0 bg-transparent border-0 outline-none p-0 text-[15px] font-semibold text-right text-[#1C1C1E] placeholder:text-[#C7C7CC]"
                                  />
                                </label>
                              ) : (
                                <button
                                  onClick={() => toggleSplitMember(name)}
                                  className="text-[12px] text-[#007AFF] font-semibold px-2 py-1"
                                >
                                  Include
                                </button>
                              )}
                            </div>
                          );
                        })}

                        {/* Allocation progress bar */}
                        <div className="mx-1 mt-3 mb-1 bg-white rounded-[12px] p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[12px] text-[#8E8E93]">Allocated</span>
                            <motion.span
                              key={isCustomBalanced ? "balanced" : remaining > 0 ? "under" : "over"}
                              initial={{ opacity: 0, scale: 0.85 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="text-[12px] font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                color: allocationColor,
                                backgroundColor: allocationColor + "18",
                              }}
                            >
                              {isCustomBalanced
                                ? "✓ Balanced"
                                : remaining > 0
                                ? `$${remaining.toFixed(2)} left to assign`
                                : `$${Math.abs(remaining).toFixed(2)} over total`}
                            </motion.span>
                          </div>
                          <div className="h-[6px] bg-[#F1F2F5] rounded-full overflow-hidden">
                            <motion.div
                              animate={{
                                width: `${Math.min(allocationPct * 100, 100)}%`,
                                backgroundColor: allocationColor,
                              }}
                              transition={{ type: "spring", damping: 20, stiffness: 160 }}
                              className="h-full rounded-full"
                            />
                          </div>
                          <div className="flex justify-between mt-1.5">
                            <span className="text-[10px] text-[#C7C7CC]">
                              ${customTotal.toFixed(2)} assigned
                            </span>
                            <span className="text-[10px] text-[#C7C7CC]">
                              ${expenseAmt.toFixed(2)} total
                            </span>
                          </div>
                        </div>

                        {expenseAmt > 0 && splitCount > 0 && (
                          <button
                            onClick={() => {
                              const perPerson = (expenseAmt / splitCount).toFixed(2);
                              const amounts: Record<string, string> = {};
                              [...splitMembers].forEach((n) => { amounts[n] = perPerson; });
                              setCustomAmounts(amounts);
                            }}
                            className="w-full py-2 text-[12px] font-semibold text-[#007AFF] text-center active:opacity-60 transition-opacity"
                          >
                            Auto-fill equally · ${(expenseAmt / splitCount).toFixed(2)} each
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Save CTA ── */}
          <motion.button
            whileTap={isValid ? { scale: 0.97 } : {}}
            onClick={handleSave}
            disabled={!isValid || saving}
            animate={{
              backgroundColor: isValid ? "#007AFF" : "#007AFF",
              opacity: isValid ? 1 : 0.4,
              boxShadow: isValid ? "0 4px 16px rgba(0,122,255,0.30)" : "none",
            }}
            transition={{ duration: 0.2 }}
            className="w-full py-[15px] rounded-[14px] font-semibold text-[17px] text-white transition-colors relative overflow-hidden"
          >
            {saving ? (
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2"
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                  className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
                Saving...
              </motion.span>
            ) : splitMode === "custom" && expenseAmt > 0 && !isCustomBalanced ? (
              remaining > 0
                ? `Assign $${remaining.toFixed(2)} more to save`
                : `Remove $${Math.abs(remaining).toFixed(2)} to save`
            ) : (
              "Add expense"
            )}
          </motion.button>
        </motion.div>
        )}
        </AnimatePresence>

      </motion.div>

      {/* ── Fullscreen Camera ── */}
      <AnimatePresence>
        {scanView === "camera" && scanningReceipt && (
          <CameraView
            receipt={scanningReceipt}
            onCapture={() => setScanView("scanning")}
            onClose={() => {
              setScanView("hidden");
              setScanningReceipt(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Fullscreen Scanning ── */}
      <AnimatePresence>
        {scanView === "scanning" && scanningReceipt && (
          <ScanningOverlay
            receipt={scanningReceipt}
            onDone={() => setScanView("itemsplit")}
          />
        )}
      </AnimatePresence>
    </>
  );
}
