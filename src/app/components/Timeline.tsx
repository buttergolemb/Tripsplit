import React, { useState } from 'react';
import { Link, useParams, useSearchParams } from "react-router";
import { ArrowLeft, Plus, Calendar, MapPin, Clock } from "lucide-react";
import { motion } from "motion/react";
import { EventCard } from './timeline/EventCard';
import { EventDetail } from './timeline/EventDetail';
import { ProposalSheet } from './timeline/ProposalSheet';
import { SuggestionsPanel } from './timeline/SuggestionsPanel';
import { DaySchedule, Event, Suggestion, AttendanceStatus } from './timeline/types';
import { useTripData } from './TripDataContext';
import { TimelineSpine } from './timeline/TimelineSpine';

import { SuggestionTray } from './SuggestionTray';
import { HorizontalDragScroll } from './HorizontalDragScroll';
import { BottomSheet } from "./BottomSheet";
import { getPreferredTimelineDayNumber } from "../../lib/tripLiveDay";

// ─── Add Day Sheet ──────────────────────────────────────────────────────────

function AddDaySheet({ isOpen, onClose, onSubmit, nextDayNumber }: {
  isOpen: boolean; onClose: () => void;
  onSubmit: (data: { date: string; label: string }) => void;
  nextDayNumber: number;
}) {
  const [date, setDate] = useState("");
  const [label, setLabel] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!date.trim()) return;
    onSubmit({ date: date.trim(), label: label.trim() || `Day ${nextDayNumber}` });
    setDate("");
    setLabel("");
    onClose();
  };

  return (
    <BottomSheet
      open={isOpen}
      onOpenChange={(open) => { if (!open) onClose(); }}
      title="Add Day"
      subtitle={`Day ${nextDayNumber} of your trip`}
      srDescription="Add a new day to your trip timeline."
    >
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 pb-2">
        <div>
          <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 block">Date</label>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="e.g., Apr 5"
            className="w-full px-4 py-3 bg-[#F7F7F5] rounded-[14px] text-[15px] text-[#1C1C1E] placeholder-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
          />
        </div>
        <div>
          <label className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 block">
            Label <span className="font-normal text-[#C7C7CC] normal-case tracking-normal">optional</span>
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., Arrival, Beach Day, Departure"
            className="w-full px-4 py-3 bg-[#F7F7F5] rounded-[14px] text-[15px] text-[#1C1C1E] placeholder-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
          />
        </div>

        <button
          type="submit"
          disabled={!date.trim()}
          className="w-full py-[15px] bg-[#007AFF] text-white rounded-[14px] font-semibold text-[17px] shadow-[0_4px_16px_rgba(0,122,255,0.30)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:shadow-none"
        >
          Add Day {nextDayNumber}
        </button>
      </form>
    </BottomSheet>
  );
}

// ─── Main Timeline Component ────────────────────────────────────────────────

