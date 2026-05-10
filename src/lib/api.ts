// Thin fetch wrapper around our Express API.
// All request bodies and responses are JSON. Errors throw so TanStack Query's
// `isError` reflects network/validation failures correctly.
//
// Types are imported from the server module so there's one source of truth.
// Vite resolves relative paths outside `src/` just fine; we never import
// server runtime modules here, only type-only aliases.
import type {
  BalancesDTO, ExpenseDTO, MemberDTO, TripDTO, TripSummaryDTO,
  DayScheduleDTO, TimelineEventDTO, AttendanceStatus, EventState,
  RSVPStatus, TripPhase, BudgetCategoryDTO, TripRuleDTO, DepositPolicyDTO,
} from "../../server/types";

export type {
  BalancesDTO, ExpenseDTO, MemberDTO, TripDTO, TripSummaryDTO,
  DayScheduleDTO, TimelineEventDTO, AttendanceStatus, EventState,
  RSVPStatus, TripPhase, BudgetCategoryDTO, TripRuleDTO, DepositPolicyDTO,
};

const API_BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ─── Trips ──────────────────────────────────────────────────────────────────

export const tripsApi = {
  list: () => request<TripSummaryDTO[]>("/trips"),
  get: (id: string) => request<TripDTO>(`/trips/${id}`),
  create: (input: {
    id?: string; name: string; emoji?: string | null;
    destination?: string | null; dates?: string | null; phase?: TripPhase;
  }) => request<TripDTO>("/trips", { method: "POST", body: JSON.stringify(input) }),
  update: (id: string, patch: Partial<{
    name: string; emoji: string | null; destination: string | null;
    dates: string | null; phase: TripPhase;
  }>) => request<TripDTO>(`/trips/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
};

// ─── Members ────────────────────────────────────────────────────────────────

export const membersApi = {
  add: (tripId: string, input: {
    id?: string; name: string; avatar?: string | null;
    role?: string | null; rsvp?: RSVPStatus; depositPaid?: boolean;
  }) => request<MemberDTO>(`/trips/${tripId}/members`, {
    method: "POST", body: JSON.stringify(input),
  }),
  update: (tripId: string, memberId: string, patch: Partial<{
    name: string; avatar: string | null; role: string | null;
    rsvp: RSVPStatus; depositPaid: boolean;
  }>) => request<MemberDTO>(`/trips/${tripId}/members/${memberId}`, {
    method: "PATCH", body: JSON.stringify(patch),
  }),
  remove: (tripId: string, memberId: string) =>
    request<void>(`/trips/${tripId}/members/${memberId}`, { method: "DELETE" }),
};

// ─── Expenses ───────────────────────────────────────────────────────────────

export interface CreateExpenseInput {
  description: string;
  category?: string | null;
  emoji?: string | null;
  amount: number;
  paidBy: string;           // member id
  date?: string | null;
  location?: string | null;
  confirmed?: boolean;
  splits: { memberId: string; share: number }[];
}

export const expensesApi = {
  list: (tripId: string) => request<ExpenseDTO[]>(`/trips/${tripId}/expenses`),
  create: (tripId: string, input: CreateExpenseInput) =>
    request<ExpenseDTO>(`/trips/${tripId}/expenses`, {
      method: "POST", body: JSON.stringify(input),
    }),
  update: (tripId: string, expenseId: string, patch: Partial<{
    description: string; category: string | null; emoji: string | null;
    amount: number; paidBy: string; date: string | null;
    location: string | null; confirmed: boolean;
  }>) => request<ExpenseDTO>(`/trips/${tripId}/expenses/${expenseId}`, {
    method: "PATCH", body: JSON.stringify(patch),
  }),
  remove: (tripId: string, expenseId: string) =>
    request<void>(`/trips/${tripId}/expenses/${expenseId}`, { method: "DELETE" }),
  setPaid: (tripId: string, expenseId: string, memberId: string, paid: boolean) =>
    request<{ ok: true }>(
      `/trips/${tripId}/expenses/${expenseId}/splits/${memberId}`,
      { method: "PATCH", body: JSON.stringify({ paid }) }
    ),
};

// ─── Balances ───────────────────────────────────────────────────────────────

export const balancesApi = {
  get: (tripId: string) => request<BalancesDTO>(`/trips/${tripId}/balances`),
};

// ─── Timeline ───────────────────────────────────────────────────────────────

export const timelineApi = {
  list: (tripId: string) => request<DayScheduleDTO[]>(`/trips/${tripId}/timeline`),
  addDay: (tripId: string, input: {
    id?: string; dayNumber: number; date?: string | null; label?: string | null;
    dayStartTime?: string | null; dayEndTime?: string | null;
  }) => request<DayScheduleDTO>(`/trips/${tripId}/days`, {
    method: "POST", body: JSON.stringify(input),
  }),
  addEvent: (tripId: string, input: {
    id?: string; dayId: string; title: string; time?: string | null;
    endTime?: string | null; location?: string | null; emoji?: string | null;
    state?: EventState; votingCloses?: string | null;
    attendees?: { memberId: string; status?: AttendanceStatus }[];
  }) => request<TimelineEventDTO>(`/trips/${tripId}/events`, {
    method: "POST", body: JSON.stringify(input),
  }),
  updateEvent: (tripId: string, eventId: string, patch: Partial<{
    title: string; time: string | null; endTime: string | null;
    location: string | null; emoji: string | null; state: EventState;
    votingCloses: string | null;
  }>) => request<TimelineEventDTO>(`/trips/${tripId}/events/${eventId}`, {
    method: "PATCH", body: JSON.stringify(patch),
  }),
  removeEvent: (tripId: string, eventId: string) =>
    request<void>(`/trips/${tripId}/events/${eventId}`, { method: "DELETE" }),
  vote: (tripId: string, eventId: string, type: "for" | "against") =>
    request<TimelineEventDTO>(`/trips/${tripId}/events/${eventId}/vote`, {
      method: "POST", body: JSON.stringify({ type }),
    }),
  setAttendance: (tripId: string, eventId: string, memberId: string, status: AttendanceStatus) =>
    request<{ ok: true }>(
      `/trips/${tripId}/events/${eventId}/attendees/${memberId}`,
      { method: "PUT", body: JSON.stringify({ status }) }
    ),
};

// ─── Budget categories ──────────────────────────────────────────────────────

export const budgetApi = {
  list: (tripId: string) => request<BudgetCategoryDTO[]>(`/trips/${tripId}/budget`),
  add: (tripId: string, input: {
    id?: string; name: string; estimate?: number; actual?: number;
    type?: "shared" | "optional"; icon?: string;
  }) => request<BudgetCategoryDTO>(`/trips/${tripId}/budget`, {
    method: "POST", body: JSON.stringify(input),
  }),
  update: (tripId: string, categoryId: string, patch: Partial<{
    name: string; estimate: number; actual: number;
    type: "shared" | "optional"; icon: string;
  }>) => request<BudgetCategoryDTO>(`/trips/${tripId}/budget/${categoryId}`, {
    method: "PATCH", body: JSON.stringify(patch),
  }),
  remove: (tripId: string, categoryId: string) =>
    request<void>(`/trips/${tripId}/budget/${categoryId}`, { method: "DELETE" }),
};

// ─── Rules ──────────────────────────────────────────────────────────────────

export const rulesApi = {
  list: (tripId: string) => request<TripRuleDTO[]>(`/trips/${tripId}/rules`),
  add: (tripId: string, input: {
    id?: string; title: string; items?: string[];
    proposedBy?: string | null; votes?: number; totalVoters?: number;
  }) => request<TripRuleDTO>(`/trips/${tripId}/rules`, {
    method: "POST", body: JSON.stringify(input),
  }),
  vote: (tripId: string, ruleId: string) =>
    request<TripRuleDTO>(`/trips/${tripId}/rules/${ruleId}/vote`, { method: "POST" }),
  remove: (tripId: string, ruleId: string) =>
    request<void>(`/trips/${tripId}/rules/${ruleId}`, { method: "DELETE" }),
};

// ─── Deposit policy ─────────────────────────────────────────────────────────

export const depositPolicyApi = {
  // Returns null when no policy is set (404 turns into null here).
  get: async (tripId: string): Promise<DepositPolicyDTO | null> => {
    const res = await fetch(`${API_BASE}/trips/${tripId}/deposit-policy`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}`);
    return (await res.json()) as DepositPolicyDTO;
  },
  upsert: (tripId: string, input: {
    amount: number; dueDate?: string | null; covers?: string[];
    dropoutRule?: string | null; setBy?: string | null;
  }) => request<DepositPolicyDTO>(`/trips/${tripId}/deposit-policy`, {
    method: "PUT", body: JSON.stringify(input),
  }),
  patch: (tripId: string, patch: Partial<{
    amount: number; dueDate: string | null; covers: string[];
    dropoutRule: string | null; setBy: string | null;
  }>) => request<DepositPolicyDTO>(`/trips/${tripId}/deposit-policy`, {
    method: "PATCH", body: JSON.stringify(patch),
  }),
  clear: (tripId: string) =>
    request<void>(`/trips/${tripId}/deposit-policy`, { method: "DELETE" }),
};
