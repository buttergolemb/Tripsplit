import React from 'react';
import { MapPin, AlignLeft, Search } from 'lucide-react';
import { BottomSheet } from '../BottomSheet';
import { HorizontalDragScroll } from '../HorizontalDragScroll';

interface ProposalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  dayLabel: string;
  onSubmit: (data: any) => void;
}

// ─── Unified category chip data ─────────────────────────────────────────────
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

export function ProposalSheet({ isOpen, onClose, dayLabel, onSubmit }: ProposalSheetProps) {
  const [title, setTitle] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [startTime, setStartTime] = React.useState('');
  const [endTime, setEndTime] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, location, time: startTime, endTime, notes });
    setTitle('');
    setLocation('');
    setStartTime('');
    setEndTime('');
    setNotes('');
    setSelectedCategory(null);
    onClose();
  };

  const canSubmit = !!title.trim();

  return (
    <BottomSheet
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Propose Activity"
      subtitle={`Adding to ${dayLabel}`}
      srDescription="Propose a new activity for this day of the trip."
    >
      <form onSubmit={handleSubmit} className="flex flex-col">

        {/* ── Section 1: Category quick-picks ────────────────────────────── */}
        <div className="mb-5">
          <p className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">
            Category
          </p>
          <HorizontalDragScroll className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
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
                <span className={`text-[10px] font-semibold ${
                  selectedCategory === i ? "text-white/80" : "text-[#8E8E93]"
                }`}>{cat.label}</span>
              </button>
            ))}
          </HorizontalDragScroll>
        </div>

        {/* ── Section 2: Supporting fields ────────────────────────────────── */}
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
              autoFocus
            />
          </div>

          {/* Time */}
          <div>
            <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 block">
              Time
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-[#F7F7F5] rounded-[14px] pl-4 pr-4 py-3 text-[15px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
                  placeholder="Start"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[#C7C7CC] uppercase pointer-events-none">Start</span>
              </div>
              <div className="flex items-center text-[#C7C7CC] font-medium text-[13px]">–</div>
              <div className="flex-1 relative">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-[#F7F7F5] rounded-[14px] pl-4 pr-4 py-3 text-[15px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
                  placeholder="End"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[#C7C7CC] uppercase pointer-events-none">End</span>
              </div>
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
                className="w-full bg-[#F7F7F5] rounded-[14px] pl-11 pr-4 py-3 text-[15px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 min-h-[88px] resize-none"
              />
            </div>
          </div>
        </div>

        {/* ── Sticky footer ───────────────────────────────────────────────── */}
        <div className="pt-5 pb-1 flex gap-3">
          <button
            type="button"
            onClick={onClose}
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
    </BottomSheet>
  );
}