Totally agree with you: the **deposit mechanic itself is strong** (it’s tied to RSVP count, shows paid vs pending, and gives the organizer a quick “who’s holding us up” view). The weak spot is exactly what you called out:

### The continuity issue: “Where did Deposit Policy come from?”

Right now the UI implies:

* a policy exists
* it’s already defined
* and it’s authoritative

…but the user never *created* it (at least not in the visible flow), so it feels like it appeared out of nowhere.

You can fix that in one of two clean ways (and honestly you might do both).

---

## 1) Give the policy a clear origin + edit affordance (minimum fix)

Inside the **Deposits** card, add a small but explicit control:

* **“Policy” header row:**
  **Deposit Policy** · *Set by Sarah* · **Edit**
* Or a **kebab menu** (⋯) on the Deposits card with:

  * Edit policy
  * Change amount
  * Change due date
  * Remove deposits

If you want it extra clear, add one line of microcopy:

* “Deposit rules apply to lodging + shared costs. Members will be notified of changes.”

That alone solves the “who set this?” + “can I change it?” confusion.

---

## 2) Make “Set deposit policy” an actual step in the planning flow (best fix)

Since you already have that **Planning Progress checklist**, deposits should be a defined step like:

✅ Dates confirmed
✅ Invite crew
✅ Majority committed
⬜ **Set deposit policy** (amount, due date, what it covers, refund rules)
⬜ Collect deposits

Then the deposit card behaves like:

* **Before policy exists:** shows an empty state + CTA
  “No deposit policy yet” → **Set deposit policy**
* **After policy exists:** shows the policy summary + collected progress

This makes the policy feel earned and intentional instead of “system-generated.”

---

# How I’d structure the Deposits widget

### Collapsed state (default)

* Deposits · “2/4 paid · $150 each”
* One-line summary: “Due Mar 20 · covers lodging + shared costs”
* CTA: **Edit policy** (if organizer)

### Expanded state

**Policy module**

* Amount per person
* Due date
* Covers: lodging / shared / optional toggles
* Dropout rule + refund rule
* **Edit policy** button

**Collection module**

* Progress bar ($300 / $600)
* Member list with Paid/Pending
* “Mark paid” (organizer only)
* Optional: “Send reminder” on pending people

---

# One more thing: avoid “magic defaults”

If you *do* want a default policy template (totally reasonable), just label it as such:

* “Deposit Policy (Suggested)”
  “You can edit this anytime.”

That makes the system feel helpful instead of random.

---

## Quick UX edge case you’re already hinting at

Since deposits are tied to RSVP/commitment, you’ll want a rule like:

* if someone joins late → they get added with “Pending”
* if someone drops → what happens to total + policy? (policy should explain it)

This is another reason the “Set policy” step is important: it forces you to define the rules before money gets involved.

---

### Bottom line

Your deposit UI is already **80% there**. The missing 20% is:

1. **clear provenance** (“who set this?”)
2. **editability** (“where do I change it?”)
3. ideally, a **proper creation step** in the planning flow so it doesn’t feel like it appeared.

If you want, I can write the exact microcopy for:

* the empty state
* the “edit policy” sheet
* and the planning checklist step labels so it all feels consistent.
