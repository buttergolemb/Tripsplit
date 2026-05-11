import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Plus, Sunrise, Moon } from 'lucide-react';
import type { Event } from './types';
import { EventCard } from './EventCard';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr || timeStr === 'TBD') return null;
  const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return null;
  const [, hStr, mStr, period] = match;
  let hours = parseInt(hStr, 10);
  const minutes = parseInt(mStr, 10);
  if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} min free`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h free` : `${h}h ${m}m free`;
}

// Gaps ≥ 45 min are worth filling; shorter ones are just buffer / transit time
const GAP_THRESHOLD_MINUTES = 45;

// ─── Types ────────────────────────────────────────────────────────────────────

type SpineRow =
  | { kind: 'bookend-start'; time: string }
  | { kind: 'event'; event: Event; minutes: number | null }
  | { kind: 'now' }
  | { kind: 'gap'; duration: number; windowStart: string; windowEnd: string }
  | { kind: 'bookend-end'; time: string };

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  events: Event[];
  onEventClick: (e: Event) => void;
  onVote?: (e: Event, type: 'for' | 'against') => void;
  onPropose?: (e: Event) => void;
  /** Called when the user taps "Propose activity" inside a gap row */
  onGapPropose?: () => void;
  isDuring?: boolean;
  dayStartTime?: string;
  dayEndTime?: string;
}

