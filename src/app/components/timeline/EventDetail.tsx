import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, MapPin, Clock, DollarSign, ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Send, AlignLeft, Pencil, Trash2, Check, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Event, AttendanceStatus } from './types';
import { timelineApi } from "../../../lib/api";
import { qk } from "../../../lib/queryKeys";
import { useTripData } from "../TripDataContext";
import { useCurrentUser } from "../../../lib/currentUser";
import { useToast } from "../ToastHost";

function formatDiscussionTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const sec = Math.floor((Date.now() - t) / 1000);
  if (sec < 45) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  const d = Math.floor(sec / 86400);
  if (d === 1) return "yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function avatarBgForName(name: string, palette: string[]): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return palette[Math.abs(h) % palette.length];
}

interface EventDetailProps {
  tripId: string;
  event: Event | null;
  onClose: () => void;
  onAttendanceChange: (status: AttendanceStatus) => void;
  onVote?: (type: 'for' | 'against') => void;
  // Inline edit — callers pass a patch, we don't assume which fields changed.
  onEdit?: (patch: { title?: string; time?: string; location?: string }) => void;
  onDelete?: () => void;
}

const avatarColors = ["bg-[#007AFF]", "bg-[#34C759]", "bg-[#FF9F0A]", "bg-[#AF52DE]", "bg-[#FF6482]", "bg-[#5AC8FA]"];

