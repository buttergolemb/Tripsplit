// ─── Data access layer ──────────────────────────────────────────────────────
// One place for every SQL query. Routes call these; this module never touches
// Express so it's easy to unit-test or reuse from scripts (seed, CLI, etc.).
//
// Postgres-flavored: parameter placeholders use $1/$2…, BOOLEAN columns are
// returned as native booleans, and insertion order uses TIMESTAMPTZ columns
// instead of SQLite `rowid`.

import { query, queryOne, tx, type Querier } from "./db";
import { toCents, toDollars, boolFromInt } from "./util";
import type {
  AttendanceStatus, AttendeeDTO, BalancesDTO, BudgetCategoryDTO,
  DayScheduleDTO, DepositPolicyDTO, EventDiscussionPostDTO, EventState,
  ExpenseDTO, ExpenseSplitDTO,
  MemberBalanceDTO, MemberDTO, RSVPStatus, SettlementDTO, SuggestionDTO,
  TimelineEventDTO, TripDTO, TripPhase, TripRuleDTO, TripSummaryDTO,
} from "./types";

// ─── Row types (raw Postgres shapes) ────────────────────────────────────────

interface TripRow {
  id: string; name: string; emoji: string | null; destination: string | null;
  dates: string | null; phase: string;
}
interface MemberRow {
  id: string; trip_id: string; name: string; avatar: string | null;
  role: string; rsvp: string; deposit_paid: boolean;
}
interface ExpenseRow {
  id: string; trip_id: string; description: string; category: string | null;
  emoji: string | null; amount_cents: number; paid_by: string;
  date_label: string | null; location: string | null; confirmed: boolean;
}
interface SplitRow {
  expense_id: string; member_id: string; share_cents: number; paid: boolean;
  name: string;
}
interface DayRow {
  id: string; trip_id: string; day_number: number; date_label: string | null;
  label: string | null; day_start_time: string | null; day_end_time: string | null;
}
interface EventRow {
  id: string; day_id: string; trip_id: string; title: string; time: string | null;
  end_time: string | null; location: string | null; emoji: string | null;
  state: string; votes_for: number; votes_against: number;
  voting_closes: string | null;
}
interface AttendeeRow {
  event_id: string; member_id: string; status: string; name: string;
}
interface SuggestionRow {
  id: string; trip_id: string; day_id: string | null; title: string; category: string | null;
  reason: string | null; emoji: string | null; distance: string | null;
  location: string | null; suggested_time: string | null;
}

// ─── Row → DTO mappers ──────────────────────────────────────────────────────

function mapMember(r: MemberRow): MemberDTO {
  return {
    id: r.id, tripId: r.trip_id, name: r.name, avatar: r.avatar,
    role: r.role,
    rsvp: r.rsvp as RSVPStatus, depositPaid: boolFromInt(r.deposit_paid),
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
    id: r.id, dayId: r.day_id ?? "", title: r.title, category: r.category,
    reason: r.reason, emoji: r.emoji, distance: r.distance, location: r.location,
    suggestedTime: r.suggested_time,
  };
}

// ─── Trips ──────────────────────────────────────────────────────────────────

const PREVIEW_LIMIT = 4;

