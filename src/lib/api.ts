// Frontend-only in-memory store. No backend required for demos.
//
// Mirrors the previous Express + SQLite API surface so the rest of the app
// (TripDataContext, TripList, etc.) keeps working unchanged. State lives in
// module-level maps and is reseeded at every page load — refreshing the
// browser resets back to the Austin + Beach demo data.

import type {
  AttendanceStatus, AttendeeDTO, BalancesDTO, BudgetCategoryDTO,
  DayScheduleDTO, DepositPolicyDTO, EventState, ExpenseDTO, ExpenseSplitDTO,
  MemberBalanceDTO, MemberDTO, RSVPStatus, SettlementDTO, SuggestionDTO,
  TimelineEventDTO, TripDTO, TripPhase, TripRuleDTO, TripSummaryDTO,
} from "../../server/types";

export type {
  BalancesDTO, ExpenseDTO, MemberDTO, TripDTO, TripSummaryDTO,
  DayScheduleDTO, TimelineEventDTO, AttendanceStatus, EventState,
  RSVPStatus, TripPhase, BudgetCategoryDTO, TripRuleDTO, DepositPolicyDTO,
};

// ─── Internal store shapes ──────────────────────────────────────────────────

interface TripCore {
  id: string;
  name: string;
  emoji: string | null;
  destination: string | null;
  dates: string | null;
  phase: TripPhase;
  createdAt: number;
}

interface ExpenseInternal {
  id: string;
  tripId: string;
  description: string;
  category: string | null;
  emoji: string | null;
  amount: number;
  paidBy: string;
  date: string | null;
  location: string | null;
  confirmed: boolean;
  splits: { memberId: string; share: number; paid: boolean }[];
  createdAt: number;
}

interface EventInternal {
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
  attendees: { memberId: string; status: AttendanceStatus }[];
  sortOrder: number;
}

interface DayInternal {
  id: string;
  tripId: string;
  dayNumber: number;
  date: string | null;
  label: string | null;
  dayStartTime: string | null;
  dayEndTime: string | null;
  events: EventInternal[];
  suggestions: SuggestionDTO[];
}

interface TripStore {
  trip: TripCore;
  members: MemberDTO[];
  expenses: ExpenseInternal[];
  days: DayInternal[];
  budget: BudgetCategoryDTO[];
  rules: TripRuleDTO[];
  depositPolicy: DepositPolicyDTO | null;
}

// ─── Module-level state ─────────────────────────────────────────────────────

const trips = new Map<string, TripStore>();

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function memberName(store: TripStore, id: string): string {
  return store.members.find((m) => m.id === id)?.name ?? "Unknown";
}

function requireTrip(tripId: string): TripStore {
  const t = trips.get(tripId);
  if (!t) throw new Error(`Trip ${tripId} not found`);
  return t;
}

// Round to 2 decimal places to keep money values stable.
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── Mappers ────────────────────────────────────────────────────────────────

function expenseToDTO(store: TripStore, e: ExpenseInternal): ExpenseDTO {
  return {
    id: e.id,
    tripId: e.tripId,
    description: e.description,
    category: e.category,
    emoji: e.emoji,
    amount: e.amount,
    paidBy: e.paidBy,
    paidByName: memberName(store, e.paidBy),
    date: e.date,
    location: e.location,
    confirmed: e.confirmed,
    splits: e.splits.map<ExpenseSplitDTO>((s) => ({
      memberId: s.memberId,
      name: memberName(store, s.memberId),
      share: s.share,
      paid: s.paid,
    })),
  };
}

function eventToDTO(store: TripStore, ev: EventInternal): TimelineEventDTO {
  return {
    id: ev.id,
    dayId: ev.dayId,
    title: ev.title,
    time: ev.time,
    endTime: ev.endTime,
    location: ev.location,
    emoji: ev.emoji,
    state: ev.state,
    votesFor: ev.votesFor,
    votesAgainst: ev.votesAgainst,
    votingCloses: ev.votingCloses,
    attendees: ev.attendees.map<AttendeeDTO>((a) => ({
      memberId: a.memberId,
      name: memberName(store, a.memberId),
      status: a.status,
    })),
  };
}

