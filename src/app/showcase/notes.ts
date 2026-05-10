// Narrative annotations that appear in the right-hand showcase panel. Each
// entry maps a hash-router pattern to a block of rich text explaining what
// you're looking at and why it was designed this way.
//
// The matcher is intentionally tiny — we test the hash against a sequence of
// patterns in order and return the first that matches. Use ":tripId" as a
// wildcard segment.

export type NoteSection = {
  heading: string;
  body: string[];
};

export type Note = {
  title: string;
  tagline: string;
  sections: NoteSection[];
};

type Pattern = {
  test: (hash: string) => boolean;
  note: Note;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

// Hash routes look like "#/trip/austin/timeline". Normalise to "/trip/austin/timeline".
export function stripHash(hash: string): string {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  return raw === "" ? "/" : raw;
}

function matchesRoute(template: string) {
  const templateParts = template.split("/").filter(Boolean);
  return (hash: string) => {
    const path = stripHash(hash);
    const parts = path.split("/").filter(Boolean);
    if (parts.length !== templateParts.length) return false;
    return templateParts.every((t, i) => (t.startsWith(":") ? true : t === parts[i]));
  };
}

// ── Notes ────────────────────────────────────────────────────────────────────

const tripListNote: Note = {
  title: "Home · All trips",
  tagline: "The launchpad. One card per trip, quick-glance status and balance.",
  sections: [
    {
      heading: "Why this screen exists",
      body: [
        "Most group-trip apps drop you straight into a single trip. That works until you have more than one. The home screen is designed to feel like iMessage or a lightweight inbox: each trip is a row you can scan in half a second, so switching between an upcoming trip and a past one is a single tap.",
      ],
    },
    {
      heading: "What the numbers mean",
      body: [
        "Each card shows three things you actually care about at a glance — dates, member count (with the initial avatars you asked to restore), and your personal balance. We deliberately don't surface group-level totals here; that's what the Money screen is for.",
        "The acting-as chip in the top right is a prototype-only user switcher. There's no real auth yet, so flipping between Sarah / Mike / Alex re-renders the app as that person and lets you test who-owes-who math without juggling accounts.",
      ],
    },
    {
      heading: "Under the hood",
      body: [
        "Data comes from the Express/SQLite backend via TanStack Query. The trip list endpoint only returns a summary DTO (members preview, balance, dates), so the home screen loads fast even with lots of trips.",
      ],
    },
  ],
};

const tripOverviewNote: Note = {
  title: "Trip · Overview",
  tagline: "The single screen that coordinates everyone.",
  sections: [
    {
      heading: "Phase-aware hero",
      body: [
        "The overview changes based on the trip phase. Planning shows RSVP progress and a deposit CTA. Pre-trip surfaces the countdown and what's outstanding. During-trip collapses planning noise and lifts today's timeline and your balance to the top. Post-trip becomes a settlement-first view.",
        "This is deliberate: group trips have different failure modes at each stage, and the home of a trip should solve the most likely problem first.",
      ],
    },
    {
      heading: "Coordination feed",
      body: [
        "The activity feed is where we try to remove the group-chat layer. Instead of 'Alex: I paid for tacos, $92,' you see a structured row: who did what, what it implies, and one tap to act. The goal is that the feed alone tells you whether anything needs your attention.",
      ],
    },
    {
      heading: "Design choices worth calling out",
      body: [
        "Balances render as one sentence per person ('Jordan owes you $24') rather than a grid. People read sentences faster than tables on mobile.",
        "Add expense is a floating action button instead of a nav bar item because the nav only has three primary destinations and we didn't want a 4-up cluttered bar.",
      ],
    },
  ],
};

const timelineNote: Note = {
  title: "Timeline",
  tagline: "Per-day itinerary with suggestions, voting, and inline edits.",
  sections: [
    {
      heading: "The shape of a day",
      body: [
        "Each day renders as a vertical stream: confirmed events, free-time blocks, proposed / voting items. Horizontal suggestion chips at the top let anyone float an idea without forcing a commitment.",
        "Clicking a suggestion autofills the add-event tray (title, location, emoji) and only asks the user to pick the time — that was a specific flow you wanted to fix.",
      ],
    },
    {
      heading: "Event detail sheet",
      body: [
        "Tapping an event opens a full-height sheet inside the iPhone frame. It shows attendees, voting state, and has inline edit + delete in the overflow menu. All actions are wired through the backend so edits and deletions persist on refresh.",
      ],
    },
    {
      heading: "Under the hood",
      body: [
        "Days, events, and attendees are three tables in SQLite. Attendees track per-member going/maybe/declined; 'going' and 'maybe' surface in the avatar stack but 'declined' members disappear from headcount math. The same event is both 'a block on the timeline' and 'a thing people can RSVP to,' and the schema reflects that.",
      ],
    },
  ],
};

const moneyNote: Note = {
  title: "Money",
  tagline: "Personal POV on group spend. Who owes what, what needs confirming.",
  sections: [
    {
      heading: "Personal framing",
      body: [
        "The hero numbers read 'Total you spent,' 'You owe,' 'Owed to you' — not 'Total group spend.' Groups care about their own standing first; the group total is secondary and lives below the fold.",
        "The who-owes-who rows at the bottom of 'Who's paid what' turn the settlement math into plain sentences. We removed the old suggested-settlements card because it felt algorithmic for a feature that's ultimately social.",
      ],
    },
    {
      heading: "Confirm / dispute flow",
      body: [
        "When someone adds an expense that wasn't unanimously obvious (a split-of-4 where one person didn't eat, for example), the expense enters a 'needs confirmation' state. Participants see explicit Confirm / Dispute actions. Nothing counts in balances until it's confirmed.",
      ],
    },
    {
      heading: "Pay and optimistic UI",
      body: [
        "Tapping 'Pay' immediately marks that split as paid, animates the settle bar, and shows a toast. We write to the server in the background; on failure we roll back and surface an error toast. That's implemented with TanStack Query's onMutate / onError rollback pattern.",
      ],
    },
  ],
};

const planningNote: Note = {
  title: "Planning",
  tagline: "Rules, deposits, and budget agreed before the trip starts.",
  sections: [
    {
      heading: "Why a dedicated planning surface",
      body: [
        "Most trip friction happens before the trip: who's actually coming, who's paid the deposit, who proposed what. This screen is the agreements layer. It's deliberately simpler than a project tool — each section is one concrete question.",
      ],
    },
    {
      heading: "Deposit policy",
      body: [
        "The trip can set a single deposit policy: amount, due date, what it covers, and what happens if someone drops out. That persists to the deposit_policies table. When a member marks their deposit paid, that writes back to the members table and flips their avatar ring on every screen.",
      ],
    },
    {
      heading: "Budget + rules",
      body: [
        "Budget categories track estimate vs. actual per area (lodging, food, activities). Actual spend auto-rolls up from confirmed expenses in the matching category. Rules are vote-weighted agreements; tapping 'Agree' adds your vote to the row.",
      ],
    },
  ],
};

const settingsNote: Note = {
  title: "Trip · Settings",
  tagline: "The one place to rename the trip, add or remove people, and change phase.",
  sections: [
    {
      heading: "Member management",
      body: [
        "Adding a member from this screen POSTs to /trips/:id/members and immediately shows their initial in every avatar stack across the app. Removing a member is guarded — if they're tied to expenses, the backend blocks the delete so the ledger stays consistent.",
      ],
    },
    {
      heading: "Phase controls",
      body: [
        "The phase switch at the bottom changes how the Overview and Money screens render. It's a single field on the trips table, but it drives a lot of downstream logic — treat it like an explicit state machine rather than an implicit state.",
      ],
    },
  ],
};

const cardTestNote: Note = {
  title: "Component · Card test",
  tagline: "Static playground for the trip card component.",
  sections: [
    {
      heading: "What this is",
      body: [
        "A scratch route used while iterating on the home-screen trip card. It renders every variant (active, past, draft, with/without balance) in isolation so styling regressions show up immediately.",
      ],
    },
  ],
};

const trayLabNote: Note = {
  title: "Component · Tray lab",
  tagline: "Isolated harness for bottom-sheet and tray interactions.",
  sections: [
    {
      heading: "What this is",
      body: [
        "A sandbox route to exercise the BottomSheet component in isolation — different heights, scroll behaviors, nested content. Useful when tuning gesture/snap behavior without opening a real trip.",
      ],
    },
  ],
};

const defaultNote: Note = {
  title: "TripSplit prototype",
  tagline: "Pick a route on the left to see its notes here.",
  sections: [
    {
      heading: "How this showcase works",
      body: [
        "The center column is the app, scaled to iPhone proportions. The left column is a directory of every flow — tap any row to jump the prototype there. The right column explains what you're looking at and why.",
        "Use the Hide panels button at the top to collapse both sidebars for a clean screenshot.",
      ],
    },
  ],
};

const patterns: Pattern[] = [
  { test: matchesRoute("/"), note: tripListNote },
  { test: matchesRoute("/card-test"), note: cardTestNote },
  { test: matchesRoute("/tray-lab"), note: trayLabNote },
  { test: matchesRoute("/trip/:tripId"), note: tripOverviewNote },
  { test: matchesRoute("/trip/:tripId/timeline"), note: timelineNote },
  { test: matchesRoute("/trip/:tripId/money"), note: moneyNote },
  { test: matchesRoute("/trip/:tripId/planning"), note: planningNote },
  { test: matchesRoute("/trip/:tripId/settings"), note: settingsNote },
];

export function noteForHash(hash: string): Note {
  for (const p of patterns) {
    if (p.test(hash)) return p.note;
  }
  return defaultNote;
}
