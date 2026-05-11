// TripSplit API server — Express + Postgres.
// Run with `npm run server`. In dev, Vite proxies /api here (port 4000).

import express from "express";
import cors from "cors";
import { z } from "zod";
import { applySchema, databaseHost, query as dbQuery } from "./db";
import * as repo from "./repo";
import type {
  AttendanceStatus, EventState, RSVPStatus, TripPhase,
} from "./types";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Small wrapper so async handlers don't need try/catch everywhere.
type AsyncHandler = (req: express.Request, res: express.Response) => Promise<unknown> | unknown;
const h = (fn: AsyncHandler): express.RequestHandler => (req, res, next) => {
  Promise.resolve(fn(req, res)).catch(next);
};

app.get("/api/health", h(async (_req, res) => {
  // A trivial query confirms DATABASE_URL points at a reachable Postgres.
  await dbQuery("SELECT 1");
  res.json({ ok: true, db: databaseHost() });
}));

// ─── Trips ──────────────────────────────────────────────────────────────────

app.get("/api/trips", h(async (_req, res) => {
  res.json(await repo.listTrips());
}));

app.get("/api/trips/:id", h(async (req, res) => {
  const trip = await repo.getTrip(req.params.id);
  if (!trip) return res.status(404).json({ error: "Trip not found" });
  res.json(trip);
}));

const createTripSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  emoji: z.string().nullable().optional(),
  destination: z.string().nullable().optional(),
  dates: z.string().nullable().optional(),
  phase: z.enum(["planning", "pre-trip", "during", "post-trip", "complete"]).optional(),
});

app.post("/api/trips", h(async (req, res) => {
  const input = createTripSchema.parse(req.body);
  const trip = await repo.createTrip(input);
  res.status(201).json(trip);
}));

const updateTripSchema = createTripSchema.partial().omit({ id: true });

app.patch("/api/trips/:id", h(async (req, res) => {
  const updates = updateTripSchema.parse(req.body);
  const trip = await repo.updateTrip(req.params.id, updates as Partial<{
    name: string; emoji: string | null; destination: string | null;
    dates: string | null; phase: TripPhase;
  }>);
  if (!trip) return res.status(404).json({ error: "Trip not found" });
  res.json(trip);
}));

// ─── Members ────────────────────────────────────────────────────────────────

const addMemberSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  avatar: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  rsvp: z.enum(["committed", "likely", "interested", "declined", "pending"]).optional(),
  depositPaid: z.boolean().optional(),
});

app.post("/api/trips/:id/members", h(async (req, res) => {
  const input = addMemberSchema.parse(req.body);
  const member = await repo.addMember(req.params.id, input);
  res.status(201).json(member);
}));

const updateMemberSchema = z.object({
  name: z.string().optional(),
  avatar: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  rsvp: z.enum(["committed", "likely", "interested", "declined", "pending"]).optional(),
  depositPaid: z.boolean().optional(),
});

app.patch("/api/trips/:id/members/:memberId", h(async (req, res) => {
  const updates = updateMemberSchema.parse(req.body);
  const member = await repo.updateMember(req.params.memberId, updates as Partial<{
    name: string; avatar: string | null; role: string | null;
    rsvp: RSVPStatus; depositPaid: boolean;
  }>);
  if (!member) return res.status(404).json({ error: "Member not found" });
  res.json(member);
}));

app.delete("/api/trips/:id/members/:memberId", h(async (req, res) => {
  await repo.removeMember(req.params.memberId);
  res.status(204).end();
}));

// ─── Expenses ───────────────────────────────────────────────────────────────

app.get("/api/trips/:id/expenses", h(async (req, res) => {
  res.json(await repo.listExpenses(req.params.id));
}));

const createExpenseSchema = z.object({
  description: z.string().min(1),
  category: z.string().nullable().optional(),
  emoji: z.string().nullable().optional(),
  amount: z.number().positive(),
  paidBy: z.string().min(1),
  date: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  confirmed: z.boolean().optional(),
  splits: z.array(z.object({ memberId: z.string(), share: z.number().min(0) })).min(1),
});

app.post("/api/trips/:id/expenses", h(async (req, res) => {
  const input = createExpenseSchema.parse(req.body);
  const expense = await repo.createExpense(req.params.id, input);
  res.status(201).json(expense);
}));