function dayToDTO(store: TripStore, d: DayInternal): DayScheduleDTO {
  return {
    id: d.id,
    dayNumber: d.dayNumber,
    date: d.date,
    label: d.label,
    dayStartTime: d.dayStartTime,
    dayEndTime: d.dayEndTime,
    events: [...d.events]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((e) => eventToDTO(store, e)),
    suggestions: d.suggestions,
  };
}

function tripSummary(store: TripStore): TripSummaryDTO {
  const previewLimit = 4;
  return {
    id: store.trip.id,
    name: store.trip.name,
    emoji: store.trip.emoji,
    dates: store.trip.dates,
    destination: store.trip.destination,
    phase: store.trip.phase,
    memberCount: store.members.length,
    memberPreview: store.members.slice(0, previewLimit).map((m) => ({
      id: m.id,
      name: m.name,
      initials: (m.name[0] ?? "?").toUpperCase(),
    })),
    expenseCount: store.expenses.length,
    totalSpend: r2(store.expenses.reduce((s, e) => s + e.amount, 0)),
  };
}

function tripFull(store: TripStore): TripDTO {
  const summary = tripSummary(store);
  return {
    ...summary,
    members: [...store.members],
    expenses: [...store.expenses]
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((e) => expenseToDTO(store, e)),
    timeline: [...store.days]
      .sort((a, b) => a.dayNumber - b.dayNumber)
      .map((d) => dayToDTO(store, d)),
    budgetCategories: [...store.budget],
    rules: [...store.rules],
    depositPolicy: store.depositPolicy,
  };
}

// ─── Balances (greedy settlement, same as the old SQL repo) ─────────────────

function computeBalances(store: TripStore): BalancesDTO {
  const paidMap = new Map<string, number>();
  const owedMap = new Map<string, number>();
  for (const e of store.expenses) {
    paidMap.set(e.paidBy, (paidMap.get(e.paidBy) ?? 0) + e.amount);
    for (const s of e.splits) {
      owedMap.set(s.memberId, (owedMap.get(s.memberId) ?? 0) + s.share);
    }
  }

  const balances: MemberBalanceDTO[] = store.members.map((m) => {
    const paid = r2(paidMap.get(m.id) ?? 0);
    const owed = r2(owedMap.get(m.id) ?? 0);
    return {
      memberId: m.id,
      name: m.name,
      paid,
      owed,
      net: r2(paid - owed),
    };
  });

  const creditors = balances.filter((b) => b.net > 0.009).map((b) => ({ ...b }));
  const debtors = balances.filter((b) => b.net < -0.009).map((b) => ({ ...b }));
  creditors.sort((a, b) => b.net - a.net);
  debtors.sort((a, b) => a.net - b.net);

  const settlements: SettlementDTO[] = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = r2(Math.min(-debtor.net, creditor.net));
    if (amount > 0.009) {
      settlements.push({
        fromMemberId: debtor.memberId,
        fromName: debtor.name,
        toMemberId: creditor.memberId,
        toName: creditor.name,
        amount,
      });
    }
    debtor.net = r2(debtor.net + amount);
    creditor.net = r2(creditor.net - amount);
    if (Math.abs(debtor.net) < 0.01) i++;
    if (Math.abs(creditor.net) < 0.01) j++;
  }

  return { balances, settlements };
}

// ─── Seed ───────────────────────────────────────────────────────────────────

