import React from 'react';
import { motion } from 'motion/react';
import { MapPin, ThumbsUp, ThumbsDown, Check, Plus } from 'lucide-react';
import { Event } from './types';

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
  onVote?: (event: Event, type: 'for' | 'against') => void;
  onPropose?: (event: Event) => void;
  /** When true, suppresses the time label rendered below the emoji (used by TimelineSpine which renders its own time rail) */
  hideTime?: boolean;
  /** Scroll target for deep links (`#timeline-event-{id}`) */
  anchorId?: string;
}

const avatarColors = ["bg-[#007AFF]", "bg-[#34C759]", "bg-[#FF9F0A]", "bg-[#AF52DE]", "bg-[#FF6482]", "bg-[#5AC8FA]"];

export function EventCard({ event, onClick, onVote, onPropose, hideTime, anchorId }: EventCardProps) {
  const isFreeTime = event.state === 'freetime';

  if (isFreeTime) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onPropose?.(event)}
        className="w-full rounded-[18px] border-2 border-dashed border-[#D1D1D6]/60 bg-[#F7F7F5] hover:border-[#007AFF]/30 hover:bg-[#EAF2FF]/30 transition-all duration-200 py-6 px-5 flex flex-col items-center gap-2 group"
      >
        <div className="size-10 rounded-full bg-[#007AFF]/8 flex items-center justify-center group-hover:bg-[#007AFF]/15 transition-colors">
          <Plus className="size-5 text-[#007AFF]" />
        </div>
        <span className="text-[14px] font-semibold text-[#007AFF]">Propose Activity</span>
        {!hideTime && (
          <span className="text-[12px] text-[#8E8E93] font-medium">
            {event.time} – {event.endTime}
          </span>
        )}
      </motion.button>
    );
  }

  const stateStyles = {
    confirmed: "bg-white shadow-[var(--shadow-apple-1)] hover:shadow-[var(--shadow-apple-2)]",
    voting: "bg-white shadow-[var(--shadow-apple-1)] hover:shadow-[var(--shadow-apple-2)] ring-1 ring-[#8E8EFA]/15",
    proposed: "bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-dashed border-[#D1D1D6]",
    cancelled: "bg-[#F7F7F5] opacity-50",
    freetime: "",
  };

  const emojiContainerStyles = {
    confirmed: "bg-[#FFF3E0]",
    voting: "bg-[#F1EEFF]",
    proposed: "bg-[#FFF8F0]",
    cancelled: "bg-[#F1F2F5]",
    freetime: "bg-[#F1F2F5]",
  };

  return (
    <motion.div
      id={anchorId}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(event)}
      className={`scroll-mt-36 w-full rounded-[18px] transition-all duration-200 cursor-pointer ${stateStyles[event.state] || stateStyles.confirmed}`}
    >
      <div className="p-4 flex gap-3.5">
        {/* Time + Emoji */}
        <div className="flex flex-col items-center gap-1.5 min-w-[52px]">
          <div className={`size-11 rounded-[14px] flex items-center justify-center text-xl ${emojiContainerStyles[event.state]}`}>
            {event.emoji}
          </div>
          {!hideTime && (
            <span className="text-[12px] font-semibold text-[#8E8E93]">{event.time}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`text-[15px] font-semibold text-[#1C1C1E] leading-snug truncate ${
              event.state === 'cancelled' ? "line-through text-[#8E8E93]" : ""
            }`}>
              {event.title}
            </h3>
            
            {/* State chip */}
            {event.state === 'confirmed' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8F7EE] text-[#34C759] text-[10px] font-semibold uppercase tracking-wider flex-shrink-0">
                <Check className="size-3" /> Set
              </span>
            )}
            {event.state === 'voting' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#F1EEFF] text-[#8E8EFA] text-[10px] font-semibold uppercase tracking-wider flex-shrink-0">
                Voting
              </span>
            )}
            {event.state === 'proposed' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FFF3E0] text-[#FF9F0A] text-[10px] font-semibold uppercase tracking-wider flex-shrink-0">
                Proposed
              </span>
            )}
          </div>

          {/* Location & expense */}
          {(event.location || event.expense) && (
            <div className="flex items-center gap-2 text-[12px] text-[#8E8E93] mb-2.5">
              {event.location && (
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="size-3 flex-shrink-0" />
                  {event.location}
                </span>
              )}
              {event.expense && (
                <span className="flex items-center gap-1 text-[#34C759] font-semibold bg-[#E8F7EE] px-1.5 py-0.5 rounded-md flex-shrink-0">
                  ${event.expense.amount}
                </span>
              )}
            </div>
          )}

          {/* Bottom row */}
          <div className="flex items-center justify-between">
            {/* Attendees */}
            <div className="flex -space-x-1.5">
              {event.attendees?.slice(0, 4).map((att, i) => (
                <div
                  key={i}
                  className={`size-6 rounded-full ring-2 ring-white flex items-center justify-center text-[9px] font-semibold text-white ${avatarColors[i % avatarColors.length]}`}
                  title={`${att.name} (${att.status})`}
                >
                  {att.name[0]}
                </div>
              ))}
              {event.attendees && event.attendees.length > 4 && (
                <div className="size-6 rounded-full ring-2 ring-white bg-[#F1F2F5] flex items-center justify-center text-[9px] font-medium text-[#8E8E93]">
                  +{event.attendees.length - 4}
                </div>
              )}
            </div>

            {/* Voting controls */}
            {(event.state === 'voting' || event.state === 'proposed') && (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => onVote?.(event, 'for')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-[#E8F7EE] text-[#8E8E93] hover:text-[#34C759] transition-colors"
                >
                  <ThumbsUp className="size-3.5" />
                  <motion.span 
                    key={event.votesFor}
                    initial={{ scale: 1.3, color: "#34C759" }}
                    animate={{ scale: 1, color: "#8E8E93" }}
                    className="text-[12px] font-semibold"
                  >
                    {event.votesFor || 0}
                  </motion.span>
                </button>
                <button 
                  onClick={() => onVote?.(event, 'against')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-[#FFF3E0] text-[#8E8E93] hover:text-[#FF3B30] transition-colors"
                >
                  <ThumbsDown className="size-3.5" />
                  <motion.span 
                    key={event.votesAgainst}
                    initial={{ scale: 1.3, color: "#FF3B30" }}
                    animate={{ scale: 1, color: "#8E8E93" }}
                    className="text-[12px] font-semibold"
                  >
                    {event.votesAgainst || 0}
                  </motion.span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}