export async function listTrips(): Promise<TripSummaryDTO[]> {
  const trips = (await query<TripRow>(
    `SELECT * FROM trips
       ORDER BY CASE id WHEN 'austin' THEN 0 WHEN 'beach' THEN 1 ELSE 2 END,
                created_at DESC,
                id DESC`,
  )).rows;
  if (trips.length === 0) return [];

  const ids = trips.map((t) => t.id);

  const memberCounts = (await query<{ trip_id: string; n: number }>(
    `SELECT trip_id, COUNT(*)::int AS n FROM members
      WHERE trip_id = ANY($1::text[]) GROUP BY trip_id`,
    [ids as unknown as string],
  )).rows;
  const memberCountByTrip = new Map(memberCounts.map((r) => [r.trip_id, r.n]));

  const expenseTotals = (await query<{ trip_id: string; n: number; total: number }>(
    `SELECT trip_id, COUNT(*)::int AS n,
            COALESCE(SUM(amount_cents), 0)::bigint AS total
       FROM expenses
      WHERE trip_id = ANY($1::text[])
      GROUP BY trip_id`,
    [ids as unknown as string],
  )).rows;
  const expenseTotalByTrip = new Map(
    expenseTotals.map((r) => [r.trip_id, { n: r.n, total: Number(r.total) }]),
  );

  // Pull the first PREVIEW_LIMIT members per trip in one query using
  // ROW_NUMBER, instead of running N+1 queries.
  const previewRows = (await query<{ trip_id: string; id: string; name: string; rn: number }>(
    `SELECT trip_id, id, name, rn FROM (
       SELECT trip_id, id, name,
              ROW_NUMBER() OVER (PARTITION BY trip_id ORDER BY created_at ASC, id ASC) AS rn
         FROM members
        WHERE trip_id = ANY($1::text[])
     ) ranked
     WHERE rn <= $2
     ORDER BY trip_id, rn`,
    [ids as unknown as string, PREVIEW_LIMIT],
  )).rows;
  const previewByTrip = new Map<string, { id: string; name: string }[]>();
  for (const r of previewRows) {
    let bucket = previewByTrip.get(r.trip_id);
    if (!bucket) { bucket = []; previewByTrip.set(r.trip_id, bucket); }
    bucket.push({ id: r.id, name: r.name });
  }

  return trips.map((t) => {
    const ec = expenseTotalByTrip.get(t.id) ?? { n: 0, total: 0 };
    return {
      id: t.id, name: t.name, emoji: t.emoji, dates: t.dates,
      destination: t.destination, phase: t.phase as TripPhase,
      memberCount: memberCountByTrip.get(t.id) ?? 0,
      memberPreview: (previewByTrip.get(t.id) ?? []).map((m) => ({
        id: m.id, name: m.name,
        initials: (m.name[0] ?? "?").toUpperCase(),
      })),
      expenseCount: ec.n, totalSpend: toDollars(ec.total),
    };
  });
}

