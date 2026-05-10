import React, { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Zap,
  MapPin,
  MessageCircle,
  X,
} from "lucide-react";

// ─── Avatar System ───────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: "#EAF2FF", text: "#007AFF" },
  { bg: "#E8F7EE", text: "#34C759" },
  { bg: "#FFF3E0", text: "#FF9F0A" },
  { bg: "#F1EEFF", text: "#8E8EFA" },
  { bg: "#FFE8EF", text: "#FF2D55" },
  { bg: "#E5F6FF", text: "#5AC8FA" },
];

function Avatar({ name, index, size = 24 }: { name: string; index: number; size?: number }) {
  const palette = AVATAR_PALETTE[index % AVATAR_PALETTE.length];
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: palette.bg,
        color: palette.text,
        fontSize: size * 0.38,
        fontWeight: 600,
      }}
      className="rounded-full ring-2 ring-white flex items-center justify-center flex-shrink-0"
    >
      {initials}
    </div>
  );
}

function AvatarStack({
  names,
  max = 4,
  size = 24,
}: {
  names: string[];
  max?: number;
  size?: number;
}) {
  const shown = names.slice(0, max);
  const overflow = names.length - max;
  return (
    <div className="flex items-center">
      <div className="flex -space-x-1.5">
        {shown.map((name, i) => (
          <Avatar key={name} name={name} index={i} size={size} />
        ))}
        {overflow > 0 && (
          <div
            style={{ width: size, height: size, fontSize: size * 0.34 }}
            className="rounded-full bg-[#F1F2F5] ring-2 ring-white flex items-center justify-center font-semibold text-[#8E8E93]"
          >
            +{overflow}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Status Chip ─────────────────────────────────────────────────────────────

type Phase = "planning" | "active" | "settling" | "past";

const PHASE_STYLES: Record<Phase, { bg: string; text: string; dot: string; label: string }> = {
  planning: { bg: "#EAF2FF", text: "#007AFF", dot: "#007AFF", label: "Planning" },
  active: { bg: "#E8F7EE", text: "#34C759", dot: "#34C759", label: "Active" },
  settling: { bg: "#FFF3E8", text: "#FF9F0A", dot: "#FF9F0A", label: "Settling Up" },
  past: { bg: "#F1F2F5", text: "#8E8E93", dot: "#C7C7CC", label: "Completed" },
};

function StatusChip({ phase }: { phase: Phase }) {
  const s = PHASE_STYLES[phase];
  return (
    <span
      style={{ backgroundColor: s.bg, color: s.text }}
      className="inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-[11px] font-semibold tracking-wide flex-shrink-0"
    >
      <span
        style={{ backgroundColor: s.dot }}
        className={`size-[5px] rounded-full ${phase === "active" ? "animate-pulse" : ""}`}
      />
      {s.label}
    </span>
  );
}

// ─── Signal Types (Tier 3) ────────────────────────────────────────────────────

type SignalVariant =
  | { type: "next-event"; label: string; time: string }
  | { type: "budget"; spent: number; total: number }
  | { type: "you-owe"; amount: number; expensesCount?: number }
  | { type: "owed-to-you"; amount: number; pendingCount: number }
  | { type: "rsvp"; committed: number; pending: number; total: number }
  | { type: "deposit-due"; deadline: string; amount: number; paid: number; total: number }
  | { type: "open-decisions"; count: number; examples?: string[] }
  | { type: "no-budget" }
  | { type: "all-settled" }
  | { type: "payments-pending"; count: number }
  | { type: "new-expense"; minutesAgo: number; who: string }
  | { type: "expenses-today"; count: number };

function Signal({ signal }: { signal: SignalVariant }) {
  switch (signal.type) {
    case "next-event":
      return (
        <div className="flex items-center gap-2">
          <div className="size-[30px] rounded-[9px] bg-[#EAF2FF] flex items-center justify-center flex-shrink-0">
            <Clock className="size-[14px] text-[#007AFF]" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#1C1C1E]">{signal.label}</p>
            <p className="text-[11px] text-[#8E8E93] mt-px">{signal.time}</p>
          </div>
        </div>
      );

    case "budget": {
      const pct = Math.round((signal.spent / signal.total) * 100);
      const isOver = signal.spent > signal.total;
      const barColor = isOver ? "#FF3B30" : pct > 85 ? "#FF9F0A" : "#007AFF";
      return (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-medium text-[#8E8E93]">
              <span className="text-[#1C1C1E]">${signal.spent.toLocaleString()}</span>
              {" "}of ${signal.total.toLocaleString()} spent
            </span>
            <span
              style={{ color: isOver ? "#FF3B30" : pct > 85 ? "#FF9F0A" : "#34C759" }}
              className="text-[11px] font-semibold"
            >
              {pct}%
            </span>
          </div>
          <div className="h-[5px] bg-[#F1F2F5] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(pct, 100)}%` }}
              transition={{ duration: 0.7, delay: 0.15 }}
              style={{ backgroundColor: barColor }}
              className="h-full rounded-full"
            />
          </div>
        </div>
      );
    }

    case "you-owe":
      return (
        <div className="flex items-center gap-2">
          <div className="size-[30px] rounded-[9px] bg-[#FFE8EF] flex items-center justify-center flex-shrink-0">
            <DollarSign className="size-[14px] text-[#FF2D55]" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#1C1C1E]">
              You owe{" "}
              <span className="text-[#FF2D55]">${signal.amount}</span>
            </p>
            {signal.expensesCount && (
              <p className="text-[11px] text-[#8E8E93] mt-px">
                {signal.expensesCount} expense{signal.expensesCount > 1 ? "s" : ""} added today
              </p>
            )}
          </div>
        </div>
      );

    case "owed-to-you":
      return (
        <div className="flex items-center gap-2">
          <div className="size-[30px] rounded-[9px] bg-[#E8F7EE] flex items-center justify-center flex-shrink-0">
            <TrendingUp className="size-[14px] text-[#34C759]" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#1C1C1E]">
              You're owed{" "}
              <span className="text-[#34C759]">${signal.amount}</span>
            </p>
            <p className="text-[11px] text-[#8E8E93] mt-px">
              {signal.pendingCount} {signal.pendingCount === 1 ? "person" : "people"} still owe
            </p>
          </div>
        </div>
      );

    case "rsvp": {
      const pending = signal.pending;
      return (
        <div className="flex items-center gap-2">
          <div className="size-[30px] rounded-[9px] bg-[#EAF2FF] flex items-center justify-center flex-shrink-0">
            <Users className="size-[14px] text-[#007AFF]" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#1C1C1E]">
              {signal.committed} of {signal.total} confirmed
            </p>
            {pending > 0 && (
              <p className="text-[11px] text-[#8E8E93] mt-px">
                {pending} {pending === 1 ? "person" : "people"} still need to respond
              </p>
            )}
          </div>
        </div>
      );
    }

    case "deposit-due": {
      const remaining = signal.total - signal.paid;
      return (
        <div className="flex items-center gap-2">
          <div className="size-[30px] rounded-[9px] bg-[#FFF3E0] flex items-center justify-center flex-shrink-0">
            <AlertCircle className="size-[14px] text-[#FF9F0A]" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#1C1C1E]">
              Deposit due{" "}
              <span className="text-[#FF9F0A]">{signal.deadline}</span>
            </p>
            <p className="text-[11px] text-[#8E8E93] mt-px">
              {signal.paid}/{signal.total} paid · ${signal.amount}/person
            </p>
          </div>
        </div>
      );
    }

    case "open-decisions":
      return (
        <div className="flex items-center gap-2">
          <div className="size-[30px] rounded-[9px] bg-[#F1EEFF] flex items-center justify-center flex-shrink-0">
            <MessageCircle className="size-[14px] text-[#8E8EFA]" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#1C1C1E]">
              {signal.count} open decision{signal.count > 1 ? "s" : ""}
            </p>
            {signal.examples && signal.examples.length > 0 && (
              <p className="text-[11px] text-[#8E8E93] mt-px truncate max-w-[200px]">
                {signal.examples[0]}
              </p>
            )}
          </div>
        </div>
      );

    case "no-budget":
      return (
        <div className="flex items-center gap-2">
          <div className="size-[30px] rounded-[9px] bg-[#F7F7F5] flex items-center justify-center flex-shrink-0">
            <DollarSign className="size-[14px] text-[#C7C7CC]" />
          </div>
          <p className="text-[13px] text-[#8E8E93]">
            Budget not set yet
          </p>
        </div>
      );

    case "all-settled":
      return (
        <div className="flex items-center gap-2">
          <div className="size-[30px] rounded-[9px] bg-[#E8F7EE] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="size-[14px] text-[#34C759]" />
          </div>
          <p className="text-[13px] font-medium text-[#34C759]">All settled</p>
        </div>
      );

    case "payments-pending":
      return (
        <div className="flex items-center gap-2">
          <div className="size-[30px] rounded-[9px] bg-[#FFF3E0] flex items-center justify-center flex-shrink-0">
            <Clock className="size-[14px] text-[#FF9F0A]" />
          </div>
          <p className="text-[13px] font-medium text-[#1C1C1E]">
            <span className="text-[#FF9F0A]">{signal.count}</span>{" "}
            payment{signal.count > 1 ? "s" : ""} pending
          </p>
        </div>
      );

    case "new-expense":
      return (
        <div className="flex items-center gap-2">
          <div className="size-[30px] rounded-[9px] bg-[#F1EEFF] flex items-center justify-center flex-shrink-0">
            <Zap className="size-[14px] text-[#8E8EFA]" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#1C1C1E]">New expense logged</p>
            <p className="text-[11px] text-[#8E8E93] mt-px">
              {signal.who} · {signal.minutesAgo}m ago
            </p>
          </div>
        </div>
      );

    case "expenses-today":
      return (
        <div className="flex items-center gap-2">
          <div className="size-[30px] rounded-[9px] bg-[#EAF2FF] flex items-center justify-center flex-shrink-0">
            <DollarSign className="size-[14px] text-[#007AFF]" />
          </div>
          <p className="text-[13px] font-medium text-[#1C1C1E]">
            <span className="text-[#007AFF]">{signal.count}</span>{" "}
            expense{signal.count > 1 ? "s" : ""} added today
          </p>
        </div>
      );

    default:
      return null;
  }
}

// ─── Trip Card ────────────────────────────────────────────────────────────────

type TripCardProps = {
  emoji: string;
  name: string;
  dates: string;
  phase: Phase;
  participants: string[];
  signal: SignalVariant;
  /** visual only top accent bar */
  accentBar?: boolean;
};

function TripCard({
  emoji,
  name,
  dates,
  phase,
  participants,
  signal,
  accentBar,
}: TripCardProps) {
  const PHASE_BAR: Partial<Record<Phase, string>> = {
    active: "from-[#34C759] to-[#34C759]/30",
    planning: "from-[#007AFF] to-[#007AFF]/30",
    settling: "from-[#FF9F0A] to-[#FF9F0A]/30",
  };

  return (
    <div className="bg-white rounded-[22px] overflow-hidden shadow-[var(--shadow-apple-1)] hover:shadow-[var(--shadow-apple-2)] transition-all duration-300 active:scale-[0.98] group cursor-pointer">
      {/* Top accent bar */}
      {accentBar && PHASE_BAR[phase] && (
        <div className={`h-[3px] bg-gradient-to-r ${PHASE_BAR[phase]}`} />
      )}

      <div className="p-5">
        {/* Tier 1 — Identity */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-[14px] bg-[#F7F7F5] flex items-center justify-center text-[22px] group-hover:scale-105 transition-transform">
              {emoji}
            </div>
            <div>
              <h3 className="text-[17px] font-semibold text-[#1C1C1E] leading-snug">{name}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <Calendar className="size-[11px] text-[#C7C7CC]" />
                <p className="text-[12px] text-[#8E8E93]">{dates}</p>
              </div>
            </div>
          </div>
          <StatusChip phase={phase} />
        </div>

        {/* Tier 2 — Context */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AvatarStack names={participants} max={4} size={24} />
            <span className="text-[12px] text-[#8E8E93]">
              {participants.length} {participants.length === 1 ? "person" : "people"}
            </span>
          </div>
          <ChevronRight className="size-4 text-[#C7C7CC] group-hover:text-[#8E8E93] transition-colors" />
        </div>

        {/* Divider */}
        <div className="h-px bg-[#F1F2F5] mb-4" />

        {/* Tier 3 — One key signal */}
        <Signal signal={signal} />
      </div>
    </div>
  );
}

// ─── Compact Past Card ────────────────────────────────────────────────────────

function PastSignal({ signal }: { signal: SignalVariant }) {
  switch (signal.type) {
    case "all-settled":
      return (
        <div className="flex items-center gap-1">
          <CheckCircle2 className="size-[13px] text-[#34C759]" />
          <span className="text-[12px] font-medium text-[#34C759]">All settled</span>
        </div>
      );
    case "payments-pending":
      return (
        <span className="text-[12px] font-medium text-[#FF9F0A]">
          {signal.count} payment{signal.count > 1 ? "s" : ""} pending
        </span>
      );
    case "owed-to-you":
      return (
        <div className="flex items-center gap-1">
          <TrendingUp className="size-[13px] text-[#34C759]" />
          <span className="text-[12px] font-medium text-[#34C759]">
            Owed ${signal.amount}
          </span>
        </div>
      );
    case "you-owe":
      return (
        <span className="text-[12px] font-medium text-[#FF2D55]">
          You owe ${signal.amount}
        </span>
      );
    default:
      return null;
  }
}

function PastCard({
  emoji,
  name,
  dates,
  participants,
  signal,
}: Omit<TripCardProps, "phase" | "accentBar">) {
  return (
    <div className="bg-white/70 rounded-[18px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-white transition-all active:scale-[0.99] cursor-pointer">
      <div className="p-4">
        {/* Row 1 — name + chevron */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-[12px] bg-[#F7F7F5] flex items-center justify-center text-lg flex-shrink-0">
            {emoji}
          </div>
          <h3 className="text-[15px] font-medium text-[#1C1C1E] leading-snug flex-1 min-w-0">
            {name}
          </h3>
          <ChevronRight className="size-4 text-[#C7C7CC] flex-shrink-0" />
        </div>

        {/* Row 2 — dates · avatars · signal */}
        <div className="flex items-center justify-between mt-2 pl-[52px]">
          <div className="flex items-center gap-2">
            <p className="text-[12px] text-[#8E8E93] whitespace-nowrap">{dates}</p>
            <span className="text-[#E5E5EA] text-[10px]">·</span>
            <AvatarStack names={participants} max={3} size={18} />
          </div>
          <PastSignal signal={signal} />
        </div>
      </div>
    </div>
  );
}

// ─── Variant Label ────────────────────────────────────────────────────────────

function VariantLabel({ signal, note }: { signal: string; note?: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 px-1">
      <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-widest">
        {signal}
      </span>
      {note && (
        <span className="text-[11px] text-[#C7C7CC]">— {note}</span>
      )}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  phase,
  description,
}: {
  phase: Phase;
  description: string;
}) {
  const COLORS: Record<Phase, { accent: string; label: string }> = {
    planning: { accent: "#007AFF", label: "Planning" },
    active: { accent: "#34C759", label: "Active" },
    settling: { accent: "#FF9F0A", label: "Settling Up" },
    past: { accent: "#8E8E93", label: "Completed" },
  };
  const c = COLORS[phase];
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1">
        <div
          style={{ backgroundColor: c.accent }}
          className="size-[6px] rounded-full"
        />
        <h2 className="text-[13px] font-semibold uppercase tracking-widest"
          style={{ color: c.accent }}
        >
          {c.label}
        </h2>
      </div>
      <p className="text-[13px] text-[#8E8E93] pl-[14px]">{description}</p>
    </div>
  );
}

// ─── Anatomy Legend ───────────────────────────────────────────────────────────

function AnatomyLegend() {
  const tiers = [
    {
      label: "Tier 1 · Identity",
      items: ["Trip name", "Dates", "Status chip"],
      color: "#007AFF",
    },
    {
      label: "Tier 2 · Context",
      items: ["Participant avatars", "People count"],
      color: "#34C759",
    },
    {
      label: "Tier 3 · One key signal",
      items: [
        "Changes based on trip phase",
        "Answers: why open this trip now?",
      ],
      color: "#FF9F0A",
    },
  ];

  return (
    <div className="bg-white rounded-[18px] p-4 shadow-[var(--shadow-apple-1)] mb-8">
      <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-widest mb-3">
        Card anatomy
      </p>
      <div className="space-y-3">
        {tiers.map((t) => (
          <div key={t.label} className="flex items-start gap-3">
            <div
              style={{ backgroundColor: t.color }}
              className="size-[6px] rounded-full mt-[5px] flex-shrink-0"
            />
            <div>
              <p className="text-[12px] font-semibold text-[#1C1C1E]">{t.label}</p>
              <p className="text-[11px] text-[#8E8E93] mt-px">{t.items.join(" · ")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PEOPLE = {
  austin: ["Jake M.", "Sara L.", "Chris T.", "Maya R.", "Tom W.", "Jen K."],
  beach: ["Alex P.", "Jordan S.", "Riley B.", "Casey D."],
  cabin: ["Noah F.", "Lily C.", "Ethan Z.", "Ava H.", "Luca M.", "Mia T.", "Ben W.", "Zoe Q."],
};

export default function TripCardTest() {
  const [highlightedTier, setHighlightedTier] = useState<1 | 2 | 3 | null>(null);

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[#F7F7F5] no-scrollbar">
      {/* Header */}
      <div className="px-5 pt-14 pb-2">
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/"
            className="size-9 rounded-full bg-white shadow-[var(--shadow-apple-1)] flex items-center justify-center hover:shadow-[var(--shadow-apple-2)] transition-shadow"
          >
            <ArrowLeft className="size-4 text-[#8E8E93]" />
          </Link>
          <div>
            <p className="text-[12px] text-[#8E8E93] font-medium">Design Exploration</p>
            <h1 className="text-[22px] font-semibold text-[#1C1C1E] tracking-tight">
              Trip Card Variants
            </h1>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-[14px] text-[#8E8E93] mb-6 leading-relaxed">
          Each card uses a fixed Tier 1–2 structure, but the Tier 3 signal adapts to phase. 
          The goal: help the user recognise the right trip fast and know <em>why to open it now</em>.
        </p>

        <AnatomyLegend />
      </div>

      {/* ── Planning Cards ── */}
      <div className="px-5 pb-4">
        <SectionHeader
          phase="planning"
          description="Budget spend doesn't apply. Show what's unresolved or needs action."
        />

        <div className="space-y-6">
          <div>
            <VariantLabel signal="RSVP status" note="most common planning signal" />
            <TripCard
              emoji="🏖️"
              name="Beach Weekend"
              dates="Apr 5–7, 2026"
              phase="planning"
              participants={PEOPLE.beach}
              accentBar
              signal={{
                type: "rsvp",
                committed: 4,
                pending: 2,
                total: 6,
              }}
            />
          </div>

          <div>
            <VariantLabel signal="Deposit urgency" note="when deadline is within a week" />
            <TripCard
              emoji="🏖️"
              name="Beach Weekend"
              dates="Apr 5–7, 2026"
              phase="planning"
              participants={PEOPLE.beach}
              accentBar
              signal={{
                type: "deposit-due",
                deadline: "Friday",
                amount: 150,
                paid: 3,
                total: 6,
              }}
            />
          </div>

          <div>
            <VariantLabel signal="Open decisions" note="when voting or debate is active" />
            <TripCard
              emoji="🏖️"
              name="Beach Weekend"
              dates="Apr 5–7, 2026"
              phase="planning"
              participants={PEOPLE.beach}
              signal={{
                type: "open-decisions",
                count: 3,
                examples: ["Where should we stay?"],
              }}
            />
          </div>

          <div>
            <VariantLabel signal="No budget set" note="default empty state" />
            <TripCard
              emoji="🏖️"
              name="Beach Weekend"
              dates="Apr 5–7, 2026"
              phase="planning"
              participants={PEOPLE.beach}
              signal={{ type: "no-budget" }}
            />
          </div>
        </div>
      </div>

      {/* ── Active Cards ── */}
      <div className="px-5 py-4">
        <SectionHeader
          phase="active"
          description="Trip is happening now. Prioritise what's next or what needs money attention."
        />

        <div className="space-y-6">
          <div>
            <VariantLabel signal="Next event" note="best when itinerary is built out" />
            <TripCard
              emoji="📍"
              name="Austin Trip"
              dates="Mar 15–18, 2026"
              phase="active"
              participants={PEOPLE.austin}
              accentBar
              signal={{
                type: "next-event",
                label: "Dinner at Franklin BBQ",
                time: "Tonight · 7:00 PM",
              }}
            />
          </div>

          <div>
            <VariantLabel signal="Budget progress" note="only when a budget goal is set" />
            <TripCard
              emoji="📍"
              name="Austin Trip"
              dates="Mar 15–18, 2026"
              phase="active"
              participants={PEOPLE.austin}
              accentBar
              signal={{
                type: "budget",
                spent: 910,
                total: 2400,
              }}
            />
          </div>

          <div>
            <VariantLabel signal="Budget — over limit" note="shows red state" />
            <TripCard
              emoji="📍"
              name="Austin Trip"
              dates="Mar 15–18, 2026"
              phase="active"
              participants={PEOPLE.austin}
              accentBar
              signal={{
                type: "budget",
                spent: 2610,
                total: 2400,
              }}
            />
          </div>

          <div>
            <VariantLabel signal="You owe" note="high urgency — unsettled split" />
            <TripCard
              emoji="📍"
              name="Austin Trip"
              dates="Mar 15–18, 2026"
              phase="active"
              participants={PEOPLE.austin}
              accentBar
              signal={{
                type: "you-owe",
                amount: 36,
                expensesCount: 4,
              }}
            />
          </div>

          <div>
            <VariantLabel signal="New expense" note="social / coordination signal" />
            <TripCard
              emoji="📍"
              name="Austin Trip"
              dates="Mar 15–18, 2026"
              phase="active"
              participants={PEOPLE.austin}
              signal={{
                type: "new-expense",
                who: "Jake M.",
                minutesAgo: 12,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Settling Up Cards ── */}
      <div className="px-5 py-4">
        <SectionHeader
          phase="settling"
          description="Trip is over but money isn't resolved. Show settlement status clearly."
        />

        <div className="space-y-6">
          <div>
            <VariantLabel signal="Owed to you" note="positive — you're a creditor" />
            <TripCard
              emoji="📍"
              name="Austin Trip"
              dates="Mar 15–18, 2026"
              phase="settling"
              participants={PEOPLE.austin}
              accentBar
              signal={{
                type: "owed-to-you",
                amount: 68,
                pendingCount: 3,
              }}
            />
          </div>

          <div>
            <VariantLabel signal="You owe" note="action required — you're a debtor" />
            <TripCard
              emoji="📍"
              name="Austin Trip"
              dates="Mar 15–18, 2026"
              phase="settling"
              participants={PEOPLE.austin}
              accentBar
              signal={{
                type: "you-owe",
                amount: 42,
              }}
            />
          </div>

          <div>
            <VariantLabel signal="Payments pending" note="generic — can't determine role" />
            <TripCard
              emoji="📍"
              name="Austin Trip"
              dates="Mar 15–18, 2026"
              phase="settling"
              participants={PEOPLE.austin}
              signal={{
                type: "payments-pending",
                count: 2,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Past Cards ── */}
      <div className="px-5 py-4 pb-24">
        <SectionHeader
          phase="past"
          description="Compact row style — recognition over information density."
        />

        <p className="text-[12px] text-[#8E8E93] mb-4 pl-[14px]">
          Past trips use a reduced layout — smaller, less visual weight, faster to scan.
        </p>

        <div className="space-y-2.5">
          <div>
            <VariantLabel signal="All settled" />
            <PastCard
              emoji="⛰️"
              name="Mountain Cabin"
              dates="Feb 10–12, 2026"
              participants={PEOPLE.cabin}
              signal={{ type: "all-settled" }}
            />
          </div>

          <div>
            <VariantLabel signal="Still settling" note="1 payment left" />
            <PastCard
              emoji="🎿"
              name="Ski Weekend"
              dates="Jan 3–5, 2026"
              participants={["Tom W.", "Jen K.", "Sara L.", "Chris T."]}
              signal={{ type: "payments-pending", count: 1 }}
            />
          </div>

          <div>
            <VariantLabel signal="You're owed" note="money still outstanding" />
            <PastCard
              emoji="🏕️"
              name="Camping Trip"
              dates="Dec 14–16, 2025"
              participants={["Lily C.", "Noah F.", "Ava H."]}
              signal={{ type: "owed-to-you", amount: 24, pendingCount: 1 }}
            />
          </div>
        </div>

        {/* Side-by-side note */}
        <div className="mt-8 bg-white/60 rounded-[18px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <p className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">
            Design note
          </p>
          <p className="text-[13px] text-[#6E6E73] leading-relaxed">
            The Tier 3 signal answers one question:{" "}
            <span className="text-[#1C1C1E] font-medium">
              "Why would I open this trip right now?"
            </span>{" "}
            Budget is one possible answer — not the default. The signal should be the most decision-relevant snapshot for that specific trip at that moment.
          </p>
        </div>
      </div>
    </div>
  );
}