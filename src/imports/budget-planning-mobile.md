Budget Estimation — Ideation + Improvements (Mobile-First)
Context

This is the Planning phase for a trip (Beach Weekend), focused on empty → setup → edit → manage categories. Everything should be optimized for iPhone mobile interaction (thumb-friendly, minimal tiny tap targets).

1) Empty State (No budget set)

✅ Current empty state works:

Clear message: “No budget set”

Explains what to do: “Add categories to estimate costs”

CTA: “Set Up Budget”

Keep this structure.

2) Editing values (mobile interaction)

✅ Value editing behavior is correct:

Tapping a number should bring up the numeric keypad.

This matches mobile expectations and should stay.

3) Shared vs Optional tags should be dynamic + editable
Problem

Right now categories default to “SHARED” or “OPTIONAL,” but that decision should reflect:

either Shared Rules agreements

or an explicit category setting the user can change

Improvements

Make category “Shared/Optional” dynamic:

If Shared Rules says “everything is shared,” default categories to SHARED.

If rules allow optional items, keep Activities optional by default.

Add an easy way to change a category’s split type:

Example actions: Shared / Optional / Custom split rule

This should not require tiny taps.

4) Make category management more mobile-friendly (avoid tiny icons)
Problem

Editing categories via small icons can be too precise for mobile.

Suggested patterns (choose 1)

Option A: Bottom sheet on tap

Tap category row → opens a bottom sheet with:

Edit name

Change icon/emoji

Toggle Shared vs Optional

Delete category

Option B: Swipe actions

Swipe left/right on a category row for:

Edit

Delete

Option C: Long-press

Long-press category row → “Edit / Delete / Change type”

Goal: reduce micro-target tapping and keep it thumb-friendly.

5) “Add Category” should be truly customizable
Problem

Right now “Add Category” is limited / unclear.
Also, categories like “Other” are vague and don’t scale well.

Improvements

Allow users to create custom categories instead of only preset ones.

Replace “Other” with something customizable or encourage naming.

Best solution: reuse the “New Trip” modal pattern

Reuse the same UI pattern used for creating a new trip:

Category name input

Category icon (emoji or simple symbol selector)

Shared vs Optional default

Optional: suggested presets

Example “Add Category” flow (bottom sheet):

Name: “Groceries”

Icon: 🛒

Type: Shared / Optional

Save

This makes categories modular and scalable.

6) Quick Add is good but shouldn’t be the only way

✅ Quick Add chips are helpful for fast setup.

But:

It should support both:

Quick presets

Custom category creation

So: keep Quick Add as a starter, but also allow “Custom Category.”

7) Keep the component clean for long lists

If categories grow, it needs to remain manageable on mobile:

Consider collapsing categories after X entries (“Show more”)

Or allow reordering (drag handles inside edit mode)

Or group categories (Travel / Food / Lodging / Misc)

Summary of Key Changes

Keep empty state + CTA (it works)

Numeric keypad edit stays (mobile expected)

Make SHARED/OPTIONAL dynamic + editable

Replace tiny edit patterns with bottom sheet or swipe actions

Make Add Category modular (name + icon + type), reuse “New Trip” modal pattern

Quick Add stays but doesn’t replace custom creation