export async function getTrip(tripId: string): Promise<TripDTO | null> {
  const t = await queryOne<TripRow>(`SELECT * FROM trips WHERE id = $1`, [tripId]);
  if (!t) return null;

  const members = (await query<MemberRow>(
    `SELECT * FROM members WHERE trip_id = $1 ORDER BY created_at, id`,
    [tripId],
  )).rows.map(mapMember);

  const expenses = await listExpenses(tripId);
  const timeline = await listTimeline(tripId);
  const budgetCategories = await listBudgetCategories(tripId);
  const rules = await listRules(tripId);
  const depositPolicy = await getDepositPolicy(tripId);

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

export async function createTrip(input: {
  id?: string; name: string; emoji?: string | null; destination?: string | null;
  dates?: string | null; phase?: TripPhase;
}): Promise<TripDTO> {
  const id = input.id ?? `trip-${Date.now().toString(36)}`;
  await query(
    `INSERT INTO trips (id, name, emoji, destination, dates, phase)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      id, input.name, input.emoji ?? null, input.destination ?? null,
      input.dates ?? null, input.phase ?? "planning",
    ],
  );
  const trip = await getTrip(id);
  if (!trip) throw new Error("createTrip: insert succeeded but lookup failed");
  return trip;
}

export async function updateTrip(id: string, updates: Partial<{
  name: string; emoji: string | null; destination: string | null;
  dates: string | null; phase: TripPhase;
}>): Promise<TripDTO | null> {
  const fields: string[] = [];
  const values: (string | number | boolean | null)[] = [];
  let p = 1;
  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined) continue;
    fields.push(`${k} = $${p++}`);
    values.push(v as string | null);
  }
  if (fields.length === 0) return getTrip(id);
  fields.push(`updated_at = NOW()`);
  values.push(id);
  await query(
    `UPDATE trips SET ${fields.join(", ")} WHERE id = $${p}`,
    values,
  );
  return getTrip(id);
}

// ─── Members ────────────────────────────────────────────────────────────────

export async function listMembers(tripId: string): Promise<MemberDTO[]> {
  const rows = (await query<MemberRow>(
    `SELECT * FROM members WHERE trip_id = $1 ORDER BY created_at ASC, id ASC`,
    [tripId],
  )).rows;
  return rows.map(mapMember);
}

export async function addMember(tripId: string, input: {
  id?: string; name: string; avatar?: string | null; role?: string | null;
  rsvp?: RSVPStatus; depositPaid?: boolean;
}): Promise<MemberDTO> {
  const id = input.id ?? `mem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  await query(
    `INSERT INTO members (id, trip_id, name, avatar, role, rsvp, deposit_paid)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      id, tripId, input.name,
      input.avatar ?? input.name[0]?.toUpperCase() ?? null,
      input.role ?? "member",
      input.rsvp ?? "pending",
      !!input.depositPaid,
    ],
  );
  const row = await queryOne<MemberRow>(`SELECT * FROM members WHERE id = $1`, [id]);
  if (!row) throw new Error("addMember: insert succeeded but lookup failed");
  return mapMember(row);
}

export async function updateMember(memberId: string, updates: Partial<{
  name: string; avatar: string | null; role: string | null;
  rsvp: RSVPStatus; depositPaid: boolean;
}>): Promise<MemberDTO | null> {
  const fields: string[] = [];
  const values: (string | number | boolean | null)[] = [];
  let p = 1;
  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined) continue;
    const col = k === "depositPaid" ? "deposit_paid" : k;
    const value = col === "role" && v === null ? "member" : v;
    fields.push(`${col} = $${p++}`);
    values.push(typeof value === "boolean" ? value : value as string | null);
  }
  if (fields.length === 0) return null;
  fields.push(`updated_at = NOW()`);
  values.push(memberId);
  await query(
    `UPDATE members SET ${fields.join(", ")} WHERE id = $${p}`,
    values,
  );
  const row = await queryOne<MemberRow>(`SELECT * FROM members WHERE id = $1`, [memberId]);
  return row ? mapMember(row) : null;
}

export async function removeMember(memberId: string): Promise<void> {
  await query(`DELETE FROM members WHERE id = $1`, [memberId]);
}

// ─── Expenses ───────────────────────────────────────────────────────────────

async function loadSplits(expenseId: string, q: Querier = { query, queryOne }): Promise<ExpenseSplitDTO[]> {
  const rows = (await q.query<SplitRow>(
    `SELECT s.expense_id, s.member_id, s.share_cents, s.paid, m.name
       FROM expense_splits s JOIN members m ON m.id = s.member_id
      WHERE s.expense_id = $1
      ORDER BY m.created_at ASC, m.id ASC`,
    [expenseId],
  )).rows;
  return rows.map((r) => ({
    memberId: r.member_id,
    name: r.name,
    share: toDollars(r.share_cents),
    paid: boolFromInt(r.paid),
  }));
}

export async function listExpenses(tripId: string): Promise<ExpenseDTO[]> {
  const rows = (await query<ExpenseRow & { paid_by_name: string }>(
    `SELECT e.*, m.name AS paid_by_name
       FROM expenses e JOIN members m ON m.id = e.paid_by
      WHERE e.trip_id = $1
      ORDER BY e.created_at DESC`,
    [tripId],
  )).rows;

  // Loading splits per row keeps the SQL simple. For larger trips this
  // could be flattened into a single SELECT … WHERE expense_id = ANY(...)
  // but trip-sized data is small enough that the round-trips are fine.
  const out: ExpenseDTO[] = [];
  for (const r of rows) {
    out.push(mapExpense(r, r.paid_by_name, await loadSplits(r.id)));
  }
  return out;
}

export async function createExpense(tripId: string, input: {
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
}): Promise<ExpenseDTO> {
  const id = input.id ?? `exp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  await tx(async (q) => {
    await q.query(
      `INSERT INTO expenses (id, trip_id, description, category, emoji, amount_cents,
                             paid_by, date_label, location, confirmed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id, tripId, input.description, input.category ?? null, input.emoji ?? null,
        toCents(input.amount), input.paidBy, input.date ?? null, input.location ?? null,
        !!input.confirmed,
      ],
    );
    for (const s of input.splits) {
      // The payer's own share is auto-marked paid — they've fronted the
      // money so they don't owe themselves.
      const paid = s.memberId === input.paidBy;
      await q.query(
        `INSERT INTO expense_splits (expense_id, member_id, share_cents, paid)
         VALUES ($1, $2, $3, $4)`,
        [id, s.memberId, toCents(s.share), paid],
      );
    }
  });

  const row = await queryOne<ExpenseRow & { paid_by_name: string }>(
    `SELECT e.*, m.name AS paid_by_name
       FROM expenses e JOIN members m ON m.id = e.paid_by
      WHERE e.id = $1`,
    [id],
  );
  if (!row) throw new Error("createExpense: insert succeeded but lookup failed");
  return mapExpense(row, row.paid_by_name, await loadSplits(id));
}

export async function updateExpense(expenseId: string, updates: Partial<{
  description: string; category: string | null; emoji: string | null;
  amount: number; paidBy: string; date: string | null; location: string | null;
  confirmed: boolean;
}>): Promise<ExpenseDTO | null> {
  const fields: string[] = [];
  const values: (string | number | boolean | null)[] = [];
  const colMap: Record<string, string> = {
    amount: "amount_cents", paidBy: "paid_by", date: "date_label",
  };
  let p = 1;
  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined) continue;
    const col = colMap[k] ?? k;
    let value: string | number | boolean | null = v as string | null;
    if (k === "amount") value = toCents(v as number);
    fields.push(`${col} = $${p++}`);
    values.push(value);
  }
  if (fields.length === 0) return null;
  fields.push(`updated_at = NOW()`);
  values.push(expenseId);
  await query(
    `UPDATE expenses SET ${fields.join(", ")} WHERE id = $${p}`,
    values,
  );
  const row = await queryOne<ExpenseRow & { paid_by_name: string }>(
    `SELECT e.*, m.name AS paid_by_name
       FROM expenses e JOIN members m ON m.id = e.paid_by
      WHERE e.id = $1`,
    [expenseId],
  );
  return row ? mapExpense(row, row.paid_by_name, await loadSplits(expenseId)) : null;
}

export async function deleteExpense(expenseId: string): Promise<void> {
  await query(`DELETE FROM expenses WHERE id = $1`, [expenseId]);
}

export async function setSplitPaid(expenseId: string, memberId: string, paid: boolean): Promise<void> {
  await query(
    `UPDATE expense_splits SET paid = $1 WHERE expense_id = $2 AND member_id = $3`,
    [paid, expenseId, memberId],
  );
}

// ─── Balances ───────────────────────────────────────────────────────────────
// 1. paid   = sum of amounts each member actually paid out (expenses.paid_by)
// 2. owed   = sum of each member's share across every split they're in
// 3. net    = paid - owed
// 4. settlements: greedy match the biggest creditor to the biggest debtor

export async function getBalances(tripId: string): Promise<BalancesDTO> {
  const members = await listMembers(tripId);

  const paidRows = (await query<{ member_id: string; paid_cents: number }>(
    `SELECT paid_by AS member_id, COALESCE(SUM(amount_cents), 0)::bigint AS paid_cents
       FROM expenses WHERE trip_id = $1
      GROUP BY paid_by`,
    [tripId],
  )).rows;

  const owedRows = (await query<{ member_id: string; owed_cents: number }>(
    `SELECT s.member_id, COALESCE(SUM(s.share_cents), 0)::bigint AS owed_cents
       FROM expense_splits s JOIN expenses e ON e.id = s.expense_id
      WHERE e.trip_id = $1
      GROUP BY s.member_id`,
    [tripId],
  )).rows;

  const paidMap = new Map(paidRows.map((r) => [r.member_id, Number(r.paid_cents)]));
  const owedMap = new Map(owedRows.map((r) => [r.member_id, Number(r.owed_cents)]));

  const balances: MemberBalanceDTO[] = members.map((m) => {
    const paid = toDollars(paidMap.get(m.id) ?? 0);
    const owed = toDollars(owedMap.get(m.id) ?? 0);
    return { memberId: m.id, name: m.name, paid, owed, net: +(paid - owed).toFixed(2) };
  });

  const creditors = balances.filter((b) => b.net > 0.009).map((b) => ({ ...b, net: b.net }));
  const debtors = balances.filter((b) => b.net < -0.009).map((b) => ({ ...b, net: b.net }));
  creditors.sort((a, b) => b.net - a.net);
  debtors.sort((a, b) => a.net - b.net);

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

async function loadAttendees(eventId: string, q: Querier = { query, queryOne }): Promise<AttendeeDTO[]> {
  const rows = (await q.query<AttendeeRow>(
    `SELECT a.event_id, a.member_id, a.status, m.name
       FROM event_attendees a JOIN members m ON m.id = a.member_id
      WHERE a.event_id = $1`,
    [eventId],
  )).rows;
  return rows.map((r) => ({
    memberId: r.member_id, name: r.name, status: r.status as AttendanceStatus,
  }));
}

export async function listTimeline(tripId: string): Promise<DayScheduleDTO[]> {
  const days = (await query<DayRow>(
    `SELECT * FROM timeline_days WHERE trip_id = $1 ORDER BY day_number ASC`,
    [tripId],
  )).rows;

  const out: DayScheduleDTO[] = [];
  for (const d of days) {
    const events = (await query<EventRow>(
      `SELECT * FROM timeline_events WHERE day_id = $1
       ORDER BY created_at ASC, time ASC NULLS LAST, id ASC`,
      [d.id],
    )).rows;
    const mappedEvents: TimelineEventDTO[] = [];
    for (const e of events) {
      mappedEvents.push(mapEvent(e, await loadAttendees(e.id)));
    }

    const suggestions = (await query<SuggestionRow>(
      `SELECT * FROM suggestions WHERE trip_id = $1 AND day_id = $2 ORDER BY id ASC`,
      [tripId, d.id],
    )).rows.map(mapSuggestion);

    out.push({
      id: d.id, dayNumber: d.day_number, date: d.date_label, label: d.label,
      dayStartTime: d.day_start_time, dayEndTime: d.day_end_time,
      events: mappedEvents, suggestions,
    });
  }
  return out;
}

export async function addDay(tripId: string, input: {
  id?: string; dayNumber: number; date?: string | null; label?: string | null;
  dayStartTime?: string | null; dayEndTime?: string | null;
}): Promise<DayScheduleDTO> {
  const id = input.id ?? `day-${tripId}-${input.dayNumber}`;
  await query(
    `INSERT INTO timeline_days (id, trip_id, day_number, date_label, label, day_start_time, day_end_time)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      id, tripId, input.dayNumber, input.date ?? null, input.label ?? null,
      input.dayStartTime ?? null, input.dayEndTime ?? null,
    ],
  );
  return {
    id, dayNumber: input.dayNumber, date: input.date ?? null, label: input.label ?? null,
    dayStartTime: input.dayStartTime ?? null, dayEndTime: input.dayEndTime ?? null,
    events: [], suggestions: [],
  };
}

export async function addEvent(dayId: string, input: {
  id?: string; title: string; time?: string | null; endTime?: string | null;
  location?: string | null; emoji?: string | null; state?: EventState;
  votingCloses?: string | null; attendees?: { memberId: string; status?: AttendanceStatus }[];
}): Promise<TimelineEventDTO | null> {
  const id = input.id ?? `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  const dayRow = await queryOne<{ trip_id: string }>(
    `SELECT trip_id FROM timeline_days WHERE id = $1`,
    [dayId],
  );
  if (!dayRow) return null;

  await tx(async (q) => {
    await q.query(
      `INSERT INTO timeline_events
        (id, day_id, trip_id, title, time, end_time, location, emoji, state, voting_closes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id, dayId, dayRow.trip_id, input.title, input.time ?? null, input.endTime ?? null,
        input.location ?? null, input.emoji ?? null, input.state ?? "proposed",
        input.votingCloses ?? null,
      ],
    );
    if (input.attendees?.length) {
      for (const a of input.attendees) {
        await q.query(
          `INSERT INTO event_attendees (event_id, member_id, status)
           VALUES ($1, $2, $3)
           ON CONFLICT (event_id, member_id) DO NOTHING`,
          [id, a.memberId, a.status ?? "going"],
        );
      }
    }
  });

  const row = await queryOne<EventRow>(`SELECT * FROM timeline_events WHERE id = $1`, [id]);
  return row ? mapEvent(row, await loadAttendees(id)) : null;
}

export async function updateEvent(eventId: string, updates: Partial<{
  title: string; time: string | null; endTime: string | null; location: string | null;
  emoji: string | null; state: EventState; votingCloses: string | null;
}>): Promise<TimelineEventDTO | null> {
  const fields: string[] = [];
  const values: (string | number | boolean | null)[] = [];
  const colMap: Record<string, string> = { endTime: "end_time", votingCloses: "voting_closes" };
  let p = 1;
  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined) continue;
    fields.push(`${colMap[k] ?? k} = $${p++}`);
    values.push(v as string | null);
  }
  if (fields.length > 0) {
    fields.push(`updated_at = NOW()`);
    values.push(eventId);
    await query(
      `UPDATE timeline_events SET ${fields.join(", ")} WHERE id = $${p}`,
      values,
    );
  }
  const row = await queryOne<EventRow>(`SELECT * FROM timeline_events WHERE id = $1`, [eventId]);
  return row ? mapEvent(row, await loadAttendees(eventId)) : null;
}

