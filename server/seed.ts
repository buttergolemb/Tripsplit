// Seeds the database with the prototype's original trip content so the UI
// keeps the same data on first boot. Idempotent: re-running nukes the
// relevant trips first, then re-inserts.

import { applySchema, query, tx, type Querier, closePool } from "./db";
import * as repo from "./repo";

async function resetTrip(q: Querier, tripId: string) {
  await q.query(`DELETE FROM trips WHERE id = $1`, [tripId]);
}

async function seedAustin() {
  await tx(async (q) => { await resetTrip(q, "austin"); });

  await repo.createTrip({
    id: "austin",
    name: "Austin Trip",
    emoji: "📍",
    dates: "Mar 15–18, 2026",
    destination: "Austin, TX",
    phase: "during",
  });

  // Members — keep the mock IDs so any pre-existing links line up.
  const members = [
    { id: "1", name: "Sarah",  role: "Trip Organizer",   rsvp: "committed",  depositPaid: true  },
    { id: "2", name: "Mike",   role: "Lodging Lead",     rsvp: "committed",  depositPaid: true  },
    { id: "3", name: "Alex",   role: "Budget Lead",      rsvp: "committed",  depositPaid: true  },
    { id: "4", name: "Jordan", role: "Activities Lead",  rsvp: "committed",  depositPaid: false },
    { id: "5", name: "Taylor", role: "member",               rsvp: "likely",     depositPaid: false },
    { id: "6", name: "Casey",  role: "member",               rsvp: "interested", depositPaid: false },
  ] as const;
  for (const m of members) {
    await repo.addMember("austin", { ...m, avatar: m.name[0] });
  }

  const allMembers = await repo.listMembers("austin");
  const byName = new Map(allMembers.map((m) => [m.name, m.id] as const));
  const memId = (name: string) => {
    const id = byName.get(name);
    if (!id) throw new Error(`seed: unknown member ${name}`);
    return id;
  };

  // ─── Days ──────────────────────────────────────────────────────────────
  const day1 = await repo.addDay("austin", { id: "day-austin-1", dayNumber: 1, date: "Mar 15", label: "Arrival",   dayStartTime: "2:00 PM",  dayEndTime: "11:00 PM" });
  const day2 = await repo.addDay("austin", { id: "day-austin-2", dayNumber: 2, date: "Mar 16", label: "Explore",   dayStartTime: "9:00 AM",  dayEndTime: "11:00 PM" });
  const day3 = await repo.addDay("austin", { id: "day-austin-3", dayNumber: 3, date: "Mar 17", label: "Adventure", dayStartTime: "8:00 AM",  dayEndTime: "11:30 PM" });
  const day4 = await repo.addDay("austin", { id: "day-austin-4", dayNumber: 4, date: "Mar 18", label: "Departure", dayStartTime: "9:00 AM",  dayEndTime: "5:00 PM"  });

  // ─── Events ────────────────────────────────────────────────────────────
  await repo.addEvent(day1.id, { id: "e1", title: "Land at AUS",            time: "2:30 PM", endTime: "3:30 PM", emoji: "✈️", state: "confirmed", attendees: ["Sarah","Mike","Alex","Jordan"].map((n) => ({ memberId: memId(n), status: "going" })) });
  await repo.addEvent(day1.id, { id: "e2", title: "Check into Airbnb",      time: "4:00 PM", endTime: "5:00 PM", location: "Downtown Austin", emoji: "🏠", state: "confirmed", attendees: ["Sarah","Mike"].map((n) => ({ memberId: memId(n), status: "going" })) });
  await repo.addEvent(day1.id, { id: "ft1", title: "Free Time",             time: "5:00 PM", endTime: "7:00 PM", emoji: "⏳", state: "freetime" });
  await repo.addEvent(day1.id, { id: "e3", title: "Dinner at Franklin BBQ", time: "7:00 PM", endTime: "9:00 PM", location: "Franklin Barbecue", emoji: "🍖", state: "voting", votingCloses: "in 4 hours", attendees: ["Sarah","Mike","Alex"].map((n) => ({ memberId: memId(n), status: "going" })) });
  await query(`UPDATE timeline_events SET votes_for = 5, votes_against = 1 WHERE id = 'e3'`);

  await repo.addEvent(day2.id, { id: "e4", title: "Breakfast at Veracruz", time: "10:30 AM", endTime: "11:30 AM", location: "Veracruz All Natural", emoji: "🌮", state: "confirmed", attendees: ["Sarah","Mike"].map((n) => ({ memberId: memId(n), status: "going" })) });
  await repo.addEvent(day2.id, { id: "e5", title: "Barton Springs Pool",   time: "1:00 PM",  endTime: "4:00 PM",  location: "Zilker Park", emoji: "🏊", state: "proposed", votingCloses: "tonight", attendees: ["Sarah","Mike"].map((n) => ({ memberId: memId(n), status: "going" })) });
  await query(`UPDATE timeline_events SET votes_for = 3, votes_against = 1 WHERE id = 'e5'`);

  await repo.addEvent(day3.id, { id: "e6", title: "Zilker Park Hike",      time: "9:00 AM",  endTime: "12:00 PM", location: "Zilker Park Trails", emoji: "🥾", state: "confirmed", attendees: [{ memberId: memId("Sarah"), status: "going" }, { memberId: memId("Alex"), status: "going" }, { memberId: memId("Jordan"), status: "maybe" }] });
  await repo.addEvent(day3.id, { id: "ft2", title: "Free Time",            time: "12:00 PM", endTime: "3:00 PM", emoji: "⏳", state: "freetime" });
  await repo.addEvent(day3.id, { id: "e7", title: "6th Street Night Out",  time: "8:00 PM",  endTime: "11:30 PM", location: "6th Street District", emoji: "🎸", state: "voting", votingCloses: "in 12 hours", attendees: [{ memberId: memId("Sarah"), status: "going" }, { memberId: memId("Mike"), status: "going" }, { memberId: memId("Alex"), status: "going" }, { memberId: memId("Taylor"), status: "maybe" }] });
  await query(`UPDATE timeline_events SET votes_for = 4, votes_against = 0 WHERE id = 'e7'`);

  await repo.addEvent(day4.id, { id: "e8", title: "Pack & Checkout", time: "10:00 AM", endTime: "11:00 AM", location: "Airbnb", emoji: "🧳", state: "confirmed", attendees: ["Sarah","Mike"].map((n) => ({ memberId: memId(n), status: "going" })) });
  await repo.addEvent(day4.id, { id: "e9", title: "Fly Home",        time: "3:00 PM",  endTime: "5:00 PM", emoji: "✈️", state: "confirmed", attendees: ["Sarah","Mike","Alex"].map((n) => ({ memberId: memId(n), status: "going" })) });

  // ─── Suggestions ──────────────────────────────────────────────────────
  const suggestions: [string, string, string, string, string, string, string, string, string, string | null][] = [
    ["s1", "austin", day1.id, "Paddleboarding on Lady Bird Lake", "Activity", "5 min away",         "🚣", "0.2 mi", "Lady Bird Lake",     null],
    ["s2", "austin", day1.id, "South Congress Shopping",          "Shopping", "Matches group vibe", "🛍️", "1.5 mi", "South Congress Ave", null],
    ["s3", "austin", day2.id, "Live Music at Stubb's",            "Music",    "Tonight's show",     "🎸", "0.8 mi", "Stubb's Bar-B-Q",   "20:00"],
  ];
  for (const s of suggestions) {
    await query(
      `INSERT INTO suggestions (id, trip_id, day_id, title, category, reason, emoji, distance, location, suggested_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      s,
    );
  }

  // ─── Expenses ──────────────────────────────────────────────────────────
  // Keep the exact amounts/splits from the prototype so balances match.
  await repo.createExpense("austin", { id: "exp1", description: "Airbnb (3 nights)",     category: "Lodging",    emoji: "🏠", amount: 540, paidBy: memId("Sarah"),  date: "Mar 15", confirmed: true,  splits: ["Sarah","Mike","Alex","Jordan","Taylor","Casey"].map((n) => ({ memberId: memId(n), share: 90 })) });
  await repo.createExpense("austin", { id: "exp2", description: "Gas to Austin",         category: "Gas",        emoji: "⛽", amount: 68,  paidBy: memId("Mike"),   date: "Mar 15", confirmed: true,  splits: ["Sarah","Mike","Alex","Jordan"].map((n) => ({ memberId: memId(n), share: 17 })) });
  await repo.createExpense("austin", { id: "exp3", description: "Franklin BBQ",          category: "Food",       emoji: "🍖", amount: 180, paidBy: memId("Sarah"),  date: "Mar 15", confirmed: true,  splits: ["Sarah","Mike","Alex","Jordan","Taylor","Casey"].map((n) => ({ memberId: memId(n), share: 30 })) });
  await repo.createExpense("austin", { id: "exp4", description: "Torchy's Tacos",        category: "Food",       emoji: "🌮", amount: 92,  paidBy: memId("Alex"),   date: "Mar 16", confirmed: true,  splits: ["Sarah","Mike","Alex","Jordan"].map((n) => ({ memberId: memId(n), share: 23 })) });
  await repo.createExpense("austin", { id: "exp5", description: "Gas Return",            category: "Gas",        emoji: "⛽", amount: 65,  paidBy: memId("Mike"),   date: "Mar 16", confirmed: true,  splits: ["Sarah","Mike","Alex","Jordan"].map((n) => ({ memberId: memId(n), share: 16.25 })) });
  await repo.createExpense("austin", { id: "exp6", description: "6th Street Bar Crawl",  category: "Activities", emoji: "🎸", amount: 145, paidBy: memId("Jordan"), date: "Mar 17", confirmed: true,  splits: ["Sarah","Mike","Alex","Jordan"].map((n) => ({ memberId: memId(n), share: 36.25 })) });
  await repo.createExpense("austin", { id: "exp7", description: "Snacks & Drinks",       category: "Other",      emoji: "🛒", amount: 42,  paidBy: memId("Taylor"), date: "Mar 17", confirmed: false, splits: ["Sarah","Mike","Alex","Jordan","Taylor","Casey"].map((n) => ({ memberId: memId(n), share: 7 })) });
}

async function seedBeach() {
  await tx(async (q) => { await resetTrip(q, "beach"); });

  await repo.createTrip({
    id: "beach",
    name: "Beach Weekend",
    emoji: "🏖️",
    dates: "Apr 5–7, 2026",
    destination: "Galveston, TX",
    phase: "planning",
  });
  await repo.addMember("beach", { name: "Sarah", role: "Trip Organizer", rsvp: "committed" });
}

async function main() {
  await applySchema();
  await seedAustin();
  await seedBeach();

  const trips = await repo.listTrips();
  const austinMembers = await repo.listMembers("austin");
  const austinExpenses = await repo.listExpenses("austin");
  const bal = await repo.getBalances("austin");

  console.log("[seed] done.");
  console.log(`[seed] trips:    ${trips.length}`);
  console.log(`[seed] austin:   members=${austinMembers.length}  expenses=${austinExpenses.length}`);
  console.log(`[seed] balances (austin):`);
  for (const b of bal.balances) {
    console.log(`         ${b.name.padEnd(8)} paid=$${b.paid.toFixed(2).padStart(7)}  owed=$${b.owed.toFixed(2).padStart(7)}  net=$${b.net.toFixed(2)}`);
  }
}

main()
  .catch((err) => {
    console.error("[seed] failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
