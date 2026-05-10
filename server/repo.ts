// ─── Data access layer ──────────────────────────────────────────────────────
// One place for every SQL query. Routes call these; this module never touches
// Express so it's easy to unit-test or reuse from scripts (seed, CLI, etc.).

import { db } from "./db";
import { toCents, toDollars, boolFromInt } from "./util";
import type {
  AttendanceStatus, AttendeeDTO, BalancesDTO, BudgetCategoryDTO,
  DayScheduleDTO, DepositPolicyDTO, EventState, ExpenseDTO, ExpenseSplitDTO,
  MemberBalanceDTO, MemberDTO, RSVPStatus, SettlementDTO, SuggestionDTO,
  TimelineEventDTO, TripDTO, TripPhase, TripRuleDTO, TripSummaryDTO,
} from "./types";

// ─── Row types (raw SQLite shapes) ──────────────────────────────────────────

interface TripRow {
  id: string; name: string; emoji: string | null; destination: string | null;
  dates: string | null; start_date: string | null; end_date: string | null;
  phase: string; created_at: number; updated_at: number;
}
interface MemberRow {
  id: string; trip_id: string; name: string; avatar: string | null;
  role: string | null; rsvp: string; deposit_paid: number;
}
interface ExpenseRow {
  id: string; trip_id: string; description: string; category: string | null;
  emoji: string | null; amount_cents: number; paid_by: string;
  date_label: string | null; location: string | null; confirmed: number;
}
interface SplitRow {
  expense_id: string; member_id: string; share_cents: number; paid: number;
  name: string;
}
interface DayRow {
  id: string; trip_id: string; day_number: number; date_label: string | null;
  label: string | null; day_start_time: string | null; day_end_time: string | null;
}
interface EventRow {
  id: string; day_id: string; title: string; time: string | null;
  end_time: string | null; location: string | null; emoji: string | null;
  state: string; votes_for: number; votes_against: number;
  voting_closes: string | null; sort_order: number;
}
interface AttendeeRow {
  event_id: string; member_id: string; status: string; name: string;
}
interface SuggestionRow {
  id: string; day_id: string; title: string; category: string | null;
  reason: string | null; emoji: string | null; distance: string | null;
  location: string | null; suggested_time: string | null;
}

// ─── Row → DTO mappers ──────────────────────────────────────────────────────

function mapMember(r: MemberRow): MemberDTO {
  return {
    id: r.id, tripId: r.trip_id, name: r.name, avatar: r.avatar,
    role: r.role, rsvp: r.rsvp as RSVPStatus, depositPaid: boolFromInt(r.deposit_paid),
  };
}

function mapExpense(r: ExpenseRow, paidByName: string, splits: ExpenseSplitDTO[]): ExpenseDTO {
  return {
    id: r.id, tripId: r.trip_id, description: r.description, category: r.category,
    emoji: r.emoji, amount: toDollars(r.amount_cents), paidBy: r.paid_by, paidByName,
    date: r.date_label, location: r.location, confirmed: boolFromInt(r.confirmed),
    splits,
  };
}

function mapEvent(r: EventRow, attendees: AttendeeDTO[]): TimelineEventDTO {
  return {
    id: r.id, dayId: r.day_id, title: r.title, time: r.time, endTime: r.end_time,
    location: r.location, emoji: r.emoji, state: r.state as EventState,
    votesFor: r.votes_for, votesAgainst: r.votes_against, votingCloses: r.voting_closes,
    attendees,
  };
}

function mapSuggestion(r: SuggestionRow): SuggestionDTO {
  return {
    id: r.id, dayId: r.day_id, title: r.title, category: r.category,
    reason: r.reason, emoji: r.emoji, distance: r.distance, location: r.location,
    suggestedTime: r.suggested_time,
  };
}

// ─── Trips ──────────────────────────────────────────────────────────────────

const PREVIEW_LIMIT = 4;