export async function deleteEvent(eventId: string): Promise<void> {
  await query(`DELETE FROM timeline_events WHERE id = $1`, [eventId]);
}

export async function voteEvent(eventId: string, type: "for" | "against"): Promise<TimelineEventDTO | null> {
  const col = type === "for" ? "votes_for" : "votes_against";
  await query(
    `UPDATE timeline_events SET ${col} = ${col} + 1, updated_at = NOW() WHERE id = $1`,
    [eventId],
  );
  const row = await queryOne<EventRow>(`SELECT * FROM timeline_events WHERE id = $1`, [eventId]);
  return row ? mapEvent(row, await loadAttendees(eventId)) : null;
}

export async function setAttendeeStatus(
  eventId: string, memberId: string, status: AttendanceStatus,
): Promise<void> {
  await query(
    `INSERT INTO event_attendees (event_id, member_id, status)
     VALUES ($1, $2, $3)
     ON CONFLICT (event_id, member_id) DO UPDATE SET status = EXCLUDED.status`,
    [eventId, memberId, status],
  );
}

interface DiscussionRow {
  id: string;
  event_id: string;
  member_id: string;
  body: string;
  created_at: Date | string;
  author_name: string;
}

function mapDiscussionPost(r: DiscussionRow): EventDiscussionPostDTO {
  const created =
    r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at);
  return {
    id: r.id,
    eventId: r.event_id,
    memberId: r.member_id,
    authorName: r.author_name,
    body: r.body,
    createdAt: created,
  };
}

