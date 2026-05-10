export type EventState = "proposed" | "voting" | "confirmed" | "cancelled" | "freetime";
export type AttendanceStatus = "going" | "maybe" | "skipping";

export type Event = {
  id: string;
  title: string;
  time: string;
  endTime?: string; // For free time blocks
  location?: string;
  emoji: string;
  state: EventState;
  votesFor?: number;
  votesAgainst?: number;
  votingCloses?: string;
  attendees?: { name: string; status: AttendanceStatus; avatar?: string }[];
  expense?: { amount: number; paidBy: string };
  description?: string;
  isFreeTime?: boolean; // Or use state="freetime"
};

export type DaySchedule = {
  date: string;
  dayNumber: number;
  label: string;
  dayStartTime?: string;   // e.g. "10:00 AM" — when the day's schedule begins
  dayEndTime?: string;      // e.g. "11:00 PM" — when the day wraps up
  events: Event[];
  suggestions?: Suggestion[];
};

export type Suggestion = {
  id: string;
  title: string;
  category: string;
  reason: string;
  emoji: string;
  distance?: string;
  /** Known place/venue, used to pre-fill the Location field on tap. */
  location?: string;
  /** Optional suggested start time, e.g. "7:00 PM". */
  suggestedTime?: string;
};