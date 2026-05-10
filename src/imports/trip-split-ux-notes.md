TripSplit UX Feedback (Mobile iPhone App) — Consolidated Notes
Context

This is a mobile-first iPhone app only (not web, not desktop). All patterns should be optimized for small screens, thumb reach, and low-scroll workflows.

1) Planning Setup (Beach Weekend / Empty State Testing)
✅ What’s working

Animations feel good and help the experience feel polished.

Empty states are helpful and clear.

🔧 Fix: Alignment / padding issues in RSVP list

In the RSVP / member list, the right-side status chip (Committed / Likely / Interested) looks slightly misaligned.

The layout feels “pulled left,” and the right edge alignment isn’t consistent.

Improve by using consistent spacing + auto-layout so the chips align cleanly to the right edge across all rows.

2) Shared Rules
✅ What’s working

Rules section concept is strong and useful.

🔧 Add: Quick “starter rules” templates

Right now users must type rules manually, which is friction.

Add “Quick Add Rules” (pre-made suggestions) like:

“Split shared meals evenly”

“Optional activities are opt-in”

“Confirm before booking anything”

“Venmo payments due within 48 hours”

Allow one-tap add + edit after insertion.

🔧 Problem: Too many rules = too much scrolling

If rules grow into a long list, it becomes hard on mobile.

Add collapsing / pagination patterns:

Show only 2–3 rules, with “View all rules”

Or group rules into categories (Money / Activities / Behavior)

Or allow pinning “Top rules”

3) Overall Scrolling / Mobile Friendliness
Problem: Planning becomes a long scroll

As trips get more complex (rules + activities + budget + deposits), the screen risks becoming a massive scroll.

Suggested improvements

Use collapsible sections by default (accordion style)

Add a “Planning hub” that highlights only what needs attention

Use a stepper or checklist navigation so users jump to sections quickly

Consider a sticky mini-nav (Rules / Deposits / Budget / RSVP)

Goal: prevent the screen from becoming a “10-hour TikTok scroll.”

4) Money Screen
✅ What’s working

Money section is strong and feels intuitive.

No major issues with the layout or flow here.

5) Create Trip Flow (Plus Button)
✅ What’s working

The “New Trip” widget is really good and feels clear.

Add: Better timeline empty-state suggestions

When creating the first schedule items, empty states are hard for users to start from.

If the trip is connected to lodging (Airbnb/hotel), auto-suggest:

“Check-in (usually 3 PM)”

“Check-out (usually 11 AM)”

“Travel time block”

“Group dinner suggestion”

Goal: reduce blank-canvas friction for timeline building.

6) Active Trip Screen (Austin Trip)
Balance widget concern (color + meaning)

Some money text feels misleading because green visually implies “gain” or “profit.”

But “People owe you money” is not inherently “positive”; it’s just unsettled balances.

Consider using more neutral colors for money owed/to receive (or use explicit labels like “You are owed”).

Budget card concern

Consider replacing the “budget progress” card in Active Trips with something more relevant:

“Net owed / net you owe”

“Outstanding balances”

“Unsettled expenses”
Because during an active trip, the user may care more about “who owes what” than budget spend.

7) Planning Section Showing During Active Trip
Problem: Planning content becomes irrelevant once trip is active

In an active trip:

“All deposits collected” being incomplete matters as an alert,

But most planning checklist items become noise.

Suggested behavior

When trip is Active:

hide or collapse planning checklist by default

keep only urgent unresolved items surfaced (e.g., deposits incomplete)

shift activity planning into the Schedule tab instead

Goal: planning should be “buried” once the trip is happening, except for urgent unresolved issues.

8) Suggestions / Additions to Consider

Improve navigation to reduce scrolling:

quick jump links to sections

collapsible cards default closed

Stronger empty-state guidance across timeline + rules

Better semantic coloring for financial status (neutral vs positive)