export async function listEventDiscussion(eventId: string): Promise<EventDiscussionPostDTO[]> {
  const rows = (await query<DiscussionRow>(
    `SELECT p.id, p.event_id, p.member_id, p.body, p.created_at, m.name AS author_name
     FROM event_discussion_posts p
     JOIN members m ON m.id = p.member_id
     WHERE p.event_id = $1
     ORDER BY p.created_at ASC`,
    [eventId],
  )).rows;
  return rows.map(mapDiscussionPost);
}

export async function addEventDiscussionPost(
  tripId: string,
  eventId: string,
  memberId: string,
  body: string,
): Promise<EventDiscussionPostDTO | null> {
  const trimmed = body.trim();
  if (!trimmed) return null;

  const ev = await queryOne<{ trip_id: string }>(
    `SELECT trip_id FROM timeline_events WHERE id = $1`,
    [eventId],
  );
  if (!ev || ev.trip_id !== tripId) return null;

  const mem = await queryOne<{ id: string }>(
    `SELECT id FROM members WHERE id = $1 AND trip_id = $2`,
    [memberId, tripId],
  );
  if (!mem) return null;

  const id = `disc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  await query(
    `INSERT INTO event_discussion_posts (id, event_id, trip_id, member_id, body)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, eventId, tripId, memberId, trimmed],
  );

  const row = await queryOne<DiscussionRow>(
    `SELECT p.id, p.event_id, p.member_id, p.body, p.created_at, m.name AS author_name
     FROM event_discussion_posts p
     JOIN members m ON m.id = p.member_id
     WHERE p.id = $1`,
    [id],
  );
  return row ? mapDiscussionPost(row) : null;
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