export function listTrips(): TripSummaryDTO[] {
  const rows = db.prepare(`SELECT * FROM trips ORDER BY created_at DESC`).all() as TripRow[];
  const countStmt = db.prepare(`SELECT COUNT(*) AS n FROM members WHERE trip_id = ?`);
  const expenseStmt = db.prepare(
    `SELECT COUNT(*) AS n, COALESCE(SUM(amount_cents), 0) AS total FROM expenses WHERE trip_id = ?`
  );
  const previewStmt = db.prepare(
    `SELECT id, name FROM members WHERE trip_id = ? ORDER BY rowid LIMIT ?`
  );
  return rows.map((t) => {
    const mc = countStmt.get(t.id) as { n: number };
    const ec = expenseStmt.get(t.id) as { n: number; total: number };
    const pv = previewStmt.all(t.id, PREVIEW_LIMIT) as { id: string; name: string }[];
    return {
      id: t.id, name: t.name, emoji: t.emoji, dates: t.dates,
      destination: t.destination, phase: t.phase as TripPhase,
      memberCount: mc.n,
      memberPreview: pv.map((m) => ({
        id: m.id, name: m.name,
        initials: (m.name[0] ?? "?").toUpperCase(),
      })),
      expenseCount: ec.n, totalSpend: toDollars(ec.total),
    };
  });
}

export function getTrip(tripId: string): TripDTO | null {
  const t = db.prepare(`SELECT * FROM trips WHERE id = ?`).get(tripId) as TripRow | undefined;
  if (!t) return null;

  const members = (db.prepare(`SELECT * FROM members WHERE trip_id = ? ORDER BY rowid`)
    .all(tripId) as MemberRow[]).map(mapMember);

  const expenses = listExpenses(tripId);
  const timeline = listTimeline(tripId);
  const budgetCategories = listBudgetCategories(tripId);
  const rules = listRules(tripId);
  const depositPolicy = getDepositPolicy(tripId);

  return {
    id: t.id, name: t.name, emoji: t.emoji, dates: t.dates,
    destination: t.destination, phase: t.phase as TripPhase,
    memberCount: members.length,
    memberPreview: members.slice(0, PREVIEW_LIMIT).map((m) => ({
      id: m.id, name: m.name, initials: (m.name[0] ?? "?").toUpperCase(),
    })),
    expenseCount: expenses.length,
    totalSpend: expenses.reduce((s, e) => s + e.amount, 0),
    members, expenses, timeline,
    budgetCategories, rules, depositPolicy,
  };
}

export function createTrip(input: {
  id?: string; name: string; emoji?: string | null; destination?: string | null;
  dates?: string | null; phase?: TripPhase;
}): TripDTO {
  const id = input.id ?? `trip-${Date.now().toString(36)}`;
  db.prepare(
    `INSERT INTO trips (id, name, emoji, destination, dates, phase)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    id, input.name, input.emoji ?? null, input.destination ?? null,
    input.dates ?? null, input.phase ?? "planning"
  );
  return getTrip(id)!;
}

export function updateTrip(id: string, updates: Partial<{
  name: string; emoji: string | null; destination: string | null;
  dates: string | null; phase: TripPhase;
}>): TripDTO | null {
  const fields: string[] = [];
  const values: unknown[] = [];
  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined) continue;
    fields.push(`${k} = ?`);
    values.push(v);
  }
  if (fields.length === 0) return getTrip(id);
  fields.push(`updated_at = unixepoch()`);
  values.push(id);
  db.prepare(`UPDATE trips SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  return getTrip(id);
}

// ─── Members ────────────────────────────────────────────────────────────────

export function listMembers(tripId: string): MemberDTO[] {
  return (db.prepare(`SELECT * FROM members WHERE trip_id = ? ORDER BY rowid`)
    .all(tripId) as MemberRow[]).map(mapMember);
}

export function addMember(tripId: string, input: {
  id?: string; name: string; avatar?: string | null; role?: string | null;
  rsvp?: RSVPStatus; depositPaid?: boolean;
}): MemberDTO {
  const id = input.id ?? `mem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  db.prepare(
    `INSERT INTO members (id, trip_id, name, avatar, role, rsvp, deposit_paid)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, tripId, input.name,
    input.avatar ?? input.name[0]?.toUpperCase() ?? null,
    input.role ?? null,
    input.rsvp ?? "interested",
    input.depositPaid ? 1 : 0,
  );
  const row = db.prepare(`SELECT * FROM members WHERE id = ?`).get(id) as MemberRow;
  return mapMember(row);
}

