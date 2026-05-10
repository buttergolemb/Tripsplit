import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ChevronRight,
  Copy,
  LogOut,
  Trash2,
  UserPlus,
  X,
  Check,
} from "lucide-react";
import { useTripData } from "./TripDataContext";
import type { TripPhase } from "./TripDataContext";

if (import.meta.hot) import.meta.hot.decline();

const avatarColors: Record<string, string> = {
  S: "bg-[#007AFF]", M: "bg-[#34C759]", A: "bg-[#FF9F0A]",
  J: "bg-[#AF52DE]", T: "bg-[#FF6482]", C: "bg-[#5AC8FA]",
};

const TRIP_EMOJIS = ["✈️", "🏖️", "⛰️", "🏙️", "🎿", "🏕️", "🚗", "🎡", "🍕", "🌮", "🎸", "📍"];

const PHASE_OPTIONS: { value: TripPhase; label: string; color: string; bg: string }[] = [
  { value: "planning", label: "Planning", color: "text-[#007AFF]", bg: "bg-[#EAF2FF]" },
  { value: "pre-trip", label: "Pre-Trip", color: "text-[#FF9F0A]", bg: "bg-[#FFF3E0]" },
  { value: "during", label: "During Trip", color: "text-[#34C759]", bg: "bg-[#E8F7EE]" },
  { value: "post-trip", label: "Post-Trip", color: "text-[#8E8EFA]", bg: "bg-[#F1EEFF]" },
  { value: "complete", label: "Complete", color: "text-[#8E8E93]", bg: "bg-[#F1F2F5]" },
];