export async function listBudgetCategories(tripId: string): Promise<BudgetCategoryDTO[]> {
  const rows = (await query<BudgetCategoryRow>(
    `SELECT * FROM budget_categories WHERE trip_id = $1 ORDER BY created_at, id`,
    [tripId],
  )).rows;
  return rows.map(mapBudgetCategory);
}

export async function addBudgetCategory(tripId: string, input: {
  id?: string; name: string; estimate?: number; actual?: number;
  type?: "shared" | "optional"; icon?: string;
}): Promise<BudgetCategoryDTO> {
  const id = input.id ?? `cat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  await query(
    `INSERT INTO budget_categories (id, trip_id, name, estimate_cents, actual_cents, type, icon)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      id, tripId, input.name,
      toCents(input.estimate ?? 0), toCents(input.actual ?? 0),
      input.type ?? "shared", input.icon ?? "💸",
    ],
  );
  const row = await queryOne<BudgetCategoryRow>(
    `SELECT * FROM budget_categories WHERE id = $1`, [id],
  );
  if (!row) throw new Error("addBudgetCategory: insert succeeded but lookup failed");
  return mapBudgetCategory(row);
}

export async function updateBudgetCategory(categoryId: string, updates: Partial<{
  name: string; estimate: number; actual: number; type: "shared" | "optional"; icon: string;
}>): Promise<BudgetCategoryDTO | null> {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  const colMap: Record<string, string> = { estimate: "estimate_cents", actual: "actual_cents" };
  let p = 1;
  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined) continue;
    const col = colMap[k] ?? k;
    let value: string | number | null = v as string | null;
    if (k === "estimate" || k === "actual") value = toCents(v as number);
    fields.push(`${col} = $${p++}`);
    values.push(value);
  }
  if (fields.length === 0) return null;
  values.push(categoryId);
  await query(
    `UPDATE budget_categories SET ${fields.join(", ")} WHERE id = $${p}`,
    values,
  );
  const row = await queryOne<BudgetCategoryRow>(
    `SELECT * FROM budget_categories WHERE id = $1`, [categoryId],
  );
  return row ? mapBudgetCategory(row) : null;
}

