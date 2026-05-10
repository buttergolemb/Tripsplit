import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  ChevronDown,
  DollarSign,
  Users,
  Calendar,
  Edit3,
  Check,
  PartyPopper,
  Sparkles,
  X,
  Plus,
  Trash2,
  UserPlus,
} from "lucide-react";
import React from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "motion/react";
import { useTripData, type RSVPStatus } from "./TripDataContext";
import { BottomSheet } from "./BottomSheet";

// ─── Constants ──────────────────────────────────────────────────────────────

const avatarColors: Record<string, string> = {
  S: "bg-[#007AFF]", M: "bg-[#34C759]", A: "bg-[#FF9F0A]",
  J: "bg-[#AF52DE]", T: "bg-[#FF6482]", C: "bg-[#5AC8FA]",
  D: "bg-[#FF9F0A]", R: "bg-[#007AFF]", L: "bg-[#34C759]",
  B: "bg-[#FF6482]", K: "bg-[#5AC8FA]", N: "bg-[#AF52DE]",
};

const CURRENT_USER = "Sarah";

const rsvpOptions: { value: RSVPStatus; label: string; color: string; bg: string }[] = [
  { value: "committed", label: "Committed", color: "text-[#34C759]", bg: "bg-[#E8F7EE]" },
  { value: "likely", label: "Likely", color: "text-[#FF9F0A]", bg: "bg-[#FFF3E0]" },
  { value: "interested", label: "Interested", color: "text-[#8E8E93]", bg: "bg-[#F1F2F5]" },
  { value: "declined", label: "Declined", color: "text-[#FF3B30]", bg: "bg-[#FFE5E5]" },
];

const budgetTemplates = [
  { name: "Lodging", icon: "🏠", type: "shared" as const },
  { name: "Gas & Transport", icon: "⛽", type: "shared" as const },
  { name: "Food & Dining", icon: "🍽️", type: "shared" as const },
  { name: "Activities", icon: "🎟️", type: "optional" as const },
  { name: "Groceries", icon: "🛒", type: "shared" as const },
  { name: "Drinks & Nightlife", icon: "🍺", type: "optional" as const },
];

const CATEGORY_EMOJIS = [
  "🏠", "⛽", "🍽️", "🎟️", "🛒", "🍕", "🏖️", "✈️", "🚗", "🎵",
  "🏕️", "🗺️", "📸", "🛍️", "🍺", "🎲", "🌊", "💊", "🎭", "☕",
  "🏋️", "⛷️", "🎸", "🧴", "🌮", "🍦", "🎉", "🏓", "🚢", "📦",
];

// Quick starter rules for one-tap add
const STARTER_RULES = [
  { title: "Split shared meals evenly", items: ["All group meals split equally among attendees"] },
  { title: "Optional activities are opt-in", items: ["Only pay for activities you join", "No pressure to participate"] },
  { title: "Confirm before booking anything", items: ["Get group approval before committing to paid activities", "Share costs upfront before booking"] },
  { title: "Venmo payments due within 48 hours", items: ["Settle up within 48 hours of expense", "Use agreed payment method"] },
];

function getRSVPStyle(rsvp: RSVPStatus) {
  return rsvpOptions.find((o) => o.value === rsvp) || rsvpOptions[2];
}

function formatCurrency(n: number) {
  return `$${Math.round(n).toLocaleString()}`;
}

// ─── Scroll lock hook ───────────────────────────────────────────────────────

