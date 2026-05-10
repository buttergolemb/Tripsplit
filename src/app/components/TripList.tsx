import { Link, useNavigate } from "react-router";
import { Plus, ChevronRight, X, DollarSign, Calendar } from "lucide-react";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tripsApi, type TripSummaryDTO } from "../../lib/api";
import { qk } from "../../lib/queryKeys";
import { CurrentUserChip } from "./CurrentUserChip";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Deterministic avatar color per member so the same person reads the same
// everywhere in the app.
const AVATAR_PALETTE = [
  { color: "#007AFF", bg: "#EAF2FF" },
  { color: "#34C759", bg: "#E8F7EE" },
  { color: "#FF9F0A", bg: "#FFF3E0" },
  { color: "#8E8EFA", bg: "#F1EEFF" },
  { color: "#FF2D55", bg: "#FFE8EF" },
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function paletteFor(key: string) {
  return AVATAR_PALETTE[hashString(key) % AVATAR_PALETTE.length];
}

function slugifyTripId(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || `trip-${Date.now().toString(36)}`;
}

// ─── Avatar Stack ────────────────────────────────────────────────────────────

function AvatarStack({ members, total }: { members: TripSummaryDTO["memberPreview"]; total: number }) {
  const show = members.slice(0, 4);
  const overflow = Math.max(0, total - show.length);
  if (show.length === 0) return null;
  const totalWidth = (show.length + (overflow > 0 ? 1 : 0)) * 18 + 6;
  return (
    <div className="relative" style={{ width: totalWidth, height: 24 }}>
      {show.map((m, i) => {
        const p = paletteFor(m.id);
        return (
          <div
            key={m.id}
            className="absolute size-6 rounded-full ring-[2px] ring-white flex items-center justify-center"
            style={{ left: i * 18, backgroundColor: p.bg }}
            title={m.name}
          >
            <span className="text-[10px] font-semibold" style={{ color: p.color }}>
              {m.initials}
            </span>
          </div>
        );
      })}
      {overflow > 0 && (
        <div
          className="absolute size-6 rounded-full bg-[#F1F2F5] ring-[2px] ring-white flex items-center justify-center"
          style={{ left: show.length * 18 }}
        >
          <span className="text-[9px] font-semibold text-[#8E8E93]">+{overflow}</span>
        </div>
      )}
    </div>
  );
}

// ─── Phase Badge ─────────────────────────────────────────────────────────────

function PhaseBadge({ phase }: { phase: TripSummaryDTO["phase"] }) {
  if (phase === "during") {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8F7EE]">
        <div className="size-[5px] rounded-full bg-[#34C759] opacity-50" />
        <span className="text-[11px] font-semibold text-[#34C759] tracking-wide">Active</span>
      </div>
    );
  }
  if (phase === "planning" || phase === "pre-trip") {
    return (
      <div className="px-2.5 py-1 rounded-full bg-[#EAF2FF]">
        <span className="text-[11px] font-semibold text-[#007AFF] tracking-wide">Planning</span>
      </div>
    );
  }
  return null;
}

function statusLine(t: TripSummaryDTO): string {
  const people = `${t.memberCount} ${t.memberCount === 1 ? "person" : "people"}`;
  if (t.phase === "complete") return "All settled ✓";
  if (t.phase === "planning" || t.phase === "pre-trip") return `${people} · planning`;
  return people;
}

// ─── Active Trip Card ────────────────────────────────────────────────────────