function seed(): void {
  trips.clear();

  // Austin trip
  const austin: TripStore = {
    trip: {
      id: "austin",
      name: "Austin Trip",
      emoji: "📍",
      destination: "Austin, TX",
      dates: "Mar 15–18, 2026",
      phase: "during",
      createdAt: Date.now() - 1000,
    },
    members: [],
    expenses: [],
    days: [],
    budget: [],
    rules: [],
    depositPolicy: null,
  };
  trips.set("austin", austin);

  const memberSeed: { id: string; name: string; role: string | null; rsvp: RSVPStatus; depositPaid: boolean }[] = [
    { id: "1", name: "Sarah",  role: "Trip Organizer",  rsvp: "committed",  depositPaid: true  },
    { id: "2", name: "Mike",   role: "Lodging Lead",    rsvp: "committed",  depositPaid: true  },
    { id: "3", name: "Alex",   role: "Budget Lead",     rsvp: "committed",  depositPaid: true  },
    { id: "4", name: "Jordan", role: "Activities Lead", rsvp: "committed",  depositPaid: false },
    { id: "5", name: "Taylor", role: null,              rsvp: "likely",     depositPaid: false },
    { id: "6", name: "Casey",  role: null,              rsvp: "interested", depositPaid: false },
  ];
  for (const m of memberSeed) {
    austin.members.push({
      id: m.id,
      tripId: "austin",
      name: m.name,
      avatar: m.name[0],
      role: m.role,
      rsvp: m.rsvp,
      depositPaid: m.depositPaid,
    });
  }

  const memId = (name: string): string => {
    const m = austin.members.find((x) => x.name === name);
    if (!m) throw new Error(`seed: missing member ${name}`);
    return m.id;
  };

  const addDay = (id: string, dayNumber: number, date: string, label: string, dayStartTime: string, dayEndTime: string): DayInternal => {
    const d: DayInternal = {
      id, tripId: "austin", dayNumber, date, label,
      dayStartTime, dayEndTime, events: [], suggestions: [],
    };
    austin.days.push(d);
    return d;
  };

  const day1 = addDay("day-austin-1", 1, "Mar 15", "Arrival",   "2:00 PM", "11:00 PM");
  const day2 = addDay("day-austin-2", 2, "Mar 16", "Explore",   "9:00 AM", "11:00 PM");
  const day3 = addDay("day-austin-3", 3, "Mar 17", "Adventure", "8:00 AM", "11:30 PM");
  const day4 = addDay("day-austin-4", 4, "Mar 18", "Departure", "9:00 AM", "5:00 PM");

  let sortCounter = 0;
  const addEv = (
    day: DayInternal,
    id: string,
    title: string,
    time: string | null,
    endTime: string | null,
    location: string | null,
    emoji: string | null,
    state: EventState,
    attendeeNames: { name: string; status?: AttendanceStatus }[] = [],
    extras: { votingCloses?: string | null; votesFor?: number; votesAgainst?: number } = {},
  ): void => {
    day.events.push({
      id,
      dayId: day.id,
      title,
      time,
      endTime,
      location,
      emoji,
      state,
      votesFor: extras.votesFor ?? 0,
      votesAgainst: extras.votesAgainst ?? 0,
      votingCloses: extras.votingCloses ?? null,
      attendees: attendeeNames.map((a) => ({
        memberId: memId(a.name),
        status: a.status ?? "going",
      })),
      sortOrder: ++sortCounter,
    });
  };

  addEv(day1, "e1", "Land at AUS", "2:30 PM", "3:30 PM", null, "✈️", "confirmed",
    [{ name: "Sarah" }, { name: "Mike" }, { name: "Alex" }, { name: "Jordan" }]);
  addEv(day1, "e2", "Check into Airbnb", "4:00 PM", "5:00 PM", "Downtown Austin", "🏠", "confirmed",
    [{ name: "Sarah" }, { name: "Mike" }]);
  addEv(day1, "ft1", "Free Time", "5:00 PM", "7:00 PM", null, "⏳", "freetime");
  addEv(day1, "e3", "Dinner at Franklin BBQ", "7:00 PM", "9:00 PM", "Franklin Barbecue", "🍖", "voting",
    [{ name: "Sarah" }, { name: "Mike" }, { name: "Alex" }],
    { votingCloses: "in 4 hours", votesFor: 5, votesAgainst: 1 });

  addEv(day2, "e4", "Breakfast at Veracruz", "10:30 AM", "11:30 AM", "Veracruz All Natural", "🌮", "confirmed",
    [{ name: "Sarah" }, { name: "Mike" }]);
  addEv(day2, "e5", "Barton Springs Pool", "1:00 PM", "4:00 PM", "Zilker Park", "🏊", "proposed",
    [{ name: "Sarah" }, { name: "Mike" }],
    { votingCloses: "tonight", votesFor: 3, votesAgainst: 1 });

  addEv(day3, "e6", "Zilker Park Hike", "9:00 AM", "12:00 PM", "Zilker Park Trails", "🥾", "confirmed",
    [{ name: "Sarah" }, { name: "Alex" }, { name: "Jordan", status: "maybe" }]);
  addEv(day3, "ft2", "Free Time", "12:00 PM", "3:00 PM", null, "⏳", "freetime");
  addEv(day3, "e7", "6th Street Night Out", "8:00 PM", "11:30 PM", "6th Street District", "🎸", "voting",
    [{ name: "Sarah" }, { name: "Mike" }, { name: "Alex" }, { name: "Taylor", status: "maybe" }],
    { votingCloses: "in 12 hours", votesFor: 4, votesAgainst: 0 });

  addEv(day4, "e8", "Pack & Checkout", "10:00 AM", "11:00 AM", "Airbnb", "🧳", "confirmed",
    [{ name: "Sarah" }, { name: "Mike" }]);
  addEv(day4, "e9", "Fly Home", "3:00 PM", "5:00 PM", null, "✈️", "confirmed",
    [{ name: "Sarah" }, { name: "Mike" }, { name: "Alex" }]);

  // Suggestions
  day1.suggestions.push(
    { id: "s1", dayId: day1.id, title: "Paddleboarding on Lady Bird Lake", category: "Activity", reason: "5 min away", emoji: "🚣", distance: "0.2 mi", location: "Lady Bird Lake", suggestedTime: null },
    { id: "s2", dayId: day1.id, title: "South Congress Shopping",          category: "Shopping", reason: "Matches group vibe", emoji: "🛍️", distance: "1.5 mi", location: "South Congress Ave", suggestedTime: null },
  );
  day2.suggestions.push(
    { id: "s3", dayId: day2.id, title: "Live Music at Stubb's", category: "Music", reason: "Tonight's show", emoji: "🎸", distance: "0.8 mi", location: "Stubb's Bar-B-Q", suggestedTime: "20:00" },
  );

  // Expenses (dollars; payer's own split is auto-marked paid)
  const seedExpense = (
    id: string,
    description: string,
    category: string,
    emoji: string,
    amount: number,
    paidByName: string,
    date: string,
    confirmed: boolean,
    splitNames: string[],
    perShare: number,
  ): void => {
    const paidBy = memId(paidByName);
    austin.expenses.push({
      id,
      tripId: "austin",
      description,
      category,
      emoji,
      amount,
      paidBy,
      date,
      location: null,
      confirmed,
      splits: splitNames.map((n) => ({
        memberId: memId(n),
        share: perShare,
        paid: memId(n) === paidBy,
      })),
      createdAt: Date.now() - (1000 - austin.expenses.length),
    });
  };

  seedExpense("exp1", "Airbnb (3 nights)", "Lodging", "🏠", 540, "Sarah", "Mar 15", true,  ["Sarah","Mike","Alex","Jordan","Taylor","Casey"], 90);
  seedExpense("exp2", "Gas to Austin",     "Gas",     "⛽", 68,  "Mike",  "Mar 15", true,  ["Sarah","Mike","Alex","Jordan"], 17);
  seedExpense("exp3", "Franklin BBQ",      "Food",    "🍖", 180, "Sarah", "Mar 15", true,  ["Sarah","Mike","Alex","Jordan","Taylor","Casey"], 30);
  seedExpense("exp4", "Torchy's Tacos",    "Food",    "🌮", 92,  "Alex",  "Mar 16", true,  ["Sarah","Mike","Alex","Jordan"], 23);
  seedExpense("exp5", "Gas Return",        "Gas",     "⛽", 65,  "Mike",  "Mar 16", true,  ["Sarah","Mike","Alex","Jordan"], 16.25);
  seedExpense("exp6", "6th Street Bar Crawl", "Activities", "🎸", 145, "Jordan", "Mar 17", true, ["Sarah","Mike","Alex","Jordan"], 36.25);
  seedExpense("exp7", "Snacks & Drinks",   "Other",   "🛒", 42,  "Taylor","Mar 17", false, ["Sarah","Mike","Alex","Jordan","Taylor","Casey"], 7);

  // Beach Weekend (planning-phase, lighter seed)
  const beach: TripStore = {
    trip: {
      id: "beach",
      name: "Beach Weekend",
      emoji: "🏖️",
      destination: "Galveston, TX",
      dates: "Apr 5–7, 2026",
      phase: "planning",
      createdAt: Date.now(),
    },
    members: [{
      id: "b1",
      tripId: "beach",
      name: "Sarah",
      avatar: "S",
      role: "Trip Organizer",
      rsvp: "committed",
      depositPaid: false,
    }],
    expenses: [],
    days: [],
    budget: [],
    rules: [],
    depositPolicy: null,
  };
  trips.set("beach", beach);
}