function useBodyScrollLock(locked: boolean) {
  React.useEffect(() => {
    if (!locked) return;
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}

// ─── Swipe-to-Delete Row ─────────────────────────────────────────────────────

function SwipeableRow({
  onDelete,
  disabled,
  children,
}: {
  onDelete: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const x = useMotionValue(0);
  const [deleting, setDeleting] = React.useState(false);
  const DELETE_THRESHOLD = -72;

  const revealOpacity = useTransform(x, [0, -28, DELETE_THRESHOLD], [0, 0.45, 1]);
  const trashScale = useTransform(x, [0, DELETE_THRESHOLD], [0.6, 1]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const shouldDelete = info.offset.x < DELETE_THRESHOLD || info.velocity.x < -500;
    if (shouldDelete) {
      setDeleting(true);
      animate(x, -340, { duration: 0.18, ease: "easeIn" }).then(() => onDelete());
    } else {
      animate(x, 0, { type: "spring", stiffness: 500, damping: 36 } as Parameters<typeof animate>[2]);
    }
  };

  if (disabled) return <>{children}</>;

  return (
    <div className="relative rounded-[14px] overflow-hidden">
      {/* Red delete zone revealed behind the sliding card */}
      <motion.div
        style={{ opacity: revealOpacity }}
        className="absolute inset-0 bg-[#FF3B30] flex items-center justify-end px-5 rounded-[14px]"
      >
        <motion.div style={{ scale: trashScale }}>
          <Trash2 className="size-[18px] text-white" />
        </motion.div>
      </motion.div>

      {/* Draggable card */}
      <motion.div
        drag={deleting ? false : "x"}
        dragConstraints={{ left: DELETE_THRESHOLD, right: 0 }}
        dragElastic={{ left: 0.12, right: 0.04 }}
        style={{ x }}
        onDragEnd={handleDragEnd}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function PlanningPhase() {
  const { tripId } = useParams();
  const {
    trip,
    addParticipant,
    removeParticipant,
    updateRSVP,
    markDepositPaid,
    setDepositPolicy,
    updateDepositPolicy,
    clearDepositPolicy,
    addBudgetCategory,
    updateBudgetEstimate,
    updateBudgetCategory,
    removeBudgetCategory,
    addRule,
    voteOnRule,
  } = useTripData();

  // Local UI state
  const [editingBudgetId, setEditingBudgetId] = React.useState<string | null>(null);
  const [editingValue, setEditingValue] = React.useState("");
  const [rsvpDropdownId, setRsvpDropdownId] = React.useState<string | null>(null);
  const [showDepositConfirm, setShowDepositConfirm] = React.useState<string | null>(null);
  const [justCelebrated, setJustCelebrated] = React.useState<Set<string>>(new Set());
  const [showAddMember, setShowAddMember] = React.useState(false);
  // Policy editor state
  const [showPolicyEditor, setShowPolicyEditor] = React.useState(false);
  const [policyDraft, setPolicyDraft] = React.useState<{
    amount: string; dueDate: string;
    covers: string[];
    dropoutRule: string;
  }>({ amount: "", dueDate: "", covers: [], dropoutRule: "Late dropouts forfeit 50% deposit" });
  const [newMemberName, setNewMemberName] = React.useState("");
  const [showAddBudget, setShowAddBudget] = React.useState(false);
  // Budget category sheet state
  const [editCategoryId, setEditCategoryId] = React.useState<string | null>(null);
  const [editDraftName, setEditDraftName] = React.useState("");
  const [editDraftIcon, setEditDraftIcon] = React.useState("📦");
  const [editDraftType, setEditDraftType] = React.useState<"shared" | "optional">("shared");
  const [customName, setCustomName] = React.useState("");
  const [customIcon, setCustomIcon] = React.useState("📦");
  const [customType, setCustomType] = React.useState<"shared" | "optional">("shared");
  const [customEstimate, setCustomEstimate] = React.useState("");
  const [showEmojiGrid, setShowEmojiGrid] = React.useState(false);
  const [showAddRule, setShowAddRule] = React.useState(false);
  const [newRuleTitle, setNewRuleTitle] = React.useState("");
  const [newRuleItems, setNewRuleItems] = React.useState("");
  const [showAllRules, setShowAllRules] = React.useState(false);

  // Phase-aware section defaults — order: RSVP → Rules → Budget → Deposits
  const isActive = trip.phase === "during" || trip.phase === "post-trip";
  const [expandedSections, setExpandedSections] = React.useState(() => {
    if (isActive) return { rsvp: false, rules: false, budget: true, deposits: false };
    return { rsvp: true, rules: false, budget: false, deposits: false };
  });

  useBodyScrollLock(!!showDepositConfirm);

  // Close RSVP dropdown on outside click
  React.useEffect(() => {
    if (!rsvpDropdownId) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-rsvp-dropdown]")) setRsvpDropdownId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [rsvpDropdownId]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // ─── Derived ──────────────────────────────────────────────────────────────

  const { participants, budgetCategories, rules } = trip;
  const committedCount = participants.filter((p) => p.rsvp === "committed").length;
  const nonDeclined = participants.filter((p) => p.rsvp !== "declined");
  const allCommitted = nonDeclined.length > 1 && committedCount === nonDeclined.length;
  const eligibleForDeposit = participants.filter((p) => p.rsvp === "committed" || p.rsvp === "likely");
  const paidDepositsCount = eligibleForDeposit.filter((p) => p.depositPaid).length;
  const allDepositsPaid = eligibleForDeposit.length > 0 && eligibleForDeposit.every((p) => p.depositPaid);

  const totalEstimate = budgetCategories.reduce((sum, cat) => sum + cat.estimate, 0);
  const totalActual = budgetCategories.reduce((sum, cat) => sum + cat.actual, 0);
  const participantCount = Math.max(nonDeclined.length, 1);

  const checklistItems = [
    { id: "dates",      label: "Dates confirmed",           complete: !!trip.dates },
    { id: "members",    label: "Invite crew (2+ people)",   complete: participants.length >= 2 },
    { id: "majority",   label: "Majority committed",        complete: committedCount >= Math.ceil(participants.length / 2) },
    { id: "rules",      label: "Rules proposed",            complete: rules.length > 0 },
    { id: "budget",     label: "Budget estimate defined",   complete: budgetCategories.length > 0 },
    { id: "policy",     label: "Set deposit policy",        complete: !!trip.depositPolicy },
    { id: "alldeposits",label: "All deposits collected",    complete: allDepositsPaid },
  ];
  const completedChecklist = checklistItems.filter((i) => i.complete).length;
  const allChecklistDone = completedChecklist === checklistItems.length;

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    addParticipant(newMemberName.trim());
    setNewMemberName("");
    setShowAddMember(false);
  };

  const handleMarkDepositPaid = (personId: string) => {
    markDepositPaid(personId);
    setShowDepositConfirm(null);
    // Celebration check
    const updated = participants.map((p) => (p.id === personId ? { ...p, depositPaid: true } : p));
    const eligible = updated.filter((p) => p.rsvp === "committed" || p.rsvp === "likely");
    if (eligible.every((p) => p.depositPaid) && !justCelebrated.has("alldeposits")) {
      setJustCelebrated((prev) => new Set(prev).add("alldeposits"));
    }
  };

  const handleUpdateRSVP = (personId: string, status: RSVPStatus) => {
    updateRSVP(personId, status);
    setRsvpDropdownId(null);
  };

  const saveBudgetEdit = (categoryId: string) => {
    const newValue = parseFloat(editingValue);
    if (!isNaN(newValue) && newValue >= 0) {
      updateBudgetEstimate(categoryId, newValue);
    }
    setEditingBudgetId(null);
    setEditingValue("");
  };

  const handleAddBudgetFromTemplate = (template: (typeof budgetTemplates)[0]) => {
    addBudgetCategory({
      name: template.name,
      icon: template.icon,
      type: template.type,
      estimate: 0,
      actual: 0,
    });
  };

  const handleAddRule = () => {
    if (!newRuleTitle.trim() || !newRuleItems.trim()) return;
    addRule({
      title: newRuleTitle.trim(),
      items: newRuleItems.split("\n").filter((l) => l.trim()),
      proposedBy: CURRENT_USER,
      votes: 1,
      totalVoters: participantCount,
    });
    setNewRuleTitle("");
    setNewRuleItems("");
    setShowAddRule(false);
  };

  // ─── Phase Config ─────────────────────────────────────────────────────────

  const phaseConfig = {
    planning: { label: "Planning Phase", color: "text-[#007AFF]", bg: "bg-[#EAF2FF]", icon: "📋" },
    "pre-trip": { label: "Pre-Trip", color: "text-[#FF9F0A]", bg: "bg-[#FFF3E0]", icon: "⏳" },
    during: { label: "Trip Active", color: "text-[#34C759]", bg: "bg-[#E8F7EE]", icon: "🚀" },
    "post-trip": { label: "Post-Trip", color: "text-[#8E8E93]", bg: "bg-[#F1F2F5]", icon: "📊" },
    complete: { label: "Complete", color: "text-[#8E8E93]", bg: "bg-[#F1F2F5]", icon: "✅" },
  };
  const phase = phaseConfig[trip.phase];

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-6 pt-14 pb-2">
        <div className="flex items-center justify-between mb-4">
          <Link
            to={`/trip/${tripId}`}
            className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-all active:scale-95"
          >
            <ArrowLeft className="size-5 text-[#007AFF]" />
          </Link>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${phase.bg}`}>
            <span className="text-[12px]">{phase.icon}</span>
            <span className={`text-[12px] font-semibold ${phase.color}`}>{phase.label}</span>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-[28px] font-semibold text-[#1C1C1E] tracking-tight leading-tight">
            Planning
          </h1>
          <p className="text-[13px] text-[#8E8E93] font-medium mt-0.5">
            {isActive ? "Budget tracking & trip agreements" : "Commitments, deposits & budget"}
          </p>
        </motion.div>
      </div>

      <div className="px-4 space-y-4 mt-2">
        {/* ─── Planning Progress ──────────────────────────────────────────── */}
        {/* In active trips: only show if there are urgent unresolved items */}
        {(() => {
          const unresolvedItems = checklistItems.filter((i) => !i.complete);
          const hasUrgent = unresolvedItems.length > 0;

          // During active trip, collapse planning unless there are unresolved items
          if (isActive && !hasUrgent) {
            return (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[20px] p-4 shadow-[var(--shadow-apple-1)] flex items-center gap-3"
              >
                <div className="size-10 rounded-[12px] bg-[#E8F7EE] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="size-5 text-[#34C759]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#34C759]">Planning complete</p>
                  <p className="text-[12px] text-[#8E8E93]">All {checklistItems.length} items resolved</p>
                </div>
              </motion.div>
            );
          }

          // During active trip with urgent items — compact alert style
          if (isActive && hasUrgent) {
            return (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[20px] p-4 shadow-[var(--shadow-apple-1)]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="size-4 text-[#FF9F0A]" />
                  <p className="text-[13px] font-semibold text-[#FF9F0A]">
                    {unresolvedItems.length} unresolved {unresolvedItems.length === 1 ? "item" : "items"}
                  </p>
                </div>
                <div className="space-y-2">
                  {unresolvedItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2.5">
                      <Circle className="size-4 text-[#FF9F0A] flex-shrink-0" />
                      <span className="text-[13px] text-[#1C1C1E]">{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          }

          // Planning phase — full checklist
          return (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[20px] p-5 shadow-[var(--shadow-apple-1)]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-semibold text-[#1C1C1E]">Planning Progress</h3>
                <span
                  className={`text-[13px] font-semibold px-2.5 py-0.5 rounded-full ${
                    allChecklistDone ? "text-[#34C759] bg-[#E8F7EE]" : "text-[#007AFF] bg-[#EAF2FF]"
                  }`}
                >
                  {allChecklistDone ? "Complete!" : `${completedChecklist}/${checklistItems.length}`}
                </span>
              </div>

              <div className="h-2 bg-[#F1F2F5] rounded-full overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedChecklist / checklistItems.length) * 100}%` }}
                  className={`h-full rounded-full ${allChecklistDone ? "bg-[#34C759]" : "bg-[#007AFF]"}`}
                  transition={{ delay: 0.2, duration: 0.6 }}
                />
              </div>

              <div className="space-y-2.5">
                {checklistItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.complete ? (
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                        <CheckCircle2 className="size-5 text-[#34C759] flex-shrink-0" />
                      </motion.div>
                    ) : (
                      <Circle className="size-5 text-[#D1D1D6] flex-shrink-0" />
                    )}
                    <span className={`text-[14px] ${item.complete ? "text-[#1C1C1E] font-medium" : "text-[#8E8E93]"}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {allChecklistDone && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-4 border-t border-[#F7F7F5] flex items-center gap-3"
                >
                  <div className="size-10 rounded-[12px] bg-[#E8F7EE] flex items-center justify-center">
                    <PartyPopper className="size-5 text-[#34C759]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#34C759]">All set!</p>
                    <p className="text-[12px] text-[#8E8E93]">Planning is complete. Enjoy the trip!</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })()}

        {/* ─── Budget vs. Actual (active trip) ────────────────────────────── */}
        {isActive && budgetCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-[20px] p-5 shadow-[var(--shadow-apple-1)]"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[15px] font-semibold text-[#1C1C1E]">Budget vs. Actual</h3>
              <Link to={`/trip/${tripId}/money`} className="text-[12px] font-medium text-[#007AFF]">
                View expenses →
              </Link>
            </div>
            <p className="text-[12px] text-[#8E8E93] mb-4">
              {formatCurrency(totalActual)} spent of {formatCurrency(totalEstimate)} estimated
            </p>

            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] text-[#8E8E93]">Overall</span>
                <span className={`text-[12px] font-semibold ${totalActual > totalEstimate ? "text-[#FF3B30]" : "text-[#34C759]"}`}>
                  {totalActual > totalEstimate ? "Over by " : "Under by "}
                  {formatCurrency(Math.abs(totalEstimate - totalActual))}
                </span>
              </div>
              <div className="h-3 bg-[#F1F2F5] rounded-full overflow-hidden relative">
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <div className="w-px h-full bg-[#D1D1D6]" />
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((totalActual / Math.max(totalEstimate, 1)) * 100, 100)}%` }}
                  transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-full ${totalActual > totalEstimate ? "bg-[#FF3B30]" : "bg-[#007AFF]"}`}
                />
              </div>
            </div>

            <div className="space-y-3">
              {budgetCategories.map((cat) => {
                const pct = cat.estimate > 0 ? (cat.actual / cat.estimate) * 100 : 0;
                const isOver = cat.actual > cat.estimate;
                const remaining = cat.estimate - cat.actual;
                return (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px]">{cat.icon}</span>
                        <span className="text-[13px] font-medium text-[#1C1C1E]">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] text-[#8E8E93]">{formatCurrency(cat.actual)}</span>
                        <span className="text-[10px] text-[#D1D1D6]">/</span>
                        <span className="text-[12px] text-[#8E8E93]">{formatCurrency(cat.estimate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#F1F2F5] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(pct, 100)}%` }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                          className={`h-full rounded-full ${isOver ? "bg-[#FF3B30]" : pct > 75 ? "bg-[#FF9F0A]" : "bg-[#34C759]"}`}
                        />
                      </div>
                      <span className={`text-[10px] font-semibold min-w-[48px] text-right ${isOver ? "text-[#FF3B30]" : pct > 75 ? "text-[#FF9F0A]" : "text-[#34C759]"}`}>
                        {isOver ? `+${formatCurrency(Math.abs(remaining))}` : `${formatCurrency(remaining)} left`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-[#F7F7F5] flex items-center justify-between">
              <div>
                <p className="text-[12px] text-[#8E8E93] font-medium uppercase tracking-wide">Per person</p>
                <p className="text-[20px] font-semibold text-[#1C1C1E]">{formatCurrency(totalActual / participantCount)}</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-[#8E8E93] font-medium uppercase tracking-wide">Remaining</p>
                <p className={`text-[20px] font-semibold ${totalEstimate - totalActual >= 0 ? "text-[#34C759]" : "text-[#FF3B30]"}`}>
                  {formatCurrency(totalEstimate - totalActual)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── RSVP & Commitment ──────────────────────────────────────────── */}
        <SectionAccordion
          icon={<Users className="size-5 text-[#007AFF]" />}
          iconBg="bg-[#EAF2FF]"
          title="RSVP & Commitment"
          subtitle={
            allCommitted
              ? `All ${committedCount} committed!`
              : participants.length <= 1
              ? "Invite your crew to get started"
              : `${committedCount} committed · ${participants.length} invited`
          }
          isOpen={expandedSections.rsvp}
          onToggle={() => toggleSection("rsvp")}
          badge={allCommitted ? { label: "Complete", color: "text-[#34C759]", bg: "bg-[#E8F7EE]" } : undefined}
          delay={0.1}
        >
          {/* Empty state */}
          {participants.length <= 1 && !showAddMember && (
            <div className="text-center py-4 mb-3">
              <div className="size-14 bg-[#F1F2F5] rounded-[18px] flex items-center justify-center mx-auto mb-3">
                <UserPlus className="size-6 text-[#C7C7CC]" />
              </div>
              <p className="text-[14px] font-medium text-[#1C1C1E] mb-1">No one here yet</p>
              <p className="text-[12px] text-[#8E8E93] mb-4">Add your travel crew to get started</p>
              <button
                onClick={() => setShowAddMember(true)}
                className="px-4 py-2 bg-[#007AFF] text-white rounded-full text-[13px] font-semibold active:scale-95 transition-transform"
              >
                Invite Members
              </button>
            </div>
          )}

          {/* Celebration banner */}
          <AnimatePresence>
            {allCommitted && justCelebrated.has("allcommitted") && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="bg-[#E8F7EE] rounded-[14px] p-4 mb-3 flex items-center gap-3">
                  <div className="size-10 rounded-[12px] bg-[#34C759]/20 flex items-center justify-center">
                    <Sparkles className="size-5 text-[#34C759]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-[#34C759]">Everyone's in!</p>
                    <p className="text-[12px] text-[#6E6E73]">All {committedCount} members committed.</p>
                  </div>
                  <button onClick={() => setJustCelebrated((prev) => { const n = new Set(prev); n.delete("allcommitted"); return n; })} className="p-1 hover:bg-black/5 rounded-full">
                    <X className="size-3.5 text-[#8E8E93]" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Member list */}
          <div className="space-y-2">
            {participants.map((person) => {
              const style = getRSVPStyle(person.rsvp);
              const isYou = person.name === CURRENT_USER;
              const isDropdownOpen = rsvpDropdownId === person.id;

              return (
                <div key={person.id} data-rsvp-dropdown>
                  <SwipeableRow onDelete={() => removeParticipant(person.id)} disabled={isYou}>
                  <div className="flex items-center bg-[#F7F7F5] rounded-[14px] p-3.5 gap-3">
                    <div className={`size-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0 ${avatarColors[person.avatar] || avatarColors[person.name[0]] || "bg-[#8E8E93]"}`}>
                      {person.avatar || person.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[#1C1C1E] truncate">
                        {person.name}
                        {isYou && <span className="text-[11px] text-[#8E8E93] font-normal ml-1">(you)</span>}
                      </p>
                      {person.role && <p className="text-[11px] text-[#8E8E93]">{person.role}</p>}
                    </div>

                    <button
                      onClick={() => setRsvpDropdownId(isDropdownOpen ? null : person.id)}
                      className={`ml-auto flex-shrink-0 h-6 px-2.5 rounded-full text-[11px] font-semibold flex items-center gap-1 leading-none transition-all active:scale-95 ${style.bg} ${style.color}`}
                    >
                      {person.rsvp === "committed" && "✓ "}{style.label}
                      <ChevronDown className={`size-3 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                  </SwipeableRow>

                  {/* Inline RSVP picker — renders in flow to avoid overflow-hidden clipping */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-1 bg-white rounded-[14px] shadow-[var(--shadow-apple-2)] py-1.5">
                          {rsvpOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleUpdateRSVP(person.id, option.value)}
                              className={`w-full px-4 py-2.5 text-left text-[13px] font-medium flex items-center justify-between hover:bg-[#F7F7F5] transition-colors ${option.color}`}
                            >
                              {option.label}
                              {person.rsvp === option.value && <Check className="size-3.5" />}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Add Member */}
          <AnimatePresence>
            {showAddMember && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Name"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddMember(); if (e.key === "Escape") { setShowAddMember(false); setNewMemberName(""); } }}
                    className="flex-1 px-4 py-2.5 bg-[#F7F7F5] rounded-[12px] text-[14px] text-[#1C1C1E] placeholder-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
                  />
                  <button onClick={handleAddMember} className="px-4 py-2.5 bg-[#007AFF] text-white rounded-[12px] text-[13px] font-semibold active:scale-95 transition-transform">
                    Add
                  </button>
                  <button onClick={() => { setShowAddMember(false); setNewMemberName(""); }} className="p-2 hover:bg-[#F1F2F5] rounded-full transition-colors">
                    <X className="size-4 text-[#8E8E93]" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {participants.length > 1 && !showAddMember && (
            <button
              onClick={() => setShowAddMember(true)}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-[#007AFF] bg-[#EAF2FF] rounded-[12px] active:scale-[0.98] transition-transform"
            >
              <Plus className="size-4" />
              Add Member
            </button>
          )}
        </SectionAccordion>

        {/* ─── Shared Rules ───────────────────────────────────────────────── */}
        <SectionAccordion
          icon={<AlertCircle className="size-5 text-[#AF52DE]" />}
          iconBg="bg-[#F1EEFF]"
          title="Shared Rules"
          subtitle={rules.length === 0 ? "Set expectations for the group" : `${rules.length} rules · Expense & split expectations`}
          isOpen={expandedSections.rules}
          onToggle={() => toggleSection("rules")}
          delay={0.15}
        >
          {/* Empty state */}
          {rules.length === 0 && !showAddRule ? (
            <div className="text-center py-4">
              <div className="size-14 bg-[#F1F2F5] rounded-[18px] flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="size-6 text-[#C7C7CC]" />
              </div>
              <p className="text-[14px] font-medium text-[#1C1C1E] mb-1">No rules yet</p>
              <p className="text-[12px] text-[#8E8E93] mb-4">Define how expenses are split and shared.</p>

              {/* Quick Starter Rules */}
              <div className="text-left mb-4">
                <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 px-1">Quick Add Rules</p>
                <div className="space-y-1.5">
                  {STARTER_RULES.map((starter) => (
                    <button
                      key={starter.title}
                      onClick={() => {
                        addRule({
                          title: starter.title,
                          items: starter.items,
                          proposedBy: CURRENT_USER,
                          votes: 1,
                          totalVoters: participantCount,
                        });
                      }}
                      className="w-full flex items-center gap-3 bg-[#F7F7F5] rounded-[12px] px-3 py-2.5 text-left hover:bg-[#F1F2F5] transition-colors active:scale-[0.98]"
                    >
                      <div className="size-7 rounded-full bg-[#F1EEFF] flex items-center justify-center flex-shrink-0">
                        <Plus className="size-3.5 text-[#AF52DE]" />
                      </div>
                      <span className="text-[13px] font-medium text-[#1C1C1E]">{starter.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowAddRule(true)}
                className="px-4 py-2 bg-[#AF52DE] text-white rounded-full text-[13px] font-semibold active:scale-95 transition-transform"
              >
                Write Custom Rule
              </button>
            </div>
          ) : (
            <>
              {/* Rules list — show max 3 collapsed, with "View all" */}
              <div className="space-y-3">
                {(showAllRules ? rules : rules.slice(0, 3)).map((rule) => {
                  const allVoted = rule.votes >= rule.totalVoters;
                  return (
                    <div key={rule.id} className="bg-[#F7F7F5] rounded-[14px] p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[13px] font-semibold text-[#1C1C1E]">{rule.title}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${allVoted ? "bg-[#E8F7EE] text-[#34C759]" : "bg-[#EAF2FF] text-[#007AFF]"}`}>
                          {allVoted ? "✓ Agreed" : `${rule.votes}/${rule.totalVoters} agreed`}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {rule.items.map((item) => (
                          <p key={item} className="text-[12px] text-[#6E6E73]">· {item}</p>
                        ))}
                      </div>
                      <div className="mt-2.5 pt-2.5 border-t border-[#E5E5EA]/50 flex items-center justify-between">
                        <p className="text-[10px] text-[#C7C7CC]">Proposed by {rule.proposedBy}</p>
                        {!allVoted && (
                          <button
                            onClick={() => voteOnRule(rule.id)}
                            className="px-3 py-1 bg-[#007AFF] text-white rounded-full text-[11px] font-semibold hover:bg-[#0064D2] transition-colors active:scale-95"
                          >
                            Agree
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View all / collapse toggle */}
              {rules.length > 3 && (
                <button
                  onClick={() => setShowAllRules(!showAllRules)}
                  className="mt-2 w-full text-center text-[12px] font-semibold text-[#007AFF] py-1.5 hover:opacity-80 transition-opacity"
                >
                  {showAllRules ? "Show less" : `View all ${rules.length} rules`}
                </button>
              )}

              {/* Quick Add Starters (show remaining not yet added) */}
              {(() => {
                const existingTitles = new Set(rules.map((r) => r.title));
                const remaining = STARTER_RULES.filter((s) => !existingTitles.has(s.title));
                if (remaining.length === 0) return null;
                return (
                  <div className="mt-3">
                    <p className="text-[10px] font-semibold text-[#C7C7CC] uppercase tracking-wider mb-1.5 px-1">Quick add</p>
                    <div className="flex flex-wrap gap-1.5">
                      {remaining.map((starter) => (
                        <button
                          key={starter.title}
                          onClick={() => {
                            addRule({
                              title: starter.title,
                              items: starter.items,
                              proposedBy: CURRENT_USER,
                              votes: 1,
                              totalVoters: participantCount,
                            });
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F7F7F5] rounded-full text-[11px] font-medium text-[#1C1C1E] hover:bg-[#F1F2F5] transition-colors active:scale-95"
                        >
                          <Plus className="size-3 text-[#AF52DE]" />
                          {starter.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Add Rule Form */}
              <AnimatePresence>
                {showAddRule && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="mt-3 bg-[#F7F7F5] rounded-[14px] p-4 space-y-3">
                      <input
                        type="text"
                        value={newRuleTitle}
                        onChange={(e) => setNewRuleTitle(e.target.value)}
                        placeholder="Rule title (e.g., Shared Expenses)"
                        className="w-full px-3 py-2 bg-white rounded-[10px] text-[14px] text-[#1C1C1E] placeholder-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/20"
                        autoFocus
                      />
                      <textarea
                        value={newRuleItems}
                        onChange={(e) => setNewRuleItems(e.target.value)}
                        placeholder="Rules (one per line)"
                        rows={3}
                        className="w-full px-3 py-2 bg-white rounded-[10px] text-[13px] text-[#1C1C1E] placeholder-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#AF52DE]/20 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddRule}
                          className="flex-1 py-2 bg-[#AF52DE] text-white rounded-[10px] text-[13px] font-semibold active:scale-95 transition-transform"
                        >
                          Add Rule
                        </button>
                        <button
                          onClick={() => { setShowAddRule(false); setNewRuleTitle(""); setNewRuleItems(""); }}
                          className="px-4 py-2 bg-white text-[#8E8E93] rounded-[10px] text-[13px] font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!showAddRule && (
                <button
                  onClick={() => setShowAddRule(true)}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-[#AF52DE] bg-[#F1EEFF] rounded-[12px] active:scale-[0.98] transition-transform"
                >
                  <Plus className="size-4" />
                  Write Custom Rule
                </button>
              )}
            </>
          )}
        </SectionAccordion>

        {/* ─── Budget Estimation ───────────────────────────────────────────── */}
        <SectionAccordion
          icon={<Calendar className="size-5 text-[#FF9F0A]" />}
          iconBg="bg-[#FFF3E0]"
          title="Budget Estimation"
          subtitle={
            budgetCategories.length === 0
              ? "Define your trip budget"
              : `${formatCurrency(totalEstimate)} total · ${formatCurrency(Math.round(totalEstimate / participantCount))}/person`
          }
          isOpen={expandedSections.budget}
          onToggle={() => toggleSection("budget")}
          delay={0.2}
        >
          {/* Empty state */}
          {budgetCategories.length === 0 ? (
            <div className="text-center py-4">
              <div className="size-14 bg-[#F1F2F5] rounded-[18px] flex items-center justify-center mx-auto mb-3">
                <Calendar className="size-6 text-[#C7C7CC]" />
              </div>
              <p className="text-[14px] font-medium text-[#1C1C1E] mb-1">No budget set</p>
              <p className="text-[12px] text-[#8E8E93] mb-4">Add categories to estimate your trip costs.</p>
              <button
                onClick={() => { setCustomName(""); setCustomIcon("📦"); setCustomType("shared"); setCustomEstimate(""); setShowEmojiGrid(false); setShowAddBudget(true); }}
                className="px-4 py-2 bg-[#007AFF] text-white rounded-full text-[13px] font-semibold active:scale-95 transition-transform"
              >
                Set Up Budget
              </button>
            </div>
          ) : (
            <>
              {/* Tip */}
              <p className="text-[11px] text-[#C7C7CC] mb-3 px-0.5">
                Tap a row to edit · Tap the type badge to toggle shared/optional
              </p>

              <div className="space-y-2">
                {budgetCategories.map((category) => {
                  const isEditing = editingBudgetId === category.id;
                  return (
                    <div
                      key={category.id}
                      className="bg-[#F7F7F5] rounded-[14px] p-3.5 flex items-center gap-3 active:bg-[#EFEFED] transition-colors cursor-pointer"
                      onClick={() => {
                        if (editingBudgetId === category.id) return;
                        setEditCategoryId(category.id);
                        setEditDraftName(category.name);
                        setEditDraftIcon(category.icon);
                        setEditDraftType(category.type);
                      }}
                    >
                      {/* Emoji */}
                      <span className="text-xl flex-shrink-0">{category.icon}</span>

                      {/* Name + meta */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-[#1C1C1E] truncate">{category.name}</p>
                        <p className="text-[11px] text-[#8E8E93] mt-0.5">
                          {category.estimate === 0
                            ? "Tap estimate to set"
                            : `${formatCurrency(Math.round(category.estimate / participantCount))}/person`}
                          {isActive && category.actual > 0 && (
                            <span className="text-[#C7C7CC]"> · {formatCurrency(category.actual)} spent</span>
                          )}
                        </p>
                      </div>

                      {/* Right: type badge + estimate — stopPropagation so row tap doesn't conflict */}
                      <div
                        className="flex items-center gap-2 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Type toggle pill */}
                        <button
                          onClick={() =>
                            updateBudgetCategory(category.id, {
                              type: category.type === "shared" ? "optional" : "shared",
                            })
                          }
                          className={`h-6 px-2.5 rounded-full text-[11px] font-semibold flex items-center leading-none transition-all active:scale-95 ${
                            category.type === "shared"
                              ? "bg-[#EAF2FF] text-[#007AFF]"
                              : "bg-[#F1F2F5] text-[#8E8E93]"
                          }`}
                        >
                          {category.type === "shared" ? "Shared" : "Optional"}
                        </button>

                        {/* Estimate inline edit */}
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[13px] text-[#8E8E93]">$</span>
                            <input
                              type="number"
                              inputMode="numeric"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onBlur={() => saveBudgetEdit(category.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveBudgetEdit(category.id);
                                if (e.key === "Escape") { setEditingBudgetId(null); setEditingValue(""); }
                              }}
                              autoFocus
                              className="w-16 text-[15px] font-semibold text-[#1C1C1E] bg-white rounded-[8px] px-2 py-1 border border-[#007AFF] focus:ring-0 focus:outline-none text-right"
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingBudgetId(category.id); setEditingValue(String(category.estimate)); }}
                            className="text-[17px] font-semibold text-[#1C1C1E] min-w-[44px] text-right"
                          >
                            ${category.estimate}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Category button */}
              <button
                onClick={() => { setCustomName(""); setCustomIcon("📦"); setCustomType("shared"); setCustomEstimate(""); setShowEmojiGrid(false); setShowAddBudget(true); }}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-[#FF9F0A] bg-[#FFF3E0] rounded-[12px] active:scale-[0.98] transition-transform"
              >
                <Plus className="size-4" />
                Add Category
              </button>

              {/* Total */}
              <div className="mt-3 pt-3 border-t border-[#F1F2F5] flex items-center justify-between">
                <p className="text-[14px] font-medium text-[#8E8E93]">Total estimate</p>
                <div className="text-right">
                  <p className="text-[22px] font-semibold text-[#1C1C1E]">{formatCurrency(totalEstimate)}</p>
                  <p className="text-[11px] text-[#8E8E93]">~{formatCurrency(Math.round(totalEstimate / participantCount))}/person</p>
                </div>
              </div>
            </>
          )}
        </SectionAccordion>

        {/* ─── Deposits ───────────────────────────────────────────────────── */}
        <SectionAccordion
          icon={<DollarSign className="size-5 text-[#34C759]" />}
          iconBg="bg-[#E8F7EE]"
          title="Deposits"
          subtitle={
            !trip.depositPolicy
              ? "No policy set yet"
              : eligibleForDeposit.length === 0
              ? `$${trip.depositPolicy.amount}/person · Due ${trip.depositPolicy.dueDate}`
              : allDepositsPaid
              ? "All deposits collected!"
              : `${paidDepositsCount}/${eligibleForDeposit.length} paid · $${trip.depositPolicy.amount} each · Due ${trip.depositPolicy.dueDate}`
          }
          isOpen={expandedSections.deposits}
          onToggle={() => toggleSection("deposits")}
          badge={allDepositsPaid && eligibleForDeposit.length > 0 ? { label: "Complete", color: "text-[#34C759]", bg: "bg-[#E8F7EE]" } : undefined}
          delay={0.25}
        >
          {/* ── No policy yet ── */}
          {!trip.depositPolicy ? (
            <>
              <div className="text-center py-6">
                <div className="size-14 bg-[#F1F2F5] rounded-[18px] flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="size-6 text-[#C7C7CC]" />
                </div>
                <p className="text-[14px] font-medium text-[#1C1C1E] mb-1">No deposit policy yet</p>
                <p className="text-[12px] text-[#8E8E93] mb-5 mx-4">
                  Define the amount, due date, and refund rules before collecting money.
                </p>
                {!showPolicyEditor && (
                  <button
                    onClick={() => {
                      setPolicyDraft({ amount: "", dueDate: "", covers: budgetCategories.map((c) => c.name), dropoutRule: "Late dropouts forfeit 50% deposit" });
                      setShowPolicyEditor(true);
                    }}
                    className="px-5 py-2.5 bg-[#34C759] text-white rounded-full text-[13px] font-semibold active:scale-95 transition-transform shadow-[0_4px_12px_rgba(52,199,89,0.25)]"
                  >
                    Set Deposit Policy
                  </button>
                )}
              </div>

              {/* Inline policy creation form */}
              <AnimatePresence>
                {showPolicyEditor && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <PolicyEditorForm
                      draft={policyDraft}
                      onChange={setPolicyDraft}
                      budgetCategories={budgetCategories}
                      committedCount={committedCount}
                      onSave={() => {
                        const amt = parseFloat(policyDraft.amount);
                        if (isNaN(amt) || amt <= 0 || !policyDraft.dueDate.trim()) return;
                        setDepositPolicy({
                          amount: amt,
                          dueDate: policyDraft.dueDate.trim(),
                          covers: policyDraft.covers,
                          dropoutRule: policyDraft.dropoutRule,
                          setBy: CURRENT_USER,
                        });
                        setShowPolicyEditor(false);
                      }}
                      onCancel={() => setShowPolicyEditor(false)}
                      isNew
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <>
              {/* Celebration banner */}
              <AnimatePresence>
                {allDepositsPaid && justCelebrated.has("alldeposits") && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="bg-[#E8F7EE] rounded-[14px] p-4 mb-3 flex items-center gap-3">
                      <div className="size-10 rounded-[12px] bg-[#34C759]/20 flex items-center justify-center">
                        <PartyPopper className="size-5 text-[#34C759]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-semibold text-[#34C759]">All deposits collected!</p>
                        <p className="text-[12px] text-[#6E6E73]">{formatCurrency(paidDepositsCount * trip.depositPolicy.amount)} secured.</p>
                      </div>
                      <button onClick={() => setJustCelebrated((prev) => { const n = new Set(prev); n.delete("alldeposits"); return n; })} className="p-1 hover:bg-black/5 rounded-full">
                        <X className="size-3.5 text-[#8E8E93]" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Policy Module ── */}
              <AnimatePresence mode="wait">
                {showPolicyEditor ? (
                  <motion.div key="editor" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-3">
                    <PolicyEditorForm
                      draft={policyDraft}
                      onChange={setPolicyDraft}
                      budgetCategories={budgetCategories}
                      committedCount={committedCount}
                      onSave={() => {
                        const amt = parseFloat(policyDraft.amount);
                        if (isNaN(amt) || amt <= 0 || !policyDraft.dueDate.trim()) return;
                        updateDepositPolicy({
                          amount: amt,
                          dueDate: policyDraft.dueDate.trim(),
                          covers: policyDraft.covers,
                          dropoutRule: policyDraft.dropoutRule,
                        });
                        setShowPolicyEditor(false);
                      }}
                      onCancel={() => setShowPolicyEditor(false)}
                      isNew={false}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#EAF2FF] rounded-[14px] p-4 mb-3">
                    {/* Header row: provenance + edit */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div>
                        <p className="text-[13px] font-semibold text-[#1C1C1E]">Deposit Policy</p>
                        <p className="text-[11px] text-[#8E8E93] mt-px">Set by {trip.depositPolicy.setBy}</p>
                      </div>
                      <button
                        onClick={() => {
                          setPolicyDraft({
                            amount: String(trip.depositPolicy!.amount),
                            dueDate: trip.depositPolicy!.dueDate,
                            covers: [...trip.depositPolicy!.covers],
                            dropoutRule: trip.depositPolicy!.dropoutRule,
                          });
                          setShowPolicyEditor(true);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#007AFF]/10 text-[#007AFF] text-[11px] font-semibold hover:bg-[#007AFF]/20 transition-colors active:scale-95"
                      >
                        <Edit3 className="size-3" />
                        Edit
                      </button>
                    </div>
                    <div className="space-y-1 text-[12px] text-[#3C3C43]">
                      <p>· ${trip.depositPolicy.amount} due by {trip.depositPolicy.dueDate}</p>
                      <p>· {trip.depositPolicy.dropoutRule}</p>
                      <p>· Applies toward:{" "}
                        {trip.depositPolicy.covers.length > 0
                          ? trip.depositPolicy.covers.join(", ")
                          : "All categories"}
                      </p>
                    </div>
                    <p className="text-[10px] text-[#8E8E93] mt-2.5">Members will be notified of any changes.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Collection Module ── */}
              {eligibleForDeposit.length === 0 ? (
                <div className="text-center py-3">
                  <p className="text-[13px] text-[#8E8E93]">No one eligible yet — get members to commit first.</p>
                </div>
              ) : (
                <>
                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] text-[#8E8E93]">
                        {formatCurrency(paidDepositsCount * trip.depositPolicy.amount)} of {formatCurrency(eligibleForDeposit.length * trip.depositPolicy.amount)} collected
                      </span>
                      <span className="text-[12px] font-semibold text-[#8E8E93]">
                        {Math.round((paidDepositsCount / eligibleForDeposit.length) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#F1F2F5] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(paidDepositsCount / eligibleForDeposit.length) * 100}%` }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className={`h-full rounded-full ${allDepositsPaid ? "bg-[#34C759]" : "bg-[#007AFF]"}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {eligibleForDeposit.map((person) => (
                      <div key={person.id} className="flex items-center justify-between bg-[#F7F7F5] rounded-[14px] p-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`size-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white ${avatarColors[person.avatar] || avatarColors[person.name[0]] || "bg-[#8E8E93]"}`}>
                            {person.avatar || person.name[0]}
                          </div>
                          <div>
                            <p className="text-[14px] font-medium text-[#1C1C1E]">
                              {person.name}
                              {person.name === CURRENT_USER && <span className="text-[11px] text-[#8E8E93] font-normal ml-1">(you)</span>}
                            </p>
                            <p className="text-[11px] text-[#8E8E93]">${trip.depositPolicy.amount} deposit</p>
                          </div>
                        </div>
                        {person.depositPaid ? (
                          <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-1 px-2.5 py-1 bg-[#E8F7EE] text-[#34C759] rounded-full text-[11px] font-semibold">
                            <CheckCircle2 className="size-3.5" /> Paid
                          </motion.span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 px-2.5 py-1 bg-[#FFF3E0] text-[#FF9F0A] rounded-full text-[11px] font-semibold">
                              <Clock className="size-3.5" /> Pending
                            </span>
                            <button
                              onClick={() => setShowDepositConfirm(person.id)}
                              className="px-3 py-1 bg-[#007AFF] text-white rounded-full text-[11px] font-semibold hover:bg-[#0064D2] transition-colors active:scale-95"
                            >
                              Mark Paid
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </SectionAccordion>

      </div>

      {/* ─── Deposit Confirmation Sheet ───────────────────────────────────── */}
      <AnimatePresence>
        {showDepositConfirm && (() => {
          const person = participants.find((p) => p.id === showDepositConfirm);
          if (!person) return null;
          return (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" onClick={() => setShowDepositConfirm(null)} />
              <motion.div
                initial={{ y: "100%", opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 28, stiffness: 220 }}
                className="fixed inset-x-0 bottom-0 z-[60] bg-white rounded-t-[28px] shadow-[var(--shadow-apple-3)] max-w-lg mx-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="pt-3 pb-2"><div className="w-9 h-[5px] rounded-full bg-[#E5E5EA] mx-auto" /></div>
                <div className="px-6 pb-8">
                  <div className="text-center mb-5">
                    <div className={`size-16 rounded-full flex items-center justify-center text-white text-[24px] font-semibold mx-auto mb-3 ${avatarColors[person.avatar] || avatarColors[person.name[0]] || "bg-[#8E8E93]"}`}>
                      {person.avatar || person.name[0]}
                    </div>
                    <h2 className="text-[20px] font-semibold text-[#1C1C1E]">Confirm Deposit</h2>
                    <p className="text-[14px] text-[#8E8E93] mt-1">Mark {person.name}'s ${trip.depositPolicy?.amount ?? 0} deposit as received?</p>
                  </div>
                  <div className="bg-[#F7F7F5] rounded-[14px] p-4 mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] text-[#8E8E93]">Amount</span>
                      <span className="text-[15px] font-semibold text-[#1C1C1E]">${trip.depositPolicy?.amount ?? 0}.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-[#8E8E93]">Applied to</span>
                      <span className="text-[13px] font-medium text-[#1C1C1E]">
                        {trip.depositPolicy?.covers && trip.depositPolicy.covers.length > 0
                          ? trip.depositPolicy.covers.join(", ")
                          : "All categories"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <motion.button whileTap={{ scale: 0.98 }} onClick={() => handleMarkDepositPaid(showDepositConfirm)} className="w-full py-[14px] bg-[#34C759] text-white rounded-[14px] font-semibold text-[17px] shadow-[0_4px_12px_rgba(52,199,89,0.25)] transition-all">
                      Confirm Received
                    </motion.button>
                    <button onClick={() => setShowDepositConfirm(null)} className="w-full py-[14px] bg-[#F1F2F5] text-[#1C1C1E] rounded-[14px] font-semibold text-[15px] transition-colors hover:bg-[#E5E5EA]">
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* ─── Add Category Sheet ───────────────────────────────────────────── */}
      <BottomSheet
        open={showAddBudget}
        onOpenChange={(o) => { setShowAddBudget(o); if (!o) setShowEmojiGrid(false); }}
        title="Add Category"
        subtitle="Create a budget category"
        srDescription="Add a preset or custom budget category to your trip."
      >
              {/* Quick Add presets */}
              {budgetTemplates.filter((t) => !budgetCategories.some((c) => c.name === t.name)).length > 0 && (
                <>
                  <p className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">Quick Add</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5 mb-5">
                    {budgetTemplates
                      .filter((t) => !budgetCategories.some((c) => c.name === t.name))
                      .map((t) => (
                        <button
                          key={t.name}
                          onClick={() => { handleAddBudgetFromTemplate(t); setShowAddBudget(false); }}
                          className="flex flex-col items-center gap-1 px-3.5 py-2.5 bg-[#F7F7F5] rounded-[14px] flex-shrink-0 active:scale-95 transition-all"
                        >
                          <span className="text-xl leading-none">{t.icon}</span>
                          <span className="text-[10px] font-semibold text-[#8E8E93]">{t.name.split(" ")[0]}</span>
                        </button>
                      ))}
                  </div>
                </>
              )}

              {/* Divider */}
              <div className="relative flex items-center mb-4">
                <div className="flex-1 border-t border-[#F1F2F5]" />
                <span className="px-3 text-[11px] font-semibold text-[#C7C7CC] uppercase tracking-wider">Custom</span>
                <div className="flex-1 border-t border-[#F1F2F5]" />
              </div>

              {/* ── Unified input row: emoji + name ── */}
              <div className="flex items-center gap-2.5 mb-3">
                {/* Emoji selector button */}
                <button
                  onClick={() => setShowEmojiGrid((prev) => !prev)}
                  className={`size-[46px] rounded-[12px] flex items-center justify-center flex-shrink-0 text-xl transition-all active:scale-90 ${
                    showEmojiGrid
                      ? "bg-[#FFF3E0] ring-2 ring-[#FF9F0A]"
                      : "bg-[#F7F7F5]"
                  }`}
                >
                  {customIcon}
                </button>
                {/* Name field */}
                <input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Category name"
                  className="flex-1 min-w-0 px-3.5 py-3 bg-[#F7F7F5] rounded-[12px] text-[15px] text-[#1C1C1E] placeholder-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#FF9F0A]/30"
                />
              </div>

              {/* ── Expandable emoji grid ── */}
              <AnimatePresence>
                {showEmojiGrid && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pb-3">
                      {/* Suggested / recent row */}
                      <p className="text-[10px] font-semibold text-[#C7C7CC] uppercase tracking-wider mb-1.5 px-0.5">Suggested</p>
                      <div className="flex gap-1.5 mb-2">
                        {CATEGORY_EMOJIS.slice(0, 10).map((emoji) => (
                          <button
                            key={`s-${emoji}`}
                            onClick={() => { setCustomIcon(emoji); setShowEmojiGrid(false); }}
                            className={`size-[34px] rounded-[8px] flex items-center justify-center text-[16px] transition-all active:scale-90 ${
                              customIcon === emoji
                                ? "bg-[#FFF3E0] ring-2 ring-[#FF9F0A]"
                                : "bg-[#F7F7F5]"
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      {/* Full grid */}
                      <p className="text-[10px] font-semibold text-[#C7C7CC] uppercase tracking-wider mb-1.5 px-0.5">All Icons</p>
                      <div className="grid grid-cols-10 gap-1.5">
                        {CATEGORY_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => { setCustomIcon(emoji); setShowEmojiGrid(false); }}
                            className={`aspect-square rounded-[8px] flex items-center justify-center text-[16px] transition-all active:scale-90 ${
                              customIcon === emoji
                                ? "bg-[#FFF3E0] ring-2 ring-[#FF9F0A]"
                                : "bg-[#F7F7F5]"
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Estimate amount (optional) ── */}
              <div className="mb-3">
                <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-1.5">Estimate <span className="font-normal text-[#C7C7CC]">(optional)</span></p>
                <div className="flex items-center gap-2 bg-[#F7F7F5] rounded-[12px] px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-[#FF9F0A]/30">
                  <span className="text-[15px] text-[#C7C7CC]">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={customEstimate}
                    onChange={(e) => setCustomEstimate(e.target.value)}
                    placeholder="0"
                    className="flex-1 bg-transparent text-[15px] text-[#1C1C1E] placeholder-[#D1D1D6] focus:outline-none"
                  />
                  {customEstimate && participantCount > 1 && (
                    <span className="text-[12px] text-[#8E8E93] flex-shrink-0">
                      ~{formatCurrency(Math.round(parseFloat(customEstimate || "0") / participantCount))}/ea
                    </span>
                  )}
                </div>
              </div>

              {/* ── Shared / Optional toggle ── */}
              <div className="mb-4">
                <div className="flex gap-2 p-1 bg-[#F1F2F5] rounded-[12px]">
                  <button
                    onClick={() => setCustomType("shared")}
                    className={`flex-1 py-2 rounded-[10px] text-[13px] font-semibold transition-all ${
                      customType === "shared" ? "bg-white text-[#007AFF] shadow-sm" : "text-[#8E8E93]"
                    }`}
                  >
                    Shared
                  </button>
                  <button
                    onClick={() => setCustomType("optional")}
                    className={`flex-1 py-2 rounded-[10px] text-[13px] font-semibold transition-all ${
                      customType === "optional" ? "bg-white text-[#007AFF] shadow-sm" : "text-[#8E8E93]"
                    }`}
                  >
                    Optional
                  </button>
                </div>
                <p className="text-[11px] text-[#C7C7CC] mt-1.5 px-0.5">
                  {customType === "shared" ? "Split evenly among all participants" : "Only charged to those who opt in"}
                </p>
              </div>

              {/* ── Save ── */}
              <button
                disabled={!customName.trim()}
                onClick={() => {
                  if (!customName.trim()) return;
                  const est = parseFloat(customEstimate);
                  addBudgetCategory({
                    name: customName.trim(),
                    icon: customIcon,
                    type: customType,
                    estimate: !isNaN(est) && est > 0 ? est : 0,
                    actual: 0,
                  });
                  setCustomName(""); setCustomIcon("📦"); setCustomType("shared"); setCustomEstimate(""); setShowEmojiGrid(false);
                  setShowAddBudget(false);
                }}
                className="w-full py-[14px] bg-[#007AFF] text-white rounded-[14px] text-[17px] font-semibold shadow-[0_4px_12px_rgba(0,122,255,0.25)] disabled:opacity-35 disabled:shadow-none active:scale-[0.98] transition-all"
              >
                Add Category
              </button>
      </BottomSheet>

      {/* ─── Edit Category Sheet ──────────────────────────────────────────── */}
      <BottomSheet
        open={!!editCategoryId}
        onOpenChange={(o) => { if (!o) setEditCategoryId(null); }}
        title="Edit Category"
        subtitle="Update name, icon, or split type"
        srDescription="Edit the name, icon, and split type of this budget category."
      >
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">Name</p>
                  <input
                    value={editDraftName}
                    onChange={(e) => setEditDraftName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F7F7F5] rounded-[12px] text-[15px] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#FF9F0A]/30"
                  />
                </div>

                {/* Icon picker */}
                <div>
                  <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">Icon</p>
                  <div className="grid grid-cols-10 gap-1.5">
                    {CATEGORY_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setEditDraftIcon(emoji)}
                        className={`aspect-square rounded-[10px] flex items-center justify-center text-lg transition-all active:scale-90 ${
                          editDraftIcon === emoji
                            ? "bg-[#FFF3E0] ring-2 ring-[#FF9F0A]"
                            : "bg-[#F7F7F5]"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shared / Optional toggle */}
                <div>
                  <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">Split Type</p>
                  <div className="flex gap-2 p-1 bg-[#F1F2F5] rounded-[12px]">
                    <button
                      onClick={() => setEditDraftType("shared")}
                      className={`flex-1 py-2 rounded-[10px] text-[13px] font-semibold transition-all ${
                        editDraftType === "shared" ? "bg-white text-[#007AFF] shadow-sm" : "text-[#8E8E93]"
                      }`}
                    >
                      Shared
                    </button>
                    <button
                      onClick={() => setEditDraftType("optional")}
                      className={`flex-1 py-2 rounded-[10px] text-[13px] font-semibold transition-all ${
                        editDraftType === "optional" ? "bg-white text-[#8E8E93] shadow-sm" : "text-[#8E8E93]"
                      }`}
                    >
                      Optional
                    </button>
                  </div>
                  <p className="text-[11px] text-[#C7C7CC] mt-1.5 px-0.5">
                    {editDraftType === "shared" ? "Split evenly among all participants" : "Only charged to those who opt in"}
                  </p>
                </div>

                {/* Save */}
                <button
                  disabled={!editDraftName.trim()}
                  onClick={() => {
                    if (editCategoryId && editDraftName.trim()) {
                      updateBudgetCategory(editCategoryId, {
                        name: editDraftName.trim(),
                        icon: editDraftIcon,
                        type: editDraftType,
                      });
                      setEditCategoryId(null);
                    }
                  }}
                  className="w-full py-3.5 bg-[#1C1C1E] text-white rounded-[14px] text-[15px] font-semibold disabled:opacity-35 active:scale-[0.98] transition-all"
                >
                  Save Changes
                </button>

                {/* Delete */}
                <button
                  onClick={() => {
                    if (editCategoryId) { removeBudgetCategory(editCategoryId); setEditCategoryId(null); }
                  }}
                  className="w-full py-3 text-[#FF3B30] text-[15px] font-semibold active:scale-[0.98] transition-all"
                >
                  Delete Category
                </button>
              </div>
      </BottomSheet>

    </div>
  );
}

// ─── Policy Editor Form ──────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = [
  { name: "Lodging", icon: "🏠" },
  { name: "Gas & Transport", icon: "⛽" },
  { name: "Food & Dining", icon: "🍽" },
  { name: "Activities", icon: "🎟️" },
  { name: "Other", icon: "📦" },
];

const DROPOUT_PRESETS = [
  "Late dropouts forfeit 50% deposit",
  "Late dropouts forfeit 100% deposit",
  "Full refund up to 1 week before",
  "No refund policy",
];

type PolicyDraft = { amount: string; dueDate: string; covers: string[]; dropoutRule: string };

function PolicyEditorForm({
  draft,
  onChange,
  onSave,
  onCancel,
  isNew,
  budgetCategories,
  committedCount,
}: {
  draft: PolicyDraft;
  onChange: (d: PolicyDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  isNew: boolean;
  budgetCategories: { id: string; name: string; icon: string; estimate: number }[];
  committedCount: number;
}) {
  const canSave = parseFloat(draft.amount) > 0 && draft.dueDate.trim().length > 0;

  // Budget-derived suggestions — based on lodging (or highest estimate)
  const lodgingCat = budgetCategories.find((c) => c.name.toLowerCase().includes("lodging"))
    ?? budgetCategories.slice().sort((a, b) => b.estimate - a.estimate)[0];
  const safeCount = Math.max(committedCount, 1);
  const perPersonShare = lodgingCat && lodgingCat.estimate > 0 ? lodgingCat.estimate / safeCount : 0;
  const suggestions = perPersonShare > 0
    ? [
        { pct: 25, amount: Math.round(perPersonShare * 0.25), label: `25% of ${lodgingCat!.name}` },
        { pct: 40, amount: Math.round(perPersonShare * 0.40), label: `40% of ${lodgingCat!.name}` },
        { pct: 50, amount: Math.round(perPersonShare * 0.50), label: `50% of ${lodgingCat!.name}` },
      ]
    : [];

  // Which categories to show in "Applies toward" — real budget cats or defaults
  const coverOptions = budgetCategories.length > 0
    ? budgetCategories.map((c) => ({ name: c.name, icon: c.icon }))
    : DEFAULT_CATEGORIES;

  const toggleCover = (name: string) => {
    onChange({
      ...draft,
      covers: draft.covers.includes(name)
        ? draft.covers.filter((c) => c !== name)
        : [...draft.covers, name],
    });
  };

  return (
    <div className="bg-[#F7F7F5] rounded-[16px] p-4 space-y-4">
      <p className="text-[13px] font-semibold text-[#1C1C1E]">{isNew ? "Set Deposit Policy" : "Edit Policy"}</p>

      {/* ── Amount ── */}
      <div>
        <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-1.5">Amount per person</p>

        {/* Budget-derived suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-2">
            <p className="text-[11px] text-[#8E8E93] mb-1.5">
              Suggested · based on {lodgingCat!.name} ({safeCount} {safeCount === 1 ? "person" : "people"})
            </p>
            <div className="flex gap-2 flex-wrap">
              {suggestions.map((s) => (
                <button
                  key={s.pct}
                  onClick={() => onChange({ ...draft, amount: String(s.amount) })}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all active:scale-95 ${
                    draft.amount === String(s.amount)
                      ? "bg-[#007AFF] text-white"
                      : "bg-white text-[#007AFF] border border-[#007AFF]/20"
                  }`}
                >
                  ${s.amount} · {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 bg-white rounded-[12px] px-3 py-2.5 border-2 border-transparent focus-within:border-[#007AFF]/30">
          <span className="text-[16px] text-[#8E8E93]">$</span>
          <input
            type="number"
            placeholder={suggestions.length > 0 ? "or enter custom" : "0"}
            value={draft.amount}
            onChange={(e) => onChange({ ...draft, amount: e.target.value })}
            className="flex-1 text-[17px] font-semibold text-[#1C1C1E] bg-transparent focus:outline-none placeholder-[#C7C7CC]"
            autoFocus={isNew && suggestions.length === 0}
          />
        </div>
      </div>

      {/* ── Due date ── */}
      <div>
        <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-1.5">Due date</p>
        <input
          type="text"
          placeholder="e.g. Mar 20, 2026"
          value={draft.dueDate}
          onChange={(e) => onChange({ ...draft, dueDate: e.target.value })}
          className="w-full bg-white rounded-[12px] px-3 py-2.5 text-[14px] text-[#1C1C1E] placeholder-[#C7C7CC] focus:outline-none border-2 border-transparent focus:border-[#007AFF]/30"
        />
      </div>

      {/* ── Applies toward ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">Applies toward</p>
          {budgetCategories.length === 0 && (
            <span className="text-[10px] text-[#C7C7CC]">Add budget for real categories</span>
          )}
        </div>
        <div className="space-y-1.5">
          {coverOptions.map((cat) => {
            const isSelected = draft.covers.includes(cat.name);
            return (
              <button
                key={cat.name}
                onClick={() => toggleCover(cat.name)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] transition-colors ${isSelected ? "bg-[#007AFF]/10" : "bg-white"}`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-[14px]">{cat.icon}</span>
                  <span className={`text-[13px] font-medium ${isSelected ? "text-[#007AFF]" : "text-[#8E8E93]"}`}>{cat.name}</span>
                </span>
                <div className={`size-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-[#007AFF] bg-[#007AFF]" : "border-[#D1D1D6]"}`}>
                  {isSelected && <Check className="size-3 text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Dropout / refund rule ── */}
      <div>
        <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">Dropout / refund rule</p>
        <div className="space-y-1.5">
          {DROPOUT_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => onChange({ ...draft, dropoutRule: preset })}
              className={`w-full text-left px-3 py-2.5 rounded-[12px] text-[13px] transition-colors ${draft.dropoutRule === preset ? "bg-[#007AFF]/10 text-[#007AFF] font-medium" : "bg-white text-[#1C1C1E]"}`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onSave}
          disabled={!canSave}
          className={`flex-1 py-2.5 rounded-[12px] text-[13px] font-semibold transition-all ${canSave ? "bg-[#34C759] text-white active:scale-[0.98]" : "bg-[#E5E5EA] text-[#C7C7CC]"}`}
        >
          {isNew ? "Save Policy" : "Update Policy"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 bg-white text-[#8E8E93] rounded-[12px] text-[13px] font-medium hover:bg-[#F1F2F5] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Section Accordion ──────────────────────────────────────────────────────

function SectionAccordion({
  icon, iconBg, title, subtitle, isOpen, onToggle, badge, delay = 0, children,
}: {
  icon: React.ReactNode; iconBg: string; title: string; subtitle: string;
  isOpen: boolean; onToggle: () => void;
  badge?: { label: string; color: string; bg: string };
  delay?: number; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-[20px] shadow-[var(--shadow-apple-1)] overflow-hidden"
    >
      <button onClick={onToggle} className="w-full p-5 flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <div className={`size-10 rounded-[12px] ${iconBg} flex items-center justify-center flex-shrink-0`}>{icon}</div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold text-[#1C1C1E]">{title}</h3>
              {badge && <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.bg} ${badge.color}`}>{badge.label}</span>}
            </div>
            <p className="text-[12px] text-[#8E8E93] mt-0.5">{subtitle}</p>
          </div>
        </div>
        <ChevronDown className={`size-4 text-[#C7C7CC] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}