const updateExpenseSchema = z.object({
  description: z.string().min(1).optional(),
  category: z.string().nullable().optional(),
  emoji: z.string().nullable().optional(),
  amount: z.number().positive().optional(),
  paidBy: z.string().min(1).optional(),
  date: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  confirmed: z.boolean().optional(),
});

app.patch("/api/trips/:id/expenses/:expenseId", h(async (req, res) => {
  const updates = updateExpenseSchema.parse(req.body);
  const exp = await repo.updateExpense(req.params.expenseId, updates);
  if (!exp) return res.status(404).json({ error: "Expense not found" });
  res.json(exp);
}));

app.delete("/api/trips/:id/expenses/:expenseId", h(async (req, res) => {
  await repo.deleteExpense(req.params.expenseId);
  res.status(204).end();
}));

app.patch("/api/trips/:id/expenses/:expenseId/splits/:memberId",
  h(async (req, res) => {
    const { paid } = z.object({ paid: z.boolean() }).parse(req.body);
    await repo.setSplitPaid(req.params.expenseId, req.params.memberId, paid);
    res.json({ ok: true });
  })
);

// ─── Balances ───────────────────────────────────────────────────────────────

app.get("/api/trips/:id/balances", h(async (req, res) => {
  res.json(await repo.getBalances(req.params.id));
}));

// ─── Timeline ───────────────────────────────────────────────────────────────

app.get("/api/trips/:id/timeline", h(async (req, res) => {
  res.json(await repo.listTimeline(req.params.id));
}));

const addDaySchema = z.object({
  id: z.string().optional(),
  dayNumber: z.number().int().positive(),
  date: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
  dayStartTime: z.string().nullable().optional(),
  dayEndTime: z.string().nullable().optional(),
});

app.post("/api/trips/:id/days", h(async (req, res) => {
  const input = addDaySchema.parse(req.body);
  res.status(201).json(await repo.addDay(req.params.id, input));
}));

const addEventSchema = z.object({
  id: z.string().optional(),
  dayId: z.string().min(1),
  title: z.string().min(1),
  time: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  emoji: z.string().nullable().optional(),
  state: z.enum(["proposed", "voting", "confirmed", "freetime"]).optional(),
  votingCloses: z.string().nullable().optional(),
  attendees: z.array(z.object({
    memberId: z.string(),
    status: z.enum(["going", "maybe", "declined"]).optional(),
  })).optional(),
});

app.post("/api/trips/:id/events", h(async (req, res) => {
  const { dayId, ...rest } = addEventSchema.parse(req.body);
  const event = await repo.addEvent(dayId, rest);
  if (!event) return res.status(500).json({ error: "Failed to create event" });
  res.status(201).json(event);
}));

const updateEventSchema = z.object({
  title: z.string().optional(),
  time: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  emoji: z.string().nullable().optional(),
  state: z.enum(["proposed", "voting", "confirmed", "freetime"]).optional(),
  votingCloses: z.string().nullable().optional(),
});

app.patch("/api/trips/:id/events/:eventId", h(async (req, res) => {
  const updates = updateEventSchema.parse(req.body);
  const event = await repo.updateEvent(req.params.eventId, updates as Partial<{
    title: string; time: string | null; endTime: string | null; location: string | null;
    emoji: string | null; state: EventState; votingCloses: string | null;
  }>);
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json(event);
}));

app.delete("/api/trips/:id/events/:eventId", h(async (req, res) => {
  await repo.deleteEvent(req.params.eventId);
  res.status(204).end();
}));

app.post("/api/trips/:id/events/:eventId/vote", h(async (req, res) => {
  const { type } = z.object({ type: z.enum(["for", "against"]) }).parse(req.body);
  const event = await repo.voteEvent(req.params.eventId, type);
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json(event);
}));

app.put("/api/trips/:id/events/:eventId/attendees/:memberId", h(async (req, res) => {
  const { status } = z.object({
    status: z.enum(["going", "maybe", "declined"]),
  }).parse(req.body);
  await repo.setAttendeeStatus(req.params.eventId, req.params.memberId, status as AttendanceStatus);
  res.json({ ok: true });
}));

// ─── Budget categories ──────────────────────────────────────────────────────

const budgetCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  estimate: z.number().min(0).optional(),
  actual: z.number().min(0).optional(),
  type: z.enum(["shared", "optional"]).optional(),
  icon: z.string().optional(),
});