export async function removeBudgetCategory(categoryId: string): Promise<void> {
  await query(`DELETE FROM budget_categories WHERE id = $1`, [categoryId]);
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

export async function listRules(tripId: string): Promise<TripRuleDTO[]> {
  const rows = (await query<RuleRow>(
    `SELECT * FROM rules WHERE trip_id = $1 ORDER BY created_at, id`,
    [tripId],
  )).rows;
  return rows.map(mapRule);
}

export async function addRule(tripId: string, input: {
  id?: string; title: string; items?: string[]; proposedBy?: string | null;
  votes?: number; totalVoters?: number;
}): Promise<TripRuleDTO> {
  const id = input.id ?? `rule-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  await query(
    `INSERT INTO rules (id, trip_id, title, items_json, proposed_by, votes, total_voters)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      id, tripId, input.title, JSON.stringify(input.items ?? []),
      input.proposedBy ?? null, input.votes ?? 0, input.totalVoters ?? 0,
    ],
  );
  const row = await queryOne<RuleRow>(`SELECT * FROM rules WHERE id = $1`, [id]);
  if (!row) throw new Error("addRule: insert succeeded but lookup failed");
  return mapRule(row);
}

export async function voteRule(ruleId: string): Promise<TripRuleDTO | null> {
  await query(
    `UPDATE rules SET votes = LEAST(total_voters, votes + 1) WHERE id = $1`,
    [ruleId],
  );
  const row = await queryOne<RuleRow>(`SELECT * FROM rules WHERE id = $1`, [ruleId]);
  return row ? mapRule(row) : null;
}