export function updateMember(memberId: string, updates: Partial<{
  name: string; avatar: string | null; role: string | null;
  rsvp: RSVPStatus; depositPaid: boolean;
}>): MemberDTO | null {
  const fields: string[] = [];
  const values: unknown[] = [];
  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined) continue;
    const col = k === "depositPaid" ? "deposit_paid" : k;
    fields.push(`${col} = ?`);
    values.push(typeof v === "boolean" ? (v ? 1 : 0) : v);
  }
  if (fields.length === 0) return null;
  values.push(memberId);
  db.prepare(`UPDATE members SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  const row = db.prepare(`SELECT * FROM members WHERE id = ?`).get(memberId) as MemberRow | undefined;
  return row ? mapMember(row) : null;
}

export function removeMember(memberId: string): void {
  db.prepare(`DELETE FROM members WHERE id = ?`).run(memberId);
}

// ─── Expenses ───────────────────────────────────────────────────────────────

function loadSplits(expenseId: string): ExpenseSplitDTO[] {
  const rows = db.prepare(
    `SELECT s.expense_id, s.member_id, s.share_cents, s.paid, m.name
       FROM expense_splits s JOIN members m ON m.id = s.member_id
      WHERE s.expense_id = ?
      ORDER BY m.rowid`
  ).all(expenseId) as SplitRow[];
  return rows.map((r) => ({
    memberId: r.member_id,
    name: r.name,
    share: toDollars(r.share_cents),
    paid: boolFromInt(r.paid),
  }));
}

export function listExpenses(tripId: string): ExpenseDTO[] {
  const rows = db.prepare(
    `SELECT e.*, m.name AS paid_by_name
       FROM expenses e JOIN members m ON m.id = e.paid_by
      WHERE e.trip_id = ?
      ORDER BY e.created_at DESC`
  ).all(tripId) as (ExpenseRow & { paid_by_name: string })[];
  return rows.map((r) => mapExpense(r, r.paid_by_name, loadSplits(r.id)));
}

export function createExpense(tripId: string, input: {
  id?: string;
  description: string;
  category?: string | null;
  emoji?: string | null;
  amount: number;          // dollars
  paidBy: string;          // member id
  date?: string | null;
  location?: string | null;
  confirmed?: boolean;
  splits: { memberId: string; share: number }[];  // dollars
}): ExpenseDTO {
  const id = input.id ?? `exp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO expenses (id, trip_id, description, category, emoji, amount_cents,
                             paid_by, date_label, location, confirmed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id, tripId, input.description, input.category ?? null, input.emoji ?? null,
      toCents(input.amount), input.paidBy, input.date ?? null, input.location ?? null,
      input.confirmed ? 1 : 0,
    );
    const splitStmt = db.prepare(
      `INSERT INTO expense_splits (expense_id, member_id, share_cents, paid) VALUES (?, ?, ?, ?)`
    );
    for (const s of input.splits) {
      // The payer's own share is marked paid automatically — they've already
      // fronted the money, so they don't owe themselves.
      const paid = s.memberId === input.paidBy ? 1 : 0;
      splitStmt.run(id, s.memberId, toCents(s.share), paid);
    }
  });
  tx();
  const row = db.prepare(
    `SELECT e.*, m.name AS paid_by_name FROM expenses e JOIN members m ON m.id = e.paid_by WHERE e.id = ?`
  ).get(id) as (ExpenseRow & { paid_by_name: string });
  return mapExpense(row, row.paid_by_name, loadSplits(id));
}

