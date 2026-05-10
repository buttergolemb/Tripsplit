import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Check,
  X,
  Wallet,
  Pencil,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import React from "react";
import { AddExpenseSheet, YOU, AVATAR_COLORS, type ExpenseSavePayload } from "./AddExpenseSheet";
import { useTripData, type Expense } from "./TripDataContext";
import { useCurrentUser } from "../../lib/currentUser";
import { MoneyScreenSkeleton } from "./Skeletons";
import { saveReceiptPhoto, getReceiptPhoto } from "../../lib/receiptPhotos";

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

// ─── UI-only display data ───────────────────────────────────────────────────
// These are cosmetic and not part of the core trip domain. Payment handles
// and category colors can become profile/category tables later, but for the
// MVP they stay as presentation-only lookups.

const paymentPreferences: Record<string, { method: string; handle: string }> = {
  Sarah: { method: "Venmo", handle: "@sarah-k" },
  Mike: { method: "Zelle", handle: "mike@email.com" },
  Alex: { method: "Cash App", handle: "$alexjones" },
  Jordan: { method: "Venmo", handle: "@jordan.lee" },
  Taylor: { method: "Zelle", handle: "taylor@email.com" },
  Casey: { method: "Venmo", handle: "@caseyb" },
};

const categoryStyles: Record<string, string> = {
  Food: "bg-[#FFF3E0]",
  Gas: "bg-[#EAF2FF]",
  Groceries: "bg-[#E8F7EE]",
  Activities: "bg-[#F1EEFF]",
  Lodging: "bg-[#F1EEFF]",
};

function getCategoryStyle(category: string) {
  for (const key of Object.keys(categoryStyles)) {
    if (category.includes(key)) return categoryStyles[key];
  }
  return "bg-[#F1F2F5]";
}

const avatarColors = AVATAR_COLORS;

const paymentMethodColors: Record<string, string> = {
  Venmo: "text-[#008CFF]",
  Zelle: "text-[#6D1ED4]",
  "Cash App": "text-[#00C244]",
};

// ─── Success Toast ──────────────────────────────────────────────────────────