export default function Timeline() {
  const { tripId } = useParams();
  const [searchParams] = useSearchParams();
  const dayParam = searchParams.get("day");
  const eventParam = searchParams.get("event");
  const { trip, addDay, addEventToDay, voteOnEvent, updateEvent, removeEventFromDay } = useTripData();

  const days = trip.timeline;
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isProposalSheetOpen, setIsProposalSheetOpen] = useState(false);
  const [proposalContext, setProposalContext] = useState<{ dayLabel: string } | null>(null);
  const [showAddDay, setShowAddDay] = useState(false);

  const [suggestionTrayOpen, setSuggestionTrayOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

  const timelineBootRef = React.useRef(false);

  React.useEffect(() => {
    timelineBootRef.current = false;
  }, [tripId]);

  React.useEffect(() => {
    if (days.length === 0) return;
    const dn = dayParam ? parseInt(dayParam, 10) : NaN;
    if (!Number.isNaN(dn) && days.some((d) => d.dayNumber === dn)) {
      setSelectedDayNum(dn);
      timelineBootRef.current = true;
      return;
    }
    if (!timelineBootRef.current) {
      setSelectedDayNum(getPreferredTimelineDayNumber(days, trip.phase));
      timelineBootRef.current = true;
      return;
    }
    setSelectedDayNum((prev) =>
      days.some((d) => d.dayNumber === prev)
        ? prev
        : getPreferredTimelineDayNumber(days, trip.phase),
    );
  }, [days, dayParam, trip.phase]);

  React.useEffect(() => {
    if (days.length === 0) return;
    if (!days.some((d) => d.dayNumber === selectedDayNum)) {
      setSelectedDayNum(getPreferredTimelineDayNumber(days, trip.phase));
    }
  }, [days, selectedDayNum, trip.phase]);

  const activeDay = days.find(d => d.dayNumber === selectedDayNum) || days[0];

  React.useEffect(() => {
    if (!eventParam) return;
    const day = days.find((d) => d.dayNumber === selectedDayNum);
    if (!day?.events.some((e) => e.id === eventParam)) return;
    const t = window.setTimeout(() => {
      document.getElementById(`timeline-event-${eventParam}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
    return () => window.clearTimeout(t);
  }, [eventParam, selectedDayNum, days]);

  const handleEventClick = (event: Event) => setSelectedEvent(event);

  const handleProposeClick = () => {
    if (!activeDay) return;
    setProposalContext({ dayLabel: `Day ${activeDay.dayNumber} · ${activeDay.date}` });
    setIsProposalSheetOpen(true);
  };

  const handleVote = (event: Event, type: 'for' | 'against') => {
    voteOnEvent(event.id, type);
  };

  const handleProposalSubmit = (data: any) => {
    if (!activeDay) return;
    const newEvent: Event = {
      id: `new-${Date.now()}`,
      title: data.title,
      time: data.time ? formatTime24to12(data.time) : "TBD",
      endTime: data.endTime ? formatTime24to12(data.endTime) : undefined,
      location: data.location,
      emoji: "🆕",
      state: "proposed",
      votesFor: 1,
      votesAgainst: 0,
      votingCloses: "24h",
      attendees: [{ name: "You", status: "going" }]
    };
    addEventToDay(activeDay.dayNumber, newEvent);
    setIsProposalSheetOpen(false);
  };

  const handleAddDay = (data: { date: string; label: string }) => {
    const nextNum = days.length > 0 ? Math.max(...days.map(d => d.dayNumber)) + 1 : 1;
    addDay({
      date: data.date,
      dayNumber: nextNum,
      label: data.label,
    });
    setSelectedDayNum(nextNum);
  };

  const handleAttendanceChange = (_status: AttendanceStatus) => {
    if (!selectedEvent) return;
  };

  // ─── Empty State ──────────────────────────────────────────────────────────

  if (days.length === 0) {
    return (
      <div className="pb-6">
        <header className="px-6 pt-14 pb-3">
          <div className="flex items-center justify-between mb-4">
            <Link
              to={`/trip/${tripId}`}
              className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors active:scale-95"
            >
              <ArrowLeft className="size-5 text-[#007AFF]" />
            </Link>
          </div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-[28px] font-semibold text-[#1C1C1E] tracking-tight leading-tight">
              Timeline
            </h1>
            <p className="text-[13px] text-[#8E8E93] font-medium mt-0.5">
              {trip.dates || "Dates TBD"} · {trip.destination || "Destination TBD"}
            </p>
          </motion.div>
        </header>

        <div className="px-4 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center max-w-sm mx-auto"
          >
            <div className="size-20 bg-[#F1F2F5] rounded-[24px] flex items-center justify-center mx-auto mb-5">
              <Calendar className="size-9 text-[#C7C7CC]" />
            </div>
            <h2 className="text-[20px] font-semibold text-[#1C1C1E] mb-2">No days planned yet</h2>
            <p className="text-[15px] text-[#8E8E93] mb-8 leading-relaxed">
              Start building your trip timeline by adding your first day.
            </p>

            <button
              onClick={() => setShowAddDay(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#007AFF] text-white rounded-[16px] font-semibold text-[17px] shadow-[0_4px_12px_rgba(0,122,255,0.25)] active:scale-[0.98] transition-all"
            >
              <Plus className="size-5" />
              Add First Day
            </button>

            {/* Quick Templates */}
            <div className="mt-8">
              <p className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">
                Or start with a template
              </p>
              <div className="space-y-2">
                {[
                  { label: "Weekend Trip (2 days)", days: [{ date: "Day 1", label: "Arrive & Explore" }, { date: "Day 2", label: "Adventure & Depart" }] },
                  { label: "3-Day Trip", days: [{ date: "Day 1", label: "Arrival" }, { date: "Day 2", label: "Explore" }, { date: "Day 3", label: "Departure" }] },
                ].map((template) => (
                  <button
                    key={template.label}
                    onClick={() => {
                      template.days.forEach((d, i) => {
                        addDay({ date: d.date, dayNumber: i + 1, label: d.label });
                      });
                      setSelectedDayNum(1);
                    }}
                    className="w-full flex items-center gap-3 bg-white rounded-[16px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[var(--shadow-apple-1)] transition-shadow active:scale-[0.98] text-left"
                  >
                    <div className="size-10 rounded-[12px] bg-[#EAF2FF] flex items-center justify-center flex-shrink-0">
                      <Clock className="size-5 text-[#007AFF]" />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#1C1C1E]">{template.label}</p>
                      <p className="text-[12px] text-[#8E8E93]">
                        {template.days.map(d => d.label).join(" → ")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested First Events */}
            <div className="mt-6">
              <p className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">
                Common first events
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { emoji: "🏠", label: "Check-in (3 PM)", title: "Check-in", time: "3:00 PM" },
                  { emoji: "🧳", label: "Check-out (11 AM)", title: "Check-out", time: "11:00 AM" },
                  { emoji: "🚗", label: "Travel time", title: "Travel time", time: "TBD" },
                  { emoji: "🍽", label: "Group dinner", title: "Group dinner", time: "7:00 PM" },
                ].map((suggestion) => (
                  <button
                    key={suggestion.label}
                    onClick={() => {
                      // Create day 1 with the event pre-included
                      addDay({
                        date: "Day 1",
                        dayNumber: 1,
                        label: "Day 1",
                        events: [{
                          id: `quick-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                          title: suggestion.title,
                          time: suggestion.time,
                          emoji: suggestion.emoji,
                          state: "proposed" as const,
                          votesFor: 1,
                          votesAgainst: 0,
                          attendees: [{ name: "You", status: "going" as const }],
                        }],
                      });
                      setSelectedDayNum(1);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-full text-[12px] font-medium text-[#1C1C1E] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[var(--shadow-apple-1)] transition-shadow active:scale-95"
                  >
                    <span>{suggestion.emoji}</span>
                    {suggestion.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <AddDaySheet
          isOpen={showAddDay}
          onClose={() => setShowAddDay(false)}
          onSubmit={handleAddDay}
          nextDayNumber={1}
        />
      </div>
    );
  }

  // ─── Normal Timeline View ─────────────────────────────────────────────────

  return (
    <div className="pb-6">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#F7F7F5]/80 backdrop-blur-xl">
        <div className="px-6 pt-14 pb-3">
          <div className="flex items-center justify-between mb-4">
            <Link
              to={`/trip/${tripId}`}
              className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors active:scale-95"
            >
              <ArrowLeft className="size-5 text-[#007AFF]" />
            </Link>
            <button className="p-2 -mr-2 hover:bg-black/5 rounded-full transition-colors">
              <Calendar className="size-5 text-[#007AFF]" />
            </button>
          </div>
          
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-[28px] font-semibold text-[#1C1C1E] tracking-tight leading-tight">
              Timeline
            </h1>
            <p className="text-[13px] text-[#8E8E93] font-medium mt-0.5">
              {trip.dates || "Dates TBD"} · {trip.destination || "Destination TBD"}
            </p>
          </motion.div>
        </div>

        {/* Day Selector */}
        <div className="px-4 pb-3">
          <HorizontalDragScroll className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {days.map((day) => (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDayNum(day.dayNumber)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 ${
                  selectedDayNum === day.dayNumber
                    ? "bg-[#007AFF] text-white shadow-[0_4px_12px_rgba(0,122,255,0.25)]"
                    : "bg-white text-[#8E8E93] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:text-[#6E6E73]"
                }`}
              >
                <span className="block">Day {day.dayNumber}</span>
                <span className={`text-[10px] font-medium ${
                  selectedDayNum === day.dayNumber ? "text-white/60" : "text-[#C7C7CC]"
                }`}>
                  {day.label || day.date}
                </span>
              </button>
            ))}
            {/* Add Day button in day selector */}
            <button
              onClick={() => setShowAddDay(true)}
              className="flex-shrink-0 px-3 py-2 rounded-full text-[13px] font-semibold bg-[#EAF2FF] text-[#007AFF] transition-all active:scale-95"
            >
              <Plus className="size-4 mx-auto" />
            </button>
          </HorizontalDragScroll>
        </div>
        
        <div className="h-px bg-black/[0.04]" />
      </header>

      {/* Main Content */}
      <main className="px-4 pt-4 space-y-5">
        {activeDay ? (
          <div className="space-y-4">
              {/* Suggestions */}
              {activeDay.suggestions && activeDay.suggestions.length > 0 && (
                <SuggestionsPanel
                  suggestions={activeDay.suggestions}
                  // Both the card body and the `+` button route to the same
                  // autofill tray so suggestions behave consistently.
                  onPropose={(suggestion) => {
                    setSelectedSuggestion(suggestion);
                    setSuggestionTrayOpen(true);
                  }}
                  onSuggestionTap={(suggestion) => {
                    setSelectedSuggestion(suggestion);
                    setSuggestionTrayOpen(true);
                  }}
                />
              )}

              {/* Events */}
              {activeDay.events.length > 0 ? (
                <TimelineSpine
                  events={activeDay.events}
                  onEventClick={handleEventClick}
                  onVote={handleVote}
                  onPropose={handleProposeClick}
                  onGapPropose={handleProposeClick}
                  isDuring={trip.phase === 'during'}
                  dayStartTime={activeDay.dayStartTime}
                  dayEndTime={activeDay.dayEndTime}
                />
              ) : (
                /* Empty day state */
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="size-16 bg-[#F1F2F5] rounded-[20px] flex items-center justify-center mx-auto mb-4">
                    <Calendar className="size-7 text-[#C7C7CC]" />
                  </div>
                  <p className="text-[15px] font-medium text-[#1C1C1E] mb-1">No events yet</p>
                  <p className="text-[13px] text-[#8E8E93] mb-5">
                    Add activities for Day {activeDay.dayNumber}
                  </p>
                  <button
                    onClick={handleProposeClick}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#007AFF] text-white rounded-full text-[14px] font-semibold active:scale-95 transition-transform"
                  >
                    <Plus className="size-4" />
                    Add Event
                  </button>

                  {/* Quick event suggestions */}
                  <div className="mt-6">
                    <p className="text-[11px] font-semibold text-[#C7C7CC] uppercase tracking-wider mb-2">Suggestions</p>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {[
                        { emoji: "🏠", label: activeDay.dayNumber === 1 ? "Check-in" : "Check-out", time: activeDay.dayNumber === 1 ? "3:00 PM" : "11:00 AM" },
                        { emoji: "🚗", label: "Travel time", time: "TBD" },
                        { emoji: "🍽", label: "Group dinner", time: "7:00 PM" },
                        { emoji: "⏳", label: "Free time", time: "2:00 PM" },
                      ].map((s) => (
                        <button
                          key={s.label}
                          onClick={() => {
                            addEventToDay(activeDay.dayNumber, {
                              id: `quick-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                              title: s.label,
                              time: s.time,
                              emoji: s.emoji,
                              state: s.label === "Free time" ? "freetime" : "proposed",
                              votesFor: s.label === "Free time" ? undefined : 1,
                              votesAgainst: s.label === "Free time" ? undefined : 0,
                              attendees: [{ name: "You", status: "going" }],
                            } as Event);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-full text-[11px] font-medium text-[#1C1C1E] shadow-[0_1px_2px_rgba(0,0,0,0.04)] active:scale-95 transition-transform"
                        >
                          <span>{s.emoji}</span>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
          </div>
        ) : null}
      </main>

      {/* Floating Add Button */}
      {activeDay && activeDay.events.length > 0 && (
        <div className="fixed bottom-24 right-5 z-40">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleProposeClick}
            className="bg-[#007AFF] text-white p-3.5 rounded-full shadow-[0_6px_20px_rgba(0,122,255,0.35)]"
          >
            <Plus className="size-6 stroke-[2.5]" />
          </motion.button>
        </div>
      )}

      {/* Event Detail Overlay */}
      <EventDetail
        tripId={tripId ?? ""}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onAttendanceChange={handleAttendanceChange}
        onVote={(type) => selectedEvent && handleVote(selectedEvent, type)}
        onEdit={(patch) => {
          if (!selectedEvent || !activeDay) return;
          updateEvent(activeDay.dayNumber, selectedEvent.id, patch);
          // Mirror the edit locally so the sheet reflects the new values
          // before the query refetch resolves.
          setSelectedEvent({ ...selectedEvent, ...patch });
        }}
        onDelete={() => {
          if (!selectedEvent || !activeDay) return;
          removeEventFromDay(activeDay.dayNumber, selectedEvent.id);
          setSelectedEvent(null);
        }}
      />

      {/* Proposal Sheet */}
      <ProposalSheet
        isOpen={isProposalSheetOpen}
        onClose={() => setIsProposalSheetOpen(false)}
        dayLabel={proposalContext?.dayLabel || ""}
        onSubmit={handleProposalSubmit}
      />

      {/* Suggestion Tray */}
      <SuggestionTray
        isOpen={suggestionTrayOpen}
        onClose={() => { setSuggestionTrayOpen(false); setSelectedSuggestion(null); }}
        suggestion={selectedSuggestion}
        dayLabel={activeDay ? `Day ${activeDay.dayNumber} · ${activeDay.date}` : ""}
        onSubmit={(data) => {
          if (!activeDay) return;
          const newEvent: Event = {
            id: `sug-${Date.now()}`,
            title: data.title,
            time: data.time ? formatTime24to12(data.time) : "TBD",
            endTime: data.endTime ? formatTime24to12(data.endTime) : undefined,
            location: data.location || undefined,
            emoji: data.emoji,
            state: "proposed",
            votesFor: 1,
            votesAgainst: 0,
            votingCloses: "24h",
            attendees: [{ name: "You", status: "going" }],
          };
          addEventToDay(activeDay.dayNumber, newEvent);
        }}
      />

      {/* Add Day Sheet */}
      <AddDaySheet
        isOpen={showAddDay}
        onClose={() => setShowAddDay(false)}
        onSubmit={handleAddDay}
        nextDayNumber={days.length > 0 ? Math.max(...days.map(d => d.dayNumber)) + 1 : 1}
      />
    </div>
  );
}

// ─── Helper Function ────────────────────────────────────────────────────────

function formatTime24to12(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}