app.get("/api/trips/:id/budget", h(async (req, res) => {
  res.json(await repo.listBudgetCategories(req.params.id));
}));

app.post("/api/trips/:id/budget", h(async (req, res) => {
  const input = budgetCategorySchema.parse(req.body);
  res.status(201).json(await repo.addBudgetCategory(req.params.id, input));
}));

const budgetUpdateSchema = budgetCategorySchema.partial().omit({ id: true });

app.patch("/api/trips/:id/budget/:categoryId", h(async (req, res) => {
  const updates = budgetUpdateSchema.parse(req.body);
  const cat = await repo.updateBudgetCategory(req.params.categoryId, updates);
  if (!cat) return res.status(404).json({ error: "Category not found" });
  res.json(cat);
}));

app.delete("/api/trips/:id/budget/:categoryId", h(async (req, res) => {
  await repo.removeBudgetCategory(req.params.categoryId);
  res.status(204).end();
}));

// ─── Rules ──────────────────────────────────────────────────────────────────

const ruleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  items: z.array(z.string()).optional(),
  proposedBy: z.string().nullable().optional(),
  votes: z.number().int().min(0).optional(),
  totalVoters: z.number().int().min(0).optional(),
});

app.get("/api/trips/:id/rules", h(async (req, res) => {
  res.json(await repo.listRules(req.params.id));
}));

app.post("/api/trips/:id/rules", h(async (req, res) => {
  const input = ruleSchema.parse(req.body);
  res.status(201).json(await repo.addRule(req.params.id, input));
}));

app.post("/api/trips/:id/rules/:ruleId/vote", h(async (req, res) => {
  const rule = await repo.voteRule(req.params.ruleId);
  if (!rule) return res.status(404).json({ error: "Rule not found" });
  res.json(rule);
}));

app.delete("/api/trips/:id/rules/:ruleId", h(async (req, res) => {
  await repo.removeRule(req.params.ruleId);
  res.status(204).end();
}));

// ─── Deposit policy ─────────────────────────────────────────────────────────

const depositPolicySchema = z.object({
  amount: z.number().min(0),
  dueDate: z.string().nullable().optional(),
  covers: z.array(z.string()).optional(),
  dropoutRule: z.string().nullable().optional(),
  setBy: z.string().nullable().optional(),
});

app.get("/api/trips/:id/deposit-policy", h(async (req, res) => {
  const policy = await repo.getDepositPolicy(req.params.id);
  if (!policy) return res.status(404).json({ error: "No policy set" });
  res.json(policy);
}));

app.put("/api/trips/:id/deposit-policy", h(async (req, res) => {
  const input = depositPolicySchema.parse(req.body);
  res.json(await repo.upsertDepositPolicy(req.params.id, input));
}));

app.patch("/api/trips/:id/deposit-policy", h(async (req, res) => {
  const updates = depositPolicySchema.partial().parse(req.body);
  const policy = await repo.patchDepositPolicy(req.params.id, updates);
  if (!policy) return res.status(404).json({ error: "No policy set" });
  res.json(policy);
}));

app.delete("/api/trips/:id/deposit-policy", h(async (req, res) => {
  await repo.deleteDepositPolicy(req.params.id);
  res.status(204).end();
}));

// ─── Error handling ─────────────────────────────────────────────────────────

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: "Validation error", issues: err.issues });
  }
  console.error("[api] error", err);
  const msg = err instanceof Error ? err.message : "Internal error";
  res.status(500).json({ error: msg });
});

// ─── Boot ───────────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT ?? 4000);

async function bootstrap() {
  await applySchema();
  app.listen(PORT, async () => {
    console.log(`[tripsplit] api ready on http://localhost:${PORT}  (db: ${databaseHost()})`);
    try {
      const result = await dbQuery<{ n: number }>(`SELECT COUNT(*)::int AS n FROM trips`);
      const tripCount = result.rows[0]?.n ?? 0;
      if (tripCount === 0) {
        console.log(`[tripsplit] database is empty — run 'npm run seed' to populate sample data.`);
      }
    } catch (err) {
      console.warn("[tripsplit] could not check trip count:", err);
    }
  });
}

bootstrap().catch((err) => {
  console.error("[tripsplit] failed to start:", err);
  process.exit(1);
});