export function EventDetail({ tripId, event, onClose, onAttendanceChange, onVote, onEdit, onDelete }: EventDetailProps) {
  const [activeAttendance, setActiveAttendance] = React.useState<AttendanceStatus>('going');
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [commentDraft, setCommentDraft] = React.useState("");
  const [discussionExpanded, setDiscussionExpanded] = React.useState(false);

  const queryClient = useQueryClient();
  const toast = useToast();
  const { trip } = useTripData();
  const [currentUserName] = useCurrentUser();
  const posterMemberId = React.useMemo(() => {
    const hit = trip.participants.find((p) => p.name === currentUserName);
    return hit?.id ?? trip.participants[0]?.id ?? "";
  }, [trip.participants, currentUserName]);

  const discussionQuery = useQuery({
    queryKey: qk.eventDiscussion(tripId, event?.id ?? "_"),
    queryFn: () => timelineApi.listDiscussion(tripId, event!.id),
    enabled: !!tripId && !!event?.id,
  });

  const postMut = useMutation({
    mutationFn: (body: string) =>
      timelineApi.postDiscussion(tripId, event!.id, { memberId: posterMemberId, body }),
    onSuccess: async () => {
      if (tripId && event?.id) {
        await queryClient.invalidateQueries({ queryKey: qk.eventDiscussion(tripId, event.id) });
      }
      setCommentDraft("");
    },
    onError: (err) => {
      toast.push({
        tone: "error",
        title: "Couldn't send message",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    },
  });

  // Local drafts; reset whenever the event changes.
  const [draftTitle, setDraftTitle] = React.useState(event?.title ?? '');
  const [draftTime, setDraftTime] = React.useState(event?.time ?? '');
  const [draftLocation, setDraftLocation] = React.useState(event?.location ?? '');

  React.useEffect(() => {
    if (!event) return;
    if (!editing) {
      setDraftTitle(event.title);
      setDraftTime(event.time);
      setDraftLocation(event.location ?? '');
    }
  }, [event, editing]);

  // Close the overflow menu on outside tap.
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!menuOpen) return;
    const handle = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
    };
  }, [menuOpen]);

  // Reset transient state when the sheet opens a different event.
  React.useEffect(() => {
    setEditing(false);
    setConfirmingDelete(false);
    setMenuOpen(false);
    setCommentDraft("");
    setDiscussionExpanded(false);
  }, [event?.id]);

  if (!event) return null;

  const handleSaveEdit = () => {
    if (!onEdit) { setEditing(false); return; }
    const patch: { title?: string; time?: string; location?: string } = {};
    const nextTitle = draftTitle.trim();
    if (nextTitle && nextTitle !== event.title) patch.title = nextTitle;
    if (draftTime.trim() !== (event.time ?? '')) patch.time = draftTime.trim();
    const nextLocation = draftLocation.trim();
    if (nextLocation !== (event.location ?? '')) patch.location = nextLocation || '';
    if (Object.keys(patch).length > 0) onEdit(patch);
    setEditing(false);
  };

  const isVoting = event.state === 'voting' || event.state === 'proposed';
  const totalVotes = (event.votesFor || 0) + (event.votesAgainst || 0);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          // z-40 so the detail view sits *below* the TripLayout tab bar (z-50),
          // keeping the bottom tabs visible while this screen is open.
          className="fixed inset-0 z-40 bg-[#F7F7F5] flex flex-col h-full overflow-hidden"
        >
          {/* Header — matches the Timeline header: same translucent surface, same
              top padding so the Dynamic Island in the iPhone mockup stays clear. */}
          <header className="sticky top-0 z-10 bg-[#F7F7F5]/80 backdrop-blur-xl">
            <div className="px-6 pt-14 pb-3">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={onClose}
                  className="flex items-center gap-1 p-1.5 -ml-1.5 text-[#007AFF] hover:bg-black/5 rounded-lg transition-colors active:scale-95"
                >
                  <ArrowLeft className="size-5" />
                  <span className="text-[15px] font-medium">Back</span>
                </button>
                <div className="flex gap-1 items-center">
                  {editing ? (
                    <>
                      <button
                        onClick={() => setEditing(false)}
                        className="px-2 py-1 text-[#8E8E93] text-[14px] font-medium rounded-md active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1.5 bg-[#007AFF] text-white text-[13px] font-semibold rounded-full active:scale-95"
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        aria-label="Share event"
                        className="p-2 -mr-1 text-[#007AFF] hover:bg-black/5 rounded-full transition-colors active:scale-95"
                      >
                        <Share2 className="size-5" />
                      </button>
                      <div className="relative" ref={menuRef}>
                        <button
                          aria-label="More event actions"
                          aria-haspopup="menu"
                          aria-expanded={menuOpen}
                          onClick={() => setMenuOpen((v) => !v)}
                          className="p-2 -mr-2 text-[#007AFF] hover:bg-black/5 rounded-full transition-colors active:scale-95"
                        >
                          <MoreHorizontal className="size-5" />
                        </button>
                        <AnimatePresence>
                          {menuOpen && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.96, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.96, y: -4 }}
                              transition={{ duration: 0.14 }}
                              role="menu"
                              className="absolute right-0 top-full mt-2 w-44 bg-white rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.18)] ring-1 ring-black/5 p-1 z-30"
                            >
                              <button
                                role="menuitem"
                                onClick={() => { setMenuOpen(false); setEditing(true); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[14px] font-medium text-[#1C1C1E] hover:bg-[#F7F7F5] text-left"
                              >
                                <Pencil className="size-4 text-[#8E8E93]" strokeWidth={2.2} />
                                Edit event
                              </button>
                              <button
                                role="menuitem"
                                onClick={() => { setMenuOpen(false); setConfirmingDelete(true); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[14px] font-medium text-[#FF3B30] hover:bg-[#FFE8EF] text-left"
                              >
                                <Trash2 className="size-4" strokeWidth={2.2} />
                                Delete event
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="size-14 bg-white rounded-[18px] flex items-center justify-center text-3xl flex-shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  {event.emoji}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  {editing ? (
                    <input
                      type="text"
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      placeholder="Event title"
                      aria-label="Event title"
                      className="w-full text-[22px] font-semibold text-[#1C1C1E] tracking-tight leading-tight mb-1.5 bg-white/70 rounded-[8px] px-2 py-1 -ml-2 outline-none ring-1 ring-[#007AFF]/20 focus:ring-[#007AFF]"
                    />
                  ) : (
                    <h1 className="text-[22px] font-semibold text-[#1C1C1E] tracking-tight leading-tight mb-1.5">{event.title}</h1>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      event.state === 'confirmed' ? 'bg-[#E8F7EE] text-[#34C759]' :
                      event.state === 'voting' ? 'bg-[#F1EEFF] text-[#8E8EFA]' :
                      event.state === 'proposed' ? 'bg-[#FFF3E0] text-[#FF9F0A]' :
                      'bg-[#F1F2F5] text-[#8E8E93]'
                    }`}>
                      {event.state}
                    </span>
                    {editing ? (
                      <label className="flex items-center gap-1 text-[13px] text-[#8E8E93] font-medium bg-white/70 rounded-md px-1.5 py-0.5 ring-1 ring-[#007AFF]/20">
                        <Clock className="size-3.5" />
                        <input
                          type="text"
                          value={draftTime}
                          onChange={(e) => setDraftTime(e.target.value)}
                          placeholder="e.g. 6:30 PM"
                          aria-label="Event time"
                          className="bg-transparent outline-none w-[90px] text-[#1C1C1E] placeholder:text-[#C7C7CC]"
                        />
                      </label>
                    ) : (
                      <span className="flex items-center gap-1 text-[13px] text-[#8E8E93] font-medium">
                        <Clock className="size-3.5" />
                        {event.time}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Attendance segmented control — mirrors the day selector row under the Timeline header. */}
            <div className="px-6 pb-3">
              <div className="bg-white p-[3px] rounded-[12px] flex gap-0.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                {(['going', 'maybe', 'skipping'] as const).map((status) => {
                  const isActive = activeAttendance === status;
                  return (
                    <button
                      key={status}
                      onClick={() => {
                        setActiveAttendance(status);
                        onAttendanceChange(status);
                      }}
                      className={`flex-1 py-[7px] text-[13px] font-semibold rounded-[10px] transition-all duration-200 capitalize ${
                        isActive
                          ? 'bg-[#F7F7F5] text-[#1C1C1E] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                          : 'text-[#8E8E93] hover:text-[#6E6E73]'
                      }`}
                    >
                      {status === 'going' ? '✓ Going' : status === 'maybe' ? 'Maybe' : 'Skip'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-black/[0.04]" />
          </header>

          {/* Scrollable Content — pb-24 keeps the last card clear of the TripLayout tab bar. */}
          <div className="flex-1 overflow-y-auto overscroll-contain no-scrollbar px-4 pt-4 pb-24 space-y-4">
            
            {/* Voting Card */}
            {isVoting && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[18px] p-5 shadow-[var(--shadow-apple-1)]"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[15px] font-semibold text-[#1C1C1E]">Cast Your Vote</h3>
                  <span className="text-[12px] text-[#8E8E93]">Closes {event.votingCloses}</span>
                </div>

                {/* Vote progress bar */}
                {totalVotes > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 h-2 bg-[#F1F2F5] rounded-full overflow-hidden flex">
                      <div 
                        className="bg-[#34C759] rounded-full transition-all duration-300"
                        style={{ width: `${((event.votesFor || 0) / totalVotes) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-[#8E8E93] font-medium">{event.votesFor}/{totalVotes}</span>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => onVote?.('for')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#E8F7EE] text-[#34C759] rounded-[14px] hover:bg-[#D4F1DD] transition-colors font-semibold text-[14px]"
                  >
                    <ThumbsUp className="size-4" />
                    I'm in ({event.votesFor})
                  </button>
                  <button 
                    onClick={() => onVote?.('against')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#FFF3E0] text-[#FF9F0A] rounded-[14px] hover:bg-[#FFE8CC] transition-colors font-semibold text-[14px]"
                  >
                    <ThumbsDown className="size-4" />
                    Pass ({event.votesAgainst})
                  </button>
                </div>
              </motion.div>
            )}

            {/* Details Card */}
            <div className="bg-white rounded-[18px] p-5 shadow-[var(--shadow-apple-1)] space-y-4">
              <h3 className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider">Details</h3>
              
              {(event.location || editing) && (
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-[10px] bg-[#EAF2FF] flex items-center justify-center text-[#007AFF] flex-shrink-0">
                    <MapPin className="size-4" />
                  </div>
                  <div className="flex-1 pt-0.5 min-w-0">
                    {editing ? (
                      <input
                        type="text"
                        value={draftLocation}
                        onChange={(e) => setDraftLocation(e.target.value)}
                        placeholder="Add a location"
                        aria-label="Event location"
                        className="w-full text-[15px] font-medium text-[#1C1C1E] bg-[#F7F7F5] rounded-[8px] px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#007AFF]/25 placeholder:text-[#C7C7CC]"
                      />
                    ) : (
                      <>
                        <p className="text-[15px] font-medium text-[#1C1C1E]">{event.location}</p>
                        <p className="text-[12px] text-[#007AFF] font-medium mt-0.5">View on Map</p>
                      </>
                    )}
                  </div>
                  {!editing && (
                    <div className="size-16 bg-[#F7F7F5] rounded-[10px] flex items-center justify-center flex-shrink-0">
                      <MapPin className="size-5 text-[#C7C7CC]" />
                    </div>
                  )}
                </div>
              )}

              {event.description && (
                <div className="flex items-start gap-3 pt-3 border-t border-[#F7F7F5]">
                  <div className="size-9 rounded-[10px] bg-[#F1F2F5] flex items-center justify-center text-[#8E8E93] flex-shrink-0">
                    <AlignLeft className="size-4" />
                  </div>
                  <p className="text-[14px] text-[#3C3C43] leading-relaxed pt-1">
                    {event.description}
                  </p>
                </div>
              )}

              {event.expense && (
                <div className="flex items-center gap-3 pt-3 border-t border-[#F7F7F5]">
                  <div className="size-9 rounded-[10px] bg-[#E8F7EE] flex items-center justify-center text-[#34C759] flex-shrink-0">
                    <DollarSign className="size-4" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#1C1C1E]">${event.expense.amount}</p>
                    <p className="text-[12px] text-[#8E8E93]">Paid by {event.expense.paidBy}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Attendees Card */}
            <div className="bg-white rounded-[18px] p-5 shadow-[var(--shadow-apple-1)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider">Who's Going</h3>
                <span className="text-[12px] font-semibold text-[#34C759] bg-[#E8F7EE] px-2 py-0.5 rounded-full">
                  {event.attendees?.filter(a => a.status === 'going').length} confirmed
                </span>
              </div>
              
              <div className="space-y-2.5">
                {event.attendees?.map((attendee, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`size-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white ${avatarColors[idx % avatarColors.length]}`}>
                        {attendee.name[0]}
                      </div>
                      <span className="text-[15px] font-medium text-[#1C1C1E]">{attendee.name}</span>
                    </div>
                    <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      attendee.status === 'going' ? 'bg-[#E8F7EE] text-[#34C759]' :
                      attendee.status === 'maybe' ? 'bg-[#FFF3E0] text-[#FF9F0A]' :
                      'bg-[#F1F2F5] text-[#8E8E93]'
                    }`}>
                      {attendee.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Discussion Card */}
            <div className="bg-white rounded-[18px] p-5 shadow-[var(--shadow-apple-1)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider">Discussion</h3>
                <button
                  type="button"
                  onClick={() => setDiscussionExpanded((v) => !v)}
                  className="text-[12px] font-semibold text-[#007AFF]"
                >
                  {discussionExpanded ? "Show less" : "View All"}
                </button>
              </div>

              <div
                className={`space-y-2 mb-3 transition-[max-height] duration-200 ${
                  discussionExpanded
                    ? "max-h-[min(52vh,360px)] overflow-y-auto overscroll-contain"
                    : "max-h-[148px] overflow-y-auto overscroll-contain"
                }`}
              >
                {discussionQuery.isLoading && (
                  <div className="space-y-2">
                    <div className="h-14 rounded-[12px] bg-[#F7F7F5] animate-pulse" />
                    <div className="h-14 rounded-[12px] bg-[#F7F7F5] animate-pulse w-4/5" />
                  </div>
                )}
                {discussionQuery.isError && (
                  <p className="text-[13px] text-[#FF3B30] py-2">Couldn&apos;t load discussion.</p>
                )}
                {!discussionQuery.isLoading &&
                  !discussionQuery.isError &&
                  (discussionQuery.data?.length ?? 0) === 0 && (
                    <p className="text-[13px] text-[#8E8E93] py-1">No messages yet — start the thread.</p>
                  )}
                {!discussionQuery.isLoading &&
                  discussionQuery.data?.map((post) => (
                    <div key={post.id} className="bg-[#F7F7F5] rounded-[12px] p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`size-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${avatarBgForName(
                            post.authorName,
                            avatarColors,
                          )}`}
                        >
                          {(post.authorName[0] ?? "?").toUpperCase()}
                        </div>
                        <span className="text-[12px] font-semibold text-[#1C1C1E]">{post.authorName}</span>
                        <span className="text-[10px] text-[#C7C7CC]">{formatDiscussionTime(post.createdAt)}</span>
                      </div>
                      <p className="text-[14px] text-[#3C3C43] pl-7 whitespace-pre-wrap break-words">{post.body}</p>
                    </div>
                  ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      const t = commentDraft.trim();
                      if (t && posterMemberId && tripId && !postMut.isPending) postMut.mutate(t);
                    }
                  }}
                  placeholder={posterMemberId ? "Add a comment..." : "Join this trip to comment"}
                  disabled={!posterMemberId || postMut.isPending || !tripId}
                  aria-label="Add a comment"
                  className="flex-1 bg-[#F7F7F5] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1C1C1E] placeholder-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/15 transition-shadow disabled:opacity-50"
                />
                <button
                  type="button"
                  aria-label="Send comment"
                  disabled={!commentDraft.trim() || !posterMemberId || postMut.isPending || !tripId}
                  onClick={() => {
                    const t = commentDraft.trim();
                    if (t && posterMemberId && tripId) postMut.mutate(t);
                  }}
                  className="size-10 bg-[#007AFF] text-white rounded-[10px] flex items-center justify-center hover:bg-[#0064D2] transition-colors flex-shrink-0 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </div>

            {/* Action row — keep Edit/Delete reachable without hunting through
                the overflow menu. Only shown when callers wire them up. */}
            {(onEdit || onDelete) && !editing && (
              <div className="bg-white rounded-[18px] p-3 shadow-[var(--shadow-apple-1)]">
                {confirmingDelete ? (
                  <div className="flex flex-col gap-2.5">
                    <p className="text-[13px] text-[#1C1C1E] text-center px-2 py-1">
                      Delete this event? This can't be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmingDelete(false)}
                        className="flex-1 h-10 rounded-[12px] bg-[#F1F2F5] text-[#1C1C1E] font-semibold text-[14px] active:scale-[0.98]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => { onDelete?.(); setConfirmingDelete(false); onClose(); }}
                        className="flex-1 h-10 rounded-[12px] bg-[#FF3B30] text-white font-semibold text-[14px] active:scale-[0.98]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {onEdit && (
                      <button
                        onClick={() => setEditing(true)}
                        className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-[12px] bg-[#F1F2F5] text-[#1C1C1E] font-semibold text-[14px] active:scale-[0.98]"
                      >
                        <Pencil className="size-4" strokeWidth={2.2} /> Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => setConfirmingDelete(true)}
                        className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-[12px] bg-[#FFE8EF] text-[#FF3B30] font-semibold text-[14px] active:scale-[0.98]"
                      >
                        <Trash2 className="size-4" strokeWidth={2.2} /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {editing && (
              <div className="bg-white rounded-[18px] p-3 shadow-[var(--shadow-apple-1)]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-[12px] bg-[#F1F2F5] text-[#1C1C1E] font-semibold text-[14px] active:scale-[0.98]"
                  >
                    <X className="size-4" strokeWidth={2.4} /> Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-[12px] bg-[#007AFF] text-white font-semibold text-[14px] active:scale-[0.98]"
                  >
                    <Check className="size-4" strokeWidth={2.4} /> Save changes
                  </button>
                </div>
              </div>
            )}
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
