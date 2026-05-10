import { Link, useParams } from "react-router";
import {
  Calendar,
  Users,
  Settings,
  ArrowLeft,
  Plus,
  X,
  Clock,
  ChevronRight,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  Minus,
  Wallet,
  MapPin,
  UserPlus,
} from "lucide-react";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTripData } from "./TripDataContext";
import { AddExpenseSheet } from "./AddExpenseSheet";
import { TripOverviewSkeleton } from "./Skeletons";

const avatarColors: Record<string, string> = {
  S: "bg-[#007AFF]", M: "bg-[#34C759]", A: "bg-[#FF9F0A]",
  J: "bg-[#AF52DE]", T: "bg-[#FF6482]", C: "bg-[#5AC8FA]",
  D: "bg-[#FF9F0A]", R: "bg-[#007AFF]", L: "bg-[#34C759]",
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

type CoordinationEvent = {
  id: string;
  type: "expense_added" | "deposit_pending" | "payment_recorded" | "balance_generated" | "member_committed" | "proposal_created" | "vote_cast";
  actor: string;
  action: string;
  implication: string;
  timestamp: string;
  priority: "high" | "medium" | "low";
  resolved: boolean;
  linkTo?: string;
};

// Build a relative-time label from a date string (or "now"/"Yesterday" tokens
// that show up in expense.date). We keep it lightweight — the UI only needs
// "Today", "Yesterday", or a weekday/short date.
function shortTime(label: string | undefined): string {
  if (!label) return "Recent";
  if (/^now$/i.test(label) || /today/i.test(label)) return "Today";
  if (/yesterday/i.test(label)) return "Yesterday";
  return label.split(",")[0]; // e.g. "Saturday, Mar 15" → "Saturday"
}

function buildActivityFeed(
  trip: { participants: { id: string; name: string }[]; expenses: any[]; timeline: any[] },
  youName: string,
): CoordinationEvent[] {
  const events: CoordinationEvent[] = [];

  // Unconfirmed expenses → high-priority "needs review"
  for (const e of trip.expenses) {
    if (!e.confirmed) {
      const yourSplit = e.splitWith.find((s: any) => s.name === youName);
      const youOweAmt = yourSplit && !yourSplit.paid && e.paidBy !== youName ? yourSplit.share : 0;
      events.push({
        id: `pend-${e.id}`,
        type: "expense_added",
        actor: e.paidBy,
        action: `proposed "${e.description}"`,
        implication: youOweAmt > 0
          ? `Your share: $${youOweAmt.toFixed(0)} · needs your approval`
          : "Needs approval",
        timestamp: shortTime(e.date),
        priority: "high",
        resolved: false,
        linkTo: "/money",
      });
    }
  }

  // Confirmed expenses → "added expense" events
  for (const e of trip.expenses) {
    if (!e.confirmed) continue;
    const yourSplit = e.splitWith.find((s: any) => s.name === youName);
    const youPaid = e.paidBy === youName;
    const youOwe = yourSplit && !yourSplit.paid && !youPaid ? yourSplit.share : 0;
    const fullySettled = e.splitWith.every((s: any) => s.paid || s.name === e.paidBy);

    events.push({
      id: `exp-${e.id}`,
      type: youPaid && !fullySettled ? "balance_generated" : "expense_added",
      actor: e.paidBy === youName ? "You" : e.paidBy,
      action: `added ${e.emoji || ""} ${e.description}`.trim(),
      implication: youPaid
        ? fullySettled
          ? "Fully settled"
          : `$${(e.amount - (yourSplit?.share ?? 0)).toFixed(0)} owed to you`
        : youOwe > 0
        ? `You owe $${youOwe.toFixed(0)}`
        : "Settled",
      timestamp: shortTime(e.date),
      priority: youOwe > 0 ? "high" : "medium",
      resolved: youPaid ? fullySettled : !!yourSplit?.paid || youOwe === 0,
      linkTo: "/money",
    });
  }

  // Pending votes / proposals from the timeline
  for (const day of trip.timeline) {
    for (const evt of day.events ?? []) {
      if (evt.state === "voting" || evt.state === "proposed") {
        const total = (evt.votesFor ?? 0) + (evt.votesAgainst ?? 0);
        events.push({
          id: `vote-${evt.id}`,
          type: "proposal_created",
          actor: "Trip",
          action: `proposed ${evt.title}`,
          implication: total > 0 ? `${evt.votesFor ?? 0}/${total} votes in` : "Vote pending",
          timestamp: evt.time ?? "Pending",
          priority: "medium",
          resolved: false,
          linkTo: "/timeline",
        });
      }
    }
  }

  // Newly committed members
  for (const p of trip.participants) {
    if ((p as any).rsvp === "committed" && p.name !== youName) {
      events.push({
        id: `commit-${p.id}`,
        type: "member_committed",
        actor: p.name,
        action: "is in for the trip",
        implication: "RSVP confirmed",
        timestamp: "Recent",
        priority: "low",
        resolved: true,
      });
    }
  }

  // Sort: unresolved before resolved, then by priority
  const order = { high: 0, medium: 1, low: 2 } as const;
  events.sort((a, b) => {
    if (a.resolved !== b.resolved) return a.resolved ? 1 : -1;
    return order[a.priority] - order[b.priority];
  });

  return events.slice(0, 8);
}

export default function TripDashboard() {
  const { tripId } = useParams();
  const { trip, isLoading } = useTripData();
  const [showExpenseModal, setShowExpenseModal] = React.useState(false);

  const activityFeed = React.useMemo(
    () => buildActivityFeed(trip as any, "Sarah"),
    [trip]
  );

  // First paint guard: while the trip query is loading, render a skeleton so
  // the hero numbers don't flash zeroed state.
  if (isLoading && !trip.id) {
    return <TripOverviewSkeleton />;
  }

  const isPlanning = trip.phase === "planning" || trip.phase === "pre-trip";
  const isDuring = trip.phase === "during";
  const committedCount = trip.participants.filter((p) => p.rsvp === "committed").length;
  const totalParticipants = trip.participants.length;

  // Today's events from timeline
  const todayEvents = isDuring && trip.timeline.length > 1
    ? trip.timeline[1].events // Day 2 for Austin (during trip)
    : trip.timeline.length > 0
    ? trip.timeline[0].events
    : [];

  // Balance calculation
  const totalSpent = trip.expenses.filter((e) => e.confirmed).reduce((s, e) => s + e.amount, 0);
  const perPerson = totalParticipants > 0 ? Math.round(totalSpent / totalParticipants) : 0;
  const userOwed = isDuring
    ? [{ name: "Jordan", amount: 24 }, { name: "Taylor", amount: 18 }]
    : [];
  const userOwes: { name: string; amount: number }[] = [];
  const netBalance = userOwed.reduce((s, p) => s + p.amount, 0) - userOwes.reduce((s, p) => s + p.amount, 0);

  // Planning progress
  const planningSteps = [
    { label: "Set dates", done: !!trip.dates },
    { label: "Invite crew", done: trip.participants.length >= 2 },
    { label: "Get commitments", done: committedCount >= 2 },
    { label: "Set budget", done: trip.budgetCategories.length > 0 },
    { label: "Build timeline", done: trip.timeline.length > 0 },
  ];
  const planningDone = planningSteps.filter((s) => s.done).length;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 relative">
        <div className="flex items-center justify-between mb-5">
          <Link
            to="/"
            className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-all active:scale-95 text-[#007AFF]"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <Link
            to={`/trip/${tripId}/settings`}
            className="p-2 -mr-2 hover:bg-black/5 rounded-full transition-all active:scale-95 text-[#8E8E93]"
          >
            <Settings className="size-5" />
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[13px] text-[#8E8E93] font-medium mb-1">{getGreeting()}</p>
          <h1 className="text-[28px] font-semibold text-[#1C1C1E] tracking-tight leading-tight mb-1">
            {trip.emoji} {trip.name}
          </h1>
          <div className="flex items-center gap-3 text-[13px] text-[#8E8E93] font-medium">
            {trip.dates && <span>{trip.dates}</span>}
            {trip.dates && trip.destination && (
              <span className="size-1 rounded-full bg-[#D1D1D6]" />
            )}
            {trip.destination && <span>{trip.destination}</span>}
            {!trip.dates && !trip.destination && <span>New trip · Getting started</span>}
          </div>
        </motion.div>

        {/* Participant chips */}
        <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 -mx-6 px-6 no-scrollbar">
          {trip.participants.slice(0, 5).map((person) => (
            <div
              key={person.id}
              className={`size-9 rounded-full flex items-center justify-center text-white text-[13px] font-semibold ring-2 ring-[#F7F7F5] flex-shrink-0 ${
                avatarColors[person.avatar] || "bg-[#8E8E93]"
              }`}
              title={person.name}
            >
              {person.avatar}
            </div>
          ))}
          {totalParticipants > 5 && (
            <div className="size-9 rounded-full bg-[#F1F2F5] flex items-center justify-center text-[11px] font-semibold text-[#8E8E93] ring-2 ring-[#F7F7F5] flex-shrink-0">
              +{totalParticipants - 5}
            </div>
          )}
          {isPlanning && (
            <Link
              to={`/trip/${tripId}/planning`}
              className="size-9 rounded-full bg-[#EAF2FF] flex items-center justify-center ring-2 ring-[#F7F7F5] flex-shrink-0 active:scale-95 transition-transform"
            >
              <UserPlus className="size-4 text-[#007AFF]" />
            </Link>
          )}
        </div>
      </div>

      <div className="px-4 space-y-4 mt-2">
        {/* ─── PLANNING PHASE: Setup Progress ─────────────────────────────── */}
        {isPlanning && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[22px] p-5 shadow-[var(--shadow-apple-1)]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[17px] font-semibold text-[#1C1C1E]">Getting Started</h3>
              <span className="text-[12px] font-semibold text-[#007AFF] bg-[#EAF2FF] px-2.5 py-0.5 rounded-full">
                {planningDone}/{planningSteps.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-[#F1F2F5] rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(planningDone / planningSteps.length) * 100}%` }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="h-full bg-[#007AFF] rounded-full"
              />
            </div>

            <div className="space-y-2.5">
              {planningSteps.map((step) => (
                <div key={step.label} className="flex items-center gap-3">
                  <div
                    className={`size-5 rounded-full flex items-center justify-center ${
                      step.done
                        ? "bg-[#34C759] text-white"
                        : "bg-[#F1F2F5]"
                    }`}
                  >
                    {step.done && (
                      <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-[14px] ${
                      step.done ? "text-[#1C1C1E] font-medium" : "text-[#8E8E93]"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── PLANNING PHASE: Quick Actions ──────────────────────────────── */}
        {isPlanning && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-3"
          >
            <Link
              to={`/trip/${tripId}/planning`}
              className="flex items-center gap-4 bg-[#007AFF] text-white rounded-[18px] p-5 shadow-[0_4px_12px_rgba(0,122,255,0.25)] hover:opacity-95 transition-opacity active:scale-[0.98]"
            >
              <div className="size-10 rounded-[12px] bg-white/20 flex items-center justify-center">
                <ClipboardList className="size-5" />
              </div>
              <div className="text-left flex-1">
                <span className="font-semibold text-[15px]">Set Up Planning</span>
                <p className="text-[12px] opacity-80 mt-0.5">Invite members, set RSVPs & budget</p>
              </div>
              <ChevronRight className="size-4 opacity-60" />
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <Link
                to={`/trip/${tripId}/timeline`}
                className="bg-white rounded-[18px] p-4 shadow-[var(--shadow-apple-1)] hover:shadow-[var(--shadow-apple-2)] transition-all active:scale-[0.97] text-left group"
              >
                <div className="size-10 rounded-[12px] bg-[#EAF2FF] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Calendar className="size-5 text-[#007AFF]" />
                </div>
                <p className="text-[15px] font-semibold text-[#1C1C1E]">Build Timeline</p>
                <p className="text-[12px] text-[#8E8E93] mt-0.5">
                  {trip.timeline.length > 0
                    ? `${trip.timeline.length} day${trip.timeline.length !== 1 ? "s" : ""} planned`
                    : "Add events & activities"}
                </p>
              </Link>

              <Link
                to={`/trip/${tripId}/money`}
                className="bg-white rounded-[18px] p-4 shadow-[var(--shadow-apple-1)] hover:shadow-[var(--shadow-apple-2)] transition-all active:scale-[0.97] text-left group"
              >
                <div className="size-10 rounded-[12px] bg-[#E8F7EE] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Wallet className="size-5 text-[#34C759]" />
                </div>
                <p className="text-[15px] font-semibold text-[#1C1C1E]">Money</p>
                <p className="text-[12px] text-[#8E8E93] mt-0.5">
                  {trip.expenses.length > 0
                    ? `${trip.expenses.length} expenses`
                    : "No expenses yet"}
                </p>
              </Link>
            </div>
          </motion.div>
        )}

        {/* ─── ACTIVE TRIP: Today Card ────────────────────────────────────── */}
        {isDuring && todayEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              to={`/trip/${tripId}/timeline`}
              className="block bg-white rounded-[22px] p-5 shadow-[var(--shadow-apple-1)] hover:shadow-[var(--shadow-apple-2)] transition-shadow duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[17px] font-semibold text-[#1C1C1E]">Today</h3>
                  <p className="text-[13px] text-[#8E8E93] mt-0.5">Day 2 · March 16</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-[#007AFF]">Full schedule</span>
                  <ChevronRight className="size-3.5 text-[#007AFF]" />
                </div>
              </div>

              <div className="space-y-2.5">
                {todayEvents.slice(0, 4).map((evt) => (
                  <div key={evt.id} className="flex items-center gap-3">
                    <div
                      className={`size-10 rounded-[12px] flex items-center justify-center text-lg flex-shrink-0 ${
                        evt.state === "freetime"
                          ? "bg-[#F7F7F5]"
                          : evt.state === "voting" || evt.state === "proposed"
                          ? "bg-[#F1EEFF]"
                          : "bg-[#FFF3E0]"
                      }`}
                    >
                      {evt.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[15px] font-medium leading-tight truncate ${
                          evt.state === "freetime" ? "text-[#8E8E93]" : "text-[#1C1C1E]"
                        }`}
                      >
                        {evt.title}
                      </p>
                      <p className="text-[12px] text-[#8E8E93] mt-0.5">{evt.time}</p>
                    </div>
                    {evt.state === "confirmed" && evt.attendees && (
                      <span className="text-[11px] font-medium text-[#34C759] bg-[#E8F7EE] px-2 py-0.5 rounded-full">
                        {evt.attendees.length} going
                      </span>
                    )}
                    {(evt.state === "voting" || evt.state === "proposed") && (
                      <span className="text-[11px] font-semibold text-[#8E8EFA] bg-[#F1EEFF] px-2 py-0.5 rounded-full">
                        Vote
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Link>
          </motion.div>
        )}

        {/* ─── ACTIVE TRIP: Balance Snapshot ───────────────────────────────── */}
        {isDuring && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Link
              to={`/trip/${tripId}/money`}
              className="block bg-white rounded-[22px] p-5 shadow-[var(--shadow-apple-1)] hover:shadow-[var(--shadow-apple-2)] transition-shadow duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[17px] font-semibold text-[#1C1C1E]">Balance</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-[#007AFF]">Details</span>
                  <ChevronRight className="size-3.5 text-[#007AFF]" />
                </div>
              </div>

              <div className="flex items-end gap-6">
                <div className="flex-1">
                  <p className="text-[12px] text-[#8E8E93] font-medium uppercase tracking-wide mb-1">
                    {netBalance > 0 ? "You are owed" : netBalance < 0 ? "You owe" : "Your net"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[28px] font-semibold tracking-tight ${
                        netBalance > 0
                          ? "text-[#007AFF]"
                          : netBalance < 0
                          ? "text-[#FF9F0A]"
                          : "text-[#8E8E93]"
                      }`}
                    >
                      ${Math.abs(netBalance)}
                    </span>
                    {netBalance > 0 && <TrendingUp className="size-4 text-[#007AFF]" />}
                    {netBalance < 0 && <TrendingDown className="size-4 text-[#FF9F0A]" />}
                    {netBalance === 0 && <Minus className="size-4 text-[#8E8E93]" />}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-[#8E8E93] font-medium uppercase tracking-wide mb-1">
                    You spent
                  </p>
                  <p className="text-[17px] font-semibold text-[#1C1C1E]">${totalSpent}</p>
                </div>
              </div>

              {userOwed.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#F7F7F5]">
                  <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">Outstanding balances</p>
                  <div className="space-y-2">
                    {userOwed.map((person) => (
                      <div key={person.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="size-6 rounded-full bg-[#007AFF]/10 flex items-center justify-center text-[10px] font-semibold text-[#007AFF]">
                            {person.name[0]}
                          </div>
                          <span className="text-[13px] text-[#1C1C1E]">{person.name} owes you</span>
                        </div>
                        <span className="text-[13px] font-semibold text-[#007AFF]">
                          ${person.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Link>
          </motion.div>
        )}

        {/* ─── ACTIVE TRIP: Quick Actions ─────────────────────────────────── */}
        {isDuring && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            <button
              onClick={() => setShowExpenseModal(true)}
              className="bg-white rounded-[18px] p-4 shadow-[var(--shadow-apple-1)] hover:shadow-[var(--shadow-apple-2)] transition-all active:scale-[0.97] text-left group"
            >
              <div className="size-10 rounded-[12px] bg-[#E8F7EE] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Plus className="size-5 text-[#34C759]" />
              </div>
              <p className="text-[15px] font-semibold text-[#1C1C1E]">Add Expense</p>
              <p className="text-[12px] text-[#8E8E93] mt-0.5">Track spending</p>
            </button>

            <Link
              to={`/trip/${tripId}/planning`}
              className="bg-white rounded-[18px] p-4 shadow-[var(--shadow-apple-1)] hover:shadow-[var(--shadow-apple-2)] transition-all active:scale-[0.97] text-left group"
            >
              <div className="size-10 rounded-[12px] bg-[#F1EEFF] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ClipboardList className="size-5 text-[#8E8EFA]" />
              </div>
              <p className="text-[15px] font-semibold text-[#1C1C1E]">Planning</p>
              <p className="text-[12px] text-[#8E8E93] mt-0.5">RSVPs & budget</p>
            </Link>
          </motion.div>
        )}

        {/* ─── Activity Feed (real, derived from trip data) ───────────────── */}
        {activityFeed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h3 className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-3 px-1">
              Activity
            </h3>
            <div className="space-y-2">
              {activityFeed.map((event) => (
                <Link
                  key={event.id}
                  to={event.linkTo ? `/trip/${tripId}${event.linkTo}` : "#"}
                  className="flex items-start gap-3 bg-white rounded-[16px] p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[var(--shadow-apple-1)] transition-shadow active:scale-[0.99]"
                >
                  <div
                    className={`size-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                      event.type === "expense_added"
                        ? "bg-[#E8F7EE]"
                        : event.type === "proposal_created"
                        ? "bg-[#F1EEFF]"
                        : event.type === "vote_cast"
                        ? "bg-[#EAF2FF]"
                        : event.type === "deposit_pending"
                        ? "bg-[#FFF3E0]"
                        : "bg-[#F1F2F5]"
                    }`}
                  >
                    {event.type === "expense_added"
                      ? "💸"
                      : event.type === "proposal_created"
                      ? "✨"
                      : event.type === "vote_cast"
                      ? "👍"
                      : event.type === "deposit_pending"
                      ? "⏳"
                      : event.type === "payment_recorded"
                      ? "✅"
                      : "ℹ️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-[#1C1C1E] leading-snug">
                      <span className="font-semibold">{event.actor}</span>{" "}
                      <span className="text-[#3C3C43]">{event.action}</span>
                    </p>
                    <p
                      className={`text-[12px] mt-0.5 ${
                        event.priority === "high" ? "text-[#FF9F0A] font-medium" : "text-[#8E8E93]"
                      }`}
                    >
                      {event.implication}
                    </p>
                  </div>
                  <span className="text-[11px] text-[#C7C7CC] whitespace-nowrap flex-shrink-0 mt-0.5">
                    {event.timestamp}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showExpenseModal && (
          <AddExpenseSheet
            onClose={() => setShowExpenseModal(false)}
            participants={trip.participants.map((p) => p.name)}
            onSaved={() => setShowExpenseModal(false)}
            tripId={trip.id}
          />
        )}
      </AnimatePresence>
    </div>
  );
}