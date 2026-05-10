// ─── Shared DTO types ────────────────────────────────────────────────────────
// Imported by both the server (to shape responses) and the frontend (to type
// API calls). Money is always *dollars* at the boundary; DB stores cents.

export type RSVPStatus = "committed" | "likely" | "interested" | "declined";
export type TripPhase = "planning" | "pre-trip" | "during" | "post-trip" | "complete";
export type EventState = "proposed" | "voting" | "confirmed" | "freetime";
export type AttendanceStatus = "going" | "maybe" | "declined";

export interface MemberDTO {
  id: string;
  tripId: string;
  name: string;
  avatar: string | null;
  role: string | null;
  rsvp: RSVPStatus;
  depositPaid: boolean;
}

export interface ExpenseSplitDTO {
  memberId: string;
  name: string;           // denormalized for easy UI rendering
  share: number;          // dollars
  paid: boolean;
}

export interface ExpenseDTO {
  id: string;
  tripId: string;
  description: string;
  category: string | null;
  emoji: string | null;
  amount: number;         // dollars
  paidBy: string;         // member id
  paidByName: string;     // convenience
  date: string | null;    // "Mar 15"
  location: string | null;
  confirmed: boolean;
  splits: ExpenseSplitDTO[];
}

export interface AttendeeDTO {
  memberId: string;
  name: string;
  status: AttendanceStatus;
}

export interface TimelineEventDTO {
  id: string;
  dayId: string;
  title: string;
  time: string | null;
  endTime: string | null;
  location: string | null;
  emoji: string | null;
  state: EventState;
  votesFor: number;
  votesAgainst: number;
  votingCloses: string | null;
  attendees: AttendeeDTO[];
}

export interface SuggestionDTO {
  id: string;
  dayId: string;
  title: string;
  category: string | null;
  reason: string | null;
  emoji: string | null;
  distance: string | null;
  location: string | null;
  suggestedTime: string | null;
}

export interface DayScheduleDTO {
  id: string;
  dayNumber: number;
  date: string | null;
  label: string | null;
  dayStartTime: string | null;
  dayEndTime: string | null;
  events: TimelineEventDTO[];
  suggestions: SuggestionDTO[];
}

export interface MemberPreviewDTO {
  id: string;
  name: string;
  initials: string;      // typically first letter; falls back to first two chars
}

export interface TripSummaryDTO {
  id: string;
  name: string;
  emoji: string | null;
  dates: string | null;
  destination: string | null;
  phase: TripPhase;
  memberCount: number;
  // First few members for the home-screen avatar stack. Capped server-side
  // so list payloads stay small; the rest are summarized as "+N".
  memberPreview: MemberPreviewDTO[];
  expenseCount: number;
  totalSpend: number;     // dollars
}

export interface BudgetCategoryDTO {
  id: string;
  tripId: string;
  name: string;
  estimate: number;      // dollars
  actual: number;        // dollars
  type: "shared" | "optional";
  icon: string;
}

export interface TripRuleDTO {
  id: string;
  tripId: string;
  title: string;
  items: string[];
  proposedBy: string | null;
  votes: number;
  totalVoters: number;
}

export interface DepositPolicyDTO {
  tripId: string;
  amount: number;           // dollars
  dueDate: string | null;
  covers: string[];
  dropoutRule: string | null;
  setBy: string | null;
}

export interface TripDTO extends TripSummaryDTO {
  members: MemberDTO[];
  expenses: ExpenseDTO[];
  timeline: DayScheduleDTO[];
  budgetCategories: BudgetCategoryDTO[];
  rules: TripRuleDTO[];
  depositPolicy: DepositPolicyDTO | null;
}

// Net balance for a single member on a trip.
// `net > 0` = trip owes them money; `net < 0` = they owe the trip.
export interface MemberBalanceDTO {
  memberId: string;
  name: string;
  paid: number;       // total dollars they paid out
  owed: number;       // total dollars they owe (sum of their splits)
  net: number;        // paid - owed
}

// Suggested single settlement transfer (greedy algorithm result).
export interface SettlementDTO {
  fromMemberId: string;
  fromName: string;
  toMemberId: string;
  toName: string;
  amount: number;     // dollars
}

export interface BalancesDTO {
  balances: MemberBalanceDTO[];
  settlements: SettlementDTO[];
}