seed();

// ─── Async helper: every method returns a Promise so TanStack Query is happy ─

function ok<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

// ─── Trips ──────────────────────────────────────────────────────────────────

export const tripsApi = {
  list: (): Promise<TripSummaryDTO[]> => {
    const list = [...trips.values()]
      .sort((a, b) => b.trip.createdAt - a.trip.createdAt)
      .map(tripSummary);
    return ok(list);
  },
  get: (id: string): Promise<TripDTO> => {
    return ok(tripFull(requireTrip(id)));
  },
  create: (input: {
    id?: string; name: string; emoji?: string | null;
    destination?: string | null; dates?: string | null; phase?: TripPhase;
  }): Promise<TripDTO> => {
    const id = input.id ?? genId("trip");
    const store: TripStore = {
      trip: {
        id,
        name: input.name,
        emoji: input.emoji ?? null,
        destination: input.destination ?? null,
        dates: input.dates ?? null,
        phase: input.phase ?? "planning",
        createdAt: Date.now(),
      },
      members: [],
      expenses: [],
      days: [],
      budget: [],
      rules: [],
      depositPolicy: null,
    };
    trips.set(id, store);
    return ok(tripFull(store));
  },
  update: (id: string, patch: Partial<{
    name: string; emoji: string | null; destination: string | null;
    dates: string | null; phase: TripPhase;
  }>): Promise<TripDTO> => {
    const store = requireTrip(id);
    if (patch.name !== undefined) store.trip.name = patch.name;
    if (patch.emoji !== undefined) store.trip.emoji = patch.emoji;
    if (patch.destination !== undefined) store.trip.destination = patch.destination;
    if (patch.dates !== undefined) store.trip.dates = patch.dates;
    if (patch.phase !== undefined) store.trip.phase = patch.phase;
    return ok(tripFull(store));
  },
};

