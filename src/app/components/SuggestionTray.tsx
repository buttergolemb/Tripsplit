import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Clock, AlignLeft, Search, Sparkles, Check } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { HorizontalDragScroll } from "./HorizontalDragScroll";
import type { Suggestion } from "./timeline/types";

// ─── Category mapping ────────────────────────────────────────────────────────

const ACTIVITY_CATEGORIES = [
  { emoji: "🍽", label: "Food" },
  { emoji: "🌲", label: "Outdoors" },
  { emoji: "🎸", label: "Music" },
  { emoji: "🛍️", label: "Shopping" },
  { emoji: "🍺", label: "Drinks" },
  { emoji: "🏛️", label: "Culture" },
  { emoji: "🎭", label: "Show" },
  { emoji: "🌊", label: "Nature" },
  { emoji: "☕", label: "Café" },
  { emoji: "🎟️", label: "Other" },
];

function categoryIndexFromSuggestion(suggestion: Suggestion): number | null {
  const map: Record<string, number> = {
    Food: 0,
    Outdoors: 1,
    Music: 2,
    Shopping: 3,
    Drinks: 4,
    Culture: 5,
    Show: 6,
    Nature: 7,
    Café: 8,
    Activity: 1,
  };
  return map[suggestion.category] ?? null;
}

