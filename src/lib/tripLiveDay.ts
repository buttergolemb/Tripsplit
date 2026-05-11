/** Parse timeline day labels like `May 10` using trip demo year when missing. */
export function parseTripDayDateLabel(label: string | undefined): Date | null {
  if (!label?.trim()) return null;
  const t = label.trim();
  const withYear = /(?:19|20)\d{2}/.test(t) ? t : `${t}, 2026`;
  const ms = Date.parse(withYear);
  return Number.isNaN(ms) ? null : new Date(ms);
}

function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** True when this timeline row's `date` matches today's calendar day (local). */
export function timelineDayMatchesToday(dayDateLabel: string | undefined): boolean {
  const dt = parseTripDayDateLabel(dayDateLabel);
  if (!dt) return false;
  return sameCalendarDay(dt, new Date());
}

/**
 * Which day tab to open by default: today's row if it matches a trip day,
 * otherwise day 2 while `during`, else first day.
 */
export function getPreferredTimelineDayNumber(
  days: { dayNumber: number; date: string }[],
  phase: string,
): number {
  if (days.length === 0) return 1;
  const hit = days.find((d) => timelineDayMatchesToday(d.date));
  if (hit) return hit.dayNumber;
  if (phase === "during" && days.length >= 2) return days[1].dayNumber;
  return days[0].dayNumber;
}