export default function TripSettings() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { trip, updateTrip, setPhase, removeParticipant } = useTripData();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(trip.name);
  const [editingDates, setEditingDates] = useState(false);
  const [datesValue, setDatesValue] = useState(trip.dates);
  const [editingDest, setEditingDest] = useState(false);
  const [destValue, setDestValue] = useState(trip.destination);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyInvite = () => {
    navigator.clipboard?.writeText(`Join my trip "${trip.name}" on TripOS!`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-20">
      {/* Header */}
      <div className="px-5 pt-14 pb-2">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(`/trip/${tripId}`)}
            className="size-9 rounded-full bg-white shadow-[var(--shadow-apple-1)] flex items-center justify-center hover:shadow-[var(--shadow-apple-2)] transition-shadow active:scale-95"
          >
            <ArrowLeft className="size-4 text-[#8E8E93]" />
          </button>
          <div>
            <p className="text-[12px] text-[#8E8E93] font-medium">Trip Settings</p>
            <h1 className="text-[22px] font-semibold text-[#1C1C1E] tracking-tight">
              {trip.emoji} {trip.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* ─── Trip Identity ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[22px] p-5 shadow-[var(--shadow-apple-1)]"
        >
          <h3 className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-4">
            Trip Details
          </h3>

          {/* Emoji */}
          <div className="mb-4">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setShowEmojiPicker((p) => !p)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowEmojiPicker((p) => !p); }}
              className="flex items-center gap-3 w-full cursor-pointer group"
            >
              <div className="size-14 rounded-[16px] bg-[#F7F7F5] flex items-center justify-center text-[28px] group-active:scale-95 transition-transform">
                {trip.emoji}
              </div>
              <div className="text-left flex-1">
                <p className="text-[15px] font-medium text-[#1C1C1E]">Trip Icon</p>
                <p className="text-[12px] text-[#8E8E93]">Tap to change</p>
              </div>
              <ChevronRight className="size-4 text-[#C7C7CC]" />
            </div>

            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 flex-wrap pt-3">
                    {TRIP_EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => {
                          updateTrip({ emoji: e });
                          setShowEmojiPicker(false);
                        }}
                        className={`size-11 rounded-[12px] flex items-center justify-center text-xl transition-all active:scale-90 ${
                          trip.emoji === e
                            ? "bg-[#007AFF] shadow-[0_4px_12px_rgba(0,122,255,0.25)]"
                            : "bg-[#F7F7F5]"
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-0.5">
            {/* Trip Name */}
            <SettingsRow
              label="Name"
              value={trip.name}
              editing={editingName}
              editValue={nameValue}
              onEditValueChange={setNameValue}
              onStartEdit={() => { setEditingName(true); setNameValue(trip.name); }}
              onSave={() => {
                if (nameValue.trim()) updateTrip({ name: nameValue.trim() });
                setEditingName(false);
              }}
              onCancel={() => setEditingName(false)}
            />

            <div className="border-t border-[#F7F7F5]" />

            {/* Dates */}
            <SettingsRow
              label="Dates"
              value={trip.dates || "Not set"}
              placeholder="e.g., Mar 15–18, 2026"
              editing={editingDates}
              editValue={datesValue}
              onEditValueChange={setDatesValue}
              onStartEdit={() => { setEditingDates(true); setDatesValue(trip.dates); }}
              onSave={() => {
                updateTrip({ dates: datesValue.trim() });
                setEditingDates(false);
              }}
              onCancel={() => setEditingDates(false)}
            />

            <div className="border-t border-[#F7F7F5]" />

            {/* Destination */}
            <SettingsRow
              label="Destination"
              value={trip.destination || "Not set"}
              placeholder="e.g., Austin, TX"
              editing={editingDest}
              editValue={destValue}
              onEditValueChange={setDestValue}
              onStartEdit={() => { setEditingDest(true); setDestValue(trip.destination); }}
              onSave={() => {
                updateTrip({ destination: destValue.trim() });
                setEditingDest(false);
              }}
              onCancel={() => setEditingDest(false)}
            />
          </div>
        </motion.div>

        {/* ─── Trip Phase ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-[22px] p-5 shadow-[var(--shadow-apple-1)]"
        >
          <h3 className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">
            Trip Phase
          </h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5">
            {PHASE_OPTIONS.map((phase) => {
              const active = trip.phase === phase.value;
              return (
                <button
                  key={phase.value}
                  onClick={() => setPhase(phase.value)}
                  className={`flex items-center gap-1.5 px-3.5 h-[38px] rounded-[12px] flex-shrink-0 transition-all active:scale-95 ${
                    active
                      ? "bg-[#007AFF] shadow-[0_4px_12px_rgba(0,122,255,0.25)]"
                      : "bg-[#F7F7F5]"
                  }`}
                >
                  <span
                    className={`text-[13px] font-semibold ${
                      active ? "text-white" : "text-[#8E8E93]"
                    }`}
                  >
                    {phase.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ─── Members ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[22px] p-5 shadow-[var(--shadow-apple-1)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider">
              Members ({trip.participants.length})
            </h3>
            <button
              onClick={handleCopyInvite}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#007AFF] active:opacity-70 transition-opacity"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied!" : "Copy invite"}
            </button>
          </div>

          <div className="space-y-2">
            {trip.participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 py-2"
              >
                <div
                  className={`size-9 rounded-full flex items-center justify-center text-white text-[13px] font-semibold flex-shrink-0 ${
                    avatarColors[p.avatar] || "bg-[#8E8E93]"
                  }`}
                >
                  {p.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-[#1C1C1E] truncate">
                    {p.name}
                    {p.role === "Trip Organizer" && (
                      <span className="text-[11px] font-semibold text-[#FF9F0A] ml-1.5">Organizer</span>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[12px] font-medium ${
                      p.rsvp === "committed" ? "text-[#34C759]"
                        : p.rsvp === "likely" ? "text-[#007AFF]"
                        : p.rsvp === "interested" ? "text-[#FF9F0A]"
                        : "text-[#FF3B30]"
                    }`}>
                      {p.rsvp.charAt(0).toUpperCase() + p.rsvp.slice(1)}
                    </span>
                    {p.role && p.role !== "Trip Organizer" && (
                      <>
                        <span className="size-1 rounded-full bg-[#D1D1D6]" />
                        <span className="text-[12px] text-[#8E8E93]">{p.role}</span>
                      </>
                    )}
                  </div>
                </div>
                {p.depositPaid && (
                  <span className="text-[10px] font-semibold text-[#34C759] bg-[#E8F7EE] px-2 py-0.5 rounded-full flex-shrink-0">
                    Paid
                  </span>
                )}
              </div>
            ))}
          </div>

          <Link
            to={`/trip/${tripId}/planning`}
            className="flex items-center justify-center gap-2 mt-3 py-3 bg-[#F7F7F5] rounded-[14px] text-[15px] font-medium text-[#007AFF] active:scale-[0.98] transition-all"
          >
            <UserPlus className="size-4" />
            Manage Members
          </Link>
        </motion.div>

        {/* ─── Danger Zone ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-[22px] p-5 shadow-[var(--shadow-apple-1)]"
        >
          <h3 className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">
            Danger Zone
          </h3>

          <div className="space-y-2">
            <button className="flex items-center gap-3 w-full py-3 px-3 rounded-[14px] hover:bg-[#F7F7F5] transition-colors active:scale-[0.98] group">
              <div className="size-9 rounded-[12px] bg-[#FFF3E0] flex items-center justify-center flex-shrink-0">
                <LogOut className="size-4 text-[#FF9F0A]" />
              </div>
              <div className="text-left flex-1">
                <p className="text-[15px] font-medium text-[#1C1C1E]">Leave Trip</p>
                <p className="text-[12px] text-[#8E8E93]">Remove yourself from this trip</p>
              </div>
              <ChevronRight className="size-4 text-[#C7C7CC]" />
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-3 w-full py-3 px-3 rounded-[14px] hover:bg-[#FFF1F0] transition-colors active:scale-[0.98] group"
            >
              <div className="size-9 rounded-[12px] bg-[#FFF1F0] flex items-center justify-center flex-shrink-0">
                <Trash2 className="size-4 text-[#FF3B30]" />
              </div>
              <div className="text-left flex-1">
                <p className="text-[15px] font-medium text-[#FF3B30]">Delete Trip</p>
                <p className="text-[12px] text-[#8E8E93]">Permanently remove this trip and all data</p>
              </div>
              <ChevronRight className="size-4 text-[#C7C7CC]" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirm Overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-4 right-4 top-1/2 -translate-y-1/2 bg-white rounded-[22px] p-6 shadow-[var(--shadow-apple-3)] z-50 max-w-sm mx-auto"
            >
              <div className="text-center mb-5">
                <div className="size-14 rounded-full bg-[#FFF1F0] flex items-center justify-center mx-auto mb-3">
                  <Trash2 className="size-6 text-[#FF3B30]" />
                </div>
                <h3 className="text-[20px] font-semibold text-[#1C1C1E] mb-1">Delete Trip?</h3>
                <p className="text-[14px] text-[#8E8E93] leading-relaxed">
                  This will permanently delete <span className="font-semibold text-[#1C1C1E]">{trip.emoji} {trip.name}</span> and all its data. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-[14px] rounded-[14px] font-semibold text-[#8E8E93] bg-[#F7F7F5] active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    navigate("/");
                  }}
                  className="flex-1 py-[14px] rounded-[14px] font-semibold text-white bg-[#FF3B30] shadow-[0_4px_12px_rgba(255,59,48,0.25)] active:scale-[0.98] transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Inline editable row ──────────────────────────────────────────────────────

function SettingsRow({
  label,
  value,
  placeholder,
  editing,
  editValue,
  onEditValueChange,
  onStartEdit,
  onSave,
  onCancel,
}: {
  label: string;
  value: string;
  placeholder?: string;
  editing: boolean;
  editValue: string;
  onEditValueChange: (v: string) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  if (editing) {
    return (
      <div className="py-3">
        <p className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">{label}</p>
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave();
              if (e.key === "Escape") onCancel();
            }}
            placeholder={placeholder}
            className="flex-1 min-w-0 px-3.5 py-2.5 bg-[#F7F7F5] rounded-[12px] text-[15px] text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
          />
          <button
            onClick={onSave}
            className="size-9 rounded-[10px] bg-[#007AFF] flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            <Check className="size-4" />
          </button>
          <button
            onClick={onCancel}
            className="size-9 rounded-[10px] bg-[#F1F2F5] flex items-center justify-center active:scale-95 transition-transform"
          >
            <X className="size-4 text-[#8E8E93]" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onStartEdit}
      className="flex items-center justify-between w-full py-3 group"
    >
      <span className="text-[13px] text-[#8E8E93] font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-[15px] font-medium ${value === "Not set" ? "text-[#C7C7CC]" : "text-[#1C1C1E]"}`}>
          {value}
        </span>
        <ChevronRight className="size-3.5 text-[#C7C7CC] group-hover:text-[#8E8E93] transition-colors" />
      </div>
    </button>
  );
}