export function updateExpense(expenseId: string, updates: Partial<{
  description: string; category: string | null; emoji: string | null;
  amount: number; paidBy: string; date: string | null; location: string | null;
  confirmed: boolean;
}>): ExpenseDTO | null {
  const fields: string[] = [];
  const values: unknown[] = [];
  const colMap: Record<string, string> = {
    amount: "amount_cents", paidBy: "paid_by", date: "date_label",
  };
  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined) continue;
    const col = colMap[k] ?? k;
    let value: unknown = v;
    if (k === "amount") value = toCents(v as number);
    else if (typeof v === "boolean") value = v ? 1 : 0;
    fields.push(`${col} = ?`);
    values.push(value);
  }
  if (fields.length === 0) return null;
  values.push(expenseId);
  db.prepare(`UPDATE expenses SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  const row = db.prepare(
    `SELECT e.*, m.name AS paid_by_name FROM expenses e JOIN members m ON m.id = e.paid_by WHERE e.id = ?`
  ).get(expenseId) as (ExpenseRow & { paid_by_name: string }) | undefined;
  return row ? mapExpense(row, row.paid_by_name, loadSplits(expenseId)) : null;
}

export function deleteExpense(expenseId: string): void {
  db.prepare(`DELETE FROM expenses WHERE id = ?`).run(expenseId);
}

export function setSplitPaid(expenseId: string, memberId: string, paid: boolean): void {
  db.prepare(`UPDATE expense_splits SET paid = ? WHERE expense_id = ? AND member_id = ?`)
    .run(paid ? 1 : 0, expenseId, memberId);
}

// ─── Balances ───────────────────────────────────────────────────────────────
// Core "who owes who" calculation. Runs in SQL then settles in JS.
// 1. paid   = sum of amounts each member actually paid out (expenses.paid_by).
// 2. owed   = sum of each member's share across every split they're in.
// 3. net    = paid - owed
// 4. settlements: greedy match the biggest creditor to the biggest debtor.

export function getBalances(tripId: string): BalancesDTO {
  const members = listMembers(tripId);

  const paidRows = db.prepare(
    `SELECT paid_by AS member_id, COALESCE(SUM(amount_cents), 0) AS paid_cents
       FROM expenses WHERE trip_id = ?
      GROUP BY paid_by`
  ).all(tripId) as { member_id: string; paid_cents: number }[];

  const owedRows = db.prepare(
    `SELECT s.member_id, COALESCE(SUM(s.share_cents), 0) AS owed_cents
       FROM expense_splits s JOIN expenses e ON e.id = s.expense_id
      WHERE e.trip_id = ?
      GROUP BY s.member_id`
  ).all(tripId) as { member_id: string; owed_cents: number }[];

  const paidMap = new Map(paidRows.map((r) => [r.member_id, r.paid_cents]));
  const owedMap = new Map(owedRows.map((r) => [r.member_id, r.owed_cents]));

  const balances: MemberBalanceDTO[] = members.map((m) => {
    const paid = toDollars(paidMap.get(m.id) ?? 0);
    const owed = toDollars(owedMap.get(m.id) ?? 0);
    return { memberId: m.id, name: m.name, paid, owed, net: +(paid - owed).toFixed(2) };
  });

  // Greedy settlement.
  const creditors = balances.filter((b) => b.net > 0.009).map((b) => ({ ...b, net: b.net }));
  const debtors = balances.filter((b) => b.net < -0.009).map((b) => ({ ...b, net: b.net }));
  creditors.sort((a, b) => b.net - a.net);
  debtors.sort((a, b) => a.net - b.net);  // most negative first

  const settlements: SettlementDTO[] = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = +Math.min(-debtor.net, creditor.net).toFixed(2);
    if (amount > 0.009) {
      settlements.push({
        fromMemberId: debtor.memberId, fromName: debtor.name,
        toMemberId: creditor.memberId, toName: creditor.name,
        amount,
      });
    }
    debtor.net = +(debtor.net + amount).toFixed(2);
    creditor.net = +(creditor.net - amount).toFixed(2);
    if (Math.abs(debtor.net) < 0.01) i++;
    if (Math.abs(creditor.net) < 0.01) j++;
  }

  return { balances, settlements };
}

// ─── Timeline ───────────────────────────────────────────────────────────────

function loadAttendees(eventId: string): AttendeeDTO[] {
  const rows = db.prepare(
    `SELECT a.event_id, a.member_id, a.status, m.name
       FROM event_attendees a JOIN members m ON m.id = a.member_id
      WHERE a.event_id = ?`
  ).all(eventId) as AttendeeRow[];
  return rows.map((r) => ({
    memberId: r.member_id, name: r.name, status: r.status as AttendanceStatus,
  }));
}

export function listTimeline(tripId: string): DayScheduleDTO[] {
  const days = db.prepare(
    `SELECT * FROM timeline_days WHERE trip_id = ? ORDER BY day_number ASC`
  ).all(tripId) as DayRow[];

  return days.map((d) => {
    const events = (db.prepare(
      `SELECT * FROM timeline_events WHERE day_id = ? ORDER BY sort_order, time`
    ).all(d.id) as EventRow[]).map((e) => mapEvent(e, loadAttendees(e.id)));

    const suggestions = (db.prepare(
      `SELECT * FROM suggestions WHERE day_id = ? ORDER BY rowid`
    ).all(d.id) as SuggestionRow[]).map(mapSuggestion);

    return {
      id: d.id, dayNumber: d.day_number, date: d.date_label, label: d.label,
      dayStartTime: d.day_start_time, dayEndTime: d.day_end_time, events, suggestions,
    };
  });
}

export function addDay(tripId: string, input: {
  id?: string; dayNumber: number; date?: string | null; label?: string | null;
  dayStartTime?: string | null; dayEndTime?: string | null;
}): DayScheduleDTO {
  const id = input.id ?? `day-${tripId}-${input.dayNumber}`;
  db.prepare(
    `INSERT INTO timeline_days (id, trip_id, day_number, date_label, label, day_start_time, day_end_time)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, tripId, input.dayNumber, input.date ?? null, input.label ?? null,
    input.dayStartTime ?? null, input.dayEndTime ?? null,
  );
  return {
    id, dayNumber: input.dayNumber, date: input.date ?? null, label: input.label ?? null,
    dayStartTime: input.dayStartTime ?? null, dayEndTime: input.dayEndTime ?? null,
    events: [], suggestions: [],
  };
}