export function TimelineSpine({ events, onEventClick, onVote, onPropose, onGapPropose, isDuring, dayStartTime, dayEndTime }: Props) {
  // Live "now" refreshed every minute
  const [nowMinutes, setNowMinutes] = React.useState<number | null>(() => {
    if (!isDuring) return null;
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  React.useEffect(() => {
    if (!isDuring) return;
    const tick = () => {
      const d = new Date();
      setNowMinutes(d.getHours() * 60 + d.getMinutes());
    };
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [isDuring]);

  // Sort events by time (TBD go last)
  const sorted = React.useMemo(
    () =>
      [...events].sort((a, b) => {
        const ta = parseTimeToMinutes(a.time) ?? 9_999;
        const tb = parseTimeToMinutes(b.time) ?? 9_999;
        return ta - tb;
      }),
    [events]
  );

  // Detect overlapping non-freetime events
  const overlappingIds = React.useMemo(() => {
    const ids = new Set<string>();
    const timed = sorted.filter(
      (e) => e.state !== 'freetime' && parseTimeToMinutes(e.time) !== null
    );
    for (let i = 0; i < timed.length - 1; i++) {
      const ta = parseTimeToMinutes(timed[i].time)!;
      const tb = parseTimeToMinutes(timed[i + 1].time)!;
      if (ta >= tb) {
        ids.add(timed[i].id);
        ids.add(timed[i + 1].id);
      }
    }
    return ids;
  }, [sorted]);

  // Only non-freetime events drive the spine; freetime blocks are absorbed into gaps
  const timedRegularEvents = sorted.filter(
    (e) => e.state !== 'freetime' && parseTimeToMinutes(e.time) !== null
  );
  const tbdEvents = sorted.filter(
    (e) => parseTimeToMinutes(e.time) === null && e.state !== 'freetime'
  );

  const dayStartMin = dayStartTime ? parseTimeToMinutes(dayStartTime) : null;
  const dayEndMin = dayEndTime ? parseTimeToMinutes(dayEndTime) : null;

  // Build rows — freetime events in between are implicitly merged into the gap window
  const rows = React.useMemo<SpineRow[]>(() => {
    const result: SpineRow[] = [];
    let nowInserted = false;

    // ── Bookend: Day Start ──────────────────────────────────────────────────
    if (dayStartTime && dayStartMin !== null) {
      result.push({ kind: 'bookend-start', time: dayStartTime });

      // Pre-first-event gap
      if (timedRegularEvents.length > 0) {
        const firstMin = parseTimeToMinutes(timedRegularEvents[0].time)!;
        const preGap = firstMin - dayStartMin;
        if (preGap >= GAP_THRESHOLD_MINUTES) {
          // Insert now marker if it falls in this pre-gap
          if (!nowInserted && nowMinutes !== null && nowMinutes >= dayStartMin && nowMinutes < firstMin) {
            result.push({ kind: 'now' });
            nowInserted = true;
          }
          result.push({
            kind: 'gap',
            duration: preGap,
            windowStart: dayStartTime,
            windowEnd: timedRegularEvents[0].time,
          });
        }
      }
    }

    // ── Regular event rows ──────────────────────────────────────────────────
    for (let i = 0; i < timedRegularEvents.length; i++) {
      const event = timedRegularEvents[i];
      const eventMin = parseTimeToMinutes(event.time)!;
      const nextEvent = timedRegularEvents[i + 1];
      const nextMin = nextEvent ? parseTimeToMinutes(nextEvent.time) : null;

      if (!nowInserted && nowMinutes !== null && nowMinutes < eventMin) {
        result.push({ kind: 'now' });
        nowInserted = true;
      }

      result.push({ kind: 'event', event, minutes: eventMin });

      if (nextMin !== null) {
        if (!nowInserted && nowMinutes !== null && nowMinutes >= eventMin && nowMinutes < nextMin) {
          result.push({ kind: 'now' });
          nowInserted = true;
        }

        const eventEndMin = event.endTime
          ? (parseTimeToMinutes(event.endTime) ?? eventMin)
          : eventMin;
        const gap = nextMin - eventEndMin;

        if (gap >= GAP_THRESHOLD_MINUTES) {
          result.push({
            kind: 'gap',
            duration: gap,
            windowStart: event.endTime ?? event.time,
            windowEnd: nextEvent!.time,
          });
        }
      }
    }

    // ── Post-last-event gap ─────────────────────────────────────────────────
    if (dayEndTime && dayEndMin !== null && timedRegularEvents.length > 0) {
      const lastEvent = timedRegularEvents[timedRegularEvents.length - 1];
      const lastEndMin = lastEvent.endTime
        ? (parseTimeToMinutes(lastEvent.endTime) ?? parseTimeToMinutes(lastEvent.time)!)
        : parseTimeToMinutes(lastEvent.time)!;
      const postGap = dayEndMin - lastEndMin;

      if (!nowInserted && nowMinutes !== null && nowMinutes >= lastEndMin) {
        result.push({ kind: 'now' });
        nowInserted = true;
      }

      if (postGap >= GAP_THRESHOLD_MINUTES) {
        result.push({
          kind: 'gap',
          duration: postGap,
          windowStart: lastEvent.endTime ?? lastEvent.time,
          windowEnd: dayEndTime,
        });
      }
    }

    // Fallback: now after everything
    if (!nowInserted && nowMinutes !== null && timedRegularEvents.length > 0) {
      const lastMin = parseTimeToMinutes(timedRegularEvents[timedRegularEvents.length - 1].time);
      if (lastMin !== null && nowMinutes >= lastMin) result.push({ kind: 'now' });
    }

    // ── Bookend: Day End ────────────────────────────────────────────────────
    if (dayEndTime && dayEndMin !== null) {
      result.push({ kind: 'bookend-end', time: dayEndTime });
    }

    return result;
  }, [timedRegularEvents, nowMinutes, dayStartTime, dayStartMin, dayEndTime, dayEndMin]);

  return (
    <div>
      {rows.map((row, idx) => {
        // ── Bookend: Day Start ──────────────────────────────────────────────
        if (row.kind === 'bookend-start') {
          const hasNext = idx < rows.length - 1;
          return (
            <motion.div
              key="bookend-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-stretch gap-3"
            >
              {/* Spine: hollow ring + connector */}
              <div className="flex flex-col items-center w-[14px] flex-shrink-0">
                <div className="size-3 rounded-full border-[1.5px] border-[#D1D1D6] bg-[#F7F7F5] mt-[1px] flex-shrink-0" />
                {hasNext && (
                  <div className="w-px flex-1 mt-1 bg-[#E5E5EA]/50 min-h-[8px]" />
                )}
              </div>
              {/* Label */}
              <div className="flex-1 min-w-0 pb-2 flex items-center gap-2">
                <Sunrise className="size-3 text-[#C7C7CC]" />
                <p className="text-[11px] font-semibold text-[#C7C7CC] tracking-tight">
                  Day starts · {row.time}
                </p>
              </div>
            </motion.div>
          );
        }

        // ── Bookend: Day End ────────────────────────────────────────────────
        if (row.kind === 'bookend-end') {
          return (
            <motion.div
              key="bookend-end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-stretch gap-3"
            >
              {/* Spine: hollow ring, no connector below */}
              <div className="flex flex-col items-center w-[14px] flex-shrink-0">
                <div className="size-3 rounded-full border-[1.5px] border-[#D1D1D6] bg-[#F7F7F5] mt-[1px] flex-shrink-0" />
              </div>
              {/* Label */}
              <div className="flex-1 min-w-0 pb-1 flex items-center gap-2">
                <Moon className="size-3 text-[#C7C7CC]" />
                <p className="text-[11px] font-semibold text-[#C7C7CC] tracking-tight">
                  Day ends · {row.time}
                </p>
              </div>
            </motion.div>
          );
        }

        // ── Now marker ────────────────────────────────────────────────────────
        if (row.kind === 'now') {
          return (
            <motion.div
              key={`now-${idx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 my-1"
            >
              {/* Dot on spine */}
              <div className="w-[14px] flex-shrink-0 flex justify-center">
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.65, 1] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                  className="size-2.5 rounded-full bg-[#FF3B30] ring-[3px] ring-[#FF3B30]/25"
                />
              </div>
              {/* Label + line */}
              <div className="flex items-center gap-2 flex-1">
                <span className="text-[10px] font-semibold text-[#FF3B30] whitespace-nowrap">
                  Now
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-[#FF3B30]/35 to-transparent" />
              </div>
            </motion.div>
          );
        }

        // ── Gap marker ────────────────────────────────────────────────────────
        if (row.kind === 'gap') {
          return (
            <div key={`gap-${idx}`} className="flex items-stretch gap-3">
              {/* Dashed connector */}
              <div className="w-[14px] flex-shrink-0 flex justify-center">
                <div className="w-px flex-1 border-l border-dashed border-[#D1D1D6]/70" />
              </div>

              {/* Full-width dashed propose card */}
              <div className="flex-1 min-w-0 self-start py-2 pb-4">
                {onGapPropose ? (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onGapPropose}
                    className="w-full rounded-[18px] border-2 border-dashed border-[#D1D1D6]/60 bg-[#F7F7F5] hover:border-[#007AFF]/30 hover:bg-[#EAF2FF]/30 transition-all duration-200 py-5 px-5 flex flex-col items-center gap-1.5 group"
                  >
                    <div className="size-9 rounded-full bg-[#007AFF]/8 flex items-center justify-center group-hover:bg-[#007AFF]/15 transition-colors">
                      <Plus className="size-4 text-[#007AFF]" />
                    </div>
                    <span className="text-[14px] font-semibold text-[#007AFF]">Propose Activity</span>
                    <span className="text-[12px] text-[#C7C7CC] font-medium">
                      {row.windowStart} – {row.windowEnd} · {formatDuration(row.duration)}
                    </span>
                  </motion.button>
                ) : (
                  <p className="text-[11px] font-medium text-[#C7C7CC] text-center py-3">
                    {row.windowStart} – {row.windowEnd}
                  </p>
                )}
              </div>
            </div>
          );
        }

        // ── Event row ─────────────────────────────────────────────────────────
        const { event, minutes } = row;
        const nextRow = idx < rows.length - 1 ? rows[idx + 1] : null;
        const hasConnector = nextRow !== null;
        const isNextGap = nextRow?.kind === 'gap';
        const isNextBookendEnd = nextRow?.kind === 'bookend-end';

        const dotColor =
          event.state === 'confirmed'
            ? 'bg-[#34C759]'
            : event.state === 'voting'
            ? 'bg-[#8E8EFA]'
            : event.state === 'freetime'
            ? 'bg-[#D1D1D6]'
            : event.state === 'cancelled'
            ? 'bg-[#C7C7CC]'
            : 'bg-[#FF9F0A]';

        // Time label: show time range for free time, plain time otherwise
        const timeLabel =
          event.state === 'freetime' && event.endTime
            ? `${event.time} – ${event.endTime}`
            : event.state !== 'freetime' && minutes !== null
            ? (event.endTime ? `${event.time} – ${event.endTime}` : event.time)
            : null;

        const hasOverlap = overlappingIds.has(event.id);

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.05, 0.25) }}
            className="flex items-stretch gap-3"
          >
            {/* ── Thin spine: dot + connector ── */}
            <div className="flex flex-col items-center w-[14px] flex-shrink-0">
              <div className={`size-2.5 rounded-full ring-2 ring-[#F7F7F5] mt-[3px] flex-shrink-0 ${dotColor}`} />
              {hasConnector && (
                <div
                  className={`w-px flex-1 mt-1.5 min-h-[20px] ${
                    isNextGap || isNextBookendEnd ? 'bg-[#E5E5EA]/40' : 'bg-[#E5E5EA]'
                  }`}
                />
              )}
            </div>

            {/* ── Content: time label above, card below ── */}
            <div className="flex-1 min-w-0 self-start pb-4">
              {/* Time label sits above the card */}
              {timeLabel && (
                <p className="text-[11px] font-semibold text-[#8E8E93] mb-1.5 leading-none tracking-tight">
                  {timeLabel}
                </p>
              )}

              {/* Overlap warning */}
              <AnimatePresence>
                {hasOverlap && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-1.5 mb-1.5 overflow-hidden"
                  >
                    <AlertTriangle className="size-3 text-[#FF9F0A] flex-shrink-0" />
                    <span className="text-[9px] font-semibold text-[#FF9F0A] uppercase tracking-wider">
                      Scheduling conflict
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <EventCard
                event={event}
                anchorId={`timeline-event-${event.id}`}
                onClick={onEventClick}
                onVote={onVote}
                onPropose={onPropose}
                hideTime
              />
            </div>
          </motion.div>
        );
      })}

      {/* ── TBD section ─────────────────────────────────────────────────────── */}
      {tbdEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 pt-3 border-t border-dashed border-[#E5E5EA]"
        >
          <p className="text-[10px] font-semibold text-[#C7C7CC] uppercase tracking-wider mb-3">
            Time TBD
          </p>
          <div className="space-y-3">
            {tbdEvents.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                anchorId={`timeline-event-${e.id}`}
                onClick={onEventClick}
                onVote={onVote}
                onPropose={onPropose}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}