// If the suggestion doesn't carry an explicit location, try to lift one out of the
// title for phrasings like "Paddleboarding on Lady Bird Lake" or "Dinner at Franklin BBQ".
function resolveSuggestionLocation(suggestion: Suggestion): string {
  if (suggestion.location) return suggestion.location;
  const match = suggestion.title.match(/\s+(?:at|on|in)\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

// ─── Component ───────────────────────────────────────────────────────────────

interface SuggestionTrayProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: Suggestion | null;
  dayLabel: string;
  onSubmit: (data: {
    title: string;
    time: string;
    endTime: string;
    location: string;
    notes: string;
    emoji: string;
    category: string;
  }) => void;
}

export function SuggestionTray({
  isOpen,
  onClose,
  suggestion,
  dayLabel,
  onSubmit,
}: SuggestionTrayProps) {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [autofilled, setAutofilled] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const timeRef = useRef<HTMLInputElement>(null);

  // Autofill whenever a new suggestion is selected (even while the tray is already open).
  useEffect(() => {
    if (suggestion && isOpen) {
      setAutofilled(false);
      setAccepted(false);
      const prefilledLocation = resolveSuggestionLocation(suggestion);
      // Stagger autofill so the user can see each field fill in.
      const t = setTimeout(() => {
        setTitle(suggestion.title);
        setSelectedCategory(categoryIndexFromSuggestion(suggestion));
        setLocation(prefilledLocation);
        setNotes("");
        setStartTime(suggestion.suggestedTime ?? "");
        setEndTime("");
        setAutofilled(true);
      }, 180);
      return () => clearTimeout(t);
    }
    if (!isOpen) {
      setTitle("");
      setStartTime("");
      setEndTime("");
      setLocation("");
      setNotes("");
      setSelectedCategory(null);
      setAutofilled(false);
      setAccepted(false);
    }
  }, [suggestion, isOpen]);

  // Focus time input after autofill since time is the main missing field
  useEffect(() => {
    if (autofilled && timeRef.current) {
      const t = setTimeout(() => timeRef.current?.focus(), 350);
      return () => clearTimeout(t);
    }
  }, [autofilled]);

  const canSubmit = !!title.trim() && !!startTime.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setAccepted(true);
    const cat = selectedCategory !== null ? ACTIVITY_CATEGORIES[selectedCategory] : null;
    setTimeout(() => {
      onSubmit({
        title,
        time: startTime,
        endTime,
        location,
        notes,
        emoji: cat?.emoji ?? suggestion?.emoji ?? "🆕",
        category: cat?.label ?? suggestion?.category ?? "Other",
      });
      onClose();
    }, 400);
  };

  return (
    <BottomSheet
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Add Activity"
      subtitle={`Adding to ${dayLabel}`}
      srDescription="Add a suggested activity to your timeline."
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Suggestion badge */}
        {suggestion && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center gap-2 mb-4 px-3 py-2.5 bg-[#F1EEFF] rounded-[12px]"
          >
            <Sparkles className="size-3.5 text-[#8E8EFA] flex-shrink-0" />
            <p className="text-[12px] text-[#8E8EFA] font-medium flex-1">
              Suggested: <span className="font-semibold">{suggestion.title}</span>
              {suggestion.reason && (
                <span className="text-[#B0ABFA]"> · {suggestion.reason}</span>
              )}
            </p>
            <AnimatePresence>
              {autofilled && !accepted && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-[10px] font-semibold text-[#8E8EFA] bg-white px-2 py-0.5 rounded-full"
                >
                  Autofilled
                </motion.span>
              )}
              {accepted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="size-5 bg-[#34C759] rounded-full flex items-center justify-center"
                >
                  <Check className="size-3 text-white" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Category quick-picks ─────────────────────────────────────── */}
        <div className="mb-5">
          <p className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">
            Suggested Activities
          </p>
          <HorizontalDragScroll className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {ACTIVITY_CATEGORIES.map((cat, i) => {
              const isActive = selectedCategory === i;
              return (
                <motion.button
                  key={i}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedCategory(isActive ? null : i)}
                  className={`flex flex-col items-center gap-1 px-3.5 py-2.5 rounded-[14px] transition-all flex-shrink-0 ${
                    isActive
                      ? "bg-[#007AFF] shadow-[0_4px_12px_rgba(0,122,255,0.25)]"
                      : "bg-[#F7F7F5] active:bg-[#EEEEF0]"
                  }`}
                >
                  <span className="text-xl leading-none">{cat.emoji}</span>
                  <span
                    className={`text-[10px] font-semibold ${
                      isActive ? "text-white/80" : "text-[#8E8E93]"
                    }`}
                  >
                    {cat.label}
                  </span>
                </motion.button>
              );
            })}
          </HorizontalDragScroll>
        </div>

        {/* ── Fields ───────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Activity Name */}
          <div>
            <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 block">
              Category Name
            </label>
            <div className="flex items-center gap-2.5">
              <div className="size-[48px] rounded-[14px] bg-[#F7F7F5] flex items-center justify-center text-[20px] flex-shrink-0">
                {selectedCategory !== null
                  ? ACTIVITY_CATEGORIES[selectedCategory].emoji
                  : suggestion?.emoji ?? "+"}
              </div>
              <motion.input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Dinner at Franklin BBQ"
                animate={{
                  backgroundColor: autofilled && title ? "#F0F6FF" : "#F7F7F5",
                }}
                transition={{ duration: 0.4 }}
                className="flex-1 min-w-0 bg-[#F7F7F5] rounded-[14px] px-4 py-3 text-[15px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-shadow"
              />
            </div>
          </div>

          {/* Time — highlighted as the key missing field */}
          <div>
            <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 flex items-center gap-2">
              Suggested Time
              {!startTime && autofilled && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[10px] font-semibold text-[#FF9F0A] bg-[#FFF3E0] px-2 py-0.5 rounded-full normal-case tracking-normal"
                >
                  Required
                </motion.span>
              )}
            </label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C7C7CC] size-4 pointer-events-none" />
              <input
                ref={timeRef}
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`w-full bg-[#F7F7F5] rounded-[14px] pl-11 pr-4 py-3 text-[15px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all ${
                  !startTime && autofilled ? "ring-2 ring-[#FF9F0A]/30" : ""
                }`}
              />
            </div>
          </div>

          {/* End Time */}
          <div>
            <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 flex items-center gap-2">
              End Time
            </label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C7C7CC] size-4 pointer-events-none" />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={`w-full bg-[#F7F7F5] rounded-[14px] pl-11 pr-4 py-3 text-[15px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all ${
                  !endTime && autofilled ? "ring-2 ring-[#FF9F0A]/30" : ""
                }`}
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
              <motion.input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Search for a place"
                animate={{
                  backgroundColor: autofilled && location ? "#F0F6FF" : "#F7F7F5",
                }}
                transition={{ duration: 0.4 }}
                className="w-full bg-[#F7F7F5] rounded-[14px] pl-11 pr-10 py-3 text-[15px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-shadow"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#D1D1D6] pointer-events-none" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 block">
              Notes{" "}
              <span className="font-normal text-[#C7C7CC] normal-case tracking-normal">
                (optional)
              </span>
            </label>
            <div className="relative">
              <AlignLeft className="absolute left-4 top-3.5 text-[#C7C7CC] size-4 pointer-events-none" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any details? e.g. 'Need to book ahead'"
                className="w-full bg-[#F7F7F5] rounded-[14px] pl-11 pr-4 py-3 text-[15px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 min-h-[88px] resize-none"
              />
            </div>
          </div>
        </div>

        {/* ── CTA Footer ─────────────────────────────────────────────── */}
        <div className="pt-5 pb-1">
          <motion.button
            type="submit"
            disabled={!canSubmit || accepted}
            whileTap={canSubmit ? { scale: 0.97 } : {}}
            animate={{
              backgroundColor: accepted
                ? "#34C759"
                : canSubmit
                ? "#007AFF"
                : "#007AFF",
              opacity: canSubmit || accepted ? 1 : 0.4,
            }}
            transition={{ duration: 0.2 }}
            className="w-full py-[14px] rounded-[14px] font-semibold text-[17px] text-white shadow-[0_4px_12px_rgba(0,122,255,0.25)] disabled:shadow-none transition-all"
          >
            <AnimatePresence mode="wait">
              {accepted ? (
                <motion.span
                  key="done"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2"
                >
                  <Check className="size-5" />
                  Added to Timeline
                </motion.span>
              ) : (
                <motion.span key="add" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Add Activity
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </form>
    </BottomSheet>
  );
}