function ActiveTripCard({ trip, index }: { trip: TripSummaryDTO; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.06 }}
    >
      <Link
        to={`/trip/${trip.id}`}
        className="block bg-white rounded-[22px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform group"
      >
        {trip.phase === "during" && (
          <div className="h-[3px] bg-gradient-to-r from-[#34C759] to-[#34C759]/30" />
        )}

        <div className="px-5 pt-5 pb-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="size-11 rounded-[14px] bg-[#F7F7F5] flex items-center justify-center text-[22px]">
                {trip.emoji ?? "✈️"}
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-[#1C1C1E] leading-snug">{trip.name}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <Calendar className="size-[11px] text-[#C7C7CC]" />
                  <span className="text-[12px] text-[#8E8E93]">{trip.dates ?? "—"}</span>
                </div>
              </div>
            </div>
            <PhaseBadge phase={trip.phase} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AvatarStack members={trip.memberPreview} total={trip.memberCount} />
              <span className="text-[12px] text-[#8E8E93]">{statusLine(trip)}</span>
            </div>
            <ChevronRight className="size-4 text-[#C7C7CC]" />
          </div>

          {trip.expenseCount > 0 && (
            <div className="pt-3 border-t border-[#F1F2F5]">
              <div className="flex items-center gap-2">
                <div className="size-[30px] rounded-[9px] bg-[#FFE8EF] flex items-center justify-center">
                  <DollarSign className="size-[14px] text-[#FF2D55]" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#1C1C1E] leading-tight">
                    Total Spent <span className="text-[#FF2D55]">${trip.totalSpend.toFixed(0)}</span>
                  </p>
                  <p className="text-[11px] text-[#8E8E93]">
                    {trip.expenseCount} {trip.expenseCount === 1 ? "expense" : "expenses"} logged
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Past Trip Row ───────────────────────────────────────────────────────────

function PastTripRow({ trip, index }: { trip: TripSummaryDTO; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 + index * 0.05 }}
    >
      <Link
        to={`/trip/${trip.id}`}
        className="flex items-center gap-3.5 bg-white/60 rounded-[18px] px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-white transition-colors active:scale-[0.99]"
      >
        <div className="size-10 rounded-[12px] bg-[#F7F7F5] flex items-center justify-center text-[18px]">
          {trip.emoji ?? "✈️"}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-medium text-[#1C1C1E]">{trip.name}</h3>
          <p className="text-[13px] text-[#8E8E93]">{trip.dates ?? "—"} · {statusLine(trip)}</p>
        </div>
        <ChevronRight className="size-4 text-[#C7C7CC]" />
      </Link>
    </motion.div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TripList() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const tripsQuery = useQuery({
    queryKey: qk.trips(),
    queryFn: () => tripsApi.list(),
  });

  const createMut = useMutation({
    mutationFn: (input: { id: string; name: string; emoji: string | null }) =>
      tripsApi.create(input),
    onSuccess: (trip) => {
      qc.invalidateQueries({ queryKey: qk.trips() });
      navigate(`/trip/${trip.id}`);
    },
  });

  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [tripName, setTripName] = React.useState("");
  const [emoji, setEmoji] = React.useState<string | null>(null);

  const emojis = ["✈️", "🏖️", "⛰️", "🏙️", "🎿", "🏕️", "🚗", "🎡", "🎭", "🎸", "🍕", "🌮"];

  const handleCreateTrip = () => {
    const name = tripName.trim();
    if (!name) return;
    const id = slugifyTripId(name);
    createMut.mutate({ id, name, emoji });
    setShowCreateModal(false);
    setTripName("");
    setEmoji(null);
  };

  const trips = tripsQuery.data ?? [];
  const activeTrips = trips.filter((t) => t.phase !== "complete");
  const pastTrips = trips.filter((t) => t.phase === "complete");

  // Unique set of people across every trip — used to populate the user
  // switcher chip so you can impersonate any known member from the home
  // screen. Keeps the chip useful before you open a specific trip.
  const knownMembers = React.useMemo(() => {
    const seen = new Map<string, { id?: string; name: string }>();
    for (const t of trips) {
      for (const m of t.memberPreview) {
        if (!seen.has(m.name)) seen.set(m.name, { id: m.id, name: m.name });
      }
    }
    // Always surface "Sarah" so the prototype has a sane default even before
    // any trips load (ex: cold first render).
    if (!seen.has("Sarah")) seen.set("Sarah", { name: "Sarah" });
    return [...seen.values()];
  }, [trips]);

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[#F7F7F5] no-scrollbar">
      {/* Header */}
      <div className="px-6 pt-14 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[15px] text-[#8E8E93] font-medium mb-1"
            >
              {getGreeting()}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[34px] font-semibold text-[#1C1C1E] tracking-[-0.85px]"
            >
              Your Trips
            </motion.h1>
          </div>
          <div className="pt-2">
            <CurrentUserChip members={knownMembers} />
          </div>
        </div>
      </div>

      {/* Loading / error */}
      {tripsQuery.isLoading && (
        <div className="px-4 pt-6 space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-[132px] rounded-[22px] bg-white/60 animate-pulse" />
          ))}
        </div>
      )}
      {tripsQuery.error && (
        <div className="px-6 pt-6">
          <div className="bg-[#FFE8EF] border border-[#FF2D55]/20 rounded-[14px] p-4">
            <p className="text-[13px] font-semibold text-[#FF2D55]">Couldn't load your trips</p>
            <p className="text-[12px] text-[#8E8E93] mt-1">
              Is the API server running? <code>npm run dev</code> starts it.
            </p>
          </div>
        </div>
      )}

      {/* Active Trips */}
      {!tripsQuery.isLoading && (
        <div className="px-4 pt-6 pb-4">
          <div className="space-y-3">
            {activeTrips.map((trip, i) => (
              <ActiveTripCard key={trip.id} trip={trip} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Past Trips */}
      {pastTrips.length > 0 && (
        <div className="px-4 pb-32">
          <h3 className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-[0.65px] mb-3 px-2">
            Past Trips
          </h3>
          <div className="space-y-3">
            {pastTrips.map((trip, i) => (
              <PastTripRow key={trip.id} trip={trip} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Create New Trip FAB */}
      <div className="fixed bottom-8 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setShowCreateModal(true)}
          className="bg-[#007AFF] text-white rounded-full size-[60px] flex items-center justify-center shadow-[0_6px_20px_rgba(0,122,255,0.35)]"
        >
          <Plus className="size-7 stroke-[2.5]" />
        </motion.button>
      </div>

      {/* Create Trip Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ y: "100%", opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[28px] shadow-[0_-20px_40px_rgba(0,0,0,0.12)] sm:max-w-md sm:mx-auto sm:inset-x-4 sm:bottom-4 sm:rounded-[28px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 pt-6 pb-6 flex flex-col gap-4">
                <div className="w-9 h-[5px] rounded-full bg-[#E5E5EA] mx-auto" />

                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[20px] font-semibold text-[#1C1C1E] leading-[27.5px]">New Trip</h3>
                    <p className="text-[13px] text-[#8E8E93] font-medium leading-[19.5px] mt-[2px]">Start planning together</p>
                  </div>
                  <button
                    onClick={() => { setShowCreateModal(false); setTripName(""); setEmoji(null); }}
                    className="size-8 bg-[#F1F2F5] rounded-full flex items-center justify-center flex-shrink-0 hover:bg-[#E5E5EA] transition-colors"
                  >
                    <X className="size-4 text-[#8E8E93]" />
                  </button>
                </div>

                <div>
                  <p className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-[0.6px] mb-3">
                    Suggested Icons
                  </p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 pb-1">
                    {emojis.map((e) => (
                      <button
                        key={e}
                        onClick={() => setEmoji(emoji === e ? null : e)}
                        className={`size-12 text-[20px] rounded-[14px] flex-shrink-0 transition-all duration-150 flex items-center justify-center ${
                          emoji === e
                            ? "bg-[#007AFF] shadow-[0_4px_12px_rgba(0,122,255,0.25)]"
                            : "bg-[#F7F7F5] active:scale-95"
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-[0.6px] mb-2">
                    Trip Name
                  </p>
                  <div className="flex items-center gap-2.5">
                    <div className="size-12 rounded-[14px] bg-[#F7F7F5] flex items-center justify-center text-[20px] flex-shrink-0">
                      {emoji ?? <span className="text-[#CCCCD0]">+</span>}
                    </div>
                    <input
                      type="text"
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      placeholder="e.g., Hawaii Adventure"
                      className="flex-1 min-w-0 h-12 px-4 text-[15px] bg-[#F7F7F5] rounded-[14px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-[0.38px] focus:ring-[#007AFF]/10 transition-shadow"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === "Enter") handleCreateTrip(); }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleCreateTrip}
                  disabled={!tripName.trim() || createMut.isPending}
                  className="w-full h-[53px] bg-[#007AFF] text-white rounded-[14px] font-semibold text-[17px] shadow-[0_4px_12px_rgba(0,122,255,0.25)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {createMut.isPending ? "Creating…" : "Create Trip"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