// ─── Members ────────────────────────────────────────────────────────────────

export const membersApi = {
  add: (tripId: string, input: {
    id?: string; name: string; avatar?: string | null;
    role?: string | null; rsvp?: RSVPStatus; depositPaid?: boolean;
  }): Promise<MemberDTO> => {
    const store = requireTrip(tripId);
    const member: MemberDTO = {
      id: input.id ?? genId("mem"),
      tripId,
      name: input.name,
      avatar: input.avatar ?? input.name[0]?.toUpperCase() ?? null,
      role: input.role ?? null,
      rsvp: input.rsvp ?? "interested",
      depositPaid: !!input.depositPaid,
    };
    store.members.push(member);
    return ok(member);
  },
  update: (tripId: string, memberId: string, patch: Partial<{
    name: string; avatar: string | null; role: string | null;
    rsvp: RSVPStatus; depositPaid: boolean;
  }>): Promise<MemberDTO> => {
    const store = requireTrip(tripId);
    const member = store.members.find((m) => m.id === memberId);
    if (!member) throw new Error(`Member ${memberId} not found`);
    if (patch.name !== undefined) member.name = patch.name;
    if (patch.avatar !== undefined) member.avatar = patch.avatar;
    if (patch.role !== undefined) member.role = patch.role;
    if (patch.rsvp !== undefined) member.rsvp = patch.rsvp;
    if (patch.depositPaid !== undefined) member.depositPaid = patch.depositPaid;
    return ok(member);
  },
  remove: (tripId: string, memberId: string): Promise<void> => {
    const store = requireTrip(tripId);
    store.members = store.members.filter((m) => m.id !== memberId);
    // Also remove dangling refs.
    store.expenses = store.expenses.filter((e) => e.paidBy !== memberId);
    for (const e of store.expenses) {
      e.splits = e.splits.filter((s) => s.memberId !== memberId);
    }
    for (const d of store.days) {
      for (const ev of d.events) {
        ev.attendees = ev.attendees.filter((a) => a.memberId !== memberId);
      }
    }
    return ok(undefined);
  },
};

// ─── Expenses ───────────────────────────────────────────────────────────────