export function addEvent(dayId: string, input: {
  id?: string; title: string; time?: string | null; endTime?: string | null;
  location?: string | null; emoji?: string | null; state?: EventState;
  votingCloses?: string | null; attendees?: { memberId: string; status?: AttendanceStatus }[];
}): TimelineEventDTO | null {
  const id = input.id ?? `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO timeline_events (id, day_id, title, time, end_time, location, emoji, state, voting_closes, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM timeline_events WHERE day_id = ?))`
    ).run(
      id, dayId, input.title, input.time ?? null, input.endTime ?? null,
      input.location ?? null, input.emoji ?? null, input.state ?? "proposed",
      input.votingCloses ?? null, dayId,
    );
    if (input.attendees?.length) {
      const stmt = db.prepare(
        `INSERT OR IGNORE INTO event_attendees (event_id, member_id, status) VALUES (?, ?, ?)`
      );
      for (const a of input.attendees) stmt.run(id, a.memberId, a.status ?? "going");
    }
  });
  tx();
  const row = db.prepare(`SELECT * FROM timeline_events WHERE id = ?`).get(id) as EventRow | undefined;
  return row ? mapEvent(row, loadAttendees(id)) : null;
}

export function updateEvent(eventId: string, updates: Partial<{
  title: string; time: string | null; endTime: string | null; location: string | null;
  emoji: string | null; state: EventState; votingCloses: string | null;
}>): TimelineEventDTO | null {
  const fields: string[] = [];
  const values: unknown[] = [];
  const colMap: Record<string, string> = { endTime: "end_time", votingCloses: "voting_closes" };
  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined) continue;
    fields.push(`${colMap[k] ?? k} = ?`);
    values.push(v);
  }
  if (fields.length > 0) {
    values.push(eventId);
    db.prepare(`UPDATE timeline_events SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }
  const row = db.prepare(`SELECT * FROM timeline_events WHERE id = ?`).get(eventId) as EventRow | undefined;
  return row ? mapEvent(row, loadAttendees(eventId)) : null;
}

export function deleteEvent(eventId: string): void {
  db.prepare(`DELETE FROM timeline_events WHERE id = ?`).run(eventId);
}

export function voteEvent(eventId: string, type: "for" | "against"): TimelineEventDTO | null {
  const col = type === "for" ? "votes_for" : "votes_against";
  db.prepare(`UPDATE timeline_events SET ${col} = ${col} + 1 WHERE id = ?`).run(eventId);
  const row = db.prepare(`SELECT * FROM timeline_events WHERE id = ?`).get(eventId) as EventRow | undefined;
  return row ? mapEvent(row, loadAttendees(eventId)) : null;
}

export function setAttendeeStatus(eventId: string, memberId: string, status: AttendanceStatus): void {
  db.prepare(
    `INSERT INTO event_attendees (event_id, member_id, status) VALUES (?, ?, ?)
     ON CONFLICT(event_id, member_id) DO UPDATE SET status = excluded.status`
  ).run(eventId, memberId, status);
}

// ─── Budget categories ──────────────────────────────────────────────────────

interface BudgetCategoryRow {
  id: string; trip_id: string; name: string; estimate_cents: number;
  actual_cents: number; type: string; icon: string;
}

function mapBudgetCategory(r: BudgetCategoryRow): BudgetCategoryDTO {
  return {
    id: r.id, tripId: r.trip_id, name: r.name,
    estimate: toDollars(r.estimate_cents), actual: toDollars(r.actual_cents),
    type: r.type === "optional" ? "optional" : "shared",
    icon: r.icon,
  };
}

export function listBudgetCategories(tripId: string): BudgetCategoryDTO[] {
  return (db.prepare(
    `SELECT * FROM budget_categories WHERE trip_id = ? ORDER BY rowid`
  ).all(tripId) as BudgetCategoryRow[]).map(mapBudgetCategory);
}

export function addBudgetCategory(tripId: string, input: {
  id?: string; name: string; estimate?: number; actual?: number;
  type?: "shared" | "optional"; icon?: string;
}): BudgetCategoryDTO {
  const id = input.id ?? `cat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  db.prepare(
    `INSERT INTO budget_categories (id, trip_id, name, estimate_cents, actual_cents, type, icon)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, tripId, input.name,
    toCents(input.estimate ?? 0), toCents(input.actual ?? 0),
    input.type ?? "shared", input.icon ?? "💸",
  );
  const row = db.prepare(`SELECT * FROM budget_categories WHERE id = ?`).get(id) as BudgetCategoryRow;
  return mapBudgetCategory(row);
}

export function updateBudgetCategory(categoryId: string, updates: Partial<{
  name: string; estimate: number; actual: number; type: "shared" | "optional"; icon: string;
}>): BudgetCategoryDTO | null {
  const fields: string[] = [];
  const values: unknown[] = [];
  const colMap: Record<string, string> = { estimate: "estimate_cents", actual: "actual_cents" };
  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined) continue;
    const col = colMap[k] ?? k;
    let value: unknown = v;
    if (k === "estimate" || k === "actual") value = toCents(v as number);
    fields.push(`${col} = ?`);
    values.push(value);
  }
  if (fields.length === 0) return null;
  values.push(categoryId);
  db.prepare(`UPDATE budget_categories SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  const row = db.prepare(`SELECT * FROM budget_categories WHERE id = ?`).get(categoryId) as BudgetCategoryRow | undefined;
  return row ? mapBudgetCategory(row) : null;
}

export function removeBudgetCategory(categoryId: string): void {
  db.prepare(`DELETE FROM budget_categories WHERE id = ?`).run(categoryId);
}

// ─── Rules ──────────────────────────────────────────────────────────────────

interface RuleRow {
  id: string; trip_id: string; title: string; items_json: string;
  proposed_by: string | null; votes: number; total_voters: number;
}

function mapRule(r: RuleRow): TripRuleDTO {
  let items: string[] = [];
  try {
    const parsed = JSON.parse(r.items_json);
    if (Array.isArray(parsed)) items = parsed.filter((x): x is string => typeof x === "string");
  } catch {
    // Corrupt JSON shouldn't bring the app down — just return an empty list.
  }
  return {
    id: r.id, tripId: r.trip_id, title: r.title, items,
    proposedBy: r.proposed_by, votes: r.votes, totalVoters: r.total_voters,
  };
}

export function listRules(tripId: string): TripRuleDTO[] {
  return (db.prepare(`SELECT * FROM rules WHERE trip_id = ? ORDER BY rowid`)
    .all(tripId) as RuleRow[]).map(mapRule);
}

export function addRule(tripId: string, input: {
  id?: string; title: string; items?: string[]; proposedBy?: string | null;
  votes?: number; totalVoters?: number;
}): TripRuleDTO {
  const id = input.id ?? `rule-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  db.prepare(
    `INSERT INTO rules (id, trip_id, title, items_json, proposed_by, votes, total_voters)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, tripId, input.title, JSON.stringify(input.items ?? []),
    input.proposedBy ?? null, input.votes ?? 0, input.totalVoters ?? 0,
  );
  const row = db.prepare(`SELECT * FROM rules WHERE id = ?`).get(id) as RuleRow;
  return mapRule(row);
}

export function voteRule(ruleId: string): TripRuleDTO | null {
  db.prepare(
    `UPDATE rules SET votes = MIN(total_voters, votes + 1) WHERE id = ?`
  ).run(ruleId);
  const row = db.prepare(`SELECT * FROM rules WHERE id = ?`).get(ruleId) as RuleRow | undefined;
  return row ? mapRule(row) : null;
}

export function removeRule(ruleId: string): void {
  db.prepare(`DELETE FROM rules WHERE id = ?`).run(ruleId);
}

// ─── Deposit policy ─────────────────────────────────────────────────────────

interface DepositPolicyRow {
  trip_id: string; amount_cents: number; due_date: string | null;
  covers_json: string; dropout_rule: string | null; set_by: string | null;
}

function mapDepositPolicy(r: DepositPolicyRow): DepositPolicyDTO {
  let covers: string[] = [];
  try {
    const parsed = JSON.parse(r.covers_json);
    if (Array.isArray(parsed)) covers = parsed.filter((x): x is string => typeof x === "string");
  } catch { /* noop */ }
  return {
    tripId: r.trip_id, amount: toDollars(r.amount_cents), dueDate: r.due_date,
    covers, dropoutRule: r.dropout_rule, setBy: r.set_by,
  };
}

export function getDepositPolicy(tripId: string): DepositPolicyDTO | null {
  const row = db.prepare(`SELECT * FROM deposit_policies WHERE trip_id = ?`)
    .get(tripId) as DepositPolicyRow | undefined;
  return row ? mapDepositPolicy(row) : null;
}

export function upsertDepositPolicy(tripId: string, input: {
  amount: number; dueDate?: string | null; covers?: string[];
  dropoutRule?: string | null; setBy?: string | null;
}): DepositPolicyDTO {
  db.prepare(
    `INSERT INTO deposit_policies (trip_id, amount_cents, due_date, covers_json, dropout_rule, set_by)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(trip_id) DO UPDATE SET
       amount_cents = excluded.amount_cents,
       due_date = excluded.due_date,
       covers_json = excluded.covers_json,
       dropout_rule = excluded.dropout_rule,
       set_by = excluded.set_by`
  ).run(
    tripId, toCents(input.amount), input.dueDate ?? null,
    JSON.stringify(input.covers ?? []), input.dropoutRule ?? null, input.setBy ?? null,
  );
  return getDepositPolicy(tripId)!;
}

export function patchDepositPolicy(tripId: string, updates: Partial<{
  amount: number; dueDate: string | null; covers: string[];
  dropoutRule: string | null; setBy: string | null;
}>): DepositPolicyDTO | null {
  const existing = getDepositPolicy(tripId);
  if (!existing) return null;
  return upsertDepositPolicy(tripId, {
    amount: updates.amount ?? existing.amount,
    dueDate: updates.dueDate === undefined ? existing.dueDate : updates.dueDate,
    covers: updates.covers ?? existing.covers,
    dropoutRule: updates.dropoutRule === undefined ? existing.dropoutRule : updates.dropoutRule,
    setBy: updates.setBy === undefined ? existing.setBy : updates.setBy,
  });
}

export function deleteDepositPolicy(tripId: string): void {
  db.prepare(`DELETE FROM deposit_policies WHERE trip_id = ?`).run(tripId);
}
