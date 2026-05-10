Yes. The issue is not that the trays need to be **identical**. The issue is that they need to feel like they come from the **same system**.

Right now each tray solves its own problem well enough, but each one uses a different internal logic:

* one starts with a grid
* one starts with a hero amount
* one uses pill selectors
* one uses icon tiles plus preview card
* one uses stacked fields with different visual weight

That is why they feel inconsistent.

## Core recommendation

Create **one universal tray pattern**, then allow each tray to swap in a different **content module**.

### The shell should always be the same

Every tray should use this structure:

1. **Handle**
2. **Header row**

   * title on left
   * optional subtitle under title
   * close button on right
3. **Primary content area**

   * quick picks, fields, selectors, etc.
4. **Secondary options area**

   * split rules, paid by, notes, preview, etc.
5. **Sticky footer**

   * secondary action on left if needed
   * primary CTA on right or full width

That alone will make everything feel much more unified.

---

# The design system I would use

## 1. One consistent header pattern

Every tray should start the same way:

**Title**
**Subtitle / context**
Close button

Examples:

* **New Trip**
  Start planning together
* **Add Category**
  Create a budget category
* **Add Expense**
  Log spending for this trip
* **Propose Activity**
  Adding to Day 1 · Mar 15

Right now some trays feel airy and some feel dense. Standardizing the header spacing will fix a lot.

### Rule

Use the same:

* top padding
* handle spacing
* title size
* subtitle style
* close button size and placement

---

## 2. Standardize the first interaction block

This is the biggest inconsistency right now.

Each tray should begin with a **primary input block**, but the block should follow the same visual logic.

### Reusable pattern:

**Leading square + main input**

This is the pattern you already noticed in **Add Category**, and I agree with you: it should become a reusable system piece.

Use it whenever something needs an icon/emoji + name.

Examples:

* **New Trip**
  `[emoji square] [Trip name]`
* **Add Category**
  `[emoji square] [Category name]`
* **Custom expense category**
  `[emoji square] [Expense category name]`

This is strong because it:

* feels mobile-friendly
* gives the icon a dedicated home
* avoids random floating emoji pickers
* can adapt to keyboard use cleanly

### Keep this rule:

If the user is creating a **custom object**, use:

* icon/emoji square
* text field
* optional amount/type below

If the user is choosing from a **fixed system taxonomy**, use quick-select chips or tiles instead.

That is the clean distinction.

---

## 3. Keep quick add, but use it consistently

You should **not remove quick add**. It is useful.

But right now quick add behaves differently in each tray. The solution is not to delete it. The solution is to turn it into one reusable pattern.

## Use only two selector styles across all trays

### A. Quick-select chips / tiles

Use for **fixed categories**:

* expense category
* activity type
* trip icon presets

Examples:

* Food
* Gas
* Shopping
* Culture

### B. Custom icon-square input

Use for **user-created items**:

* custom budget category
* custom trip
* maybe custom list item later

That means:

* **Propose Activity** can keep quick category picks
* **Add Expense** can keep quick expense categories
* **Add Category** should support quick presets *and* custom entry
* **New Trip** can use preset icons, but the preview card is optional

So the answer is: **yes, keep quick adds**, but use them as a **shared component**, not a one-off design per tray.

---

# What should stay the same across all trays

## 1. Input styling

All input fields should use the same:

* corner radius
* height
* background color
* label style
* placeholder style
* spacing between label and field

Right now some feel more card-like, some more form-like.

## 2. Selector styling

All chips/tiles should use the same:

* size family
* selected state
* icon treatment
* spacing
* hover/pressed logic
* horizontal scroll behavior if needed

## 3. Footer styling

All trays should end with the same footer behavior:

* sticky bottom area
* consistent padding
* same button height
* same CTA style
* secondary action style if needed

For example:

* **New Trip**: full-width primary CTA
* **Add Category**: full-width primary CTA
* **Add Expense**: full-width primary CTA
* **Propose Activity**: secondary cancel + primary action

That is okay. The footer can vary slightly, but it should still look like the same system.

---

# Critique by tray

## 1. Add Category

This is actually the best starting point for the system.

### What is working

* clear title
* quick add section makes sense
* custom area with icon square + text field is strong
* shared/optional segmented control is good

### What to improve

* this should become the **baseline tray structure**
* the quick add pills and the custom section need a bit more hierarchy separation
* the disabled CTA color looks very washed out; it feels less intentional than the other trays
* the tray would feel cleaner if the custom section used the exact same spacing logic as other trays later

### Keep

* icon square + name field pattern
* segmented control pattern

---

## 2. New Trip

This one is visually nice, but it is the least system-aligned.

### What is working

* title is clear
* icon presets are understandable
* the live preview widget is a nice touch

### What feels off

* the icon grid feels like a separate UI language from the rest of the trays
* the preview card is nice, but it adds another card style that other trays do not use
* compared to Add Category, this feels more like a mini modal than a standard tray