export interface CreateExpenseInput {
  description: string;
  category?: string | null;
  emoji?: string | null;
  amount: number;
  paidBy: string;
  date?: string | null;
  location?: string | null;
  confirmed?: boolean;
  splits: { memberId: string; share: number }[];
}

export const expensesApi = {
  list: (tripId: string): Promise<ExpenseDTO[]> => {
    const store = requireTrip(tripId);
    return ok([...store.expenses]
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((e) => expenseToDTO(store, e)));
  },
  create: (tripId: string, input: CreateExpenseInput): Promise<ExpenseDTO> => {
    const store = requireTrip(tripId);
    const id = genId("exp");
    const expense: ExpenseInternal = {
      id,
      tripId,
      description: input.description,
      category: input.category ?? null,
      emoji: input.emoji ?? null,
      amount: r2(input.amount),
      paidBy: input.paidBy,
      date: input.date ?? null,
      location: input.location ?? null,
      confirmed: input.confirmed ?? false,
      splits: input.splits.map((s) => ({
        memberId: s.memberId,
        share: r2(s.share),
        paid: s.memberId === input.paidBy,
      })),
      createdAt: Date.now(),
    };
    store.expenses.push(expense);
    return ok(expenseToDTO(store, expense));
  },
  update: (tripId: string, expenseId: string, patch: Partial<{
    description: string; category: string | null; emoji: string | null;
    amount: number; paidBy: string; date: string | null;
    location: string | null; confirmed: boolean;
  }>): Promise<ExpenseDTO> => {
    const store = requireTrip(tripId);
    const e = store.expenses.find((x) => x.id === expenseId);
    if (!e) throw new Error(`Expense ${expenseId} not found`);
    if (patch.description !== undefined) e.description = patch.description;
    if (patch.category !== undefined) e.category = patch.category;
    if (patch.emoji !== undefined) e.emoji = patch.emoji;
    if (patch.amount !== undefined) e.amount = r2(patch.amount);
    if (patch.paidBy !== undefined) e.paidBy = patch.paidBy;
    if (patch.date !== undefined) e.date = patch.date;
    if (patch.location !== undefined) e.location = patch.location;
    if (patch.confirmed !== undefined) e.confirmed = patch.confirmed;
    return ok(expenseToDTO(store, e));
  },
  remove: (tripId: string, expenseId: string): Promise<void> => {
    const store = requireTrip(tripId);
    store.expenses = store.expenses.filter((e) => e.id !== expenseId);
    return ok(undefined);
  },
  setPaid: (tripId: string, expenseId: string, memberId: string, paid: boolean): Promise<{ ok: true }> => {
    const store = requireTrip(tripId);
    const e = store.expenses.find((x) => x.id === expenseId);
    if (!e) throw new Error(`Expense ${expenseId} not found`);
    const split = e.splits.find((s) => s.memberId === memberId);
    if (!split) throw new Error(`Split ${memberId} not found`);
    split.paid = paid;
    return ok({ ok: true } as const);
  },
};

// ─── Balances ───────────────────────────────────────────────────────────────

export const balancesApi = {
  get: (tripId: string): Promise<BalancesDTO> =>
    ok(computeBalances(requireTrip(tripId))),
};

// ─── Timeline ───────────────────────────────────────────────────────────────