export async function removeRule(ruleId: string): Promise<void> {
  await query(`DELETE FROM rules WHERE id = $1`, [ruleId]);
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

export async function getDepositPolicy(tripId: string): Promise<DepositPolicyDTO | null> {
  const row = await queryOne<DepositPolicyRow>(
    `SELECT * FROM deposit_policies WHERE trip_id = $1`, [tripId],
  );
  return row ? mapDepositPolicy(row) : null;
}

export async function upsertDepositPolicy(tripId: string, input: {
  amount: number; dueDate?: string | null; covers?: string[];
  dropoutRule?: string | null; setBy?: string | null;
}): Promise<DepositPolicyDTO> {
  await query(
    `INSERT INTO deposit_policies (trip_id, amount_cents, due_date, covers_json, dropout_rule, set_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (trip_id) DO UPDATE SET
       amount_cents = EXCLUDED.amount_cents,
       due_date     = EXCLUDED.due_date,
       covers_json  = EXCLUDED.covers_json,
       dropout_rule = EXCLUDED.dropout_rule,
       set_by       = EXCLUDED.set_by`,
    [
      tripId, toCents(input.amount), input.dueDate ?? null,
      JSON.stringify(input.covers ?? []), input.dropoutRule ?? null, input.setBy ?? null,
    ],
  );
  const policy = await getDepositPolicy(tripId);
  if (!policy) throw new Error("upsertDepositPolicy: upsert succeeded but lookup failed");
  return policy;
}

export async function patchDepositPolicy(tripId: string, updates: Partial<{
  amount: number; dueDate: string | null; covers: string[];
  dropoutRule: string | null; setBy: string | null;
}>): Promise<DepositPolicyDTO | null> {
  const existing = await getDepositPolicy(tripId);
  if (!existing) return null;
  return upsertDepositPolicy(tripId, {
    amount: updates.amount ?? existing.amount,
    dueDate: updates.dueDate === undefined ? existing.dueDate : updates.dueDate,
    covers: updates.covers ?? existing.covers,
    dropoutRule: updates.dropoutRule === undefined ? existing.dropoutRule : updates.dropoutRule,
    setBy: updates.setBy === undefined ? existing.setBy : updates.setBy,
  });
}

export async function deleteDepositPolicy(tripId: string): Promise<void> {
  await query(`DELETE FROM deposit_policies WHERE trip_id = $1`, [tripId]);
}