### Recommendation

Restructure it to feel closer to the Add Category logic:

**Quick icon picks**
Then
**[icon square] [Trip name]**
Then optionally a smaller lightweight preview row

That way it shares the same “pick or customize, then name it” flow.

### My take on the preview card

It is a nice-to-have, not essential.
If space gets tight, reduce it to a smaller inline preview instead of a large card.

---

## 3. Propose Activity

This tray is clean, but it is too form-heavy compared to the others.

### What is working

* context subtitle is good
* activity categories make sense as quick picks
* fields are straightforward

### What feels inconsistent

* the category strip looks different from the expense/category selectors elsewhere
* the form becomes very tall very quickly
* visually it feels more like a generic form sheet than part of the same family

### Recommendation

Keep the structure, but standardize the components:

* use the same selector style as expense/category quick add
* use the same input style everywhere
* make the footer sticky
* consider making **Time** and **Location** use the same row component style as the rest of the app

### Important product distinction

For activities, I would **not** use custom emoji input as the default.
This is a place where a **fixed category taxonomy** is better.

So:

* keep quick category picks
* do not force custom emoji here
* only allow custom category if there is a strong use case later

That keeps activity creation faster.

---

## 4. Add Expense

This is the most visually different tray.

### What is working

* amount-first makes sense conceptually
* expense category quick picks are useful
* split row is nice and compact

### What feels inconsistent

* the giant centered `$0` behaves like a hero element, which none of the other trays do
* categories are shown as pastel blocks, which is another visual language
* the field structure does not align with the category tray or activity tray

### Recommendation

Bring this closer to the system by turning the amount into the first field, not a hero.

For example:

**Amount**
`$0`

**Category**
[quick picks]

**Description**
[What was this for?]

**Split**
[Split with everyone]

**Paid by**
[You]

Then footer.

That would make it feel much more related to the others.

### Important note

The current version is not bad. It is just too special.
If every tray gets its own “special layout,” the system falls apart.

---

# The unifying rule for quick add vs custom emoji

This is the decision rule I would use:

## Use quick add when:

* the app already knows the most common options
* speed matters more than personalization
* the object belongs to a fixed taxonomy

Examples:

* expense categories
* activity categories
* trip icon presets

## Use custom emoji square when:

* the user is creating something personal or unique
* naming and identity matter
* there is not a strong fixed taxonomy

Examples:

* custom budget category
* trip name/icon
* maybe custom list/group later

This rule keeps the system coherent.

---

# One proposed universal tray blueprint

Use this for all trays:

## Universal tray anatomy

**Handle**

**Header**

* title
* subtitle
* close

**Section 1: Primary object setup**

* either quick-select row
* or icon square + text field
* or amount field if money-first flow

**Section 2: Supporting fields**

* name
* description
* time
* location
* estimate
* split type

**Section 3: Optional settings**

* shared vs optional
* paid by
* notes
* preview

**Sticky footer**

* cancel if needed
* primary CTA

That is enough consistency without forcing identical content.

---

# Specific system components to reuse

Define these and reuse them everywhere:

## 1. Tray header

Same on every tray.

## 2. Square icon selector

For emoji/icon-based custom objects.

## 3. Quick-select chip/tile row

For categories and presets.

## 4. Standard field block

Label + input.

## 5. Segmented control

For Shared / Optional, etc.

## 6. Action row

For compact settings like:

* Split with everyone
* Paid by You
* Choose location

## 7. Sticky CTA footer

Same button sizing and spacing.

If you standardize those seven pieces, the trays will start feeling like one family immediately.

---

# What I would tell Figma Make

You can paste something like this:

## Figma Make prompt

Redesign all bottom trays to use one consistent mobile iPhone pattern.
Create a unified tray system with the same structure across New Trip, Add Category, Add Expense, and Propose Activity.

Use this shared layout:

* top handle
* consistent header with title, subtitle, and close button
* primary content section
* supporting fields section
* sticky footer with CTA

Standardize these reusable components across all trays:

* same header spacing and typography
* same input field style
* same chip/tile selector style
* same segmented control style
* same footer/button layout
* same corner radius and spacing system

Design rule:

* use quick-add chips/tiles for fixed system categories like expense type or activity type
* use an icon/emoji square plus text field for user-created items like trip icon or custom budget category

Specific improvements:

* Add Category should become the baseline pattern for icon square + name field
* New Trip should use quick icon presets but match the same field structure as Add Category
* Propose Activity should keep quick category selection but use the same selector component and field styling as other trays
* Add Expense should be restructured to feel less like a unique hero layout and more like the same tray family, with amount as a standard first field rather than a giant centered element

Keep the design mobile-first, compact, thumb-friendly, and consistent across all sheets.

---

If you want, I can turn this into an even tighter **design-spec style checklist** you can paste directly into Figma comments.