export const timelineApi = {
  list: (tripId: string): Promise<DayScheduleDTO[]> => {
    const store = requireTrip(tripId);
    return ok([...store.days]
      .sort((a, b) => a.dayNumber - b.dayNumber)
      .map((d) => dayToDTO(store, d)));
  },
  addDay: (tripId: string, input: {
    id?: string; dayNumber: number; date?: string | null; label?: string | null;
    dayStartTime?: string | null; dayEndTime?: string | null;
  }): Promise<DayScheduleDTO> => {
    const store = requireTrip(tripId);
    const day: DayInternal = {
      id: input.id ?? `day-${tripId}-${input.dayNumber}`,
      tripId,
      dayNumber: input.dayNumber,
      date: input.date ?? null,
      label: input.label ?? null,
      dayStartTime: input.dayStartTime ?? null,
      dayEndTime: input.dayEndTime ?? null,
      events: [],
      suggestions: [],
    };
    store.days.push(day);
    return ok(dayToDTO(store, day));
  },
  addEvent: (tripId: string, input: {
    id?: string; dayId: string; title: string; time?: string | null;
    endTime?: string | null; location?: string | null; emoji?: string | null;
    state?: EventState; votingCloses?: string | null;
    attendees?: { memberId: string; status?: AttendanceStatus }[];
  }): Promise<TimelineEventDTO> => {
    const store = requireTrip(tripId);
    const day = store.days.find((d) => d.id === input.dayId);
    if (!day) throw new Error(`Day ${input.dayId} not found`);
    const nextSort = day.events.reduce((m, e) => Math.max(m, e.sortOrder), 0) + 1;
    const event: EventInternal = {
      id: input.id ?? genId("evt"),
      dayId: input.dayId,
      title: input.title,
      time: input.time ?? null,
      endTime: input.endTime ?? null,
      location: input.location ?? null,
      emoji: input.emoji ?? null,
      state: input.state ?? "proposed",
      votesFor: 0,
      votesAgainst: 0,
      votingCloses: input.votingCloses ?? null,
      attendees: (input.attendees ?? []).map((a) => ({
        memberId: a.memberId,
        status: a.status ?? "going",
      })),
      sortOrder: nextSort,
    };
    day.events.push(event);
    return ok(eventToDTO(store, event));
  },
  updateEvent: (tripId: string, eventId: string, patch: Partial<{
    title: string; time: string | null; endTime: string | null;
    location: string | null; emoji: string | null; state: EventState;
    votingCloses: string | null;
  }>): Promise<TimelineEventDTO> => {
    const store = requireTrip(tripId);
    for (const day of store.days) {
      const event = day.events.find((e) => e.id === eventId);
      if (!event) continue;
      if (patch.title !== undefined) event.title = patch.title;
      if (patch.time !== undefined) event.time = patch.time;
      if (patch.endTime !== undefined) event.endTime = patch.endTime;
      if (patch.location !== undefined) event.location = patch.location;
      if (patch.emoji !== undefined) event.emoji = patch.emoji;
      if (patch.state !== undefined) event.state = patch.state;
      if (patch.votingCloses !== undefined) event.votingCloses = patch.votingCloses;
      return ok(eventToDTO(store, event));
    }
    throw new Error(`Event ${eventId} not found`);
  },
  removeEvent: (tripId: string, eventId: string): Promise<void> => {
    const store = requireTrip(tripId);
    for (const day of store.days) {
      const before = day.events.length;
      day.events = day.events.filter((e) => e.id !== eventId);
      if (day.events.length !== before) return ok(undefined);
    }
    return ok(undefined);
  },
  vote: (tripId: string, eventId: string, type: "for" | "against"): Promise<TimelineEventDTO> => {
    const store = requireTrip(tripId);
    for (const day of store.days) {
      const event = day.events.find((e) => e.id === eventId);
      if (!event) continue;
      if (type === "for") event.votesFor += 1;
      else event.votesAgainst += 1;
      return ok(eventToDTO(store, event));
    }
    throw new Error(`Event ${eventId} not found`);
  },
  setAttendance: (tripId: string, eventId: string, memberId: string, status: AttendanceStatus): Promise<{ ok: true }> => {
    const store = requireTrip(tripId);
    for (const day of store.days) {
      const event = day.events.find((e) => e.id === eventId);
      if (!event) continue;
      const existing = event.attendees.find((a) => a.memberId === memberId);
      if (existing) existing.status = status;
      else event.attendees.push({ memberId, status });
      return ok({ ok: true } as const);
    }
    throw new Error(`Event ${eventId} not found`);
  },
};

// ─── Budget categories ──────────────────────────────────────────────────────

