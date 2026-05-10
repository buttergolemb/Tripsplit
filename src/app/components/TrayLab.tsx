import React, { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  X,
  MapPin,
  Clock,
  AlignLeft,
  Search,
  DollarSign,
  Plus,
} from "lucide-react";

if (import.meta.hot) import.meta.hot.decline();

// ─── Tray Shell ───────────────────────────────────────────────────────────────
// Renders the vaul Drawer chrome inline as a static card for previewing.

function TrayShell({
  title,
  subtitle,
  children,
  maxHeight = 600,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: number;
}) {
  return (
    <div
      className="bg-white rounded-[24px] overflow-hidden shadow-[var(--shadow-apple-2)]"
      style={{ maxHeight }}
    >
      {/* Handle bar */}
      <div className="pt-3 pb-0 flex-shrink-0">
        <div className="w-9 h-[5px] rounded-full bg-[#E5E5EA] mx-auto" />
      </div>

      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-start justify-between flex-shrink-0">
        <div className="min-w-0 flex-1">
          <h3 className="text-[20px] font-semibold text-[#1C1C1E] leading-snug">{title}</h3>
          {subtitle && (
            <p className="text-[13px] text-[#8E8E93] font-medium mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        {/* Static close pill */}
        <div className="size-8 bg-[#F1F2F5] rounded-full flex items-center justify-center flex-shrink-0 ml-3 mt-0.5">
          <X className="size-4 text-[#8E8E93]" />
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto px-5 pb-8" style={{ maxHeight: maxHeight - 96 }}>
        {children}
      </div>
    </div>
  );
}

// ─── Tray Label ───────────────────────────────────────────────────────────────

function TrayLabel({
  name,
  screen,
  trigger,
  note,
}: {
  name: string;
  screen: string;
  trigger: string;
  note?: string;
}) {
  return (
    <div className="flex items-start justify-between mb-2 px-1">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-widest">
            {name}
          </span>
          <span className="text-[10px] font-semibold text-[#007AFF] bg-[#EAF2FF] px-2 py-0.5 rounded-full">
            {screen}
          </span>
        </div>
        {note && (
          <p className="text-[11px] text-[#C7C7CC] mt-0.5">Trigger: {trigger} · {note}</p>
        )}
        {!note && (
          <p className="text-[11px] text-[#C7C7CC] mt-0.5">Trigger: {trigger}</p>
        )}
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ label, description }: { label: string; description: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="size-[6px] rounded-full bg-[#007AFF]" />
        <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[#007AFF]">
          {label}
        </h2>
      </div>
      <p className="text-[13px] text-[#8E8E93] pl-[14px]">{description}</p>
    </div>
  );
}

// ─── Anatomy Legend ───────────────────────────────────────────────────────────

function AnatomyLegend() {
  const zones = [
    { label: "Zone 1 · Shell", items: ["Handle bar", "20px title", "Subtitle line", "Pill close button"], color: "#007AFF" },
    { label: "Zone 2 · Quick-picks", items: ["Horizontal chip row", "#007AFF selected state", "Emoji + label"], color: "#34C759" },
    { label: "Zone 3 · Fields", items: ["Labeled inputs (12px uppercase)", "Consistent 14px border-radius", "Ring-2 focus state"], color: "#FF9F0A" },
    { label: "Zone 4 · CTA Footer", items: ["Full-width or split buttons", "#007AFF primary", "Sticky to bottom"], color: "#8E8EFA" },
  ];

  return (
    <div className="bg-white rounded-[18px] p-4 shadow-[var(--shadow-apple-1)] mb-8">
      <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-widest mb-3">
        Tray anatomy
      </p>
      <div className="space-y-3">
        {zones.map((z) => (
          <div key={z.label} className="flex items-start gap-3">
            <div
              style={{ backgroundColor: z.color }}
              className="size-[6px] rounded-full mt-[5px] flex-shrink-0"
            />
            <div>
              <p className="text-[12px] font-semibold text-[#1C1C1E]">{z.label}</p>
              <p className="text-[11px] text-[#8E8E93] mt-px">{z.items.join(" · ")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tray 1: New Trip ─────────────────────────────────────────────────────────

const TRIP_EMOJIS = ["✈️", "🏖️", "⛰️", "🏙️", "🎿", "🏕️", "🚗", "🎡", "🎭", "🎸", "🍕", "🌮"];

function NewTripContent() {
  const [emoji, setEmoji] = useState("✈️");
  const [name, setName] = useState("");

  return (
    <div className="space-y-5">
      {/* Emoji chip row */}
      <div>
        <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-3 block">
          Choose an Icon
        </label>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5">
          {TRIP_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`size-12 text-xl rounded-[14px] flex-shrink-0 transition-all duration-150 flex items-center justify-center ${
                emoji === e
                  ? "bg-[#007AFF] shadow-[0_4px_12px_rgba(0,122,255,0.25)]"
                  : "bg-[#F7F7F5] hover:bg-[#F1F2F5] active:scale-95"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Icon + Name inline */}
      <div>
        <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 block">
          Trip Name
        </label>
        <div className="flex items-center gap-2.5">
          <div className="size-[48px] rounded-[14px] bg-[#F7F7F5] flex items-center justify-center text-[22px] flex-shrink-0 border-[1.5px] border-transparent">
            {emoji}
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Hawaii Adventure"
            className="flex-1 min-w-0 px-4 py-3 text-[15px] bg-[#F7F7F5] rounded-[14px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-shadow"
          />
        </div>
      </div>

      {/* Inline preview */}
      <AnimatePresence>
        {name && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#F7F7F5] rounded-[16px] px-4 py-3 flex items-center gap-3">
              <div className="size-10 rounded-[12px] bg-white shadow-sm flex items-center justify-center text-xl flex-shrink-0">
                {emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#1C1C1E] truncate">{name}</p>
                <p className="text-[12px] text-[#8E8E93]">Ready to plan · 0 members</p>
              </div>
              <span className="text-[11px] font-semibold text-[#007AFF] bg-[#EAF2FF] px-2 py-0.5 rounded-full flex-shrink-0">
                Planning
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <button
        disabled={!name.trim()}
        className="w-full py-[14px] bg-[#007AFF] text-white rounded-[14px] font-semibold text-[17px] shadow-[0_4px_12px_rgba(0,122,255,0.25)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
      >
        Create Trip
      </button>
    </div>
  );
}

// ─── Tray 2: Add Expense ──────────────────────────────────────────────────────

const EXPENSE_CATEGORIES = [
  { id: "food", icon: "🍽", name: "Food" },
  { id: "gas", icon: "⛽", name: "Gas" },
  { id: "lodging", icon: "🏠", name: "Lodging" },
  { id: "drinks", icon: "🍺", name: "Drinks" },
  { id: "activity", icon: "🎟️", name: "Activity" },
  { id: "groceries", icon: "🛒", name: "Groceries" },
  { id: "transport", icon: "🚗", name: "Transport" },
  { id: "other", icon: "💸", name: "Other" },
];

function AddExpenseContent() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>("food");
  const [focusedField, setFocusedField] = useState<"amount" | "desc" | null>(null);

  const cat = EXPENSE_CATEGORIES.find((c) => c.id === selectedCat);
  const isValid = amount !== "" && parseFloat(amount) > 0;

  const handleAmountKey = (key: string) => {
    if (key === "⌫") setAmount((p) => p.slice(0, -1));
    else if (key === ".") { if (!amount.includes(".")) setAmount((p) => p + "."); }
    else if (/[0-9]/.test(key)) setAmount((p) => p + key);
  };

  const NUMPAD = [["1","2","3"],["4","5","6"],["7","8","9"],[".",  "0","⌫"]];

  return (
    <div className="space-y-4">
      {/* Amount field */}
      <div>
        <p className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">Amount</p>
        <motion.button
          onMouseDown={(e) => { e.preventDefault(); setFocusedField("amount"); }}
          onClick={() => setFocusedField("amount")}
          animate={{
            borderColor: focusedField === "amount" ? "#007AFF" : "rgba(0,0,0,0)",
            backgroundColor: focusedField === "amount" ? "#F0F6FF" : "#F7F7F5",
          }}
          className="w-full rounded-[14px] px-4 py-3 border-[1.5px] text-left flex items-center justify-between"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[18px] text-[#C7C7CC] font-semibold">$</span>
            <span className={`text-[32px] font-semibold tracking-tight leading-none transition-colors ${amount ? "text-[#1C1C1E]" : "text-[#D1D1D6]"}`}>
              {amount || "0"}
            </span>
            {focusedField === "amount" && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.9 }}
                className="w-[2px] h-8 bg-[#007AFF] rounded-full ml-0.5"
              />
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium text-[#8E8E93]">Paid by</p>
            <p className="text-[13px] font-semibold text-[#1C1C1E]">You</p>
          </div>
        </motion.button>
      </div>

      {/* Category chips */}
      <div>
        <p className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">Category</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5">
          {EXPENSE_CATEGORIES.map((c) => {
            const isActive = selectedCat === c.id;
            return (
              <motion.button
                key={c.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedCat(isActive ? null : c.id)}
                className={`flex flex-col items-center gap-1 px-3.5 py-2.5 rounded-[14px] transition-all flex-shrink-0 ${
                  isActive ? "bg-[#007AFF] shadow-[0_4px_12px_rgba(0,122,255,0.25)]" : "bg-[#F7F7F5]"
                }`}
              >
                <span className="text-xl leading-none">{c.icon}</span>
                <span className={`text-[10px] font-semibold ${isActive ? "text-white/80" : "text-[#8E8E93]"}`}>
                  {c.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Description field */}
      <div>
        <p className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">Description</p>
        <motion.button
          onMouseDown={(e) => { e.preventDefault(); setFocusedField("desc"); }}
          onClick={() => setFocusedField("desc")}
          animate={{
            borderColor: focusedField === "desc" ? "#007AFF" : "rgba(0,0,0,0)",
            backgroundColor: focusedField === "desc" ? "#F0F6FF" : "#F7F7F5",
          }}
          className="w-full rounded-[14px] px-4 py-3 border-[1.5px] text-left flex items-center justify-between min-h-[48px]"
        >
          <span className={`text-[15px] ${description ? "text-[#1C1C1E]" : "text-[#C7C7CC]"}`}>
            {description || (cat ? `e.g. ${cat.icon} ${cat.name}` : "What was this for?")}
          </span>
          {focusedField === "desc" && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.9 }}
              className="w-[2px] h-5 bg-[#007AFF] rounded-full ml-1"
            />
          )}
        </motion.button>
      </div>

      {/* Inline numpad when focused */}
      <AnimatePresence>
        {focusedField === "amount" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="grid grid-cols-3 gap-2"
          >
            {NUMPAD.flat().map((k, i) => (
              <button
                key={i}
                onMouseDown={(e) => { e.preventDefault(); handleAmountKey(k); }}
                className={`py-3.5 rounded-[14px] text-[20px] font-semibold transition-all active:scale-95 ${
                  k === "⌫" ? "text-[#FF3B30] bg-[#FFF1F0]" : "text-[#1C1C1E] bg-[#F7F7F5] hover:bg-[#EEEEF0]"
                }`}
              >
                {k}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save */}
      <button
        disabled={!isValid}
        className="w-full py-[14px] bg-[#007AFF] text-white rounded-[14px] font-semibold text-[17px] shadow-[0_4px_12px_rgba(0,122,255,0.25)] disabled:opacity-40 disabled:shadow-none transition-all active:scale-[0.98]"
      >
        {isValid ? `Add ${cat?.icon ?? "💸"} ${cat?.name ?? "Expense"} · $${parseFloat(amount).toFixed(2)}` : "Add Expense"}
      </button>
    </div>
  );
}

// ─── Tray 3: Propose Activity ─────────────────────────────────────────────────

const ACTIVITY_CATEGORIES = [
  { emoji: "🍽", label: "Food" },
  { emoji: "🏊", label: "Activity" },
  { emoji: "🎸", label: "Music" },
  { emoji: "🛍️", label: "Shopping" },
  { emoji: "🏛️", label: "Culture" },
  { emoji: "🎭", label: "Show" },
  { emoji: "🌊", label: "Nature" },
  { emoji: "☕", label: "Café" },
];

function ProposeActivityContent() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(0);

  const canSubmit = !!title.trim();

  return (
    <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
      {/* Category chips */}
      <div className="mb-5">
        <p className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">Category</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5">
          {ACTIVITY_CATEGORIES.map((cat, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedCategory(selectedCategory === i ? null : i)}
              className={`flex flex-col items-center gap-1 px-3.5 py-2.5 rounded-[14px] transition-all flex-shrink-0 ${
                selectedCategory === i
                  ? "bg-[#007AFF] shadow-[0_4px_12px_rgba(0,122,255,0.25)]"
                  : "bg-[#F7F7F5]"
              }`}
            >
              <span className="text-xl leading-none">{cat.emoji}</span>
              <span className={`text-[10px] font-semibold ${selectedCategory === i ? "text-white/80" : "text-[#8E8E93]"}`}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Activity Name */}
        <div>
          <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 block">
            Activity Name
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Dinner at Franklin BBQ"
            className="w-full bg-[#F7F7F5] rounded-[14px] px-4 py-3 text-[15px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
          />
        </div>

        {/* Time */}
        <div>
          <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 block">
            Suggested Time
          </label>
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C7C7CC] size-4 pointer-events-none" />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-[#F7F7F5] rounded-[14px] pl-11 pr-4 py-3 text-[15px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 block">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C7C7CC] size-4 pointer-events-none" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Search for a place..."
              className="w-full bg-[#F7F7F5] rounded-[14px] pl-11 pr-10 py-3 text-[15px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#D1D1D6] pointer-events-none" />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 block">
            Notes <span className="font-normal text-[#C7C7CC] normal-case tracking-normal">optional</span>
          </label>
          <div className="relative">
            <AlignLeft className="absolute left-4 top-3.5 text-[#C7C7CC] size-4 pointer-events-none" />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any details? e.g. 'Need to book ahead'"
              className="w-full bg-[#F7F7F5] rounded-[14px] pl-11 pr-4 py-3 text-[15px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 min-h-[80px] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-5 pb-1 flex gap-3">
        <button
          type="button"
          className="flex-1 py-[14px] rounded-[14px] font-semibold text-[#8E8E93] bg-[#F7F7F5] active:scale-[0.98] transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex-[2] bg-[#007AFF] text-white py-[14px] rounded-[14px] font-semibold shadow-[0_4px_12px_rgba(0,122,255,0.25)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all active:scale-[0.98]"
        >
          Propose Activity
        </button>
      </div>
    </form>
  );
}

// ─── Tray 4: Add Category ─────────────────────────────────────────────────────

const BUDGET_PRESETS = [
  { name: "Lodging", icon: "🏠", type: "shared" as const },
  { name: "Gas & Transport", icon: "⛽", type: "shared" as const },
  { name: "Food & Dining", icon: "🍽️", type: "shared" as const },
  { name: "Activities", icon: "🎟️", type: "optional" as const },
  { name: "Groceries", icon: "🛒", type: "shared" as const },
];

const CATEGORY_EMOJIS = [
  "🏠","⛽","🍽️","🎟️","🛒","🍕","🏖️","✈️","🚗","🎵",
  "🏕️","🗺️","📸","🛍️","🍺","🎲","🌊","💊","🎭","☕",
];

function AddCategoryContent() {
  const [customName, setCustomName] = useState("");
  const [customIcon, setCustomIcon] = useState("📦");
  const [customType, setCustomType] = useState<"shared" | "optional">("shared");
  const [customEstimate, setCustomEstimate] = useState("");
  const [showEmojiGrid, setShowEmojiGrid] = useState(false);

  return (
    <div>
      {/* Quick add */}
      <p className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">Quick Add</p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5 mb-5">
        {BUDGET_PRESETS.map((t) => (
          <button
            key={t.name}
            className="flex flex-col items-center gap-1 px-3.5 py-2.5 bg-[#F7F7F5] rounded-[14px] flex-shrink-0 active:scale-95 transition-all"
          >
            <span className="text-xl leading-none">{t.icon}</span>
            <span className="text-[10px] font-semibold text-[#8E8E93]">{t.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="relative flex items-center mb-4">
        <div className="flex-1 border-t border-[#F1F2F5]" />
        <span className="px-3 text-[11px] font-semibold text-[#C7C7CC] uppercase tracking-wider">Custom</span>
        <div className="flex-1 border-t border-[#F1F2F5]" />
      </div>

      {/* Emoji + Name row */}
      <div className="flex items-center gap-2.5 mb-3">
        <button
          onClick={() => setShowEmojiGrid((p) => !p)}
          className={`size-[46px] rounded-[12px] flex items-center justify-center flex-shrink-0 text-xl transition-all active:scale-90 ${
            showEmojiGrid ? "bg-[#FFF3E0] ring-2 ring-[#FF9F0A]" : "bg-[#F7F7F5]"
          }`}
        >
          {customIcon}
        </button>
        <input
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="Category name"
          className="flex-1 min-w-0 px-3.5 py-3 bg-[#F7F7F5] rounded-[12px] text-[15px] text-[#1C1C1E] placeholder-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#FF9F0A]/30"
        />
      </div>

      {/* Emoji grid */}
      <AnimatePresence>
        {showEmojiGrid && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-3">
              <p className="text-[10px] font-semibold text-[#C7C7CC] uppercase tracking-wider mb-1.5">All Icons</p>
              <div className="grid grid-cols-10 gap-1.5">
                {CATEGORY_EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => { setCustomIcon(e); setShowEmojiGrid(false); }}
                    className={`aspect-square rounded-[8px] flex items-center justify-center text-[16px] transition-all active:scale-90 ${
                      customIcon === e ? "bg-[#FFF3E0] ring-2 ring-[#FF9F0A]" : "bg-[#F7F7F5]"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estimate */}
      <div className="mb-3">
        <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-1.5">
          Estimate <span className="font-normal text-[#C7C7CC]">(optional)</span>
        </p>
        <div className="flex items-center gap-2 bg-[#F7F7F5] rounded-[12px] px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-[#FF9F0A]/30">
          <span className="text-[15px] text-[#C7C7CC]">$</span>
          <input
            type="number"
            inputMode="numeric"
            value={customEstimate}
            onChange={(e) => setCustomEstimate(e.target.value)}
            placeholder="0"
            className="flex-1 bg-transparent text-[15px] text-[#1C1C1E] placeholder-[#D1D1D6] focus:outline-none"
          />
        </div>
      </div>

      {/* Shared / Optional toggle */}
      <div className="mb-4">
        <div className="flex gap-2 p-1 bg-[#F1F2F5] rounded-[12px]">
          <button
            onClick={() => setCustomType("shared")}
            className={`flex-1 py-2 rounded-[10px] text-[13px] font-semibold transition-all ${
              customType === "shared" ? "bg-white text-[#007AFF] shadow-sm" : "text-[#8E8E93]"
            }`}
          >
            Shared
          </button>
          <button
            onClick={() => setCustomType("optional")}
            className={`flex-1 py-2 rounded-[10px] text-[13px] font-semibold transition-all ${
              customType === "optional" ? "bg-white text-[#007AFF] shadow-sm" : "text-[#8E8E93]"
            }`}
          >
            Optional
          </button>
        </div>
        <p className="text-[11px] text-[#C7C7CC] mt-1.5 px-0.5">
          {customType === "shared"
            ? "Split evenly among all participants"
            : "Only charged to those who opt in"}
        </p>
      </div>

      {/* CTA */}
      <button
        disabled={!customName.trim()}
        className="w-full py-[14px] bg-[#007AFF] text-white rounded-[14px] text-[17px] font-semibold shadow-[0_4px_12px_rgba(0,122,255,0.25)] disabled:opacity-35 disabled:shadow-none active:scale-[0.98] transition-all"
      >
        Add Category
      </button>
    </div>
  );
}

// ─── Tray 5: Edit Category ────────────────────────────────────────────────────

function EditCategoryContent() {
  const [editName, setEditName] = useState("Lodging");
  const [editIcon, setEditIcon] = useState("🏠");
  const [editType, setEditType] = useState<"shared" | "optional">("shared");
  const [editEstimate, setEditEstimate] = useState("800");

  return (
    <div className="space-y-4">
      {/* Name */}
      <div>
        <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">Name</p>
        <div className="flex items-center gap-2.5">
          <div className="size-[46px] rounded-[12px] bg-[#F7F7F5] flex items-center justify-center text-xl flex-shrink-0">
            {editIcon}
          </div>
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1 px-4 py-3 bg-[#F7F7F5] rounded-[12px] text-[15px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#FF9F0A]/30"
          />
        </div>
      </div>

      {/* Icon picker */}
      <div>
        <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">Icon</p>
        <div className="grid grid-cols-10 gap-1.5">
          {CATEGORY_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEditIcon(e)}
              className={`aspect-square rounded-[8px] flex items-center justify-center text-[16px] transition-all active:scale-90 ${
                editIcon === e ? "bg-[#FFF3E0] ring-2 ring-[#FF9F0A]" : "bg-[#F7F7F5]"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Estimate */}
      <div>
        <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">
          Estimate <span className="font-normal text-[#C7C7CC]">(optional)</span>
        </p>
        <div className="flex items-center gap-2 bg-[#F7F7F5] rounded-[12px] px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-[#FF9F0A]/30">
          <span className="text-[15px] text-[#C7C7CC]">$</span>
          <input
            type="number"
            inputMode="numeric"
            value={editEstimate}
            onChange={(e) => setEditEstimate(e.target.value)}
            placeholder="0"
            className="flex-1 bg-transparent text-[15px] text-[#1C1C1E] placeholder-[#D1D1D6] focus:outline-none"
          />
        </div>
      </div>

      {/* Shared / Optional toggle */}
      <div>
        <div className="flex gap-2 p-1 bg-[#F1F2F5] rounded-[12px]">
          <button
            onClick={() => setEditType("shared")}
            className={`flex-1 py-2 rounded-[10px] text-[13px] font-semibold transition-all ${
              editType === "shared" ? "bg-white text-[#007AFF] shadow-sm" : "text-[#8E8E93]"
            }`}
          >
            Shared
          </button>
          <button
            onClick={() => setEditType("optional")}
            className={`flex-1 py-2 rounded-[10px] text-[13px] font-semibold transition-all ${
              editType === "optional" ? "bg-white text-[#007AFF] shadow-sm" : "text-[#8E8E93]"
            }`}
          >
            Optional
          </button>
        </div>
        <p className="text-[11px] text-[#C7C7CC] mt-1.5 px-0.5">
          {editType === "shared"
            ? "Split evenly among all participants"
            : "Only charged to those who opt in"}
        </p>
      </div>

      {/* Footer */}
      <div className="flex gap-3 pt-1 pb-1">
        <button className="flex-1 py-[13px] rounded-[14px] font-semibold text-[#FF3B30] bg-[#FFF1F0] active:scale-[0.98] transition-all">
          Delete
        </button>
        <button
          disabled={!editName.trim()}
          className="flex-[2] bg-[#007AFF] text-white py-[13px] rounded-[14px] font-semibold shadow-[0_4px_12px_rgba(0,122,255,0.25)] disabled:opacity-40 disabled:shadow-none transition-all active:scale-[0.98]"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TrayLab() {
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[#F7F7F5] no-scrollbar">
      {/* Header */}
      <div className="px-5 pt-14 pb-2">
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/"
            className="size-9 rounded-full bg-white shadow-[var(--shadow-apple-1)] flex items-center justify-center hover:shadow-[var(--shadow-apple-2)] transition-shadow"
          >
            <ArrowLeft className="size-4 text-[#8E8E93]" />
          </Link>
          <div>
            <p className="text-[12px] text-[#8E8E93] font-medium">Design Exploration</p>
            <h1 className="text-[22px] font-semibold text-[#1C1C1E] tracking-tight">
              Tray Lab
            </h1>
          </div>
        </div>

        <p className="text-[14px] text-[#8E8E93] mb-6 leading-relaxed">
          All five bottom-sheet trays rendered inline — interactive but not modal. 
          Each uses the unified shell: handle bar, 20px title, subtitle, pill close, labeled fields, and a #007AFF CTA.
        </p>

        <AnatomyLegend />
      </div>

      {/* ── Trays ── */}
      <div className="px-5 space-y-10 pb-24">

        {/* ── 1. New Trip ── */}
        <div>
          <SectionHeader
            label="Trip List"
            description="Launched by the + FAB on the home screen. Creates and names a new trip in one gesture."
          />
          <TrayLabel
            name="New Trip"
            screen="TripList"
            trigger="+ FAB (fixed bottom-right)"
            note="Horizontal emoji row → inline name input → preview card"
          />
          <TrayShell title="New Trip" subtitle="Start planning together" maxHeight={620}>
            <NewTripContent />
          </TrayShell>
        </div>

        {/* ── 2. Add Expense ── */}
        <div>
          <SectionHeader
            label="Money"
            description="Launched by the + button on the Money screen. Captures amount, category, and description."
          />
          <TrayLabel
            name="Add Expense"
            screen="MoneyScreen"
            trigger="+ Add Expense button"
            note="Big $ amount field → category chip row → description → numpad inline"
          />
          <TrayShell title="Add Expense" subtitle="Log spending for this trip" maxHeight={700}>
            <AddExpenseContent />
          </TrayShell>
        </div>

        {/* ── 3. Propose Activity ── */}
        <div>
          <SectionHeader
            label="Timeline"
            description="Launched by the + button on any day row. Proposes a new activity for that day."
          />
          <TrayLabel
            name="Propose Activity"
            screen="Timeline / ProposalSheet"
            trigger="+ on a timeline day row"
            note="Category chips → fields → split Cancel / Propose footer"
          />
          <TrayShell title="Propose Activity" subtitle="Adding to Day 2 · Fri Apr 4" maxHeight={780}>
            <ProposeActivityContent />
          </TrayShell>
        </div>

        {/* ── 4. Add Category ── */}
        <div>
          <SectionHeader
            label="Planning"
            description="Launched by 'Add Category' in the Budget section. Lets you pick a preset or build a custom category."
          />
          <TrayLabel
            name="Add Category"
            screen="PlanningPhase"
            trigger="Add Category button in Budget"
            note="Quick-add preset chips → custom emoji+name → estimate → Shared/Optional toggle"
          />
          <TrayShell title="Add Category" subtitle="Create a budget category" maxHeight={760}>
            <AddCategoryContent />
          </TrayShell>
        </div>

        {/* ── 5. Edit Category ── */}
        <div>
          <SectionHeader
            label="Planning"
            description="Launched by tapping a category row in the Budget section. Edits name, icon, estimate, and split type."
          />
          <TrayLabel
            name="Edit Category"
            screen="PlanningPhase"
            trigger="Tap an existing category row"
            note="Inline icon grid · delete + save footer"
          />
          <TrayShell title="Edit Category" subtitle="Update name, icon, or split type" maxHeight={680}>
            <EditCategoryContent />
          </TrayShell>
        </div>

      </div>
    </div>
  );
}