function ExpenseToast({
  emoji, description, amount, onDismiss,
}: {
  emoji: string; description: string; amount: string; onDismiss: () => void;
}) {
  React.useEffect(() => {
    const t = setTimeout(onDismiss, 3200);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ y: 80, opacity: 0, scale: 0.92 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 80, opacity: 0, scale: 0.92 }}
      transition={{ type: "spring", damping: 22, stiffness: 280 }}
      className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 bg-[#1C1C1E] text-white pl-3.5 pr-4 py-3 rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.28)] max-w-[320px] w-[calc(100%-32px)]"
      onClick={onDismiss}
    >
      <div className="size-9 rounded-[12px] bg-[#34C759]/20 flex items-center justify-center flex-shrink-0">
        <CheckCircle2 className="size-5 text-[#34C759]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-white leading-tight">Expense added!</p>
        <p className="text-[12px] text-[#AEAEB2] truncate mt-0.5">
          {emoji} {description} · <span className="text-[#34C759] font-semibold">${amount}</span> split with everyone
        </p>
      </div>
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-[20px] bg-[#34C759]/60 origin-left"
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 3.2, ease: "linear" }}
      />
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function MoneyScreen() {
  const { tripId } = useParams();
  const {
    trip, isLoading, addExpense, toggleSplitPaid, confirmExpense, removeExpense,
    updateExpense: updateExpenseFields,
  } = useTripData();

  // Who is currently using the app (persisted in localStorage). Falls back to
  // the legacy YOU label if the name isn't actually on this trip yet so UI
  // copy like "you owe" still renders sensibly.
  const [currentUserName] = useCurrentUser();
  const YOU_NAME = trip.participants.some((p) => p.name === currentUserName)
    ? currentUserName
    : YOU;

  const [showExpenseModal, setShowExpenseModal] = React.useState(false);
  // Store only the id — the sheet resolves the live expense from trip data
  // every render so mutations (pay, edit) flow straight through.
  const [selectedExpenseId, setSelectedExpenseId] = React.useState<string | null>(null);
  const [showSummary, setShowSummary] = React.useState(false);
  const [toast, setToast] = React.useState<{ emoji: string; description: string; amount: string } | null>(null);

  const selectedExpense: Expense | null = React.useMemo(
    () => trip.expenses.find((e) => e.id === selectedExpenseId) ?? null,
    [trip.expenses, selectedExpenseId]
  );

  useBodyScrollLock(!!selectedExpenseId || showExpenseModal);

  if (isLoading) {
    return <MoneyScreenSkeleton />;
  }

  if (!trip.id || trip.participants.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
        <div className="text-center bg-white rounded-[22px] p-8 mx-4 shadow-[var(--shadow-apple-1)]">
          <h2 className="text-[20px] font-semibold text-[#1C1C1E] mb-4">Trip not found</h2>
          <Link to="/" className="text-[#007AFF] font-medium">Return to trips</Link>
        </div>
      </div>
    );
  }

  const participantNames = trip.participants.map((p) => p.name);
  const confirmedExpenses = trip.expenses.filter((e) => e.confirmed);
  const unconfirmedExpenses = trip.expenses.filter((e) => !e.confirmed);
  const tripTotal = confirmedExpenses.reduce((s, e) => s + e.amount, 0);
  const perPerson = participantNames.length > 0 ? tripTotal / participantNames.length : 0;

  // Personal POV metrics — everything below is framed around "me", the
  // signed-in user (YOU). Group-wide totals stay available for the expandable
  // "Who's Paid What" section but don't dominate the page.
  const youSpent = confirmedExpenses
    .filter((e) => e.paidBy === YOU_NAME)
    .reduce((s, e) => s + e.amount, 0);

  const youOweTotal = confirmedExpenses
    .filter((e) => e.paidBy !== YOU_NAME)
    .reduce((sum, e) => {
      const yourShare = e.splitWith.find((s) => s.name === YOU_NAME);
      if (!yourShare || yourShare.paid) return sum;
      return sum + yourShare.share;
    }, 0);

  const othersOweYou = confirmedExpenses
    .filter((e) => e.paidBy === YOU_NAME)
    .reduce((sum, e) => {
      for (const s of e.splitWith) {
        if (s.name === YOU_NAME || s.paid) continue;
        sum += s.share;
      }
      return sum;
    }, 0);

  const youNet = othersOweYou - youOweTotal; // +ve = net into your pocket

  // Pairwise balances between YOU and each other member, derived from
  // expense splits rather than the server-side greedy settlements (the user
  // wants "Sarah owes me $X" scoped to this person, not round-trip reshuffles).
  const personalPairs = trip.participants
    .filter((p) => p.name !== YOU_NAME)
    .map((p) => {
      let net = 0;
      for (const e of confirmedExpenses) {
        if (e.paidBy === YOU_NAME) {
          const s = e.splitWith.find((x) => x.name === p.name);
          if (s && !s.paid) net += s.share; // they owe me
        } else if (e.paidBy === p.name) {
          const s = e.splitWith.find((x) => x.name === YOU_NAME);
          if (s && !s.paid) net -= s.share; // I owe them
        }
      }
      return { name: p.name, memberId: p.id, net };
    })
    .filter((b) => Math.abs(b.net) >= 0.01)
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));

  // Payment-settlement progress across the whole trip.
  let totalPaymentSlots = 0;
  let completedPayments = 0;
  for (const e of confirmedExpenses) {
    for (const s of e.splitWith) {
      if (s.name === e.paidBy) continue;
      totalPaymentSlots++;
      if (s.paid) completedPayments++;
    }
  }

  const togglePayment = (expense: Expense, memberName: string) => {
    const split = expense.splitWith.find((s) => s.name === memberName);
    if (!split) return;
    toggleSplitPaid(expense.id, split.memberId, !split.paid);
  };

  // Mark every unpaid split between YOU and `memberName` as paid in one go.
  // - If they owe you: mark their splits across all expenses you paid as paid.
  // - If you owe them: mark your splits across all expenses they paid as paid.
  // Either way, this clears the entire pairwise debt.
  const [pendingSettle, setPendingSettle] = React.useState<string | null>(null);
  const settleAllWith = (memberName: string) => {
    for (const e of confirmedExpenses) {
      if (e.paidBy === YOU_NAME) {
        const split = e.splitWith.find((s) => s.name === memberName && !s.paid);
        if (split) toggleSplitPaid(e.id, split.memberId, true);
      } else if (e.paidBy === memberName) {
        const yours = e.splitWith.find((s) => s.name === YOU_NAME && !s.paid);
        if (yours) toggleSplitPaid(e.id, yours.memberId, true);
      }
    }
    setPendingSettle(null);
  };

  const getExpensePaidCount = (expense: Expense) => {
    const owes = expense.splitWith.filter((s) => s.name !== expense.paidBy);
    const paid = owes.filter((s) => s.paid).length;
    return { paid, total: owes.length };
  };

  const expensesByDate: Record<string, Expense[]> = {};
  for (const expense of trip.expenses) {
    const key = expense.date || "Undated";
    (expensesByDate[key] ??= []).push(expense);
  }

  // Per-person "paid vs fair share" breakdown used by the collapsible
  // "Who's Paid What" card. Net = paid − owed; positive means the trip
  // currently owes this person money.
  const personBalances = trip.participants.map((p) => {
    const paid = confirmedExpenses
      .filter((e) => e.paidBy === p.name)
      .reduce((s, e) => s + e.amount, 0);
    const owed = confirmedExpenses
      .flatMap((e) => e.splitWith.filter((s) => s.name === p.name))
      .reduce((s, x) => s + x.share, 0);
    return { memberId: p.id, name: p.name, paid, owed, net: paid - owed };
  });

  const handleExpenseSaved = (info: ExpenseSavePayload) => {
    const amountNum = parseFloat(info.amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) return;

    // Resolve the picked "paid by" name to the live participant object so we
    // can attach the correct memberId. If anything is off we fall back to the
    // current user so the expense still saves with a sensible payer.
    const payer =
      trip.participants.find((p) => p.name === info.paidByName) ??
      trip.participants.find((p) => p.name === YOU_NAME) ??
      trip.participants[0];

    // AddExpenseSheet already computes real shares (equal or custom) — we
    // just need to map names to the trip's member IDs. Participants not in
    // the picked split are simply excluded from splitWith.
    const splits = info.splits
      .map((s) => {
        const match = trip.participants.find((p) => p.name === s.name);
        if (!match) return null;
        return {
          name: match.name,
          memberId: match.id,
          share: +s.share.toFixed(2),
          paid: false,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    // Guard against an empty split (e.g. all names were unmapped). In that
    // edge case fall back to an equal split so we don't persist a $0 expense.
    const safeSplits =
      splits.length > 0
        ? splits
        : trip.participants.map((p) => ({
            name: p.name,
            memberId: p.id,
            share: +(amountNum / trip.participants.length).toFixed(2),
            paid: false,
          }));

    addExpense({
      description: info.description,
      category: `${info.emoji} ${info.categoryName}`,
      emoji: info.emoji,
      amount: amountNum,
      paidBy: payer.name,
      paidById: payer.id,
      date: new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
      confirmed: true,
      splitWith: safeSplits,
    });

    // Persist the receipt photo client-side so the expense detail sheet
    // can render it later (the backend MVP doesn't store image URLs).
    if (info.receiptImage && trip.id) {
      saveReceiptPhoto(trip.id, info.description, amountNum, info.receiptImage);
    }

    setShowExpenseModal(false);
    setTimeout(() => setToast({
      emoji: info.emoji, description: info.description,
      amount: info.amount, categoryName: info.categoryName,
    }), 200);
  };

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-6 pt-14 pb-2">
        <div className="flex items-center justify-between mb-4">
          <Link
            to={`/trip/${tripId}`}
            className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-all active:scale-95"
            aria-label="Back to trip overview"
          >
            <ArrowLeft className="size-5 text-[#007AFF]" />
          </Link>
        </div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-[28px] font-semibold text-[#1C1C1E] tracking-tight leading-tight">
            Money
          </h1>
          <p className="text-[13px] text-[#8E8E93] font-medium mt-0.5">
            {trip.emoji} {trip.name}
          </p>
        </motion.div>
      </div>

      <div className="px-4 space-y-4 mt-2">
        {/* Personal Summary Card — POV of the signed-in user */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-[20px] p-5 shadow-[var(--shadow-apple-1)]"
        >
          <p className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-1">
            Total You Spent
          </p>
          <p className="text-[32px] font-semibold text-[#1C1C1E] tracking-tight leading-none">
            ${youSpent.toFixed(0)}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-[#FFF3E0] rounded-[14px] p-3.5">
              <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                You Owe
              </p>
              <p className="text-[20px] font-semibold text-[#FF9F0A] tracking-tight mt-0.5">
                ${youOweTotal.toFixed(2)}
              </p>
            </div>
            <div className="bg-[#E8F7EE] rounded-[14px] p-3.5">
              <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                Owed to You
              </p>
              <p className="text-[20px] font-semibold text-[#34C759] tracking-tight mt-0.5">
                ${othersOweYou.toFixed(2)}
              </p>
            </div>
          </div>

          {(youOweTotal > 0 || othersOweYou > 0) && (
            <p className="text-[12px] text-[#8E8E93] mt-3">
              {Math.abs(youNet) < 0.01 ? (
                <>You're all squared up.</>
              ) : youNet > 0 ? (
                <>You're <span className="font-semibold text-[#34C759]">${youNet.toFixed(2)} ahead</span> on the trip.</>
              ) : (
                <>You're <span className="font-semibold text-[#FF9F0A]">${Math.abs(youNet).toFixed(2)} behind</span> on the trip.</>
              )}
            </p>
          )}
        </motion.div>

        {/* Unconfirmed Expenses — Confirm / Dispute flow */}
        {unconfirmedExpenses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-[#FFF3E0] rounded-[18px] p-4 shadow-[var(--shadow-apple-1)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-9 bg-[#FF9F0A]/20 rounded-[10px] flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="size-5 text-[#FF9F0A]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#1C1C1E]">Needs Confirmation</h3>
                  <p className="text-[12px] text-[#8E8E93]">
                    {unconfirmedExpenses.length} expense{unconfirmedExpenses.length > 1 ? "s" : ""} waiting for approval
                  </p>
                </div>
              </div>
              {unconfirmedExpenses.map((expense) => {
                const yourShare = expense.splitWith.find((s) => s.name === YOU_NAME);
                return (
                  <div key={expense.id} className="bg-white rounded-[14px] p-3.5 mb-2 last:mb-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`size-9 rounded-[12px] flex items-center justify-center text-[16px] ${getCategoryStyle(expense.category)}`}>
                        {expense.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-[#1C1C1E] truncate">
                          {expense.description}
                        </p>
                        <p className="text-[11px] text-[#8E8E93]">
                          {expense.paidBy} paid · ${expense.amount.toFixed(2)}
                          {yourShare ? ` · your share $${yourShare.share.toFixed(2)}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => confirmExpense(expense.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-[10px] bg-[#34C759] text-white text-[13px] font-semibold active:brightness-95"
                      >
                        <Check className="size-4" strokeWidth={3} />
                        Confirm
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => removeExpense(expense.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-[10px] bg-white text-[#FF2D55] text-[13px] font-semibold border border-[#FF2D55]/30 active:bg-[#FFE8EF]"
                      >
                        <X className="size-4" strokeWidth={3} />
                        Dispute
                      </motion.button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty State — three flavors:
            • No expenses at all → CTA to add the first one.
            • Only unconfirmed exist → quieter nudge pointing upward at the
              "Needs Confirmation" card so the user knows where to go next.
            • Confirmed expenses exist → no empty card (the feed renders). */}
        {trip.expenses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-center py-8"
          >
            <div className="size-20 bg-[#F1F2F5] rounded-[24px] flex items-center justify-center mx-auto mb-5">
              <Wallet className="size-9 text-[#C7C7CC]" />
            </div>
            <h2 className="text-[20px] font-semibold text-[#1C1C1E] mb-2">No expenses yet</h2>
            <p className="text-[15px] text-[#8E8E93] mb-6 leading-relaxed max-w-[260px] mx-auto">
              Add your first expense when the trip starts.
            </p>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#007AFF] text-white rounded-[14px] font-semibold text-[15px] shadow-[0_4px_12px_rgba(0,122,255,0.25)] active:scale-[0.98] transition-all"
            >
              <Plus className="size-5" />
              Add First Expense
            </button>
          </motion.div>
        )}

        {trip.expenses.length > 0 && confirmedExpenses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[18px] p-5 text-center shadow-[var(--shadow-apple-1)]"
          >
            <p className="text-[15px] font-medium text-[#1C1C1E] mb-1">
              Everything's waiting for approval
            </p>
            <p className="text-[13px] text-[#8E8E93] leading-relaxed max-w-[260px] mx-auto">
              Confirm the {unconfirmedExpenses.length === 1 ? "pending expense" : `${unconfirmedExpenses.length} pending expenses`} above to start tracking who owes who.
            </p>
          </motion.div>
        )}

        {/* Expense Feed */}
        {Object.entries(expensesByDate).map(([date, expenses], dateIndex) => {
          const confirmedInDay = expenses.filter((e) => e.confirmed);
          if (confirmedInDay.length === 0) return null;
          return (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + dateIndex * 0.05 }}
            >
              <h3 className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2.5 px-1">
                {date}
              </h3>
              <div className="space-y-2">
                {confirmedInDay.map((expense, i) => {
                  const { paid, total } = getExpensePaidCount(expense);
                  const isFullySettled = total > 0 && paid === total;
                  const yourShare = expense.splitWith.find((s) => s.name === YOU_NAME);
                  const youPaidThis = expense.paidBy === YOU_NAME;
                  const youSettled = youPaidThis || !!yourShare?.paid;
                  return (
                    <motion.button
                      key={expense.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedExpenseId(expense.id)}
                      className={`w-full bg-white rounded-[16px] p-3.5 shadow-[var(--shadow-apple-1)] text-left transition-opacity ${isFullySettled ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`size-11 rounded-[14px] flex items-center justify-center text-lg flex-shrink-0 ${getCategoryStyle(expense.category)}`}>
                          {expense.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[15px] font-semibold text-[#1C1C1E] truncate pr-2">
                              {expense.description}
                            </h4>
                            <p className="text-[15px] font-semibold text-[#1C1C1E] flex-shrink-0">
                              ${expense.amount.toFixed(0)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-[12px] text-[#8E8E93] truncate">
                              {expense.paidBy} paid
                            </p>
                            {youPaidThis ? (
                              <span className="text-[12px] font-semibold text-[#007AFF] flex-shrink-0">You paid</span>
                            ) : youSettled ? (
                              <span className="text-[12px] font-semibold text-[#34C759] flex-shrink-0">✓ Settled</span>
                            ) : (
                              <span className="text-[12px] font-semibold text-[#FF9F0A] flex-shrink-0">
                                You owe ${yourShare?.share.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            {expense.splitWith
                              .filter((s) => s.name !== expense.paidBy)
                              .map((s) => (
                                <div
                                  key={s.memberId}
                                  className={`size-5 rounded-full flex items-center justify-center text-[8px] font-semibold transition-all ${
                                    s.paid
                                      ? `${avatarColors[s.name[0]] || "bg-[#8E8E93]"} text-white ring-[1.5px] ring-[#34C759]`
                                      : "bg-[#F1F2F5] text-[#8E8E93]"
                                  }`}
                                >
                                  {s.paid ? <Check className="size-2.5 text-white" strokeWidth={3} /> : s.name[0]}
                                </div>
                              ))}
                            <span className="text-[10px] text-[#8E8E93] ml-1">{paid}/{total}</span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}

        {/* Spending by Category */}
        {confirmedExpenses.length > 0 && (
          <CategoryBreakdown expenses={confirmedExpenses} />
        )}

        {/* Who's Paid What */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="w-full bg-white rounded-[18px] p-4 text-left shadow-[var(--shadow-apple-1)] active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-[#1C1C1E]">Who's Paid What</h3>
                <p className="text-[12px] text-[#8E8E93] mt-0.5">
                  ${tripTotal.toFixed(0)} total · ${perPerson.toFixed(0)}/person fair share
                </p>
              </div>
              <ChevronDown className={`size-4 text-[#C7C7CC] transition-transform ${showSummary ? "rotate-180" : ""}`} />
            </div>
          </button>

          <AnimatePresence>
            {showSummary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-2">
                  {[...personBalances]
                    .sort((a, b) => (b.net ?? 0) - (a.net ?? 0))
                    .map((person) => (
                      <div
                        key={person.memberId}
                        className="bg-white rounded-[14px] p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`size-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold ${avatarColors[person.name[0]] || "bg-[#8E8E93]"}`}>
                            {person.name[0]}
                          </div>
                          <div>
                            <p className="text-[14px] font-medium text-[#1C1C1E]">{person.name}</p>
                            <div className="flex items-center gap-1.5">
                              <p className="text-[11px] text-[#8E8E93]">Paid ${person.paid.toFixed(0)}</p>
                              {paymentPreferences[person.name] && (
                                <>
                                  <span className="text-[#D1D1D6]">·</span>
                                  <p className={`text-[11px] font-medium ${paymentMethodColors[paymentPreferences[person.name].method] || "text-[#8E8E93]"}`}>
                                    {paymentPreferences[person.name].method}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className={`text-[15px] font-semibold ${(person.net ?? 0) > 0 ? "text-[#34C759]" : (person.net ?? 0) < 0 ? "text-[#FF9F0A]" : "text-[#8E8E93]"}`}>
                          {(person.net ?? 0) > 0 ? "+" : ""}
                          {Math.abs(person.net ?? 0) < 0.01 ? "Even" : `$${Math.abs(person.net ?? 0).toFixed(0)}`}
                        </span>
                      </div>
                    ))}
                </div>
                {personalPairs.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#F1F2F5]">
                    <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 px-1">
                      Between You and Others
                    </p>
                    <div className="space-y-1.5">
                      {personalPairs.map((pair) => {
                        const theyOweMe = pair.net > 0;
                        const amount = Math.abs(pair.net).toFixed(2);
                        const isPending = pendingSettle === pair.name;
                        return (
                          <div
                            key={pair.memberId}
                            className="bg-white rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden"
                          >
                            <div className="flex items-center justify-between px-3 py-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`size-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0 ${avatarColors[pair.name[0]] || "bg-[#8E8E93]"}`}>
                                  {pair.name[0]}
                                </div>
                                <p className="text-[13px] text-[#1C1C1E] truncate">
                                  {theyOweMe ? (
                                    <><span className="font-semibold">{pair.name}</span> owes me</>
                                  ) : (
                                    <>I owe <span className="font-semibold">{pair.name}</span></>
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                <span className={`text-[14px] font-semibold ${theyOweMe ? "text-[#34C759]" : "text-[#FF9F0A]"}`}>
                                  ${amount}
                                </span>
                                <motion.button
                                  whileTap={{ scale: 0.94 }}
                                  onClick={(e) => { e.stopPropagation(); setPendingSettle(isPending ? null : pair.name); }}
                                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
                                    isPending ? "bg-[#FF9F0A] text-white" : "bg-[#EAF2FF] text-[#007AFF]"
                                  }`}
                                >
                                  {isPending ? "Cancel" : "Settle"}
                                </motion.button>
                              </div>
                            </div>
                            <AnimatePresence>
                              {isPending && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.18 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-3 pb-2.5 pt-0">
                                    <p className="text-[11px] text-[#6E6E73] mb-2 leading-snug">
                                      {theyOweMe
                                        ? `Mark $${amount} as received from ${pair.name}? This clears every split between you.`
                                        : `Mark $${amount} as paid to ${pair.name}? This clears every split between you.`}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setPendingSettle(null); }}
                                        className="flex-1 h-8 rounded-[10px] bg-[#F1F2F5] text-[#1C1C1E] text-[12px] font-semibold active:scale-[0.97] transition-transform"
                                      >
                                        Cancel
                                      </button>
                                      <motion.button
                                        whileTap={{ scale: 0.97 }}
                                        onClick={(e) => { e.stopPropagation(); settleAllWith(pair.name); }}
                                        className="flex-1 h-8 rounded-[10px] bg-[#34C759] text-white text-[12px] font-semibold shadow-[0_2px_8px_rgba(52,199,89,0.3)]"
                                      >
                                        ✓ Mark settled
                                      </motion.button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="bg-[#EAF2FF] rounded-[14px] p-3.5 mt-3">
                  <p className="text-[12px] font-semibold text-[#1C1C1E] mb-0.5">
                    Tap any expense to settle up
                  </p>
                  <p className="text-[11px] text-[#6E6E73]">
                    Balances update live as payments are marked paid.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* FAB */}
      <div className="fixed bottom-24 right-5 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowExpenseModal(true)}
          aria-label="Add expense"
          className="bg-[#007AFF] text-white rounded-full p-3.5 shadow-[0_6px_20px_rgba(0,122,255,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#007AFF]"
        >
          <Plus className="size-6 stroke-[2.5]" aria-hidden />
        </motion.button>
      </div>

      {/* ─── Expense Detail Sheet ──────────────────────────────────────── */}
      <AnimatePresence>
        {selectedExpense && (
          <ExpenseDetailSheet
            expense={selectedExpense}
            tripId={trip.id}
            onTogglePayment={togglePayment}
            onClose={() => setSelectedExpenseId(null)}
            onEdit={(patch) =>
              updateExpenseFields(selectedExpense.id, patch)
            }
            onDelete={() => {
              removeExpense(selectedExpense.id);
              setSelectedExpenseId(null);
            }}
            currentUser={YOU_NAME}
          />
        )}
      </AnimatePresence>

      {/* ─── Add Expense Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showExpenseModal && (
          <AddExpenseSheet
            onClose={() => setShowExpenseModal(false)}
            participants={participantNames}
            onSaved={handleExpenseSaved}
            tripId={trip.id}
          />
        )}
      </AnimatePresence>

      {/* ─── Success Toast ────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <ExpenseToast
            emoji={toast.emoji}
            description={toast.description}
            amount={toast.amount}
            onDismiss={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Expense Detail Sheet ───────────────────────────────────────────────────

function ExpenseDetailSheet({
  expense, tripId, onTogglePayment, onClose, onEdit, onDelete, currentUser,
}: {
  expense: Expense;
  tripId: string;
  onTogglePayment: (expense: Expense, personName: string) => void;
  onClose: () => void;
  onEdit: (patch: { description?: string; amount?: number }) => void;
  onDelete: () => void;
  currentUser: string;
}) {
  const owes = expense.splitWith.filter((s) => s.name !== expense.paidBy);
  const paidCount = owes.filter((s) => s.paid).length;
  const isFullySettled = owes.length > 0 && paidCount === owes.length;
  const yourShare = expense.splitWith.find((s) => s.name === currentUser);
  const youPaidThis = expense.paidBy === currentUser;
  const youSettled = youPaidThis || !!yourShare?.paid;
  const settledPct = owes.length > 0 ? (paidCount / owes.length) * 100 : 0;

  const [editing, setEditing] = React.useState(false);
  const [draftDesc, setDraftDesc] = React.useState(expense.description);
  const [draftAmount, setDraftAmount] = React.useState(expense.amount.toFixed(2));
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [showFullReceipt, setShowFullReceipt] = React.useState(false);

  // Pull the receipt photo (if any was attached at scan time) from the
  // client-side store. Recomputed when the underlying expense changes.
  const receiptPhoto = React.useMemo(
    () => (tripId ? getReceiptPhoto(tripId, expense.description, expense.amount) : null),
    [tripId, expense.description, expense.amount],
  );

  // When the underlying expense changes (e.g. after an edit saves) keep the
  // draft values fresh so cancelling doesn't revert to stale strings.
  React.useEffect(() => {
    if (!editing) {
      setDraftDesc(expense.description);
      setDraftAmount(expense.amount.toFixed(2));
    }
  }, [expense.description, expense.amount, editing]);

  // Keyboard dismissal — Escape closes the sheet unless the user is mid-edit,
  // in which case a first Escape press cancels the edit and a second closes.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (confirmingDelete) {
        setConfirmingDelete(false);
        return;
      }
      if (editing) {
        setEditing(false);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, confirmingDelete, onClose]);

  const handleSaveEdit = () => {
    const nextDesc = draftDesc.trim();
    const nextAmount = parseFloat(draftAmount);
    const patch: { description?: string; amount?: number } = {};
    if (nextDesc && nextDesc !== expense.description) patch.description = nextDesc;
    if (Number.isFinite(nextAmount) && nextAmount > 0 && Math.abs(nextAmount - expense.amount) > 0.001) {
      patch.amount = Math.round(nextAmount * 100) / 100;
    }
    if (Object.keys(patch).length > 0) onEdit(patch);
    setEditing(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        initial={{ y: "100%", opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        className="fixed inset-x-0 bottom-0 z-[60] bg-white rounded-t-[28px] shadow-[var(--shadow-apple-3)] max-h-[85vh] overflow-y-auto overscroll-contain max-w-lg mx-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Expense details for ${expense.description}`}
      >
        <div className="sticky top-0 bg-white rounded-t-[28px] z-10 pt-3 pb-2">
          <div className="w-9 h-[5px] rounded-full bg-[#E5E5EA] mx-auto" />
        </div>

        <div className="px-6 pb-8">
          {/* Receipt photo (if scanned) */}
          {receiptPhoto && (
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowFullReceipt(true)}
              className="w-full mb-4 relative rounded-[16px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-black"
              aria-label="View original receipt"
            >
              <img
                src={receiptPhoto}
                alt="Original receipt"
                className="w-full object-cover"
                style={{ maxHeight: 220 }}
              />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                <span className="text-white text-[11px] font-semibold tracking-wide uppercase opacity-90">Original Receipt</span>
                <span className="text-white text-[11px] font-semibold bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">Tap to expand</span>
              </div>
            </motion.button>
          )}

          <div className="text-center mb-5">
            <div className={`size-16 rounded-[20px] flex items-center justify-center text-3xl mx-auto mb-3 ${getCategoryStyle(expense.category)}`}>
              {expense.emoji}
            </div>
            {editing ? (
              <input
                type="text"
                value={draftDesc}
                onChange={(e) => setDraftDesc(e.target.value)}
                placeholder="Description"
                className="w-full text-center text-[20px] font-semibold text-[#1C1C1E] bg-[#F7F7F5] rounded-[12px] px-3 py-2 outline-none focus:ring-[1.5px] focus:ring-[#007AFF]/40"
                autoFocus
              />
            ) : (
              <h2 className="text-[20px] font-semibold text-[#1C1C1E] mb-0.5">{expense.description}</h2>
            )}
            <p className="text-[13px] text-[#8E8E93] mt-1">{expense.date}</p>
            {editing ? (
              <div className="mt-3 flex items-center justify-center gap-1">
                <span className="text-[28px] font-semibold text-[#C7C7CC]">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={draftAmount}
                  onChange={(e) => setDraftAmount(e.target.value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1"))}
                  className="w-40 text-center text-[36px] font-semibold text-[#1C1C1E] tracking-tight bg-[#F7F7F5] rounded-[12px] px-2 py-1 outline-none focus:ring-[1.5px] focus:ring-[#007AFF]/40"
                />
              </div>
            ) : (
              <p className="text-[36px] font-semibold text-[#1C1C1E] tracking-tight mt-2">${expense.amount.toFixed(2)}</p>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 mb-5">
            <div className={`size-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold ${avatarColors[expense.paidBy[0]] || "bg-[#8E8E93]"}`}>
              {expense.paidBy[0]}
            </div>
            <p className="text-[14px] text-[#8E8E93]">
              Paid by <span className="font-semibold text-[#1C1C1E]">{expense.paidBy}</span>
            </p>
            {paymentPreferences[expense.paidBy] && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F1F2F5] ${paymentMethodColors[paymentPreferences[expense.paidBy].method] || "text-[#8E8E93]"}`}>
                {paymentPreferences[expense.paidBy].method}
              </span>
            )}
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-semibold text-[#8E8E93]">
                {isFullySettled ? "✓ Fully Settled" : `${paidCount}/${owes.length} settled`}
              </span>
              {isFullySettled && <CheckCircle2 className="size-4 text-[#34C759]" />}
            </div>
            <div className="h-2 bg-[#F1F2F5] rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${settledPct}%` }}
                transition={{ type: "spring", damping: 22, stiffness: 220 }}
                className={`h-full rounded-full ${isFullySettled ? "bg-[#34C759]" : "bg-[#007AFF]"}`}
              />
            </div>
          </div>

          {yourShare && (
            <div className={`rounded-[14px] p-4 flex items-center justify-between mb-4 ${youPaidThis ? "bg-[#EAF2FF]" : youSettled ? "bg-[#E8F7EE]" : "bg-[#FFF3E0]"}`}>
              <span className={`text-[14px] font-semibold ${youPaidThis ? "text-[#007AFF]" : youSettled ? "text-[#34C759]" : "text-[#FF9F0A]"}`}>
                {youPaidThis ? "You covered this" : youSettled ? "You're settled" : "Your share"}
              </span>
              <span className={`text-[17px] font-semibold ${youPaidThis ? "text-[#007AFF]" : youSettled ? "text-[#34C759]" : "text-[#FF9F0A]"}`}>
                ${youPaidThis ? expense.amount.toFixed(2) : yourShare.share.toFixed(2)}
              </span>
            </div>
          )}

          <div className="bg-[#F7F7F5] rounded-[16px] p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                Split · ${(expense.amount / Math.max(expense.splitWith.length, 1)).toFixed(2)} each
              </h4>
              {/* Quick "Mark all paid" shortcut — only relevant when someone
                  still owes money. Flips every unpaid split to paid in one tap
                  (and each individual Pay button is still optimistic, so this
                  feels instant). */}
              {owes.some((p) => !p.paid) && (
                <button
                  onClick={() => {
                    for (const p of owes) {
                      if (!p.paid) onTogglePayment(expense, p.name);
                    }
                  }}
                  className="text-[12px] font-semibold text-[#007AFF] active:opacity-60 transition-opacity"
                >
                  Mark all paid
                </button>
              )}
            </div>
            <div className="space-y-2">
              {owes.map((person) => {
                const pref = paymentPreferences[person.name];
                const isYou = person.name === currentUser;
                return (
                  <div key={person.memberId}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`size-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold ${avatarColors[person.name[0]] || "bg-[#8E8E93]"}`}>
                          {person.name[0]}
                        </div>
                        <div>
                          <p className="text-[14px] text-[#1C1C1E] font-medium">
                            {person.name}
                            {isYou && <span className="text-[11px] text-[#8E8E93] font-normal ml-1">(you)</span>}
                          </p>
                          {pref && (
                            <p className="text-[10px] text-[#8E8E93]">
                              <span className={`font-medium ${paymentMethodColors[pref.method] || ""}`}>{pref.method}</span>{" "}{pref.handle}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[14px] font-semibold text-[#1C1C1E]">${person.share.toFixed(2)}</span>
                        <motion.button
                          key={person.memberId}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onTogglePayment(expense, person.name)}
                          animate={{
                            backgroundColor: person.paid ? "#E5F5EB" : "#EAF2FF",
                            color: person.paid ? "#34C759" : "#007AFF",
                          }}
                          transition={{ type: "spring", damping: 22, stiffness: 260 }}
                          className="px-3 py-1.5 rounded-full text-[12px] font-semibold min-w-[52px] text-center"
                        >
                          {person.paid ? "✓ Paid" : "Pay"}
                        </motion.button>
                      </div>
                    </div>
                    {person !== owes[owes.length - 1] && <div className="h-px bg-[#F1F2F5] ml-[42px] my-2" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Edit / Delete action bar ─────────────────────────────── */}
          {editing ? (
            <div className="flex items-center gap-2.5 mt-2">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 h-11 rounded-[14px] bg-[#F1F2F5] text-[#1C1C1E] font-semibold text-[14px] active:scale-[0.98] transition-transform"
              >
                Cancel
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveEdit}
                className="flex-1 h-11 rounded-[14px] bg-[#007AFF] text-white font-semibold text-[14px] shadow-[0_3px_10px_rgba(0,122,255,0.3)]"
              >
                Save
              </motion.button>
            </div>
          ) : confirmingDelete ? (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FFE8EF] rounded-[16px] p-3.5 mt-2"
            >
              <p className="text-[13px] text-[#1C1C1E] font-medium mb-2.5">
                Delete "{expense.description}"? This can't be undone.
              </p>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setConfirmingDelete(false)}
                  className="flex-1 h-10 rounded-[12px] bg-white text-[#1C1C1E] font-semibold text-[13px] active:scale-[0.98] transition-transform"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onDelete}
                  className="flex-1 h-10 rounded-[12px] bg-[#FF2D55] text-white font-semibold text-[13px] shadow-[0_3px_10px_rgba(255,45,85,0.3)]"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2.5 mt-2">
              <button
                onClick={() => setEditing(true)}
                className="flex-1 flex items-center justify-center gap-1.5 h-11 rounded-[14px] bg-[#F1F2F5] text-[#1C1C1E] font-semibold text-[14px] active:scale-[0.98] transition-transform"
              >
                <Pencil className="size-4" strokeWidth={2.2} />
                Edit
              </button>
              <button
                onClick={() => setConfirmingDelete(true)}
                className="flex-1 flex items-center justify-center gap-1.5 h-11 rounded-[14px] bg-[#FFE8EF] text-[#FF2D55] font-semibold text-[14px] active:scale-[0.98] transition-transform"
              >
                <Trash2 className="size-4" strokeWidth={2.2} />
                Delete
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Full-screen receipt photo viewer */}
      <AnimatePresence>
        {showFullReceipt && receiptPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center"
            onClick={() => setShowFullReceipt(false)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={receiptPhoto}
              alt="Receipt"
              className="max-w-[92%] max-h-[88%] rounded-[14px] shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setShowFullReceipt(false)}
              className="absolute top-[max(env(safe-area-inset-top),16px)] right-4 size-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center"
              aria-label="Close receipt"
            >
              <X className="size-5 text-white" strokeWidth={2.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Category Breakdown ─────────────────────────────────────────────────────

const CATEGORY_BAR_COLORS = [
  "#34C759", // green
  "#007AFF", // blue
  "#FF9F0A", // orange
  "#AF52DE", // purple
  "#FF6482", // pink
  "#5AC8FA", // teal
  "#FFD60A", // yellow
];

function CategoryBreakdown({ expenses }: { expenses: Expense[] }) {
  // Strip the leading emoji from "🍕 Food" → "Food"; keep the emoji separately.
  const buckets = React.useMemo(() => {
    const map = new Map<string, { name: string; emoji: string; total: number }>();
    for (const e of expenses) {
      const raw = e.category || "Other";
      const m = raw.match(/^\s*(\p{Extended_Pictographic}\uFE0F?)?\s*(.*)$/u);
      const emoji = m?.[1] || e.emoji || "💸";
      const name = (m?.[2] || raw).trim() || "Other";
      const key = name.toLowerCase();
      const cur = map.get(key);
      if (cur) cur.total += e.amount;
      else map.set(key, { name, emoji, total: e.amount });
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [expenses]);

  const grandTotal = buckets.reduce((s, b) => s + b.total, 0);
  if (buckets.length === 0 || grandTotal <= 0) return null;
  const max = buckets[0].total;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28 }}
      className="bg-white rounded-[18px] p-4 shadow-[var(--shadow-apple-1)]"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-semibold text-[#1C1C1E]">Spending by Category</h3>
        <span className="text-[12px] text-[#8E8E93]">${grandTotal.toFixed(0)} total</span>
      </div>

      {/* Stacked progress bar */}
      <div className="h-2.5 rounded-full overflow-hidden flex bg-[#F1F2F5] mb-4">
        {buckets.map((b, i) => (
          <div
            key={b.name}
            style={{
              width: `${(b.total / grandTotal) * 100}%`,
              backgroundColor: CATEGORY_BAR_COLORS[i % CATEGORY_BAR_COLORS.length],
            }}
            title={`${b.name} · $${b.total.toFixed(0)}`}
          />
        ))}
      </div>

      {/* Per-category rows */}
      <div className="space-y-2.5">
        {buckets.map((b, i) => {
          const pct = (b.total / grandTotal) * 100;
          const widthPct = (b.total / max) * 100;
          const color = CATEGORY_BAR_COLORS[i % CATEGORY_BAR_COLORS.length];
          return (
            <div key={b.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px]">{b.emoji}</span>
                  <span className="text-[13px] font-medium text-[#1C1C1E]">{b.name}</span>
                  <span className="text-[11px] text-[#8E8E93]">{pct.toFixed(0)}%</span>
                </div>
                <span className="text-[13px] font-semibold text-[#1C1C1E]">${b.total.toFixed(0)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#F1F2F5] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ duration: 0.5, delay: 0.05 * i, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