export const budgetApi = {
  list: (tripId: string): Promise<BudgetCategoryDTO[]> =>
    ok([...requireTrip(tripId).budget]),
  add: (tripId: string, input: {
    id?: string; name: string; estimate?: number; actual?: number;
    type?: "shared" | "optional"; icon?: string;
  }): Promise<BudgetCategoryDTO> => {
    const store = requireTrip(tripId);
    const cat: BudgetCategoryDTO = {
      id: input.id ?? genId("cat"),
      tripId,
      name: input.name,
      estimate: r2(input.estimate ?? 0),
      actual: r2(input.actual ?? 0),
      type: input.type ?? "shared",
      icon: input.icon ?? "💸",
    };
    store.budget.push(cat);
    return ok(cat);
  },
  update: (tripId: string, categoryId: string, patch: Partial<{
    name: string; estimate: number; actual: number;
    type: "shared" | "optional"; icon: string;
  }>): Promise<BudgetCategoryDTO> => {
    const store = requireTrip(tripId);
    const cat = store.budget.find((c) => c.id === categoryId);
    if (!cat) throw new Error(`Budget category ${categoryId} not found`);
    if (patch.name !== undefined) cat.name = patch.name;
    if (patch.estimate !== undefined) cat.estimate = r2(patch.estimate);
    if (patch.actual !== undefined) cat.actual = r2(patch.actual);
    if (patch.type !== undefined) cat.type = patch.type;
    if (patch.icon !== undefined) cat.icon = patch.icon;
    return ok(cat);
  },
  remove: (tripId: string, categoryId: string): Promise<void> => {
    const store = requireTrip(tripId);
    store.budget = store.budget.filter((c) => c.id !== categoryId);
    return ok(undefined);
  },
};

// ─── Rules ──────────────────────────────────────────────────────────────────

export const rulesApi = {
  list: (tripId: string): Promise<TripRuleDTO[]> =>
    ok([...requireTrip(tripId).rules]),
  add: (tripId: string, input: {
    id?: string; title: string; items?: string[];
    proposedBy?: string | null; votes?: number; totalVoters?: number;
  }): Promise<TripRuleDTO> => {
    const store = requireTrip(tripId);
    const rule: TripRuleDTO = {
      id: input.id ?? genId("rule"),
      tripId,
      title: input.title,
      items: input.items ?? [],
      proposedBy: input.proposedBy ?? null,
      votes: input.votes ?? 0,
      totalVoters: input.totalVoters ?? 0,
    };
    store.rules.push(rule);
    return ok(rule);
  },
  vote: (tripId: string, ruleId: string): Promise<TripRuleDTO> => {
    const store = requireTrip(tripId);
    const rule = store.rules.find((r) => r.id === ruleId);
    if (!rule) throw new Error(`Rule ${ruleId} not found`);
    rule.votes = Math.min(rule.totalVoters || rule.votes + 1, rule.votes + 1);
    return ok(rule);
  },
  remove: (tripId: string, ruleId: string): Promise<void> => {
    const store = requireTrip(tripId);
    store.rules = store.rules.filter((r) => r.id !== ruleId);
    return ok(undefined);
  },
};

// ─── Deposit policy ─────────────────────────────────────────────────────────

export const depositPolicyApi = {
  get: (tripId: string): Promise<DepositPolicyDTO | null> =>
    ok(requireTrip(tripId).depositPolicy),
  upsert: (tripId: string, input: {
    amount: number; dueDate?: string | null; covers?: string[];
    dropoutRule?: string | null; setBy?: string | null;
  }): Promise<DepositPolicyDTO> => {
    const store = requireTrip(tripId);
    const policy: DepositPolicyDTO = {
      tripId,
      amount: r2(input.amount),
      dueDate: input.dueDate ?? null,
      covers: input.covers ?? [],
      dropoutRule: input.dropoutRule ?? null,
      setBy: input.setBy ?? null,
    };
    store.depositPolicy = policy;
    return ok(policy);
  },
  patch: (tripId: string, patch: Partial<{
    amount: number; dueDate: string | null; covers: string[];
    dropoutRule: string | null; setBy: string | null;
  }>): Promise<DepositPolicyDTO> => {
    const store = requireTrip(tripId);
    const existing = store.depositPolicy;
    if (!existing) throw new Error("No deposit policy to patch");
    if (patch.amount !== undefined) existing.amount = r2(patch.amount);
    if (patch.dueDate !== undefined) existing.dueDate = patch.dueDate;
    if (patch.covers !== undefined) existing.covers = patch.covers;
    if (patch.dropoutRule !== undefined) existing.dropoutRule = patch.dropoutRule;
    if (patch.setBy !== undefined) existing.setBy = patch.setBy;
    return ok(existing);
  },
  clear: (tripId: string): Promise<void> => {
    requireTrip(tripId).depositPolicy = null;
    return ok(undefined);
  },
};
